<?php

namespace Tests\Feature;

use App\Models\Amenity;
use App\Models\AmenityBooking;
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

class AmenityBookingTest extends TestCase
{
    use RefreshDatabase;

    protected Society $society;
    protected User $admin;
    protected User $resident;
    protected Tower $tower;
    protected Flat $flat;
    protected Resident $residentRecord;
    protected Amenity $amenity;

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
        $this->amenity = Amenity::factory()->create([
            'society_id' => $this->society->id,
            'name' => 'Clubhouse',
            'capacity' => 1,
            'fee_per_slot' => 100.00,
            'is_active' => true,
        ]);
    }

    public function test_society_admin_can_view_amenities_index(): void
    {
        $this->actingAs($this->admin)
            ->get(route('amenities.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/amenities/pages/index')
                ->has('amenities')
                ->has('stats')
            );
    }

    public function test_society_admin_can_create_amenity(): void
    {
        $response = $this->actingAs($this->admin)
            ->post(route('amenities.store'), [
                'name' => 'Swimming Pool',
                'description' => 'Olympic size pool',
                'booking_type' => 'Slot',
                'capacity' => 20,
                'fee_per_slot' => 50.00,
                'rules' => 'Swimwear required.',
                'is_active' => true,
            ]);

        $response->assertRedirect(route('amenities.index'));
        $this->assertDatabaseHas('amenities', [
            'society_id' => $this->society->id,
            'name' => 'Swimming Pool',
            'booking_type' => 'Slot',
        ]);
    }

    public function test_society_admin_can_update_amenity(): void
    {
        $response = $this->actingAs($this->admin)
            ->put(route('amenities.update', $this->amenity), [
                'name' => 'Renovated Clubhouse',
                'description' => 'Updated description',
                'booking_type' => 'Daily',
                'capacity' => 50,
                'fee_per_slot' => 200.00,
                'is_active' => true,
            ]);

        $response->assertRedirect(route('amenities.index'));
        $this->assertDatabaseHas('amenities', [
            'id' => $this->amenity->id,
            'name' => 'Renovated Clubhouse',
            'fee_per_slot' => 200.00,
        ]);
    }

    public function test_resident_can_request_amenity_booking(): void
    {
        $bookingDate = now()->addDays(2)->format('Y-m-d');

        $response = $this->actingAs($this->resident)
            ->post(route('amenity-bookings.store'), [
                'amenity_id' => $this->amenity->id,
                'flat_id' => $this->flat->id,
                'resident_id' => $this->residentRecord->id,
                'booking_date' => $bookingDate,
                'start_time' => '10:00',
                'end_time' => '12:00',
                'remarks' => 'Birthday party',
            ]);

        $response->assertRedirect(route('amenity-bookings.index'));
        $this->assertDatabaseHas('amenity_bookings', [
            'society_id' => $this->society->id,
            'amenity_id' => $this->amenity->id,
            'status' => 'Pending',
        ]);
    }

    public function test_double_booking_same_slot_is_prevented(): void
    {
        $bookingDate = now()->addDays(2)->format('Y-m-d');

        // First booking exists
        AmenityBooking::factory()->create([
            'society_id' => $this->society->id,
            'amenity_id' => $this->amenity->id,
            'flat_id' => $this->flat->id,
            'resident_id' => $this->residentRecord->id,
            'booking_date' => $bookingDate,
            'start_time' => '10:00:00',
            'end_time' => '12:00:00',
            'status' => 'Approved',
        ]);

        // Second booking attempt for overlapping time slot (capacity is 1)
        $response = $this->actingAs($this->resident)
            ->post(route('amenity-bookings.store'), [
                'amenity_id' => $this->amenity->id,
                'flat_id' => $this->flat->id,
                'resident_id' => $this->residentRecord->id,
                'booking_date' => $bookingDate,
                'start_time' => '11:00',
                'end_time' => '13:00',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }

    public function test_society_admin_can_approve_booking(): void
    {
        $booking = AmenityBooking::factory()->create([
            'society_id' => $this->society->id,
            'amenity_id' => $this->amenity->id,
            'flat_id' => $this->flat->id,
            'resident_id' => $this->residentRecord->id,
            'status' => 'Pending',
        ]);

        $response = $this->actingAs($this->admin)
            ->post(route('amenity-bookings.approve', $booking));

        $response->assertRedirect(route('amenity-bookings.index'));
        $this->assertDatabaseHas('amenity_bookings', [
            'id' => $booking->id,
            'status' => 'Approved',
        ]);
    }

    public function test_society_admin_can_reject_booking(): void
    {
        $booking = AmenityBooking::factory()->create([
            'society_id' => $this->society->id,
            'amenity_id' => $this->amenity->id,
            'flat_id' => $this->flat->id,
            'resident_id' => $this->residentRecord->id,
            'status' => 'Pending',
        ]);

        $response = $this->actingAs($this->admin)
            ->post(route('amenity-bookings.reject', $booking));

        $response->assertRedirect(route('amenity-bookings.index'));
        $this->assertDatabaseHas('amenity_bookings', [
            'id' => $booking->id,
            'status' => 'Rejected',
        ]);
    }

    public function test_resident_can_cancel_booking(): void
    {
        $booking = AmenityBooking::factory()->create([
            'society_id' => $this->society->id,
            'amenity_id' => $this->amenity->id,
            'flat_id' => $this->flat->id,
            'resident_id' => $this->residentRecord->id,
            'status' => 'Pending',
        ]);

        $response = $this->actingAs($this->resident)
            ->post(route('amenity-bookings.cancel', $booking));

        $response->assertRedirect(route('amenity-bookings.index'));
        $this->assertDatabaseHas('amenity_bookings', [
            'id' => $booking->id,
            'status' => 'Cancelled',
        ]);
    }
}
