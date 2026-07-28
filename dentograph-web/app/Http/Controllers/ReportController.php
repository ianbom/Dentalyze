<?php

namespace App\Http\Controllers;

use App\Models\Radiograph;
use App\Services\ReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function radiographPdf(string $radiograph, ReportService $service): Response
    {
        $this->ensureViewer($radiograph);
        abort_unless(
            Radiograph::query()
                ->whereKey($radiograph)
                ->where('status', 'terverifikasi')
                ->exists(),
            404,
        );

        return Inertia::render('reports/radiograph-pdf', $service->radiographPdfData($radiograph));
    }

    public function download(string $radiograph, ReportService $reportService): HttpResponse
    {
        $this->ensureViewer($radiograph);
        abort_unless(
            Radiograph::query()
                ->whereKey($radiograph)
                ->where('status', 'terverifikasi')
                ->exists(),
            404,
        );

        $pdf = Pdf::loadView('reports.radiograph', $reportService->radiographDownloadData($radiograph))
            ->setPaper('a4', 'portrait')
            ->setOption('isRemoteEnabled', false)
            ->setOption('isHtml5ParserEnabled', true);

        return $pdf->download('laporan-'.$radiograph.'.pdf');
    }

    private function ensureViewer(string $radiograph): void
    {
        $user = request()->user();

        abort_unless(
            $user?->role !== 'pasien'
                || $user->patient?->nik === Radiograph::query()->whereKey($radiograph)->value('patient_nik'),
            403,
        );
    }
}
