<?php

namespace App\Http\Requests\Faskes;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFaskesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('faskes', 'name')->ignore($this->route('faske')),
            ],
            'type' => ['required', 'string', 'max:100'],
        ];
    }
}
