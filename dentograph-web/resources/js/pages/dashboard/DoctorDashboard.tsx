import { Link } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronRight,
    Clock3,
    CalendarDays,
    Database,
    Sparkles,
    Stethoscope,
    UserRound,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { edit as editProfile } from '@/routes/profile';
import radiographs from '@/routes/radiographs';
import * as radiographHistory from '@/routes/radiographs/history';

type DashboardUser = {
    name: string;
    role: string;
};

type QueueItem = {
    id_radiograph: string;
    patient_name: string;
    created_at: string | null;
};

type CompletedItem = {
    id_radiograph: string;
    patient_name: string;
    date: string | null;
};

type Props = {
    stats: {
        my_patients: number;
        pending_verifications: number;
        completed_verifications: number;
        total_system: number;
    };
    user: DashboardUser;
    verification_queue: QueueItem[];
    doctor_completed_detections: CompletedItem[];
};

export default function DoctorDashboard({
    doctor_completed_detections,
    stats,
    user,
    verification_queue,
}: Props) {
    const cards = [
        {
            label: 'Pasien Saya',
            value: stats.my_patients,
            icon: Users,
            badge: 'Records',
            tone: 'mint',
            href: radiographHistory.index(),
        },
        {
            label: 'Antrean',
            value: stats.pending_verifications,
            icon: Clock3,
            badge: 'Perlu Tindakan',
            tone: 'dark',
            href: radiographHistory.index({ query: { status: 'menunggu' } }),
        },
        {
            label: 'Selesai',
            value: stats.completed_verifications,
            icon: CheckCircle2,
            badge: 'Verified',
            tone: 'green',
            href: radiographHistory.index({
                query: { status: 'terverifikasi' },
            }),
        },
        {
            label: 'Total Sistem',
            value: stats.total_system,
            icon: Database,
            badge: 'Database',
            tone: 'blue',
            href: radiographHistory.index(),
        },
    ];

    return (
        <div className="space-y-5 text-[#073d52]">
            <section className="grid gap-5 xl:grid-cols-[1.5fr_0.9fr]">
                <HeroCard stats={stats} user={user} />
                <ProfileCard user={user} />
            </section>

            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <Link
                            className="group relative min-h-[124px] overflow-hidden rounded-[28px] border border-white/75 bg-white/48 p-6 shadow-[0_18px_45px_rgba(19,184,255,0.08)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/65"
                            href={card.href}
                            key={card.label}
                        >
                            <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-[#86d8ff]/20 blur-3xl transition group-hover:scale-125" />
                            <div className="relative z-10 flex items-center gap-4">
                                <div
                                    className={`grid size-12 place-items-center rounded-[16px] ${cardIconClass(card.tone)}`}
                                >
                                    <Icon size={20} />
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-[11px] font-black tracking-[0.28em] text-[#9ea6b6] uppercase">
                                            {card.label}
                                        </p>
                                        <span
                                            className={`rounded-full px-3 py-1 text-[9px] font-black tracking-[0.12em] uppercase ${badgeClass(card.tone)}`}
                                        >
                                            {card.badge}
                                        </span>
                                    </div>
                                    <strong className="mt-3 block text-[40px] leading-none font-black text-[#1c78ea]">
                                        {card.value}
                                    </strong>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.25fr_0.9fr]">
                <DashboardPanel
                    actionHref={radiographHistory.index({
                        query: { status: 'menunggu' },
                    })}
                    actionText="Lihat semua"
                    icon={Clock3}
                    title="Antrean Verifikasi"
                >
                    {verification_queue.length === 0 ? (
                        <EmptyState text="Tidak ada antrean verifikasi." />
                    ) : (
                        verification_queue.map((item) => (
                            <Link
                                className="group flex items-center gap-4 rounded-[24px] bg-white/48 p-4 text-sm text-[#526184] shadow-[0_10px_28px_rgba(19,184,255,0.05)] transition hover:bg-white/75"
                                href={radiographs.show(item.id_radiograph)}
                                key={item.id_radiograph}
                            >
                                <Avatar label={item.patient_name} />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-black text-[#22304F]">
                                        {item.patient_name}
                                    </p>
                                    <p className="mt-1 truncate text-xs text-[#7B8BA7]">
                                        ID: {item.id_radiograph}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="rounded-full bg-amber-100 px-4 py-2 text-[10px] font-black tracking-[0.12em] text-amber-600 uppercase">
                                        Verifikasi
                                    </span>
                                    <p className="mt-2 text-[10px] font-semibold text-slate-400 italic">
                                        {item.created_at ?? '-'}
                                    </p>
                                </div>
                                <ChevronRight
                                    className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#0878e8]"
                                    size={17}
                                />
                            </Link>
                        ))
                    )}
                </DashboardPanel>

                <div className="space-y-6">
                    <section className="relative overflow-hidden rounded-[34px] bg-[linear-gradient(135deg,#20b9ff_0%,#0878e8_60%,#49ddd7_100%)] p-7 text-white shadow-[0_24px_55px_rgba(8,120,232,0.24)]">
                        <div className="absolute -top-16 -right-12 h-44 w-44 rounded-full bg-white/14 blur-3xl" />
                        <div className="absolute -bottom-20 left-10 h-44 w-44 rounded-full bg-[#49ddd7]/20 blur-3xl" />
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="grid size-12 place-items-center rounded-[16px] bg-white/18 backdrop-blur-md">
                                <Stethoscope size={22} />
                            </div>
                            <div>
                                <p className="text-[11px] font-black tracking-[0.34em] text-white/72 uppercase">
                                    Dokter Pemeriksa
                                </p>
                                <h2 className="mt-2 text-[24px] leading-tight font-black">
                                    Halo, {user.name}!
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-white/78">
                                    Ada {stats.pending_verifications} pasien
                                    baru yang menunggu validasi radiograf hari
                                    ini.
                                </p>
                            </div>
                        </div>
                    </section>

                    <DashboardPanel
                        actionHref={radiographHistory.index({
                            query: { status: 'terverifikasi' },
                        })}
                        actionText="Riwayat"
                        icon={CheckCircle2}
                        title="Selesai Diverifikasi"
                    >
                        {doctor_completed_detections.length === 0 ? (
                            <EmptyState text="Belum ada hasil yang diverifikasi." />
                        ) : (
                            doctor_completed_detections.map((item) => (
                                <Link
                                    className="group flex items-center gap-4 rounded-[22px] bg-white/48 p-4 text-sm text-[#526184] shadow-[0_10px_28px_rgba(19,184,255,0.05)] transition hover:bg-white/75"
                                    href={radiographs.show(item.id_radiograph)}
                                    key={item.id_radiograph}
                                >
                                    <Avatar label={item.patient_name} />
                                    <p className="min-w-0 flex-1 truncate font-black text-[#22304F]">
                                        {item.patient_name}
                                    </p>
                                    <time className="text-xs font-black text-[#7B8BA7]">
                                        {item.date ?? '-'}
                                    </time>
                                </Link>
                            ))
                        )}
                    </DashboardPanel>
                </div>
            </section>
        </div>
    );
}

function HeroCard({
    stats,
    user,
}: {
    stats: Props['stats'];
    user: DashboardUser;
}) {
    return (
        <section className="relative min-h-[260px] overflow-hidden rounded-[34px] bg-[linear-gradient(135deg,#20b9ff_0%,#0878e8_58%,#49ddd7_100%)] p-7 text-white shadow-[0_28px_70px_rgba(8,120,232,0.24)]">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-[#49ddd7]/25 blur-3xl" />
            <img
                alt=""
                className="pointer-events-none absolute -right-24 bottom-[-150px] w-[390px] opacity-[0.16]"
                src="/asset/images/gigi.png"
            />

            <div className="relative z-10 flex h-full flex-col justify-between gap-10">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/15 px-4 py-2 text-[11px] font-black tracking-[0.22em] uppercase backdrop-blur-md">
                        <CalendarDays size={15} />
                        {new Intl.DateTimeFormat('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                        }).format(new Date())}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-[11px] font-black tracking-[0.22em] uppercase backdrop-blur-md">
                        <Sparkles size={14} />
                        {stats.pending_verifications} antrean
                    </span>
                </div>

                <div>
                    <p className="text-[11px] font-black tracking-[0.36em] text-white/72 uppercase">
                        Dentalyze Doctor Workspace
                    </p>
                    <h1 className="mt-4 max-w-xl text-[40px] leading-tight font-black tracking-[-0.025em]">
                        Selamat bertugas, {user.name}
                    </h1>
                    <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/78">
                        Tinjau antrean radiograf, validasi hasil AI, dan simpan
                        analisis klinis dari satu ruang kerja yang rapi.
                    </p>
                </div>
            </div>
        </section>
    );
}

function ProfileCard({ user }: { user: DashboardUser }) {
    return (
        <section className="relative min-h-[260px] overflow-hidden rounded-[34px] border border-white/75 bg-white/48 p-6 shadow-[0_18px_45px_rgba(19,184,255,0.1)] backdrop-blur-md">
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[#86d8ff]/18 blur-3xl" />
            <div className="relative z-10 flex items-center justify-between gap-3">
                <p className="text-[11px] font-black tracking-[0.28em] text-[#0878e8] uppercase">
                    My Profile
                </p>
                <span className="rounded-full bg-[#DDF9F4] px-3 py-1.5 text-[10px] font-black text-[#10A987] uppercase">
                    Aktif
                </span>
            </div>
            <div className="relative z-10 mt-7 flex items-center gap-4">
                <div className="grid size-20 place-items-center rounded-[24px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] text-3xl font-black text-white shadow-[0_20px_45px_rgba(8,120,232,0.24)]">
                    {initials(user.name)}
                </div>
                <div className="min-w-0">
                    <h2 className="truncate text-xl font-black text-[#22304F]">
                        {user.name}
                    </h2>
                    <p className="mt-1 text-[11px] font-black tracking-[0.22em] text-[#9ea6b6] uppercase">
                        Dokter
                    </p>
                </div>
            </div>
            <div className="relative z-10 mt-7 grid grid-cols-2 gap-3 border-t border-white/70 pt-5">
                <ProfileInfo label="Role" value="Dokter" />
                <ProfileInfo label="Status" value="Online" />
            </div>
            <Link
                href={editProfile()}
                className="relative z-10 mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[16px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] px-5 text-xs font-black tracking-[0.14em] text-white uppercase shadow-[0_16px_35px_rgba(19,184,255,0.22)] transition hover:-translate-y-0.5"
            >
                <UserRound size={16} />
                Kelola Profile
            </Link>
        </section>
    );
}

function ProfileInfo({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-[18px] border border-white/70 bg-white/42 px-4 py-3">
            <p className="text-[11px] font-black tracking-[0.24em] text-[#9ea6b6] uppercase">
                {label}
            </p>
            <p className="mt-2 truncate text-sm font-black text-[#22304F]">
                {value}
            </p>
        </div>
    );
}

function DashboardPanel({
    actionHref,
    actionText,
    children,
    icon: Icon,
    title,
}: {
    actionHref: ReturnType<typeof radiographHistory.index>;
    actionText: string;
    children: ReactNode;
    icon: LucideIcon;
    title: string;
}) {
    return (
        <section className="rounded-[34px] border border-white/75 bg-white/42 p-6 shadow-[0_18px_45px_rgba(19,184,255,0.08)] backdrop-blur-md">
            <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="flex items-center gap-3 text-lg font-black text-[#22304F]">
                    <span className="grid size-10 place-items-center rounded-[16px] bg-[#D9F2FA] text-[#0d8ecf]">
                        <Icon size={18} />
                    </span>
                    {title}
                </h2>
                <Link
                    className="hidden rounded-full bg-white/65 px-4 py-2 text-[10px] font-black tracking-[0.18em] text-[#0878e8] uppercase shadow-sm transition hover:bg-white sm:inline-flex"
                    href={actionHref}
                >
                    {actionText}
                </Link>
            </div>

            <div className="space-y-4">{children}</div>
        </section>
    );
}

function Avatar({ label }: { label: string }) {
    return (
        <div className="grid size-14 place-items-center rounded-2xl border border-white/75 bg-white/70 text-sm font-black text-[#1599F5] shadow-sm">
            {initials(label)}
        </div>
    );
}

function EmptyState({ text }: { text: string }) {
    return (
        <div className="rounded-[24px] border border-white/70 bg-white/45 p-8 text-center text-sm font-semibold text-[#808999]">
            {text}
        </div>
    );
}

function cardIconClass(tone: string) {
    const classes = {
        blue: 'bg-[#D9F2FA] text-[#0d8ecf]',
        dark: 'bg-[#D9F2FA] text-[#0878e8]',
        green: 'bg-[#DDF9F4] text-[#10A987]',
        mint: 'bg-[#DDF9F4] text-[#14b8a6]',
    };

    return classes[tone as keyof typeof classes] ?? classes.mint;
}

function badgeClass(tone: string) {
    const classes = {
        blue: 'bg-[#E9F7FF] text-[#0878e8]',
        dark: 'bg-[#E9F7FF] text-[#0878e8]',
        green: 'bg-[#DDF9F4] text-[#10A987]',
        mint: 'bg-[#DDF9F4] text-[#10A987]',
    };

    return classes[tone as keyof typeof classes] ?? classes.mint;
}

function initials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}
