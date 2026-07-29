<?php

namespace App\Http\Requests\Radiographs;

use App\Rules\NearGrayscaleImage;
use Illuminate\Foundation\Http\FormRequest;

class StoreRadiographRequest extends FormRequest
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
            'patient_nik' => ['required', 'digits:16'],
            'image' => [
                'bail',
                'required',
                'file',
                'mimes:jpg,jpeg,png',
                'max:10240',
                new NearGrayscaleImage,
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'image.required' => 'Gambar radiograf wajib dipilih.',
            'image.file' => 'File radiograf harus berupa gambar yang valid.',
            'image.mimes' => 'Gambar radiograf harus berformat JPG, JPEG, atau PNG.',
            'image.max' => 'Ukuran gambar radiograf maksimal 10 MB.',
        ];
    }
}
