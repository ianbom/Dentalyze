<!DOCTYPE html>
<html lang="id">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Laporan {{ $radiograph['id_radiograph'] }}</title>
    <style>
        @page { margin: 1cm; }

        * { box-sizing: border-box; }

        body {
            margin: 0;
            padding: 0;
            color: #053247;
            background: #ffffff;
            font-family: DejaVu Sans, Helvetica, Arial, sans-serif;
            font-size: 11px;
            line-height: 1.45;
        }

        .header {
            border-bottom: 3px solid #053247;
            margin-bottom: 16px;
            padding-bottom: 12px;
            text-align: center;
        }

        .brand {
            color: #053247;
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.5px;
        }

        .brand span {
            color: #8BAFBF;
            font-weight: 400;
        }

        .tagline {
            color: #8BAFBF;
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 2px;
            text-transform: uppercase;
        }

        .top-card {
            background: #F8FDFF;
            border: 1px solid #C3E3EE;
            border-radius: 14px;
            margin-bottom: 14px;
            padding: 14px;
        }

        .info-table,
        .summary-table,
        .result-table {
            width: 100%;
            border-collapse: collapse;
        }

        .info-table td {
            padding: 5px 6px;
            vertical-align: top;
            width: 50%;
        }

        .label {
            color: #8BAFBF;
            display: block;
            font-size: 7px;
            font-weight: 800;
            letter-spacing: 1.2px;
            margin-bottom: 2px;
            text-transform: uppercase;
        }

        .value {
            color: #053247;
            font-size: 11px;
            font-weight: 800;
        }

        .section-title {
            border-left: 5px solid #053247;
            color: #053247;
            font-size: 11px;
            font-weight: 900;
            letter-spacing: 0.5px;
            margin: 16px 0 9px;
            padding-left: 8px;
            text-transform: uppercase;
        }

        .main-img-box {
            background: #000000;
            border-radius: 13px;
            padding: 9px;
            text-align: center;
        }

        .main-img {
            max-height: 315px;
            object-fit: contain;
            width: 100%;
        }

        .summary-card {
            background: #F8FDFF;
            border: 1px solid #C3E3EE;
            border-radius: 12px;
            padding: 10px 8px;
            text-align: center;
        }

        .summary-label {
            color: #8BAFBF;
            font-size: 7px;
            font-weight: 900;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .summary-value {
            color: #053247;
            font-size: 18px;
            font-weight: 900;
            margin-top: 4px;
        }

        .odontogram-box {
            background: #F8FDFF;
            border: 1px solid #C3E3EE;
            border-radius: 14px;
            padding: 14px 16px;
            text-align: center;
        }

        .legend {
            margin-bottom: 11px;
            text-align: right;
        }

        .legend-item {
            display: inline-block;
            margin-left: 11px;
            white-space: nowrap;
        }

        .legend-dot {
            border-radius: 3px;
            display: inline-block;
            height: 10px;
            margin-right: 4px;
            vertical-align: middle;
            width: 10px;
        }

        .legend-text {
            color: #607D91;
            font-size: 7px;
            font-weight: 800;
            text-transform: uppercase;
            vertical-align: middle;
        }

        .teeth-row {
            margin: 8px 0;
            text-align: center;
        }

        .tooth {
            border-radius: 7px;
            display: inline-block;
            font-size: 9px;
            font-weight: 900;
            height: 28px;
            line-height: 28px;
            margin: 2px;
            min-width: 28px;
            text-align: center;
        }

        .tooth-normal { background: #12C994; color: #ffffff; }
        .tooth-karies { background: #FFD23F; color: #4E3900; }
        .tooth-lesi { background: #8B5CF6; color: #ffffff; }
        .tooth-impaksi { background: #0EA5E9; color: #ffffff; }
        .tooth-resorpsi { background: #F97316; color: #ffffff; }
        .tooth-missing {
            background: #ffffff;
            border: 1px dashed #A9C0D2;
            color: #91A8B8;
        }

        .midline {
            background: #C3E3EE;
            height: 1px;
            margin: 6px auto;
            width: 475px;
        }

        .result-table {
            border-collapse: separate;
            border-spacing: 0;
            overflow: hidden;
        }

        .result-table th {
            background: #EEF8FF;
            color: #8BAFBF;
            font-size: 8px;
            font-weight: 900;
            letter-spacing: 1.3px;
            padding: 9px;
            text-align: left;
            text-transform: uppercase;
        }

        .result-table td {
            border-bottom: 1px solid #E5F3FA;
            color: #053247;
            padding: 9px;
            text-align: left;
            vertical-align: top;
        }

        .crop-img {
            background: #F1F5F9;
            border-radius: 9px;
            height: 58px;
            object-fit: cover;
            width: 58px;
        }

        .manual-crop {
            background: #F1F5F9;
            border-radius: 9px;
            color: #9CA3AF;
            font-size: 7px;
            font-weight: 800;
            height: 58px;
            line-height: 58px;
            text-align: center;
            text-transform: uppercase;
            width: 58px;
        }

        .badge {
            border-radius: 999px;
            display: inline-block;
            font-size: 8px;
            font-weight: 900;
            padding: 4px 9px;
        }

        .badge-karies { background: #FFF1B8; color: #6E4B00; }
        .badge-lesi { background: #EFE3FF; color: #5B21B6; }
        .badge-impaksi { background: #DDF4FF; color: #0369A1; }
        .badge-resorpsi { background: #FFEDD5; color: #C2410C; }
        .badge-default { background: #EAF8FF; color: #053247; }

        .signature {
            float: right;
            margin-top: 26px;
            text-align: center;
            width: 230px;
        }

        .qr {
            height: 82px;
            margin: 7px auto;
            width: 82px;
        }

        .verify-line {
            border-top: 1px solid #053247;
            color: #8BAFBF;
            font-size: 7px;
            font-weight: 800;
            letter-spacing: 0.7px;
            margin-top: 5px;
            padding-top: 3px;
            text-transform: uppercase;
        }

        .footer-note {
            clear: both;
            color: #8BAFBF;
            font-size: 8px;
            margin-top: 135px;
            text-align: center;
        }

        .page-break { page-break-before: always; }
    </style>
</head>
<body>
@php
    $activeDetections = $detections->where('is_active', true)->values();
    $abnormalDetections = $activeDetections
        ->filter(fn ($item) => strcasecmp(trim((string) ($item['abnormality'] ?? '')), 'Normal') !== 0)
        ->values();
    $detected = $activeDetections->pluck('no_fdi')->map(fn ($item) => (string) $item)->all();
    $byFdi = $activeDetections->keyBy(fn ($item) => (string) $item['no_fdi']);
    $missingTeeth = max(32 - count(array_unique($detected)), 0);
    $conditions = ['Normal', 'Karies', 'LesiPeriapikal', 'Resorpsi', 'Impaksi'];
    $counts = collect($conditions)
        ->mapWithKeys(fn ($condition) => [
            $condition => $activeDetections->filter(
                fn ($item) => strcasecmp((string) ($item['abnormality'] ?? ''), $condition) === 0
            )->count(),
        ])
        ->all();
    $upper = ['18', '17', '16', '15', '14', '13', '12', '11', '21', '22', '23', '24', '25', '26', '27', '28'];
    $lower = ['48', '47', '46', '45', '44', '43', '42', '41', '31', '32', '33', '34', '35', '36', '37', '38'];
    $classFor = function (?string $condition): string {
        return match (strtolower(trim((string) $condition))) {
            'normal' => 'tooth-normal',
            'karies' => 'tooth-karies',
            'lesiperiapikal' => 'tooth-lesi',
            'impaksi' => 'tooth-impaksi',
            'resorpsi' => 'tooth-resorpsi',
            default => 'tooth-missing',
        };
    };
    $badgeFor = function (?string $condition): string {
        return match (strtolower(trim((string) $condition))) {
            'karies' => 'badge-karies',
            'lesiperiapikal' => 'badge-lesi',
            'impaksi' => 'badge-impaksi',
            'resorpsi' => 'badge-resorpsi',
            default => 'badge-default',
        };
    };
@endphp

<div class="header">
    <div class="brand">Dentalyze <span>AI</span></div>
    <div class="tagline">Laporan Verifikasi Radiograf & Analisis Klinis</div>
</div>

<div class="top-card">
    <table class="info-table">
        <tr>
            <td>
                <span class="label">Nama Pasien</span>
                <span class="value">{{ $patient['name'] ?? '-' }}</span>
            </td>
            <td>
                <span class="label">ID Pemeriksaan</span>
                <span class="value">#{{ $radiograph['id_radiograph'] }}</span>
            </td>
        </tr>
        <tr>
            <td>
                <span class="label">Nomor Induk Kependudukan</span>
                <span class="value">{{ $patient['nik'] ?? '-' }}</span>
            </td>
            <td>
                <span class="label">Tanggal Verifikasi</span>
                <span class="value">{{ $radiograph['verified_at'] ?? '-' }}</span>
            </td>
        </tr>
        <tr>
            <td>
                <span class="label">Dokter Pemeriksa</span>
                <span class="value">{{ $radiograph['doctor_name'] ?? '-' }}</span>
            </td>
            <td>
                <span class="label">Radiografer</span>
                <span class="value">{{ $radiograph['radiographer_name'] ?? '-' }}</span>
            </td>
        </tr>
    </table>
</div>

<table class="summary-table">
    <tr>
        <td class="summary-card">
            <div class="summary-label">Normal</div>
            <div class="summary-value">{{ $counts['Normal'] }}</div>
        </td>
        <td class="summary-card">
            <div class="summary-label">Karies</div>
            <div class="summary-value">{{ $counts['Karies'] }}</div>
        </td>
        <td class="summary-card">
            <div class="summary-label">Lesi</div>
            <div class="summary-value">{{ $counts['LesiPeriapikal'] }}</div>
        </td>
        <td class="summary-card">
            <div class="summary-label">Resorpsi</div>
            <div class="summary-value">{{ $counts['Resorpsi'] }}</div>
        </td>
        <td class="summary-card">
            <div class="summary-label">Impaksi</div>
            <div class="summary-value">{{ $counts['Impaksi'] }}</div>
        </td>
        <td class="summary-card">
            <div class="summary-label">Gigi Hilang</div>
            <div class="summary-value">{{ $missingTeeth }}</div>
        </td>
    </tr>
</table>

<div class="section-title">Citra Radiografi Panoramik</div>
<div class="main-img-box">
    @if($radiograph['image_data_uri'])
        <img src="{{ $radiograph['image_data_uri'] }}" class="main-img" alt="Radiograf">
    @else
        <div style="color: #ffffff; padding: 120px 0;">Gambar radiograf tidak ditemukan</div>
    @endif
</div>

<div class="section-title">Odontogram FDI</div>
<div class="odontogram-box">
    <div class="legend">
        <span class="legend-item"><span class="legend-dot tooth-normal"></span><span class="legend-text">Normal</span></span>
        <span class="legend-item"><span class="legend-dot tooth-karies"></span><span class="legend-text">Karies</span></span>
        <span class="legend-item"><span class="legend-dot tooth-lesi"></span><span class="legend-text">Lesi</span></span>
        <span class="legend-item"><span class="legend-dot tooth-impaksi"></span><span class="legend-text">Impaksi</span></span>
        <span class="legend-item"><span class="legend-dot tooth-resorpsi"></span><span class="legend-text">Resorpsi</span></span>
        <span class="legend-item"><span class="legend-dot tooth-missing"></span><span class="legend-text">Hilang</span></span>
    </div>

    <div class="teeth-row">
        @foreach($upper as $fdi)
            @php($item = $byFdi->get($fdi))
            <span class="tooth {{ $classFor($item['abnormality'] ?? null) }}">{{ $fdi }}</span>
        @endforeach
    </div>
    <div class="midline"></div>
    <div class="teeth-row">
        @foreach($lower as $fdi)
            @php($item = $byFdi->get($fdi))
            <span class="tooth {{ $classFor($item['abnormality'] ?? null) }}">{{ $fdi }}</span>
        @endforeach
    </div>
</div>

<div class="section-title">Hasil Analisis per Gigi</div>
<table class="result-table">
    <thead>
    <tr>
        <th style="width: 75px;">Crop</th>
        <th style="width: 55px;">FDI</th>
        <th style="width: 105px;">Kelainan</th>
        <th>Catatan Dokter</th>
    </tr>
    </thead>
    <tbody>
    @forelse($abnormalDetections as $detection)
        <tr>
            <td>
                @if($detection['crop_image_data_uri'])
                    <img src="{{ $detection['crop_image_data_uri'] }}" class="crop-img" alt="Crop {{ $detection['no_fdi'] }}">
                @else
                    <div class="manual-crop">Manual</div>
                @endif
            </td>
            <td><strong>{{ $detection['no_fdi'] }}</strong></td>
            <td>
                <span class="badge {{ $badgeFor($detection['abnormality'] ?? null) }}">
                    {{ $detection['abnormality'] ?? '-' }}
                </span>
            </td>
            <td>{{ $detection['analysis'] ?: '-' }}</td>
        </tr>
    @empty
        <tr>
            <td colspan="4">Tidak ada kelainan non-normal yang perlu ditampilkan.</td>
        </tr>
    @endforelse
    </tbody>
</table>

<div class="signature">
    <p>{{ $radiograph['verified_at'] ?? date('d F Y') }}</p>
    <p>Dokter Pemeriksa,</p>
    @if($qr_code_data_uri)
        <img src="{{ $qr_code_data_uri }}" class="qr" alt="QR Verifikasi">
    @endif
    <p><strong>{{ $radiograph['doctor_name'] ?? 'Admin DeTech' }}</strong></p>
    <div class="verify-line">Scan to verify original document</div>
</div>

<div class="footer-note">
        Dokumen ini diterbitkan oleh Dentalyze AI dan dapat divalidasi melalui QR code.
</div>
</body>
</html>
