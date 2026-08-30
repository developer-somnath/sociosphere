<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('community_events', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('society_id')->constrained('societies')->cascadeOnDelete();
            $table->foreignId('creator_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('amenity_id')->nullable()->constrained('amenities')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('venue_name')->nullable();
            $table->dateTime('start_time');
            $table->dateTime('end_time')->nullable();
            $table->unsignedInteger('max_attendees')->nullable();
            $table->boolean('is_published')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['society_id', 'start_time']);
            $table->index(['society_id', 'is_published']);
        });

        Schema::create('event_rsvps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('community_event_id')->constrained('community_events')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('society_id')->constrained('societies')->cascadeOnDelete();
            $table->string('status', 20)->default('attending'); // attending, maybe, declined
            $table->unsignedInteger('guests_count')->default(0);
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->unique(['community_event_id', 'user_id']);
            $table->index(['community_event_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_rsvps');
        Schema::dropIfExists('community_events');
    }
};
