import { useForm } from '@inertiajs/react';

export default function NewsletterForm() {
    const { data, setData, post, processing, errors, recentlySuccessful, reset } = useForm({ email: '' });

    return (
        <form className="relative mt-7 max-w-[340px]" onSubmit={(event) => {
            event.preventDefault();
            post('/newsletter', { preserveScroll: true, onSuccess: () => reset() });
        }}>
            <input aria-label="Email newsletter" className="w-full rounded-[18px] border border-white/70 bg-white/50 px-5 py-4 pr-14 text-[14px] text-[#0878e8] shadow-[0_12px_30px_rgba(19,184,255,0.08)] backdrop-blur-md transition outline-none placeholder:text-[#9ea6b6] focus:border-[#49ddd7] focus:bg-white/70" onChange={(event) => setData('email', event.target.value)} placeholder="Email Anda" required type="email" value={data.email} />
            <button aria-label="Daftar newsletter" className="absolute top-2 right-2 bottom-2 flex w-11 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] text-white shadow-lg transition hover:scale-105 disabled:opacity-60" disabled={processing} type="submit">{processing ? '…' : '→'}</button>
            {errors.email && <p className="mt-2 text-xs font-bold text-rose-500">{errors.email}</p>}
            {recentlySuccessful && <p className="mt-2 text-xs font-bold text-emerald-600">Terima kasih, email Anda telah terdaftar.</p>}
        </form>
    );
}
