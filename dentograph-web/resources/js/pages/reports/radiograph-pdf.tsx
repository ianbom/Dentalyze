import { Head } from '@inertiajs/react';
import { Download, ShieldCheck } from 'lucide-react';
import radiographReports from '@/routes/reports/radiographs';

type Detection = {
    no_fdi: string;
    abnormality: string;
    analysis: string | null;
    crop_image_url: string | null;
    is_active: boolean;
};

type Props = {
    radiograph: {
        id_radiograph: string;
        doctor_name: string | null;
        radiographer_name: string | null;
        image_url: string;
        result_image_url: string | null;
        status: string;
        created_at: string | null;
        verified_at: string | null;
        verification_url: string;
    };
    patient: {
        nik: string;
        name: string | null;
        email: string | null;
        phone: string | null;
        age: number | null;
        address: string | null;
    };
    detections: Detection[];
    qr_code: string;
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

const conditionStyles: Record<string, string> = {
    Normal: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    Karies: 'bg-amber-100 text-amber-700 ring-amber-200',
    LesiPeriapikal: 'bg-violet-100 text-violet-700 ring-violet-200',
    Impaksi: 'bg-sky-100 text-sky-700 ring-sky-200',
    Resorpsi: 'bg-orange-100 text-orange-700 ring-orange-200',
};

export default function RadiographPdf({
    detections,
    patient,
    qr_code,
    radiograph,
}: Props) {
    const activeDetections = detections.filter((item) => item.is_active);
    const abnormalDetections = activeDetections.filter(
        (item) => item.abnormality.trim().toLowerCase() !== 'normal',
    );
    const byFdi = new Map(activeDetections.map((item) => [item.no_fdi, item]));
    const missingTeethCount = Math.max(32 - byFdi.size, 0);
    const abnormalCount = abnormalDetections.length;
    const conditionCounts = {
        Normal: countCondition(activeDetections, 'Normal'),
        Karies: countCondition(activeDetections, 'Karies'),
        LesiPeriapikal: countCondition(activeDetections, 'LesiPeriapikal'),
        Resorpsi: countCondition(activeDetections, 'Resorpsi'),
        Impaksi: countCondition(activeDetections, 'Impaksi'),
    };

    return (
        <>
            <Head title={`Laporan ${radiograph.id_radiograph}`} />
            <main className="min-h-screen bg-[#eaf8ff] px-6 py-8 text-[#0B3550] print:bg-white print:px-0 print:py-0">
                <div className="mx-auto max-w-[1060px] space-y-6 print:max-w-none print:space-y-4">
                    <div className="flex justify-end gap-3 print:hidden">
                        <a
                            className="inline-flex h-11 items-center gap-2 rounded-[14px] bg-[#073d52] px-5 text-xs font-black tracking-wider text-white uppercase shadow-[0_12px_28px_rgba(7,61,82,0.2)]"
                            href={radiographReports.download.url(
                                radiograph.id_radiograph,
                            )}
                        >
                            <Download size={16} /> Download PDF
                        </a>
                    </div>

                    <section className="overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-[0_28px_70px_rgba(19,184,255,0.12)] print:rounded-none print:border-0 print:shadow-none">
                        <header className="relative overflow-hidden bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_58%,#054963_100%)] px-9 py-8 text-white print:px-8">
                            <img
                                alt=""
                                className="pointer-events-none absolute -right-14 -bottom-24 w-72 opacity-15"
                                src="/asset/images/gigi.png"
                            />
                            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                                <div>
                                    <p className="text-[11px] font-black tracking-[0.38em] text-white/70 uppercase">
                                        Dentalyze AI Medical Report
                                    </p>
                                    <h1 className="mt-3 text-4xl leading-tight font-black">
                                        Laporan Deteksi Radiograf
                                    </h1>
                                    <p className="mt-3 text-sm font-semibold text-white/78">
                                        {radiograph.id_radiograph}
                                    </p>
                                </div>
                                <div className="rounded-[22px] border border-white/25 bg-white/16 px-5 py-4 backdrop-blur-md">
                                    <p className="text-[10px] font-black tracking-[0.28em] text-white/65 uppercase">
                                        Status Dokumen
                                    </p>
                                    <p className="mt-2 flex items-center gap-2 text-lg font-black">
                                        <ShieldCheck size={20} />
                                        Terverifikasi
                                    </p>
                                </div>
                            </div>
                        </header>

                        <div className="space-y-7 px-9 py-8 print:px-8 print:py-6">
                            <section className="grid gap-4 md:grid-cols-4">
                                <SummaryCard
                                    label="Nama Pasien"
                                    value={patient.name ?? '-'}
                                />
                                <SummaryCard
                                    label="Total Temuan"
                                    value={`${abnormalCount} gigi`}
                                />
                                <SummaryCard
                                    label="Tanggal Verifikasi"
                                    value={radiograph.verified_at ?? '-'}
                                />
                                <SummaryCard
                                    label="Gigi Hilang"
                                    value={`${missingTeethCount} gigi`}
                                />
                            </section>

                            <section className="rounded-[26px] border border-[#D7EDF8] bg-[#F7FCFF] p-5 print:break-inside-avoid">
                                <p className="text-[10px] font-black tracking-[0.36em] text-[#49ddd7] uppercase">
                                    Ringkasan Kondisi Gigi
                                </p>
                                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 print:grid-cols-6">
                                    <ConditionCard
                                        label="Normal"
                                        value={conditionCounts.Normal}
                                    />
                                    <ConditionCard
                                        label="Karies"
                                        value={conditionCounts.Karies}
                                    />
                                    <ConditionCard
                                        label="Lesi"
                                        value={conditionCounts.LesiPeriapikal}
                                    />
                                    <ConditionCard
                                        label="Resorpsi"
                                        value={conditionCounts.Resorpsi}
                                    />
                                    <ConditionCard
                                        label="Impaksi"
                                        value={conditionCounts.Impaksi}
                                    />
                                    <ConditionCard
                                        label="Gigi Hilang"
                                        value={missingTeethCount}
                                    />
                                </div>
                            </section>

                            <section className="grid gap-5 md:grid-cols-2">
                                <Info
                                    title="Informasi Pasien"
                                    rows={[
                                        ['NIK', patient.nik],
                                        ['Nama', patient.name ?? '-'],
                                        ['Telepon', patient.phone ?? '-'],
                                        ['Email', patient.email ?? '-'],
                                        [
                                            'Usia',
                                            patient.age
                                                ? `${patient.age} tahun`
                                                : '-',
                                        ],
                                        ['Alamat', patient.address ?? '-'],
                                    ]}
                                />
                                <Info
                                    title="Informasi Pemeriksaan"
                                    rows={[
                                        [
                                            'Radiografer',
                                            radiograph.radiographer_name ?? '-',
                                        ],
                                        [
                                            'Dokter pemeriksa',
                                            radiograph.doctor_name ?? '-',
                                        ],
                                        [
                                            'Tanggal upload',
                                            radiograph.created_at ?? '-',
                                        ],
                                        [
                                            'Tanggal verifikasi',
                                            radiograph.verified_at ?? '-',
                                        ],
                                        ['Status', radiograph.status],
                                    ]}
                                />
                            </section>

                            <section className="print:break-inside-avoid">
                                <ImageBlock
                                    src={radiograph.image_url}
                                    title="Radiograf Awal"
                                />
                            </section>

                            <section className="rounded-[26px] border border-[#D7EDF8] bg-[#F7FCFF] p-5 print:break-inside-avoid">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <p className="text-[10px] font-black tracking-[0.36em] text-[#49ddd7] uppercase">
                                            Odontogram FDI
                                        </p>
                                        <h2 className="mt-2 text-xl font-black text-[#0878e8]">
                                            Peta Kelainan Gigi
                                        </h2>
                                    </div>
                                    <Legend />
                                </div>
                                <div className="mt-5 space-y-3">
                                    {fdiRows.map((row) => (
                                        <div
                                            className="flex flex-wrap justify-center gap-2"
                                            key={row.join('-')}
                                        >
                                            {row.map((fdi) => {
                                                const item = byFdi.get(fdi);

                                                return (
                                                    <span
                                                        className={`grid h-12 w-12 place-items-center rounded-[14px] text-sm font-black ring-1 ${
                                                            item
                                                                ? (conditionStyles[
                                                                      item
                                                                          .abnormality
                                                                  ] ??
                                                                  conditionStyles.Normal)
                                                                : 'bg-slate-100 text-slate-300 ring-slate-200'
                                                        }`}
                                                        key={fdi}
                                                    >
                                                        {fdi}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <p className="text-[10px] font-black tracking-[0.36em] text-[#49ddd7] uppercase">
                                    Detail Hasil
                                </p>
                                <h2 className="mt-2 text-xl font-black text-[#0878e8]">
                                    Crop Gigi dan Catatan Dokter
                                </h2>
                                <div className="mt-4 overflow-hidden rounded-[22px] border border-[#D7EDF8]">
                                    <table className="w-full border-collapse bg-white text-left text-sm">
                                        <thead className="bg-[#EEF8FF] text-[10px] font-black tracking-[0.22em] text-[#8EA2B9] uppercase">
                                            <tr>
                                                <th className="px-4 py-3">
                                                    Crop
                                                </th>
                                                <th className="px-4 py-3">
                                                    FDI
                                                </th>
                                                <th className="px-4 py-3">
                                                    Kelainan
                                                </th>
                                                <th className="px-4 py-3">
                                                    Catatan Dokter
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#E5F3FA]">
                                            {abnormalDetections.map((item) => (
                                                <tr
                                                    key={`${item.no_fdi}-${item.abnormality}`}
                                                >
                                                    <td className="px-4 py-3 align-top">
                                                        {item.crop_image_url ? (
                                                            <img
                                                                alt={`Gigi ${item.no_fdi}`}
                                                                className="size-16 rounded-[12px] bg-black object-cover"
                                                                src={
                                                                    item.crop_image_url
                                                                }
                                                            />
                                                        ) : (
                                                            <span className="text-xs text-slate-400">
                                                                Manual
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 align-top font-black text-[#0878e8]">
                                                        {item.no_fdi}
                                                    </td>
                                                    <td className="px-4 py-3 align-top">
                                                        <span className="rounded-full bg-[#EAF8FF] px-3 py-1 text-xs font-black text-[#0B82C5]">
                                                            {item.abnormality}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 align-top text-[#536A86]">
                                                        {item.analysis ?? '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {abnormalDetections.length === 0 && (
                                    <p className="mt-4 rounded-[18px] bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                                        Tidak ada kelainan non-normal yang perlu
                                        ditampilkan pada tabel ini.
                                    </p>
                                )}
                            </section>

                            <footer className="grid gap-6 border-t border-[#D7EDF8] pt-7 md:grid-cols-[1fr_280px] print:break-inside-avoid">
                                <div className="rounded-[24px] bg-[#F7FCFF] p-5 text-sm leading-7 text-[#536A86]">
                                    <p className="font-bold text-[#0B3550]">
                                        Pernyataan Verifikasi
                                    </p>
                                    <p className="mt-2">
                                        Dokumen ini diterbitkan oleh sistem
                                        Dentalyze AI dan dapat divalidasi
                                        melalui QR code di samping.
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm">
                                        Surabaya,{' '}
                                        {radiograph.verified_at ?? '-'}
                                    </p>
                                    <p className="mt-3 text-sm">
                                        Dokter Pemeriksa,
                                    </p>
                                    <img
                                        alt="QR verifikasi dokumen"
                                        className="mx-auto mt-3 size-32 rounded-[10px] bg-white p-2 ring-1 ring-[#D7EDF8]"
                                        src={qr_code}
                                    />
                                    <p className="mt-2 font-black">
                                        {radiograph.doctor_name ?? '-'}
                                    </p>
                                    <div className="mx-auto mt-3 max-w-64 border-t border-[#0B3550] pt-2 text-[10px] tracking-[0.22em] text-[#8EA2B9] uppercase">
                                        Scan to verify original document
                                    </div>
                                </div>
                            </footer>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-[22px] border border-[#D7EDF8] bg-[#F7FCFF] p-5">
            <p className="text-[10px] font-black tracking-[0.24em] text-[#8EA2B9] uppercase">
                {label}
            </p>
            <p className="mt-2 text-lg font-black text-[#0B3550]">{value}</p>
        </div>
    );
}

function ConditionCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-[18px] border border-[#D7EDF8] bg-white px-3 py-3 shadow-[0_10px_24px_rgba(19,184,255,0.07)]">
            <p className="text-[9px] font-black tracking-[0.2em] text-[#8EA2B9] uppercase">
                {label}
            </p>
            <p className="mt-2 text-2xl font-black text-[#0878e8]">{value}</p>
        </div>
    );
}

function ImageBlock({ src, title }: { src: string; title: string }) {
    return (
        <section className="rounded-[24px] border border-[#D7EDF8] bg-[#F7FCFF] p-4">
            <h2 className="text-sm font-black tracking-[0.18em] text-[#8EA2B9] uppercase">
                {title}
            </h2>
            <img
                alt={title}
                className="mt-3 max-h-[330px] w-full rounded-[18px] bg-black object-contain"
                src={src}
            />
        </section>
    );
}

function Info({ rows, title }: { rows: string[][]; title: string }) {
    return (
        <section className="rounded-[24px] border border-[#D7EDF8] bg-[#F7FCFF] p-5">
            <h2 className="text-lg font-black text-[#0B3550]">{title}</h2>
            <div className="mt-4 grid gap-2 text-sm">
                {rows.map(([label, value]) => (
                    <p className="grid grid-cols-[150px_1fr] gap-3" key={label}>
                        <span className="font-bold text-[#8EA2B9]">
                            {label}
                        </span>
                        <span className="text-[#0B3550]">{value}</span>
                    </p>
                ))}
            </div>
        </section>
    );
}

function Legend() {
    return (
        <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase">
            {Object.entries(conditionStyles).map(([label, className]) => (
                <span
                    className={`rounded-full px-3 py-1 ring-1 ${className}`}
                    key={label}
                >
                    {label}
                </span>
            ))}
        </div>
    );
}

function countCondition(detections: Detection[], condition: string) {
    return detections.filter(
        (item) =>
            item.abnormality.trim().toLowerCase() === condition.toLowerCase(),
    ).length;
}

RadiographPdf.layout = null;
