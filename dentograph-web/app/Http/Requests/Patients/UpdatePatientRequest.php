<?php

namespace App\Http\Requests\Patients;

use App\Models\Patient;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePatientRequest extends FormRequest
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
        $patient = Patient::query()
            ->where('nik', $this->route('patient'))
            ->first();

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($patient?->user_id),
            ],
            'phone' => ['nullable', 'digits_between:11,12'],
            'birth_place' => ['required', 'string', 'max:255'],
            'birth_date' => ['required', 'date', 'before_or_equal:today'],
            'address' => ['required', 'string', 'max:1000'],
            'age' => ['required', 'integer', 'min:0', 'max:130'],
            'gender' => ['required', Rule::in(['male', 'female'])],
            'faskes_id' => ['nullable', 'integer', 'exists:faskes,id'],
        ];
    }
}
