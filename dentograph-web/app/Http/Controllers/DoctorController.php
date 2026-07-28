<?php

namespace App\Http\Controllers;

use App\Http\Requests\Staff\StoreStaffRequest;
use App\Http\Requests\Staff\UpdateStaffRequest;
use App\Services\StaffUserService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DoctorController extends Controller
{
    public function index(StaffUserService $service): Response
    {
        return Inertia::render('doctors/index', $service->indexData('dokter'));
    }

    public function store(StoreStaffRequest $request, StaffUserService $service): RedirectResponse
    {
        $service->create($request->validated(), 'dokter');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Doctor created.')]);

        return to_route('doctors.index');
    }

    public function update(UpdateStaffRequest $request, string $doctor, StaffUserService $service): RedirectResponse
    {
        $service->update($doctor, $request->validated(), 'dokter');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Doctor updated.')]);

        return to_route('doctors.index');
    }

    public function destroy(string $doctor, StaffUserService $service): RedirectResponse
    {
        $service->delete($doctor, 'dokter');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Doctor deleted.')]);

        return to_route('doctors.index');
    }
}
