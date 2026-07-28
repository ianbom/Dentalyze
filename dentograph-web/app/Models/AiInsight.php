<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiInsight extends Model
{
    protected $fillable = [
        'patient_nik',
        'id_radiograph',
        'type',
        'severity',
        'title',
        'description',
        'recommendation',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_nik', 'nik');
    }

    public function radiograph(): BelongsTo
    {
        return $this->belongsTo(Radiograph::class, 'id_radiograph', 'id_radiograph');
    }
}
