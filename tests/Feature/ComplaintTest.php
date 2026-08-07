<?php

namespace Tests\Feature;

use App\Models\Complaint;
use App\Models\ComplaintCategory;
use App\Models\Flat;
use App\Models\Resident;
use App\Models\Society;
use App\Models\Tower;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ComplaintTest extends TestCase
{
    use RefreshDatabase;

    protected Society $society;
    protected User $admin;
    protected User $resident;
    protected Tower $tower;
    protected Flat $flat;
    protected Resident $residentRecord;
    protected ComplaintCategory $category;

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

        $this->tower = Tower::factory()->create(['society_id' => $this->society->id]);
        $this->flat = Flat::factory()->create([
            'society_id' => $this->society->id,
            'tower_id' => $this->tower->id,
        ]);
        $this->residentRecord = Resident::factory()->create([
            'society_id' => $this->society->id,
            'flat_id' => $this->flat->id,
        ]);
        $this->category = ComplaintCategory::factory()->create([
            'society_id' => $this->society->id,
            'name' => 'Plumbing',
        ]);
    }

    public function test_admin_can_view_complaints_index(): void
    {
        $this->actingAs($this->admin)
            ->get(route('complaints.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/complaints/pages/index')
                ->has('complaints')
                ->has('stats')
                ->has('categories')
            );
    }

    public function test_admin_can_view_create_complaint_page(): void
    {
        $this->actingAs($this->admin)
            ->get(route('complaints.create'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/complaints/pages/create')
                ->has('categories')
                ->has('flats')
                ->has('residents')
            );
    }

    public function test_admin_can_create_complaint(): void
    {
        $response = $this->actingAs($this->admin)
            ->post(route('complaints.store'), [
                'flat_id' => $this->flat->id,
                'resident_id' => $this->residentRecord->id,
                'category_id' => $this->category->id,
                'title' => 'Water leakage in bathroom',
                'description' => 'There is a continuous water leakage from the ceiling in the master bathroom.',
                'priority' => 'High',
            ]);

        $response->assertRedirect(route('complaints.index'));
        $this->assertDatabaseHas('complaints', [
            'society_id' => $this->society->id,
            'flat_id' => $this->flat->id,
            'title' => 'Water leakage in bathroom',
            'priority' => 'High',
            'status' => 'Open',
        ]);
    }

    public function test_admin_can_view_complaint_detail(): void
    {
        $complaint = Complaint::factory()->create([
            'society_id' => $this->society->id,
            'flat_id' => $this->flat->id,
            'resident_id' => $this->residentRecord->id,
            'category_id' => $this->category->id,
            'title' => 'Test Complaint',
            'description' => 'Test description',
            'priority' => 'Low',
            'status' => 'Open',
        ]);

        $this->actingAs($this->admin)
            ->get(route('complaints.show', $complaint))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/complaints/pages/show')
                ->has('complaint')
                ->has('staffUsers')
            );
    }

    public function test_admin_can_update_complaint(): void
    {
        $complaint = Complaint::factory()->create([
            'society_id' => $this->society->id,
            'flat_id' => $this->flat->id,
            'resident_id' => $this->residentRecord->id,
            'category_id' => $this->category->id,
            'title' => 'Original Title',
            'description' => 'Original description',
            'priority' => 'Low',
            'status' => 'Open',
        ]);

        $response = $this->actingAs($this->admin)
            ->put(route('complaints.update', $complaint), [
                'title' => 'Updated Title',
                'description' => 'Updated description',
                'priority' => 'Critical',
                'status' => 'In Progress',
            ]);

        $response->assertRedirect(route('complaints.show', $complaint));
        $this->assertDatabaseHas('complaints', [
            'id' => $complaint->id,
            'title' => 'Updated Title',
            'priority' => 'Critical',
            'status' => 'In Progress',
        ]);
    }

    public function test_admin_can_assign_complaint_to_staff(): void
    {
        $complaint = Complaint::factory()->create([
            'society_id' => $this->society->id,
            'flat_id' => $this->flat->id,
            'resident_id' => $this->residentRecord->id,
            'category_id' => $this->category->id,
            'status' => 'Open',
        ]);

        $staff = User::factory()->create(['society_id' => $this->society->id]);
        $staff->assignRole('MaintenanceStaff');

        $response = $this->actingAs($this->admin)
            ->post(route('complaints.assign', $complaint), [
                'assigned_to' => $staff->id,
            ]);

        $response->assertRedirect(route('complaints.show', $complaint));
        $this->assertDatabaseHas('complaints', [
            'id' => $complaint->id,
            'assigned_to' => $staff->id,
            'status' => 'Assigned',
        ]);
    }

    public function test_admin_can_transition_complaint_status(): void
    {
        $complaint = Complaint::factory()->create([
            'society_id' => $this->society->id,
            'flat_id' => $this->flat->id,
            'resident_id' => $this->residentRecord->id,
            'category_id' => $this->category->id,
            'status' => 'In Progress',
        ]);

        $response = $this->actingAs($this->admin)
            ->post(route('complaints.transition', $complaint), [
                'status' => 'Resolved',
            ]);

        $response->assertRedirect(route('complaints.show', $complaint));
        $complaint->refresh();
        $this->assertEquals('Resolved', $complaint->status);
        $this->assertNotNull($complaint->resolved_at);
    }

    public function test_admin_can_delete_complaint(): void
    {
        $complaint = Complaint::factory()->create([
            'society_id' => $this->society->id,
            'flat_id' => $this->flat->id,
            'resident_id' => $this->residentRecord->id,
            'category_id' => $this->category->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->delete(route('complaints.destroy', $complaint));

        $response->assertRedirect(route('complaints.index'));
        $this->assertDatabaseMissing('complaints', ['id' => $complaint->id]);
    }

    public function test_resident_can_create_complaint_but_not_update(): void
    {
        // Resident can view
        $this->actingAs($this->resident)
            ->get(route('complaints.index'))
            ->assertOk();

        // Resident can create
        $response = $this->actingAs($this->resident)
            ->post(route('complaints.store'), [
                'flat_id' => $this->flat->id,
                'resident_id' => $this->residentRecord->id,
                'category_id' => $this->category->id,
                'title' => 'Resident complaint',
                'description' => 'Description from resident',
                'priority' => 'Medium',
            ]);

        $response->assertRedirect(route('complaints.index'));
        $complaint = Complaint::where('title', 'Resident complaint')->first();
        $this->assertNotNull($complaint);

        // Resident cannot update
        $this->actingAs($this->resident)
            ->put(route('complaints.update', $complaint), [
                'title' => 'Modified by resident',
                'description' => 'Modified',
                'priority' => 'High',
            ])
            ->assertForbidden();
    }

    public function test_admin_can_manage_complaint_categories(): void
    {
        // View categories
        $this->actingAs($this->admin)
            ->get(route('complaint-categories.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/complaints/pages/categories')
            );

        // Create category
        $response = $this->actingAs($this->admin)
            ->post(route('complaint-categories.store'), [
                'name' => 'Electrical',
            ]);

        $response->assertRedirect(route('complaint-categories.index'));
        $this->assertDatabaseHas('complaint_categories', [
            'society_id' => $this->society->id,
            'name' => 'Electrical',
        ]);

        $newCategory = ComplaintCategory::where('name', 'Electrical')->first();

        // Update category
        $this->actingAs($this->admin)
            ->put(route('complaint-categories.update', $newCategory), [
                'name' => 'Electrical & Wiring',
            ])
            ->assertRedirect(route('complaint-categories.index'));

        $this->assertDatabaseHas('complaint_categories', [
            'id' => $newCategory->id,
            'name' => 'Electrical & Wiring',
        ]);

        // Delete category (no complaints)
        $this->actingAs($this->admin)
            ->delete(route('complaint-categories.destroy', $newCategory))
            ->assertRedirect(route('complaint-categories.index'));

        $this->assertDatabaseMissing('complaint_categories', ['id' => $newCategory->id]);
    }

    public function test_cannot_delete_category_with_complaints(): void
    {
        Complaint::factory()->create([
            'society_id' => $this->society->id,
            'flat_id' => $this->flat->id,
            'resident_id' => $this->residentRecord->id,
            'category_id' => $this->category->id,
        ]);

        $this->actingAs($this->admin)
            ->delete(route('complaint-categories.destroy', $this->category))
            ->assertRedirect(route('complaint-categories.index'));

        // Category should still exist
        $this->assertDatabaseHas('complaint_categories', ['id' => $this->category->id]);
    }

    public function test_validation_rejects_invalid_complaint(): void
    {
        $this->actingAs($this->admin)
            ->post(route('complaints.store'), [
                'title' => '',
                'description' => '',
                'priority' => 'Invalid',
            ])
            ->assertSessionHasErrors(['title', 'description', 'priority', 'flat_id', 'resident_id', 'category_id']);
    }

    public function test_complaint_search_and_filter(): void
    {
        Complaint::factory()->create([
            'society_id' => $this->society->id,
            'flat_id' => $this->flat->id,
            'resident_id' => $this->residentRecord->id,
            'category_id' => $this->category->id,
            'title' => 'Leaky faucet in kitchen',
            'description' => 'Water dripping non-stop',
            'priority' => 'High',
            'status' => 'Open',
        ]);

        Complaint::factory()->create([
            'society_id' => $this->society->id,
            'flat_id' => $this->flat->id,
            'resident_id' => $this->residentRecord->id,
            'category_id' => $this->category->id,
            'title' => 'Broken light in hallway',
            'description' => 'Hallway light not working',
            'priority' => 'Low',
            'status' => 'Resolved',
        ]);

        // Filter by status
        $this->actingAs($this->admin)
            ->get(route('complaints.index', ['status' => 'Open']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('filters.status', 'Open')
            );

        // Filter by priority
        $this->actingAs($this->admin)
            ->get(route('complaints.index', ['priority' => 'High']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('filters.priority', 'High')
            );
    }
}
