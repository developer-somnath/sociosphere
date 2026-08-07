<?php

namespace Tests\Feature;

use App\Models\Complaint;
use App\Models\ComplaintCategory;
use App\Models\Flat;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Resident;
use App\Models\Society;
use App\Models\Tower;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
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

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get(route('overview'))->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_dashboard_with_stats(): void
    {
        $society = Society::factory()->create();
        $user = User::factory()->societyAdmin($society->id)->create();

        $tower = Tower::factory()->create([
            'society_id' => $society->id,
        ]);

        Flat::factory()->count(2)->create([
            'society_id' => $society->id,
            'tower_id' => $tower->id,
            'occupancy_status' => 'Occupied',
        ]);

        Flat::factory()->create([
            'society_id' => $society->id,
            'tower_id' => $tower->id,
            'occupancy_status' => 'Vacant',
        ]);

        $flat = Flat::where('society_id', $society->id)
            ->where('occupancy_status', 'Occupied')
            ->first();

        Resident::factory()->create([
            'society_id' => $society->id,
            'flat_id' => $flat->id,
        ]);

        $response = $this->actingAs($user)->get(route('overview'));

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/dashboard/pages/dashboard-page')
                ->has('stats', fn ($stats) => $stats
                    ->where('residents', 1)
                    ->where('flats', 3)
                    ->where('occupied_flats', 2)
                    ->where('towers', 1)
                    ->where('open_complaints', 0)
                    ->where('active_notices', 0)
                    ->where('pending_payments', 0)
                    ->etc()
                )
            );
    }

    public function test_dashboard_stats_are_scoped_to_the_users_society(): void
    {
        $ownSociety = Society::factory()->create();
        $otherSociety = Society::factory()->create();
        $user = User::factory()->societyAdmin($ownSociety->id)->create();

        Tower::factory()->create(['society_id' => $otherSociety->id]);

        $response = $this->actingAs($user)->get(route('overview'));

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('stats', fn ($stats) => $stats
                    ->where('towers', 0)
                    ->etc()
                )
            );
    }

    public function test_super_admin_role_helpers(): void
    {
        $user = User::factory()->superAdmin()->create();

        $this->assertTrue($user->isSuperAdmin());
        $this->assertFalse($user->isSocietyAdmin());
        $this->assertContains('SuperAdmin', $user->roleNames());
        $this->assertNotContains('SocietyAdmin', $user->roleNames());
    }

    public function test_dashboard_counts_title_case_complaint_and_payment_statuses(): void
    {
        $society = Society::factory()->create();
        $user = User::factory()->societyAdmin($society->id)->create();
        $tower = Tower::factory()->create(['society_id' => $society->id]);
        $flat = Flat::factory()->create(['society_id' => $society->id, 'tower_id' => $tower->id]);
        $resident = Resident::factory()->create(['society_id' => $society->id, 'flat_id' => $flat->id]);
        $category = ComplaintCategory::factory()->create(['society_id' => $society->id]);
        Complaint::factory()->create([
            'society_id' => $society->id,
            'flat_id' => $flat->id,
            'resident_id' => $resident->id,
            'category_id' => $category->id,
            'status' => 'In Progress',
        ]);
        $invoice = Invoice::factory()->create([
            'society_id' => $society->id,
            'flat_id' => $flat->id,
        ]);
        Payment::factory()->create([
            'society_id' => $society->id,
            'invoice_id' => $invoice->id,
            'status' => 'Pending',
        ]);

        $this->actingAs($user)->get(route('overview'))
            ->assertInertia(fn ($page) => $page
                ->where('stats.open_complaints', 1)
                ->where('stats.pending_payments', 1));
    }

    public function test_super_admin_dashboard_shows_the_portfolio_across_societies(): void
    {
        $firstSociety = Society::factory()->create();
        $secondSociety = Society::factory()->create();
        $superAdmin = User::factory()->superAdmin()->create();

        Tower::factory()->create(['society_id' => $firstSociety->id]);
        Tower::factory()->create(['society_id' => $secondSociety->id]);

        $this->actingAs($superAdmin)->get(route('overview'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('stats.towers', 2));
    }
}
