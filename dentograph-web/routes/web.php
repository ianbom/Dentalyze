<?php

use App\Http\Controllers\AiChatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DetectionController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\FaskesController;
use App\Http\Controllers\KnowledgeController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PublicVerificationController;
use App\Http\Controllers\RadiographAssignmentController;
use App\Http\Controllers\RadiographController;
use App\Http\Controllers\RadiographerController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VerificationController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::get('/verify/{radiograph}', [PublicVerificationController::class, 'show'])
    ->name('public.verify');
Route::post('/newsletter', [NewsletterController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('newsletter.store');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('dashboard/notifications', [DashboardController::class, 'notifications'])->name('dashboard.notifications');
    Route::inertia('patient-insight', 'patients/insight')->name('patients.insight');
    Route::get('ai-chat', [AiChatController::class, 'index'])->name('ai-chat.index');
    Route::post('ai-chat/message', [AiChatController::class, 'message'])->name('ai-chat.message');

    Route::resource('users', UserController::class);
    Route::resource('knowledge', KnowledgeController::class)
        ->except(['show']);
    Route::resource('doctors', DoctorController::class)
        ->only(['index', 'store', 'update', 'destroy']);
    Route::resource('radiographers', RadiographerController::class)
        ->only(['index', 'store', 'update', 'destroy']);
    Route::resource('faskes', FaskesController::class)->except(['create', 'show', 'edit']);
    Route::post('faskes-collaborations', [FaskesController::class, 'storeCollaboration'])->name('faskes.collaborations.store');
    Route::delete('faskes-collaborations/{collaboration}', [FaskesController::class, 'destroyCollaboration'])->name('faskes.collaborations.destroy');
    Route::get('detection', [DetectionController::class, 'index'])->name('detection.index');
    Route::get('detection/{radiograph}', [DetectionController::class, 'show'])->name('detection.show');

    Route::get('patients/{patient}/history', [PatientController::class, 'history'])
        ->name('patients.history');
    Route::resource('patients', PatientController::class);

    Route::post('radiographs/{radiograph}/analyze', [RadiographController::class, 'analyze'])
        ->name('radiographs.analyze');
    Route::post('radiographs/{radiograph}/finalize', [RadiographController::class, 'finalize'])
        ->name('radiographs.finalize');
    Route::patch('radiographs/{radiograph}/assignment', [RadiographAssignmentController::class, 'update'])
        ->name('radiographs.assignment.update');
    Route::get('radiographs-history', [RadiographController::class, 'historyIndex'])
        ->name('radiographs.history.index');
    Route::get('radiographs/{radiograph}/history', [RadiographController::class, 'history'])
        ->name('radiographs.history');
    Route::resource('radiographs', RadiographController::class)
        ->except(['edit', 'update']);

    Route::get('verification/tasks', [VerificationController::class, 'tasks'])
        ->name('verification.tasks');

    Route::get('reports/radiographs/{radiograph}/pdf', [ReportController::class, 'radiographPdf'])
        ->name('reports.radiographs.pdf');
    Route::get('reports/radiographs/{radiograph}/download', [ReportController::class, 'download'])
        ->name('reports.radiographs.download');
});

require __DIR__.'/settings.php';
