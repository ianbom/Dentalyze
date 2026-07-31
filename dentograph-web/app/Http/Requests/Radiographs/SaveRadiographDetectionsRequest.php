<?php

namespace App\Http\Requests\Radiographs;

use App\Models\Radiograph;
use App\Services\FaskesAccessService;

class SaveRadiographDetectionsRequest extends FinalizeRadiographRequest
{
    public function authorize(): bool
    {
        if (! in_array($this->user()?->role, ['admin', 'dokter', 'radiografer'], true)) {
            return false;
        }

        $radiograph = Radiograph::query()->find($this->route('radiograph'));

        return $radiograph
            && app(FaskesAccessService::class)->canViewRadiograph($this->user(), $radiograph);
    }

    public function rules(): array
    {
        return [
            ...parent::rules(),
            'detections' => ['present', 'array'],
        ];
    }
}
