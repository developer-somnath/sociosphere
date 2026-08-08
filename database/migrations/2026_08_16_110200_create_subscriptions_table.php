<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Society subscription ledger (Phase 14 — Eagle). Multiple rows per society
     * are allowed to keep history; the "current" subscription is the latest
     * non-terminal (trialing/active/past_due) row for the society.
     */
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('society_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignId('plan_id')
                ->constrained('subscription_plans')
                ->nullOnDelete();
            $table->string('status', 20)->default('trialing'); // trialing | active | past_due | cancelled | expired
            $table->string('billing_cycle', 10)->default('monthly'); // monthly | yearly
            $table->decimal('price', 10, 2)->default(0);
            $table->string('currency', 3)->default('INR');
            $table->date('starts_at');
            $table->date('trial_ends_at')->nullable();
            $table->date('ends_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->json('meta')->nullable();            // change history, cancellation reason, etc.
            $table->timestamps();
            $table->softDeletes();
            $table->index(['society_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
