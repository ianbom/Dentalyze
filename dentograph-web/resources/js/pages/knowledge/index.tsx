import { Head, Link, router } from '@inertiajs/react';
import {
    BrainCircuit,
    CheckCircle2,
    FileText,
    Pencil,
    Plus,
    Search,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import ConfirmDeleteDialog from '@/components/confirm-delete-dialog';
import knowledgeRoutes from '@/routes/knowledge';

type Knowledge = {
    id: number;
    title: string;
    category: 'disease' | 'radiology_guide' | 'faq' | 'general';
    condition_name: string | null;
    status: 'draft' | 'active' | 'inactive';
    embedding_model: string | null;
    has_embedding: boolean;
    updated_at: string | null;
};

type KnowledgeIndexProps = {
    knowledge: Knowledge[];
};

const categoryLabels: Record<Knowledge['category'], string> = {
    disease: 'Disease',
    radiology_guide: 'Radiology Guide',
    faq: 'FAQ',
    general: 'General',
};

const statusClass: Record<Knowledge['status'], string> = {
    active: 'border-emerald-100 bg-emerald-50 text-emerald-600',
    draft: 'border-amber-100 bg-amber-50 text-amber-600',
    inactive: 'border-neutral-200 bg-neutral-50 text-neutral-500',
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

export default function KnowledgeIndex({ knowledge }: KnowledgeIndexProps) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [status, setStatus] = useState('all');
    const [deletingKnowledge, setDeletingKnowledge] = useState<Knowledge | null>(null);

    const visibleKnowledge = useMemo(() => {
        const query = search.trim().toLowerCase();

        return knowledge.filter((item) => {
            const matchesSearch =
                !query ||
                [
                    item.title,
                    item.category,
                    item.condition_name,
                    item.status,
                    item.embedding_model,
                ]
                    .filter(Boolean)
                    .some((value) => value?.toLowerCase().includes(query));
            const matchesCategory =
                category === 'all' || item.category === category;
            const matchesStatus = status === 'all' || item.status === status;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [category, knowledge, search, status]);

    function deleteKnowledge(item: Knowledge) {
        router.delete(knowledgeRoutes.destroy.url(item.id), {
            preserveScroll: true,
            onFinish: () => setDeletingKnowledge(null),
        });
    }

    return (
        <>
            <Head title="AI Knowledge Base" />

            <div className="space-y-6">
                <section className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/40 p-6 shadow-[0_24px_55px_rgba(19,184,255,0.1)] backdrop-blur-md">
                    <img
                        alt=""
                        className="pointer-events-none absolute -right-24 -bottom-28 w-72 opacity-[0.07]"
                        src="/asset/images/gigi.png"
                    />
                    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-[11px] font-black tracking-[0.42em] text-[#49ddd7] uppercase">
                                Dentalyze AI
                            </p>
                            <h1 className="mt-2 text-[34px] leading-none font-black text-[#0878e8] uppercase">
                                AI Knowledge Base
                            </h1>
                            <p className="mt-4 max-w-2xl text-[15px] leading-[1.8] text-[#808999] italic">
                                Kelola referensi internal untuk jawaban chatbot
                                pasien.
                            </p>
                        </div>

                        <Link
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] px-5 text-xs font-black tracking-wider text-white uppercase shadow-[0_12px_28px_rgba(8,120,232,0.22)] transition-all hover:scale-[1.02] active:scale-95"
                            href={knowledgeRoutes.create()}
                        >
                            <Plus size={16} />
                            Create Knowledge
                        </Link>
                    </div>
                </section>

                <section className="overflow-hidden rounded-[30px] border border-white/70 bg-white/35 shadow-[0_24px_55px_rgba(19,184,255,0.1)] backdrop-blur-md">
                    <div className="flex flex-col gap-3 border-b border-white/60 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <label className="flex h-12 min-w-0 items-center gap-2 rounded-[14px] border border-white/70 bg-white/45 px-4 text-[#7B8BA7] shadow-sm backdrop-blur-md lg:w-80">
                            <Search size={16} />
                            <input
                                aria-label="Cari knowledge"
                                className="min-w-0 flex-1 bg-transparent text-sm text-[#22304F] outline-none placeholder:text-[#9BA8BC]"
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Cari knowledge"
                                type="search"
                                value={search}
                            />
                        </label>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <select
                                className="h-12 rounded-[14px] border border-white/70 bg-white/45 px-4 text-sm font-semibold text-[#526184] backdrop-blur-md outline-none"
                                onChange={(event) =>
                                    setCategory(event.target.value)
                                }
                                value={category}
                            >
                                <option value="all">Semua kategori</option>
                                {Object.entries(categoryLabels).map(
                                    ([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ),
                                )}
                            </select>
                            <select
                                className="h-12 rounded-[14px] border border-white/70 bg-white/45 px-4 text-sm font-semibold text-[#526184] backdrop-blur-md outline-none"
                                onChange={(event) =>
                                    setStatus(event.target.value)
                                }
                                value={status}
                            >
                                <option value="all">Semua status</option>
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {visibleKnowledge.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[980px] border-collapse text-left">
                                <thead>
                                    <tr className="bg-white/30 text-[11px] font-black tracking-[0.22em] text-[#9ea6b6] uppercase">
                                        <th className="px-5 py-4">Title</th>
                                        <th className="px-5 py-4">Category</th>
                                        <th className="px-5 py-4">Condition</th>
                                        <th className="px-5 py-4">Status</th>
                                        <th className="px-5 py-4">Embedding</th>
                                        <th className="px-5 py-4">Updated</th>
                                        <th className="px-5 py-4 text-right">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/60">
                                    {visibleKnowledge.map((item) => (
                                        <tr
                                            className="text-sm text-[#526184] transition hover:bg-white/45"
                                            key={item.id}
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="grid size-10 place-items-center rounded-[14px] bg-sky-50 text-[#1599F5]">
                                                        <BrainCircuit
                                                            size={18}
                                                        />
                                                    </span>
                                                    <span className="font-semibold text-[#22304F]">
                                                        {item.title}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                {categoryLabels[item.category]}
                                            </td>
                                            <td className="px-5 py-4">
                                                {item.condition_name ?? '-'}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-[10px] border px-3 py-1 text-xs font-black uppercase ${statusClass[item.status]}`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center gap-2">
                                                    {item.has_embedding ? (
                                                        <CheckCircle2
                                                            className="text-emerald-500"
                                                            size={16}
                                                        />
                                                    ) : (
                                                        <XCircle
                                                            className="text-rose-500"
                                                            size={16}
                                                        />
                                                    )}
                                                    {item.embedding_model ??
                                                        'Belum generated'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                {formatDate(item.updated_at)}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        className="grid size-9 place-items-center rounded-[13px] border border-cyan-100/80 bg-cyan-50/75 text-cyan-600 shadow-sm transition hover:bg-cyan-100"
                                                        href={knowledgeRoutes.edit(
                                                            item.id,
                                                        )}
                                                        title="Edit knowledge"
                                                    >
                                                        <Pencil size={16} />
                                                    </Link>
                                                    <button
                                                        className="grid size-9 place-items-center rounded-[13px] border border-rose-100/80 bg-rose-50/75 text-rose-500 shadow-sm transition hover:bg-rose-100"
                                                        onClick={() =>
                                                    setDeletingKnowledge(item)
                                                        }
                                                        title="Hapus knowledge"
                                                        type="button"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid min-h-72 place-items-center p-8 text-center">
                            <div className="max-w-sm rounded-[28px] border border-white/70 bg-white/40 p-8 shadow-[0_18px_45px_rgba(19,184,255,0.08)] backdrop-blur-md">
                                <span className="mx-auto grid size-14 place-items-center rounded-[18px] bg-sky-50 text-[#1599F5]">
                                    <FileText size={24} />
                                </span>
                                <h3 className="mt-5 text-[20px] font-black text-[#0878e8] uppercase">
                                    Knowledge tidak ditemukan
                                </h3>
                                <p className="mt-3 text-[15px] leading-[1.8] text-[#808999] italic">
                                    Tambahkan referensi internal atau ubah
                                    filter pencarian.
                                </p>
                            </div>
                        </div>
                    )}
                </section>
                <ConfirmDeleteDialog description={`Knowledge “${deletingKnowledge?.title ?? ''}” akan dihapus permanen.`} onConfirm={() => deletingKnowledge && deleteKnowledge(deletingKnowledge)} onOpenChange={(open) => !open && setDeletingKnowledge(null)} open={deletingKnowledge !== null} title="Hapus knowledge?" />
            </div>
        </>
    );
}

KnowledgeIndex.layout = {
    breadcrumbs: [
        {
            title: 'Knowledge',
            href: knowledgeRoutes.index(),
        },
    ],
};
