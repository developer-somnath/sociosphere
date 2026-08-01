<?php

namespace App\Providers;

use App\Listeners\LogAuthActivity;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Registered;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Case-insensitive LIKE that works on both Postgres (production)
        // and sqlite (tests). Postgres uses ILIKE; other drivers use LIKE.
        Builder::macro('whereLike', function (string $column, string $value) {
            $driver = $this->getConnection()->getDriverName();

            return $this->where($column, $driver === 'pgsql' ? 'ilike' : 'like', "%{$value}%");
        });

        Builder::macro('orWhereLike', function (string $column, string $value) {
            $driver = $this->getConnection()->getDriverName();

            return $this->orWhere($column, $driver === 'pgsql' ? 'ilike' : 'like', "%{$value}%");
        });

        // Centralized audit logging for the authentication lifecycle.
        Event::listen(Login::class, LogAuthActivity::class);
        Event::listen(Logout::class, LogAuthActivity::class);
        Event::listen(Failed::class, LogAuthActivity::class);
        Event::listen(PasswordReset::class, LogAuthActivity::class);
        Event::listen(Registered::class, LogAuthActivity::class);
    }
}
