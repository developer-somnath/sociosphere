<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SocietyDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'file' => [$this->isMethod('post') ? 'required' : 'nullable', 'file', 'max:20480'], // 20MB
            'is_public' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Please provide a document title.',
            'file.required' => 'Please choose a file to upload.',
            'file.max' => 'The document must not exceed 20MB.',
        ];
    }
}