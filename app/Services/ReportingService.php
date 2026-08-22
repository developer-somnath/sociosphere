<?php

namespace App\Services;

use App\Models\Complaint;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Resident;
use App\Models\Scopes\SocietyScope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

/**
 * Reporting engine (S4-3 / Phases 21-22).
 *
 * Produces the canonical dataset for each supported report type. The dataset
 * is a flat list of associative arrays (rows) plus a header map, so the same
 * data can be rendered to CSV, Excel, or a PDF view without duplication.
 *
 * Society scoping is applied consistently: super admins may pass an explicit
 * society_id (or omit it for a portfolio-wide report); society-bound users
 * are always constrained to their own society.
 */
class ReportingService
{
    public const TYPES = ['collections', 'invoices', 'residents', 'complaints'];

    /**
     * @return array<int, array{key: string, label: string}>
     */
    public function availableTypes(): array
    {
        return [
            ['key' => 'collections', 'label' => 'Collections'],
            ['key' => 'invoices', 'label' => 'Invoices'],
            ['key' => 'residents', 'label' => 'Residents'],
            ['key' => 'complaints', 'label' => 'Complaints'],
        ];
    }

    /**
     * Build the report dataset.
     *
     * @return array{headers: array<string,string>, rows: array<int, array<string, mixed>>, title: string}
     */
    public function build(string $type, ?int $societyId, ?string $from = null, ?string $to = null): array
    {
        return match ($type) {
            'collections' => $this->collections($societyId, $from, $to),
            'invoices' => $this->invoices($societyId, $from, $to),
            'residents' => $this->residents($societyId),
            'complaints' => $this->complaints($societyId, $from, $to),
            default => throw new \InvalidArgumentException("Unknown report type: {$type}"),
        };
    }

    /**
     * @return array{headers: array<string,string>, rows: array<int, array<string, mixed>>, title: string}
     */
    protected function collections(?int $societyId, ?string $from, ?string $to): array
    {
        $query = $this->scope(Payment::query()->with(['invoice', 'invoice.flat', 'invoice.flat.tower', 'society']), $societyId)
            ->where('status', 'Completed');

        $this->applyDateRange($query, 'paid_at', $from, $to);

        $rows = $query->orderByDesc('paid_at')->get()->map(function (Payment $p) {
            return [
                'payment_number' => $p->payment_number,
                'invoice_no' => $p->invoice?->invoice_number,
                'society' => $p->society?->name,
                'flat_no' => $p->invoice?->flat?->flat_no,
                'tower' => $p->invoice?->flat?->tower?->name,
                'amount' => (float) $p->amount,
                'method' => $p->payment_method,
                'transaction_reference' => $p->transaction_reference,
                'paid_at' => $p->paid_at?->format('Y-m-d H:i:s'),
            ];
        })->all();

        return [
            'title' => 'Collections Report',
            'headers' => [
                'payment_number' => 'Receipt No',
                'invoice_no' => 'Invoice No',
                'society' => 'Society',
                'flat_no' => 'Flat',
                'tower' => 'Tower',
                'amount' => 'Amount',
                'method' => 'Method',
                'transaction_reference' => 'Reference',
                'paid_at' => 'Paid At',
            ],
            'rows' => $rows,
        ];
    }

    /**
     * @return array{headers: array<string,string>, rows: array<int, array<string, mixed>>, title: string}
     */
    protected function invoices(?int $societyId, ?string $from, ?string $to): array
    {
        $query = $this->scope(Invoice::query()->with(['flat', 'flat.tower', 'society']), $societyId);
        $this->applyDateRange($query, 'issue_date', $from, $to);

        $rows = $query->orderByDesc('issue_date')->get()->map(function (Invoice $inv) {
            return [
                'invoice_number' => $inv->invoice_number,
                'society' => $inv->society?->name,
                'flat_no' => $inv->flat?->flat_no,
                'tower' => $inv->flat?->tower?->name,
                'billing_period' => $inv->billing_period,
                'issue_date' => $inv->issue_date?->format('Y-m-d'),
                'due_date' => $inv->due_date?->format('Y-m-d'),
                'total_amount' => (float) $inv->total_amount,
                'paid_amount' => (float) $inv->paid_amount,
                'balance' => (float) $inv->total_amount - (float) $inv->paid_amount,
                'status' => $inv->status,
            ];
        })->all();

        return [
            'title' => 'Invoices Report',
            'headers' => [
                'invoice_number' => 'Invoice No',
                'society' => 'Society',
                'flat_no' => 'Flat',
                'tower' => 'Tower',
                'billing_period' => 'Period',
                'issue_date' => 'Issued',
                'due_date' => 'Due',
                'total_amount' => 'Total',
                'paid_amount' => 'Paid',
                'balance' => 'Balance',
                'status' => 'Status',
            ],
            'rows' => $rows,
        ];
    }

    /**
     * @return array{headers: array<string,string>, rows: array<int, array<string, mixed>>, title: string}
     */
    protected function residents(?int $societyId): array
    {
        $query = $this->scope(Resident::query()->with(['flat', 'flat.tower']), $societyId);

        $rows = $query->orderBy('name')->get()->map(function (Resident $r) {
            return [
                'name' => $r->name,
                'email' => $r->email,
                'phone' => $r->phone,
                'flat_no' => $r->flat?->flat_no,
                'tower' => $r->flat?->tower?->name,
                'status' => $r->status,
                'is_owner' => $r->is_owner ? 'Yes' : 'No',
                'created_at' => $r->created_at?->format('Y-m-d'),
            ];
        })->all();

        return [
            'title' => 'Residents Report',
            'headers' => [
                'name' => 'Name',
                'email' => 'Email',
                'phone' => 'Phone',
                'flat_no' => 'Flat',
                'tower' => 'Tower',
                'status' => 'Status',
                'is_owner' => 'Owner',
                'created_at' => 'Joined',
            ],
            'rows' => $rows,
        ];
    }

    /**
     * @return array{headers: array<string,string>, rows: array<int, array<string, mixed>>, title: string}
     */
    protected function complaints(?int $societyId, ?string $from, ?string $to): array
    {
        $query = $this->scope(Complaint::query()->with(['category', 'flat', 'assignee', 'society']), $societyId);
        $this->applyDateRange($query, 'created_at', $from, $to);

        $rows = $query->orderByDesc('created_at')->get()->map(function (Complaint $c) {
            return [
                'ticket_no' => $c->ticket_no,
                'society' => $c->society?->name,
                'category' => $c->category?->name,
                'subject' => $c->subject,
                'flat_no' => $c->flat?->flat_no,
                'status' => $c->status,
                'priority' => $c->priority,
                'assigned_to' => $c->assignee?->name,
                'created_at' => $c->created_at?->format('Y-m-d H:i:s'),
            ];
        })->all();

        return [
            'title' => 'Complaints Report',
            'headers' => [
                'ticket_no' => 'Ticket',
                'society' => 'Society',
                'category' => 'Category',
                'subject' => 'Subject',
                'flat_no' => 'Flat',
                'status' => 'Status',
                'priority' => 'Priority',
                'assigned_to' => 'Assigned To',
                'created_at' => 'Created',
            ],
            'rows' => $rows,
        ];
    }

    protected function scope(Builder $query, ?int $societyId): Builder
    {
        return $query->withoutGlobalScope(SocietyScope::class)
            ->when($societyId !== null, fn (Builder $q) => $q->where('society_id', $societyId));
    }

    protected function applyDateRange(Builder $query, string $column, ?string $from, ?string $to): void
    {
        if ($from) {
            $query->whereDate($column, '>=', Carbon::parse($from)->startOfDay());
        }
        if ($to) {
            $query->whereDate($column, '<=', Carbon::parse($to)->endOfDay());
        }
    }
}
