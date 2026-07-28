import { Link, router } from '@inertiajs/react';
import {
    Activity,
    CheckCircle2,
    Clock3,
    Search,
    ShieldCheck,
    Trash2,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import ConfirmDeleteDialog from '@/components/confirm-delete-dialog';
import ListPagination, {
    getPageItems,
    getTotalPages,
} from '@/components/list-pagination';
import radiographs from '@/routes/radiographs';
import * as radiographHistory from '@/routes/radiographs/history';

type RadiographItem = {
    id_radiograph: string;
    patient_name: string;
    patient_nik: string;
    doctor_name: string | null;
    radiographer_name: string | null;
    status: 'menunggu' | 'terverifikasi' | string;
    image_url: string;
    created_at: string | null;
    detections_count?: number;
    relative_time?: string | null;
    can_delete?: boolean;
};

type Props = {
    radiographs?: RadiographItem[];
    filters?: {
        total: number;
        waiting: number;
        verified: number;
    };
    permissions?: {
        delete: boolean;
    };
};

type StatusFilter = 'semua' | 'menunggu' | 'terverifikasi';

export default function RadiographsHistory({
    filters,
    permissions = { delete: false },
    radiographs: items = [],
}: Props) {
    const params = new URLSearchParams(window.location.search);
    const initialStatus = params.get('status') as StatusFilter | null;
    const [status, setStatus] = useState<StatusFilter>(
        initialStatus &&
            ['semua', 'menunggu', 'terverifikasi'].includes(initialStatus)
            ? initialStatus
            : 'semua',
    );
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const visible = useMemo(() => {
        const keyword = query.trim().toLowerCase();

        return items.filter((item) => {
            const matchStatus = status === 'semua' || item.status === status;
            const matchKeyword =
                keyword.length === 0 ||
                item.patient_name.toLowerCase().includes(keyword) ||
                item.patient_nik.toLowerCase().includes(keyword) ||
                item.id_radiograph.toLowerCase().includes(keyword);

            return matchStatus && matchKeyword;
        });
    }, [items, query, status]);

    const totalPages = getTotalPages(visible.length, pageSize);
    const currentPage = Math.min(page, totalPages);
    const paginated = useMemo(
        () => getPageItems(visible, currentPage, pageSize),
        [currentPage, pageSize, visible],
    );

    const tabs = [
        {
            label: 'Semua',
            value: 'semua',
            count: filters?.total ?? items.length,
            icon: Activity,
        },
        {
            label: 'Menunggu',
            value: 'menunggu',
            count:
                filters?.waiting ??
                items.filter((item) => item.status === 'menunggu').length,
            icon: Clock3,
        },
        {
            label: 'Terverifikasi',
            value: 'terverifikasi',
            count:
                filters?.verified ??
                items.filter((item) => item.status === 'terverifikasi').length,
            icon: CheckCircle2,
        },
    ] as const;

    function changeStatus(next: StatusFilter) {
        setStatus(next);
        setPage(1);
        router.visit(
            radiographHistory.index.url({
                query: next === 'semua' ? {} : { status: next },
            }),
            {
                replace: true,
                preserveScroll: true,
                preserveState: true,
            },
        );
    }

    function deleteRadiograph(id: string) {
        router.delete(radiographs.destroy.url(id), {
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
        });
    }

    return (
        <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-3">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = status === tab.value;

                    return (
                        <button
                            className={`group relative overflow-hidden rounded-[24px] border p-5 text-left shadow-[0_18px_45px_rgba(19,184,255,0.08)] backdrop-blur-md transition-all duration-500 hover:-translate-y-1 ${
                                active
                                    ? 'border-transparent bg-[linear-gradient(135deg,#20b9ff_0%,#0878e8_100%)] text-white shadow-[0_24px_55px_rgba(8,120,232,0.22)]'
                                    : 'border-white/70 bg-white/40 hover:bg-white/55'
                            }`}
                            key={tab.value}
                            onClick={() => changeStatus(tab.value)}
                            type="button"
                        >
                            <img
                                alt=""
                                className={`pointer-events-none absolute -right-20 -bottom-24 w-56 transition duration-500 group-hover:scale-110 ${
                                    active
                                        ? 'opacity-[0.12] group-hover:opacity-[0.18]'
                                        : 'opacity-[0.08] group-hover:opacity-[0.13]'
                                }`}
                                src="/asset/images/gigi.png"
                            />
                            <div className="relative z-10 flex items-center justify-between gap-4">
                                <div>
                                    <p
                                        className={`text-[11px] font-black tracking-[0.28em] uppercase ${
                                            active
                                                ? 'text-white/75'
                                                : 'text-[#9ea6b6]'
                                        }`}
                                    >
                                        {tab.label}
                                    </p>
                                    <strong
                                        className={`mt-3 block text-[40px] leading-none font-black ${
                                            active
                                                ? 'text-white'
                                                : 'text-[#1c78ea]'
                                        }`}
                                    >
                                        {tab.count}
                                    </strong>
                                </div>
                                <span
                                    className={`grid size-13 place-items-center rounded-[16px] ${
                                        active
                                            ? 'bg-white/18 text-white'
                                            : 'bg-[#DDF6FF] text-[#0d8ecf]'
                                    }`}
                                >
                                    <Icon size={20} />
                                </span>
                            </div>
                        </button>
                    );
                })}
            </section>

            <section className="overflow-hidden rounded-[30px] border border-white/70 bg-white/35 shadow-[0_24px_55px_rgba(19,184,255,0.1)] backdrop-blur-md">
                <div className="flex flex-col gap-4 border-b border-white/60 p-5 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-[11px] font-black tracking-[0.42em] text-[#49ddd7] uppercase">
                            RIWAYAT DETEKSI
                        </p>
                        <h2 className="mt-2 text-[30px] leading-none font-black text-[#0878e8] uppercase">
                            SEMUA PEMERIKSAAN RADIOGRAF
                        </h2>
                        <p className="mt-4 text-[15px] leading-[1.8] text-[#808999] italic">
                            Pantau radiograf yang masih menunggu analisis dan
                            hasil yang sudah terverifikasi dokter.
                        </p>
                    </div>

                    <label className="flex h-12 min-w-0 items-center gap-2 rounded-[14px] border border-white/70 bg-white/45 px-4 text-[#7B8BA7] shadow-sm backdrop-blur-md sm:w-80">
                        <Search size={16} />
                        <input
                            aria-label="Cari riwayat radiograf"
                            className="min-w-0 flex-1 bg-transparent text-sm text-[#22304F] outline-none placeholder:text-[#9BA8BC]"
                            onChange={(event) => {
                                setQuery(event.target.value);
                                setPage(1);
                            }}
                            placeholder="Cari pasien, NIK, atau ID"
                            type="search"
                            value={query}
                        />
                        {query && (
                            <button
                                aria-label="Kosongkan pencarian"
                                className="text-[#9BA8BC] transition hover:text-[#0878e8]"
                                onClick={() => {
                                    setQuery('');
                                    setPage(1);
                                }}
                                type="button"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </label>
                </div>

                {visible.length === 0 ? (
                    <div className="grid min-h-80 place-items-center p-8 text-center">
                        <div className="max-w-sm rounded-[28px] border border-white/70 bg-white/40 p-8 text-sm font-semibold text-[#7B8BA7] shadow-[0_18px_45px_rgba(19,184,255,0.08)] backdrop-blur-md">
                            <span className="mx-auto grid size-14 place-items-center rounded-[18px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] text-white shadow-[0_12px_28px_rgba(8,120,232,0.22)]">
                                <ShieldCheck size={24} />
                            </span>
                            <h3 className="mt-5 text-[20px] font-black text-[#0878e8] uppercase">
                                Data kosong
                            </h3>
                            <p className="mt-3">
                                Tidak ada riwayat yang cocok dengan filter.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4 p-4 xl:grid-cols-2">
                        {paginated.map((item) => (
                            <article
                                className="group relative overflow-hidden rounded-[28px] border border-white/75 bg-white/45 p-4 text-sm text-[#526184] shadow-[0_18px_44px_rgba(19,184,255,0.10)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/72 hover:shadow-[0_26px_64px_rgba(19,184,255,0.18)]"
                                key={item.id_radiograph}
                            >
                                <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[#86d8ff]/18 blur-3xl transition group-hover:scale-125" />
                                <div
                                    className={`absolute inset-x-4 top-0 h-1 rounded-b-full ${
                                        item.status === 'terverifikasi'
                                            ? 'bg-[linear-gradient(90deg,#34d399_0%,#13b8ff_100%)]'
                                            : 'bg-[linear-gradient(90deg,#fbbf24_0%,#13b8ff_100%)]'
                                    }`}
                                />

                                {permissions.delete && item.can_delete && (
                                    <button
                                        className="absolute top-4 right-4 z-20 grid size-10 place-items-center rounded-[14px] border border-rose-100/80 bg-rose-50/90 text-rose-500 shadow-[0_12px_28px_rgba(244,63,94,0.12)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-rose-100"
                                        onClick={() =>
                                                    setDeletingId(item.id_radiograph)
                                        }
                                        title="Hapus radiograf dan hasil deteksi"
                                        type="button"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}

                                <Link
                                    className="relative z-10 grid gap-4 sm:grid-cols-[170px_minmax(0,1fr)]"
                                    href={radiographs.show(item.id_radiograph)}
                                >
                                    <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-white/80 bg-[#EAF8FF] shadow-[0_16px_36px_rgba(8,120,232,0.12)]">
                                        <img
                                            alt=""
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                            src={item.image_url}
                                        />
                                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#073d52]/55 to-transparent" />
                                        <span className="absolute top-3 left-3">
                                            <StatusBadge status={item.status} />
                                        </span>
                <ConfirmDeleteDialog description="Radiograf dan seluruh hasil deteksinya akan dihapus permanen." onConfirm={() => deletingId && deleteRadiograph(deletingId)} onOpenChange={(open) => !open && setDeletingId(null)} open={deletingId !== null} title="Hapus radiograf?" />
            </div>

                                    <div className="flex min-w-0 flex-col justify-between gap-4">
                                        <div className="min-w-0">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-black tracking-[0.24em] text-[#49ddd7] uppercase">
                                                        Riwayat Radiograf
                                                    </p>
                                                    <h3 className="mt-2 truncate text-xl font-black text-[#22304F]">
                                                        {item.patient_name}
                                                    </h3>
                                                </div>
                                                <p className="shrink-0 text-xs font-semibold text-[#9BA8BC]">
                                            {item.relative_time ??
                                                item.created_at ??
                                                '-'}
                                        </p>
                                    </div>
                                            <p className="mt-1 truncate text-xs font-semibold text-[#7B8BA7]">
                                                {item.id_radiograph}
                                            </p>
                                        </div>

                                        <div className="grid gap-2 sm:grid-cols-2">
                                            <InfoBlock
                                                label="Radiografer"
                                                value={
                                                    item.radiographer_name ??
                                                    '-'
                                                }
                                            />
                                            <InfoBlock
                                                label="Dokter"
                                                value={
                                                    item.doctor_name ??
                                                    'Belum dianalisis'
                                                }
                                            />
                                        </div>

                                        <div className="border-t border-white/65 pt-3">
                                            <span className="inline-flex h-10 items-center rounded-[14px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] px-5 text-[10px] font-black tracking-wider text-white uppercase shadow-[0_12px_28px_rgba(8,120,232,0.22)] transition group-hover:translate-x-1 group-hover:shadow-[0_16px_34px_rgba(8,120,232,0.28)]">
                                                Lihat Detail Pemeriksaan
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </article>
                        ))}
                    </div>
                )}
                {visible.length > 0 && (
                    <ListPagination
                        page={currentPage}
                        pageSize={pageSize}
                        setPage={setPage}
                        setPageSize={setPageSize}
                        total={visible.length}
                    />
                )}
            </section>
        </div>
    );
}

RadiographsHistory.layout = () => ({
    breadcrumbs: [
        {
            title: 'Riwayat Deteksi',
            href: radiographHistory.index(),
        },
    ],
});

function InfoBlock({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-0 rounded-[15px] border border-white/70 bg-white/45 px-3 py-2 shadow-[0_10px_24px_rgba(19,184,255,0.08)] backdrop-blur-md">
            <p className="text-[9px] font-black tracking-[0.2em] text-slate-400 uppercase">
                {label}
            </p>
            <p className="mt-1 truncate text-xs font-bold text-[#526184]">
                {value}
            </p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const verified = status === 'terverifikasi';

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-[9px] font-black tracking-[0.12em] uppercase shadow-[0_8px_18px_rgba(19,184,255,0.10)] ${
                verified
                    ? 'bg-emerald-100/95 text-emerald-600'
                    : 'bg-amber-100/95 text-amber-600'
            }`}
        >
            {verified ? 'Terverifikasi' : 'Menunggu'}
        </span>
    );
}
