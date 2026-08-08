<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubscriptionPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('subscription_plans', 'code')->ignore($this->route('plan')?->id),
            ],
            'description' => ['nullable', 'string', 'max:5000'],
            'price_monthly' => ['required', 'numeric', 'min:0'],
            'price_yearly' => ['required', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'size:3'],
            'is_active' => ['sometimes', 'boolean'],
            'is_default' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'features' => ['nullable', 'array'],
            'features.*.feature_key' => ['required', 'string', 'max:60'],
            'features.*.limit_value' => ['nullable', 'integer', 'min:0'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => __('Plan name is required.'),
            'code.required' => __('Plan code is required.'),
            'code.unique' => __('That plan code is already in use.'),
            'price_monthly.required' => __('Monthly price is required.'),
            'price_yearly.required' => __('Yearly price is required.'),
            'currency.size' => __('Currency must be a 3-letter code.'),
            'features.*.feature_key.required' => __('Feature key is required.'),
            'features.*.limit_value.integer' => __('Limit must be a whole number.'),
        ];
    }
}
