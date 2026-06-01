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
        Schema::create('residents', function (Blueprint $table) {

            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('society_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('flat_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name');

            $table->string('email')->nullable();

            $table->string('phone', 20);

            $table->date('date_of_birth')->nullable();

            $table->enum('gender', [
                'Male',
                'Female',
                'Other'
            ])->nullable();

            $table->string('occupation')->nullable();

            $table->boolean('is_primary_contact')
                ->default(false);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('residents');
    }
};
