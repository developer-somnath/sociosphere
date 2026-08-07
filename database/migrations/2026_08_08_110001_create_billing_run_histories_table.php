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
        Schema::create('billing_run_histories', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('society_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('billing_period', 20);          // e.g. 2026-08
            $table->unsignedInteger('total_flats')->default(0);
            $table->unsignedInteger('billed_flats')->default(0);
            $table->unsignedInteger('excluded_flats')->default(0);
            $table->unsignedInteger('skipped_flats')->default(0); // already billed for period
            $table->decimal('subtotal', 14, 2)->default(0);
            $table->decimal('tax_amount', 14, 2)->default(0);
            $table->decimal('total_amount', 14, 2)->default(0);
            $table->unsignedInteger('invoices_generated')->default(0);
            $table->string('status', 20)->default('Completed'); // Completed | Partial | Failed
            $table->foreignId('run_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['society_id', 'billing_period']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billing_run_histories');
    }
};
