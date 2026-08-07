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
        Schema::create('security_logs', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('society_id')->constrained()->cascadeOnDelete();
            $table->foreignId('guard_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('event_type'); // Shift Handover, Incident Report, Blacklist Alert, Gate Trigger, Patrol Check
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('severity')->default('Low'); // Low, Medium, High, Critical
            $table->timestamps();

            $table->index(['society_id', 'event_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('security_logs');
    }
};
