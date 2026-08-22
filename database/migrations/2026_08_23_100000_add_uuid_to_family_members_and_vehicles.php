<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * FamilyMember and Vehicle models use the HasPublicUuid trait, which
     * populates and binds by a "uuid" column. The original tables were
     * created without that column, causing inserts/route binding to fail.
     * This adds a unique, nullable uuid column and backfills existing rows.
     */
    public function up(): void
    {
        Schema::table('family_members', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->unique()->after('id');
        });

        Schema::table('vehicles', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->unique()->after('id');
        });

        // Backfill any pre-existing rows (fresh installs have none).
        $this->backfill('family_members');
        $this->backfill('vehicles');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('family_members', function (Blueprint $table) {
            $table->dropUnique(['uuid']);
            $table->dropColumn('uuid');
        });

        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropUnique(['uuid']);
            $table->dropColumn('uuid');
        });
    }

    private function backfill(string $table): void
    {
        $rows = DB::table($table)->whereNull('uuid')->get();

        foreach ($rows as $row) {
            DB::table($table)
                ->where('id', $row->id)
                ->update(['uuid' => (string) \Illuminate\Support\Str::uuid()]);
        }
    }
};
