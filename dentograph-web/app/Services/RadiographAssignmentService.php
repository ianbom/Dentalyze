<?php

namespace App\Services;

use App\Models\FaskesCollaboration;
use App\Models\Radiograph;
use App\Models\User;

class RadiographAssignmentService
{
    public function __construct(private FaskesAccessService $access) {}

    public function assign(Radiograph $radiograph, User $doctor, User $actor): void
    {
        abort_unless($this->access->canDispatch($actor, $radiograph), 403);
        abort_unless($doctor->role === 'dokter' && $doctor->faskes_id, 422);

        $sameFaskes = (int) $radiograph->faskes_id === (int) $doctor->faskes_id;
        $collaborates = FaskesCollaboration::query()
            ->where(function ($query) use ($doctor, $radiograph): void {
                $query->where('faskes_id', min($radiograph->faskes_id, $doctor->faskes_id))
                    ->where('collaborator_faskes_id', max($radiograph->faskes_id, $doctor->faskes_id));
            })
            ->exists();

        abort_unless($sameFaskes || $collaborates, 403);

        $radiograph->update([
            'assigned_doctor_id' => $doctor->id,
            'review_faskes_id' => $doctor->faskes_id,
        ]);
    }
}
