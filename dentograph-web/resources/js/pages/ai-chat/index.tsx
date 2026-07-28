import { Head } from '@inertiajs/react';
import { Bot, SendHorizontal, Sparkles, UserRound } from 'lucide-react';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';

type Message = {
    id?: number;
    role: 'user' | 'assistant';
    content: string;
    provider?: string | null;
};

type Props = {
    session: {
        id: number;
        title: string;
    };
    messages: Message[];
    role_context: {
        role: string;
        summary: string;
    };
};

export default function AiChatIndex({
    messages: initialMessages,
    role_context: roleContext,
    session,
}: Props) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const isPatient = roleContext.role === 'pasien';
    const csrf = useMemo(
        () =>
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content') ?? '',
        [],
    );

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!message.trim() || loading) {
            return;
        }

        const userMessage: Message = {
            role: 'user',
            content: message.trim(),
        };

        setMessages((current) => [...current, userMessage]);
        setMessage('');
        setLoading(true);

        try {
            const response = await fetch('/ai-chat/message', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    session_id: session.id,
                    message: userMessage.content,
                }),
            });
            const payload = await response.json();

            if (!response.ok) {
                throw new Error(payload.message ?? 'AI gagal memberi jawaban.');
            }

            setMessages((current) => [...current, payload.message]);
        } catch (error) {
            setMessages((current) => [
                ...current,
                {
                    role: 'assistant',
                    provider: 'error',
                    content:
                        error instanceof Error
                            ? error.message
                            : 'AI gagal memberi jawaban.',
                },
            ]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Head title="AI Chat" />
            <div
                className={
                    isPatient
                        ? 'w-full px-12 pb-10 lg:px-20'
                        : 'min-h-[calc(100vh-70px)] w-full'
                }
            >
                <section className="flex min-h-[720px] flex-col overflow-hidden rounded-[34px] border border-white/70 bg-white/40 shadow-[0_24px_65px_rgba(19,184,255,0.12)] backdrop-blur-md">
                    <header className="relative overflow-hidden border-b border-white/70 bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] p-7 text-white">
                        <img
                            alt=""
                            className="pointer-events-none absolute -right-14 -bottom-24 w-72 opacity-15"
                            src="/asset/images/gigi.png"
                        />
                        <div className="relative z-10">
                            <p className="text-[11px] font-black tracking-[0.34em] text-white/70 uppercase">
                                Dentalyze AI Assistant
                            </p>
                            <h1 className="mt-3 text-[34px] leading-tight font-black tracking-[-0.04em]">
                                Chatbot Klinis Berbasis Role
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
                                Jawaban dibatasi oleh data yang boleh diakses
                                role Anda, lalu bisa diperkaya jurnal dari
                                knowledge base.
                            </p>
                        </div>
                    </header>

                    <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
                        {messages.length === 0 && (
                            <div className="rounded-[24px] border border-dashed border-[#BDEBFF] bg-white/50 p-6 text-[#62708f]">
                                <Sparkles
                                    className="text-[#13b8ff]"
                                    size={28}
                                />
                                <p className="mt-4 font-black text-[#132f67]">
                                    Mulai dengan pertanyaan klinis.
                                </p>
                                <p className="mt-2 text-sm leading-6">
                                    Contoh: "Apakah kondisi pasien ini membaik?"
                                    atau "Ringkas antrean verifikasi hari ini."
                                </p>
                            </div>
                        )}

                        {messages.map((item, index) => (
                            <article
                                className={`flex gap-3 ${
                                    item.role === 'user'
                                        ? 'justify-end'
                                        : 'justify-start'
                                }`}
                                key={`${item.role}-${item.id ?? index}`}
                            >
                                {item.role === 'assistant' && (
                                    <span className="grid size-10 shrink-0 place-items-center rounded-[16px] bg-[#E4FAFF] text-[#0878e8]">
                                        <Bot size={18} />
                                    </span>
                                )}

                                <div
                                    className={`max-w-[76%] rounded-[22px] px-5 py-4 text-sm leading-7 shadow-[0_14px_32px_rgba(19,184,255,0.08)] ${
                                        item.role === 'user'
                                            ? 'bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] text-white'
                                            : 'border border-white/70 bg-white/70 text-[#526184]'
                                    }`}
                                >
                                    <p className="whitespace-pre-wrap">
                                        {item.content}
                                    </p>
                                    {item.provider && (
                                        <p className="mt-2 text-[10px] font-black tracking-[0.2em] uppercase opacity-60">
                                            {item.provider}
                                        </p>
                                    )}
                                </div>

                                {item.role === 'user' && (
                                    <span className="grid size-10 shrink-0 place-items-center rounded-[16px] bg-white/70 text-[#0878e8]">
                                        <UserRound size={18} />
                                    </span>
                                )}
                            </article>
                        ))}

                        {loading && (
                            <div className="flex items-center gap-3 text-sm font-semibold text-[#0878e8]">
                                <span className="size-3 animate-ping rounded-full bg-[#13b8ff]" />
                                AI sedang membaca konteks database...
                            </div>
                        )}
                    </div>

                    <form
                        className="border-t border-white/70 bg-white/45 p-5"
                        onSubmit={submit}
                    >
                        <div className="flex gap-3">
                            <input
                                className="h-14 flex-1 rounded-[18px] border border-white/70 bg-white/70 px-5 text-sm text-[#22304F] shadow-[0_12px_28px_rgba(19,184,255,0.08)] outline-none placeholder:text-[#9ea6b6] focus:border-[#13b8ff]"
                                onChange={(event) =>
                                    setMessage(event.target.value)
                                }
                                placeholder="Tanya data pasien, radiograf, tren kesehatan, atau jurnal..."
                                value={message}
                            />
                            <button
                                className="grid h-14 w-14 place-items-center rounded-[18px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] text-white shadow-[0_14px_32px_rgba(8,120,232,0.22)] disabled:opacity-50"
                                disabled={loading}
                                type="submit"
                            >
                                <SendHorizontal size={20} />
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </>
    );
}
