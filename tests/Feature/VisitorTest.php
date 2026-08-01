<?php

namespace Tests\Feature;

use App\Models\Flat;
use App\Models\Society;
use App\Models\Tower;
use App\Models\User;
use App\Models\Visitor;
use App\Models\VisitorPass;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VisitorTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([
            RoleSeeder::class,
            PermissionSeeder::class,
            RolePermissionSeeder::class,
        ]);
    }

    private function makeSociety(): Society
    {
        return Society::factory()->create();
    }

    private function makeTower(Society $society, string $name = 'Tower A'): Tower
    {
        return Tower::factory()->create([
            'society_id' => $society->id,
            'name' => $name,
        ]);
    }

    private function makeFlat(Society $society, Tower $tower, string $flatNo = 'A-101'): Flat
    {
        return Flat::factory()->create([
            'society_id' => $society->id,
            'tower_id' => $tower->id,
            'flat_no' => $flatNo,
            'ownership_type' => 'Owner',
            'occupancy_status' => 'Occupied',
        ]);
    }

    private function makePass(
        Society $society,
        Tower $tower,
        User $creator,
        string $status = VisitorPass::STATUS_PENDING,
        string $flatNo = 'A-101',
    ): VisitorPass {
        $flat = $this->makeFlat($society, $tower, $flatNo);

        $visitor = Visitor::create([
            'society_id' => $society->id,
            'name' => 'Rahul Sharma',
            'phone' => '9876543210',
            'created_by' => $creator->id,
        ]);

        return VisitorPass::create([
            'society_id' => $society->id,
            'visitor_id' => $visitor->id,
            'flat_id' => $flat->id,
            'purpose' => 'Meeting resident',
            'status' => $status,
            'created_by' => $creator->id,
        ]);
    }

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get(route('visitors.index'))->assertRedirect(route('login'));
    }

    public function test_security_guard_can_view_visitors_index(): void
    {
        $society = $this->makeSociety();
        $guard = User::factory()->securityGuard($society->id)->create();
        $tower = $this->makeTower($society, 'Tower A');

        $pass = $this->makePass($society, $tower, $guard);

        $this->actingAs($guard)
            ->get(route('visitors.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/visitors/pages/index')
                ->has('passes.data', 1)
                ->where('passes.data.0.visitor.name', 'Rahul Sharma')
                ->where('passes.data.0.purpose', 'Meeting resident')
                ->where('passes.data.0.status', 'pending')
                ->where('passes.data.0.flat.flat_no', 'A-101')
                ->where('can.create', true)
                ->where('can.update', true)
                ->where('can.delete', false));
    }

    public function test_visitors_are_scoped_to_the_users_society(): void
    {
        $society = $this->makeSociety();
        $otherSociety = $this->makeSociety();
        $guard = User::factory()->securityGuard($society->id)->create();
        $tower = $this->makeTower($society, 'Tower A');
        $otherTower = $this->makeTower($otherSociety, 'Other Tower');

        $this->makePass($otherSociety, $otherTower, $guard);

        $this->actingAs($guard)
            ->get(route('visitors.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('passes.total', 0));
    }

    public function test_society_admin_can_create_a_visitor_pass(): void
    {
        $society = $this->makeSociety();
        $admin = User::factory()->societyAdmin($society->id)->create();
        $tower = $this->makeTower($society, 'Tower A');
        $flat = $this->makeFlat($society, $tower, 'A-102');

        $this->actingAs($admin)
            ->post(route('visitors.store'), [
                'name' => 'Priya Patel',
                'phone' => '9812345670',
                'email' => 'priya@example.com',
                'flat_id' => $flat->id,
                'purpose' => 'Guest visit',
                'vehicle_number' => 'MH-01-AB-1234',
                'scheduled_for' => '2026-08-05',
            ])
            ->assertRedirect(route('visitors.index'));

        $this->assertDatabaseHas('visitors', [
            'society_id' => $society->id,
            'name' => 'Priya Patel',
            'phone' => '9812345670',
            'email' => 'priya@example.com',
            'created_by' => $admin->id,
        ]);

        $this->assertDatabaseHas('visitor_passes', [
            'society_id' => $society->id,
            'flat_id' => $flat->id,
            'purpose' => 'Guest visit',
            'vehicle_number' => 'MH-01-AB-1234',
            'status' => VisitorPass::STATUS_PENDING,
            'created_by' => $admin->id,
        ]);
    }

    public function test_super_admin_can_create_pass_for_flat_in_any_society(): void
    {
        $society = $this->makeSociety();
        $admin = User::factory()->superAdmin()->create();
        $tower = $this->makeTower($society, 'Tower A');
        $flat = $this->makeFlat($society, $tower, 'A-103');

        $this->actingAs($admin)
            ->post(route('visitors.store'), [
                'name' => 'Vikram Singh',
                'phone' => '9550011223',
                'flat_id' => $flat->id,
                'purpose' => 'House help',
            ])
            ->assertRedirect(route('visitors.index'));

        $this->assertDatabaseHas('visitors', [
            'society_id' => $society->id,
            'name' => 'Vikram Singh',
        ]);

        $this->assertDatabaseHas('visitor_passes', [
            'society_id' => $society->id,
            'visitor_id' => Visitor::where('name', 'Vikram Singh')->first()->id,
            'flat_id' => $flat->id,
            'status' => VisitorPass::STATUS_PENDING,
        ]);
    }

    public function test_pass_cannot_be_created_for_a_flat_from_another_society(): void
    {
        $society = $this->makeSociety();
        $otherSociety = $this->makeSociety();
        $admin = User::factory()->societyAdmin($society->id)->create();
        $otherTower = $this->makeTower($otherSociety, 'Foreign Tower');
        $otherFlat = $this->makeFlat($otherSociety, $otherTower, 'B-201');

        $this->actingAs($admin)
            ->from(route('visitors.create'))
            ->post(route('visitors.store'), [
                'name' => 'Sneha Iyer',
                'phone' => '9600112233',
                'flat_id' => $otherFlat->id,
                'purpose' => 'Delivery',
            ])
            ->assertSessionHasErrors('flat_id');

        $this->assertDatabaseCount('visitors', 0);
        $this->assertDatabaseCount('visitor_passes', 0);
    }

    public function test_visitor_pass_requires_required_fields(): void
    {
        $society = $this->makeSociety();
        $admin = User::factory()->societyAdmin($society->id)->create();
        $tower = $this->makeTower($society, 'Tower A');
        $this->makeFlat($society, $tower, 'A-104');

        $this->actingAs($admin)
            ->from(route('visitors.create'))
            ->post(route('visitors.store'), [
                'name' => '',
                'phone' => '',
                'purpose' => '',
            ])
            ->assertSessionHasErrors(['name', 'phone', 'flat_id', 'purpose']);

        $this->assertDatabaseCount('visitors', 0);
        $this->assertDatabaseCount('visitor_passes', 0);
    }

    public function test_society_admin_can_approve_a_pending_pass(): void
    {
        $society = $this->makeSociety();
        $admin = User::factory()->societyAdmin($society->id)->create();
        $tower = $this->makeTower($society, 'Tower A');
        $pass = $this->makePass($society, $tower, $admin);

        $this->actingAs($admin)
            ->from(route('visitors.index'))
            ->post(route('visitors.approve', $pass->uuid))
            ->assertRedirect(route('visitors.index'))
            ->assertSessionHas('success', 'Visitor pass approved.');

        $this->assertDatabaseHas('visitor_passes', [
            'id' => $pass->id,
            'status' => VisitorPass::STATUS_APPROVED,
            'approved_by' => $admin->id,
        ]);

        $this->assertNotNull($pass->fresh()->approved_at);
    }

    public function test_society_admin_can_reject_a_pending_pass(): void
    {
        $society = $this->makeSociety();
        $admin = User::factory()->societyAdmin($society->id)->create();
        $tower = $this->makeTower($society, 'Tower A');
        $pass = $this->makePass($society, $tower, $admin);

        $this->actingAs($admin)
            ->from(route('visitors.index'))
            ->post(route('visitors.reject', $pass->uuid))
            ->assertRedirect(route('visitors.index'))
            ->assertSessionHas('success', 'Visitor pass rejected.');

        $this->assertDatabaseHas('visitor_passes', [
            'id' => $pass->id,
            'status' => VisitorPass::STATUS_REJECTED,
        ]);
    }

    public function test_only_pending_passes_can_be_approved(): void
    {
        $society = $this->makeSociety();
        $admin = User::factory()->societyAdmin($society->id)->create();
        $tower = $this->makeTower($society, 'Tower A');
        $pass = $this->makePass($society, $tower, $admin, VisitorPass::STATUS_APPROVED);

        $this->actingAs($admin)
            ->from(route('visitors.index'))
            ->post(route('visitors.approve', $pass->uuid))
            ->assertRedirect(route('visitors.index'))
            ->assertSessionHas('error', 'Only pending passes can be approved.');

        $this->assertDatabaseHas('visitor_passes', [
            'id' => $pass->id,
            'status' => VisitorPass::STATUS_APPROVED,
        ]);
    }

    public function test_only_approved_passes_can_be_checked_in(): void
    {
        $society = $this->makeSociety();
        $guard = User::factory()->securityGuard($society->id)->create();
        $tower = $this->makeTower($society, 'Tower A');
        $pass = $this->makePass($society, $tower, $guard, VisitorPass::STATUS_PENDING);

        $this->actingAs($guard)
            ->from(route('visitors.index'))
            ->post(route('visitors.check-in', $pass->uuid))
            ->assertRedirect(route('visitors.index'))
            ->assertSessionHas('error', 'Only approved passes can be checked in.');

        $this->assertDatabaseHas('visitor_passes', [
            'id' => $pass->id,
            'status' => VisitorPass::STATUS_PENDING,
            'check_in_at' => null,
        ]);
    }

    public function test_approved_pass_can_be_checked_in(): void
    {
        $society = $this->makeSociety();
        $guard = User::factory()->securityGuard($society->id)->create();
        $tower = $this->makeTower($society, 'Tower A');
        $pass = $this->makePass($society, $tower, $guard, VisitorPass::STATUS_APPROVED);

        $this->actingAs($guard)
            ->from(route('visitors.index'))
            ->post(route('visitors.check-in', $pass->uuid))
            ->assertRedirect(route('visitors.index'))
            ->assertSessionHas('success', 'Visitor checked in.');

        $this->assertDatabaseHas('visitor_passes', [
            'id' => $pass->id,
            'status' => VisitorPass::STATUS_CHECKED_IN,
        ]);

        $this->assertNotNull($pass->fresh()->check_in_at);
    }

    public function test_checked_in_pass_can_be_checked_out(): void
    {
        $society = $this->makeSociety();
        $guard = User::factory()->securityGuard($society->id)->create();
        $tower = $this->makeTower($society, 'Tower A');
        $pass = $this->makePass($society, $tower, $guard, VisitorPass::STATUS_CHECKED_IN);

        $this->actingAs($guard)
            ->from(route('visitors.index'))
            ->post(route('visitors.check-out', $pass->uuid))
            ->assertRedirect(route('visitors.index'))
            ->assertSessionHas('success', 'Visitor checked out.');

        $this->assertDatabaseHas('visitor_passes', [
            'id' => $pass->id,
            'status' => VisitorPass::STATUS_CHECKED_OUT,
        ]);

        $this->assertNotNull($pass->fresh()->check_out_at);
    }

    public function test_only_checked_in_passes_can_be_checked_out(): void
    {
        $society = $this->makeSociety();
        $guard = User::factory()->securityGuard($society->id)->create();
        $tower = $this->makeTower($society, 'Tower A');
        $pass = $this->makePass($society, $tower, $guard, VisitorPass::STATUS_APPROVED);

        $this->actingAs($guard)
            ->from(route('visitors.index'))
            ->post(route('visitors.check-out', $pass->uuid))
            ->assertRedirect(route('visitors.index'))
            ->assertSessionHas('error', 'Only checked-in visitors can be checked out.');

        $this->assertDatabaseHas('visitor_passes', [
            'id' => $pass->id,
            'status' => VisitorPass::STATUS_APPROVED,
        ]);
    }

    public function test_society_admin_can_update_a_pass(): void
    {
        $society = $this->makeSociety();
        $admin = User::factory()->societyAdmin($society->id)->create();
        $tower = $this->makeTower($society, 'Tower A');
        $flat = $this->makeFlat($society, $tower, 'A-105');
        $pass = $this->makePass($society, $tower, $admin);

        $this->actingAs($admin)
            ->put(route('visitors.update', $pass->uuid), [
                'name' => 'Rahul Sharma Updated',
                'phone' => '9000000000',
                'email' => 'rahul.new@example.com',
                'notes' => 'Evening visit',
                'flat_id' => $flat->id,
                'purpose' => 'Dinner guest',
                'vehicle_number' => 'GJ-05-CD-5678',
            ])
            ->assertRedirect(route('visitors.index'));

        $this->assertDatabaseHas('visitors', [
            'id' => $pass->visitor_id,
            'name' => 'Rahul Sharma Updated',
            'phone' => '9000000000',
            'email' => 'rahul.new@example.com',
        ]);

        $this->assertDatabaseHas('visitor_passes', [
            'id' => $pass->id,
            'flat_id' => $flat->id,
            'purpose' => 'Dinner guest',
            'vehicle_number' => 'GJ-05-CD-5678',
            'status' => VisitorPass::STATUS_PENDING,
        ]);
    }

    public function test_society_admin_cannot_delete_a_pass(): void
    {
        $society = $this->makeSociety();
        $admin = User::factory()->societyAdmin($society->id)->create();
        $tower = $this->makeTower($society, 'Tower A');
        $pass = $this->makePass($society, $tower, $admin);

        $this->actingAs($admin)
            ->delete(route('visitors.destroy', $pass->uuid))
            ->assertForbidden();

        $this->assertDatabaseHas('visitor_passes', ['id' => $pass->id]);
    }

    public function test_super_admin_can_delete_a_pending_pass(): void
    {
        $society = $this->makeSociety();
        $admin = User::factory()->superAdmin()->create();
        $tower = $this->makeTower($society, 'Tower A');
        $pass = $this->makePass($society, $tower, $admin);

        $this->actingAs($admin)
            ->delete(route('visitors.destroy', $pass->uuid))
            ->assertRedirect(route('visitors.index'));

        $this->assertDatabaseMissing('visitor_passes', ['id' => $pass->id]);
    }

    public function test_non_pending_pass_cannot_be_deleted_even_by_super_admin(): void
    {
        $society = $this->makeSociety();
        $admin = User::factory()->superAdmin()->create();
        $tower = $this->makeTower($society, 'Tower A');
        $pass = $this->makePass($society, $tower, $admin, VisitorPass::STATUS_APPROVED);

        $this->actingAs($admin)
            ->delete(route('visitors.destroy', $pass->uuid))
            ->assertForbidden();

        $this->assertDatabaseHas('visitor_passes', [
            'id' => $pass->id,
            'status' => VisitorPass::STATUS_APPROVED,
        ]);
    }

    public function test_treasurer_cannot_view_visitors(): void
    {
        $society = $this->makeSociety();
        $treasurer = User::factory()->treasurer($society->id)->create();

        $this->actingAs($treasurer)
            ->get(route('visitors.index'))
            ->assertForbidden();
    }

    public function test_status_filter_and_search_on_index(): void
    {
        $society = $this->makeSociety();
        $guard = User::factory()->securityGuard($society->id)->create();
        $tower = $this->makeTower($society, 'Tower A');

        $pending = $this->makePass($society, $tower, $guard, VisitorPass::STATUS_PENDING);
        $this->makePass($society, $tower, $guard, VisitorPass::STATUS_CHECKED_OUT, 'A-102');

        // The checked-out pass has a distinct purpose so the search below
        // only matches the pending pass.
        VisitorPass::query()
            ->latest('id')
            ->first()
            ->update(['purpose' => 'Delivering groceries']);

        // Filter by status.
        $this->actingAs($guard)
            ->get(route('visitors.index', ['status' => 'pending']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('passes.total', 1)
                ->where('passes.data.0.id', $pending->id)
                ->where('filters.status', 'pending'));

        // Search by purpose.
        $this->actingAs($guard)
            ->get(route('visitors.index', ['search' => 'Meeting']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('passes.total', 1)
                ->where('passes.data.0.id', $pending->id)
                ->where('filters.search', 'Meeting'));

        // Invalid status is ignored.
        $this->actingAs($guard)
            ->get(route('visitors.index', ['status' => 'bogus']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('passes.total', 2)
                ->where('filters.status', null));
    }
}
