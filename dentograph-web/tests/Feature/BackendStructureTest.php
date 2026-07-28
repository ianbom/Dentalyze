<?php

use Illuminate\Support\Facades\Route;

test('dentograph routes are handled by domain controllers', function (string $route, string $action) {
    expect(Route::getRoutes()->getByName($route)?->getActionName())->toBe($action);
})->with([
    ['dashboard', 'App\Http\Controllers\DashboardController@index'],
    ['users.index', 'App\Http\Controllers\UserController@index'],
    ['users.create', 'App\Http\Controllers\UserController@create'],
    ['users.show', 'App\Http\Controllers\UserController@show'],
    ['users.edit', 'App\Http\Controllers\UserController@edit'],
    ['patients.index', 'App\Http\Controllers\PatientController@index'],
    ['patients.create', 'App\Http\Controllers\PatientController@create'],
    ['patients.show', 'App\Http\Controllers\PatientController@show'],
    ['patients.edit', 'App\Http\Controllers\PatientController@edit'],
    ['patients.history', 'App\Http\Controllers\PatientController@history'],
    ['radiographs.index', 'App\Http\Controllers\RadiographController@index'],
    ['radiographs.create', 'App\Http\Controllers\RadiographController@create'],
    ['radiographs.show', 'App\Http\Controllers\RadiographController@show'],
    ['radiographs.history', 'App\Http\Controllers\RadiographController@history'],
    ['verification.tasks', 'App\Http\Controllers\VerificationController@tasks'],
    ['reports.radiographs.pdf', 'App\Http\Controllers\ReportController@radiographPdf'],
    ['public.verify', 'App\Http\Controllers\PublicVerificationController@show'],
]);

test('dentograph backend core classes exist', function (string $class) {
    expect(class_exists($class))->toBeTrue();
})->with([
    'dashboard service' => ['App\Services\DashboardService'],
    'user service' => ['App\Services\UserService'],
    'patient service' => ['App\Services\PatientService'],
    'radiograph service' => ['App\Services\RadiographService'],
    'ai detection service' => ['App\Services\AiDetectionService'],
    'verification service' => ['App\Services\VerificationService'],
    'report service' => ['App\Services\ReportService'],
    'public verification service' => ['App\Services\PublicVerificationService'],
    'store user request' => ['App\Http\Requests\Users\StoreUserRequest'],
    'update user request' => ['App\Http\Requests\Users\UpdateUserRequest'],
    'store patient request' => ['App\Http\Requests\Patients\StorePatientRequest'],
    'update patient request' => ['App\Http\Requests\Patients\UpdatePatientRequest'],
    'store radiograph request' => ['App\Http\Requests\Radiographs\StoreRadiographRequest'],
    'analyze radiograph request' => ['App\Http\Requests\Radiographs\AnalyzeRadiographRequest'],
    'finalize radiograph request' => ['App\Http\Requests\Radiographs\FinalizeRadiographRequest'],
]);

test('dentograph form requests expose expected validation fields', function (string $class, array $fields) {
    if (! class_exists($class)) {
        expect(class_exists($class))->toBeTrue();

        return;
    }

    $request = new $class;

    expect(array_keys($request->rules()))->toBe($fields);
})->with([
    'store user' => ['App\Http\Requests\Users\StoreUserRequest', ['name', 'email', 'phone', 'role', 'password']],
    'update user' => ['App\Http\Requests\Users\UpdateUserRequest', ['name', 'email', 'phone', 'role', 'password']],
    'store patient' => ['App\Http\Requests\Patients\StorePatientRequest', ['nik', 'name', 'email', 'birth_place', 'birth_date', 'address', 'age', 'gender']],
    'update patient' => ['App\Http\Requests\Patients\UpdatePatientRequest', ['name', 'email', 'birth_place', 'birth_date', 'address', 'age', 'gender']],
    'store radiograph' => ['App\Http\Requests\Radiographs\StoreRadiographRequest', ['patient_nik', 'image']],
    'analyze radiograph' => ['App\Http\Requests\Radiographs\AnalyzeRadiographRequest', []],
    'finalize radiograph' => ['App\Http\Requests\Radiographs\FinalizeRadiographRequest', ['detections']],
]);
