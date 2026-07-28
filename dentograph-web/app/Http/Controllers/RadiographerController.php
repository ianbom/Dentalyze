<?php

namespace App\Http\Controllers;

use App\Http\Requests\Staff\StoreStaffRequest;
use App\Http\Requests\Staff\UpdateStaffRequest;
use App\Services\StaffUserService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RadiographerController extends Controller
{
    public function index(StaffUserService $service): Response
    {
        $this->ensureAdmin();

        return Inertia::render('radiographers/index', $service->indexData('radiografer'));
    }

    public function store(StoreStaffRequest $request, StaffUserService $service): RedirectResponse
    {
        $this->ensureAdmin();
        $service->create($request->validated(), 'radiografer');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Radiographer created.')]);

        return to_route('radiographers.index');
    }

    public function update(UpdateStaffRequest $request, string $radiographer, StaffUserService $service): RedirectResponse
    {
        $this->ensureAdmin();
        $service->update($radiographer, $request->validated(), 'radiografer');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Radiographer updated.')]);

        return to_route('radiographers.index');
    }

    public function destroy(string $radiographer, StaffUserService $service): RedirectResponse
    {
        $this->ensureAdmin();
        $service->delete($radiographer, 'radiografer');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Radiographer deleted.')]);

        return to_route('radiographers.index');
    }

    private function ensureAdmin(): void
    {
        abort_unless(request()->user()?->role === 'admin', 403);
    }
}
