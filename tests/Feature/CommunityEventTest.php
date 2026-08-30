<?php

namespace Tests\Feature;

use App\Models\Amenity;
use App\Models\CommunityEvent;
use App\Models\EventRsvp;
use App\Models\Society;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommunityEventTest extends TestCase
{
    use RefreshDatabase;

    protected Society $society;
    protected User $admin;
    protected User $resident;
    protected Amenity $amenity;

    protected function setUp(): void
    {
        parent::setUp();

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

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

        $this->amenity = Amenity::factory()->create([
            'society_id' => $this->society->id,
            'name' => 'Clubhouse Banquet Hall',
            'is_active' => true,
        ]);
    }

    public function test_user_can_view_community_events_index(): void
    {
        $this->actingAs($this->resident)
            ->get(route('community-events.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/events/pages/index')
                ->has('events')
                ->has('stats')
                ->has('amenities')
                ->has('can')
            );
    }

    public function test_society_admin_can_create_event(): void
    {
        $payload = [
            'title' => 'Society Annual General Meeting',
            'description' => 'Annual review, budget presentations and election.',
            'amenity_id' => $this->amenity->id,
            'venue_name' => 'Main Hall',
            'start_time' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'end_time' => now()->addDays(5)->addHours(3)->format('Y-m-d H:i:s'),
            'max_attendees' => 200,
            'is_published' => true,
        ];

        $response = $this->actingAs($this->admin)->post(route('community-events.store'), $payload);

        $response->assertRedirect(route('community-events.index'));

        $this->assertDatabaseHas('community_events', [
            'society_id' => $this->society->id,
            'creator_id' => $this->admin->id,
            'title' => 'Society Annual General Meeting',
            'amenity_id' => $this->amenity->id,
            'max_attendees' => 200,
        ]);
    }

    public function test_resident_can_submit_and_update_rsvp(): void
    {
        $event = CommunityEvent::create([
            'society_id' => $this->society->id,
            'creator_id' => $this->admin->id,
            'title' => 'Spring Festival Celebration',
            'start_time' => now()->addDays(3),
            'is_published' => true,
        ]);

        // Submit RSVP: Attending
        $response = $this->actingAs($this->resident)->post(route('community-events.rsvp', $event), [
            'status' => 'attending',
            'guests_count' => 2,
            'remarks' => 'Bringing family members',
        ]);

        $response->assertRedirect(route('community-events.index'));

        $this->assertDatabaseHas('event_rsvps', [
            'community_event_id' => $event->id,
            'user_id' => $this->resident->id,
            'society_id' => $this->society->id,
            'status' => 'attending',
            'guests_count' => 2,
        ]);

        // Change RSVP to maybe
        $response = $this->actingAs($this->resident)->post(route('community-events.rsvp', $event), [
            'status' => 'maybe',
            'guests_count' => 0,
        ]);

        $response->assertRedirect(route('community-events.index'));

        $this->assertDatabaseHas('event_rsvps', [
            'community_event_id' => $event->id,
            'user_id' => $this->resident->id,
            'status' => 'maybe',
        ]);
    }

    public function test_admin_can_update_event(): void
    {
        $event = CommunityEvent::create([
            'society_id' => $this->society->id,
            'creator_id' => $this->admin->id,
            'title' => 'Yoga Workshop',
            'start_time' => now()->addDays(2),
            'is_published' => true,
        ]);

        $response = $this->actingAs($this->admin)->put(route('community-events.update', $event), [
            'title' => 'Advanced Yoga & Wellness Workshop',
            'start_time' => now()->addDays(2)->format('Y-m-d H:i:s'),
            'is_published' => true,
        ]);

        $response->assertRedirect(route('community-events.index'));
        $this->assertEquals('Advanced Yoga & Wellness Workshop', $event->fresh()->title);
    }

    public function test_admin_can_delete_event(): void
    {
        $event = CommunityEvent::create([
            'society_id' => $this->society->id,
            'creator_id' => $this->admin->id,
            'title' => 'Event to Delete',
            'start_time' => now()->addDays(2),
            'is_published' => true,
        ]);

        $response = $this->actingAs($this->admin)->delete(route('community-events.destroy', $event));

        $response->assertRedirect(route('community-events.index'));
        $this->assertSoftDeleted('community_events', ['id' => $event->id]);
    }
}
