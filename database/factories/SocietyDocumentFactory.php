<?php

namespace Database\Factories;

use App\Models\SocietyDocument;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SocietyDocumentFactory extends Factory
{
    protected $model = SocietyDocument::class;

    public function definition(): array
    {
        return [
            'society_id' => 1,
            'title' => fake()->sentence(4),
            'category' => fake()->randomElement(['Bylaws', 'Financial', 'Legal', 'Maintenance', 'General']),
            'file_path' => 'documents/' . fake()->uuid() . '.pdf',
            'file_name' => fake()->word() . '.pdf',
            'file_size' => fake()->numberBetween(1000, 5000000),
            'mime_type' => 'application/pdf',
            'is_public' => fake()->boolean(50),
            'uploaded_by' => User::factory(),
        ];
    }
}