<?php

namespace App\Http\Controllers;

use App\Exports\ReportExport;
use App\Services\ReportingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Excel as ExcelFormat;
use Barryvdh\DomPDF\Facade\Pdf;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class ReportController extends Controller
{
    public function __construct(protected ReportingService $reports) {}

    /**
     * Reporting hub with role-aware dashboards (S4-3 / Phase 21).
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', \App\Models\Payment::class);

        $user = $request->user();
        $societyId = $user->isSuperAdmin() ? null : $user->society_id;

        return Inertia::render('features/reports/pages/index', [
            'types' => $this->reports->availableTypes(),
            'role' => $user->isSuperAdmin() ? 'superadmin' : 'society',
            'societyName' => $user->society?->name,
        ]);
    }

    /**
     * Export a report in the requested format (csv | excel | pdf).
     */
    public function export(Request $request)
    {
        $this->authorize('viewAny', \App\Models\Payment::class);

        $validator = Validator::make($request->query(), [
            'type' => ['required', 'string', 'in:' . implode(',', ReportingService::TYPES)],
            'format' => ['required', 'string', 'in:csv,excel,pdf'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator);
        }

        $user = $request->user();
        $societyId = $user->isSuperAdmin() ? null : $user->society_id;

        $type = $request->query('type');
        $format = $request->query('format');
        $from = $request->query('from');
        $to = $request->query('to');

        $data = $this->reports->build($type, $societyId, $from, $to);
        $filename = strtolower($type) . '-report-' . now()->format('Ymd-His');

        if ($format === 'csv') {
            return $this->toCsv($data, $filename);
        }

        if ($format === 'excel') {
            return (new ReportExport($this->reports, $type, $societyId, $from, $to))
                ->download($filename . '.xlsx', ExcelFormat::XLSX);
        }

        // PDF
        $pdf = Pdf::loadView('reports.report-pdf', [
            'title' => $data['title'],
            'headers' => $data['headers'],
            'rows' => $data['rows'],
            'generatedAt' => now()->format('Y-m-d H:i:s'),
        ]);

        return $pdf->download($filename . '.pdf');
    }

    protected function toCsv(array $data, string $filename): SymfonyResponse
    {
        $callback = function () use ($data) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, array_values($data['headers']));
            foreach ($data['rows'] as $row) {
                fputcsv($out, array_map(fn ($k) => $row[$k] ?? '', array_keys($data['headers'])));
            }
            fclose($out);
        };

        return response()->streamDownload($callback, $filename . '.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
