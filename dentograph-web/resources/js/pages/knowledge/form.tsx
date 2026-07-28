import { Head, Link, useForm } from '@inertiajs/react';
import { BrainCircuit, CheckCircle2, Save, XCircle } from 'lucide-react';
import type { FormEvent } from 'react';
import knowledgeRoutes from '@/routes/knowledge';

type KnowledgeFormRecord = {
    id: number;
    title: string;
    category: 'disease' | 'radiology_guide' | 'faq' | 'general';
    condition_name: string | null;
    content: string;
    status: 'draft' | 'active' | 'inactive';
    embedding_model: string | null;
    has_embedding: boolean;
};

type KnowledgeFormProps = {
    mode: 'create' | 'edit';
    knowledge: KnowledgeFormRecord | null;
};

type KnowledgeFormData = {
    title: string;
    category: 'disease' | 'radiology_guide' | 'faq' | 'general';
    condition_name: string;
    content: string;
    status: 'draft' | 'active' | 'inactive';
};

const inputClass =
    'h-12 w-full rounded-[14px] border border-white/70 bg-white/45 px-4 text-sm text-[#22304F] shadow-sm outline-none backdrop-blur-md transition placeholder:text-[#9BA8BC] focus:border-[#13b8ff] focus:bg-white/65 focus:shadow-[0_12px_28px_rgba(8,120,232,0.12)]';

const labelClass =
    'text-[11px] font-black uppercase tracking-[0.24em] text-[#9ea6b6]';

export default function KnowledgeForm({ mode, knowledge }: KnowledgeFormProps) {
    const isEdit = mode === 'edit';
    const { data, setData, post, processing, errors, transform } =
        useForm<KnowledgeFormData>({
            title: knowledge?.title ?? '',
            category: knowledge?.category ?? 'disease',
            condition_name: knowledge?.condition_name ?? '',
            content: knowledge?.content ?? '',
            status: knowledge?.status ?? 'draft',
        });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isEdit && knowledge) {
            transform((formData) => ({
                ...formData,
                _method: 'PUT',
            }));
            post(knowledgeRoutes.update.url(knowledge.id));

            return;
        }

        transform((formData) => formData);
        post(knowledgeRoutes.store.url());
    }

    return (
        <>
            <Head title={isEdit ? 'Edit Knowledge' : 'Create Knowledge'} />

            <form className="space-y-6" onSubmit={submit}>
                <section className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/35 p-6 shadow-[0_24px_55px_rgba(19,184,255,0.1)] backdrop-blur-md">
                    <img
                        alt=""
                        className="pointer-events-none absolute -right-28 -bottom-32 w-80 opacity-[0.06]"
                        src="/asset/images/gigi.png"
                    />
                    <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                        <div>
                            <p className="text-[11px] font-black tracking-[0.42em] text-[#49ddd7] uppercase">
                                {isEdit ? 'EDIT KNOWLEDGE' : 'CREATE KNOWLEDGE'}
                            </p>
                            <h1 className="mt-2 text-[32px] leading-none font-black text-[#0878e8] uppercase">
                                {isEdit
                                    ? 'Perbarui Referensi'
                                    : 'Referensi Baru'}
                            </h1>
                            <p className="mt-4 max-w-2xl text-[15px] leading-[1.8] text-[#808999] italic">
                                Isi knowledge dengan bahasa yang mudah dipahami
                                pasien.
                            </p>
                        </div>

                        <div className="rounded-[24px] bg-[linear-gradient(135deg,#20b9ff_0%,#0878e8_100%)] p-5 text-white shadow-[0_24px_55px_rgba(8,120,232,0.22)]">
                            <div className="flex items-center gap-3">
                                <BrainCircuit size={20} />
                                <p className="text-[11px] font-black tracking-[0.28em] text-white/75 uppercase">
                                    Embedding
                                </p>
                            </div>
                            <p className="mt-3 flex items-center gap-2 text-sm leading-7 text-white/90">
                                {knowledge?.has_embedding ? (
                                    <CheckCircle2 size={16} />
                                ) : (
                                    <XCircle size={16} />
                                )}
                                {knowledge?.embedding_model ??
                                    'Belum generated'}
                            </p>
                        </div>
                    </div>

                    <div className="relative mt-8 grid gap-5 lg:grid-cols-2">
                        <label className="space-y-2">
                            <span className={labelClass}>Title</span>
                            <input
                                className={inputClass}
                                onChange={(event) =>
                                    setData('title', event.target.value)
                                }
                                placeholder="Penjelasan Impaksi Gigi"
                                value={data.title}
                            />
                            {errors.title && (
                                <span className="block text-xs font-semibold text-rose-500">
                                    {errors.title}
                                </span>
                            )}
                        </label>

                        <label className="space-y-2">
                            <span className={labelClass}>Category</span>
                            <select
                                className={inputClass}
                                onChange={(event) =>
                                    setData(
                                        'category',
                                        event.target
                                            .value as KnowledgeFormData['category'],
                                    )
                                }
                                value={data.category}
                            >
                                <option value="disease">Disease</option>
                                <option value="radiology_guide">
                                    Radiology Guide
                                </option>
                                <option value="faq">FAQ</option>
                                <option value="general">General</option>
                            </select>
                            {errors.category && (
                                <span className="block text-xs font-semibold text-rose-500">
                                    {errors.category}
                                </span>
                            )}
                        </label>

                        <label className="space-y-2">
                            <span className={labelClass}>Condition Name</span>
                            <input
                                className={inputClass}
                                onChange={(event) =>
                                    setData(
                                        'condition_name',
                                        event.target.value,
                                    )
                                }
                                placeholder="Impaksi, Karies, Normal"
                                value={data.condition_name}
                            />
                            {errors.condition_name && (
                                <span className="block text-xs font-semibold text-rose-500">
                                    {errors.condition_name}
                                </span>
                            )}
                        </label>

                        <label className="space-y-2">
                            <span className={labelClass}>Status</span>
                            <select
                                className={inputClass}
                                onChange={(event) =>
                                    setData(
                                        'status',
                                        event.target
                                            .value as KnowledgeFormData['status'],
                                    )
                                }
                                value={data.status}
                            >
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            {errors.status && (
                                <span className="block text-xs font-semibold text-rose-500">
                                    {errors.status}
                                </span>
                            )}
                        </label>

                        <label className="space-y-2 lg:col-span-2">
                            <span className={labelClass}>Content</span>
                            <textarea
                                className="min-h-72 w-full rounded-[14px] border border-white/70 bg-white/45 px-4 py-3 text-sm leading-7 text-[#22304F] shadow-sm backdrop-blur-md transition outline-none placeholder:text-[#9BA8BC] focus:border-[#13b8ff] focus:bg-white/65 focus:shadow-[0_12px_28px_rgba(8,120,232,0.12)]"
                                onChange={(event) =>
                                    setData('content', event.target.value)
                                }
                                placeholder="Tulis penjelasan edukatif untuk pasien..."
                                value={data.content}
                            />
                            {errors.content && (
                                <span className="block text-xs font-semibold text-rose-500">
                                    {errors.content}
                                </span>
                            )}
                        </label>
                    </div>

                    <div className="relative mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <Link
                            className="inline-flex h-12 items-center justify-center rounded-[14px] border border-white/70 bg-white/45 px-5 text-xs font-black tracking-wider text-[#7B8BA7] uppercase shadow-sm backdrop-blur-md transition hover:bg-white/65"
                            href={knowledgeRoutes.index()}
                        >
                            Batal
                        </Link>
                        <button
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] px-6 text-xs font-black tracking-wider text-white uppercase shadow-[0_12px_28px_rgba(8,120,232,0.22)] transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
                            disabled={processing}
                            type="submit"
                        >
                            <Save size={16} />
                            {processing ? 'Menyimpan' : 'Simpan Knowledge'}
                        </button>
                    </div>
                </section>
            </form>
        </>
    );
}

KnowledgeForm.layout = ({ mode, knowledge }: KnowledgeFormProps) => ({
    breadcrumbs: [
        {
            title: 'Knowledge',
            href: knowledgeRoutes.index(),
        },
        {
            title: mode === 'edit' ? 'Edit Knowledge' : 'Create Knowledge',
            href:
                mode === 'edit' && knowledge
                    ? knowledgeRoutes.edit(knowledge.id)
                    : knowledgeRoutes.create(),
        },
    ],
});
