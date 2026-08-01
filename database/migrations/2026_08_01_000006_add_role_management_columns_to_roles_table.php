<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Extend the roles table with role-management metadata:
     * a public uuid (route key), a human description, and an is_system
     * flag protecting the built-in seeded roles from deletion.
     */
    public function up(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
            $table->text('description')->nullable()->after('uuid');
            $table->boolean('is_system')->default(false)->after('description');
        });

        // Backfill uuids for roles created before this migration.
        DB::table('roles')->orderBy('id')->get()->each(function ($role) {
            if (empty($role->uuid)) {
                DB::table('roles')
                    ->where('id', $role->id)
                    ->update(['uuid' => (string) Str::uuid()]);
            }
        });

        Schema::table('roles', function (Blueprint $table) {
            $table->unique('uuid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->dropUnique(['uuid']);
            $table->dropColumn(['uuid', 'description', 'is_system']);
        });
    }
};
