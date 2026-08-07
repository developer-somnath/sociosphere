<?php

namespace App\Notifications;

use App\Models\VisitorPass;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Sent to society staff (users with `visitor.update`) when a new gate pass
 * is requested, so approvers can action it from the bell (blueprint §2).
 */
class NewVisitorPassRequest extends Notification
{
    use Queueable;

    public function __construct(public VisitorPass $pass)
    {
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        $visitor = $this->pass->visitor;
        $flat = $this->pass->flat;

        return [
            'title' => 'New visitor pass request',
            'description' => sprintf(
                '%s requested a pass for %s — %s.',
                $visitor?->name ?? 'A visitor',
                $flat?->flat_no ?? 'a flat',
                $this->pass->purpose,
            ),
            'href' => route('visitors.index'),
            'type' => 'info',
        ];
    }
}
