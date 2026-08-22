<?php

namespace App\Http\Controllers;

use App\Jobs\CalculateOverduePenaltiesJob;
use App\Jobs\GenerateMonthlyInvoicesJob;
use App\Models\BillingRunHistory;
use App\Models\Flat;
use App\Models\Invoice;
use App\Models\SocietyBillingConfig;
use App\Services\ActivityLogger;
use App\Services\BillingService;
use App\Services\FinancialInvariantService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function __construct(
        private readonly BillingService $billing,
        private readonly FinancialInvariantService $invariants,
    ) {}

    /**
     * Preview an auto-billing run without persisting anything.
     */
    public function preview(Request $request): Response
    {
        $this->authorize('viewAny', SocietyBillingConfig::class);

        $period = $request->query('period', now()->format('Y-m'));

        $societyId = $this->societyId();

        $plan = $this->billing->buildRunPlan(
            societyId: $societyId,
            billingPeriod: $period,
        );

        return Inertia::render('features/invoices/pages/batch-generate', [
            'plan' => $plan,
            'period' => $period,
            'recent_runs' => BillingRunHistory::query()
                ->where('society_id', $societyId)
                ->latest('id')
                ->limit(5)
                ->get(['billing_period', 'invoices_generated', 'total_amount', 'status', 'created_at']),
            'can' => [
                'run' => $request->user()->hasPermissionTo('billing.run'),
                'configure' => $request->user()->hasPermissionTo('billing.configure'),
            ],
        ]);
    }

    /**
     * Execute an auto-billing run (synchronously via dispatchSync).
     */
    public function run(Request $request): RedirectResponse
    {
        $this->authorize('create', SocietyBillingConfig::class);

        $validated = $request->validate([
            'billing_period' => ['nullable', 'date_format:Y-m'],
            'excluded_flat_ids' => ['nullable', 'array'],
            'excluded_flat_ids.*' => ['integer'],
        ]);

        $result = (new GenerateMonthlyInvoicesJob(
            societyId: $this->societyId(),
            billingPeriod: $validated['billing_period'] ?? null,
            excludedFlatIds: $validated['excluded_flat_ids'] ?? [],
            runByUserId: $request->user()->id,
        ))->handle();

        if (($result['status'] ?? 'Failed') === 'Failed') {
            return back()->with('error', $result['notes'] ?? 'Billing run failed.');
        }

        return back()->with('success', sprintf(
            'Billing run completed: %d invoice(s) generated, total %s.',
            $result['invoices_generated'],
            number_format((float) ($result['total_amount'] ?? 0), 2)
        ));
    }

    /**
     * Display billing configuration and run history.
     */
    public function settings(Request $request): Response
    {
        $this->authorize('viewAny', SocietyBillingConfig::class);

        $societyId = $this->societyId();

        $config = SocietyBillingConfig::query()
            ->where('society_id', $societyId)
            ->first();

        return Inertia::render('features/invoices/pages/billing-settings', [
            'config' => $config?->only([
                'uuid', 'billing_mode', 'base_rate', 'tax_rate', 'due_day',
                'grace_days', 'penalty_rate', 'penalty_cap', 'is_active',
            ]),
            'modes' => SocietyBillingConfig::modes(),
            'can' => [
                'configure' => $request->user()->hasPermissionTo('billing.configure'),
            ],
        ]);
    }

    /**
     * Persist the society billing configuration.
     */
    public function updateSettings(Request $request): RedirectResponse
    {
        $societyId = $this->societyId();

        $config = SocietyBillingConfig::query()
            ->where('society_id', $societyId)
            ->firstOrNew(['society_id' => $societyId]);

        $this->authorize('update', $config);

        $validated = $request->validate([
            'billing_mode' => ['required', 'in:per_sqft,fixed'],
            'base_rate' => ['required', 'numeric', 'min:0'],
            'tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'due_day' => ['required', 'integer', 'between:1,28'],
            'grace_days' => ['required', 'integer', 'min:0', 'max:90'],
            'penalty_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'penalty_cap' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $config->fill([
            'billing_mode' => $validated['billing_mode'],
            'base_rate' => $validated['base_rate'],
            'tax_rate' => $validated['tax_rate'] ?? 0,
            'due_day' => $validated['due_day'],
            'grace_days' => $validated['grace_days'],
            'penalty_rate' => $validated['penalty_rate'],
            'penalty_cap' => $validated['penalty_cap'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ])->save();

        app(ActivityLogger::class)->log(
            action: 'update',
            module: 'Billing',
            entityType: SocietyBillingConfig::class,
            entityId: (string) $config->id,
            remarks: "Updated society billing configuration ({$config->billing_mode} @ {$config->base_rate})"
        );

        return back()->with('success', 'Billing configuration saved successfully.');
    }

    /**
     * Paginated billing run history.
     */
    public function runs(Request $request): Response
    {
        $this->authorize('viewAny', SocietyBillingConfig::class);

        $societyId = $this->societyId();

        $runs = BillingRunHistory::query()
            ->where('society_id', $societyId)
            ->with('runBy:id,name')
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('features/invoices/pages/billing-runs', [
            'runs' => $runs,
            'can' => [
                'run' => $request->user()->hasPermissionTo('billing.run'),
                'configure' => $request->user()->hasPermissionTo('billing.configure'),
            ],
        ]);
    }

    /**
     * Resident financial statement for a flat (invoices + payments + balance).
     */
    public function ledger(Request $request): Response
    {
        $this->authorize('viewAny', Invoice::class);

        $societyId = $this->societyId();

        $flats = Flat::query()
            ->with('tower')
            ->where('society_id', $societyId)
            ->orderBy('flat_no')
            ->get(['id', 'uuid', 'flat_no', 'tower_id', 'area_sqft']);

        $selectedFlatId = (int) $request->query('flat_id', $flats->first()?->id ?? 0);

        $invoices = Invoice::query()
            ->with(['items', 'payments'])
            ->where('society_id', $societyId)
            ->when($selectedFlatId > 0, fn ($q) => $q->where('flat_id', $selectedFlatId))
            ->latest('id')
            ->get();

        $balance = round($invoices->sum('total_amount') - $invoices->sum('paid_amount'), 2);

        return Inertia::render('features/invoices/pages/flat-ledger', [
            'flats' => $flats,
            'selected_flat_id' => $selectedFlatId,
            'invoices' => $invoices,
            'balance' => $balance,
            'can' => [
                'view' => $request->user()->hasPermissionTo('invoice.view'),
            ],
        ]);
    }

    /**
     * Run the financial invariant validation and surface any violations.
     */
    public function verify(Request $request): Response
    {
        $this->authorize('viewAny', SocietyBillingConfig::class);

        $societyId = $this->societyId();

        $violations = $this->invariants->checkInvoicesMatchPayments($societyId);

        return Inertia::render('features/invoices/pages/invariant-check', [
            'healthy' => count($violations) === 0,
            'violations' => $violations,
            'checked_at' => now()->toDateTimeString(),
            'stats' => [
                'invoices' => Invoice::query()->where('society_id', $societyId)->count(),
                'total_billed' => Invoice::query()->where('society_id', $societyId)->sum('total_amount'),
                'total_collected' => Invoice::query()->where('society_id', $societyId)->sum('paid_amount'),
            ],
            'can' => [
                'configure' => $request->user()->hasPermissionTo('billing.configure'),
            ],
        ]);
    }

    /**
     * Resolve the active society for the current user.
     *
     * Society admins have a fixed society on their user record; super admins
     * operate against the society selected in the session (see society_id()
     * helper). A null here means no society is active.
     */
    private function societyId(): int
    {
        $societyId = society_id();

        abort_if($societyId === null, 403, 'Please select a society before using billing.');

        return $societyId;
    }
}
