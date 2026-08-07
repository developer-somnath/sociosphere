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
        Schema::create('flat_ownerships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('society_id')->constrained()->cascadeOnDelete();
            $table->foreignId('flat_id')->constrained()->cascadeOnDelete();

            $table->string('owner_name');
            $table->string('owner_email')->nullable();
            $table->string('owner_phone')->nullable();
            $table->date('ownership_start');
            $table->date('ownership_end')->nullable();
            $table->boolean('is_current')->default(true);

            $table->timestamps();
        });

        Schema::create('flat_occupancies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('society_id')->constrained()->cascadeOnDelete();
            $table->foreignId('flat_id')->constrained()->cascadeOnDelete();
            $table->foreignId('resident_id')->nullable()->constrained()->nullOnDelete();

            $table->string('occupancy_type')->default('Tenant'); // Owner Occupied, Tenant, Lease
            $table->date('move_in_date');
            $table->date('move_out_date')->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('flat_occupancies');
        Schema::dropIfExists('flat_ownerships');
    }
};
