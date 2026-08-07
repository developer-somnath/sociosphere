<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Mark a single notification as read (bell item click — blueprint §2).
     */
    public function markRead(Request $request, string $notification): RedirectResponse
    {
        $request->user()
            ->notifications()
            ->whereKey($notification)
            ->firstOrFail()
            ->markAsRead();

        return back();
    }

    /**
     * Mark every unread notification as read ("Mark all as read").
     */
    public function markAllRead(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return back();
    }
}
