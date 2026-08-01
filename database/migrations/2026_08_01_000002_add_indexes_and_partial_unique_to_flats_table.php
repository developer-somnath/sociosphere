<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add an occupancy_status index and convert the (tower_id, flat_no)
     * unique constraint into a partial unique index so soft-deleted flats
     * don't block reusing a flat number.
     */
    public function up(): void
    {
        Schema::table('flats', function (Blueprint $table) {
            $table->index('occupancy_status');
            $table->dropUnique(['tower_id', 'flat_no']);
        });

        Schema::table('flats', function (Blueprint $table) {
            $table->unique(['tower_id', 'flat_no'])->whereNull('deleted_at');
        });
    }

    /**
     * Reverse the changes.
     */
    public function down(): void
    {
        Schema::table('flats', function (Blueprint $table) {
            $table->dropIndex(['occupancy_status']);
            $table->dropUnique(['tower_id', 'flat_no']);
        });

        Schema::table('flats', function (Blueprint $table) {
            $table->unique(['tower_id', 'flat_no']);
        });
    }
};
