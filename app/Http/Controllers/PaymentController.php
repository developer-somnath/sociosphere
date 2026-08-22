<?php

namespace App\Http\Controllers;

use App\Http\Requests\PaymentRequest;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\ActivityLogger;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentService $paymentService)
    {
    }

    /**
     * Display a paginated payment collections ledger.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Payment::class);

        $search = trim((string) $request->query('search', ''));
        $method = $request->query('method');
        $sortBy = in_array($request->query('sort_by'), ['payment_number', 'amount', 'payment_method', 'paid_at'], true)
            ? $request->query('sort_by')
            : null;
        $sortDir = strtolower((string) $request->query('sort_dir')) === 'asc' ? 'asc' : 'desc';

        $query = Payment::query()
            ->with(['invoice', 'flat', 'flat.tower'])
            ->when($search !== '', function ($q) use ($search) {
                $q->where('payment_number', 'like', "%{$search}%")
                    ->orWhere('transaction_reference', 'like', "%{$search}%");
            })
            ->when($method !== null && $method !== '', function ($q) use ($method) {
                $q->where('payment_method', $method);
            });

        $payments = $query
            ->when($sortBy !== null, function ($q) use ($sortBy, $sortDir) {
                $q->orderBy($sortBy, $sortDir);
            })
            ->when($sortBy === null, function ($q) {
                $q->latest('id');
            })
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'total_collected' => Payment::where('status', 'Completed')->sum('amount'),
            'online_collected' => Payment::whereIn('payment_method', ['UPI', 'NetBanking', 'Credit Card'])->sum('amount'),
            'cash_collected' => Payment::where('payment_method', 'Cash')->sum('amount'),
            'cheque_collected' => Payment::where('payment_method', 'Cheque')->sum('amount'),
        ];

        return Inertia::render('features/payments/pages/index', [
            'payments' => $payments,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'method' => $method !== '' ? $method : null,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
            'can' => [
                'create' => $request->user()->hasPermissionTo('collection.create'),
            ],
        ]);
    }

    /**
     * Store a newly recorded payment collection.
     */
    public function store(PaymentRequest $request): RedirectResponse
    {
        $this->authorize('create', Payment::class);

        $payment = $this->paymentService->record([
            'invoice_id' => $request->input('invoice_id'),
            'amount' => (float) $request->input('amount'),
            'payment_method' => $request->input('payment_method'),
            'transaction_reference' => $request->input('transaction_reference'),
            'remarks' => $request->input('remarks'),
            'gateway' => 'ledger',
        ]);

        return redirect()
            ->route('payments.index')
            ->with('success', "Payment {$payment->payment_number} recorded successfully.");
    }

    /**
     * Downloadable digital receipt for a recorded payment (S4-2 / Phase 18).
     */
    public function receipt(Request $request, Payment $payment)
    {
        $this->authorize('view', $payment);

        $data = $this->paymentService->receiptData($payment);

        $filename = "receipt-{$payment->payment_number}.html";
        $headers = [
            'Content-Type' => 'text/html; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->make($this->renderReceiptHtml($data), 200, $headers);
    }

    /**
     * Render a self-contained, printable HTML receipt.
     *
     * @param array<string, mixed> $data
     */
    protected function renderReceiptHtml(array $data): string
    {
        $rows = implode('', array_map(
            fn ($k, $v) => "<tr><td class=\"label\">{$k}</td><td class=\"value\">{$v}</td></tr>",
            array_keys($data),
            array_values($data)
        ));

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Receipt {$data['receipt_no']}</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; color: #0b1120; margin: 2rem; }
  .receipt { max-width: 480px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; }
  h1 { font-size: 1.25rem; margin: 0 0 .25rem; }
  .muted { color: #64748b; font-size: .85rem; }
  table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
  td { padding: .5rem 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
  td.label { color: #64748b; width: 40%; }
  td.value { font-weight: 600; }
  .amount { font-size: 1.5rem; font-weight: 700; color: #10b981; margin: .5rem 0; }
  .footer { margin-top: 1.5rem; font-size: .75rem; color: #94a3b8; text-align: center; }
</style>
</head>
<body>
  <div class="receipt">
    <h1>Payment Receipt</h1>
    <p class="muted">{$data['society_name']}</p>
    <div class="amount">₹{$data['amount']}</div>
    <table>{$rows}</table>
    <p class="footer">Generated by SocioSphere · {$data['paid_at']}</p>
  </div>
</body>
</html>
HTML;
    }
}
