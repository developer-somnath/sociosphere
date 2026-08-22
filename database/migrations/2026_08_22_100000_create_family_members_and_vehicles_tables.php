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
        Schema::create('family_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('society_id')->constrained()->cascadeOnDelete();
            $table->foreignId('resident_id')->constrained()->cascadeOnDelete();

            $table->string('name');
            $table->string('relation'); // Spouse, Child, Parent, Sibling, Other
            $table->date('date_of_birth')->nullable();
            $table->string('gender')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->boolean('is_dependent')->default(true);

            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('society_id')->constrained()->cascadeOnDelete();
            $table->foreignId('resident_id')->constrained()->cascadeOnDelete();

            $table->string('vehicle_number')->nullable();
            $table->string('vehicle_model')->nullable();
            $table->string('vehicle_type')->default('Car'); // Car, Bike, SUV, Other
            $table->string('parking_slot')->nullable();
            $table->boolean('is_active')->default(true);

            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
        Schema::dropIfExists('family_members');
    }
};
