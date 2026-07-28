<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Detection extends Model
{
    protected $primaryKey = 'id_detection';

    protected $fillable = [
        'id_radiograph',
        'no_fdi',
        'abnormality',
        'analysis',
        'bbox',
        'crop_image',
        'confidence',
        'is_active',
        'source',
    ];

    protected function casts(): array
    {
        return [
            'bbox' => 'array',
            'confidence' => 'float',
            'is_active' => 'boolean',
        ];
    }

    public function radiograph(): BelongsTo
    {
        return $this->belongsTo(Radiograph::class, 'id_radiograph', 'id_radiograph');
    }
}
