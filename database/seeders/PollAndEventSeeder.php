<?php

namespace Database\Seeders;

use App\Models\Amenity;
use App\Models\CommunityEvent;
use App\Models\EventRsvp;
use App\Models\Poll;
use App\Models\PollOption;
use App\Models\PollVote;
use App\Models\Society;
use App\Models\User;
use Illuminate\Database\Seeder;

class PollAndEventSeeder extends Seeder
{
    public function run(): void
    {
        $society = Society::first();
        if (! $society) {
            return;
        }

        $admin = User::where('email', 'societyadmin@gvr.com')->first() ?? User::where('society_id', $society->id)->first();
        $residents = User::role('Resident')->where('society_id', $society->id)->get();
        $banquet = Amenity::where('society_id', $society->id)->where('name', 'like', '%Banquet%')->first();
        $rooftop = Amenity::where('society_id', $society->id)->where('name', 'like', '%Rooftop%')->first();

        // 1. Polls & Options
        $polls = [
            [
                'title' => 'EV Fast Charging Station Vendor Selection',
                'description' => 'We received quotations from three authorized EV infrastructure vendors for installing 6 DC fast-chargers in Basement B1. Please cast your vote.',
                'status' => 'active',
                'is_anonymous' => false,
                'allow_multiple' => false,
                'expires_at' => now()->addDays(14),
                'options' => [
                    'Tata Power EZ Charge (₹4.2 Lakh Capex + 8% Revenue Share)',
                    'Ather Grid 2.0 (Zero Capex + Dedicated 2-Wheeler / 4-Wheeler Bays)',
                    'ChargeZone Commercial Hub (₹3.8 Lakh Capex + Mobile App Integration)',
                ],
            ],
            [
                'title' => 'Society Building Exterior Painting Colour Scheme',
                'description' => 'Final color palette shortlisted by the architectural advisory committee for the upcoming 5-year cyclical painting contract.',
                'status' => 'active',
                'is_anonymous' => true,
                'allow_multiple' => false,
                'expires_at' => now()->addDays(20),
                'options' => [
                    'Modern Slate Grey & Pure Titanium White Accents',
                    'Warm Sandstone Beige & Earthy Terracotta Trim',
                    'Royal Champagne Gold & Deep Charcoal Finish',
                ],
            ],
            [
                'title' => 'Extension of Swimming Pool Operating Timings during Summer',
                'description' => 'Proposal to open morning session from 5:30 AM to 10:30 AM and evening session from 4:30 PM to 10:00 PM.',
                'status' => 'closed',
                'is_anonymous' => false,
                'allow_multiple' => false,
                'expires_at' => now()->subDays(5),
                'options' => [
                    'Approve Extended Timings',
                    'Keep Existing Timings (6:00 AM - 9:00 PM)',
                ],
            ],
        ];

        foreach ($polls as $pData) {
            $options = $pData['options'];
            unset($pData['options']);

            $poll = Poll::firstOrCreate(
                [
                    'society_id' => $society->id,
                    'title' => $pData['title'],
                ],
                array_merge($pData, ['creator_id' => $admin?->id])
            );

            $createdOptions = [];
            foreach ($options as $idx => $optText) {
                $createdOptions[] = PollOption::firstOrCreate(
                    [
                        'poll_id' => $poll->id,
                        'option_text' => $optText,
                    ],
                    [
                        'sort_order' => $idx,
                        'votes_count' => 0,
                    ]
                );
            }

            // Seed Votes from residents
            if ($residents->isNotEmpty() && ! empty($createdOptions)) {
                foreach ($residents->take(12) as $rIdx => $resident) {
                    $selectedOption = $createdOptions[$rIdx % count($createdOptions)];

                    $vote = PollVote::firstOrCreate(
                        [
                            'poll_id' => $poll->id,
                            'user_id' => $resident->id,
                            'poll_option_id' => $selectedOption->id,
                        ],
                        [
                            'society_id' => $society->id,
                        ]
                    );

                    if ($vote->wasRecentlyCreated) {
                        $selectedOption->increment('votes_count');
                    }
                }
            }
        }

        // 2. Community Events & RSVPs
        $events = [
            [
                'title' => 'Grand Diwali Mela & Cultural Musical Night',
                'description' => 'Join us with your family for an enchanting evening featuring live classical and fusion musical performances, curated food stalls, kids talent showcase, and prize distribution.',
                'venue_name' => 'Grand Banquet Hall & Central Courtyard',
                'amenity_id' => $banquet?->id,
                'start_time' => now()->addDays(15)->setTime(18, 30),
                'end_time' => now()->addDays(15)->setTime(23, 00),
                'max_attendees' => 300,
                'is_published' => true,
            ],
            [
                'title' => 'Sunday Morning Yoga & Mindful Breathing Workshop',
                'description' => 'Certified yoga guru Sri Ramkrishna Sharma will conduct a 90-minute session on Hatha Yoga, Pranayama, and stress relief for all age groups. Mats provided.',
                'venue_name' => 'Rooftop Sky Lounge & Lawn Deck',
                'amenity_id' => $rooftop?->id,
                'start_time' => now()->addDays(7)->setTime(7, 00),
                'end_time' => now()->addDays(7)->setTime(8, 30),
                'max_attendees' => 50,
                'is_published' => true,
            ],
            [
                'title' => 'Society Premier League (SPL) Cricket Tournament 2026',
                'description' => '8-a-side overarm box cricket tournament among Tower teams. Trophies for Best Batsman, Best Bowler, and Player of the Series.',
                'venue_name' => 'Multi-Sport Synthetic Turf Arena',
                'amenity_id' => null,
                'start_time' => now()->addDays(22)->setTime(8, 00),
                'end_time' => now()->addDays(22)->setTime(18, 00),
                'max_attendees' => 120,
                'is_published' => true,
            ],
        ];

        foreach ($events as $eData) {
            $event = CommunityEvent::firstOrCreate(
                [
                    'society_id' => $society->id,
                    'title' => $eData['title'],
                ],
                array_merge($eData, ['creator_id' => $admin?->id])
            );

            // Seed RSVPs
            if ($residents->isNotEmpty()) {
                foreach ($residents->take(8) as $uIdx => $user) {
                    $status = match ($uIdx % 3) {
                        0 => 'attending',
                        1 => 'attending',
                        2 => 'maybe',
                    };

                    EventRsvp::firstOrCreate(
                        [
                            'community_event_id' => $event->id,
                            'user_id' => $user->id,
                        ],
                        [
                            'society_id' => $society->id,
                            'status' => $status,
                            'guests_count' => rand(1, 3),
                            'remarks' => $status === 'attending' ? 'Attending with family' : null,
                        ]
                    );
                }
            }
        }
    }
}
