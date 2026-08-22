<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Global tax profiles — a per-society regional tax configuration.
     * This is the heart of the Orca v2.2.0 Global Tax Engine.
     */
    public function up(): void
    {
        Schema::create('tax_profiles', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('society_id')
                ->unique()
                ->constrained()
                ->cascadeOnDelete();

            // Regional identity
            $table->string('country', 100)->default('India');
            $table->string('region', 100)->nullable();      // state / province / county
            $table->string('tax_scheme', 50)->default('GST'); // GST | VAT | Sales Tax | None

            // Currency & locale for financial display
            $table->string('currency_code', 3)->default('INR');
            $table->string('currency_symbol', 10)->default('₹');
            $table->string('locale', 20)->default('en-IN');

            // Rounding policy
            $table->string('rounding_mode', 20)->default('round'); // round | ceil | floor
            $table->unsignedTinyInteger('rounding_precision')->default(2);

            // Tax registration identifiers (GSTIN / VAT ID / EIN)
            $table->string('tax_registration_no', 50)->nullable();

            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tax_profiles');
    }
};