<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add allocation expiry ("valid till") to parking slots.
     */
    public function up(): void
    {
        Schema::table('parking_slots', function (Blueprint $table) {
            $table->timestamp('expires_at')->nullable()->after('rfid_tag');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('parking_slots', function (Blueprint $table) {
            $table->dropColumn('expires_at');
        });
    }
};
