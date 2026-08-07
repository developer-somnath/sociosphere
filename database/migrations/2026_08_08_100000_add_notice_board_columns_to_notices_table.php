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
        Schema::table('notices', function (Blueprint $table) {
            $table->string('category')->nullable()->after('title');
            $table->boolean('is_pinned')->default(false)->after('category');
            $table->string('target_audience')->default('All')->after('is_pinned');
            $table->json('attachments')->nullable()->after('target_audience');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notices', function (Blueprint $table) {
            $table->dropColumn(['category', 'is_pinned', 'target_audience', 'attachments']);
        });
    }
};