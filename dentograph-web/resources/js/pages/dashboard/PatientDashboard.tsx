import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowRight,
    BookOpen,
    CalendarDays,
    Clock3,
    Mail,
    MapPin,
    MessageCircleMore,
    MessageSquareWarningIcon,
    PhoneCall,
    ScanLine,
    ShieldCheck,
    Sparkles,
    Stethoscope,
} from 'lucide-react';
import AiChatWidget from '@/components/ai-chat-widget';
import PatientHeader from '@/components/patient-header';
import detection from '@/routes/detection';
import patients from '@/routes/patients';

type PatientProfile = {
    nik: string;
    name: string;
    email: string | null;
    phone: string | null;
    age: number | null;
    gender: string | null;
    birth_date: string | null;
    address: string | null;
};

type PatientStats = {
    my_history_count: number;
    verified_count: number;
    waiting_count: number;
    total_detections: number;
    abnormal_detections: number;
    health_score: number;
};

type PatientRadiograph = {
    id_radiograph: string;
    status: string;
    created_at: string | null;
    updated_at: string | null;
    doctor_name: string | null;
    radiographer_name: string | null;
    detections_count: number;
    abnormal_detections_count: number;
    image_url: string | null;
};

type PatientAiInsight = {
    type: string;
    severity: 'warning' | 'positive' | 'info' | string;
    title: string;
    description: string;
    recommendation: string | null;
};

type PatientDashboardProps = {
    user: {
        name: string;
        email?: string | null;
        email_verified_at?: string | null;
        patient?: { nik?: string } | null;
    };
    patient: PatientProfile | null;
    stats: PatientStats;
    latest_radiograph: PatientRadiograph | null;
    patient_history: PatientRadiograph[];
    ai_insights: PatientAiInsight[];
};

function readableStatus(status?: string | null) {
    return status === 'terverifikasi' ? 'Terverifikasi' : 'Menunggu';
}

export default function PatientDashboard({
    latest_radiograph: latestRadiograph,
    patient,
    patient_history: patientHistory = [],
    ai_insights: aiInsights = [],
    stats,
    user,
}: PatientDashboardProps) {
    const { support } = usePage().props as {
        support?: { whatsapp?: string | null };
    };
    const whatsapp = support?.whatsapp?.replace(/\D/g, '') ?? '';
    const whatsappHref = whatsapp ? 'https://wa.me/' + whatsapp : undefined;
    const patientName = patient?.name ?? user.name;
    const patientNik = patient?.nik ?? user.patient?.nik ?? '-';
    const healthLabel = latestRadiograph
        ? stats.abnormal_detections > 0
            ? 'Perlu Kontrol'
            : 'Healthy'
        : 'Belum Ada Data';
    const latestDate =
        latestRadiograph?.updated_at ?? latestRadiograph?.created_at ?? '-';
    const latestDoctor = latestRadiograph?.doctor_name ?? 'Belum dianalisis';
    const historyHref =
        patient?.nik !== undefined ? patients.history(patient.nik) : '#riwayat';

    return (
        <>
            <div
                id="top"
                className="min-h-screen scroll-mt-32 bg-[linear-gradient(180deg,#eef8ff_0%,#edf8ff_18%,#e8f6ff_42%,#edf8ff_68%,#f7fbff_100%)] px-12 pt-[120px] lg:px-20 lg:pt-[120px]"
            >
                <PatientHeader localAnchors />

                {/* HERO */}
                <section
                    id="dashboard"
                    className="relative scroll-mt-32 overflow-hidden rounded-[34px] border border-white/70 bg-white/35 p-8 shadow-[0_25px_60px_rgba(19,184,255,0.1)] backdrop-blur-xl lg:p-12"
                >
                    {/* GLOW */}
                    <div className="absolute top-[-120px] right-[-100px] h-[320px] w-[320px] rounded-full bg-[#13b8ff]/10 blur-3xl" />

                    <div className="absolute bottom-[-120px] left-[-100px] h-[280px] w-[280px] rounded-full bg-[#49ddd7]/10 blur-3xl" />

                    <div className="relative z-10 grid gap-10 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-center">
                        {/* LEFT */}
                        <div>
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#bdefff] bg-[#f4fdff] px-4 py-2 text-[11px] font-black tracking-[0.24em] text-[#13b8ff] uppercase">
                                <Sparkles size={14} />
                                Smart Dental Monitoring
                            </div>

                            <h1 className="max-w-2xl text-[52px] leading-[1.02] font-black tracking-[-0.05em] text-[#1c356b]">
                                Halo,
                                <span className="bg-gradient-to-r from-[#13b8ff] to-[#0878e8] bg-clip-text text-transparent">
                                    {' '}
                                    {patientName}
                                </span>{' '}
                                👋
                            </h1>

                            {/* MINI INFO */}
                            <div className="mt-7 flex flex-wrap items-center gap-4">
                                <div className="rounded-2xl border border-[#d7ecff] bg-[#f8fcff] px-5 py-4 shadow-[0_10px_30px_rgba(19,184,255,0.06)]">
                                    <p className="text-[10px] font-black tracking-[0.18em] text-[#98a6bc] uppercase">
                                        Nomor NIK
                                    </p>

                                    <h4 className="mt-2 text-[17px] font-bold text-[#233b72]">
                                        {patientNik}
                                    </h4>
                                </div>

                                <div className="rounded-2xl border border-[#d7ecff] bg-[#f8fcff] px-5 py-4 shadow-[0_10px_30px_rgba(19,184,255,0.06)]">
                                    <p className="text-[10px] font-black tracking-[0.18em] text-[#98a6bc] uppercase">
                                        Status Akun
                                    </p>

                                    <h4
                                        className={
                                            user.email_verified_at
                                                ? 'mt-2 text-[17px] font-bold text-[#15b98c]'
                                                : 'mt-2 text-[17px] font-bold text-amber-600'
                                        }
                                    >
                                        {user.email_verified_at
                                            ? 'Email Terverifikasi'
                                            : user.email
                                              ? 'Email Belum Terverifikasi'
                                              : 'Email Belum Ditambahkan'}
                                    </h4>
                                </div>
                            </div>

                            <p className="mt-6 max-w-2xl text-[16px] leading-8 text-[#71809a]">
                                Pantau hasil analisis radiografi gigi,
                                perkembangan kesehatan mulut, dan riwayat
                                pemeriksaan Anda secara real-time melalui sistem
                                AI Dentalyze.
                            </p>

                            {/* HERO CARDS */}
                            <div className="mt-8 grid gap-5 xl:grid-cols-2">
                                {/* DETECTION */}
                                <article className="relative overflow-hidden rounded-[28px] border border-[#d7ecff] bg-gradient-to-br from-[#13b8ff] to-[#0878e8] p-6 text-white shadow-[0_20px_50px_rgba(19,184,255,0.22)]">
                                    <div className="absolute top-[-30px] right-[-30px] h-36 w-36 rounded-full bg-white/10 blur-3xl" />

                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                                                <ScanLine size={24} />
                                            </div>

                                            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[9px] font-black tracking-[0.18em] uppercase">
                                                Total Pemeriksaan
                                            </span>
                                        </div>

                                        <h3 className="mt-6 text-[26px] leading-tight font-black">
                                            {stats.my_history_count > 0
                                                ? `${stats.my_history_count} Radiograph`
                                                : 'Belum Ada Pemeriksaan'}
                                        </h3>

                                        <p className="mt-3 text-[14px] leading-7 text-white/80">
                                            {stats.my_history_count > 0
                                                ? `Total pemeriksaan radiografi yang tersimpan untuk pasien ini: ${stats.my_history_count}.`
                                                : 'Belum ada data radiografi tersedia.'}
                                        </p>

                                        <Link
                                            className={`mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-[12px] font-black tracking-[0.14em] text-[#0878e8] uppercase transition hover:scale-[1.03] ${
                                                stats.my_history_count > 0
                                                    ? ''
                                                    : 'pointer-events-none opacity-60'
                                            }`}
                                            href={
                                                stats.my_history_count > 0
                                                    ? '#riwayat'
                                                    : '#riwayat'
                                            }
                                        >
                                            Lihat Riwayat
                                            <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </article>

                                {/* CONSULTATION */}
                                <article className="relative overflow-hidden rounded-[28px] border border-[#ccfff2] bg-gradient-to-br from-[#49ddd7] to-[#28c5b8] p-6 text-white shadow-[0_20px_50px_rgba(73,221,215,0.22)]">
                                    <div className="absolute right-[-20px] bottom-[-30px] h-36 w-36 rounded-full bg-white/10 blur-3xl" />

                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                                                <Stethoscope size={24} />
                                            </div>

                                            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[9px] font-black tracking-[0.18em] uppercase">
                                                Consultation
                                            </span>
                                        </div>

                                        <h3 className="mt-6 text-[26px] font-black">
                                            Konsultasi
                                        </h3>

                                        <div className="mt-3 flex items-center gap-2 text-white/85">
                                            <CalendarDays size={16} />

                                            <span className="text-[14px]">
                                                {latestDate}
                                            </span>
                                        </div>

                                        <p className="mt-3 text-[14px] leading-7 text-white/80">
                                            Pemeriksaan bersama{' '}
                                            <span className="font-bold text-white">
                                                {latestDoctor}
                                            </span>
                                        </p>
                                    </div>
                                </article>
                            </div>
                        </div>

                        {/* RIGHT IMAGE */}
                        <div className="relative flex items-center justify-center py-8">
                            {/* Glow */}
                            <div className="absolute h-[320px] w-[320px] rounded-full bg-[#13b8ff]/10 blur-3xl" />

                            <div className="absolute h-[220px] w-[220px] rounded-full bg-[#49ddd7]/10 blur-2xl" />

                            {/* Floating Card 1 */}
                            <div className="absolute top-10 left-[-50px] z-20 animate-[float_5s_ease-in-out_infinite] rounded-[22px] border border-white/60 bg-white/70 px-5 py-4 shadow-[0_20px_50px_rgba(19,184,255,0.12)] backdrop-blur-xl">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] text-white shadow-lg">
                                        <ShieldCheck size={22} />
                                    </div>

                                    <div>
                                        <p className="text-[11px] font-black tracking-[0.16em] text-[#98a6bc] uppercase">
                                            Dental Status
                                        </p>

                                        <h4 className="mt-1 text-[18px] font-black text-[#1f3567]">
                                            {healthLabel}
                                        </h4>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Card 2 */}
                            <div className="absolute -right-2 bottom-4 z-20 animate-[float_6s_ease-in-out_infinite] rounded-[22px] border border-white/60 bg-white/70 px-5 py-4 shadow-[0_20px_50px_rgba(73,221,215,0.14)] backdrop-blur-xl">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#49ddd7_0%,#21bfc6_100%)] text-white shadow-lg">
                                        <Activity size={22} />
                                    </div>

                                    <div>
                                        <p className="text-[11px] font-black tracking-[0.16em] text-[#98a6bc] uppercase">
                                            Clean Score
                                        </p>

                                        <h4 className="mt-1 text-[18px] font-black text-[#1f3567]">
                                            {stats.health_score || 0}%
                                        </h4>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Card 3 */}
                            <div className="absolute top-0 right-10 z-20 animate-[float_4s_ease-in-out_infinite] rounded-full border border-white/60 bg-white/70 px-5 py-3 shadow-[0_18px_40px_rgba(19,184,255,0.12)] backdrop-blur-xl">
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#49ddd7] opacity-75"></span>
                                        <span className="relative inline-flex h-3 w-3 rounded-full bg-[#49ddd7]"></span>
                                    </span>

                                    <p className="text-[11px] font-black tracking-[0.14em] text-[#0878e8] uppercase">
                                        AI Active
                                    </p>
                                </div>
                            </div>

                            {/* Tooth */}
                            <img
                                src="/asset/images/gigishiny.png"
                                alt="Dental"
                                className="relative z-10 w-[340px] drop-shadow-[0_40px_90px_rgba(19,184,255,0.22)] xl:w-[440px]"
                            />
                        </div>
                    </div>
                </section>

                {aiInsights.length > 0 && (
                    <section className="mt-6 rounded-[30px] border border-white/70 bg-white/35 p-7 shadow-[0_20px_50px_rgba(19,184,255,0.08)] backdrop-blur-xl">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-3">
                                <span className="h-9 w-1.5 rounded-full bg-[#087b78]" />
                                <h2 className="text-[26px] font-black tracking-[-0.03em] text-[#132f67]">
                                    Analisis Kesehatan Gigi Anda
                                </h2>
                            </div>
                            <span className="w-fit rounded-full bg-white/70 px-5 py-2 text-xs font-black text-[#526184] shadow-[0_10px_24px_rgba(19,184,255,0.08)]">
                                {aiInsights.length} Temuan Baru
                            </span>
                        </div>

                        <div className="mt-6 grid gap-5 lg:grid-cols-3">
                            {aiInsights.slice(0, 3).map((insight, index) => (
                                <article
                                    className="overflow-hidden rounded-[22px] border border-white/70 bg-white/65 shadow-[0_16px_38px_rgba(19,184,255,0.09)] backdrop-blur-md"
                                    key={`${insight.type}-${index}`}
                                >
                                    <div className="flex items-center gap-4 border-b border-[#edf4ff] p-5">
                                        <span
                                            className={`grid size-11 place-items-center rounded-[14px] ${
                                                insight.severity === 'warning'
                                                    ? 'bg-rose-100 text-rose-500'
                                                    : insight.severity ===
                                                        'positive'
                                                      ? 'bg-[#dffaf4] text-[#0f9f7a]'
                                                      : 'bg-[#E4FAFF] text-[#0878e8]'
                                            }`}
                                        >
                                            <AlertTriangle size={20} />
                                        </span>
                                        <h3 className="text-[16px] leading-5 font-black text-[#1f2f4f]">
                                            {insight.title}
                                        </h3>
                                    </div>
                                    <div className="p-5">
                                        <p className="text-[15px] leading-7 text-[#22304F]">
                                            {insight.description}
                                        </p>
                                        {insight.recommendation && (
                                            <div className="mt-5 rounded-[14px] border border-[#e5edf5] bg-[#F7FCFF] p-4">
                                                <p className="text-[11px] font-black text-[#087b78]">
                                                    Rekomendasi:
                                                </p>
                                                <p className="mt-2 text-xs leading-5 text-[#22304F]">
                                                    {insight.recommendation}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {/* HISTORY */}
                <section
                    id="riwayat"
                    className="mt-6 scroll-mt-32 overflow-hidden rounded-[30px] border border-white/70 bg-white/35 shadow-[0_20px_50px_rgba(19,184,255,0.08)] backdrop-blur-xl"
                >
                    {/* HEADER */}
                    <div className="flex flex-col gap-4 border-b border-[#edf4ff] px-8 py-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h3 className="text-[24px] font-black text-[#233b72]">
                                Riwayat Deteksi
                            </h3>

                            <p className="mt-1 text-[14px] text-[#8b97ad]">
                                Riwayat hasil analisis radiografi terbaru Anda.
                            </p>
                        </div>

                        <Link
                            className="inline-flex h-13 items-center justify-center gap-3 rounded-[16px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] px-6 text-xs font-black tracking-[0.16em] text-white uppercase shadow-[0_12px_28px_rgba(24,121,230,0.25)] transition hover:scale-105"
                            href={historyHref}
                            prefetch={Boolean(patient)}
                        >
                            Lihat Semua
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    {patientHistory.length > 0 ? (
                        <div className="divide-y divide-[#edf4ff]">
                            {patientHistory.map((item) => (
                                <Link
                                    className="grid gap-4 px-8 py-5 text-sm text-[#526184] transition hover:bg-white/55 md:grid-cols-[1fr_auto]"
                                    href={detection.show(item.id_radiograph)}
                                    key={item.id_radiograph}
                                    prefetch
                                >
                                    <div className="flex min-w-0 items-center gap-4">
                                        {item.image_url ? (
                                            <img
                                                alt=""
                                                className="h-20 w-28 rounded-[16px] object-cover"
                                                src={item.image_url}
                                            />
                                        ) : (
                                            <span className="grid h-20 w-28 shrink-0 place-items-center rounded-[16px] bg-[#D9F2FA] text-[#0878e8]">
                                                <ScanLine size={24} />
                                            </span>
                                        )}
                                        <div className="min-w-0">
                                            <p className="truncate font-black text-[#22304F]">
                                                {item.id_radiograph}
                                            </p>
                                            <p className="mt-1 text-xs text-[#7B8BA7]">
                                                {item.updated_at ??
                                                    item.created_at ??
                                                    '-'}
                                            </p>
                                            <span
                                                className={`mt-2 inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                                                    item.status ===
                                                    'terverifikasi'
                                                        ? 'bg-emerald-100 text-emerald-600'
                                                        : 'bg-amber-100 text-amber-600'
                                                }`}
                                            >
                                                {readableStatus(item.status)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 md:justify-end">
                                        <div className="text-right">
                                            <p className="font-black text-[#22304F]">
                                                {item.detections_count} deteksi
                                            </p>
                                            <p className="mt-1 text-xs text-[#7B8BA7]">
                                                Dokter:{' '}
                                                {item.doctor_name ?? '-'}
                                            </p>
                                            <p className="text-xs text-[#7B8BA7]">
                                                Kelainan:{' '}
                                                {item.abnormal_detections_count}
                                            </p>
                                        </div>
                                        <ArrowRight
                                            className="text-[#13b8ff]"
                                            size={18}
                                        />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#13b8ff] to-[#0878e8] shadow-[0_20px_50px_rgba(19,184,255,0.22)]">
                                <MessageSquareWarningIcon
                                    size={42}
                                    className="text-white"
                                />
                            </div>

                            <h4 className="mt-7 text-[24px] font-black text-[#233b72]">
                                Belum Ada Riwayat
                            </h4>

                            <p className="mt-3 max-w-md text-[15px] leading-7 text-[#8593aa]">
                                Saat ini belum ada data deteksi radiografi yang
                                tersedia untuk akun pasien Anda.
                            </p>
                        </div>
                    )}
                </section>

                <section
                    id="insight"
                    className="mt-6 scroll-mt-32 overflow-hidden rounded-[30px] border border-white/70 bg-white/35 p-7 shadow-[0_18px_45px_rgba(19,184,255,0.08)] backdrop-blur-md"
                >
                    <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/45 px-4 py-2 text-[11px] font-black tracking-[0.24em] text-[#49ddd7] uppercase backdrop-blur-md">
                                <Sparkles size={14} />
                                Insight Dental
                            </div>

                            <h3 className="mt-4 text-[30px] leading-tight font-black tracking-[-0.04em] text-[#132f67]">
                                Edukasi singkat kesehatan gigi
                            </h3>

                            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#72839d]">
                                Kenali karies, lesi periapikal, resorpsi, dan
                                impaksi lewat panduan visual yang lebih mudah
                                dipahami.
                            </p>
                        </div>

                        <Link
                            href="/patient-insight"
                            className="inline-flex h-13 items-center justify-center gap-3 rounded-[16px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] px-6 text-xs font-black tracking-[0.16em] text-white uppercase shadow-[0_12px_28px_rgba(24,121,230,0.25)] transition hover:scale-105"
                        >
                            Lebih Banyak
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer
                    id="contact"
                    className="relative z-30 mt-10 scroll-mt-32 overflow-hidden rounded-t-[46px] border-t border-white/40 bg-[linear-gradient(135deg,#eaf8ff_0%,#eefaff_32%,#dff6ff_62%,#f8fcff_100%)] px-8 pt-16 pb-8 text-[#1b1b18] shadow-[0_-24px_70px_rgba(19,184,255,0.08)] lg:px-16"
                >
                    {/* Footer Background */}
                    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                        <div className="absolute -top-24 left-[-120px] h-[420px] w-[420px] rounded-full bg-[#13b8ff]/14 blur-[120px]" />
                        <div className="absolute top-[10%] right-[-100px] h-[380px] w-[380px] rounded-full bg-[#49ddd7]/16 blur-[120px]" />
                        <div className="absolute bottom-[-160px] left-[40%] h-[420px] w-[420px] rounded-full bg-[#86d8ff]/14 blur-[130px]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(8,120,232,0.18)_1px,transparent_0)] [background-size:34px_34px] opacity-[0.18]" />
                    </div>

                    <div className="relative z-10">
                        <div className="grid grid-cols-1 gap-14 md:grid-cols-2 xl:grid-cols-[1.2fr_0.9fr_0.9fr_1.1fr]">
                            {/* Brand */}
                            <div className="lg:col-span-1">
                                <div className="flex items-center gap-1">
                                    <img
                                        src="/asset/images/logo.png"
                                        alt="Dentalyze AI"
                                        className="h-11 w-11 object-contain"
                                    />

                                    <div className="text-3xl font-black tracking-tight text-[#1aa0ff]">
                                        DENTA
                                        <span className="text-[#187df0]">
                                            LYZE
                                        </span>
                                    </div>
                                </div>

                                <p className="mt-5 max-w-[320px] text-[15px] leading-[1.8] text-[#808999]">
                                    Platform AI dental intelligence untuk
                                    membantu analisis radiografi gigi dewasa,
                                    enumerasi gigi, serta deteksi kelainan
                                    secara lebih cepat dan rapi.
                                </p>

                                <div className="mt-8 flex items-center gap-4">
                                    <a
                                        href="#top"
                                        aria-label="Kembali ke bagian atas"
                                        className="group flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/70 bg-white/45 text-[#0878e8] shadow-[0_12px_25px_rgba(19,184,255,0.08)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:bg-[#0878e8] hover:text-white"
                                    >
                                        <BookOpen size={18} strokeWidth={2.1} />
                                    </a>

                                    <a
                                        aria-disabled={!whatsappHref}
                                        aria-label="Hubungi Dentalyze melalui WhatsApp"
                                        href={whatsappHref}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                        className="group flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/70 bg-white/45 text-[#0878e8] shadow-[0_12px_25px_rgba(19,184,255,0.08)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:bg-[#0878e8] hover:text-white"
                                    >
                                        <MessageCircleMore
                                            size={18}
                                            strokeWidth={2.1}
                                        />
                                    </a>

                                    <a
                                        aria-disabled={!whatsappHref}
                                        aria-label="Hubungi Dentalyze melalui WhatsApp"
                                        href={whatsappHref}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                        className="group flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/70 bg-white/45 text-[#0878e8] shadow-[0_12px_25px_rgba(19,184,255,0.08)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:bg-[#0878e8] hover:text-white"
                                    >
                                        <PhoneCall
                                            size={18}
                                            strokeWidth={2.1}
                                        />
                                    </a>
                                </div>
                            </div>

                            {/* Navigasi */}
                            <div>
                                <h4 className="text-[15px] font-black tracking-[0.26em] text-[#0878e8] uppercase">
                                    Navigasi
                                </h4>

                                <ul className="mt-7 space-y-4">
                                    {[
                                        {
                                            label: 'Dashboard',
                                            href: '#dashboard',
                                        },
                                        {
                                            label: 'Riwayat',
                                            href: '#riwayat',
                                        },
                                        {
                                            label: 'Insight',
                                            href: '/patient-insight',
                                        },
                                        {
                                            label: 'Contact Us',
                                            href: '#contact',
                                        },
                                    ].map((item) => (
                                        <li key={item.label}>
                                            <a
                                                href={item.href}
                                                className="group flex items-center gap-3 text-[15px] font-semibold text-[#808999] transition hover:text-[#0878e8]"
                                            >
                                                <span className="h-2 w-2 rounded-full bg-[#49ddd7] transition group-hover:scale-125" />

                                                {item.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Kontak */}
                            <div>
                                <h4 className="text-[13px] font-black tracking-[0.34em] text-[#0878e8] uppercase">
                                    Hubungi Kami
                                </h4>

                                <ul className="mt-6 space-y-6 text-[15px] text-[#808999]">
                                    <li className="flex items-center gap-4">
                                        <span className="flex h-5 w-5 items-center justify-center text-[#49ddd7]">
                                            <MapPin
                                                size={18}
                                                strokeWidth={2.2}
                                            />
                                        </span>

                                        <span>Indonesia</span>
                                    </li>

                                    <li className="flex items-center gap-4">
                                        <span className="flex h-5 w-5 items-center justify-center text-[#49ddd7]">
                                            <Mail size={18} strokeWidth={2.2} />
                                        </span>

                                        <span>support@dentalyze.id</span>
                                    </li>

                                    <li className="flex items-center gap-4">
                                        <span className="flex h-5 w-5 items-center justify-center text-[#49ddd7]">
                                            <Clock3
                                                size={18}
                                                strokeWidth={2.2}
                                            />
                                        </span>

                                        <span>09:00 / 17:00</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Newsletter */}
                            <div>
                                <h4 className="text-[15px] font-black tracking-[0.26em] text-[#0878e8] uppercase">
                                    Newsletter
                                </h4>

                                <p className="mt-7 text-[15px] leading-[1.8] text-[#808999]">
                                    Dapatkan update fitur AI Dentalyze,
                                    teknologi deteksi gigi, dan pengembangan
                                    sistem terbaru.
                                </p>

                                <form className="relative mt-7 max-w-[340px]">
                                    <input
                                        type="email"
                                        placeholder="Email Anda"
                                        className="w-full rounded-[18px] border border-white/70 bg-white/50 px-5 py-4 pr-14 text-[14px] text-[#0878e8] shadow-[0_12px_30px_rgba(19,184,255,0.08)] backdrop-blur-md transition outline-none placeholder:text-[#9ea6b6] focus:border-[#49ddd7] focus:bg-white/70"
                                    />

                                    <button
                                        type="button"
                                        className="absolute top-2 right-2 bottom-2 flex w-11 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] text-white shadow-lg transition hover:scale-105"
                                    >
                                        <svg
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="2.3"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                                            />
                                        </svg>
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="mt-16 border-t border-[#0878e8]/10 pt-8">
                            <div className="flex flex-col items-center justify-between gap-5 text-[14px] text-[#9ea6b6] md:flex-row">
                                <p>
                                    © 2026 Dentalyze AI — AI Powered Dental
                                    Disease Detection and Analysis System. All
                                    rights reserved.
                                </p>

                                <div className="flex gap-7">
                                    <a
                                        href="#"
                                        className="transition hover:text-[#0878e8]"
                                    >
                                        Kebijakan Privasi
                                    </a>
                                    <a
                                        href="#"
                                        className="transition hover:text-[#0878e8]"
                                    >
                                        Syarat & Ketentuan
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
                <AiChatWidget />
            </div>

            <style>{`
                html {
                    scroll-behavior: smooth;
                }
                @keyframes gentle-float {
                    0%, 100% {
                        transform: translateY(0px) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-20px) rotate(1deg);
                    }
                }

                .animate-gentle-float {
                    animation: gentle-float 6s ease-in-out infinite;
                }
            `}</style>
        </>
    );
}
