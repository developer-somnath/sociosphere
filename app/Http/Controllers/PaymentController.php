<?php

namespace App\Http\Controllers;

use App\Http\Requests\PaymentRequest;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
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

        $invoice = Invoice::findOrFail($request->input('invoice_id'));
        $amount = (float) $request->input('amount');

        $societyId = $request->user()->society_id;
        $nextNum = Payment::where('society_id', $societyId)->count() + 1;
        $paymentNumber = 'PAY-' . date('Ym') . '-' . str_pad((string) $nextNum, 4, '0', STR_PAD_LEFT);

        $payment = Payment::create([
            'society_id' => $societyId,
            'invoice_id' => $invoice->id,
            'flat_id' => $invoice->flat_id,
            'payment_number' => $paymentNumber,
            'amount' => $amount,
            'payment_method' => $request->input('payment_method'),
            'transaction_reference' => $request->input('transaction_reference'),
            'paid_at' => now(),
            'status' => 'Completed',
            'remarks' => $request->input('remarks'),
        ]);

        $newPaidAmount = $invoice->paid_amount + $amount;
        $status = $newPaidAmount >= $invoice->total_amount ? 'Paid' : 'Partially Paid';

        $invoice->update([
            'paid_amount' => $newPaidAmount,
            'status' => $status,
        ]);

        app(ActivityLogger::class)->log(
            action: 'create',
            module: 'Payment',
            entityType: Payment::class,
            entityId: (string) $payment->id,
            remarks: "Recorded payment {$payment->payment_number} of {$amount} for Invoice {$invoice->invoice_number}"
        );

        return redirect()
            ->route('payments.index')
            ->with('success', "Payment {$payment->payment_number} recorded successfully.");
    }
}
