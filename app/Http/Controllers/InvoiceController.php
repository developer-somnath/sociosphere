<?php

namespace App\Http\Controllers;

use App\Http\Requests\InvoiceRequest;
use App\Models\Flat;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    /**
     * Display a paginated, filterable directory of society invoices.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Invoice::class);

        $search = trim((string) $request->query('search', ''));
        $status = $request->query('status');
        $period = $request->query('period');
        $sortBy = in_array($request->query('sort_by'), ['invoice_number', 'billing_period', 'total_amount', 'status', 'created_at'], true)
            ? $request->query('sort_by')
            : null;
        $sortDir = strtolower((string) $request->query('sort_dir')) === 'asc' ? 'asc' : 'desc';

        $query = Invoice::query()
            ->with(['flat', 'flat.tower'])
            ->when($search !== '', function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                    ->orWhereHas('flat', function ($fq) use ($search) {
                        $fq->where('flat_no', 'like', "%{$search}%");
                    });
            })
            ->when($status !== null && $status !== '', function ($q) use ($status) {
                $q->where('status', $status);
            })
            ->when($period !== null && $period !== '', function ($q) use ($period) {
                $q->where('billing_period', $period);
            });

        $invoices = $query
            ->when($sortBy !== null, function ($q) use ($sortBy, $sortDir) {
                $q->orderBy($sortBy, $sortDir);
            })
            ->when($sortBy === null, function ($q) {
                $q->latest('id');
            })
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'total_billed' => Invoice::sum('total_amount'),
            'total_collected' => Invoice::sum('paid_amount'),
            'overdue_amount' => Invoice::where('status', 'Overdue')->sum('total_amount'),
            'unpaid_count' => Invoice::whereIn('status', ['Unpaid', 'Overdue', 'Partially Paid'])->count(),
        ];

        return Inertia::render('features/invoices/pages/index', [
            'invoices' => $invoices,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'status' => $status !== '' ? $status : null,
                'period' => $period !== '' ? $period : null,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
            'can' => [
                'create' => $request->user()->hasPermissionTo('invoice.create'),
                'update' => $request->user()->hasPermissionTo('invoice.update'),
                'delete' => $request->user()->hasPermissionTo('invoice.delete'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new invoice with line items.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', Invoice::class);

        $flats = Flat::query()
            ->with(['tower'])
            ->orderBy('flat_no')
            ->get()
            ->map(fn ($f) => [
                'id' => $f->id,
                'label' => "Flat {$f->flat_no} " . ($f->tower ? "({$f->tower->name})" : ""),
                'area_sqft' => $f->area_sqft ?? 1000,
            ]);

        return Inertia::render('features/invoices/pages/create', [
            'flats' => $flats,
        ]);
    }

    /**
     * Store a newly created invoice with line items.
     */
    public function store(InvoiceRequest $request): RedirectResponse
    {
        $this->authorize('create', Invoice::class);

        $societyId = $request->user()->society_id;
        $itemsData = $request->input('items', []);

        $subtotal = 0;
        foreach ($itemsData as $item) {
            $subtotal += ($item['unit_price'] * $item['quantity']);
        }

        $taxAmount = (float) $request->input('tax_amount', 0);
        $discountAmount = (float) $request->input('discount_amount', 0);
        $totalAmount = max(0, $subtotal + $taxAmount - $discountAmount);

        $nextNum = Invoice::where('society_id', $societyId)->count() + 1;
        $invoiceNumber = 'INV-' . date('Ym') . '-' . str_pad((string) $nextNum, 4, '0', STR_PAD_LEFT);

        $invoice = Invoice::create([
            'society_id' => $societyId,
            'flat_id' => $request->input('flat_id'),
            'invoice_number' => $invoiceNumber,
            'invoice_no' => $invoiceNumber,
            'billing_period' => $request->input('billing_period'),
            'billing_month' => (int) date('m', strtotime($request->input('issue_date'))),
            'billing_year' => (int) date('Y', strtotime($request->input('issue_date'))),
            'issue_date' => $request->input('issue_date'),
            'due_date' => $request->input('due_date'),
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'discount_amount' => $discountAmount,
            'total_amount' => $totalAmount,
            'paid_amount' => 0,
            'status' => 'Unpaid',
            'notes' => $request->input('notes'),
            'generated_by' => $request->user()->id,
        ]);

        foreach ($itemsData as $item) {
            InvoiceItem::create([
                'society_id' => $societyId,
                'invoice_id' => $invoice->id,
                'title' => $item['title'],
                'description' => $item['title'],
                'calculation_type' => $item['calculation_type'],
                'unit_price' => $item['unit_price'],
                'quantity' => $item['quantity'],
                'amount' => $item['unit_price'] * $item['quantity'],
            ]);
        }

        app(ActivityLogger::class)->log(
            action: 'create',
            module: 'Invoice',
            entityType: Invoice::class,
            entityId: (string) $invoice->id,
            remarks: "Generated maintenance invoice {$invoice->invoice_number} (Amount: {$invoice->total_amount})"
        );

        return redirect()
            ->route('invoices.index')
            ->with('success', "Invoice {$invoice->invoice_number} generated successfully.");
    }

    /**
     * Display the specified invoice with printable receipt view.
     */
    public function show(Request $request, Invoice $invoice): Response
    {
        $this->authorize('view', $invoice);

        $invoice->load(['flat', 'flat.tower', 'items', 'payments', 'society']);

        return Inertia::render('features/invoices/pages/show', [
            'invoice' => $invoice,
        ]);
    }

    /**
     * Remove (soft-delete) the specified invoice.
     */
    public function destroy(Request $request, Invoice $invoice): RedirectResponse
    {
        $this->authorize('delete', $invoice);

        $invoice->delete();

        app(ActivityLogger::class)->log(
            action: 'delete',
            module: 'Invoice',
            entityType: Invoice::class,
            entityId: (string) $invoice->id,
            remarks: "Cancelled and deleted invoice {$invoice->invoice_number}"
        );

        return redirect()
            ->route('invoices.index')
            ->with('success', 'Invoice deleted successfully.');
    }
}
