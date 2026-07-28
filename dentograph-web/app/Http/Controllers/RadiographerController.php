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
        return Inertia::render('radiographers/index', $service->indexData('radiografer'));
    }

    public function store(StoreStaffRequest $request, StaffUserService $service): RedirectResponse
    {
        $service->create($request->validated(), 'radiografer');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Radiographer created.')]);

        return to_route('radiographers.index');
    }

    public function update(UpdateStaffRequest $request, string $radiographer, StaffUserService $service): RedirectResponse
    {
        $service->update($radiographer, $request->validated(), 'radiografer');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Radiographer updated.')]);

        return to_route('radiographers.index');
    }

    public function destroy(string $radiographer, StaffUserService $service): RedirectResponse
    {
        $service->delete($radiographer, 'radiografer');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Radiographer deleted.')]);

        return to_route('radiographers.index');
    }
}
