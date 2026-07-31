<?php

namespace App\Http\Requests\Radiographs;

use App\Models\Radiograph;
use App\Services\FaskesAccessService;

class SaveRadiographDetectionsRequest extends FinalizeRadiographRequest
{
    public function authorize(): bool
    {
        $radiograph = Radiograph::query()->find($this->route('radiograph'));

        return $radiograph
            && $this->user()
            && app(FaskesAccessService::class)->canEditRadiograph($this->user(), $radiograph);
    }

    public function rules(): array
    {
        return [
            ...parent::rules(),
            'detections' => ['present', 'array'],
        ];
    }
}
