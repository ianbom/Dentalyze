<?php

namespace App\Http\Requests\Faskes;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCollaborationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'faskes_id' => ['required', 'integer', 'exists:faskes,id'],
            'collaborator_faskes_id' => [
                'required',
                'integer',
                'exists:faskes,id',
                Rule::notIn([(int) $this->input('faskes_id')]),
            ],
        ];
    }
}
