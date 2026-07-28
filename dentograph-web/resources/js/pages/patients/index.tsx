import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarDays,
    Eye,
    FileClock,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Plus,
    Search,
    Trash2,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import ConfirmDeleteDialog from '@/components/confirm-delete-dialog';
import ListPagination, {
    getPageItems,
    getTotalPages,
} from '@/components/list-pagination';
import patients from '@/routes/patients';

type Patient = {
    id: number;
    nik: string;
    name: string;
    email: string | null;
    phone: string | null;
    birth_place: string | null;
    birth_date: string | null;
    age: number;
    gender: 'male' | 'female';
    address: string | null;
    created_at: string | null;
};

type PatientsIndexProps = {
    patients: Patient[];
    filters: {
        total: number;
        male: number;
        female: number;
    };
    permissions: {
        create: boolean;
        update: boolean;
        delete: boolean;
        view_history: boolean;
    };
};

const genderLabels: Record<Patient['gender'], string> = {
    male: 'Laki-laki',
    female: 'Perempuan',
};

function formatDate(value: string | null) {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

export default function PatientsIndex({
    patients: patientRows,
    filters,
    permissions,
}: PatientsIndexProps) {
    const [search, setSearch] = useState('');
    const [deletingPatient, setDeletingPatient] = useState<Patient | null>(
        null,
    );
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const visiblePatients = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return patientRows;
        }

        return patientRows.filter((patient) =>
            [
                patient.name,
                patient.nik,
                patient.email,
                patient.phone,
                patient.birth_place,
                patient.address,
                genderLabels[patient.gender],
            ]
                .filter(Boolean)
                .some((value) => value?.toLowerCase().includes(query)),
        );
    }, [patientRows, search]);

    const totalPages = getTotalPages(visiblePatients.length, pageSize);
    const currentPage = Math.min(page, totalPages);
    const paginatedPatients = useMemo(
        () => getPageItems(visiblePatients, currentPage, pageSize),
        [currentPage, pageSize, visiblePatients],
    );

    function deletePatient() {
        if (!deletingPatient) {
            return;
        }

        setDeleteProcessing(true);

        router.delete(patients.destroy.url(deletingPatient.nik), {
            onFinish: () => setDeleteProcessing(false),
            onSuccess: () => setDeletingPatient(null),
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title="Pasien" />

            <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-3">
                    <article className="group relative overflow-hidden rounded-[24px] border border-white/70 bg-white/35 p-5 shadow-[0_18px_45px_rgba(19,184,255,0.08)] backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:bg-white/50">
                        <img
                            alt=""
                            className="pointer-events-none absolute -right-20 -bottom-24 w-56 opacity-[0.08] transition duration-500 group-hover:scale-110 group-hover:opacity-[0.13]"
                            src="/asset/images/gigi.png"
                        />
                        <div className="flex items-center justify-between gap-4">
                            <div className="relative z-10">
                                <p className="text-[11px] font-black tracking-[0.28em] text-[#9ea6b6] uppercase">
                                    Total Pasien
                                </p>
                                <strong className="mt-3 block text-[40px] leading-none font-black text-[#1c78ea]">
                                    {filters.total}
                                </strong>
                            </div>
                            <span className="relative z-10 grid size-13 place-items-center rounded-[16px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] text-white shadow-[0_12px_28px_rgba(8,120,232,0.22)]">
                                <Users size={21} />
                            </span>
                        </div>
                    </article>

                    <article className="group relative overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#20b9ff_0%,#0878e8_100%)] p-5 text-white shadow-[0_24px_55px_rgba(8,120,232,0.22)] transition-all duration-500 hover:-translate-y-1">
                        <img
                            alt=""
                            className="pointer-events-none absolute -right-20 -bottom-24 w-56 opacity-[0.12] transition duration-500 group-hover:scale-110 group-hover:opacity-[0.18]"
                            src="/asset/images/gigi.png"
                        />
                        <div className="absolute -top-16 -right-16 size-44 rounded-full bg-white/15 blur-3xl" />
                        <p className="relative text-[11px] font-black tracking-[0.28em] text-white/75 uppercase">
                            Pasien Laki-laki
                        </p>
                        <strong className="relative mt-3 block text-[40px] leading-none font-black">
                            {filters.male}
                        </strong>
                    </article>

                    <article className="group relative overflow-hidden rounded-[24px] border border-white/70 bg-white/40 p-5 shadow-[0_18px_45px_rgba(19,184,255,0.08)] backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:bg-white/55">
                        <img
                            alt=""
                            className="pointer-events-none absolute -right-20 -bottom-24 w-56 opacity-[0.08] transition duration-500 group-hover:scale-110 group-hover:opacity-[0.13]"
                            src="/asset/images/gigi.png"
                        />
                        <div className="relative z-10">
                            <p className="text-[11px] font-black tracking-[0.28em] text-[#9ea6b6] uppercase">
                                Pasien Perempuan
                            </p>
                            <strong className="mt-3 block text-[40px] leading-none font-black text-[#1c78ea]">
                                {filters.female}
                            </strong>
                        </div>
                    </article>
                </section>

                <section className="overflow-hidden rounded-[30px] border border-white/70 bg-white/35 shadow-[0_24px_55px_rgba(19,184,255,0.1)] backdrop-blur-md">
                    <div className="flex flex-col gap-4 border-b border-white/60 p-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="mb-2 text-[11px] font-black tracking-[0.42em] text-[#49ddd7] uppercase">
                                DATA PASIEN
                            </p>
                            <p className="mt-3 text-[15px] leading-[1.8] text-[#808999] italic">
                                Kelola identitas pasien dan akses riwayat
                                pemeriksaan.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <label className="flex h-12 min-w-0 items-center gap-2 rounded-[14px] border border-white/70 bg-white/45 px-4 text-[#7B8BA7] shadow-sm backdrop-blur-md sm:w-72">
                                <Search size={16} />
                                <input
                                    aria-label="Cari pasien"
                                    className="min-w-0 flex-1 bg-transparent text-sm text-[#22304F] outline-none placeholder:text-[#9BA8BC]"
                                    onChange={(event) => {
                                        setSearch(event.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Cari pasien"
                                    type="search"
                                    value={search}
                                />
                            </label>

                            {permissions.create && (
                                <Link
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] px-5 text-xs font-black tracking-wider text-white uppercase shadow-[0_12px_28px_rgba(8,120,232,0.22)] transition-all hover:scale-[1.02] active:scale-95"
                                    href={patients.create()}
                                    prefetch
                                >
                                    <Plus size={16} />
                                    Tambah Pasien
                                </Link>
                            )}
                        </div>
                    </div>

                    {visiblePatients.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[920px] border-collapse text-left">
                                <thead>
                                    <tr className="bg-white/30 text-[11px] font-black tracking-[0.22em] text-[#9ea6b6] uppercase">
                                        <th className="px-5 py-4">Pasien</th>
                                        <th className="px-5 py-4">NIK</th>
                                        <th className="px-5 py-4">Kontak</th>
                                        <th className="px-5 py-4">Lahir</th>
                                        <th className="px-5 py-4">Gender</th>
                                        <th className="px-5 py-4 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/60">
                                    {paginatedPatients.map((patient) => (
                                        <tr
                                            className="text-sm text-[#526184] transition hover:bg-white/45"
                                            key={patient.id}
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-start gap-3">
                                                    <span className="grid size-11 shrink-0 place-items-center rounded-[15px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] text-sm font-black text-white shadow-[0_10px_24px_rgba(8,120,232,0.18)]">
                                                        {patient.name
                                                            .slice(0, 1)
                                                            .toUpperCase()}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-[#22304F]">
                                                            {patient.name}
                                                        </p>
                                                        <p className="mt-1 flex items-center gap-1 text-xs text-[#7B8BA7]">
                                                            <MapPin size={13} />
                                                            <span className="truncate">
                                                                {patient.address ??
                                                                    '-'}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 font-medium text-[#22304F]">
                                                {patient.nik}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="space-y-1 text-xs">
                                                    <p className="flex items-center gap-2">
                                                        <Mail size={13} />
                                                        {patient.email ?? '-'}
                                                    </p>
                                                    <p className="flex items-center gap-2">
                                                        <Phone size={13} />
                                                        {patient.phone ?? '-'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="flex items-center gap-2">
                                                    <CalendarDays size={14} />
                                                    {formatDate(
                                                        patient.birth_date,
                                                    )}
                                                </p>
                                                <p className="mt-1 text-xs text-[#7B8BA7]">
                                                    {patient.birth_place ?? '-'}{' '}
                                                    / {patient.age} tahun
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex rounded-[10px] border border-white/70 bg-white/45 px-3 py-1 text-xs font-black text-[#1599F5] shadow-sm backdrop-blur-md">
                                                    {
                                                        genderLabels[
                                                            patient.gender
                                                        ]
                                                    }
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        aria-label={`Detail ${patient.name}`}
                                                        className="grid size-9 place-items-center rounded-[13px] border border-sky-100/80 bg-sky-50/75 text-[#1599F5] shadow-[0_12px_28px_rgba(14,165,233,0.12)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-100/80 hover:shadow-[0_16px_34px_rgba(14,165,233,0.18)]"
                                                        href={patients.show(
                                                            patient.nik,
                                                        )}
                                                        prefetch
                                                        title="Detail pasien"
                                                    >
                                                        <Eye size={16} />
                                                    </Link>

                                                    {permissions.view_history && (
                                                        <Link
                                                            aria-label={`Riwayat pemeriksaan ${patient.name}`}
                                                            className="grid size-9 place-items-center rounded-[13px] border border-violet-100/80 bg-violet-50/75 text-violet-500 shadow-[0_12px_28px_rgba(139,92,246,0.12)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-100/80 hover:shadow-[0_16px_34px_rgba(139,92,246,0.18)]"
                                                            href={patients.history(
                                                                patient.nik,
                                                            )}
                                                            prefetch
                                                            title="Riwayat pemeriksaan"
                                                        >
                                                            <FileClock
                                                                size={16}
                                                            />
                                                        </Link>
                                                    )}

                                                    {permissions.update && (
                                                        <Link
                                                            aria-label={`Edit ${patient.name}`}
                                                            className="grid size-9 place-items-center rounded-[13px] border border-cyan-100/80 bg-cyan-50/75 text-cyan-600 shadow-[0_12px_28px_rgba(6,182,212,0.12)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-100/80 hover:shadow-[0_16px_34px_rgba(6,182,212,0.18)]"
                                                            href={patients.edit(
                                                                patient.nik,
                                                            )}
                                                            prefetch
                                                        >
                                                            <Pencil size={16} />
                                                        </Link>
                                                    )}

                                                    {permissions.delete && (
                                                        <button
                                                            aria-label={`Hapus ${patient.name}`}
                                                            className="grid size-9 place-items-center rounded-[13px] border border-rose-100/80 bg-rose-50/75 text-rose-500 shadow-[0_12px_28px_rgba(244,63,94,0.12)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-100/80 hover:shadow-[0_16px_34px_rgba(244,63,94,0.18)]"
                                                            onClick={() =>
                                                                setDeletingPatient(
                                                                    patient,
                                                                )
                                                            }
                                                            type="button"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid min-h-80 place-items-center p-8 text-center">
                            <div className="max-w-sm rounded-[28px] border border-white/70 bg-white/40 p-8 shadow-[0_18px_45px_rgba(19,184,255,0.08)] backdrop-blur-md">
                                <span className="mx-auto grid size-14 place-items-center rounded-[18px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] text-white shadow-[0_12px_28px_rgba(8,120,232,0.22)]">
                                    <Users size={24} />
                                </span>
                                <h3 className="mt-5 text-[20px] font-black tracking-[-0.04em] text-[#0878e8] uppercase">
                                    {patientRows.length
                                        ? 'Pasien tidak ditemukan'
                                        : 'Belum ada pasien'}
                                </h3>
                                <p className="mt-3 text-[15px] leading-[1.8] text-[#808999] italic">
                                    {patientRows.length
                                        ? 'Coba gunakan kata kunci lain untuk menemukan data pasien.'
                                        : 'Tambahkan pasien pertama untuk mulai menyimpan data pemeriksaan.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {visiblePatients.length > 0 && (
                        <ListPagination
                            page={currentPage}
                            pageSize={pageSize}
                            setPage={setPage}
                            setPageSize={setPageSize}
                            total={visiblePatients.length}
                        />
                    )}
                </section>

                <ConfirmDeleteDialog
                    description={
                        deletingPatient
                            ? `Data pasien ${deletingPatient.name} dan akun terkait akan dihapus permanen.`
                            : ''
                    }
                    onConfirm={deletePatient}
                    onOpenChange={(open) => {
                        if (!open && !deleteProcessing) {
                            setDeletingPatient(null);
                        }
                    }}
                    open={deletingPatient !== null}
                    processing={deleteProcessing}
                    title="Hapus pasien?"
                />
            </div>
        </>
    );
}

PatientsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Pasien',
            href: patients.index(),
        },
    ],
};
