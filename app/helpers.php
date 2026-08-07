<?php

use Illuminate\Support\Facades\Auth;

if (!function_exists('society_id')) {

    function society_id(): ?int
    {
        if (app()->bound('society_id')) {
            return (int) app('society_id');
        }

        $user = Auth::user();

        if ($user?->society_id) {
            return (int) $user->society_id;
        }

        if (session()->has('current_society_id')) {
            return (int) session('current_society_id');
        }

        return null;
    }
}
