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
        Schema::table('invoices', function (Blueprint $table) {
            if (! Schema::hasColumn('invoices', 'invoice_number')) {
                $table->string('invoice_number')->nullable()->after('flat_id');
            }
            if (! Schema::hasColumn('invoices', 'billing_period')) {
                $table->string('billing_period', 20)->nullable()->after('invoice_number');
            }
            if (! Schema::hasColumn('invoices', 'issue_date')) {
                $table->date('issue_date')->nullable()->after('billing_period');
            }
            if (! Schema::hasColumn('invoices', 'tax_amount')) {
                $table->decimal('tax_amount', 12, 2)->default(0)->after('subtotal');
            }
            if (! Schema::hasColumn('invoices', 'discount_amount')) {
                $table->decimal('discount_amount', 12, 2)->default(0)->after('tax_amount');
            }
            if (! Schema::hasColumn('invoices', 'paid_amount')) {
                $table->decimal('paid_amount', 12, 2)->default(0)->after('total_amount');
            }
            if (! Schema::hasColumn('invoices', 'notes')) {
                $table->text('notes')->nullable()->after('status');
            }
            if (! Schema::hasColumn('invoices', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        Schema::table('invoice_items', function (Blueprint $table) {
            if (! Schema::hasColumn('invoice_items', 'society_id')) {
                $table->foreignId('society_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            }
            if (! Schema::hasColumn('invoice_items', 'title')) {
                $table->string('title')->nullable()->after('invoice_id');
            }
            if (! Schema::hasColumn('invoice_items', 'calculation_type')) {
                $table->string('calculation_type')->default('Fixed')->after('title');
            }
            if (! Schema::hasColumn('invoice_items', 'unit_price')) {
                $table->decimal('unit_price', 10, 2)->default(0)->after('calculation_type');
            }
            if (! Schema::hasColumn('invoice_items', 'quantity')) {
                $table->decimal('quantity', 10, 2)->default(1)->after('unit_price');
            }
        });

        Schema::table('payments', function (Blueprint $table) {
            if (! Schema::hasColumn('payments', 'flat_id')) {
                $table->foreignId('flat_id')->nullable()->after('invoice_id')->constrained()->cascadeOnDelete();
            }
            if (! Schema::hasColumn('payments', 'payment_number')) {
                $table->string('payment_number')->nullable()->after('flat_id');
            }
            if (! Schema::hasColumn('payments', 'remarks')) {
                $table->text('remarks')->nullable()->after('status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Alter additions rollback handled cleanly if needed
    }
};
