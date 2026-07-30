<?php

namespace App\Http\Controllers;

use App\Http\Requests\Radiographs\AssignRadiographRequest;
use App\Models\Radiograph;
use App\Models\User;
use App\Services\RadiographAssignmentService;
use Illuminate\Http\RedirectResponse;

class RadiographAssignmentController extends Controller
{
    public function update(AssignRadiographRequest $request, Radiograph $radiograph, RadiographAssignmentService $service): RedirectResponse
    {
        $service->assign($radiograph, User::findOrFail($request->integer('doctor_id')), $request->user());

        return back();
    }
}
