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
        Schema::create('invoice_penalties', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('society_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignId('invoice_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->decimal('penalty_amount', 12, 2);
            $table->date('applied_on');
            $table->string('billing_period', 20);
            $table->string('reason', 255)->nullable();

            $table->timestamps();

            // Prevent double-penalizing the same invoice for the same period.
            $table->unique(['invoice_id', 'billing_period'], 'invoice_penalty_period_unique');
            $table->index(['society_id', 'billing_period']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_penalties');
    }
};
