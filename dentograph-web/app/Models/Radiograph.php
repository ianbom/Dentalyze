<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Radiograph extends Model
{
    protected $primaryKey = 'id_radiograph';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id_radiograph',
        'faskes_id',
        'review_faskes_id',
        'id_dokter',
        'assigned_doctor_id',
        'id_radiografer',
        'patient_nik',
        'image',
        'result_image',
        'status',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_nik', 'nik');
    }

    public function detections(): HasMany
    {
        return $this->hasMany(Detection::class, 'id_radiograph', 'id_radiograph');
    }

    public function dokter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_dokter');
    }

    public function radiografer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_radiografer');
    }

    public function faskes(): BelongsTo
    {
        return $this->belongsTo(Faskes::class);
    }

    public function reviewFaskes(): BelongsTo
    {
        return $this->belongsTo(Faskes::class, 'review_faskes_id');
    }

    public function assignedDoctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_doctor_id');
    }
}
