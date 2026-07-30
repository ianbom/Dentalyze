import { Head, router, useForm } from '@inertiajs/react';
import { Building2, Link2, Pencil, Save, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import ConfirmDeleteDialog from '@/components/confirm-delete-dialog';
import collaborations from '@/routes/faskes/collaborations/index';
import faskesRoutes from '@/routes/faskes/index';

type Faskes = {
    id: number;
    name: string;
    type: string;
    users_count: number;
    patients_count: number;
};

type Collaboration = {
    id: number;
    faskes_name: string;
    collaborator_name: string;
};

type DeleteTarget = {
    id: number;
    kind: 'faskes' | 'collaboration';
    name: string;
};

export default function FaskesIndex({
    collaborations: rows,
    faskes,
}: {
    collaborations: Collaboration[];
    faskes: Faskes[];
}) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const facilityForm = useForm({ name: '', type: '' });
    const collaborationForm = useForm({
        collaborator_faskes_id: '',
        faskes_id: '',
    });

    function submitFacility(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const options = {
            onSuccess: () => {
                facilityForm.reset();
                setEditingId(null);
            },
            preserveScroll: true,
        };

        if (editingId) {
            facilityForm.put(faskesRoutes.update.url(editingId), options);

            return;
        }

        facilityForm.post(faskesRoutes.store.url(), options);
    }

    function editFacility(item: Faskes) {
        facilityForm.clearErrors();
        facilityForm.setData({ name: item.name, type: item.type });
        setEditingId(item.id);
    }

    function cancelEdit() {
        facilityForm.clearErrors();
        facilityForm.reset();
        setEditingId(null);
    }

    function submitCollaboration(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        collaborationForm.post(collaborations.store.url(), {
            onSuccess: () => collaborationForm.reset(),
            preserveScroll: true,
        });
    }

    function destroyTarget() {
        if (!deleteTarget) {
            return;
        }

        setDeleteProcessing(true);
        const url =
            deleteTarget.kind === 'faskes'
                ? faskesRoutes.destroy.url(deleteTarget.id)
                : collaborations.destroy.url(deleteTarget.id);

        router.delete(url, {
            onFinish: () => setDeleteProcessing(false),
            onSuccess: () => setDeleteTarget(null),
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title="Faskes" />
            <div className="space-y-6">
                <section className="grid gap-6 lg:grid-cols-2">
                    <form
                        className="space-y-4 rounded-[30px] border border-white/70 bg-white/40 p-6 shadow-[0_24px_55px_rgba(19,184,255,0.1)] backdrop-blur-md"
                        onSubmit={submitFacility}
                    >
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-xl font-black text-[#0878e8]">
                                {editingId ? 'Edit Faskes' : 'Tambah Faskes'}
                            </h2>
                            {editingId && (
                                <button
                                    className="grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-500"
                                    onClick={cancelEdit}
                                    type="button"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <FieldError error={facilityForm.errors.name}>
                            <input
                                className="h-12 w-full rounded-[14px] border border-white/70 bg-white/60 px-4 text-[#22304F] outline-none placeholder:text-[#9BA8BC] focus:border-[#13b8ff]"
                                onChange={(event) =>
                                    facilityForm.setData(
                                        'name',
                                        event.target.value,
                                    )
                                }
                                placeholder="Nama faskes"
                                value={facilityForm.data.name}
                            />
                        </FieldError>
                        <FieldError error={facilityForm.errors.type}>
                            <input
                                className="h-12 w-full rounded-[14px] border border-white/70 bg-white/60 px-4 text-[#22304F] outline-none placeholder:text-[#9BA8BC] focus:border-[#13b8ff]"
                                onChange={(event) =>
                                    facilityForm.setData(
                                        'type',
                                        event.target.value,
                                    )
                                }
                                placeholder="Tipe faskes"
                                value={facilityForm.data.type}
                            />
                        </FieldError>
                        <button
                            className="inline-flex h-11 items-center gap-2 rounded-[14px] bg-[#0878e8] px-5 text-sm font-black text-white disabled:opacity-60"
                            disabled={facilityForm.processing}
                        >
                            <Save size={16} />
                            {facilityForm.processing
                                ? 'Menyimpan…'
                                : editingId
                                  ? 'Simpan Perubahan'
                                  : 'Simpan Faskes'}
                        </button>
                    </form>

                    <form
                        className="space-y-4 rounded-[30px] border border-white/70 bg-white/40 p-6 shadow-[0_24px_55px_rgba(19,184,255,0.1)] backdrop-blur-md"
                        onSubmit={submitCollaboration}
                    >
                        <h2 className="text-xl font-black text-[#0878e8]">
                            Tambah Kolaborasi
                        </h2>
                        {(
                            [
                                ['faskes_id', 'Pilih faskes pertama'],
                                [
                                    'collaborator_faskes_id',
                                    'Pilih faskes kedua',
                                ],
                            ] as const
                        ).map(([field, placeholder]) => (
                            <FieldError
                                error={collaborationForm.errors[field]}
                                key={field}
                            >
                                <select
                                    className="h-12 w-full rounded-[14px] border border-white/70 bg-white/60 px-4 text-[#22304F] outline-none focus:border-[#13b8ff]"
                                    onChange={(event) =>
                                        collaborationForm.setData(
                                            field,
                                            event.target.value,
                                        )
                                    }
                                    value={collaborationForm.data[field]}
                                >
                                    <option value="">{placeholder}</option>
                                    {faskes.map((item) => (
                                        <option
                                            disabled={
                                                field ===
                                                    'collaborator_faskes_id' &&
                                                String(item.id) ===
                                                    collaborationForm.data
                                                        .faskes_id
                                            }
                                            key={item.id}
                                            value={item.id}
                                        >
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </FieldError>
                        ))}
                        <button
                            className="inline-flex h-11 items-center gap-2 rounded-[14px] bg-[#0878e8] px-5 text-sm font-black text-white disabled:opacity-60"
                            disabled={collaborationForm.processing}
                        >
                            <Link2 size={16} />
                            {collaborationForm.processing
                                ? 'Menghubungkan…'
                                : 'Hubungkan'}
                        </button>
                    </form>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {faskes.map((item) => (
                        <article
                            className="rounded-[24px] border border-white/70 bg-white/40 p-5 shadow-[0_18px_45px_rgba(19,184,255,0.08)] backdrop-blur-md"
                            key={item.id}
                        >
                            <Building2 className="text-[#0878e8]" />
                            <h3 className="mt-3 text-lg font-black text-[#22304F]">
                                {item.name}
                            </h3>
                            <p className="text-sm text-slate-500">
                                {item.type}
                            </p>
                            <p className="mt-3 text-xs text-slate-500">
                                {item.users_count} staff · {item.patients_count}{' '}
                                pasien
                            </p>
                            <div className="mt-4 flex gap-2">
                                <button
                                    className="grid size-9 place-items-center rounded-xl bg-sky-50 text-sky-600"
                                    onClick={() => editFacility(item)}
                                    type="button"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    className="grid size-9 place-items-center rounded-xl bg-rose-50 text-rose-500"
                                    onClick={() =>
                                        setDeleteTarget({
                                            id: item.id,
                                            kind: 'faskes',
                                            name: item.name,
                                        })
                                    }
                                    type="button"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </article>
                    ))}
                </section>

                <section className="rounded-[30px] border border-white/70 bg-white/40 p-6 shadow-[0_24px_55px_rgba(19,184,255,0.1)] backdrop-blur-md">
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-[#0878e8]">
                        <Link2 /> Kolaborasi Aktif
                    </h2>
                    <div className="space-y-2">
                        {rows.length === 0 && (
                            <p className="text-sm text-slate-500">
                                Belum ada kolaborasi antar-faskes.
                            </p>
                        )}
                        {rows.map((item) => (
                            <div
                                className="flex items-center justify-between gap-4 rounded-[14px] bg-white/60 p-4"
                                key={item.id}
                            >
                                <span className="font-semibold text-[#526184]">
                                    {item.faskes_name} ↔{' '}
                                    {item.collaborator_name}
                                </span>
                                <button
                                    className="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-500"
                                    onClick={() =>
                                        setDeleteTarget({
                                            id: item.id,
                                            kind: 'collaboration',
                                            name: `${item.faskes_name} dan ${item.collaborator_name}`,
                                        })
                                    }
                                    type="button"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <ConfirmDeleteDialog
                description={
                    deleteTarget?.kind === 'faskes'
                        ? `Faskes ${deleteTarget.name} hanya dapat dihapus jika tidak memiliki data terkait.`
                        : `Akses berbagi data antara ${deleteTarget?.name ?? ''} akan dihentikan.`
                }
                onConfirm={destroyTarget}
                onOpenChange={(open) => {
                    if (!open && !deleteProcessing) {
                        setDeleteTarget(null);
                    }
                }}
                open={deleteTarget !== null}
                processing={deleteProcessing}
                title={
                    deleteTarget?.kind === 'faskes'
                        ? 'Hapus faskes?'
                        : 'Hapus kolaborasi?'
                }
            />
        </>
    );
}

function FieldError({
    children,
    error,
}: {
    children: React.ReactNode;
    error?: string;
}) {
    return (
        <label className="block space-y-2">
            {children}
            {error && (
                <span className="block text-xs font-semibold text-rose-500">
                    {error}
                </span>
            )}
        </label>
    );
}
