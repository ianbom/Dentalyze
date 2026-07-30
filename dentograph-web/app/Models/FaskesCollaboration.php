<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FaskesCollaboration extends Model
{
    protected $fillable = ['faskes_id', 'collaborator_faskes_id'];

    public function faskes(): BelongsTo
    {
        return $this->belongsTo(Faskes::class);
    }

    public function collaborator(): BelongsTo
    {
        return $this->belongsTo(Faskes::class, 'collaborator_faskes_id');
    }

    public static function connect(Faskes $first, Faskes $second): self
    {
        abort_if($first->is($second), 422, 'Faskes tidak dapat berkolaborasi dengan dirinya sendiri.');
        [$firstId, $secondId] = collect([$first->id, $second->id])->sort()->values()->all();

        return self::query()->firstOrCreate([
            'faskes_id' => $firstId,
            'collaborator_faskes_id' => $secondId,
        ]);
    }
}
