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
        Schema::table('towers', function (Blueprint $table) {
            $table->index(['society_id', 'name'], 'towers_society_id_name_index');
        });

        Schema::table('flats', function (Blueprint $table) {
            $table->index(['society_id', 'tower_id', 'occupancy_status'], 'flats_society_tower_status_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('towers', function (Blueprint $table) {
            $table->dropIndex('towers_society_id_name_index');
        });

        Schema::table('flats', function (Blueprint $table) {
            $table->dropIndex('flats_society_tower_status_index');
        });
    }
};
