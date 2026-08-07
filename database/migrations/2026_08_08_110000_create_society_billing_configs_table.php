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
        Schema::create('society_billing_configs', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('society_id')
                ->unique()
                ->constrained()
                ->cascadeOnDelete();

            // per_sqft = base_rate × flat area ; fixed = base_rate per flat
            $table->string('billing_mode', 20)->default('per_sqft');
            $table->decimal('base_rate', 12, 2)->default(0);
            $table->decimal('tax_rate', 5, 2)->default(0);      // percentage e.g. 18.00
            $table->unsignedTinyInteger('due_day')->default(10); // day of month invoices are due
            $table->unsignedTinyInteger('grace_days')->default(7);
            $table->decimal('penalty_rate', 5, 2)->default(2);   // percentage of total per late period
            $table->decimal('penalty_cap', 12, 2)->nullable();   // max penalty amount per invoice
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('society_billing_configs');
    }
};
