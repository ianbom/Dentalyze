import { Link } from '@inertiajs/react';
import {
    Bot,
    ExternalLink,
    MessageCircle,
    SendHorizontal,
    Sparkles,
    X,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';

type Message = {
    role: 'user' | 'assistant';
    content: string;
    provider?: string | null;
};

export default function AiChatWidget() {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content:
                'Halo, saya Dentalyze AI. Tanya soal riwayat radiograf, hasil deteksi, tren kesehatan gigi, atau jurnal klinis.',
        },
    ]);
    const csrf = useMemo(
        () =>
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content') ?? '',
        [],
    );

    if (
        typeof window !== 'undefined' &&
        window.location.pathname === '/ai-chat'
    ) {
        return null;
    }

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
                    message: userMessage.content,
                }),
            });
            const payload = await response.json();

            if (!response.ok) {
                throw new Error(payload.message ?? 'Chatbot gagal menjawab.');
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
                            : 'Chatbot gagal menjawab.',
                },
            ]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed right-5 bottom-5 z-[1000]">
            {open && (
                <section className="mb-4 flex h-[560px] w-[min(390px,calc(100vw-32px))] flex-col overflow-hidden rounded-[30px] border border-white/80 bg-[#F4FBFF]/90 shadow-[0_28px_80px_rgba(8,120,232,0.22)] backdrop-blur-xl">
                    <header className="relative overflow-hidden bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] p-5 text-white">
                        <img
                            alt=""
                            className="pointer-events-none absolute -right-12 -bottom-20 w-44 opacity-15"
                            src="/asset/images/gigi.png"
                        />
                        <div className="relative z-10 flex items-start justify-between gap-4">
                            <div>
                                <p className="flex items-center gap-2 text-[10px] font-black tracking-[0.28em] text-white/70 uppercase">
                                    <Sparkles size={13} />
                                    Dentalyze AI
                                </p>
                                <h2 className="mt-2 text-xl font-black">
                                    Chatbot Klinis
                                </h2>
                                <p className="mt-1 text-xs text-white/78">
                                    Jawaban mengikuti akses role akun Anda.
                                </p>
                            </div>
                            <button
                                className="grid size-9 place-items-center rounded-full bg-white/16 text-white transition hover:bg-white/25"
                                onClick={() => setOpen(false)}
                                type="button"
                            >
                                <X size={17} />
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 space-y-3 overflow-y-auto p-4">
                        {messages.map((item, index) => (
                            <article
                                className={`flex ${
                                    item.role === 'user'
                                        ? 'justify-end'
                                        : 'justify-start'
                                }`}
                                key={`${item.role}-${index}`}
                            >
                                <div
                                    className={`max-w-[84%] rounded-[18px] px-4 py-3 text-xs leading-6 shadow-[0_10px_24px_rgba(19,184,255,0.08)] ${
                                        item.role === 'user'
                                            ? 'bg-[#0878e8] text-white'
                                            : 'border border-white/70 bg-white/80 text-[#526184]'
                                    }`}
                                >
                                    <p className="whitespace-pre-wrap">
                                        {item.content}
                                    </p>
                                    {item.provider && (
                                        <p className="mt-2 text-[9px] font-black tracking-[0.18em] uppercase opacity-60">
                                            {item.provider}
                                        </p>
                                    )}
                                </div>
                            </article>
                        ))}
                        {loading && (
                            <div className="flex items-center gap-2 text-xs font-bold text-[#0878e8]">
                                <span className="size-2 animate-ping rounded-full bg-[#13b8ff]" />
                                AI membaca konteks database...
                            </div>
                        )}
                    </div>

                    <form
                        className="border-t border-white/70 bg-white/45 p-3"
                        onSubmit={submit}
                    >
                        <div className="flex items-center gap-2">
                            <input
                                className="h-12 flex-1 rounded-[16px] border border-white/80 bg-white/85 px-4 text-xs text-[#22304F] outline-none placeholder:text-[#9ea6b6] focus:border-[#13b8ff]"
                                onChange={(event) =>
                                    setMessage(event.target.value)
                                }
                                placeholder="Tanya Dentalyze AI..."
                                value={message}
                            />
                            <button
                                className="grid size-12 place-items-center rounded-[16px] bg-[#0878e8] text-white shadow-[0_12px_28px_rgba(8,120,232,0.22)] disabled:opacity-50"
                                disabled={loading}
                                type="submit"
                            >
                                <SendHorizontal size={18} />
                            </button>
                        </div>
                    </form>

                    <Link
                        className="flex items-center justify-center gap-2 border-t border-white/70 bg-white/55 px-4 py-3 text-[11px] font-black tracking-[0.16em] text-[#0878e8] uppercase transition hover:bg-white/80"
                        href="/ai-chat"
                    >
                        Buka halaman penuh
                        <ExternalLink size={14} />
                    </Link>
                </section>
            )}

            <button
                className="group flex h-16 items-center gap-3 rounded-full bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] px-5 text-white shadow-[0_20px_45px_rgba(8,120,232,0.28)] transition hover:-translate-y-1"
                onClick={() => setOpen((current) => !current)}
                type="button"
            >
                <span className="grid size-10 place-items-center rounded-full bg-white/18">
                    {open ? <X size={20} /> : <MessageCircle size={20} />}
                </span>
                <span className="hidden text-xs font-black tracking-[0.18em] uppercase sm:block">
                    AI Chat
                </span>
                {!open && (
                    <span className="absolute -top-1 -right-1 grid size-6 place-items-center rounded-full bg-[#49ddd7] text-white ring-4 ring-[#EAF8FF]">
                        <Bot size={13} />
                    </span>
                )}
            </button>
        </div>
    );
}
