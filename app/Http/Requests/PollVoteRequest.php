<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PollVoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'option_ids' => ['required', 'array', 'min:1'],
            'option_ids.*' => ['required', 'integer', 'exists:poll_options,id'],
        ];
    }
}
