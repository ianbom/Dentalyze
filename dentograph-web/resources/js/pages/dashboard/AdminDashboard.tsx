import { Link } from '@inertiajs/react';
import {
    Activity,
    Bell,
    Camera,
    CalendarDays,
    ChevronRight,
    Database,
    Sparkles,
    Stethoscope,
    UserRound,
    Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import detection from '@/routes/detection';
import doctors from '@/routes/doctors';
import patients from '@/routes/patients';
import { edit as editProfile } from '@/routes/profile';
import radiographers from '@/routes/radiographers';
import radiographs from '@/routes/radiographs';
import * as radiographHistory from '@/routes/radiographs/history';

type SeriesPoint = { label: string; value: number };
type ActivityUser = {
    id: number;
    name: string;
    total: number;
    today: number;
    active: boolean;
};
type Notification = {
    id_radiograph: string;
    patient_name: string;
    radiographer_name: string | null;
    image_url: string;
    created_at: string | null;
    date: string | null;
};
type Props = {
    stats: {
        total_patients: number;
        total_doctors: number;
        total_radiographers: number;
        total_radiographs: number;
        total_detections: number;
        pending_verifications: number;
        doctor_analyses: number;
        radiograph_uploads: number;
    };
    user: { name: string; role: string };
    notifications: Notification[];
    activities: {
        doctors: ActivityUser[];
        radiographers: ActivityUser[];
    };
    charts: {
        weekly: SeriesPoint[];
        monthly: SeriesPoint[];
    };
};

export default function AdminDashboard({
    activities,
    charts,
    notifications,
    stats,
    user,
}: Props) {
    const [range, setRange] = useState<'weekly' | 'monthly'>('weekly');
    const [liveNotifications, setLiveNotifications] = useState(notifications);
    const [notificationCount, setNotificationCount] = useState(
        stats.pending_verifications,
    );
    const chartData = charts[range] ?? [];

    useEffect(() => {
        const refresh = async () => {
            const response = await fetch('/dashboard/notifications', {
                headers: { Accept: 'application/json' },
            });

            if (response.ok) {
                const payload = (await response.json()) as {
                    count: number;
                    notifications: Notification[];
                };
                setLiveNotifications(payload.notifications);
                setNotificationCount(payload.count);
            }
        };
        const timer = window.setInterval(refresh, 30_000);

        return () => window.clearInterval(timer);
    }, []);

    const cards = [
        {
            label: 'Patients',
            value: stats.total_patients,
            icon: Users,
            href: patients.index(),
        },
        {
            label: 'Doctors',
            value: stats.total_doctors,
            icon: Stethoscope,
            href: doctors.index(),
        },
        {
            label: 'Radiographer',
            value: stats.total_radiographers,
            icon: Camera,
            href: radiographers.index(),
        },
        {
            label: 'Radiographs',
            value: stats.total_radiographs,
            icon: Database,
            href: radiographHistory.index(),
        },
        {
            label: 'Detections',
            value: stats.total_detections,
            icon: Activity,
            href: detection.index(),
        },
    ];
    const leftCards = cards.slice(0, 3);
    const rightCards = cards.slice(3);

    return (
        <div className="space-y-5 text-[#073d52]">
            <section className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
                <HeroCard user={user} />
                <ProfileCard user={user} />
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {leftCards.map((card) => (
                        <StatCard card={card} key={card.label} />
                    ))}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    {rightCards.map((card) => (
                        <StatCard card={card} key={card.label} />
                    ))}
                </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
                <div className="space-y-5">
                    <section className="overflow-hidden rounded-[30px] border border-white/70 bg-white/35 p-6 shadow-[0_24px_55px_rgba(19,184,255,0.1)] backdrop-blur-md">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[11px] font-black tracking-[0.42em] text-[#49ddd7] uppercase">
                                    GRAFIK DETEKSI
                                </p>
                                <h2 className="mt-2 text-[30px] leading-none font-black text-[#0878e8] uppercase">
                                    Health Curve Deteksi
                                </h2>
                                <p className="mt-3 text-[15px] leading-[1.8] text-[#808999] italic">
                                    Grafik volume deteksi radiograf
                                </p>
                            </div>
                            <div className="rounded-[16px] border border-white/70 bg-white/45 p-1 shadow-sm backdrop-blur-md">
                                <button
                                    className={`rounded-[12px] px-4 py-2 text-xs font-black transition ${
                                        range === 'weekly'
                                            ? 'bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] text-white shadow-[0_10px_24px_rgba(8,120,232,0.18)]'
                                            : 'text-[#9BA8BC] hover:text-[#0878e8]'
                                    }`}
                                    onClick={() => setRange('weekly')}
                                    type="button"
                                >
                                    W
                                </button>
                                <button
                                    className={`rounded-[12px] px-4 py-2 text-xs font-black transition ${
                                        range === 'monthly'
                                            ? 'bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] text-white shadow-[0_10px_24px_rgba(8,120,232,0.18)]'
                                            : 'text-[#9BA8BC] hover:text-[#0878e8]'
                                    }`}
                                    onClick={() => setRange('monthly')}
                                    type="button"
                                >
                                    M
                                </button>
                            </div>
                        </div>
                        <Curve data={chartData} />
                    </section>
                </div>

                <aside className="space-y-5">
                    <NotificationCard
                        count={notificationCount}
                        notifications={liveNotifications}
                    />
                    <ActivityList
                        items={activities.doctors}
                        kind="doctor"
                        title="Aktifitas Dokter"
                    />
                    <ActivityList
                        items={activities.radiographers}
                        kind="radiographer"
                        title="Aktifitas Radiografer"
                    />
                </aside>
            </section>
        </div>
    );
}

function StatCard({
    card,
}: {
    card: {
        label: string;
        value: number;
        icon: typeof Users;
        href: ReturnType<typeof patients.index>;
    };
}) {
    const Icon = card.icon;
    const content = (
        <>
            <div className="grid size-12 place-items-center rounded-[16px] bg-[#D9F2FA] text-[#0d8ecf]">
                <Icon size={20} />
            </div>
            <div className="min-w-0">
                <p className="truncate text-[11px] font-black tracking-[0.28em] text-[#9ea6b6] uppercase">
                    {card.label}
                </p>
                <strong className="mt-3 block text-[40px] leading-none font-black text-[#1c78ea]">
                    {card.value}
                </strong>
            </div>
        </>
    );

    return (
        <Link
            aria-label={`Lihat ${card.label}`}
            className="group relative min-h-[124px] cursor-pointer overflow-hidden rounded-[28px] border border-white/75 bg-white/48 p-6 shadow-[0_18px_45px_rgba(19,184,255,0.08)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/65 focus-visible:ring-2 focus-visible:ring-[#13b8ff] focus-visible:ring-offset-2 focus-visible:outline-none"
            href={card.href}
        >
            <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-[#86d8ff]/18 blur-3xl transition group-hover:scale-125" />
            <div className="relative z-10 flex items-center gap-4">
                {content}
            </div>
        </Link>
    );
}

function HeroCard({ user }: { user: Props['user'] }) {
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
                        Sistem Online
                    </span>
                </div>

                <div>
                    <p className="text-[11px] font-black tracking-[0.36em] text-white/72 uppercase">
                        Dentalyze AI Command Center
                    </p>
                    <h1 className="mt-4 max-w-xl text-[40px] leading-tight font-black tracking-[-0.025em]">
                        Selamat bekerja, {user.name}
                    </h1>
                    <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/78">
                        Pantau pasien, radiograf, antrean verifikasi, dan hasil
                        deteksi dari satu dashboard klinis yang rapi.
                    </p>
                </div>
            </div>
        </section>
    );
}

function ProfileCard({ user }: { user: Props['user'] }) {
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
                        Administrator
                    </p>
                </div>
            </div>
            <div className="relative z-10 mt-7 grid grid-cols-2 gap-3 border-t border-white/70 pt-5">
                <ProfileInfo label="Role" value="Admin" />
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

function NotificationCard({
    count,
    notifications,
}: {
    count: number;
    notifications: Notification[];
}) {
    return (
        <section className="rounded-[34px] border border-white/75 bg-white/42 p-5 shadow-[0_18px_45px_rgba(19,184,255,0.08)] backdrop-blur-md">
            <h2 className="flex items-center gap-2 font-black text-[#22304F]">
                <span className="grid size-9 place-items-center rounded-2xl bg-[#D9F2FA] text-[#0d8ecf]">
                    <Bell size={16} />
                </span>
                Notifikasi
                {count > 0 && (
                    <span className="grid min-w-6 place-items-center rounded-full bg-rose-500 px-1.5 py-1 text-[10px] text-white">
                        {count}
                    </span>
                )}
            </h2>
            <div className="mt-5 space-y-3">
                {notifications.length === 0 && (
                    <p className="rounded-2xl border border-white/70 bg-white/45 p-4 text-sm font-semibold text-slate-400">
                        Tidak ada tugas menunggu.
                    </p>
                )}
                {notifications.map((item) => (
                    <Link
                        className="group flex items-center gap-3 rounded-2xl bg-white/48 p-3 shadow-[0_10px_28px_rgba(19,184,255,0.05)] transition hover:bg-white/75"
                        href={radiographs.show(item.id_radiograph)}
                        key={item.id_radiograph}
                    >
                        <div className="grid size-12 place-items-center rounded-xl border border-white/75 bg-white/70 text-center text-[10px] font-black text-[#073d52] shadow-sm">
                            {item.date ?? 'NEW'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-black text-[#22304F]">
                                {item.patient_name}
                            </p>
                            <p className="mt-1 truncate text-[11px] text-slate-400">
                                {item.created_at ?? '-'}
                            </p>
                        </div>
                        <ChevronRight
                            className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#0878e8]"
                            size={16}
                        />
                    </Link>
                ))}
            </div>
        </section>
    );
}

function ActivityList({
    items,
    kind,
    title,
}: {
    items: ActivityUser[];
    kind: 'doctor' | 'radiographer';
    title: string;
}) {
    return (
        <section className="rounded-[34px] border border-white/75 bg-white/42 p-6 shadow-[0_18px_45px_rgba(19,184,255,0.08)] backdrop-blur-md">
            <h2 className="border-l-4 border-[#49ddd7] pl-3 text-lg font-black text-[#22304F]">
                {title}
            </h2>
            <div className="mt-5 space-y-3">
                {items.map((item) => (
                    <article
                        className="flex items-center gap-4 rounded-2xl bg-white/48 p-4 shadow-[0_10px_28px_rgba(19,184,255,0.05)]"
                        key={`${kind}-${item.id}`}
                    >
                        <div className="grid size-12 place-items-center rounded-[16px] border border-white/60 bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] text-xs font-black text-white shadow-[0_12px_28px_rgba(8,120,232,0.18)]">
                            {kind === 'doctor' ? 'DR' : initials(item.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-black text-[#22304F]">
                                {item.name}
                            </p>
                            <p className="mt-1 text-[11px] font-semibold text-slate-400">
                                {item.total}{' '}
                                {kind === 'doctor'
                                    ? 'Verifikasi Data'
                                    : 'Upload Data'}
                            </p>
                        </div>
                        <span
                            className={`rounded-full px-4 py-2 text-[10px] font-black uppercase ${
                                item.active
                                    ? 'bg-[#DDF9F4] text-[#10A987]'
                                    : 'bg-white/60 text-[#9BA8BC]'
                            }`}
                        >
                            {item.active ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                    </article>
                ))}
            </div>
        </section>
    );
}

function Curve({ data }: { data: SeriesPoint[] }) {
    const points = useMemo(() => {
        const max = Math.max(...data.map((item) => item.value), 1);
        const left = 64;
        const right = 656;
        const top = 54;
        const bottom = 214;

        return data.map((item, index) => {
            const x =
                left + index * ((right - left) / Math.max(data.length - 1, 1));
            const y = bottom - (item.value / max) * (bottom - top);

            return { ...item, x, y };
        });
    }, [data]);
    const line = smoothPath(points);
    const area = `${line} L ${points.at(-1)?.x ?? 64} 214 L 64 214 Z`;
    const maxValue = Math.max(...data.map((item) => item.value), 1);
    const totalValue = data.reduce((total, item) => total + item.value, 0);

    return (
        <div className="mt-6 overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.58)_0%,rgba(240,251,255,0.42)_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-md">
            <svg className="h-78 w-full" viewBox="0 0 720 286">
                <defs>
                    <linearGradient id="curveFill" x1="0" x2="0" y1="0" y2="1">
                        <stop stopColor="#13b8ff" stopOpacity="0.22" />
                        <stop
                            offset="0.68"
                            stopColor="#49ddd7"
                            stopOpacity="0.1"
                        />
                        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient
                        id="curveStroke"
                        x1="0"
                        x2="1"
                        y1="0"
                        y2="0"
                    >
                        <stop stopColor="#49ddd7" />
                        <stop offset="0.45" stopColor="#13b8ff" />
                        <stop offset="1" stopColor="#0878e8" />
                    </linearGradient>
                    <filter
                        id="curveGlow"
                        height="180%"
                        width="180%"
                        x="-40%"
                        y="-40%"
                    >
                        <feGaussianBlur stdDeviation="5" />
                    </filter>
                </defs>

                <rect
                    fill="rgba(255,255,255,0.28)"
                    height="190"
                    rx="24"
                    width="632"
                    x="44"
                    y="36"
                />

                {[54, 94, 134, 174, 214].map((y) => (
                    <line
                        key={`h-${y}`}
                        stroke="#D8EFF9"
                        strokeDasharray="6 10"
                        strokeOpacity="0.78"
                        x1="64"
                        x2="656"
                        y1={y}
                        y2={y}
                    />
                ))}

                <text
                    fill="#8EA2B8"
                    fontSize="11"
                    fontWeight="900"
                    textAnchor="start"
                    x="64"
                    y="24"
                >
                    TOTAL {totalValue}
                </text>
                <text
                    fill="#B8C7D8"
                    fontSize="10"
                    fontWeight="800"
                    textAnchor="end"
                    x="48"
                    y="58"
                >
                    {maxValue}
                </text>
                <text
                    fill="#B8C7D8"
                    fontSize="10"
                    fontWeight="800"
                    textAnchor="end"
                    x="48"
                    y="218"
                >
                    0
                </text>
                <path d={area} fill="url(#curveFill)" />
                <path
                    d={line}
                    fill="none"
                    filter="url(#curveGlow)"
                    opacity="0.16"
                    stroke="#0878e8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="10"
                />
                <path
                    d={line}
                    fill="none"
                    stroke="url(#curveStroke)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="4"
                />
                {points.map((point, index) => {
                    const isActive = point.value > 0;

                    return (
                        <g key={`${point.label}-${index}`}>
                            <line
                                stroke={isActive ? '#BFEAF8' : '#E7F5FB'}
                                strokeDasharray="4 10"
                                strokeOpacity={isActive ? '0.9' : '0.55'}
                                x1={point.x}
                                x2={point.x}
                                y1="54"
                                y2="214"
                            />
                            {isActive && (
                                <text
                                    fill="#0878e8"
                                    fontSize="12"
                                    fontWeight="900"
                                    textAnchor="middle"
                                    x={point.x}
                                    y={point.y - 16}
                                >
                                    {point.value}
                                </text>
                            )}
                            <circle
                                cx={point.x}
                                cy="214"
                                fill={isActive ? '#CFF7F3' : '#DDF1FA'}
                                r={isActive ? '4' : '3'}
                            />
                            <text
                                fill={isActive ? '#0878e8' : '#8BABBA'}
                                fontSize="11"
                                fontWeight="900"
                                textAnchor="middle"
                                x={point.x}
                                y="250"
                            >
                                {point.label}
                            </text>
                        </g>
                    );
                })}

                {points.map((point, index) => {
                    const isActive = point.value > 0;

                    return (
                        <circle
                            key={`dot-${point.label}-${index}`}
                            cx={point.x}
                            cy={point.y}
                            fill={isActive ? '#ffffff' : '#F7FCFF'}
                            r={isActive ? '7' : '5'}
                            stroke={isActive ? '#13b8ff' : '#CFEAF6'}
                            strokeWidth={isActive ? '4' : '3'}
                        />
                    );
                })}
            </svg>
        </div>
    );
}

function smoothPath(points: Array<SeriesPoint & { x: number; y: number }>) {
    if (points.length === 0) {
        return '';
    }

    if (points.length === 1) {
        return `M ${points[0].x} ${points[0].y}`;
    }

    return points.reduce((path, point, index) => {
        if (index === 0) {
            return `M ${point.x} ${point.y}`;
        }

        const previous = points[index - 1];
        const controlX = (previous.x + point.x) / 2;

        return `${path} C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
    }, '');
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
