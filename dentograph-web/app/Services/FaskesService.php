<?php

namespace App\Services;

use App\Models\Faskes;
use App\Models\FaskesCollaboration;
use Illuminate\Validation\ValidationException;

class FaskesService
{
    public function indexData(): array
    {
        $faskes = Faskes::query()
            ->withCount(['users', 'patients'])
            ->latest()
            ->get()
            ->map(fn (Faskes $item): array => [
                'id' => $item->id,
                'name' => $item->name,
                'type' => $item->type,
                'users_count' => $item->users_count,
                'patients_count' => $item->patients_count,
            ]);

        $collaborations = FaskesCollaboration::query()
            ->with(['faskes:id,name', 'collaborator:id,name'])
            ->latest()
            ->get()
            ->map(fn (FaskesCollaboration $item): array => [
                'id' => $item->id,
                'faskes_name' => $item->faskes?->name,
                'collaborator_name' => $item->collaborator?->name,
            ]);

        return ['faskes' => $faskes, 'collaborations' => $collaborations];
    }

    public function delete(Faskes $faskes): void
    {
        if (
            $faskes->users()->exists()
            || $faskes->patients()->exists()
            || $faskes->radiographs()->exists()
            || $faskes->collaborations()->exists()
            || $faskes->collaboratorLinks()->exists()
        ) {
            throw ValidationException::withMessages([
                'faskes' => 'Faskes masih memiliki staff, pasien, radiograf, atau kolaborasi.',
            ]);
        }

        $faskes->delete();
    }

    public function deleteCollaboration(FaskesCollaboration $collaboration): void
    {
        $collaboration->delete();
    }
}
