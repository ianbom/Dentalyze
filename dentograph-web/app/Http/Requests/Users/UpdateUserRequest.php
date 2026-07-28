<?php

namespace App\Http\Requests\Users;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
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
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'digits_between:11,12'],
            'role' => ['required', Rule::in(['admin', 'dokter', 'radiografer', 'pasien'])],
            'password' => ['nullable', 'string', 'min:8'],
        ];
    }
}
