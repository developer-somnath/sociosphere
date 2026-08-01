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
        Schema::create('visitor_passes', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('society_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('visitor_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('flat_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->string('purpose', 100);
            $table->string('vehicle_number', 20)
                ->nullable();

            // pending → approved | rejected
            // approved → checked_in
            // checked_in → checked_out
            $table->string('status', 20)
                ->default('pending')
                ->index();

            $table->timestamp('scheduled_for')
                ->nullable();

            $table->timestamp('check_in_at')
                ->nullable();

            $table->timestamp('check_out_at')
                ->nullable();

            $table->foreignId('approved_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('approved_at')
                ->nullable();

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();

            $table->index(['society_id', 'status']);
            $table->index('visitor_id');
            $table->index('flat_id');
            $table->index('scheduled_for');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visitor_passes');
    }
};
