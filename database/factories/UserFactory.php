<?php

namespace Database\Factories;

use App\Models\Society;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected static ?string $password = null;

    public function definition(): array
    {
        return [
            'society_id' => Society::query()->inRandomOrder()->value('id'),
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->numerify('##########'),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'is_active' => true,
            'last_login_at' => null,
        ];
    }

    public function superAdmin(): static
    {
        return $this->state(fn () => [
            'society_id' => null,
            'name' => 'Super Admin',
            'email' => 'admin@sociosphere.com',
            'phone' => '9999999999',
        ])->afterCreating(function ($user) {
            $user->syncRoles(['SuperAdmin']);
        });
    }

    public function societyAdmin(int $societyId): static
    {
        return $this->state(fn () => [
            'society_id' => $societyId,
            'name' => 'Society Admin',
            'email' => 'societyadmin@gvr.com',
            'phone' => '8888888888',
        ])->afterCreating(function ($user) {
            $user->syncRoles(['SocietyAdmin']);
        });
    }

    public function treasurer(int $societyId): static
    {
        return $this->state(fn () => [
            'society_id' => $societyId,
            'name' => 'Treasurer',
            'email' => 'treasurer@gvr.com',
            'phone' => '7777777777',
        ])->afterCreating(function ($user) {
            $user->syncRoles(['Treasurer']);
        });
    }

    public function resident(int $societyId): static
    {
        return $this->state(fn () => [
            'society_id' => $societyId,
        ])->afterCreating(function ($user) {
            $user->syncRoles(['Resident']);
        });
    }

    public function securityGuard(int $societyId): static
    {
        return $this->state(fn () => [
            'society_id' => $societyId,
            'name' => 'Security Guard',
            'email' => 'security@gvr.com',
            'phone' => '6666666666',
        ])->afterCreating(function ($user) {
            $user->syncRoles(['SecurityGuard']);
        });
    }

    public function maintenanceStaff(int $societyId): static
    {
        return $this->state(fn () => [
            'society_id' => $societyId,
            'name' => 'Maintenance Staff',
            'email' => 'maintenance@gvr.com',
            'phone' => '5555555555',
        ])->afterCreating(function ($user) {
            $user->syncRoles(['MaintenanceStaff']);
        });
    }
}
