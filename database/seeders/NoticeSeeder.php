<?php

namespace Database\Seeders;

use App\Models\Notice;
use App\Models\NoticeAcknowledgement;
use App\Models\Resident;
use App\Models\Society;
use App\Models\SocietyDocument;
use App\Models\User;
use Illuminate\Database\Seeder;

class NoticeSeeder extends Seeder
{
    public function run(): void
    {
        $society = Society::first();
        if (! $society) {
            return;
        }

        $admin = User::where('email', 'societyadmin@gvr.com')->first() ?? User::where('society_id', $society->id)->first();
        $residents = Resident::where('society_id', $society->id)->get();

        // 1. Notices
        $notices = [
            [
                'title' => 'Notice of 14th Annual General Meeting (AGM) 2026',
                'category' => 'general',
                'is_pinned' => true,
                'target_audience' => 'all',
                'description' => "Dear Respected Members,\n\nThe 14th Annual General Body Meeting of Green Valley Residency CHS will be held on Sunday, September 20, 2026, at 10:30 AM in the Grand Banquet Hall.\n\nAgenda:\n1. Confirmation of minutes of previous AGM.\n2. Presentation and adoption of Audited Financial Accounts FY 2025-26.\n3. Approval of proposed budget for Rooftop Solar Plant installation.\n4. Appointment of Statutory Auditor for FY 2026-27.\n\nAll flat owners are requested to attend promptly.",
                'publish_from' => now()->subDays(5)->format('Y-m-d'),
                'publish_to' => now()->addDays(25)->format('Y-m-d'),
            ],
            [
                'title' => 'Grand Diwali Mela & Cultural Evening Celebration',
                'category' => 'event',
                'is_pinned' => true,
                'target_audience' => 'all',
                'description' => "Celebrate Diwali with your society family! Join us on November 1, 2026, from 6:30 PM onwards at the Clubhouse lawns for live music, food stalls, kids fancy dress competition, and eco-friendly fireworks display. Registration for stalls open at society office.",
                'publish_from' => now()->subDays(2)->format('Y-m-d'),
                'publish_to' => now()->addDays(60)->format('Y-m-d'),
            ],
            [
                'title' => 'Pre-Monsoon Terrace Waterproofing & Water Tank Cleaning Schedule',
                'category' => 'maintenance',
                'is_pinned' => false,
                'target_audience' => 'all',
                'description' => "Please be informed that overhead domestic and flushing water tanks of Tower A and Tower B will undergo mechanised chemical cleaning and UV disinfection on Thursday from 9:00 AM to 5:00 PM. Water supply will be regulated accordingly. Please store adequate water.",
                'publish_from' => now()->subDays(1)->format('Y-m-d'),
                'publish_to' => now()->addDays(10)->format('Y-m-d'),
            ],
            [
                'title' => 'Strict Guidelines: Mandatory Visitor Verification via SocioSphere App',
                'category' => 'security',
                'is_pinned' => false,
                'target_audience' => 'all',
                'description' => "For the safety of all residents, security guards have been instructed strictly not to allow any delivery executive (Swiggy/Zomato/Amazon/Blinkit) without resident digital gate pass approval. Kindly pre-approve your visitors through the SocioSphere app.",
                'publish_from' => now()->subDays(10)->format('Y-m-d'),
                'publish_to' => now()->addDays(90)->format('Y-m-d'),
            ],
        ];

        // Acknowledge notice by first 5 resident users
        $residentUsers = User::role('Resident')->where('society_id', $society->id)->get();
        foreach ($notices as $nData) {
            $notice = Notice::firstOrCreate(
                [
                    'society_id' => $society->id,
                    'title' => $nData['title'],
                ],
                array_merge($nData, ['created_by' => $admin?->id])
            );

            foreach ($residentUsers->take(5) as $resUser) {
                NoticeAcknowledgement::firstOrCreate(
                    [
                        'notice_id' => $notice->id,
                        'user_id' => $resUser->id,
                    ],
                    [
                        'acknowledged_at' => now()->subHours(rand(1, 48)),
                    ]
                );
            }
        }

        // 2. Society Documents
        $documents = [
            [
                'title' => 'Model Bye-Laws of Cooperative Housing Society (Updated 2026)',
                'category' => 'Rules & Bye-Laws',
                'file_name' => 'Society_ByeLaws_2026.pdf',
                'file_path' => 'documents/Society_ByeLaws_2026.pdf',
                'file_size' => 2457600,
                'mime_type' => 'application/pdf',
                'is_public' => true,
            ],
            [
                'title' => 'Annual Statutory Financial Audit & Balance Sheet FY25-26',
                'category' => 'Financial Reports',
                'file_name' => 'Financial_Audit_Report_FY25_26.pdf',
                'file_path' => 'documents/Financial_Audit_Report_FY25_26.pdf',
                'file_size' => 4194304,
                'mime_type' => 'application/pdf',
                'is_public' => false,
            ],
            [
                'title' => 'Fire Safety NOC & Compliance Certificate from Municipal Fire Brigade',
                'category' => 'Compliance & NOC',
                'file_name' => 'Fire_Safety_NOC_2026_2027.pdf',
                'file_path' => 'documents/Fire_Safety_NOC_2026_2027.pdf',
                'file_size' => 1048576,
                'mime_type' => 'application/pdf',
                'is_public' => true,
            ],
            [
                'title' => 'Schindler Passenger & Service Elevator Safety Audit Certificate',
                'category' => 'Maintenance Contracts',
                'file_name' => 'Elevator_Safety_Certificate_2026.pdf',
                'file_path' => 'documents/Elevator_Safety_Certificate_2026.pdf',
                'file_size' => 819200,
                'mime_type' => 'application/pdf',
                'is_public' => true,
            ],
        ];

        $samplePdf = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 595 842]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000102 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n";
        foreach ($documents as $doc) {
            SocietyDocument::firstOrCreate(
                [
                    'society_id' => $society->id,
                    'title' => $doc['title'],
                ],
                array_merge($doc, ['uploaded_by' => $admin?->id])
            );

            if (! \Illuminate\Support\Facades\Storage::disk('local')->exists($doc['file_path'])) {
                \Illuminate\Support\Facades\Storage::disk('local')->put($doc['file_path'], $samplePdf);
            }
        }
    }
}
