<?php

namespace Tests\Feature;

use App\Models\Poll;
use App\Models\PollOption;
use App\Models\PollVote;
use App\Models\Society;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PollTest extends TestCase
{
    use RefreshDatabase;

    protected Society $society;
    protected User $admin;
    protected User $resident;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([
            RoleSeeder::class,
            PermissionSeeder::class,
            RolePermissionSeeder::class,
        ]);

        $this->society = Society::factory()->create();

        $this->admin = User::factory()->create(['society_id' => $this->society->id]);
        $this->admin->assignRole('SocietyAdmin');

        $this->resident = User::factory()->create(['society_id' => $this->society->id]);
        $this->resident->assignRole('Resident');
    }

    public function test_user_can_view_polls_index(): void
    {
        $this->actingAs($this->resident)
            ->get(route('polls.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/polls/pages/index')
                ->has('polls')
                ->has('stats')
                ->has('can')
            );
    }

    public function test_society_admin_can_create_poll_with_options(): void
    {
        $payload = [
            'title' => 'Clubhouse Paint Color Selection',
            'description' => 'Please vote for your preferred color theme.',
            'is_anonymous' => true,
            'allow_multiple' => false,
            'expires_at' => now()->addDays(7)->format('Y-m-d'),
            'options' => [
                'Warm Beige',
                'Modern Slate Grey',
                'Mediterranean Blue',
            ],
        ];

        $response = $this->actingAs($this->admin)->post(route('polls.store'), $payload);

        $response->assertRedirect(route('polls.index'));

        $this->assertDatabaseHas('polls', [
            'society_id' => $this->society->id,
            'creator_id' => $this->admin->id,
            'title' => 'Clubhouse Paint Color Selection',
            'is_anonymous' => true,
        ]);

        $poll = Poll::where('title', 'Clubhouse Paint Color Selection')->first();
        $this->assertCount(3, $poll->options);
    }

    public function test_resident_can_cast_vote_on_active_poll(): void
    {
        $poll = Poll::create([
            'society_id' => $this->society->id,
            'creator_id' => $this->admin->id,
            'title' => 'Gym Opening Hours',
            'status' => 'active',
            'allow_multiple' => false,
            'is_anonymous' => false,
        ]);

        $option1 = PollOption::create(['poll_id' => $poll->id, 'option_text' => '6:00 AM - 10:00 PM', 'sort_order' => 0]);
        $option2 = PollOption::create(['poll_id' => $poll->id, 'option_text' => '24 Hours', 'sort_order' => 1]);

        $response = $this->actingAs($this->resident)->post(route('polls.vote', $poll), [
            'option_ids' => [$option1->id],
        ]);

        $response->assertRedirect(route('polls.index'));

        $this->assertDatabaseHas('poll_votes', [
            'poll_id' => $poll->id,
            'poll_option_id' => $option1->id,
            'user_id' => $this->resident->id,
            'society_id' => $this->society->id,
        ]);

        $this->assertEquals(1, $option1->fresh()->votes_count);
    }

    public function test_resident_cannot_vote_twice_on_same_poll(): void
    {
        $poll = Poll::create([
            'society_id' => $this->society->id,
            'creator_id' => $this->admin->id,
            'title' => 'Security Shift Timings',
            'status' => 'active',
            'allow_multiple' => false,
            'is_anonymous' => false,
        ]);

        $option1 = PollOption::create(['poll_id' => $poll->id, 'option_text' => 'Option A', 'sort_order' => 0]);

        // First vote
        $this->actingAs($this->resident)->post(route('polls.vote', $poll), [
            'option_ids' => [$option1->id],
        ]);

        // Second vote attempt
        $response = $this->actingAs($this->resident)->post(route('polls.vote', $poll), [
            'option_ids' => [$option1->id],
        ]);

        $response->assertSessionHas('error');
        $this->assertEquals(1, PollVote::where('poll_id', $poll->id)->where('user_id', $this->resident->id)->count());
    }

    public function test_admin_can_close_poll(): void
    {
        $poll = Poll::create([
            'society_id' => $this->society->id,
            'creator_id' => $this->admin->id,
            'title' => 'Closed Poll Test',
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->admin)->post(route('polls.close', $poll));

        $response->assertRedirect(route('polls.index'));
        $this->assertEquals('closed', $poll->fresh()->status);
    }

    public function test_admin_can_delete_poll(): void
    {
        $poll = Poll::create([
            'society_id' => $this->society->id,
            'creator_id' => $this->admin->id,
            'title' => 'Poll to Delete',
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->admin)->delete(route('polls.destroy', $poll));

        $response->assertRedirect(route('polls.index'));
        $this->assertSoftDeleted('polls', ['id' => $poll->id]);
    }
}
