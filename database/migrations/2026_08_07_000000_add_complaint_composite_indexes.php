<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('complaints', function (Blueprint $table) {
            $table->index(['society_id', 'status', 'assigned_to'], 'complaints_society_status_assigned_idx');
            $table->index(['society_id', 'priority'], 'complaints_society_priority_idx');
            $table->index(['society_id', 'category_id'], 'complaints_society_category_idx');
        });
    }

    public function down(): void
    {
        Schema::table('complaints', function (Blueprint $table) {
            $table->dropIndex('complaints_society_status_assigned_idx');
            $table->dropIndex('complaints_society_priority_idx');
            $table->dropIndex('complaints_society_category_idx');
        });
    }
};
