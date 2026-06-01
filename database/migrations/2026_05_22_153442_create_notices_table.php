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
        Schema::create('notices', function (Blueprint $table) {

            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('society_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('title');

            $table->longText('description');

            $table->date('publish_from')
                ->nullable();

            $table->date('publish_to')
                ->nullable();

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notices');
    }
};
