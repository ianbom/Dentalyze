import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    Mail,
    Pencil,
    Phone,
    Plus,
    Save,
    Search,
    Trash2,
    UserRound,
    X,
} from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useMemo, useRef, useState } from 'react';
import ListPagination, {
    getPageItems,
    getTotalPages,
} from '@/components/list-pagination';
import PasswordInput from '@/components/password-input';

export type StaffUser = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: 'dokter' | 'radiografer';
    created_at: string | null;
};

type StaffDirectoryProps = {
    copy: {
        add: string;
        empty: string;
        eyebrow: string;
        intro: string;
        plural: string;
        roleLabel: string;
        title: string;
    };
    endpoints: {
        destroy: (id: number) => string;
        store: string;
        update: (id: number) => string;
    };
    filters: {
        total: number;
        with_phone: number;
        without_phone: number;
    };
    permissions: {
        create: boolean;
        update: boolean;
        delete: boolean;
    };
    users: StaffUser[];
};

type StaffFormData = {
    name: string;
    email: string;
    phone: string;
    password: string;
};

const inputClass =
    'h-12 w-full rounded-[14px] border border-white/70 bg-white/45 px-4 text-sm text-[#22304F] shadow-sm outline-none backdrop-blur-md transition placeholder:text-[#9BA8BC] focus:border-[#13b8ff] focus:bg-white/65 focus:shadow-[0_12px_28px_rgba(8,120,232,0.12)]';

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

export default function StaffDirectory({
    copy,
    endpoints,
    filters,
    permissions,
    users,
}: StaffDirectoryProps) {
    const [search, setSearch] = useState('');
    const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
    const [deletingUser, setDeletingUser] = useState<StaffUser | null>(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const formRef = useRef<HTMLFormElement>(null);

    const { data, setData, post, processing, errors, reset, transform } =
        useForm<StaffFormData>({
            name: '',
            email: '',
            phone: '',
            password: '',
        });

    const visibleUsers = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return users;
        }

        return users.filter((user) =>
            [user.name, user.email, user.phone, copy.roleLabel]
                .filter(Boolean)
                .some((value) => value?.toLowerCase().includes(query)),
        );
    }, [copy.roleLabel, search, users]);

    const totalPages = getTotalPages(visibleUsers.length, pageSize);
    const currentPage = Math.min(page, totalPages);
    const paginatedUsers = useMemo(
        () => getPageItems(visibleUsers, currentPage, pageSize),
        [currentPage, pageSize, visibleUsers],
    );

    function openCreate() {
        setEditingUser(null);
        reset();
        formRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
        window.setTimeout(
            () =>
                formRef.current
                    ?.querySelector<HTMLInputElement>('input')
                    ?.focus(),
            350,
        );
    }

    function openEdit(user: StaffUser) {
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            phone: user.phone ?? '',
            password: '',
        });
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (editingUser) {
            transform((formData) => ({
                ...formData,
                _method: 'PUT',
            }));
            post(endpoints.update(editingUser.id), {
                onSuccess: () => {
                    setEditingUser(null);
                    reset();
                },
            });

            return;
        }

        transform((formData) => formData);
        post(endpoints.store, {
            onSuccess: () => reset(),
        });
    }

    function destroyUser() {
        if (!deletingUser) {
            return;
        }

        setDeleteProcessing(true);

        router.delete(endpoints.destroy(deletingUser.id), {
            onFinish: () => setDeleteProcessing(false),
            onSuccess: () => setDeletingUser(null),
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title={copy.title} />

            <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-3">
                    <Stat
                        label={`Total ${copy.plural}`}
                        value={filters.total}
                    />
                    <Stat
                        label="Kontak lengkap"
                        value={filters.with_phone}
                        strong
                    />
                    <Stat label="Tanpa telepon" value={filters.without_phone} />
                </section>

                <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
                    <form
                        ref={formRef}
                        className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/35 p-6 shadow-[0_24px_55px_rgba(19,184,255,0.1)] backdrop-blur-md"
                        onSubmit={submit}
                    >
                        <p className="text-[11px] font-black tracking-[0.42em] text-[#49ddd7] uppercase">
                            {editingUser ? 'EDIT DATA' : copy.eyebrow}
                        </p>
                        <h2 className="mt-2 text-[30px] leading-none font-black text-[#0878e8] uppercase">
                            {editingUser ? editingUser.name : copy.add}
                        </h2>
                        <p className="mt-4 text-[15px] leading-[1.8] text-[#808999] italic">
                            {copy.intro}
                        </p>

                        <div className="mt-7 space-y-4">
                            <Field error={errors.name} label="Nama">
                                <input
                                    className={inputClass}
                                    onChange={(event) =>
                                        setData('name', event.target.value)
                                    }
                                    placeholder={`Nama ${copy.roleLabel}`}
                                    value={data.name}
                                />
                            </Field>

                            <Field error={errors.email} label="Email">
                                <input
                                    className={inputClass}
                                    onChange={(event) =>
                                        setData('email', event.target.value)
                                    }
                                    placeholder="email@contoh.com"
                                    type="email"
                                    value={data.email}
                                />
                            </Field>

                            <Field error={errors.phone} label="Telepon">
                                <input
                                    className={inputClass}
                                    inputMode="numeric"
                                    maxLength={12}
                                    onChange={(event) =>
                                        setData(
                                            'phone',
                                            event.target.value
                                                .replace(/\D/g, '')
                                                .slice(0, 12),
                                        )
                                    }
                                    placeholder="11–12 digit nomor telepon"
                                    value={data.phone}
                                />
                            </Field>

                            <Field error={errors.password} label="Password">
                                <PasswordInput
                                    className={inputClass}
                                    onChange={(event) =>
                                        setData('password', event.target.value)
                                    }
                                    placeholder={
                                        editingUser
                                            ? 'Kosongkan jika tidak diubah'
                                            : 'Minimal 8 karakter'
                                    }
                                    value={data.password}
                                />
                            </Field>
                        </div>

                        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                className="inline-flex h-12 items-center justify-center rounded-[14px] border border-white/70 bg-white/45 px-5 text-xs font-black tracking-wider text-[#7B8BA7] uppercase shadow-sm backdrop-blur-md transition hover:bg-white/65"
                                onClick={openCreate}
                                type="button"
                            >
                                Reset
                            </button>
                            <button
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] px-6 text-xs font-black tracking-wider text-white uppercase shadow-[0_12px_28px_rgba(8,120,232,0.22)] transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
                                disabled={processing}
                                type="submit"
                            >
                                <Save size={16} />
                                {processing ? 'Menyimpan' : 'Simpan'}
                            </button>
                        </div>
                    </form>

                    <section className="overflow-hidden rounded-[30px] border border-white/70 bg-white/35 shadow-[0_24px_55px_rgba(19,184,255,0.1)] backdrop-blur-md">
                        <div className="flex flex-col gap-4 border-b border-white/60 p-5 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-[11px] font-black tracking-[0.42em] text-[#49ddd7] uppercase">
                                    DIREKTORI
                                </p>
                                <p className="mt-3 text-[15px] leading-[1.8] text-[#808999] italic">
                                    Kelola akun {copy.plural.toLowerCase()} dari
                                    satu tempat.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <label className="flex h-12 min-w-0 items-center gap-2 rounded-[14px] border border-white/70 bg-white/45 px-4 text-[#7B8BA7] shadow-sm backdrop-blur-md sm:w-72">
                                    <Search size={16} />
                                    <input
                                        aria-label={`Cari ${copy.plural}`}
                                        className="min-w-0 flex-1 bg-transparent text-sm text-[#22304F] outline-none placeholder:text-[#9BA8BC]"
                                        onChange={(event) => {
                                            setSearch(event.target.value);
                                            setPage(1);
                                        }}
                                        placeholder={`Cari ${copy.roleLabel}`}
                                        type="search"
                                        value={search}
                                    />
                                </label>

                                {permissions.create && (
                                    <button
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] px-5 text-xs font-black tracking-wider text-white uppercase shadow-[0_12px_28px_rgba(8,120,232,0.22)] transition-all hover:scale-[1.02] active:scale-95"
                                        onClick={openCreate}
                                        type="button"
                                    >
                                        <Plus size={16} />
                                        {copy.add}
                                    </button>
                                )}
                            </div>
                        </div>

                        {visibleUsers.length ? (
                            <div className="divide-y divide-white/60">
                                {paginatedUsers.map((user) => (
                                    <article
                                        className="flex flex-col gap-4 p-5 text-sm text-[#526184] transition hover:bg-white/45 lg:flex-row lg:items-center lg:justify-between"
                                        key={user.id}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="grid size-11 shrink-0 place-items-center rounded-[15px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] text-sm font-black text-white shadow-[0_10px_24px_rgba(8,120,232,0.18)]">
                                                {user.name
                                                    .slice(0, 1)
                                                    .toUpperCase()}
                                            </span>
                                            <div>
                                                <p className="font-semibold text-[#22304F]">
                                                    {user.name}
                                                </p>
                                                <p className="mt-1 text-xs text-[#7B8BA7]">
                                                    Terdaftar{' '}
                                                    {formatDate(
                                                        user.created_at,
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid gap-2 text-xs sm:grid-cols-2 lg:w-[360px]">
                                            <p className="flex items-center gap-2">
                                                <Mail size={13} />
                                                {user.email}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <Phone size={13} />
                                                {user.phone ?? '-'}
                                            </p>
                                        </div>

                                        <div className="flex gap-2 lg:justify-end">
                                            {permissions.update && (
                                                <button
                                                    aria-label={`Edit ${user.name}`}
                                                    className="grid size-9 place-items-center rounded-[13px] border border-cyan-100/80 bg-cyan-50/75 text-cyan-600 shadow-[0_12px_28px_rgba(6,182,212,0.12)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-100/80 hover:shadow-[0_16px_34px_rgba(6,182,212,0.18)]"
                                                    onClick={() =>
                                                        openEdit(user)
                                                    }
                                                    type="button"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                            )}
                                            {permissions.delete && (
                                                <button
                                                    aria-label={`Hapus ${user.name}`}
                                                    className="grid size-9 place-items-center rounded-[13px] border border-rose-100/80 bg-rose-50/75 text-rose-500 shadow-[0_12px_28px_rgba(244,63,94,0.12)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-100/80 hover:shadow-[0_16px_34px_rgba(244,63,94,0.18)]"
                                                    onClick={() =>
                                                        setDeletingUser(user)
                                                    }
                                                    type="button"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="grid min-h-80 place-items-center p-8 text-center">
                                <div className="max-w-sm rounded-[28px] border border-white/70 bg-white/40 p-8 shadow-[0_18px_45px_rgba(19,184,255,0.08)] backdrop-blur-md">
                                    <span className="mx-auto grid size-14 place-items-center rounded-[18px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] text-white shadow-[0_12px_28px_rgba(8,120,232,0.22)]">
                                        <UserRound size={24} />
                                    </span>
                                    <h3 className="mt-5 text-[20px] font-black text-[#0878e8] uppercase">
                                        {copy.empty}
                                    </h3>
                                </div>
                            </div>
                        )}

                        {visibleUsers.length > 0 && (
                            <ListPagination
                                page={currentPage}
                                pageSize={pageSize}
                                setPage={setPage}
                                setPageSize={setPageSize}
                                total={visibleUsers.length}
                            />
                        )}
                    </section>
                </section>

                {deletingUser && (
                    <div className="fixed inset-0 z-50 grid place-items-center bg-[#0b1f3f]/20 p-4 backdrop-blur-sm">
                        <section className="w-full max-w-md overflow-hidden rounded-[30px] border border-white/70 bg-white/75 p-6 shadow-[0_24px_55px_rgba(8,120,232,0.22)] backdrop-blur-xl">
                            <div className="flex items-start justify-between gap-4">
                                <span className="grid size-14 place-items-center rounded-[18px] bg-rose-50 text-rose-500 shadow-sm">
                                    <AlertTriangle size={24} />
                                </span>
                                <button
                                    aria-label="Tutup konfirmasi"
                                    className="grid size-9 place-items-center rounded-[12px] border border-white/70 bg-white/50 text-[#7B8BA7] transition hover:bg-white"
                                    onClick={() => setDeletingUser(null)}
                                    type="button"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <h2 className="mt-5 text-[24px] font-black text-[#0878e8]">
                                Hapus {copy.roleLabel}?
                            </h2>
                            <p className="mt-3 text-sm leading-7 text-[#808999]">
                                Akun{' '}
                                <span className="font-black text-[#22304F]">
                                    {deletingUser.name}
                                </span>{' '}
                                akan dihapus dari direktori.
                            </p>

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <button
                                    className="inline-flex h-12 items-center justify-center rounded-[14px] border border-white/70 bg-white/50 px-5 text-xs font-black tracking-wider text-[#7B8BA7] uppercase shadow-sm transition hover:bg-white"
                                    onClick={() => setDeletingUser(null)}
                                    type="button"
                                >
                                    Batal
                                </button>
                                <button
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-rose-500 px-5 text-xs font-black tracking-wider text-white uppercase shadow-[0_12px_28px_rgba(244,63,94,0.22)] transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
                                    disabled={deleteProcessing}
                                    onClick={destroyUser}
                                    type="button"
                                >
                                    <Trash2 size={16} />
                                    {deleteProcessing ? 'Menghapus' : 'Hapus'}
                                </button>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </>
    );
}

function Field({
    children,
    error,
    label,
}: {
    children: ReactNode;
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
                    className={`text-[11px] font-black tracking-[0.28em] uppercase ${
                        strong ? 'text-white/75' : 'text-[#9ea6b6]'
                    }`}
                >
                    {label}
                </p>
                <strong
                    className={`mt-3 block text-[40px] leading-none font-black ${
                        strong ? 'text-white' : 'text-[#1c78ea]'
                    }`}
                >
                    {value}
                </strong>
            </div>
        </article>
    );
}
