<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Faskes extends Model
{
    protected $table = 'faskes';

    protected $fillable = ['name', 'type'];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function patients(): HasMany
    {
        return $this->hasMany(Patient::class);
    }

    public function radiographs(): HasMany
    {
        return $this->hasMany(Radiograph::class);
    }

    public function collaborations(): HasMany
    {
        return $this->hasMany(FaskesCollaboration::class);
    }

    public function collaboratorLinks(): HasMany
    {
        return $this->hasMany(FaskesCollaboration::class, 'collaborator_faskes_id');
    }
}
