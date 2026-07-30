<?php

namespace App\Http\Requests\Radiographs;

use Illuminate\Foundation\Http\FormRequest;

class AssignRadiographRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['admin', 'dokter', 'radiografer'], true);
    }

    public function rules(): array
    {
        return ['doctor_id' => ['required', 'integer', 'exists:users,id']];
    }
}
