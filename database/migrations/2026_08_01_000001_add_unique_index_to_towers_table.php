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
            // Unique tower name within a society.
            // Partial index (WHERE deleted_at IS NULL) so soft-deleted
            // towers do not block reusing a name.
            $table->unique(['society_id', 'name'])
                ->whereNull('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('towers', function (Blueprint $table) {
            $table->dropUnique(['society_id', 'name']);
        });
    }
};
