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
        Schema::create('complaints', function (Blueprint $table) {

            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('society_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('flat_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('resident_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('category_id')
                ->constrained('complaint_categories')
                ->cascadeOnDelete();

            $table->string('title');

            $table->longText('description');

            $table->enum('priority', [
                'Low',
                'Medium',
                'High',
                'Critical'
            ])->default('Low');

            $table->enum('status', [
                'Open',
                'Assigned',
                'In Progress',
                'Resolved',
                'Closed'
            ])->default('Open');

            $table->foreignId('assigned_to')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('resolved_at')
                ->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('complaints');
    }
};
