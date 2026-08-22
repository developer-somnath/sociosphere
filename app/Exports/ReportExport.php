<?php

namespace App\Exports;

use App\Services\ReportingService;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;

/**
 * Generic report export backed by the ReportingService dataset.
 * Renders to an Excel worksheet (S4-3 / Phase 22).
 */
class ReportExport implements FromCollection, WithHeadings, WithTitle
{
    public function __construct(
        protected ReportingService $service,
        protected string $type,
        protected ?int $societyId,
        protected ?string $from = null,
        protected ?string $to = null,
    ) {}

    public function collection()
    {
        $data = $this->service->build($this->type, $this->societyId, $this->from, $this->to);

        return collect($data['rows'])->map(function (array $row) use ($data) {
            $mapped = [];
            foreach (array_keys($data['headers']) as $key) {
                $mapped[$data['headers'][$key]] = $row[$key] ?? '';
            }

            return $mapped;
        });
    }

    public function headings(): array
    {
        $data = $this->service->build($this->type, $this->societyId, $this->from, $this->to);

        return array_values($data['headers']);
    }

    public function title(): string
    {
        return $this->service->build($this->type, $this->societyId, $this->from, $this->to)['title'];
    }
}
