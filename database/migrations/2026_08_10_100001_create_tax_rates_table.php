<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Individual tax rates belonging to a tax profile.
     * Supports compound tax systems (e.g. CGST + SGST, or VAT + surcharge).
     */
    public function up(): void
    {
        Schema::create('tax_rates', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('tax_profile_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name', 100);            // e.g. "CGST", "SGST", "VAT", "Sales Tax"
            $table->string('code', 20)->nullable(); // e.g. "CGST-9", "VAT-20"
            $table->decimal('rate', 5, 2);          // percentage e.g. 9.00
            $table->string('type', 20)->default('percentage'); // percentage | fixed
            $table->decimal('fixed_amount', 12, 2)->nullable(); // for fixed-type taxes
            $table->boolean('is_compound')->default(false);     // applies on top of other taxes
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tax_rates');
    }
};