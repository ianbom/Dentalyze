<?php

namespace App\Http\Requests\Radiographs;

use App\Models\Radiograph;
use App\Services\FaskesAccessService;
use Illuminate\Foundation\Http\FormRequest;

class AnalyzeRadiographRequest extends FormRequest
{
    public function authorize(): bool
    {
        if (! in_array($this->user()?->role, ['admin', 'dokter', 'radiografer'], true)) {
            return false;
        }

        $radiograph = Radiograph::query()->find($this->route('radiograph'));

        return ! $radiograph || app(FaskesAccessService::class)->canEditRadiograph($this->user(), $radiograph);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [];
    }
}
