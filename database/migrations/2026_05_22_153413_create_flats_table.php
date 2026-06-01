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
        Schema::create('flats', function (Blueprint $table) {

            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('society_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('tower_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('flat_no');

            $table->integer('floor_no')->nullable();
            $table->string('flat_type')->nullable();

            $table->integer('area_sqft')->nullable();

            $table->enum('ownership_type', [
                'Owner',
                'Tenant'
            ]);

            $table->enum('occupancy_status', [
                'Occupied',
                'Vacant',
                'Self-Occupied'
            ])->default('Occupied');

            $table->timestamps();
            $table->softDeletes();

            $table->unique([
                'tower_id',
                'flat_no'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('flats');
    }
};
