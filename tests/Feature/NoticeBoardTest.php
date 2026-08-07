<?php

namespace Tests\Feature;

use App\Models\Notice;
use App\Models\NoticeAcknowledgement;
use App\Models\Society;
use App\Models\SocietyDocument;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class NoticeBoardTest extends TestCase
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

    /* ─── Notices ─────────────────────────────────────────────── */

    public function test_society_admin_can_view_notices_index(): void
    {
        Notice::factory()->create(['society_id' => $this->society->id]);

        $this->actingAs($this->admin)
            ->get(route('notices.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/notices/pages/index')
                ->has('notices')
                ->has('stats')
                ->has('categories')
            );
    }

    public function test_society_admin_can_create_notice(): void
    {
        $response = $this->actingAs($this->admin)
            ->post(route('notices.store'), [
                'title' => 'Water maintenance on Sunday',
                'category' => 'Maintenance',
                'target_audience' => 'All',
                'description' => 'Water supply will be interrupted from 10 AM to 2 PM.',
                'is_pinned' => true,
                'publish_from' => now()->format('Y-m-d'),
                'publish_to' => now()->addDays(7)->format('Y-m-d'),
            ]);

        $response->assertRedirect(route('notices.index'));
        $this->assertDatabaseHas('notices', [
            'society_id' => $this->society->id,
            'title' => 'Water maintenance on Sunday',
            'is_pinned' => true,
            'created_by' => $this->admin->id,
        ]);
    }

    public function test_society_admin_can_update_notice(): void
    {
        $notice = Notice::factory()->create([
            'society_id' => $this->society->id,
            'title' => 'Original title',
        ]);

        $response = $this->actingAs($this->admin)
            ->put(route('notices.update', $notice), [
                'title' => 'Updated title',
                'category' => 'Security',
                'target_audience' => 'Owners',
                'description' => 'Updated description',
                'is_pinned' => false,
            ]);

        $response->assertRedirect(route('notices.index'));
        $this->assertDatabaseHas('notices', [
            'id' => $notice->id,
            'title' => 'Updated title',
            'target_audience' => 'Owners',
        ]);
    }

    public function test_society_admin_can_delete_notice(): void
    {
        $notice = Notice::factory()->create(['society_id' => $this->society->id]);

        $response = $this->actingAs($this->admin)
            ->delete(route('notices.destroy', $notice));

        $response->assertRedirect(route('notices.index'));
        $this->assertDatabaseMissing('notices', ['id' => $notice->id]);
    }

    public function test_society_admin_can_toggle_pin(): void
    {
        $notice = Notice::factory()->create([
            'society_id' => $this->society->id,
            'is_pinned' => false,
        ]);

        $this->actingAs($this->admin)
            ->post(route('notices.toggle-pin', $notice))
            ->assertRedirect(route('notices.index'));

        $this->assertDatabaseHas('notices', ['id' => $notice->id, 'is_pinned' => true]);
    }

    public function test_resident_can_acknowledge_notice(): void
    {
        $notice = Notice::factory()->create(['society_id' => $this->society->id]);

        $this->actingAs($this->resident)
            ->post(route('notices.acknowledge', $notice))
            ->assertRedirect(route('notices.index'));

        $this->assertDatabaseHas('notice_acknowledgements', [
            'notice_id' => $notice->id,
            'user_id' => $this->resident->id,
        ]);
    }

    public function test_notice_acknowledgement_is_idempotent(): void
    {
        $notice = Notice::factory()->create(['society_id' => $this->society->id]);

        $this->actingAs($this->resident)->post(route('notices.acknowledge', $notice));
        $this->actingAs($this->resident)->post(route('notices.acknowledge', $notice));

        $this->assertDatabaseCount('notice_acknowledgements', 1);
    }

    public function test_notice_scope_published_filters_by_window(): void
    {
        Notice::factory()->create([
            'society_id' => $this->society->id,
            'publish_from' => now()->subDay(),
            'publish_to' => now()->addDay(),
        ]);
        Notice::factory()->create([
            'society_id' => $this->society->id,
            'publish_from' => now()->addDays(5),
            'publish_to' => now()->addDays(10),
        ]);

        $published = Notice::published()->get();

        $this->assertCount(1, $published);
    }

    /* ─── Documents ───────────────────────────────────────────── */

    public function test_society_admin_can_view_documents_index(): void
    {
        SocietyDocument::factory()->create(['society_id' => $this->society->id]);

        $this->actingAs($this->admin)
            ->get(route('documents.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('features/documents/pages/index')
                ->has('documents')
                ->has('stats')
                ->has('categories')
            );
    }

    public function test_society_admin_can_upload_document(): void
    {
        Storage::fake('local');

        $file = UploadedFile::fake()->create('bylaws.pdf', 100, 'application/pdf');

        $response = $this->actingAs($this->admin)
            ->post(route('documents.store'), [
                'title' => 'Society Bylaws',
                'category' => 'Bylaws',
                'file' => $file,
                'is_public' => true,
            ]);

        $response->assertRedirect(route('documents.index'));
        $this->assertDatabaseHas('society_documents', [
            'society_id' => $this->society->id,
            'title' => 'Society Bylaws',
            'file_name' => 'bylaws.pdf',
            'is_public' => true,
            'uploaded_by' => $this->admin->id,
        ]);

        $document = SocietyDocument::where('title', 'Society Bylaws')->first();
        Storage::disk('local')->assertExists($document->file_path);
    }

    public function test_society_admin_can_update_document_metadata(): void
    {
        $document = SocietyDocument::factory()->create([
            'society_id' => $this->society->id,
            'title' => 'Old title',
            'is_public' => false,
        ]);

        $response = $this->actingAs($this->admin)
            ->put(route('documents.update', $document), [
                'title' => 'New title',
                'category' => 'Financial',
                'is_public' => true,
            ]);

        $response->assertRedirect(route('documents.index'));
        $this->assertDatabaseHas('society_documents', [
            'id' => $document->id,
            'title' => 'New title',
            'is_public' => true,
        ]);
    }

    public function test_society_admin_can_delete_document(): void
    {
        Storage::fake('local');

        $document = SocietyDocument::factory()->create([
            'society_id' => $this->society->id,
            'file_path' => 'documents/delete-me.pdf',
        ]);

        Storage::disk('local')->put('documents/delete-me.pdf', 'content');

        $response = $this->actingAs($this->admin)
            ->delete(route('documents.destroy', $document));

        $response->assertRedirect(route('documents.index'));
        $this->assertSoftDeleted('society_documents', ['id' => $document->id]);
        Storage::disk('local')->assertMissing('documents/delete-me.pdf');
    }

    public function test_resident_can_download_public_document(): void
    {
        Storage::fake('local');

        $document = SocietyDocument::factory()->create([
            'society_id' => $this->society->id,
            'file_path' => 'documents/public.pdf',
            'file_name' => 'public.pdf',
            'is_public' => true,
        ]);

        Storage::disk('local')->put('documents/public.pdf', 'content');

        $this->actingAs($this->resident)
            ->get(route('documents.download', $document))
            ->assertOk();
    }

    public function test_user_without_permission_cannot_download_private_document(): void
    {
        Storage::fake('local');

        $document = SocietyDocument::factory()->create([
            'society_id' => $this->society->id,
            'file_path' => 'documents/private.pdf',
            'file_name' => 'private.pdf',
            'is_public' => false,
        ]);

        Storage::disk('local')->put('documents/private.pdf', 'content');

        // A user with no document.view permission cannot download private docs.
        $noPermission = User::factory()->create(['society_id' => $this->society->id]);

        $this->actingAs($noPermission)
            ->get(route('documents.download', $document))
            ->assertForbidden();
    }
}