<?php

namespace App\Http\Controllers;

use App\Http\Requests\SocietyDocumentRequest;
use App\Models\SocietyDocument;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentRepositoryController extends Controller
{
    /**
     * Display a paginated, filterable list of documents.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', SocietyDocument::class);

        $search = trim((string) $request->query('search', ''));
        $category = $request->query('category');
        $sortBy = in_array($request->query('sort_by'), ['title', 'category', 'file_size', 'created_at'], true)
            ? $request->query('sort_by')
            : null;
        $sortDir = strtolower((string) $request->query('sort_dir')) === 'asc' ? 'asc' : 'desc';

        $query = SocietyDocument::query()
            ->with('uploader:id,name')
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('title', 'ilike', "%{$search}%")
                        ->orWhere('file_name', 'ilike', "%{$search}%");
                });
            })
            ->when($category !== null && $category !== '', function ($q) use ($category) {
                $q->where('category', $category);
            });

        $documents = $query
            ->when($sortBy !== null, function ($q) use ($sortBy, $sortDir) {
                $q->orderBy($sortBy, $sortDir);
            })
            ->when($sortBy === null, function ($q) {
                $q->latest('id');
            })
            ->paginate(12)
            ->withQueryString();

        $stats = [
            'total' => SocietyDocument::count(),
            'public' => SocietyDocument::where('is_public', true)->count(),
            'total_size' => SocietyDocument::sum('file_size'),
        ];

        $categories = SocietyDocument::query()
            ->whereNotNull('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return Inertia::render('features/documents/pages/index', [
            'documents' => $documents,
            'stats' => $stats,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'category' => $category !== '' ? $category : null,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
            'can' => [
                'create' => $request->user()->hasPermissionTo('document.create'),
                'update' => $request->user()->hasPermissionTo('document.update'),
                'delete' => $request->user()->hasPermissionTo('document.delete'),
            ],
        ]);
    }

    /**
     * Store a newly uploaded document.
     */
    public function store(SocietyDocumentRequest $request): RedirectResponse
    {
        $this->authorize('create', SocietyDocument::class);

        $societyId = $request->user()->society_id ?? society_id();

        if (! $societyId) {
            return redirect()
                ->back()
                ->with('error', 'Please select a society before uploading a document.');
        }

        $file = $request->file('file');
        $path = $file->store('documents', 'local');

        $document = SocietyDocument::create([
            'society_id' => $societyId,
            'title' => $request->input('title'),
            'category' => $request->input('category'),
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'is_public' => $request->boolean('is_public'),
            'uploaded_by' => $request->user()->id,
        ]);

        app(ActivityLogger::class)->log(
            action: 'create',
            module: 'SocietyDocument',
            entityType: SocietyDocument::class,
            entityId: (string) $document->id,
            remarks: "Document uploaded: {$document->title}"
        );

        return redirect()
            ->route('documents.index')
            ->with('success', 'Document uploaded successfully.');
    }

    /**
     * Update document metadata.
     */
    public function update(SocietyDocumentRequest $request, SocietyDocument $document): RedirectResponse
    {
        $this->authorize('update', $document);

        $data = [
            'title' => $request->input('title'),
            'category' => $request->input('category'),
            'is_public' => $request->boolean('is_public'),
        ];

        // If a new file is provided, replace the stored file.
        if ($request->hasFile('file')) {
            Storage::disk('local')->delete($document->file_path);

            $file = $request->file('file');
            $data['file_path'] = $file->store('documents', 'local');
            $data['file_name'] = $file->getClientOriginalName();
            $data['file_size'] = $file->getSize();
            $data['mime_type'] = $file->getMimeType();
        }

        $document->update($data);

        app(ActivityLogger::class)->log(
            action: 'update',
            module: 'SocietyDocument',
            entityType: SocietyDocument::class,
            entityId: (string) $document->id,
            remarks: "Document updated: {$document->title}"
        );

        return redirect()
            ->route('documents.index')
            ->with('success', 'Document updated successfully.');
    }

    /**
     * Remove the specified document.
     */
    public function destroy(SocietyDocument $document): RedirectResponse
    {
        $this->authorize('delete', $document);

        Storage::disk('local')->delete($document->file_path);

        $title = $document->title;
        $document->delete();

        app(ActivityLogger::class)->log(
            action: 'delete',
            module: 'SocietyDocument',
            entityType: SocietyDocument::class,
            entityId: (string) $document->id,
            remarks: "Document deleted: {$title}"
        );

        return redirect()
            ->route('documents.index')
            ->with('success', 'Document deleted.');
    }

    /**
     * Download the document file.
     */
    public function download(SocietyDocument $document): StreamedResponse
    {
        $this->authorize('download', $document);

        return Storage::disk('local')->download(
            $document->file_path,
            $document->file_name ?? basename($document->file_path)
        );
    }
}