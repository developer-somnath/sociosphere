<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'invoice_id' => ['required', 'integer', 'exists:invoices,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['required', 'string', 'in:UPI,NetBanking,Credit Card,Cheque,Cash'],
            'transaction_reference' => ['nullable', 'string', 'max:255'],
            'remarks' => ['nullable', 'string'],
        ];
    }
}
