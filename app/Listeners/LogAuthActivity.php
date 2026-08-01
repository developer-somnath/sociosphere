<?php

namespace App\Listeners;

use App\Services\ActivityLogger;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Registered;

/**
 * Centralized audit logging for authentication lifecycle events:
 * login, logout, failed attempts, password resets and registrations.
 */
class LogAuthActivity
{
    public function __construct(
        private readonly ActivityLogger $logger,
    ) {}

    public function handle(object $event): void
    {
        match (true) {
            $event instanceof Login => $this->login($event->user),
            $event instanceof Logout => $this->logout($event->user),
            $event instanceof Failed => $this->failed($event->credentials),
            $event instanceof PasswordReset => $this->passwordReset($event->user),
            $event instanceof Registered => $this->registered($event->user),
            default => null,
        };
    }

    private function login($user): void
    {
        $this->logger->log(
            action: 'login',
            module: 'Auth',
            entityType: $user ? get_class($user) : null,
            entityId: $user ? (string) $user->getKey() : null,
            causerId: $user?->getKey(),
            societyId: $user?->society_id,
            remarks: 'User signed in',
        );
    }

    private function logout($user): void
    {
        $this->logger->log(
            action: 'logout',
            module: 'Auth',
            entityType: $user ? get_class($user) : null,
            entityId: $user ? (string) $user->getKey() : null,
            causerId: $user?->getKey(),
            societyId: $user?->society_id,
            remarks: 'User signed out',
        );
    }

    private function failed(array $credentials): void
    {
        $this->logger->log(
            action: 'failed',
            module: 'Auth',
            properties: ['email' => $credentials['email'] ?? null],
            remarks: 'Failed sign-in attempt',
        );
    }

    private function passwordReset($user): void
    {
        $this->logger->log(
            action: 'password_reset',
            module: 'Auth',
            entityType: $user ? get_class($user) : null,
            entityId: $user ? (string) $user->getKey() : null,
            causerId: $user?->getKey(),
            societyId: $user?->society_id,
            remarks: 'Password reset',
        );
    }

    private function registered($user): void
    {
        $this->logger->log(
            action: 'registered',
            module: 'Auth',
            entityType: $user ? get_class($user) : null,
            entityId: $user ? (string) $user->getKey() : null,
            causerId: $user?->getKey(),
            societyId: $user?->society_id,
            remarks: 'New account registered',
        );
    }
}
