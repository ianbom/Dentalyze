import { Head, Link } from '@inertiajs/react';
import { Activity, Clock, Search, ShieldCheck, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import ListPagination, {
    getPageItems,
    getTotalPages,
} from '@/components/list-pagination';
import radiographs from '@/routes/radiographs';
import verification from '@/routes/verification';

type VerificationTask = {
    id_radiograph: string;
    patient_name: string;
    patient_nik: string;
    radiographer_name: string | null;
    faskes_name: string | null;
    image_url: string;
    status: string;
    created_at: string | null;
};

type Props = {
    tasks: VerificationTask[];
    filters: { total: number };
    permissions: { verify: boolean };
};

export default function VerificationTasks({
    filters,
    permissions,
    tasks,
}: Props) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const visibleTasks = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return tasks;
        }

        return tasks.filter((item) =>
            [
                item.id_radiograph,
                item.patient_name,
                item.patient_nik,
                item.radiographer_name ?? '',
                item.faskes_name ?? '',
            ].some((value) => value.toLowerCase().includes(query)),
        );
    }, [search, tasks]);

    const totalPages = getTotalPages(visibleTasks.length, pageSize);
    const currentPage = Math.min(page, totalPages);
    const paginatedTasks = useMemo(
        () => getPageItems(visibleTasks, currentPage, pageSize),
        [currentPage, pageSize, visibleTasks],
    );

    return (
        <>
            <Head title="Tugas Verifikasi" />
            <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-3">
                    <article className="group relative overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#20b9ff_0%,#0878e8_100%)] p-5 text-white shadow-[0_24px_55px_rgba(8,120,232,0.22)] transition-all duration-500 hover:-translate-y-1">
                        <img
                            alt=""
                            className="pointer-events-none absolute -right-20 -bottom-24 w-56 opacity-[0.12] transition duration-500 group-hover:scale-110 group-hover:opacity-[0.18]"
                            src="/asset/images/gigi.png"
                        />
                        <div className="relative z-10">
                            <p className="text-[11px] font-black tracking-[0.28em] text-white/75 uppercase">
                                Menunggu
                            </p>
                            <strong className="mt-3 block text-[40px] leading-none font-black">
                                {filters.total}
                            </strong>
                        </div>
                    </article>
                    <article className="group relative overflow-hidden rounded-[24px] border border-white/70 bg-white/40 p-5 shadow-[0_18px_45px_rgba(19,184,255,0.08)] backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:bg-white/55 md:col-span-2">
                        <img
                            alt=""
                            className="pointer-events-none absolute -right-20 -bottom-24 w-56 opacity-[0.08] transition duration-500 group-hover:scale-110 group-hover:opacity-[0.13]"
                            src="/asset/images/gigi.png"
                        />
                        <div className="relative z-10">
                            <p className="text-[11px] font-black tracking-[0.28em] text-[#9ea6b6] uppercase">
                                Tugas Dokter
                            </p>
                            <strong className="mt-3 block text-[40px] leading-none font-black text-[#1c78ea]">
                                {visibleTasks.length}
                            </strong>
                            <p className="mt-3 text-[15px] leading-[1.8] text-[#808999] italic">
                                Radiograf dengan status menunggu akan muncul di
                                sini. Buka detail untuk menjalankan deteksi,
                                mengoreksi odontogram, lalu menyimpan hasil
                                final.
                            </p>
                        </div>
                    </article>
                </section>

                <section className="overflow-hidden rounded-[30px] border border-white/70 bg-white/35 shadow-[0_24px_55px_rgba(19,184,255,0.1)] backdrop-blur-md">
                    <div className="flex flex-col gap-4 border-b border-white/60 p-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-[11px] font-black tracking-[0.42em] text-[#49ddd7] uppercase">
                                DAFTAR TUGAS
                            </p>
                            <h2 className="mt-2 text-[30px] leading-none font-black text-[#0878e8] uppercase">
                                VERIFIKASI DETEKSI PENYAKIT
                            </h2>
                            <p className="mt-4 text-[15px] leading-[1.8] text-[#808999] italic">
                                Pilih radiograf yang menunggu untuk masuk ke
                                halaman detail deteksi.
                            </p>
                        </div>
                        <label className="flex h-12 min-w-0 items-center gap-2 rounded-[14px] border border-white/70 bg-white/45 px-4 text-[#7B8BA7] shadow-sm backdrop-blur-md sm:w-80">
                            <Search size={16} />
                            <input
                                aria-label="Cari tugas verifikasi"
                                className="min-w-0 flex-1 bg-transparent text-sm text-[#22304F] outline-none placeholder:text-[#9BA8BC]"
                                onChange={(event) => {
                                    setSearch(event.target.value);
                                    setPage(1);
                                }}
                                placeholder="Cari tugas"
                                type="search"
                                value={search}
                            />
                            {search && (
                                <button
                                    aria-label="Kosongkan pencarian"
                                    className="text-[#9BA8BC] transition hover:text-[#0878e8]"
                                    onClick={() => setSearch('')}
                                    type="button"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </label>
                    </div>

                    {!permissions.verify && (
                        <p className="m-5 rounded-[20px] border border-white/70 bg-white/45 p-5 text-sm font-semibold text-[#7B8BA7]">
                            Akun ini tidak memiliki akses verifikasi.
                        </p>
                    )}

                    {permissions.verify && visibleTasks.length === 0 && (
                        <div className="grid min-h-80 place-items-center p-8 text-center">
                            <div className="max-w-sm rounded-[28px] border border-white/70 bg-white/40 p-8 text-sm font-semibold text-[#7B8BA7] shadow-[0_18px_45px_rgba(19,184,255,0.08)] backdrop-blur-md">
                                <span className="mx-auto grid size-14 place-items-center rounded-[18px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] text-white shadow-[0_12px_28px_rgba(8,120,232,0.22)]">
                                    <ShieldCheck size={24} />
                                </span>
                                <h3 className="mt-5 text-[20px] font-black text-[#0878e8] uppercase">
                                    Tugas kosong
                                </h3>
                                <p className="mt-3">
                                    Tidak ada radiograf yang menunggu
                                    verifikasi.
                                </p>
                            </div>
                        </div>
                    )}

                    {permissions.verify && visibleTasks.length > 0 && (
                        <div className="grid gap-4 p-4 xl:grid-cols-2">
                            {paginatedTasks.map((item) => (
                                <Link
                                    className="group relative overflow-hidden rounded-[28px] border border-white/75 bg-white/45 p-4 text-sm text-[#526184] shadow-[0_18px_44px_rgba(19,184,255,0.10)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/72 hover:shadow-[0_26px_64px_rgba(19,184,255,0.18)]"
                                    href={radiographs.show(item.id_radiograph)}
                                    key={item.id_radiograph}
                                    prefetch
                                >
                                    <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[#86d8ff]/18 blur-3xl transition group-hover:scale-125" />
                                    <div className="relative z-10 grid gap-4 sm:grid-cols-[170px_minmax(0,1fr)]">
                                        <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-white/80 bg-[#EAF8FF] shadow-[0_16px_36px_rgba(8,120,232,0.12)]">
                                            <img
                                                alt=""
                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                src={item.image_url}
                                            />
                                            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#073d52]/55 to-transparent" />
                                            <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-amber-100/95 px-3 py-1.5 text-[9px] font-black tracking-[0.08em] text-amber-600 uppercase shadow-[0_8px_18px_rgba(245,158,11,0.14)]">
                                                <Clock size={11} /> Menunggu
                                            </span>
                                        </div>

                                        <div className="flex min-w-0 flex-col justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black tracking-[0.24em] text-[#49ddd7] uppercase">
                                                    Tugas Verifikasi
                                                </p>
                                                <h3 className="mt-2 truncate text-xl font-black text-[#22304F]">
                                                    {item.patient_name}
                                                </h3>
                                                <p className="mt-1 truncate text-xs font-semibold text-[#7B8BA7]">
                                                    {item.id_radiograph}
                                                </p>
                                            </div>

                                            <div className="grid gap-2 sm:grid-cols-2">
                                                <InfoPill
                                                    label="Radiografer"
                                                    value={
                                                        item.radiographer_name ??
                                                        '-'
                                                    }
                                                />
                                                <InfoPill
                                                    label="Upload"
                                                    value={
                                                        item.created_at ?? '-'
                                                    }
                                                />
                                                <InfoPill
                                                    label="Faskes Asal"
                                                    value={
                                                        item.faskes_name ?? '-'
                                                    }
                                                />
                                            </div>

                                            <div className="flex items-center justify-between gap-3 border-t border-white/65 pt-3">
                                                <span className="text-[10px] font-black tracking-[0.18em] text-[#9ea6b6] uppercase">
                                                    Perlu tindakan
                                                </span>
                                                <span className="inline-flex h-10 items-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] px-4 text-[10px] font-black tracking-wider text-white uppercase shadow-[0_12px_28px_rgba(8,120,232,0.22)] transition-all group-hover:scale-[1.02]">
                                                    <Activity size={15} /> Buka
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {permissions.verify && visibleTasks.length > 0 && (
                        <ListPagination
                            page={currentPage}
                            pageSize={pageSize}
                            setPage={setPage}
                            setPageSize={setPageSize}
                            total={visibleTasks.length}
                        />
                    )}
                </section>
            </div>
        </>
    );
}

function InfoPill({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-[15px] border border-white/70 bg-white/45 px-3 py-2 shadow-[0_10px_24px_rgba(19,184,255,0.08)] backdrop-blur-md">
            <p className="text-[9px] font-black tracking-[0.18em] text-[#9ea6b6] uppercase">
                {label}
            </p>
            <p className="mt-1 truncate text-xs font-bold text-[#526184]">
                {value}
            </p>
        </div>
    );
}

VerificationTasks.layout = {
    breadcrumbs: [
        {
            title: 'Tugas Verifikasi',
            href: verification.tasks(),
        },
    ],
};
