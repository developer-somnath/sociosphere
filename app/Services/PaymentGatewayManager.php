<?php

namespace App\Services;

use App\Contracts\PaymentGateway;
use App\Services\PaymentGateways\LedgerGateway;
use App\Services\PaymentGateways\RazorpayGateway;
use Illuminate\Support\Facades\Config;

/**
 * Resolves the active payment gateway(s) for the platform.
 *
 * The active set is driven by `services.payments.gateways` (a list of gateway
 * names). The ledger gateway is always available as the manual fallback.
 */
class PaymentGatewayManager
{
    /** @var array<string, PaymentGateway> */
    protected array $gateways = [];

    public function __construct()
    {
        $this->register(new LedgerGateway());
        $this->register(new RazorpayGateway());
    }

    public function register(PaymentGateway $gateway): void
    {
        $this->gateways[$gateway->name()] = $gateway;
    }

    public function get(string $name): ?PaymentGateway
    {
        return $this->gateways[$name] ?? null;
    }

    /**
     * Gateways that should be offered in the collection UI, in config order.
     *
     * @return array<int, PaymentGateway>
     */
    public function active(): array
    {
        $names = (array) Config::get('services.payments.gateways', ['ledger']);
        $ordered = [];
        foreach ($names as $name) {
            if (isset($this->gateways[$name])) {
                $ordered[] = $this->gateways[$name];
            }
        }

        // Always include the ledger fallback if not already present.
        if (!isset($this->gateways['ledger']) || !in_array('ledger', $names, true)) {
            $ordered[] = $this->gateways['ledger'];
        }

        return $ordered;
    }

    /**
     * The gateway that should receive webhooks at a given route path.
     */
    public function forWebhook(string $name): ?PaymentGateway
    {
        return $this->get($name);
    }
}
