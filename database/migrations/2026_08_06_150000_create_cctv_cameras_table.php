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
        Schema::create('cctv_cameras', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('society_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tower_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('camera_group')->default('Main Gate'); // Main Gate, Basement Parking, Tower Lobby, Perimeter, Amenities
            $table->string('stream_url');
            $table->string('ip_address', 45)->nullable();
            $table->string('location_details')->nullable();
            $table->string('status')->default('Online'); // Online, Offline, Maintenance
            $table->boolean('is_recording')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['society_id', 'camera_group']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cctv_cameras');
    }
};
