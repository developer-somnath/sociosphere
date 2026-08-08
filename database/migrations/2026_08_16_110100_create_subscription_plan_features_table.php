<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Dynamic entitlement limits per plan (Phase 14 — Eagle).
     * limit_value = NULL means unlimited for that resource.
     */
    public function up(): void
    {
        Schema::create('subscription_plan_features', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_id')
                ->constrained('subscription_plans')
                ->cascadeOnDelete();
            $table->string('feature_key', 60);          // towers | flats | residents | users | amenities | ...
            $table->unsignedInteger('limit_value')->nullable(); // null = unlimited
            $table->unsignedInteger('sort_order')->default(0);
            $table->unique(['plan_id', 'feature_key']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_plan_features');
    }
};
