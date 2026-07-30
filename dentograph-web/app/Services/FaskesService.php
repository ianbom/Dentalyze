<?php

namespace App\Services;

use App\Models\Faskes;
use App\Models\FaskesCollaboration;
use App\Models\Radiograph;
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
        $hasPendingAssignment = Radiograph::query()
            ->where('status', 'menunggu')
            ->whereNotNull('assigned_doctor_id')
            ->where(function ($query) use ($collaboration): void {
                $query->where(function ($query) use ($collaboration): void {
                    $query->where('faskes_id', $collaboration->faskes_id)
                        ->where('review_faskes_id', $collaboration->collaborator_faskes_id);
                })->orWhere(function ($query) use ($collaboration): void {
                    $query->where('faskes_id', $collaboration->collaborator_faskes_id)
                        ->where('review_faskes_id', $collaboration->faskes_id);
                });
            })
            ->exists();

        if ($hasPendingAssignment) {
            throw ValidationException::withMessages([
                'collaboration' => 'Kolaborasi masih digunakan oleh tugas verifikasi yang belum selesai.',
            ]);
        }

        $collaboration->delete();
    }
}
