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
        Schema::create('staff_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('society_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('department')->default('Management'); // Management, Security, Maintenance, Finance, Administration
            $table->string('designation')->nullable();
            $table->string('emergency_phone', 20)->nullable();
            $table->string('shift')->default('Flexible'); // Morning, Evening, Night, Flexible
            $table->date('joining_date')->nullable();
            $table->string('status')->default('Active'); // Active, On Leave, Inactive
            $table->timestamps();

            $table->index(['society_id', 'department']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_profiles');
    }
};
