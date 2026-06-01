<?php

namespace Database\Seeders;

use App\Models\Notice;
use Illuminate\Database\Seeder;

class NoticeSeeder extends Seeder
{
    public function run(): void
    {
        Notice::factory(10)->create([
            'society_id' => 1,
            'created_by' => 2,
        ]);
    }
}
