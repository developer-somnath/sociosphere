<?php

namespace App\Console\Commands;

use App\Exports\ReportExport;
use App\Models\Society;
use App\Models\User;
use App\Services\ReportingService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Excel as ExcelFormat;
use Maatwebsite\Excel\Facades\Excel;

/**
 * S4-3 scheduled delivery: generate a report file and email it to the
 * society's administrators. Supervised by the scheduler (see routes/console.php).
 */
class DeliverReportCommand extends Command
{
    protected $signature = 'report:deliver
        {type : Report type (collections|invoices|residents|complaints)}
        {--format=pdf : Delivery format (pdf|excel)}
        {--society= : Restrict to a single society id}
        {--from= : Inclusive start date (Y-m-d)}
        {--to= : Inclusive end date (Y-m-d)}';

    protected $description = 'Generate a report and email it to each society\'s administrators';

    public function handle(ReportingService $reports): int
    {
        $type = $this->argument('type');

        if (! in_array($type, ReportingService::TYPES, true)) {
            $this->error("Unknown report type: {$type}");
            return self::FAILURE;
        }

        $format = strtolower($this->option('format'));
        if (! in_array($format, ['pdf', 'excel'], true)) {
            $this->error("Unsupported format: {$format}");
            return self::FAILURE;
        }

        $from = $this->option('from');
        $to = $this->option('to');
        $societyId = $this->option('society') ? (int) $this->option('society') : null;

        $query = Society::query()->where('status', true);
        if ($societyId) {
            $query->where('id', $societyId);
        }

        $societies = $query->get();
        if ($societies->isEmpty()) {
            $this->warn('No active societies matched the delivery criteria.');
            return self::SUCCESS;
        }

        $delivered = 0;
        foreach ($societies as $society) {
            $admins = User::query()
                ->role('SocietyAdmin')
                ->where('society_id', $society->id)
                ->whereNotNull('email')
                ->get();

            if ($admins->isEmpty()) {
                $this->warn("Society {$society->name}: no admin recipients, skipping.");
                continue;
            }

            $data = $reports->build($type, $society->id, $from, $to);
            $filename = strtolower($type) . '-report-' . now()->format('Ymd-His');
            $path = $this->writeFile($reports, $type, $society->id, $from, $to, $format, $filename, $data);

            foreach ($admins as $admin) {
                Mail::raw(
                    "Your scheduled {$data['title']} is attached.",
                    function ($message) use ($admin, $path, $filename, $format, $data) {
                        $message->to($admin->email)
                            ->subject("{$data['title']} — " . now()->format('Y-m-d'));
                        $message->attach(Storage::path($path), [
                            'as' => $filename . '.' . $format,
                            'mime' => $format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        ]);
                    }
                );
            }

            $delivered++;
            $this->info("Delivered {$type} ({$format}) to {$admins->count()} admin(s) of {$society->name}.");
        }

        $this->info("Scheduled delivery complete: {$delivered} society(ies) processed.");
        return self::SUCCESS;
    }

    protected function writeFile(
        ReportingService $reports,
        string $type,
        ?int $societyId,
        ?string $from,
        ?string $to,
        string $format,
        string $filename,
        array $data
    ): string {
        $dir = 'reports/' . now()->format('Y/m');
        if ($format === 'pdf') {
            $pdf = Pdf::loadView('reports.report-pdf', [
                'title' => $data['title'],
                'headers' => $data['headers'],
                'rows' => $data['rows'],
                'generatedAt' => now()->format('Y-m-d H:i:s'),
            ]);
            $path = $dir . '/' . $filename . '.pdf';
            Storage::put($path, $pdf->output());
            return $path;
        }

        $path = $dir . '/' . $filename . '.xlsx';
        $content = Excel::download(new ReportExport($reports, $type, $societyId, $from, $to), $filename . '.xlsx', ExcelFormat::XLSX)
            ->getFile()
            ->getContents();
        Storage::put($path, $content);
        return $path;
    }
}
