<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * The invoices_status_check constraint was added directly to the database
     * (not via a migration) and only allowed Pending/Paid/Overdue/Cancelled.
     * The application uses Unpaid (default) and Partially Paid, so inserts
     * were failing with SQLSTATE 23514. Replace it with the app's real set.
     */
    public function up(): void
    {
        // The constraint was added directly to the PostgreSQL database, so it
        // only exists there. SQLite (tests) never had it — skip those drivers.
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check');

        // Legacy rows used 'Pending' (the old constraint's set). The app's
        // equivalent for an issued-but-unpaid invoice is 'Unpaid'.
        DB::table('invoices')->where('status', 'Pending')->update(['status' => 'Unpaid']);

        DB::statement(
            "ALTER TABLE invoices ADD CONSTRAINT invoices_status_check CHECK (status IN ('Unpaid', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'))"
        );
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check');

        DB::statement(
            "ALTER TABLE invoices ADD CONSTRAINT invoices_status_check CHECK (status IN ('Pending', 'Paid', 'Overdue', 'Cancelled'))"
        );
    }
};