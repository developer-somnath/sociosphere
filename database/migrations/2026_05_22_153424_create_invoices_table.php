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
        Schema::create('invoices', function (Blueprint $table) {

            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('society_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('flat_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('invoice_no')
                ->nullable();

            $table->tinyInteger('billing_month')
                ->nullable();

            $table->year('billing_year')
                ->nullable();

            $table->date('due_date');

            $table->decimal(
                'subtotal',
                12,
                2
            );

            $table->decimal(
                'penalty',
                12,
                2
            )->default(0);

            $table->decimal(
                'total_amount',
                12,
                2
            );

            $table->string('status')->default('Unpaid');

            $table->foreignId('generated_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
