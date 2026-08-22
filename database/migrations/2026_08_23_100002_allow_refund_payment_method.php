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
        if (Schema::hasTable('payments')) {
            DB::statement('ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_method_check');
            DB::statement(
                "ALTER TABLE payments ADD CONSTRAINT payments_payment_method_check "
                . "CHECK (payment_method::text = ANY (ARRAY['UPI'::character varying, 'Card'::character varying, 'NetBanking'::character varying, 'Cash'::character varying, 'Cheque'::character varying, 'Refund'::character varying]::text[]))"
            );

            // Extend the payments status check constraint to allow "Refunded".
            DB::statement('ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check');
            DB::statement(
                "ALTER TABLE payments ADD CONSTRAINT payments_status_check "
                . "CHECK (status::text = ANY (ARRAY['Pending'::character varying, 'Success'::character varying, 'Failed'::character varying, 'Refunded'::character varying]::text[]))"
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('payments')) {
            DB::statement('ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_method_check');
            DB::statement(
                "ALTER TABLE payments ADD CONSTRAINT payments_payment_method_check "
                . "CHECK (payment_method::text = ANY (ARRAY['UPI'::character varying, 'Card'::character varying, 'NetBanking'::character varying, 'Cash'::character varying, 'Cheque'::character varying]::text[]))"
            );

            DB::statement('ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check');
            DB::statement(
                "ALTER TABLE payments ADD CONSTRAINT payments_status_check "
                . "CHECK (status::text = ANY (ARRAY['Pending'::character varying, 'Success'::character varying, 'Failed'::character varying]::text[]))"
            );
        }
    }
};
