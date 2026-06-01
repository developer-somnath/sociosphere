<?php

namespace Database\Seeders;

use App\Models\ComplaintCategory;
use Illuminate\Database\Seeder;

class ComplaintCategorySeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            'Electrical',
            'Plumbing',
            'Lift',
            'Cleaning',
            'Security',
            'Parking'
        ] as $category) {

            ComplaintCategory::create([
                'society_id' => 1,
                'name' => $category,
            ]);
        }
    }
}
