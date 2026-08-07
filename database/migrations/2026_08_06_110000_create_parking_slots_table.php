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
        Schema::create('parking_slots', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('society_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tower_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('flat_id')->nullable()->constrained()->nullOnDelete();

            $table->string('slot_number');
            $table->string('type')->default('Four Wheeler'); // Four Wheeler, Two Wheeler, Visitor
            $table->string('status')->default('Available'); // Available, Allocated, Reserved, Maintenance
            $table->string('vehicle_number')->nullable();
            $table->string('vehicle_model')->nullable();
            $table->string('rfid_tag')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['society_id', 'slot_number'], 'parking_slots_society_slot_unique');
            $table->index(['society_id', 'type', 'status'], 'parking_slots_society_type_status_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parking_slots');
    }
};
