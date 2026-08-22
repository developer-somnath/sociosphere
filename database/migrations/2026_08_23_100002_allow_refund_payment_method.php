<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Extend the payments payment_method check constraint to allow "Refund"
        // entries (used when amenity bookings are cancelled and money is returned).
        // The constraint is managed directly in PostgreSQL; SQLite (tests) never
        // had it, so skip non-pgsql drivers to keep the suite portable.
        if (DB::getDriverName() !== 'pgsql' || ! Schema::hasTable('payments')) {
            return;
        }

        DB::statement('ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_method_check');
        DB::statement(
            "ALTER TABLE payments ADD CONSTRAINT payments_payment_method_check "
            . "CHECK (payment_method IN ('UPI', 'Card', 'NetBanking', 'Cash', 'Cheque', 'Refund'))"
        );

        // Extend the payments status check constraint to allow "Refunded".
        DB::statement('ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check');
        DB::statement(
            "ALTER TABLE payments ADD CONSTRAINT payments_status_check "
            . "CHECK (status IN ('Pending', 'Success', 'Failed', 'Refunded'))"
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql' || ! Schema::hasTable('payments')) {
            return;
        }

        DB::statement('ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_method_check');
        DB::statement(
            "ALTER TABLE payments ADD CONSTRAINT payments_payment_method_check "
            . "CHECK (payment_method IN ('UPI', 'Card', 'NetBanking', 'Cash', 'Cheque'))"
        );

        DB::statement('ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check');
        DB::statement(
            "ALTER TABLE payments ADD CONSTRAINT payments_status_check "
            . "CHECK (status IN ('Pending', 'Success', 'Failed'))"
        );
    }
};
