<?php

namespace Database\Seeders;

use App\Models\ComplaintCategory;
use App\Models\Society;
use Illuminate\Database\Seeder;

class ComplaintCategorySeeder extends Seeder
{
    public function run(): void
    {
        $society = Society::first();
        if (! $society) {
            return;
        }

        $categories = [
            'Plumbing & Drainage',
            'Electrical & Power Backup',
            'Elevator / Lift Service',
            'Civil & Structural Repairs',
            'Carpentry & Masonry',
            'Housekeeping & Waste Management',
            'Security & Access Control',
            'Pest Control',
            'Intercom & Internet Cable',
            'Noise & General Nuisance',
        ];

        foreach ($categories as $cat) {
            ComplaintCategory::firstOrCreate(
                [
                    'society_id' => $society->id,
                    'name' => $cat,
                ]
            );
        }
    }
}
