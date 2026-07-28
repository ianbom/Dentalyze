import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Download, Play, Save, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { dashboard } from '@/routes';
import radiographs from '@/routes/radiographs';
import radiographReports from '@/routes/reports/radiographs';

type Detection = {
    id_detection?: number;
    no_fdi: string;
    abnormality: string;
    analysis: string | null;
    bbox?: number[] | null;
    confidence?: number | null;
    crop_image?: string | null;
    is_active: boolean;
    source: string;
    crop_image_url?: string | null;
};
type AnalyzePayload = {
    message?: string;
    result_image?: string | null;
    result_image_url?: string | null;
    results?: Detection[];
};
type Props = {
    radiograph: {
        id_radiograph: string;
        patient: {
            name: string;
            nik: string;
            phone?: string | null;
            email?: string | null;
            age?: number | null;
            address?: string | null;
        };
        doctor_name: string | null;
        radiographer_name: string | null;
        image_url: string;
        result_image_url: string | null;
        preview_result_image?: string | null;
        status: string;
    };
    detections: Detection[];
    permissions: { analyze: boolean; finalize: boolean };
};

const fdiRows = [
    [
        '18',
        '17',
        '16',
        '15',
        '14',
        '13',
        '12',
        '11',
        '21',
        '22',
        '23',
        '24',
        '25',
        '26',
        '27',
        '28',
    ],
    [
        '48',
        '47',
        '46',
        '45',
        '44',
        '43',
        '42',
        '41',
        '31',
        '32',
        '33',
        '34',
        '35',
        '36',
        '37',
        '38',
    ],
];
const abnormalities = [
    'Normal',
    'Karies',
    'LesiPeriapikal',
    'Impaksi',
    'Resorpsi',
];
const conditionStyles: Record<string, string> = {
    Normal: 'bg-emerald-400 text-white shadow-[0_10px_22px_rgba(16,185,129,0.22)]',
    Karies: 'bg-amber-300 text-[#5C4200] shadow-[0_10px_22px_rgba(245,158,11,0.18)]',
    LesiPeriapikal:
        'bg-violet-500 text-white shadow-[0_10px_22px_rgba(139,92,246,0.2)]',
    Impaksi: 'bg-sky-500 text-white shadow-[0_10px_22px_rgba(14,165,233,0.2)]',
    Resorpsi:
        'bg-orange-500 text-white shadow-[0_10px_22px_rgba(249,115,22,0.2)]',
};
const legend = [
    ['Normal / terdeteksi', 'bg-emerald-400'],
    ['Gigi hilang / tidak terdeteksi', 'bg-[#8EA2B9]'],
    ['Dibatalkan', 'bg-rose-500'],
    ['Lesi periapikal', 'bg-violet-500'],
    ['Impaksi', 'bg-sky-500'],
    ['Resorpsi', 'bg-orange-500'],
    ['Karies', 'bg-amber-300'],
];

export default function DetectionShow({
    detections,
    permissions,
    radiograph,
}: Props) {
    const [items, setItems] = useState<Detection[]>(detections);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [saving, setSaving] = useState(false);
    const [resultImageUrl, setResultImageUrl] = useState<string | null>(
        radiograph.result_image_url,
    );
    const [resultImagePath, setResultImagePath] = useState<string | null>(
        radiograph.preview_result_image ?? null,
    );
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [analysisNotice, setAnalysisNotice] = useState<string | null>(null);
    const [selectedFdi, setSelectedFdi] = useState<string | null>(null);
    const { auth } = usePage().props as {
        auth?: { user?: { role?: string } };
    };
    const isPatient = auth?.user?.role === 'pasien';
    const isFinalized = radiograph.status === 'terverifikasi';
    const canManageDetections =
        !isFinalized && (permissions.analyze || permissions.finalize);

    useEffect(() => {
        if (!analyzing) {
            return;
        }

        document.body.style.overflow = 'hidden';
        const timer = window.setInterval(() => {
            setAnalysisProgress((current) =>
                Math.min(
                    current + Math.max(1, Math.round((94 - current) / 8)),
                    94,
                ),
            );
        }, 650);

        return () => {
            window.clearInterval(timer);
            document.body.style.overflow = '';
        };
    }, [analyzing]);

    const byFdi = useMemo(
        () => new Map(items.map((item) => [item.no_fdi, item])),
        [items],
    );
    const activeItems = useMemo(
        () => items.filter((item) => item.is_active),
        [items],
    );

    function toggle(fdi: string) {
        setItems((current) =>
            current.map((item) =>
                item.no_fdi === fdi
                    ? { ...item, is_active: !item.is_active }
                    : item,
            ),
        );
    }

    function selectTooth(fdi: string) {
        if (!canManageDetections) {
            return;
        }

        if (!byFdi.has(fdi)) {
            setItems((current) => [
                ...current,
                {
                    no_fdi: fdi,
                    abnormality: 'Karies',
                    analysis: '',
                    is_active: true,
                    source: 'manual',
                },
            ]);
        }

        setSelectedFdi(fdi);
    }

    function updateDetection(fdi: string, changes: Partial<Detection>): void {
        setItems((current) =>
            current.map((item) =>
                item.no_fdi === fdi ? { ...item, ...changes } : item,
            ),
        );
    }

    function save() {
        router.post(
            radiographs.finalize.url(radiograph.id_radiograph),
            {
                detections: items,
                result_image: resultImagePath,
            },
            {
                onStart: () => setSaving(true),
                onFinish: () => setSaving(false),
            },
        );
    }

    async function analyze() {
        setAnalysisProgress(8);
        setAnalyzing(true);
        setAnalysisError(null);
        setAnalysisNotice(null);

        try {
            const response = await fetch(
                radiographs.analyze.url(radiograph.id_radiograph),
                {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') ?? '',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({}),
                },
            );

            const responseText = await response.text();
            let payload: AnalyzePayload = {};

            try {
                payload = responseText
                    ? (JSON.parse(responseText) as AnalyzePayload)
                    : {};
            } catch {
                throw new Error(
                    `Laravel mengembalikan response non-JSON (HTTP ${response.status}). Cuplikan: ${responseText.slice(0, 180)}`,
                );
            }

            if (!response.ok) {
                throw new Error(
                    payload.message ??
                        `AI gagal mengembalikan hasil deteksi (HTTP ${response.status}).`,
                );
            }

            const results = payload.results ?? [];

            setAnalysisProgress(100);
            setItems(results);
            setResultImageUrl(payload.result_image_url ?? null);
            setResultImagePath(payload.result_image ?? null);

            if (results.length === 0) {
                setAnalysisError(
                    'AI tidak mengembalikan odontogram. Cek terminal FastAPI untuk detail error model.',
                );

                return;
            }

            setAnalysisNotice(
                payload.message ??
                    `AI berhasil mengembalikan ${results.length} hasil deteksi sementara. Lengkapi catatan lalu simpan final.`,
            );
        } catch (error) {
            setAnalysisError(
                error instanceof Error
                    ? error.message
                    : 'AI gagal mengembalikan hasil deteksi.',
            );
        } finally {
            window.setTimeout(() => setAnalyzing(false), 250);
        }
    }

    const isVerified = radiograph.status === 'terverifikasi';
    const selectedItem = selectedFdi ? byFdi.get(selectedFdi) : undefined;
    const visibleTableItems = useMemo(
        () =>
            items.filter(
                (item) =>
                    item.abnormality !== 'Normal' ||
                    item.source === 'manual' ||
                    !item.is_active,
            ),
        [items],
    );

    return (
        <>
            <Head title={`Detail Deteksi ${radiograph.id_radiograph}`} />
            <div
                className={
                    isPatient ? 'space-y-6 px-12 pb-12 lg:px-20' : 'space-y-6'
                }
            >
                {isPatient && (
                    <header className="flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/70 px-5 py-5 shadow-[0_18px_45px_rgba(19,184,255,0.08)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[11px] font-black tracking-[0.28em] text-[#49ddd7] uppercase">
                                Detail Radiograf
                            </p>
                            <h1 className="mt-2 text-[28px] font-black tracking-[-0.03em] text-[#132f67]">
                                {radiograph.id_radiograph}
                            </h1>
                        </div>
                        <Link
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] px-5 text-xs font-black tracking-[0.14em] text-white uppercase shadow-[0_16px_35px_rgba(19,184,255,0.22)] transition hover:-translate-y-0.5"
                            href={dashboard()}
                        >
                            <ArrowLeft size={16} />
                            Kembali ke Dashboard
                        </Link>
                    </header>
                )}
                {analyzing && (
                    <div className="fixed inset-0 z-[9999] grid min-h-[100dvh] place-items-center bg-[#EAF8FF]/90 backdrop-blur-md">
                        <div className="w-[min(420px,calc(100vw-32px))] rounded-[28px] border border-white/80 bg-white/70 p-7 text-center shadow-[0_24px_70px_rgba(8,120,232,0.18)]">
                            <div className="mx-auto size-14 animate-spin rounded-full border-4 border-[#CDEEFF] border-t-[#0878e8]" />
                            <h3 className="mt-5 text-xl font-black text-[#0878e8]">
                                Menganalisis Radiograf
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-[#62708f]">
                                AI sedang membuat bounding box, odontogram, dan
                                crop gigi. Jangan tutup halaman ini.
                            </p>
                            <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#D8F0FC]">
                                <div
                                    className="h-full rounded-full bg-[linear-gradient(90deg,#13b8ff,#0878e8)] transition-[width] duration-500"
                                    style={{ width: `${analysisProgress}%` }}
                                />
                            </div>
                            <p className="mt-2 text-sm font-black text-[#0878e8]">
                                {analysisProgress}%
                            </p>
                        </div>
                    </div>
                )}
                <section className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
                    <div className="group relative overflow-hidden rounded-[34px] border border-white/75 bg-white/45 p-7 shadow-[0_24px_60px_rgba(19,184,255,0.12)] backdrop-blur-md">
                        <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-[#86d8ff]/20 blur-3xl transition group-hover:scale-110" />
                        <img
                            alt=""
                            className="pointer-events-none absolute -right-24 -bottom-32 w-72 opacity-[0.07] transition duration-500 group-hover:scale-105 group-hover:opacity-[0.11]"
                            src="/asset/images/gigi.png"
                        />
                        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                            <div className="min-w-0">
                                <p className="text-[11px] font-black tracking-[0.42em] text-[#49ddd7] uppercase">
                                    PASIEN TERKAIT
                                </p>
                                <h2 className="mt-3 truncate text-[36px] leading-tight font-black tracking-[-0.03em] text-[#0878e8]">
                                    {radiograph.patient.name}
                                </h2>
                                <p className="mt-2 text-sm font-semibold text-[#7B8BA7]">
                                    Informasi pasien untuk analisis radiograf
                                    dan validasi odontogram.
                                </p>
                            </div>
                            <span className="grid size-20 shrink-0 place-items-center rounded-[24px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] text-3xl font-black text-white shadow-[0_20px_45px_rgba(8,120,232,0.24)]">
                                {radiograph.patient.name
                                    .slice(0, 1)
                                    .toUpperCase()}
                            </span>
                        </div>
                        <div className="relative z-10 mt-6 grid gap-3 text-sm text-[#526184] md:grid-cols-2">
                            <Info label="NIK" value={radiograph.patient.nik} />
                            <Info
                                label="Telepon"
                                value={radiograph.patient.phone ?? '-'}
                            />
                            <Info
                                label="Email"
                                value={radiograph.patient.email ?? '-'}
                            />
                            <Info
                                label="Usia"
                                value={
                                    radiograph.patient.age
                                        ? `${radiograph.patient.age} tahun`
                                        : '-'
                                }
                            />
                        </div>
                    </div>
                    <div className="relative overflow-hidden rounded-[34px] bg-[linear-gradient(135deg,#073d52_0%,#0a5268_58%,#0878e8_145%)] p-7 text-white shadow-[0_28px_70px_rgba(7,61,82,0.24)]">
                        <div className="absolute -top-20 -right-12 h-52 w-52 rounded-full bg-[#49ddd7]/18 blur-3xl" />
                        <div className="absolute -bottom-24 left-10 h-52 w-52 rounded-full bg-[#13b8ff]/18 blur-3xl" />
                        <div className="relative z-10">
                            <p className="text-[11px] font-black tracking-[0.42em] text-white/58 uppercase">
                                Radiograf
                            </p>
                            <h3 className="mt-3 text-[26px] leading-tight font-black break-words">
                                {radiograph.id_radiograph}
                            </h3>
                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                <DarkInfo
                                    label="Radiografer"
                                    value={radiograph.radiographer_name ?? '-'}
                                />
                                <DarkInfo
                                    label="Dokter"
                                    value={
                                        radiograph.doctor_name ??
                                        'Belum dianalisis'
                                    }
                                />
                            </div>
                            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
                                {/* STATUS */}
                                <div
                                    className={`inline-flex h-11 items-center gap-2 rounded-[14px] px-5 text-xs font-black tracking-[0.18em] uppercase shadow-[0_10px_28px_rgba(0,0,0,0.12)] backdrop-blur-md ${
                                        radiograph.status === 'terverifikasi'
                                            ? 'bg-emerald-400/18 text-emerald-100'
                                            : 'bg-cyan-400/18 text-cyan-100'
                                    }`}
                                >
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span
                                            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                                                radiograph.status ===
                                                'terverifikasi'
                                                    ? 'bg-emerald-300'
                                                    : 'bg-cyan-300'
                                            }`}
                                        />

                                        <span
                                            className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                                                radiograph.status ===
                                                'terverifikasi'
                                                    ? 'bg-emerald-300'
                                                    : 'bg-cyan-300'
                                            }`}
                                        />
                                    </span>

                                    {radiograph.status}
                                </div>

                                {/* BUTTON */}
                                {permissions.analyze && !isVerified && (
                                    <button
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-white px-6 text-xs font-black tracking-[0.16em] text-[#073d52] uppercase shadow-[0_18px_38px_rgba(255,255,255,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f4fbff]"
                                        disabled={analyzing}
                                        onClick={analyze}
                                        type="button"
                                    >
                                        <Play size={15} strokeWidth={2.5} />

                                        {analyzing
                                            ? 'Menganalisis...'
                                            : 'Mulai Deteksi'}
                                    </button>
                                )}
                            </div>
                        </div>
                        {(analysisNotice || analysisError) && (
                            <div
                                className={`mt-5 rounded-[16px] px-4 py-3 text-sm font-semibold ${
                                    analysisError
                                        ? 'bg-rose-400/15 text-rose-100'
                                        : 'bg-emerald-400/15 text-emerald-100'
                                }`}
                            >
                                {analysisError ?? analysisNotice}
                            </div>
                        )}
                    </div>
                </section>

                <section
                    className={`mt-6 grid gap-5 ${isVerified ? 'xl:grid-cols-1' : 'xl:grid-cols-2'}`}
                >
                    <ImagePanel
                        title="Original Image"
                        src={radiograph.image_url}
                    />
                    {!isVerified && (
                        <ImagePanel
                            title="AI Detection + Bounding Box"
                            src={resultImageUrl ?? radiograph.image_url}
                        />
                    )}
                </section>

                <section className="mt-6 rounded-[30px] border border-white/70 bg-white/35 p-6 shadow-[0_24px_55px_rgba(19,184,255,0.1)] backdrop-blur-md">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-black tracking-[0.42em] text-[#49ddd7] uppercase">
                                ODONTOGRAM FDI
                            </p>
                            <p className="mt-2 text-sm text-[#808999] italic">
                                {canManageDetections
                                    ? 'Klik nomor gigi untuk membatalkan atau mengaktifkan hasil deteksi.'
                                    : 'Nomor gigi ditampilkan sebagai ringkasan hasil final pasien.'}
                            </p>
                        </div>
                        {isVerified && (
                            <Link
                                className="inline-flex h-10 items-center gap-2 rounded-[12px] bg-white/50 px-4 text-xs font-black text-[#0878e8]"
                                href={radiographReports.pdf(
                                    radiograph.id_radiograph,
                                )}
                            >
                                <Download size={14} /> PDF
                            </Link>
                        )}
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                        {legend.map(([label, color]) => (
                            <span
                                className="inline-flex items-center gap-2 rounded-full bg-white/55 px-3 py-2 text-[11px] font-black text-[#526184]"
                                key={label}
                            >
                                <span
                                    className={`size-3 rounded-full ${color}`}
                                />
                                {label}
                            </span>
                        ))}
                    </div>
                    <div className="mt-6 space-y-4 rounded-[24px] border border-white/70 bg-white/40 p-6">
                        {fdiRows.map((row) => (
                            <div
                                className="flex flex-wrap justify-center gap-2"
                                key={row.join('-')}
                            >
                                {row.map((fdi) => {
                                    const item = byFdi.get(fdi);

                                    return (
                                        <button
                                            className={`grid h-14 w-14 place-items-center rounded-[14px] text-sm font-black transition ${
                                                item
                                                    ? item.is_active
                                                        ? (conditionStyles[
                                                              item.abnormality
                                                          ] ??
                                                          conditionStyles.Normal)
                                                        : 'bg-rose-500 text-white line-through shadow-[0_10px_22px_rgba(244,63,94,0.2)]'
                                                    : 'border-2 border-dashed border-[#8EA2B9]/70 bg-[#E0ECF5] text-[#7B8BA7] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_22px_rgba(56,120,168,0.10)]'
                                            }`}
                                            key={fdi}
                                            onClick={() => selectTooth(fdi)}
                                            type="button"
                                            title={
                                                item
                                                    ? `${fdi} - ${item.abnormality}`
                                                    : `${fdi} - gigi hilang / tidak terdeteksi`
                                            }
                                        >
                                            {fdi}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {canManageDetections && (
                        <p className="mt-5 text-sm font-semibold text-[#62708f]">
                            Klik gigi berwarna abu-abu untuk menambahkan hasil
                            manual.
                        </p>
                    )}
                </section>

                <section className="mt-6 rounded-[30px] border border-white/70 bg-white/35 p-6 shadow-[0_24px_55px_rgba(19,184,255,0.1)] backdrop-blur-md">
                    <p className="text-[11px] font-black tracking-[0.42em] text-[#49ddd7] uppercase">
                        Tabel Hasil Per Gigi
                    </p>
                    <div className="mt-5">
                        {analyzing && (
                            <p className="rounded-[20px] border border-sky-200/70 bg-sky-50/70 p-5 text-sm font-semibold text-[#0878e8]">
                                AI sedang membaca radiograf. Proses pertama bisa
                                lebih lama karena model dimuat ke memori.
                            </p>
                        )}
                        {analysisError && (
                            <p className="rounded-[20px] border border-rose-200/70 bg-rose-50/70 p-5 text-sm font-semibold text-rose-500">
                                {analysisError}
                            </p>
                        )}
                        {!analyzing && items.length === 0 && (
                            <p className="rounded-[20px] border border-white/70 bg-white/45 p-5 text-sm text-[#7B8BA7]">
                                Belum ada hasil crop. Klik Mulai Deteksi untuk
                                menjalankan AI.
                            </p>
                        )}
                        {items.length > 0 && visibleTableItems.length === 0 && (
                            <p className="rounded-[20px] border border-emerald-200/70 bg-emerald-50/70 p-5 text-sm font-semibold text-emerald-600">
                                Semua gigi yang terdeteksi berstatus normal,
                                jadi tidak ditampilkan di tabel hasil.
                            </p>
                        )}
                        {visibleTableItems.length > 0 && (
                            <div className="overflow-hidden rounded-[22px] border border-white/70 bg-white/45">
                                <table className="w-full min-w-[760px] text-left text-sm">
                                    <thead className="bg-white/55 text-[11px] font-black tracking-[0.22em] text-[#9ea6b6] uppercase">
                                        <tr>
                                            <th className="px-4 py-3 text-left">
                                                Crop
                                            </th>
                                            <th className="px-4 py-3 text-left">
                                                FDI
                                            </th>
                                            <th className="px-4 py-3 text-left">
                                                Kelainan
                                            </th>
                                            <th className="w-[38%] px-4 py-3 text-left">
                                                Catatan Dokter
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/70">
                                        {visibleTableItems.map(
                                            (item, index) => (
                                                <tr
                                                    className={
                                                        item.is_active
                                                            ? 'text-[#526184]'
                                                            : 'bg-rose-50/60 text-rose-500'
                                                    }
                                                    key={`${item.no_fdi}-row-${index}`}
                                                >
                                                    <td className="px-4 py-3 text-left">
                                                        {item.crop_image_url ? (
                                                            <img
                                                                alt={`Gigi ${item.no_fdi}`}
                                                                className="size-20 rounded-[14px] bg-black object-cover"
                                                                src={
                                                                    item.crop_image_url
                                                                }
                                                            />
                                                        ) : (
                                                            <div className="grid size-20 place-items-center rounded-[14px] bg-white/70 text-[9px] font-black text-[#b5bfce] uppercase">
                                                                Manual
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-left font-black text-[#0878e8]">
                                                        {item.no_fdi}
                                                    </td>
                                                    <td className="px-4 py-3 text-left">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                                                                item.is_active
                                                                    ? (conditionStyles[
                                                                          item
                                                                              .abnormality
                                                                      ] ??
                                                                      conditionStyles.Normal)
                                                                    : 'bg-rose-500 text-white'
                                                            }`}
                                                        >
                                                            {item.is_active
                                                                ? item.abnormality
                                                                : 'Dibatalkan'}
                                                        </span>
                                                    </td>
                                                    <td className="w-[38%] px-4 py-3 text-left align-middle">
                                                        <div className="flex min-h-20 max-w-xl items-start justify-between gap-4 text-left">
                                                            <p className="min-w-0 flex-1 pt-1 text-left text-xs leading-5 text-[#7B8BA7]">
                                                                {item.analysis ??
                                                                    'Belum ada catatan'}
                                                            </p>
                                                            {canManageDetections && (
                                                                <button
                                                                    className="shrink-0 rounded-[13px] border border-sky-100/80 bg-sky-50/90 px-4 py-2 text-xs font-black text-[#0878e8] shadow-[0_10px_22px_rgba(14,165,233,0.12)] transition hover:-translate-y-0.5 hover:bg-white"
                                                                    onClick={() =>
                                                                        setSelectedFdi(
                                                                            item.no_fdi,
                                                                        )
                                                                    }
                                                                    type="button"
                                                                >
                                                                    {item.analysis
                                                                        ? 'Edit Catatan'
                                                                        : 'Tambah Catatan'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>

                <section className="mt-6 rounded-[30px] border border-white/70 bg-white/35 p-6 shadow-[0_24px_55px_rgba(19,184,255,0.1)] backdrop-blur-md">
                    {permissions.finalize && !isVerified && (
                        <button
                            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-emerald-500 px-6 text-xs font-black tracking-wider text-white uppercase shadow-[0_12px_28px_rgba(16,185,129,0.22)] disabled:cursor-not-allowed disabled:opacity-55"
                            disabled={saving || activeItems.length === 0}
                            onClick={save}
                            type="button"
                        >
                            <Save size={16} />
                            {saving ? 'Menyimpan' : 'Simpan Hasil Final'}
                        </button>
                    )}
                    {isVerified && (
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link
                                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[14px] bg-[#073d52] px-6 text-xs font-black tracking-wider text-white uppercase"
                                href={radiographReports.pdf(
                                    radiograph.id_radiograph,
                                )}
                            >
                                <Download size={16} /> Buka Laporan PDF
                            </Link>
                        </div>
                    )}
                </section>
                {canManageDetections && selectedItem && (
                    <div className="fixed inset-0 z-50 grid place-items-center bg-[#082f49]/30 p-4 backdrop-blur-sm">
                        <div className="w-[min(560px,100%)] rounded-[28px] border border-white/80 bg-[#F4FBFF] p-6 shadow-[0_24px_70px_rgba(8,120,232,0.22)]">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[11px] font-black tracking-[0.34em] text-[#49ddd7] uppercase">
                                        Analisis Gigi
                                    </p>
                                    <h3 className="mt-2 text-2xl font-black text-[#0878e8]">
                                        FDI {selectedItem.no_fdi}
                                    </h3>
                                </div>
                                <button
                                    className="grid size-10 place-items-center rounded-full bg-white/70 text-[#526184]"
                                    onClick={() => setSelectedFdi(null)}
                                    type="button"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <label className="space-y-2">
                                    <span className="text-[11px] font-black tracking-[0.2em] text-[#9ea6b6] uppercase">
                                        Kelainan
                                    </span>
                                    <select
                                        className="h-12 w-full rounded-[14px] border border-white/70 bg-white/60 px-4 text-sm text-[#22304F] transition outline-none focus:border-[#13b8ff] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                                        onChange={(event) =>
                                            updateDetection(
                                                selectedItem.no_fdi,
                                                {
                                                    abnormality:
                                                        event.target.value,
                                                },
                                            )
                                        }
                                        value={selectedItem.abnormality}
                                    >
                                        {abnormalities.map((item) => (
                                            <option
                                                className="bg-white text-[#22304F]"
                                                key={item}
                                            >
                                                {item}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="space-y-2">
                                    <span className="text-[11px] font-black tracking-[0.2em] text-[#9ea6b6] uppercase">
                                        Status
                                    </span>
                                    <button
                                        className={`h-12 w-full rounded-[14px] text-xs font-black uppercase ${
                                            selectedItem.is_active
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-rose-500 text-white'
                                        }`}
                                        onClick={() =>
                                            toggle(selectedItem.no_fdi)
                                        }
                                        type="button"
                                    >
                                        {selectedItem.is_active
                                            ? 'Aktif / Disimpan'
                                            : 'Dibatalkan'}
                                    </button>
                                </label>
                            </div>
                            <label className="mt-5 block space-y-2">
                                <span className="text-[11px] font-black tracking-[0.2em] text-[#9ea6b6] uppercase">
                                    Catatan Analisis
                                </span>
                                <textarea
                                    className="min-h-36 w-full rounded-[18px] border border-white/70 bg-white/65 p-4 text-sm text-[#22304F] transition outline-none placeholder:text-[#9BA8BC] focus:border-[#13b8ff]"
                                    onChange={(event) =>
                                        updateDetection(selectedItem.no_fdi, {
                                            analysis: event.target.value,
                                        })
                                    }
                                    placeholder="Tambahkan analisis dokter untuk gigi ini"
                                    value={selectedItem.analysis ?? ''}
                                />
                            </label>
                            <button
                                className="mt-5 h-12 w-full rounded-[14px] bg-[#073d52] text-xs font-black text-white uppercase"
                                onClick={() => setSelectedFdi(null)}
                                type="button"
                            >
                                Simpan Catatan
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-[18px] border border-white/70 bg-white/50 px-4 py-3 shadow-[0_12px_28px_rgba(19,184,255,0.08)] backdrop-blur-md">
            <p className="text-[10px] font-black tracking-[0.22em] text-[#9ea6b6] uppercase">
                {label}
            </p>
            <p className="mt-2 truncate font-bold text-[#526184]">{value}</p>
        </div>
    );
}

function DarkInfo({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-[18px] border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-md">
            <p className="text-[10px] font-black tracking-[0.22em] text-white/42 uppercase">
                {label}
            </p>
            <p className="mt-2 truncate font-bold text-white/86">{value}</p>
        </div>
    );
}

function ImagePanel({ src, title }: { src: string; title: string }) {
    return (
        <figure className="rounded-[24px] border border-white/70 bg-white/40 p-4 shadow-sm backdrop-blur-md">
            <p className="mb-3 text-center text-[11px] font-black tracking-[0.28em] text-[#9ea6b6] uppercase">
                {title}
            </p>
            <img
                alt={title}
                className="h-80 w-full rounded-[18px] bg-black object-contain"
                src={src}
            />
        </figure>
    );
}

DetectionShow.layout = ({ radiograph }: Props) => ({
    breadcrumbs: [
        { title: 'Deteksi Penyakit', href: radiographs.index() },
        {
            title: 'Detail Deteksi',
            href: radiographs.show(radiograph.id_radiograph),
        },
    ],
});
