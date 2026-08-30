<?php

namespace App\Http\Controllers;

use App\Http\Requests\PollRequest;
use App\Http\Requests\PollVoteRequest;
use App\Models\Poll;
use App\Models\PollOption;
use App\Models\PollVote;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PollController extends Controller
{
    /**
     * Display a listing of polls with their options, voting stats, and user vote status.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Poll::class);

        $search = trim((string) $request->query('search', ''));
        $status = $request->query('status');
        $user = $request->user();

        $query = Poll::query()
            ->with(['creator:id,name', 'options'])
            ->withCount('votes')
            ->when($search !== '', function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                    ->orWhere('description', 'ilike', "%{$search}%");
            })
            ->when($status !== null && $status !== '', function ($q) use ($status) {
                if ($status === 'active') {
                    $q->where('status', 'active')
                        ->where(function ($sub) {
                            $sub->whereNull('expires_at')->orWhere('expires_at', '>', now());
                        });
                } elseif ($status === 'closed') {
                    $q->where(function ($sub) {
                        $sub->where('status', 'closed')
                            ->orWhere('expires_at', '<=', now());
                    });
                } else {
                    $q->where('status', $status);
                }
            });

        $polls = $query->latest('id')->paginate(12)->withQueryString();

        // Transform polls to append user voting state & percentage
        $pollIds = $polls->pluck('id');
        $userVotes = PollVote::where('user_id', $user->id)
            ->whereIn('poll_id', $pollIds)
            ->get()
            ->groupBy('poll_id')
            ->map(fn ($votes) => $votes->pluck('poll_option_id')->toArray());

        $polls->getCollection()->transform(function ($poll) use ($userVotes) {
            $totalVotes = $poll->options->sum('votes_count');
            $poll->total_votes = $totalVotes;
            $poll->has_voted = $userVotes->has($poll->id);
            $poll->user_voted_options = $userVotes->get($poll->id, []);
            $poll->is_expired = $poll->isExpired();

            $poll->options->transform(function ($option) use ($totalVotes) {
                $option->percentage = $totalVotes > 0
                    ? round(($option->votes_count / $totalVotes) * 100, 1)
                    : 0;
                return $option;
            });

            return $poll;
        });

        $stats = [
            'total' => Poll::count(),
            'active' => Poll::where('status', 'active')->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))->count(),
            'closed' => Poll::where('status', 'closed')->orWhere('expires_at', '<=', now())->count(),
        ];

        return Inertia::render('features/polls/pages/index', [
            'polls' => $polls,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'can' => [
                'create' => $user->hasPermissionTo('poll.create'),
                'vote' => $user->hasPermissionTo('poll.vote'),
                'manage' => $user->hasPermissionTo('poll.update') || $user->hasPermissionTo('poll.delete'),
            ],
        ]);
    }

    /**
     * Store a newly created poll.
     */
    public function store(PollRequest $request): RedirectResponse
    {
        $this->authorize('create', Poll::class);

        $validated = $request->validated();
        $user = $request->user();

        $poll = DB::transaction(function () use ($validated, $user) {
            $poll = Poll::create([
                'society_id' => $user->society_id ?? society_id(),
                'creator_id' => $user->id,
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'status' => $validated['status'] ?? 'active',
                'is_anonymous' => $validated['is_anonymous'] ?? false,
                'allow_multiple' => $validated['allow_multiple'] ?? false,
                'expires_at' => $validated['expires_at'] ?? null,
            ]);

            foreach ($validated['options'] as $index => $optionText) {
                $poll->options()->create([
                    'option_text' => $optionText,
                    'sort_order' => $index,
                    'votes_count' => 0,
                ]);
            }

            return $poll;
        });

        app(ActivityLogger::class)->log(
            action: 'create',
            module: 'Poll',
            entityType: Poll::class,
            entityId: (string) $poll->id,
            remarks: "Created poll: {$poll->title}"
        );

        return redirect()
            ->route('polls.index')
            ->with('success', 'Poll created successfully.');
    }

    /**
     * Submit a vote on a poll.
     */
    public function vote(PollVoteRequest $request, Poll $poll): RedirectResponse
    {
        $this->authorize('vote', $poll);

        $validated = $request->validated();
        $user = $request->user();

        if ($poll->isClosed()) {
            return redirect()->back()->with('error', 'This poll is closed and no longer accepting votes.');
        }

        // Check if user already voted
        $existingVotesCount = PollVote::where('poll_id', $poll->id)
            ->where('user_id', $user->id)
            ->count();

        if ($existingVotesCount > 0) {
            return redirect()->back()->with('error', 'You have already voted on this poll.');
        }

        $optionIds = $validated['option_ids'];
        if (! $poll->allow_multiple && count($optionIds) > 1) {
            return redirect()->back()->with('error', 'This poll only allows selecting a single option.');
        }

        DB::transaction(function () use ($poll, $user, $optionIds) {
            foreach ($optionIds as $optionId) {
                PollVote::create([
                    'poll_id' => $poll->id,
                    'poll_option_id' => $optionId,
                    'user_id' => $user->id,
                    'society_id' => $poll->society_id,
                ]);

                PollOption::where('id', $optionId)
                    ->where('poll_id', $poll->id)
                    ->increment('votes_count');
            }
        });

        app(ActivityLogger::class)->log(
            action: 'vote',
            module: 'Poll',
            entityType: Poll::class,
            entityId: (string) $poll->id,
            remarks: "User cast vote on poll: #{$poll->id}"
        );

        return redirect()
            ->route('polls.index')
            ->with('success', 'Your vote has been recorded.');
    }

    /**
     * Close a poll early.
     */
    public function close(Request $request, Poll $poll): RedirectResponse
    {
        $this->authorize('update', $poll);

        $poll->update(['status' => 'closed']);

        app(ActivityLogger::class)->log(
            action: 'update',
            module: 'Poll',
            entityType: Poll::class,
            entityId: (string) $poll->id,
            remarks: "Poll closed: #{$poll->id}"
        );

        return redirect()
            ->route('polls.index')
            ->with('success', 'Poll closed successfully.');
    }

    /**
     * Remove the specified poll from storage.
     */
    public function destroy(Request $request, Poll $poll): RedirectResponse
    {
        $this->authorize('delete', $poll);

        $poll->delete();

        app(ActivityLogger::class)->log(
            action: 'delete',
            module: 'Poll',
            entityType: Poll::class,
            entityId: (string) $poll->id,
            remarks: "Deleted poll: #{$poll->id}"
        );

        return redirect()
            ->route('polls.index')
            ->with('success', 'Poll deleted successfully.');
    }
}
