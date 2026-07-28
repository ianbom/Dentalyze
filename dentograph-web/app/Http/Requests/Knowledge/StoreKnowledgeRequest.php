<?php

namespace App\Http\Requests\Knowledge;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreKnowledgeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', Rule::in(['disease', 'radiology_guide', 'faq', 'general'])],
            'condition_name' => ['nullable', 'string', 'max:100'],
            'content' => ['required', 'string', 'min:50'],
            'status' => ['required', Rule::in(['draft', 'active', 'inactive'])],
        ];
    }
}
