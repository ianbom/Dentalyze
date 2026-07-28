import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Activity,
    ImagePlus,
    Play,
    Search,
    Trash2,
    UserPlus,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ConfirmDeleteDialog from '@/components/confirm-delete-dialog';
import ListPagination, {
    getPageItems,
    getTotalPages,
} from '@/components/list-pagination';
import ThemedDateInput from '@/components/themed-date-input';
import { cn } from '@/lib/utils';
import patientRoutes from '@/routes/patients';
import radiographs from '@/routes/radiographs';

type Option = { name: string; nik?: string };
type Radiograph = {
    id_radiograph: string;
    patient_name: string;
    patient_nik: string;
    doctor_name: string | null;
    radiographer_name: string | null;
    image_url: string;
    status: string;
    missing_teeth_count?: number;
    can_delete?: boolean;
    created_at: string | null;
};

type DetectionIndexProps = {
    radiographs: Radiograph[];
    patients: Option[];
    filters: { total: number; waiting: number; verified: number };
    permissions: { create: boolean; analyze: boolean; delete: boolean };
};

type PatientFormData = {
    nik: string;
    name: string;
    email: string;
    phone: string;
    birth_place: string;
    birth_date: string;
    age: string;
    gender: 'male' | 'female';
    address: string;
    return_to: 'radiographs.index';
};

export default function DetectionIndex({
    filters,
    patients,
    permissions,
    radiographs: rows,
}: DetectionIndexProps) {
    const [search, setSearch] = useState('');
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showQuickPatient, setShowQuickPatient] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const {
        data,
        setData,
        post: uploadRadiograph,
        processing,
        progress,
        errors,
        reset,
    } = useForm<{
        patient_nik: string;
        image: File | null;
    }>({ patient_nik: '', image: null });
    const {
        data: patientData,
        setData: setPatientData,
        post: storePatient,
        processing: patientProcessing,
        errors: patientErrors,
        reset: resetPatient,
    } = useForm<PatientFormData>({
        nik: '',
        name: '',
        email: '',
        phone: '',
        birth_place: '',
        birth_date: '',
        age: '',
        gender: 'male',
        address: '',
        return_to: 'radiographs.index',
    });

    useEffect(() => {
        const patientNik = new URLSearchParams(window.location.search).get(
            'patient_nik',
        );

        if (patientNik) {
            setData('patient_nik', patientNik);
        }
    }, [setData]);

    const visibleRows = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return rows;
        }

        return rows.filter((item) =>
            [
                item.id_radiograph,
                item.patient_name,
                item.patient_nik,
                item.status,
            ]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(query)),
        );
    }, [rows, search]);

    const totalPages = getTotalPages(visibleRows.length, pageSize);
    const currentPage = Math.min(page, totalPages);
    const paginatedRows = useMemo(
        () => getPageItems(visibleRows, currentPage, pageSize),
        [currentPage, pageSize, visibleRows],
    );

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        uploadRadiograph(radiographs.store.url(), {
            forceFormData: true,
            onSuccess: () => reset(),
        });
    }

    function submitQuickPatient(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        storePatient(patientRoutes.store.url(), {
            preserveScroll: true,
            onSuccess: () => {
                resetPatient();
                setShowQuickPatient(false);
            },
        });
    }

    function updateBirthDate(value: string) {
        setPatientData('birth_date', value);

        if (!value) {
            setPatientData('age', '');

            return;
        }

        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
            age -= 1;
        }

        setPatientData('age', Math.max(age, 0).toString());
    }

    function deleteRadiograph(id: string) {
        router.delete(radiographs.destroy.url(id), {
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
        });
    }

    return (
        <>
            <Head title="Deteksi Penyakit" />
            <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-3">
                    <Stat label="Total Deteksi" value={filters.total} />
                    <Stat label="Menunggu" value={filters.waiting} strong />
                    <Stat label="Terverifikasi" value={filters.verified} />
                </section>

                <section
                    className={cn(
                        'grid gap-6',
                        permissions.create
                            ? 'xl:grid-cols-[0.78fr_1.22fr]'
                            : 'xl:grid-cols-1',
                    )}
                >
                    {permissions.create && (
                        <section
                            className="rounded-[30px] border border-white/70 bg-white/35 p-6 shadow-[0_24px_55px_rgba(19,184,255,0.1)] backdrop-blur-md"
                        >
                            <p className="text-[11px] font-black tracking-[0.42em] text-[#49ddd7] uppercase">
                                DETEKSI PENYAKIT
                            </p>
                            <h2 className="mt-2 text-[30px] leading-none font-black text-[#0878e8] uppercase">
                                Upload Radiograf
                            </h2>
                            <p className="mt-4 text-[15px] leading-[1.8] text-[#808999] italic">
                                Pilih pasien, unggah gambar radiograf, lalu
                                dokter dapat memulai deteksi AI.
                            </p>

                            <button
                                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-[13px] border border-sky-100/80 bg-white/50 px-4 text-xs font-black tracking-wider text-[#0878e8] uppercase shadow-[0_12px_28px_rgba(14,165,233,0.12)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-sky-50"
                                onClick={() =>
                                    setShowQuickPatient((value) => !value)
                                }
                                type="button"
                            >
                                {showQuickPatient ? (
                                    <X size={15} />
                                ) : (
                                    <UserPlus size={15} />
                                )}
                                {showQuickPatient
                                    ? 'Tutup Form Pasien'
                                    : 'Tambah Pasien Baru'}
                            </button>

                            {showQuickPatient && (
                                <form
                                    className="mt-5 rounded-[22px] border border-white/75 bg-white/35 p-4 shadow-[0_18px_42px_rgba(14,165,233,0.1)] backdrop-blur-md"
                                    onSubmit={submitQuickPatient}
                                >
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <Field
                                            error={patientErrors.nik}
                                            label="NIK"
                                        >
                                            <ThemedDateInput
                                                className="h-12 w-full rounded-[14px] border border-white/70 bg-white/45 px-4 text-sm text-[#22304F] shadow-sm backdrop-blur-md outline-none"
                                                maxLength={16}
                                                onChange={(event) =>
                                                    setPatientData(
                                                        'nik',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="16 digit NIK"
                                                value={patientData.nik}
                                            />
                                        </Field>
                                        <Field
                                            error={patientErrors.name}
                                            label="Nama"
                                        >
                                            <input
                                                className="h-12 w-full rounded-[14px] border border-white/70 bg-white/45 px-4 text-sm text-[#22304F] shadow-sm backdrop-blur-md outline-none"
                                                onChange={(event) =>
                                                    setPatientData(
                                                        'name',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Nama pasien"
                                                value={patientData.name}
                                            />
                                        </Field>
                                        <Field
                                            error={patientErrors.birth_date}
                                            label="Tanggal Lahir"
                                        >
                                            <input
                                                className="h-12 w-full rounded-[14px] border border-white/70 bg-white/45 px-4 text-sm text-[#22304F] shadow-sm backdrop-blur-md outline-none"
                                                onChange={(event) =>
                                                    updateBirthDate(
                                                        event.target.value,
                                                    )
                                                }
                                                value={patientData.birth_date}
                                            />
                                        </Field>
                                        <Field
                                            error={patientErrors.age}
                                            label="Usia"
                                        >
                                            <input
                                                className="h-12 w-full rounded-[14px] border border-white/70 bg-white/35 px-4 text-sm text-[#22304F] shadow-sm backdrop-blur-md outline-none"
                                                readOnly
                                                value={patientData.age}
                                            />
                                        </Field>
                                        <Field
                                            error={patientErrors.gender}
                                            label="Gender"
                                        >
                                            <select
                                                className="h-12 w-full rounded-[14px] border border-white/70 bg-white/45 px-4 text-sm text-[#22304F] shadow-sm backdrop-blur-md outline-none"
                                                onChange={(event) =>
                                                    setPatientData(
                                                        'gender',
                                                        event.target.value as
                                                            | 'male'
                                                            | 'female',
                                                    )
                                                }
                                                value={patientData.gender}
                                            >
                                                <option value="male">
                                                    Laki-laki
                                                </option>
                                                <option value="female">
                                                    Perempuan
                                                </option>
                                            </select>
                                        </Field>
                                        <Field
                                            error={patientErrors.birth_place}
                                            label="Tempat Lahir"
                                        >
                                            <input
                                                className="h-12 w-full rounded-[14px] border border-white/70 bg-white/45 px-4 text-sm text-[#22304F] shadow-sm backdrop-blur-md outline-none"
                                                inputMode="numeric"
                                                maxLength={12}
                                                onChange={(event) =>
                                                    setPatientData(
                                                        'birth_place',
                                                        event.target.value.replace(/\D/g, '').slice(0, 12),
                                                    )
                                                }
                                                placeholder="Kota lahir"
                                                value={patientData.birth_place}
                                            />
                                        </Field>
                                        <Field
                                            error={patientErrors.phone}
                                            label="Telepon"
                                        >
                                            <input
                                                className="h-12 w-full rounded-[14px] border border-white/70 bg-white/45 px-4 text-sm text-[#22304F] shadow-sm backdrop-blur-md outline-none"
                                                onChange={(event) =>
                                                    setPatientData(
                                                        'phone',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="11–12 digit nomor telepon"
                                                value={patientData.phone}
                                            />
                                        </Field>
                                        <Field
                                            error={patientErrors.email}
                                            label="Email"
                                        >
                                            <input
                                                className="h-12 w-full rounded-[14px] border border-white/70 bg-white/45 px-4 text-sm text-[#22304F] shadow-sm backdrop-blur-md outline-none"
                                                onChange={(event) =>
                                                    setPatientData(
                                                        'email',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="email@contoh.com"
                                                type="email"
                                                value={patientData.email}
                                            />
                                        </Field>
                                    </div>
                                    <Field
                                        error={patientErrors.address}
                                        label="Alamat"
                                    >
                                        <textarea
                                            className="mt-3 min-h-24 w-full rounded-[14px] border border-white/70 bg-white/45 px-4 py-3 text-sm text-[#22304F] shadow-sm backdrop-blur-md outline-none"
                                            onChange={(event) =>
                                                setPatientData(
                                                    'address',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Alamat lengkap"
                                            value={patientData.address}
                                        />
                                    </Field>
                                    <button
                                        className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-[#084B63] px-5 text-xs font-black tracking-wider text-white uppercase shadow-[0_12px_28px_rgba(8,75,99,0.18)] disabled:opacity-70"
                                        disabled={patientProcessing}
                                        type="submit"
                                    >
                                        <UserPlus size={15} />
                                        {patientProcessing
                                            ? 'Menyimpan Pasien'
                                            : 'Simpan dan Pilih Pasien'}
                                    </button>
                                </form>
                            )}

                            <form className="mt-7 space-y-4" onSubmit={submit}>
                                <Field
                                    error={errors.patient_nik}
                                    label="Pasien"
                                >
                                    <select
                                        className="h-12 w-full rounded-[14px] border border-white/70 bg-white/45 px-4 text-sm text-[#22304F] shadow-sm backdrop-blur-md outline-none"
                                        onChange={(event) =>
                                            setData(
                                                'patient_nik',
                                                event.target.value,
                                            )
                                        }
                                        value={data.patient_nik}
                                    >
                                        <option value="">Pilih pasien</option>
                                        {patients.map((patient) => (
                                            <option
                                                key={patient.nik}
                                                value={patient.nik}
                                            >
                                                {patient.name} - {patient.nik}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                                <Field
                                    error={errors.image}
                                    label="Gambar Radiograf"
                                >
                                    <input
                                        className="block w-full rounded-[14px] border border-white/70 bg-white/45 px-4 py-3 text-sm text-[#22304F] shadow-sm backdrop-blur-md file:mr-4 file:rounded-[10px] file:border-0 file:bg-[#13b8ff] file:px-4 file:py-2 file:text-xs file:font-black file:text-white"
                                        onChange={(event) =>
                                            setData(
                                                'image',
                                                event.target.files?.[0] ?? null,
                                            )
                                        }
                                        type="file"
                                    />
                                </Field>
                                <button
                                    className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] px-6 text-xs font-black tracking-wider text-white uppercase shadow-[0_12px_28px_rgba(8,120,232,0.22)] disabled:opacity-70"
                                    disabled={processing}
                                    type="submit"
                                >
                                    <ImagePlus size={16} />
                                    {processing
                                        ? `Mengunggah${progress?.percentage ? ` ${progress.percentage}%` : ''}`
                                        : 'Upload Radiograf'}
                                </button>
                            </form>
                        </section>
                    )}

                    <section className="overflow-hidden rounded-[30px] border border-white/70 bg-white/35 shadow-[0_24px_55px_rgba(19,184,255,0.1)] backdrop-blur-md">
                        <div className="flex flex-col gap-4 border-b border-white/60 p-5 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-[11px] font-black tracking-[0.42em] text-[#49ddd7] uppercase">
                                    DAFTAR RADIOGRAF
                                </p>
                                <p className="mt-3 text-[15px] leading-[1.8] text-[#808999] italic">
                                    Buka detail untuk membandingkan gambar,
                                    mengoreksi odontogram, dan menyimpan hasil.
                                </p>
                            </div>
                            <label className="flex h-12 min-w-0 items-center gap-2 rounded-[14px] border border-white/70 bg-white/45 px-4 text-[#7B8BA7] shadow-sm backdrop-blur-md sm:w-72">
                                <Search size={16} />
                                <input
                                    className="min-w-0 flex-1 bg-transparent text-sm text-[#22304F] outline-none"
                                    onChange={(event) => {
                                        setSearch(event.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Cari deteksi"
                                    type="search"
                                    value={search}
                                />
                            </label>
                        </div>
                        <div className="divide-y divide-white/60">
                            {paginatedRows.map((item) => (
                                <article
                                    className="grid gap-4 p-5 text-sm text-[#526184] hover:bg-white/45 lg:grid-cols-[1fr_auto]"
                                    key={item.id_radiograph}
                                >
                                    <Link
                                        className="flex gap-4 rounded-[18px] transition outline-none hover:bg-white/35 focus:ring-2 focus:ring-[#13b8ff]/40"
                                        href={radiographs.show(
                                            item.id_radiograph,
                                        )}
                                        prefetch
                                    >
                                        <img
                                            alt=""
                                            className="h-20 w-28 rounded-[16px] object-cover"
                                            src={item.image_url}
                                        />
                                        <div>
                                            <p className="font-black text-[#22304F]">
                                                {item.patient_name}
                                            </p>
                                            <p className="mt-1 text-xs text-[#7B8BA7]">
                                                {item.id_radiograph}
                                            </p>
                                            <StatusBadge status={item.status} />
                                            <p className="mt-2 rounded-[12px] bg-white/55 px-3 py-2 text-xs font-bold text-[#526184] shadow-[0_8px_18px_rgba(19,184,255,0.08)]">
                                                Gigi hilang / tidak terdeteksi:{' '}
                                                <span className="text-[#0878e8]">
                                                    {item.status === 'menunggu' ? '-' : (item.missing_teeth_count ?? '-')}
                                                </span>
                                            </p>
                                        </div>
                                    </Link>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            className="grid size-10 place-items-center rounded-[13px] border border-sky-100/80 bg-sky-50/75 text-[#1599F5] shadow-[0_12px_28px_rgba(14,165,233,0.12)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-sky-100/80"
                                            href={radiographs.show(
                                                item.id_radiograph,
                                            )}
                                            prefetch
                                        >
                                            <Activity size={16} />
                                        </Link>
                                        {permissions.analyze && (
                                            <button
                                                className="grid size-10 place-items-center rounded-[13px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] text-white shadow-[0_12px_28px_rgba(8,120,232,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(8,120,232,0.28)] disabled:opacity-60"
                                                disabled={
                                                    analyzingId ===
                                                    item.id_radiograph
                                                }
                                                onClick={() => {
                                                    setAnalyzingId(
                                                        item.id_radiograph,
                                                    );
                                                    router.post(
                                                        radiographs.analyze.url(
                                                            item.id_radiograph,
                                                        ),
                                                        {},
                                                        {
                                                            onFinish: () =>
                                                                setAnalyzingId(
                                                                    null,
                                                                ),
                                                        },
                                                    );
                                                }}
                                                type="button"
                                                title={
                                                    analyzingId ===
                                                    item.id_radiograph
                                                        ? 'Menganalisis AI'
                                                        : 'Mulai deteksi'
                                                }
                                            >
                                                <Play size={16} />
                                            </button>
                                        )}
                                        {permissions.delete && item.can_delete && (
                                            <button
                                                className="grid size-10 place-items-center rounded-[13px] border border-rose-100/80 bg-rose-50/75 text-rose-500 shadow-[0_12px_28px_rgba(244,63,94,0.12)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-rose-100/80"
                                                onClick={() =>
                                                    setDeletingId(item.id_radiograph)
                                                }
                                                type="button"
                                                title="Hapus radiograf dan hasil deteksi"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                        {visibleRows.length > 0 && (
                            <ListPagination
                                page={currentPage}
                                pageSize={pageSize}
                                setPage={setPage}
                                setPageSize={setPageSize}
                                total={visibleRows.length}
                            />
                        )}
                    </section>
                </section>
                <ConfirmDeleteDialog description="Radiograf dan seluruh hasil deteksinya akan dihapus permanen." onConfirm={() => deletingId && deleteRadiograph(deletingId)} onOpenChange={(open) => !open && setDeletingId(null)} open={deletingId !== null} title="Hapus radiograf?" />
            </div>
        </>
    );
}

function Field({
    children,
    error,
    label,
}: {
    children: React.ReactNode;
    error?: string;
    label: string;
}) {
    return (
        <label className="space-y-2">
            <span className="text-[11px] font-black tracking-[0.24em] text-[#9ea6b6] uppercase">
                {label}
            </span>
            {children}
            {error && (
                <span className="block text-xs font-semibold text-rose-500">
                    {error}
                </span>
            )}
        </label>
    );
}

function StatusBadge({ status }: { status: string }) {
    const verified = status === 'terverifikasi';

    return (
        <span
            className={`mt-2 inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                verified
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-amber-100 text-amber-600'
            }`}
        >
            {verified ? 'Terverifikasi' : 'Menunggu'}
        </span>
    );
}

function Stat({
    label,
    strong = false,
    value,
}: {
    label: string;
    strong?: boolean;
    value: number;
}) {
    return (
        <article
            className={
                strong
                    ? 'group relative overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#20b9ff_0%,#0878e8_100%)] p-5 text-white shadow-[0_24px_55px_rgba(8,120,232,0.22)] transition-all duration-500 hover:-translate-y-1'
                    : 'group relative overflow-hidden rounded-[24px] border border-white/70 bg-white/40 p-5 shadow-[0_18px_45px_rgba(19,184,255,0.08)] backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:bg-white/55'
            }
        >
            <img
                alt=""
                className={`pointer-events-none absolute -right-20 -bottom-24 w-56 transition duration-500 group-hover:scale-110 ${
                    strong
                        ? 'opacity-[0.12] group-hover:opacity-[0.18]'
                        : 'opacity-[0.08] group-hover:opacity-[0.13]'
                }`}
                src="/asset/images/gigi.png"
            />
            <div className="relative z-10">
                <p
                    className={`text-[11px] font-black tracking-[0.28em] uppercase ${strong ? 'text-white/75' : 'text-[#9ea6b6]'}`}
                >
                    {label}
                </p>
                <strong
                    className={`mt-3 block text-[40px] leading-none font-black ${strong ? 'text-white' : 'text-[#1c78ea]'}`}
                >
                    {value}
                </strong>
            </div>
        </article>
    );
}

DetectionIndex.layout = {
    breadcrumbs: [{ title: 'Deteksi Penyakit', href: radiographs.index() }],
};
