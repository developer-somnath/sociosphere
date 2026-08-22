<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Per-invoice tax breakdown — the line-level tax evidence required
     * for GST/VAT/Sales Tax compliance and audit trails.
     */
    public function up(): void
    {
        Schema::create('invoice_tax_breakdowns', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('invoice_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('tax_name', 100);        // e.g. "CGST", "SGST", "VAT"
            $table->string('tax_code', 20)->nullable();
            $table->decimal('rate', 5, 2);          // percentage applied
            $table->decimal('taxable_amount', 12, 2); // base amount the tax applied to
            $table->decimal('tax_amount', 12, 2);     // computed tax
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_tax_breakdowns');
    }
};