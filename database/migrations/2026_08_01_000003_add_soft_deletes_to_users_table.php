<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add soft-deletes to users so removed accounts can be restored and
     * their email addresses reused.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Laravel's schema grammar cannot compile the WHERE clause of a
        // partial unique index, so we create it manually. The syntax is
        // identical on PostgreSQL (production) and SQLite (tests): only one
        // ACTIVE user may hold an email; soft-deleted rows do not block reuse.
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['email']);
        });

        DB::statement('create unique index users_email_unique_active on users (email) where deleted_at is null');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('drop index users_email_unique_active');

        Schema::table('users', function (Blueprint $table) {
            $table->unique('email');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
