<?php

namespace App\Http\Controllers;

use App\Http\Requests\ComplaintCategoryRequest;
use App\Models\ComplaintCategory;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ComplaintCategoryController extends Controller
{
    /**
     * Display categories list (embedded in complaint index or standalone).
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ComplaintCategory::class);

        $categories = ComplaintCategory::withCount('complaints')
            ->orderBy('name')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('features/complaints/pages/categories', [
            'categories' => $categories,
            'can' => [
                'create' => $request->user()->hasPermissionTo('complaint.create'),
                'update' => $request->user()->hasPermissionTo('complaint.update'),
                'delete' => $request->user()->hasPermissionTo('complaint.delete'),
            ],
        ]);
    }

    /**
     * Store a new complaint category.
     */
    public function store(ComplaintCategoryRequest $request): RedirectResponse
    {
        $this->authorize('create', ComplaintCategory::class);

        $societyId = $request->user()->society_id ?? society_id();

        if (! $societyId) {
            return redirect()
                ->back()
                ->with('error', 'Please select a society before creating a category.');
        }

        $category = ComplaintCategory::create([
            ...$request->validated(),
            'society_id' => $societyId,
        ]);

        app(ActivityLogger::class)->log(
            action: 'create',
            module: 'ComplaintCategory',
            entityType: ComplaintCategory::class,
            entityId: (string) $category->id,
            remarks: "Complaint category created: {$category->name}"
        );

        return redirect()
            ->route('complaint-categories.index')
            ->with('success', 'Category created successfully.');
    }

    /**
     * Update an existing complaint category.
     */
    public function update(ComplaintCategoryRequest $request, ComplaintCategory $complaintCategory): RedirectResponse
    {
        $this->authorize('update', $complaintCategory);

        $complaintCategory->update($request->validated());

        app(ActivityLogger::class)->log(
            action: 'update',
            module: 'ComplaintCategory',
            entityType: ComplaintCategory::class,
            entityId: (string) $complaintCategory->id,
            remarks: "Complaint category updated: {$complaintCategory->name}"
        );

        return redirect()
            ->route('complaint-categories.index')
            ->with('success', 'Category updated successfully.');
    }

    /**
     * Remove a complaint category.
     */
    public function destroy(ComplaintCategory $complaintCategory): RedirectResponse
    {
        $this->authorize('delete', $complaintCategory);

        if ($complaintCategory->complaints()->exists()) {
            return redirect()
                ->route('complaint-categories.index')
                ->with('error', 'Cannot delete a category that has complaints.');
        }

        $name = $complaintCategory->name;
        $complaintCategory->delete();

        app(ActivityLogger::class)->log(
            action: 'delete',
            module: 'ComplaintCategory',
            entityType: ComplaintCategory::class,
            entityId: (string) $complaintCategory->id,
            remarks: "Complaint category deleted: {$name}"
        );

        return redirect()
            ->route('complaint-categories.index')
            ->with('success', 'Category deleted.');
    }
}
