import { Link } from '@inertiajs/react';
import { DETECTION_ACCURACY } from '@/lib/clinical-metrics';

export default function AuthLayout({
    children,
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[#dfefff]">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Gradient Base */}
                <div className="absolute inset-0 bg-[linear-gradient(135deg,#d8ebff_0%,#d9f4ff_45%,#cfe5ff_100%)]" />

                {/* Glow kiri */}
                <div className="absolute top-[-220px] left-[-220px] h-[520px] w-[520px] rounded-full bg-[#49ddd7]/25 blur-3xl" />

                {/* Glow kanan */}
                <div className="absolute right-[-180px] bottom-[-260px] h-[620px] w-[620px] rounded-full bg-[#1aa0ff]/25 blur-3xl" />

                {/* Glow tengah */}
                <div className="absolute top-1/2 left-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#13b8ff]/10 blur-3xl" />

                {/* Tooth Decoration */}
                <img
                    src="/asset/images/gigi.png"
                    alt="Dental Background"
                    className="pointer-events-none absolute top-1/2 left-1/2 w-[1050px] -translate-x-[5%] -translate-y-1/2 opacity-[0.22] drop-shadow-[0_0_120px_rgba(19,184,255,0.32)] select-none"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(73,221,215,0.12),transparent_45%)]" />
            </div>

            <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
                <div className="grid w-full max-w-6xl gap-14 lg:grid-cols-[1fr_500px] lg:items-center">
                    {/* LEFT SIDE */}
                    <div className="hidden lg:block">
                        <div className="max-w-xl">
                            {/* Logo */}
                            <Link
                                href="/"
                                className="group mb-8 flex w-fit items-center gap-4 transition-all duration-300 hover:scale-[1.02]"
                            >
                                <img
                                    src="/asset/images/logo.png"
                                    alt="Dentalyze AI"
                                    className="h-16 w-16 rounded-2xl bg-white/60 p-2 shadow-[0_12px_30px_rgba(19,184,255,0.12)] backdrop-blur-md transition-all duration-300 group-hover:shadow-[0_18px_40px_rgba(19,184,255,0.22)]"
                                />

                                <div className="text-[46px] font-black tracking-tight text-[#1aa0ff] transition-all duration-300 group-hover:text-[#13b8ff]">
                                    DENTA
                                    <span className="text-[#187df0]">LYZE</span>
                                </div>
                            </Link>

                            <div className="space-y-7">
                                <div className="inline-flex rounded-full border border-[#49ddd7]/30 bg-white/60 px-5 py-2 text-xs font-black tracking-[0.28em] text-[#49ddd7] uppercase backdrop-blur-md">
                                    AI Dental Intelligence
                                </div>

                                <div>
                                    <h1 className="text-7xl leading-[0.95] font-black tracking-tight text-[#5cbcff]">
                                        SMART
                                        <br />
                                        DENTAL
                                        <br />
                                        ANALYSIS
                                    </h1>

                                    <div className="mt-6 h-2 w-28 rounded-full bg-gradient-to-r from-[#49ddd7] to-[#1aa0ff]" />
                                </div>

                                <p className="max-w-lg text-lg leading-8 text-[#7f8da3]">
                                    Platform AI radiografi gigi modern untuk
                                    deteksi karies, lesi periapikal, impaksi
                                    gigi, dan enumerasi otomatis secara cepat
                                    dan akurat.
                                </p>

                                {/* Stats */}
                                <div className="flex items-center gap-14 pt-6">
                                    <div>
                                        <div className="text-5xl font-black text-[#187df0]">
                                            {DETECTION_ACCURACY}
                                        </div>

                                        <div className="mt-2 text-xs font-black tracking-[0.28em] text-[#98a3b5] uppercase">
                                            Akurasi Deteksi
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-5xl font-black text-[#187df0]">
                                            2000+
                                        </div>

                                        <div className="mt-2 text-xs font-black tracking-[0.28em] text-[#98a3b5] uppercase">
                                            Dataset Klinis
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT CONTENT */}
                    <div className="relative overflow-hidden rounded-[38px] border border-white/60 bg-white/50 p-10 shadow-[0_30px_90px_rgba(19,184,255,0.18)] backdrop-blur-2xl">
                        {/* Decorative Glow */}
                        <div className="absolute top-[-50px] right-[-50px] h-[180px] w-[180px] rounded-full bg-[#49ddd7]/15 blur-3xl" />

                        <div className="relative z-10">{children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
