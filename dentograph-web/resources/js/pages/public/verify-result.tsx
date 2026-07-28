import { Head, Link } from '@inertiajs/react';
import { Calendar, ShieldCheck, UserRound } from 'lucide-react';
import { home } from '@/routes';

type Props = {
    radiograph: string;
    valid: boolean;
    summary: {
        patient_name: string | null;
        verified_at: string | null;
        doctor_name: string | null;
    };
};

export default function VerifyResult({ radiograph, summary, valid }: Props) {
    return (
        <>
            <Head title="Verifikasi Dokumen" />
            <main className="min-h-screen bg-[#EEF9FF] p-6 text-[#073d52]">
                <section className="mx-auto grid min-h-[calc(100vh-48px)] max-w-6xl overflow-hidden rounded-[34px] bg-white shadow-[0_28px_80px_rgba(8,120,232,0.14)] lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="relative hidden bg-[#9FC5D3] p-12 lg:block">
                        <div className="absolute inset-0 [background-image:radial-gradient(circle_at_20%_20%,#fff_0_2px,transparent_2px)] [background-size:34px_34px] opacity-25" />
                        <h1 className="relative text-2xl font-black">DeTech</h1>
                        <div className="relative mt-12 rounded-[28px] bg-white/35 p-8 shadow-[0_24px_70px_rgba(7,61,82,0.18)] backdrop-blur-sm">
                            <div className="grid aspect-[4/5] place-items-center rounded-[24px] bg-[#D9EEF6]">
                                <ShieldCheck
                                    className={
                                        valid
                                            ? 'text-emerald-500'
                                            : 'text-rose-500'
                                    }
                                    size={120}
                                />
                            </div>
                            <div className="absolute bottom-16 left-4 rounded-2xl bg-white px-5 py-4 shadow-xl">
                                <p className="text-[11px] font-black text-slate-400 uppercase">
                                    Status Dokumen
                                </p>
                                <p
                                    className={`mt-1 font-black ${
                                        valid
                                            ? 'text-emerald-600'
                                            : 'text-rose-500'
                                    }`}
                                >
                                    {valid
                                        ? 'Terverifikasi Asli'
                                        : 'Tidak Valid'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="grid place-items-center p-6 sm:p-10">
                        <article className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-[0_24px_70px_rgba(8,120,232,0.12)]">
                            <header
                                className={`p-9 text-center text-white ${
                                    valid ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                            >
                                <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-white/20">
                                    <ShieldCheck size={32} />
                                </div>
                                <h2 className="mt-5 text-xl font-black tracking-[0.25em] uppercase">
                                    {valid
                                        ? 'Dokumen Asli'
                                        : 'Dokumen Tidak Valid'}
                                </h2>
                                <p className="mt-2 text-sm text-white/85">
                                    Sistem Verifikasi DeTech Dental AI
                                </p>
                            </header>

                            <div className="space-y-4 p-8">
                                <Info
                                    icon={<UserRound size={18} />}
                                    label="Nama Pasien"
                                    value={summary.patient_name ?? '-'}
                                />
                                <Info
                                    icon={<Calendar size={18} />}
                                    label="Waktu Verifikasi"
                                    value={summary.verified_at ?? '-'}
                                />
                                <div className="border-t border-dashed pt-5">
                                    <Info
                                        icon={<ShieldCheck size={18} />}
                                        label="Dokter Pemeriksa"
                                        value={summary.doctor_name ?? '-'}
                                    />
                                </div>
                                <p className="rounded-2xl bg-[#F4FBFF] p-4 text-center text-xs font-semibold break-all text-slate-400">
                                    {radiograph}
                                </p>
                            </div>
                            <footer className="bg-slate-50 p-5 text-center">
                                <Link
                                    className="text-xs font-black text-[#073d52] uppercase"
                                    href={home()}
                                >
                                    Kembali ke Beranda
                                </Link>
                            </footer>
                        </article>
                        <p className="mt-8 text-center text-[10px] font-semibold text-slate-300">
                            © 2026 DETECH DENTAL AI. INFO DETECTION DATA MEDIS
                            TERJAMIN.
                        </p>
                    </div>
                </section>
            </main>
        </>
    );
}

function Info({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-[#DDECF4] bg-[#F7FCFF] p-4">
            <div className="grid size-10 place-items-center rounded-xl bg-white text-[#0878e8]">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black tracking-[0.18em] text-slate-400 uppercase">
                    {label}
                </p>
                <p className="mt-1 font-black text-[#073d52]">{value}</p>
            </div>
        </div>
    );
}

VerifyResult.layout = null;
