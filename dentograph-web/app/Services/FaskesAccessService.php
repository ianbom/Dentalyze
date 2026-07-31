<?php

namespace App\Services;

use App\Models\Faskes;
use App\Models\FaskesCollaboration;
use App\Models\Patient;
use App\Models\Radiograph;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class FaskesAccessService
{
    /** @return array<int, int> */
    public function accessibleFaskesIds(User $user): array
    {
        $faskesId = $user->faskes_id ?: $this->legacyFaskesId();

        $collaborators = FaskesCollaboration::query()
            ->where('faskes_id', $faskesId)
            ->pluck('collaborator_faskes_id')
            ->merge(FaskesCollaboration::query()
                ->where('collaborator_faskes_id', $faskesId)
                ->pluck('faskes_id'));

        return $collaborators->push($faskesId)->filter()->unique()->map(fn ($id) => (int) $id)->values()->all();
    }

    public function canViewPatient(User $user, Patient $patient): bool
    {
        return $user->role === 'admin'
            || ($user->role === 'pasien' && $patient->user_id === $user->id)
            || (in_array($user->role, ['dokter', 'radiografer'], true)
                && in_array((int) ($patient->faskes_id ?: $this->legacyFaskesId()), $this->accessibleFaskesIds($user), true));
    }

    public function canManagePatient(User $user, Patient $patient): bool
    {
        return $user->role === 'admin'
            || ($user->role === 'radiografer'
                && (int) ($user->faskes_id ?: $this->legacyFaskesId()) === (int) ($patient->faskes_id ?: $this->legacyFaskesId()));
    }

    public function canCreatePatient(User $user): bool
    {
        return in_array($user->role, ['admin', 'radiografer'], true);
    }

    public function canViewRadiograph(User $user, Radiograph $radiograph): bool
    {
        return $user->role === 'admin'
            || ($user->role === 'pasien' && $user->patient?->nik === $radiograph->patient_nik)
            || (in_array($user->role, ['dokter', 'radiografer'], true)
                && in_array((int) ($radiograph->faskes_id ?: $this->legacyFaskesId()), $this->accessibleFaskesIds($user), true));
    }

    public function canEditRadiograph(User $user, Radiograph $radiograph): bool
    {
        if ($radiograph->status === 'terverifikasi') {
            return false;
        }

        return $user->role === 'admin'
            || ($user->role === 'dokter'
                && in_array((int) ($radiograph->faskes_id ?: $this->legacyFaskesId()), $this->accessibleFaskesIds($user), true));
    }

    public function canFinalize(User $user, Radiograph $radiograph): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->role === 'dokter'
            && in_array((int) ($radiograph->faskes_id ?: $this->legacyFaskesId()), $this->accessibleFaskesIds($user), true);
    }

    public function canDeleteRadiograph(User $user, Radiograph $radiograph): bool
    {
        return $this->canManageClinicalRadiograph($user, $radiograph);
    }

    public function scopePatients(Builder $query, User $user): Builder
    {
        return match ($user->role) {
            'admin' => $query,
            'pasien' => $query->where('user_id', $user->id),
            'dokter', 'radiografer' => $this->scopeByAccessibleFaskes($query, $user),
            default => $query->whereRaw('1 = 0'),
        };
    }

    public function scopeRadiographs(Builder $query, User $user): Builder
    {
        return match ($user->role) {
            'admin' => $query,
            'pasien' => $query->where('patient_nik', $user->patient?->nik ?? '__none__'),
            'dokter', 'radiografer' => $this->scopeByAccessibleFaskes($query, $user),
            default => $query->whereRaw('1 = 0'),
        };
    }

    private function scopeByAccessibleFaskes(Builder $query, User $user): Builder
    {
        $ids = $this->accessibleFaskesIds($user);
        $legacyId = $this->legacyFaskesId();

        return $query->where(function (Builder $query) use ($ids, $legacyId): void {
            $query->whereIn('faskes_id', $ids);

            if ($legacyId && in_array($legacyId, $ids, true)) {
                $query->orWhereNull('faskes_id');
            }
        });
    }

    private function canManageClinicalRadiograph(User $user, Radiograph $radiograph): bool
    {
        return $user->role === 'admin'
            || (in_array($user->role, ['dokter', 'radiografer'], true)
                && in_array((int) ($radiograph->faskes_id ?: $this->legacyFaskesId()), $this->accessibleFaskesIds($user), true));
    }

    private function legacyFaskesId(): ?int
    {
        return Faskes::query()->where('type', 'legacy')->value('id');
    }
}
