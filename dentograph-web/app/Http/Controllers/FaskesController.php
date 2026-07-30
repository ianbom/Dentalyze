<?php

namespace App\Http\Controllers;

use App\Http\Requests\Faskes\StoreCollaborationRequest;
use App\Http\Requests\Faskes\StoreFaskesRequest;
use App\Models\Faskes;
use App\Models\FaskesCollaboration;
use App\Services\FaskesService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class FaskesController extends Controller
{
    public function index(FaskesService $service): Response
    {
        abort_unless(request()->user()?->role === 'admin', 403);

        return Inertia::render('faskes/index', $service->indexData());
    }

    public function store(StoreFaskesRequest $request): RedirectResponse
    {
        Faskes::query()->create($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Faskes berhasil ditambahkan.']);

        return to_route('faskes.index');
    }

    public function update(StoreFaskesRequest $request, Faskes $faske): RedirectResponse
    {
        $faske->update($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Faskes berhasil diperbarui.']);

        return to_route('faskes.index');
    }

    public function destroy(Faskes $faske, FaskesService $service): RedirectResponse
    {
        abort_unless(request()->user()?->role === 'admin', 403);
        $service->delete($faske);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Faskes berhasil dihapus.']);

        return to_route('faskes.index');
    }

    public function storeCollaboration(StoreCollaborationRequest $request): RedirectResponse
    {
        FaskesCollaboration::connect(
            Faskes::findOrFail($request->integer('faskes_id')),
            Faskes::findOrFail($request->integer('collaborator_faskes_id')),
        );
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Kolaborasi berhasil diaktifkan.']);

        return to_route('faskes.index');
    }

    public function destroyCollaboration(
        FaskesCollaboration $collaboration,
        FaskesService $service,
    ): RedirectResponse {
        abort_unless(request()->user()?->role === 'admin', 403);
        $service->deleteCollaboration($collaboration);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Kolaborasi berhasil dihapus.']);

        return to_route('faskes.index');
    }
}
