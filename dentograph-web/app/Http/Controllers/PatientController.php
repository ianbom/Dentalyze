<?php

namespace App\Http\Controllers;

use App\Http\Requests\Patients\StorePatientRequest;
use App\Http\Requests\Patients\UpdatePatientRequest;
use App\Services\FaskesAccessService;
use App\Services\PatientService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    public function index(Request $request, PatientService $service): Response
    {
        return Inertia::render('patients/index', $service->indexData($request->user()));
    }

    public function create(PatientService $service, FaskesAccessService $access): Response
    {
        abort_unless($access->canCreatePatient(request()->user()), 403);

        return Inertia::render('patients/create', $service->formData(request()->user()));
    }

    public function store(StorePatientRequest $request, PatientService $service, FaskesAccessService $access): RedirectResponse
    {
        abort_unless($access->canCreatePatient($request->user()), 403);

        $data = $request->validated();
        $patient = $service->create($data, $request->user());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Patient created.')]);

        if (($data['return_to'] ?? null) === 'radiographs.index') {
            return to_route('radiographs.index', ['patient_nik' => $patient]);
        }

        return to_route('patients.index');
    }

    public function show(Request $request, string $patient, PatientService $service): Response
    {
        abort_unless($this->canViewPatient($request, $patient), 403);

        return Inertia::render('patients/show', $service->detailData($patient, $request->user()));
    }

    public function edit(Request $request, string $patient, PatientService $service): Response
    {
        abort_unless(in_array($request->user()->role, ['admin', 'radiografer'], true), 403);

        $data = $service->detailData($patient, $request->user());
        abort_unless($data['permissions']['update'], 403);

        return Inertia::render('patients/edit', $data);
    }

    public function update(UpdatePatientRequest $request, string $patient, PatientService $service): RedirectResponse
    {
        abort_unless(in_array($request->user()->role, ['admin', 'radiografer'], true), 403);

        $service->update($patient, $request->validated(), $request->user());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Patient updated.')]);

        return to_route('patients.index');
    }

    public function destroy(string $patient, PatientService $service): RedirectResponse
    {
        abort_unless(in_array(request()->user()?->role, ['admin', 'radiografer'], true), 403);

        $service->delete($patient, request()->user());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Patient deleted.')]);

        return to_route('patients.index');
    }

    public function history(string $patient, PatientService $service): Response
    {
        abort_unless($this->canViewPatient(request(), $patient), 403);

        return Inertia::render('patients/history', $service->historyData($patient, request()->user()));
    }

    private function canViewPatient(Request $request, string $patient): bool
    {
        $user = $request->user();

        return $user?->role !== 'pasien'
            || $user->patient?->nik === $patient;
    }
}
