<?php

namespace App\Http\Requests\Radiographs;

use Illuminate\Foundation\Http\FormRequest;

class FinalizeRadiographRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['admin', 'dokter'], true);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'detections' => ['required', 'array'],
            'result_image' => ['nullable', 'string', 'max:255'],
            'detections.*.no_fdi' => ['required', 'string', 'max:2'],
            'detections.*.abnormality' => ['required', 'string', 'max:255'],
            'detections.*.analysis' => ['nullable', 'string', 'max:2000'],
            'detections.*.bbox' => ['nullable', 'array'],
            'detections.*.bbox.*' => ['numeric'],
            'detections.*.crop_image' => ['nullable', 'string', 'max:255'],
            'detections.*.confidence' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'detections.*.is_active' => ['required', 'boolean'],
            'detections.*.source' => ['nullable', 'string', 'max:30'],
        ];
    }
}
