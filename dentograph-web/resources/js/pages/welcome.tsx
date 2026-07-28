import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, Clock3, Mail, MapPin, MessageCircleMore, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import NewsletterForm from '@/components/newsletter-form';
import { dashboard, login } from '@/routes';

const sectionLinks = [['tentang-kami', 'Tentang Kami'], ['keunggulan', 'Keunggulan'], ['layanan', 'Layanan'], ['verifikasi', 'Feature']] as const;

export default function Welcome() {
    const { auth } = usePage().props as any;
    const [activeSection, setActiveSection] = useState('tentang-kami');

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

            if (visible) {
setActiveSection(visible.target.id);
}
        }, { rootMargin: '-25% 0px -55%', threshold: [0.1, 0.35, 0.6] });

        sectionLinks.forEach(([id]) => {
            const element = document.getElementById(id);

            if (element) {
observer.observe(element);
}
        });

        return () => observer.disconnect();
    }, []);

    return (
        <>
            <Head title="Dentalyze - AI Dental Intelligence" />

            <div className="relative min-h-screen w-full overflow-hidden bg-[linear-gradient(180deg,#eef8ff_0%,#edf8ff_18%,#e8f6ff_42%,#edf8ff_68%,#f7fbff_100%)] font-sans text-[#1b1b18]">
                {/* Background Blurs */}
                <div className="overflow-hidden">
                    <div className="absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-[#c7edff]/55 blur-[120px]" />
                    <div className="absolute bottom-[-80px] left-[38%] h-[360px] w-[360px] rounded-full bg-[#86d8ff]/20 blur-[140px]" />
                </div>

                {/* Header */}
                <header className="fixed top-0 left-0 right-0 z-[999] flex items-center justify-between border-b border-white/30 bg-white/10 px-12 py-5 shadow-[0_8px_30px_rgba(19,184,255,0.08)] backdrop-blur-xl lg:px-20">
                    <div className="flex items-center gap-1">
                        <img
                            src="/asset/images/logo.png"
                            alt="Dentalyze AI"
                            className="h-11 w-11 object-contain"
                        />

                        <div className="text-2xl font-black tracking-tight text-[#1aa0ff] lg:text-[34px]">
                            DENTA
                            <span className="text-[#187df0]">
                                LYZE
                            </span>
                        </div>
                    </div>

                    <nav className="hidden items-center gap-12 text-[11px] font-bold uppercase tracking-[0.28em] text-[#98a3b5] lg:flex">
                        {sectionLinks.map(([id, label]) => (
                            <a className={`border-b-2 pb-2 transition ${activeSection === id ? 'border-[#13b8ff] text-[#0878e8]' : 'border-transparent hover:text-[#13b8ff]'}`} href={`#${id}`} key={id}>{label}</a>
                        ))}
                    </nav>

                    <Link
                        href={auth.user ? dashboard() : login()}
                        className="rounded-[12px] bg-[#49ddd7] px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg transition hover:scale-105"
                    >
                        {auth.user ? 'Dashboard' : 'Get Started'}
                    </Link>
                </header>

                {/* Main Hero */}
                <main className="relative z-20 px-12 pt-[160px] lg:px-20">
                    <section id="tentang-kami" className="relative min-h-screen scroll-mt-32">

                        {/* Teks Background */}
                        <div className="pointer-events-none absolute left-0 right-0 top-[20px] z-0 select-none">
                            <h1 className="text-center text-[8vw] font-black uppercase leading-none tracking-[-0.08em] whitespace-nowrap text-transparent bg-gradient-to-r from-[#dff6ff] via-[#86d2ff] to-[#2da5f6] bg-clip-text opacity-70">
                                EVERY SMILE MATTERS
                            </h1>
                        </div>

                        {/* Content Grid - Kita kasih margin top negatif supaya naik menumpuk teks EVERY SMILE MATTERS */}
                        <div className="relative z-20 grid grid-cols-1 items-center lg:grid-cols-12 mt-[-30px] lg:mt-[-60px]">

                            {/* Kiri: Deskripsi */}
                            <div className="lg:col-span-3 mt-20 lg:mt-32"> {/* mt dikurangi supaya proporsional saat grid naik */}
                                <div className="rounded-[18px] border border-white/70 bg-white/35 p-8 shadow-sm backdrop-blur-md">
                                    <p className="text-[16px] italic leading-[1.8] text-[#808999]">
                                        "Sistem deteksi dan enumerasi gigi dewasa otomatis untuk diagnosis karies,
                                        lesi periapikal, dan impaksi."
                                    </p>
                                </div>

                                <div className="mt-12">
                                    <p className="text-[12px] font-black uppercase tracking-[0.4em] text-[#c3c8d3]">
                                        DETEKSI KECERDASAN BUATAN
                                    </p>
                                    <p className="mt-2 text-[30px] font-light text-[#1f78eb]">
                                        4 JENIS KELAINAN GIGI
                                    </p>
                                </div>
                                <Link href={login()} className="group mt-10 flex items-center gap-5 rounded-[12px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] px-11 py-5 text-[14px] font-black text-white shadow-[0_12px_28px_rgba(24,121,230,0.25)] transition-all hover:scale-105 active:scale-95">
                                    ANALISIS SEKARANG

                                </Link>
                            </div>

                            {/* Tengah: Gigi - Posisinya dinaikkan supaya memotong teks background */}
                            <div className="lg:col-span-6 flex justify-center relative">
                                <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#79d7ff]/25 blur-[120px]" />

                                {/* mt dikurangi dari 100px ke 40px supaya gigi "nabrak" tulisan di atasnya */}
                                <div className="mt-[20px] lg:mt-[40px] transition-all">
                                    <img
                                        src="/asset/images/gigi.png"
                                        alt="Dental AI"
                                        className="relative z-30 w-[400px] sm:w-[500px] lg:w-[750px] max-w-none drop-shadow-[0_45px_70px_rgba(19,184,255,0.35)] animate-gentle-float"
                                    />
                                </div>
                            </div>

                            {/* Kanan: Stats - Sekarang dimulai dari kiri (dekat gigi) */}
                            <div className="lg:col-span-3 flex flex-col gap-14 text-left lg:items-start mt-20 lg:mt-52 lg:pl-10">
                                <div className=" flex flex-col items-start">
                                    <div className="flex items-center gap-3 rounded-[10px] bg-white/40 backdrop-blur-md px-4 py-2 border border-white/60 shadow-sm">
                                        {/* Bulatan kecil indikator AI / Collaboration */}
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                        </span>
                                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">
                                            Official Partnership
                                        </p>
                                    </div>

                                    <div className="mt-4 flex items-center gap-4">
                                        {/* Placeholder Logo UNAIR - Bisa diganti <img /> kalau ada assetnya */}
                                        <div className="flex flex-col border-l-2 border-[#1c78ea] pl-3">
                                            <h4 className="text-[14px] font-black tracking-tight text-gray-700 leading-none">
                                                UNAIR <span className="text-[#1c78ea]">COLLECTION</span>
                                            </h4>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-1">
                                                Clinical Data Validation
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="group">
                                    <h3 className="text-[40px] font-black leading-none text-[#1c78ea] transition-transform group-hover:scale-105 origin-left">
                                        99%
                                    </h3>
                                    <p className="mt-2 text-[12px] font-bold uppercase tracking-[0.2em] text-[#9ea6b6] italic">
                                        Akurasi Deteksi        </p>
                                </div>

                                <div className="group">
                                    <h3 className="text-[40px] font-black leading-none text-[#1c78ea] transition-transform group-hover:scale-105 origin-left">
                                        2000+
                                    </h3>
                                    <p className="mt-2 text-[12px] font-bold uppercase tracking-[0.2em] text-[#9ea6b6] italic">
                                        Dataset Klinis
                                    </p>
                                </div>

                                {/* <div className="group">
                                    <h3 className="text-[40px] font-black leading-none text-[#1c78ea] transition-transform group-hover:scale-105 origin-left">
                                        &lt; 2s

                                    </h3>
                                    <p className="mt-2 text-[12px] font-bold uppercase tracking-[0.2em] text-[#9ea6b6] italic">
                                        Waktu Analisis
                                    </p>
                                </div> */}
                            </div>
                        </div>


                    </section>
                    {/* Section Keunggulan */}
                    <section id="keunggulan" className="relative z-30 pt-10 pb-28 scroll-mt-32">
                        {/* Header Section */}
                        <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
                            <div className="lg:col-span-7">
                                <p className="mb-3 text-[11px] font-black uppercase tracking-[0.5em] text-[#49ddd7]">
                                    KEUNGGULAN DENTALYZE
                                </p>

                                <h2 className="max-w-4xl text-[56px] font-black uppercase leading-[0.9] tracking-[-0.07em] text-transparent bg-gradient-to-r from-[#e5f8ff] via-[#8bd7ff] to-[#1592ef] bg-clip-text lg:text-[84px]">
                                    AI DENTAL CARE
                                </h2>
                            </div>

                            <div className="lg:col-span-5 lg:pt-6">
                                <p className="max-w-xl text-[16px] italic leading-[1.9] text-[#808999]">
                                    Platform analisis radiografi gigi yang membantu proses kerja klinik menjadi
                                    lebih cepat, rapi, dan mudah dipahami.
                                </p>
                            </div>
                        </div>

                        {/* Cards satu baris */}
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

                            {/* Card 1 - White Glassy */}
                            <div className="group relative min-h-[300px] overflow-hidden rounded-[30px] border border-white/70 bg-white/35 p-7 shadow-[0_18px_45px_rgba(19,184,255,0.08)] backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:bg-white/50">
                                {/* gambar transparan */}
                                <img
                                    src="/asset/images/gigi.png"
                                    alt=""
                                    className="pointer-events-none absolute -right-28 bottom-[-85px] z-0 w-[260px] opacity-[0.08] transition duration-500 group-hover:scale-110 group-hover:opacity-[0.13]"
                                />

                                <div className="relative z-10">
                                    <div className="mb-7 flex h-13 w-13 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] text-white shadow-[0_12px_28px_rgba(8,120,232,0.22)]">
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>

                                    <h3 className="text-[20px] font-black uppercase tracking-[-0.04em] text-[#0878e8]">
                                        Deteksi Cepat
                                    </h3>

                                    <p className="mt-4 text-[15px] leading-[1.8] text-[#808999]">
                                        Membantu membaca temuan radiografi lebih cepat tanpa alur kerja yang rumit.
                                    </p>

                                    <div className="mt-9 flex items-center gap-3">
                                        <span className="h-2 w-2 rounded-full bg-[#0878e8]" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#9ea6b6]">
                                            Fast Analysis
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2 - Blue Gradient */}
                            <div className="group relative min-h-[300px] overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#20b9ff_0%,#0878e8_100%)] p-7 text-white shadow-[0_24px_55px_rgba(8,120,232,0.26)] transition-all duration-500 hover:-translate-y-2">
                                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/15 blur-3xl transition duration-500 group-hover:scale-125" />
                                <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

                                <img
                                    src="/asset/images/gigi.png"
                                    alt=""
                                    className="pointer-events-none absolute -right-24 bottom-[-95px] z-0 w-[290px] opacity-[0.13] transition duration-500 group-hover:scale-110 group-hover:opacity-[0.2]"
                                />

                                <div className="relative z-10">
                                    <div className="mb-7 flex h-13 w-13 items-center justify-center rounded-[16px] bg-white/20 text-white backdrop-blur-md">
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
                                        </svg>
                                    </div>

                                    <h3 className="text-[20px] font-black uppercase tracking-[-0.04em] text-white">
                                        Visual Bersih
                                    </h3>

                                    <p className="mt-4 text-[15px] leading-[1.8] text-white/82">
                                        Tampilan hasil dibuat clean agar temuan lebih mudah dilihat dan dipahami.
                                    </p>

                                    <div className="mt-9 rounded-[15px] border border-white/25 bg-white/15 px-4 py-3 backdrop-blur-md">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/75">
                                            Clean Result
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3 - Tosca Green */}
                            <div className="group relative min-h-[300px] overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#49ddd7_0%,#20bfc7_100%)] p-7 text-white shadow-[0_24px_55px_rgba(73,221,215,0.25)] transition-all duration-500 hover:-translate-y-2">
                                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/18 blur-3xl transition duration-500 group-hover:scale-125" />
                                <div className="absolute bottom-[-90px] left-[-70px] h-48 w-48 rounded-full bg-white/12 blur-3xl" />

                                <img
                                    src="/asset/images/gigi.png"
                                    alt=""
                                    className="pointer-events-none absolute -right-24 bottom-[-95px] z-0 w-[290px] opacity-[0.14] transition duration-500 group-hover:scale-110 group-hover:opacity-[0.22]"
                                />

                                <div className="relative z-10">
                                    <div className="mb-7 flex h-13 w-13 items-center justify-center rounded-[16px] bg-white/22 text-white backdrop-blur-md">
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
                                        </svg>
                                    </div>

                                    <h3 className="text-[20px] font-black uppercase tracking-[-0.04em] text-white">
                                        Mudah Dicek
                                    </h3>

                                    <p className="mt-4 text-[15px] leading-[1.8] text-white/85">
                                        Dokter tetap bisa meninjau hasil AI sebelum dipakai untuk pendukung diagnosis.
                                    </p>

                                    <div className="mt-9 rounded-[15px] border border-white/25 bg-white/15 px-4 py-3 backdrop-blur-md">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/78">
                                            Review Ready
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Card 4 - Soft Purple Glass */}
                            <div className="group relative min-h-[300px] overflow-hidden rounded-[30px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.45)_0%,rgba(216,230,255,0.32)_100%)] p-7 shadow-[0_18px_45px_rgba(19,184,255,0.08)] backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:bg-white/50">
                                <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#49ddd7]/15 blur-3xl transition duration-500 group-hover:scale-125" />

                                <img
                                    src="/asset/images/gigi.png"
                                    alt=""
                                    className="pointer-events-none absolute -right-28 bottom-[-90px] z-0 w-[270px] opacity-[0.08] transition duration-500 group-hover:scale-110 group-hover:opacity-[0.14]"
                                />

                                <div className="relative z-10">
                                    <div className="mb-7 flex h-13 w-13 items-center justify-center rounded-[16px] bg-[#49ddd7]/15 text-[#22bfc6]">
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M12 22a10 10 0 100-20 10 10 0 000 20z" />
                                        </svg>
                                    </div>

                                    <h3 className="text-[20px] font-black uppercase tracking-[-0.04em] text-[#0878e8]">
                                        Lebih Efisien
                                    </h3>

                                    <p className="mt-4 text-[15px] leading-[1.8] text-[#808999]">
                                        Mengurangi proses pengecekan manual berulang agar dokumentasi lebih hemat waktu.
                                    </p>

                                    <div className="mt-9 flex items-center gap-3">
                                        <span className="h-2 w-2 rounded-full bg-[#49ddd7]" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#9ea6b6]">
                                            Faster Work
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section Layanan */}
                    <section
                        id="layanan"
                        className="relative z-30 overflow-hidden rounded-[38px] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.38)_0%,rgba(214,241,255,0.42)_45%,rgba(232,250,255,0.28)_100%)] px-8 pt-14 pb-16 shadow-[0_24px_70px_rgba(19,184,255,0.08)] backdrop-blur-md lg:px-10 lg:pt-16 lg:pb-20 scroll-mt-32"
                    >
                        {/* Header */}
                        <div className="mb-14 text-center">
                            <p className="mb-3 text-[11px] font-black uppercase tracking-[0.45em] text-[#49ddd7]">
                                LAYANAN DENTALYZE
                            </p>

                            <h2 className="mx-auto max-w-5xl text-[46px] font-black uppercase leading-[0.9] tracking-[-0.07em] text-transparent bg-gradient-to-r from-[#dff6ff] via-[#8bd7ff] to-[#1592ef] bg-clip-text lg:text-[78px]">
                                DETECTION SERVICES
                            </h2>

                            <p className="mx-auto mt-4 max-w-3xl text-[16px] italic leading-[1.9] text-[#808999]">
                                Analisis radiografi gigi dewasa yang mencakup enumerasi gigi serta deteksi
                                berbagai kelainan penting secara lebih visual, cepat, dan mudah dipahami.
                            </p>
                        </div>

                        {/* Mobile Layout */}
                        <div className="space-y-5 lg:hidden">
                            {/* Mobile Center Image */}
                            <div className="rounded-[30px] border border-white/70 bg-white/35 p-8 shadow-[0_18px_45px_rgba(19,184,255,0.08)] backdrop-blur-md">
                                <div className="relative flex min-h-[260px] items-center justify-center">
                                    <div className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/45 blur-[80px]" />
                                    <div className="absolute left-1/2 top-1/2 h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#49ddd7]/18 blur-[70px]" />
                                    <div className="absolute left-1/2 top-1/2 h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#13b8ff]/14 blur-[60px]" />

                                    <img
                                        src="/asset/images/layanan.png"
                                        alt="Dentalyze"
                                        className="relative z-10 w-[280x] max-w-none drop-shadow-[0_34px_54px_rgba(0,80,130,0.28)]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="rounded-[26px] border border-white/70 bg-white/40 p-6 shadow-[0_14px_35px_rgba(19,184,255,0.06)] backdrop-blur-md">
                                    <div className="mb-5 flex h-[130px] items-center justify-center overflow-visible">
                                        <img
                                            src="/asset/images/sempurna.png"
                                            alt="Enumerasi gigi dewasa"
                                            className="h-[120px] w-full rounded-[16px] object-cover drop-shadow-[0_16px_28px_rgba(19,184,255,0.18)]"
                                        />
                                    </div>
                                    <h3 className="text-[18px] font-black uppercase tracking-[-0.03em] text-[#0878e8]">
                                        Enumerasi Gigi Dewasa
                                    </h3>
                                    <p className="mt-3 text-[15px] leading-[1.75] text-[#7f8b9d]">
                                        Mengidentifikasi dan menghitung gigi dewasa secara otomatis dari radiografi panoramik.
                                    </p>
                                </div>

                                <div className="rounded-[26px] bg-[linear-gradient(135deg,#1fb8ff_0%,#0878e8_100%)] p-6 text-white shadow-[0_18px_45px_rgba(8,120,232,0.22)]">
                                    <div className="mb-5 flex h-[130px] items-center justify-center overflow-visible">
                                        <img
                                            src="/asset/images/karies.png"
                                            alt="Karies"
                                            className="h-[120px] w-full rounded-[16px] object-cover drop-shadow-[0_16px_28px_rgba(0,60,120,0.22)]"
                                        />
                                    </div>
                                    <h3 className="text-[18px] font-black uppercase tracking-[-0.03em] text-white">
                                        Karies
                                    </h3>
                                    <p className="mt-3 text-[15px] leading-[1.75] text-white/82">
                                        Membantu menemukan area gigi yang dicurigai mengalami karies.
                                    </p>
                                </div>

                                <div className="rounded-[26px] border border-white/70 bg-white/40 p-6 shadow-[0_14px_35px_rgba(19,184,255,0.06)] backdrop-blur-md">
                                    <div className="mb-5 flex h-[130px] items-center justify-center overflow-visible">
                                        <img
                                            src="/asset/images/resorpsiakar.png"
                                            alt="Resorpsi akar"
                                            className="h-[120px] w-full rounded-[16px] object-cover drop-shadow-[0_16px_28px_rgba(19,184,255,0.18)]"
                                        />
                                    </div>
                                    <h3 className="text-[18px] font-black uppercase tracking-[-0.03em] text-[#0878e8]">
                                        Resorpsi Akar
                                    </h3>
                                    <p className="mt-3 text-[15px] leading-[1.75] text-[#7f8b9d]">
                                        Membantu mendeteksi indikasi hilangnya struktur akar gigi.
                                    </p>
                                </div>

                                <div className="rounded-[26px] border border-white/70 bg-white/40 p-6 shadow-[0_14px_35px_rgba(19,184,255,0.06)] backdrop-blur-md">
                                    <div className="mb-5 flex h-[130px] items-center justify-center overflow-visible">
                                        <img
                                            src="/asset/images/lesi.png"
                                            alt="Lesi periapikal"
                                            className="h-[120px] w-full rounded-[16px] object-cover drop-shadow-[0_16px_28px_rgba(19,184,255,0.18)]"
                                        />
                                    </div>
                                    <h3 className="text-[18px] font-black uppercase tracking-[-0.03em] text-[#0878e8]">
                                        Lesi Periapikal
                                    </h3>
                                    <p className="mt-3 text-[15px] leading-[1.75] text-[#7f8b9d]">
                                        Mengidentifikasi dugaan lesi di area sekitar apeks akar gigi.
                                    </p>
                                </div>

                                <div className="rounded-[26px] bg-[linear-gradient(135deg,#49ddd7_0%,#21bfc6_100%)] p-6 text-white shadow-[0_18px_45px_rgba(73,221,215,0.22)]">
                                    <div className="mb-5 flex h-[130px] items-center justify-center overflow-visible">
                                        <img
                                            src="/asset/images/impaksi.png"
                                            alt="Impaksi"
                                            className="h-[120px] w-full rounded-[16px] object-cover drop-shadow-[0_16px_28px_rgba(0,90,100,0.22)]"
                                        />
                                    </div>
                                    <h3 className="text-[18px] font-black uppercase tracking-[-0.03em] text-white">
                                        Impaksi Gigi
                                    </h3>
                                    <p className="mt-3 text-[15px] leading-[1.75] text-white/84">
                                        Membantu mengenali gigi yang tidak erupsi normal atau tertahan.
                                    </p>
                                </div>

                                <div className="rounded-[26px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.48)_0%,rgba(216,230,255,0.34)_100%)] p-6 shadow-[0_14px_35px_rgba(19,184,255,0.06)] backdrop-blur-md">
                                    <div className="mb-5 flex h-[130px] items-center justify-center overflow-hidden">
                                        <img
                                            src="/asset/images/visualisasi.png"
                                            alt="Visualisasi hasil"
                                            className="h-[120px] w-full rounded-[16px] object-cover drop-shadow-[0_16px_28px_rgba(19,184,255,0.18)]"
                                        />
                                    </div>
                                    <h3 className="text-[18px] font-black uppercase tracking-[-0.03em] text-[#0878e8]">
                                        Visualisasi Hasil
                                    </h3>
                                    <p className="mt-3 text-[15px] leading-[1.75] text-[#7f8b9d]">
                                        Menampilkan hasil analisis dengan penandaan visual yang lebih mudah dibaca.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Diagram Layout */}
                        <div className="relative hidden h-[920px] lg:block">
                            {/* Connector Lines */}
                            <svg
                                className="pointer-events-none absolute inset-0 h-full w-full"
                                viewBox="0 0 1400 920"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <defs>
                                    <marker
                                        id="arrowheadSmall"
                                        markerWidth="6"
                                        markerHeight="6"
                                        refX="5"
                                        refY="3"
                                        orient="auto"
                                    >
                                        <path d="M0,0 L0,6 L5,3 z" fill="#49ddd7" />
                                    </marker>
                                </defs>

                                {/* Left connectors */}
                                <path
                                    d="M475 130 C525 145 565 175 625 250"
                                    stroke="rgba(73,221,215,0.92)"
                                    strokeWidth="2.5"
                                    strokeDasharray="10 10"
                                    markerEnd="url(#arrowheadSmall)"
                                />
                                <path
                                    d="M475 400 C530 400 575 400 625 400"
                                    stroke="rgba(73,221,215,0.92)"
                                    strokeWidth="2.5"
                                    strokeDasharray="10 10"
                                    markerEnd="url(#arrowheadSmall)"
                                />
                                <path
                                    d="M475 670 C530 650 575 600 625 530"
                                    stroke="rgba(73,221,215,0.92)"
                                    strokeWidth="2.5"
                                    strokeDasharray="10 10"
                                    markerEnd="url(#arrowheadSmall)"
                                />

                                {/* Right connectors */}
                                <path
                                    d="M925 130 C875 145 835 175 775 250"
                                    stroke="rgba(73,221,215,0.92)"
                                    strokeWidth="2.5"
                                    strokeDasharray="10 10"
                                    markerEnd="url(#arrowheadSmall)"
                                />
                                <path
                                    d="M925 400 C870 400 825 400 775 400"
                                    stroke="rgba(73,221,215,0.92)"
                                    strokeWidth="2.5"
                                    strokeDasharray="10 10"
                                    markerEnd="url(#arrowheadSmall)"
                                />
                                <path
                                    d="M925 670 C870 650 825 600 775 530"
                                    stroke="rgba(73,221,215,0.92)"
                                    strokeWidth="2.5"
                                    strokeDasharray="10 10"
                                    markerEnd="url(#arrowheadSmall)"
                                />

                                {/* 6 titik */}
                                <circle cx="625" cy="250" r="5" fill="rgba(73,221,215,0.24)" />
                                <circle cx="625" cy="400" r="5" fill="rgba(73,221,215,0.24)" />
                                <circle cx="625" cy="530" r="5" fill="rgba(73,221,215,0.24)" />
                                <circle cx="775" cy="250" r="5" fill="rgba(73,221,215,0.24)" />
                                <circle cx="775" cy="400" r="5" fill="rgba(73,221,215,0.24)" />
                                <circle cx="775" cy="530" r="5" fill="rgba(73,221,215,0.24)" />
                            </svg>

                            {/* Center layanan.png - besar tanpa card kotak */}
                            <div className="absolute left-1/2 top-[450px] z-20 -translate-x-1/2 -translate-y-1/2">
                                <div className="relative flex h-[470px] w-[390px] items-center justify-center">
                                    {/* glow only, no card */}
                                    <div className="absolute left-1/2 top-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/45 blur-[120px]" />
                                    <div className="absolute left-1/2 top-1/2 -z-10 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#49ddd7]/22 blur-[105px]" />
                                    <div className="absolute left-1/2 top-1/2 -z-10 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#13b8ff]/16 blur-[90px]" />

                                    <img
                                        src="/asset/images/layanan.png"
                                        alt="Dentalyze"
                                        className="relative z-10 w-[350px] max-w-none drop-shadow-[0_48px_78px_rgba(0,80,130,0.32)]"
                                    />
                                </div>
                            </div>

                            {/* Left Top */}
                            <div className="absolute left-[110px] top-0 z-10 w-[275px] overflow-hidden rounded-[30px] border border-white/70 bg-white/40 p-5 shadow-[0_14px_32px_rgba(19,184,255,0.06)] backdrop-blur-md transition duration-300 hover:-translate-y-2 hover:bg-white/52">
                                <div className="mb-5 flex h-[135px] items-center justify-center overflow-hidden">
                                    <img
                                        src="/asset/images/sempurna.png"
                                        alt="Enumerasi gigi dewasa"
                                        className="h-[128px] w-full rounded-[18px] object-cover drop-shadow-[0_16px_28px_rgba(19,184,255,0.18)]"
                                    />
                                </div>
                                <h3 className="text-[16px] font-black uppercase tracking-[-0.03em] text-[#0878e8]">
                                    Enumerasi Gigi Dewasa
                                </h3>
                                <p className="mt-3 text-[14px] leading-[1.7] text-[#7f8b9d]">
                                    Mengidentifikasi dan menghitung gigi dewasa otomatis.
                                </p>
                            </div>

                            {/* Left Middle */}
                            <div className="absolute left-[110px] top-[310px] z-10 w-[275px] overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#1fb8ff_0%,#0878e8_100%)] p-5 text-white shadow-[0_18px_40px_rgba(8,120,232,0.22)] transition duration-300 hover:-translate-y-2">
                                <div className="mb-5 flex h-[135px] items-center justify-center overflow-hidden">
                                    <img
                                        src="/asset/images/karies.png"
                                        alt="Karies"
                                        className="h-[128px] w-full rounded-[18px] object-cover drop-shadow-[0_16px_28px_rgba(0,60,120,0.22)]"
                                    />
                                </div>
                                <h3 className="text-[16px] font-black uppercase tracking-[-0.03em] text-white">
                                    Karies
                                </h3>
                                <p className="mt-3 text-[14px] leading-[1.7] text-white/82">
                                    Membantu menemukan area gigi yang dicurigai mengalami karies.
                                </p>
                            </div>

                            {/* Left Bottom */}
                            <div className="absolute left-[110px] top-[620px] z-10 w-[275px] overflow-hidden rounded-[30px] border border-white/70 bg-white/40 p-5 shadow-[0_14px_32px_rgba(19,184,255,0.06)] backdrop-blur-md transition duration-300 hover:-translate-y-2 hover:bg-white/52">
                                <div className="mb-5 flex h-[135px] items-center justify-center overflow-hidden">
                                    <img
                                        src="/asset/images/resorpsiakar.png"
                                        alt="Resorpsi akar"
                                        className="h-[128px] w-full rounded-[18px] object-cover drop-shadow-[0_16px_28px_rgba(19,184,255,0.18)]"
                                    />
                                </div>
                                <h3 className="text-[16px] font-black uppercase tracking-[-0.03em] text-[#0878e8]">
                                    Resorpsi Akar
                                </h3>
                                <p className="mt-3 text-[14px] leading-[1.7] text-[#7f8b9d]">
                                    Membantu mendeteksi indikasi hilangnya struktur akar gigi.
                                </p>
                            </div>

                            {/* Right Top */}
                            <div className="absolute right-[110px] top-0 z-10 w-[275px] overflow-hidden rounded-[30px] border border-white/70 bg-white/40 p-5 shadow-[0_14px_32px_rgba(19,184,255,0.06)] backdrop-blur-md transition duration-300 hover:-translate-y-2 hover:bg-white/52">
                                <div className="mb-5 flex h-[135px] items-center justify-center overflow-hidden">
                                    <img
                                        src="/asset/images/lesi.png"
                                        alt="Lesi periapikal"
                                        className="h-[128px] w-full rounded-[18px] object-cover drop-shadow-[0_16px_28px_rgba(19,184,255,0.18)]"
                                    />
                                </div>
                                <h3 className="text-[16px] font-black uppercase tracking-[-0.03em] text-[#0878e8]">
                                    Lesi Periapikal
                                </h3>
                                <p className="mt-3 text-[14px] leading-[1.7] text-[#7f8b9d]">
                                    Mengidentifikasi dugaan lesi di sekitar apeks akar gigi.
                                </p>
                            </div>

                            {/* Right Middle */}
                            <div className="absolute right-[110px] top-[310px] z-10 w-[275px] overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#49ddd7_0%,#21bfc6_100%)] p-5 text-white shadow-[0_18px_40px_rgba(73,221,215,0.22)] transition duration-300 hover:-translate-y-2">
                                <div className="mb-5 flex h-[135px] items-center justify-center overflow-hidden">
                                    <img
                                        src="/asset/images/impaksi.png"
                                        alt="Impaksi"
                                        className="h-[128px] w-full rounded-[18px] object-cover drop-shadow-[0_16px_28px_rgba(0,90,100,0.22)]"
                                    />
                                </div>
                                <h3 className="text-[16px] font-black uppercase tracking-[-0.03em] text-white">
                                    Impaksi Gigi
                                </h3>
                                <p className="mt-3 text-[14px] leading-[1.7] text-white/84">
                                    Membantu mengenali gigi yang tidak erupsi normal atau tertahan.
                                </p>
                            </div>

                            {/* Right Bottom */}
                            <div className="absolute right-[110px] top-[620px] z-10 w-[275px] overflow-hidden rounded-[30px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.48)_0%,rgba(216,230,255,0.34)_100%)] p-5 shadow-[0_14px_32px_rgba(19,184,255,0.06)] backdrop-blur-md transition duration-300 hover:-translate-y-2 hover:bg-white/52">
                                <div className="mb-5 flex h-[135px] items-center justify-center overflow-hidden">
                                    <img
                                        src="/asset/images/visualisasi.png"
                                        alt="Visualisasi hasil"
                                        className="h-[128px] w-full rounded-[18px] object-cover drop-shadow-[0_16px_28px_rgba(19,184,255,0.18)]"
                                    />
                                </div>
                                <h3 className="text-[16px] font-black uppercase tracking-[-0.03em] text-[#0878e8]">
                                    Visualisasi Hasil
                                </h3>
                                <p className="mt-3 text-[14px] leading-[1.7] text-[#7f8b9d]">
                                    Menampilkan hasil analisis dengan penandaan visual yang mudah dibaca.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section Verifikasi */}
                    <section
                        id="verifikasi"
                        className="relative z-30 -mx-12 mt-20 overflow-hidden px-12 py-20 lg:-mx-20 lg:px-20 lg:py-24 scroll-mt-24"
                    >
                        <div className="relative z-10 grid grid-cols-1 items-center gap-16 lg:grid-cols-12">
                            {/* Visual Card */}
                            <div className="lg:col-span-5">
                                <div className="relative mx-auto flex min-h-[460px] max-w-[460px] items-center justify-center">
                                    {/* Back Layer */}
                                    <div className="absolute inset-6 rotate-[-4deg] rounded-[48px] bg-[linear-gradient(135deg,#13b8ff_0%,#49ddd7_100%)] opacity-25 blur-[1px]" />

                                    {/* Main Device */}
                                    <div className="relative z-20 w-full overflow-hidden rounded-[42px] border border-white/70 bg-white/65 p-5 shadow-[0_30px_70px_rgba(19,184,255,0.14)] backdrop-blur-xl">
                                        <div className="relative overflow-hidden rounded-[34px] bg-[linear-gradient(135deg,#0878e8_0%,#13b8ff_48%,#49ddd7_100%)] p-7 text-white">
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25)_0%,transparent_35%)]" />

                                            {/* Scanner Line */}
                                            <div className="absolute left-0 right-0 top-[38%] h-[2px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_18px_rgba(255,255,255,0.9)]" />

                                            <div className="relative z-10 mb-10 flex items-center justify-between">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white/18 backdrop-blur-md">
                                                    <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M12 3l7 4v5c0 5-3 9-7 9s-7-4-7-9V7l7-4z" />
                                                    </svg>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/80">
                                                        Dental Verify
                                                    </p>
                                                    <p className="mt-1 text-[11px] font-bold text-white/55">
                                                        Secure Report
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="relative z-10 flex flex-col items-center justify-center py-10">
                                                {/* Floating Checks */}
                                                <div className="absolute left-4 top-4 rounded-full bg-white/16 p-2 backdrop-blur-md">
                                                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>

                                                <div className="absolute right-3 top-16 rounded-full bg-white/16 p-2 backdrop-blur-md">
                                                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>

                                                <div className="absolute bottom-4 right-10 rounded-full bg-white/16 p-2 backdrop-blur-md">
                                                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>

                                                {/* QR */}
                                                <div className="relative rounded-[30px] bg-white p-6 shadow-[0_24px_50px_rgba(0,80,130,0.25)]">
                                                    <svg className="h-[116px] w-[116px] text-[#0878e8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2z" />
                                                    </svg>

                                                    <div className="absolute -top-1 -left-1 h-6 w-6 rounded-tl-xl border-l-4 border-t-4 border-[#49ddd7]" />
                                                    <div className="absolute -top-1 -right-1 h-6 w-6 rounded-tr-xl border-r-4 border-t-4 border-[#49ddd7]" />
                                                    <div className="absolute -bottom-1 -left-1 h-6 w-6 rounded-bl-xl border-b-4 border-l-4 border-[#49ddd7]" />
                                                    <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-br-xl border-b-4 border-r-4 border-[#49ddd7]" />
                                                </div>

                                                <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/18 px-5 py-2 backdrop-blur-md">
                                                    <span className="relative flex h-2.5 w-2.5">
                                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
                                                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
                                                    </span>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/85">
                                                        Live Verifying
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="relative z-10 rounded-[24px] border border-white/20 bg-white/16 p-4 backdrop-blur-md">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/18">
                                                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>

                                                    <div>
                                                        <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/55">
                                                            Patient Report
                                                        </p>
                                                        <p className="mt-1 text-[13px] font-black text-white">
                                                            Dental Analysis [Verified]
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Floating Badge */}
                                    <div className="absolute -right-6 top-[35%] z-30 hidden items-center gap-3 rounded-[22px] border border-white/70 bg-white/80 px-5 py-4 shadow-[0_20px_45px_rgba(19,184,255,0.16)] backdrop-blur-md lg:flex">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#13b8ff]/10 text-[#0878e8]">
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <p className="text-[12px] font-black uppercase tracking-[0.08em] text-[#0878e8]">
                                            Real-time Sync
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Text Content */}
                            <div className="lg:col-span-7 lg:pl-10">
                                <div className="mb-8">
                                    <p className="mb-4 inline-flex rounded-full border border-white/70 bg-white/45 px-5 py-2 text-[11px] font-black uppercase tracking-[0.35em] text-[#49ddd7] backdrop-blur-md">
                                        Verifikasi Laporan
                                    </p>

                                    <h2 className="max-w-4xl text-[48px] font-black uppercase leading-[0.92] tracking-[-0.06em] text-transparent bg-gradient-to-r from-[#dff6ff] via-[#86d2ff] to-[#0878e8] bg-clip-text lg:text-[78px]">
                                        Hasil Analisis Terverifikasi
                                    </h2>

                                    <p className="mt-6 max-w-2xl text-[16px] italic leading-[1.9] text-[#808999]">
                                        Setiap laporan hasil analisis dapat dilengkapi identitas digital agar data lebih mudah
                                        ditinjau, dicek ulang, dan digunakan sebagai dokumentasi klinis yang rapi.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div className="rounded-[26px] border border-white/70 bg-white/45 p-6 shadow-[0_14px_35px_rgba(19,184,255,0.06)] backdrop-blur-md">
                                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#13b8ff]/10 text-[#0878e8]">
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm12 0h4v4h-4v-4z" />
                                            </svg>
                                        </div>

                                        <h3 className="text-[19px] font-black uppercase tracking-[-0.03em] text-[#0878e8]">
                                            Quick Verification
                                        </h3>

                                        <p className="mt-3 text-[15px] leading-[1.75] text-[#808999]">
                                            Pindai kode unik pada laporan untuk membantu proses validasi data secara cepat.
                                        </p>
                                    </div>

                                    <div className="rounded-[26px] bg-[linear-gradient(135deg,#49ddd7_0%,#20bfc7_100%)] p-6 text-white shadow-[0_18px_45px_rgba(73,221,215,0.22)]">
                                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[16px] bg-white/18 text-white">
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v5c0 5-3 9-7 9s-7-4-7-9V7l7-4z" />
                                            </svg>
                                        </div>

                                        <h3 className="text-[19px] font-black uppercase tracking-[-0.03em] text-white">
                                            Secure Record
                                        </h3>

                                        <p className="mt-3 text-[15px] leading-[1.75] text-white/86">
                                            Membantu menjaga integritas dokumentasi hasil analisis agar lebih aman dan konsisten.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Footer */}
                    <footer className="relative z-30 mt-20 overflow-hidden rounded-t-[46px] border-t border-white/40 bg-[linear-gradient(135deg,#eaf8ff_0%,#eefaff_32%,#dff6ff_62%,#f8fcff_100%)] px-8 pt-16 pb-8 text-[#1b1b18] shadow-[0_-24px_70px_rgba(19,184,255,0.08)] lg:px-16">
                        {/* Footer Background */}
                        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                            <div className="absolute -top-24 left-[-120px] h-[420px] w-[420px] rounded-full bg-[#13b8ff]/14 blur-[120px]" />
                            <div className="absolute top-[10%] right-[-100px] h-[380px] w-[380px] rounded-full bg-[#49ddd7]/16 blur-[120px]" />
                            <div className="absolute bottom-[-160px] left-[40%] h-[420px] w-[420px] rounded-full bg-[#86d8ff]/14 blur-[130px]" />
                            <div className="absolute inset-0 opacity-[0.18] bg-[radial-gradient(circle_at_1px_1px,rgba(8,120,232,0.18)_1px,transparent_0)] [background-size:34px_34px]" />
                        </div>

                        <div className="relative z-10">
                            <div className="grid grid-cols-1 gap-14 md:grid-cols-2 xl:grid-cols-[1.2fr_0.9fr_0.9fr_1.1fr]">
                                {/* Brand */}
                                <div className="lg:col-span-1">
                                    <div className="flex items-center gap-1">
                                        <img
                                            src="/asset/images/logo.png"
                                            alt="Dentalyze AI"
                                            className="h-11 w-11 object-contain"
                                        />

                                        <div className="text-3xl font-black tracking-tight text-[#1aa0ff]">
                                            DENTA
                                            <span className="text-[#187df0]">
                                                LYZE
                                            </span>
                                        </div>
                                    </div>

                                    <p className="mt-5 max-w-[320px] text-[15px] leading-[1.8] text-[#808999]">
                                        Platform AI dental intelligence untuk membantu analisis radiografi gigi dewasa,
                                        enumerasi gigi, serta deteksi kelainan secara lebih cepat dan rapi.
                                    </p>

                                    <div className="mt-8 flex items-center gap-4">
                                        <a
                                            href="https://wa.me/6281336730560?text=Halo%20Dentalyze%2C%20saya%20ingin%20berkonsultasi."
                                            rel="noreferrer"
                                            target="_blank"
                                            className="group flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/70 bg-white/45 text-[#0878e8] shadow-[0_12px_25px_rgba(19,184,255,0.08)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:bg-[#0878e8] hover:text-white"
                                        >
                                            <BookOpen
                                                size={18}
                                                strokeWidth={2.1}
                                            />
                                        </a>

                                        <a
                                            href="https://wa.me/6281336730560?text=Halo%20Dentalyze%2C%20mohon%20hubungi%20saya."
                                            rel="noreferrer"
                                            target="_blank"
                                            className="group flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/70 bg-white/45 text-[#0878e8] shadow-[0_12px_25px_rgba(19,184,255,0.08)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:bg-[#0878e8] hover:text-white"
                                        >
                                            <MessageCircleMore
                                                size={18}
                                                strokeWidth={2.1}
                                            />
                                        </a>

                                        <a
                                            href="#"
                                            className="group flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/70 bg-white/45 text-[#0878e8] shadow-[0_12px_25px_rgba(19,184,255,0.08)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:bg-[#0878e8] hover:text-white"
                                        >
                                            <Phone
                                                size={18}
                                                strokeWidth={2.1}
                                            />
                                        </a>
                                    </div>
                                </div>

                                {/* Navigasi */}
                                <div>
                                    <h4 className="text-[15px] font-black uppercase tracking-[0.26em] text-[#0878e8]">
                                        Navigasi
                                    </h4>

                                    <ul className="mt-7 space-y-4">
                                        {['Tentang Kami', 'Layanan', 'Keunggulan', 'Verifikasi'].map((item) => (
                                            <li key={item}>
                                                <a
                                                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                                                    className="group flex items-center gap-3 text-[15px] font-semibold text-[#808999] transition hover:text-[#0878e8]"
                                                >
                                                    <span className="h-2 w-2 rounded-full bg-[#49ddd7] transition group-hover:scale-125" />
                                                    {item}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Kontak */}
                                <div>
                                    <h4 className="text-[13px] font-black uppercase tracking-[0.34em] text-[#0878e8]">
                                        Hubungi Kami
                                    </h4>

                                    <ul className="mt-6 space-y-6 text-[15px] text-[#808999]">
                                        <li className="flex items-center gap-4">
                                            <span className="flex h-5 w-5 items-center justify-center text-[#49ddd7]">
                                                <MapPin
                                                    size={18}
                                                    strokeWidth={2.2}
                                                />
                                            </span>

                                            <span>Indonesia</span>
                                        </li>

                                        <li className="flex items-center gap-4">
                                            <span className="flex h-5 w-5 items-center justify-center text-[#49ddd7]">
                                                <Mail
                                                    size={18}
                                                    strokeWidth={2.2}
                                                />
                                            </span>

                                            <span>support@dentalyze.id</span>
                                        </li>

                                        <li className="flex items-center gap-4">
                                            <span className="flex h-5 w-5 items-center justify-center text-[#49ddd7]">
                                                <Clock3
                                                    size={18}
                                                    strokeWidth={2.2}
                                                />
                                            </span>

                                            <span>09:00 / 17:00</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Newsletter */}
                                <div>
                                    <h4 className="text-[15px] font-black uppercase tracking-[0.26em] text-[#0878e8]">
                                        Newsletter
                                    </h4>

                                    <p className="mt-7 text-[15px] leading-[1.8] text-[#808999]">
                                        Dapatkan update fitur AI Dentalyze, teknologi deteksi gigi, dan pengembangan sistem terbaru.
                                    </p>

                                    <NewsletterForm />
                                </div>
                            </div>

                            <div className="mt-16 border-t border-[#0878e8]/10 pt-8">
                                <div className="flex flex-col items-center justify-between gap-5 text-[14px] text-[#9ea6b6] md:flex-row">
                                    <p>
                                        © 2026 Dentalyze AI — AI Powered Dental Disease Detection and Analysis System. All rights reserved.
                                    </p>

                                    <div className="flex gap-7">
                                        <a href="#" className="transition hover:text-[#0878e8]">
                                            Kebijakan Privasi
                                        </a>
                                        <a href="#" className="transition hover:text-[#0878e8]">
                                            Syarat & Ketentuan
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </footer>
                </main>
            </div>

            <style>{`
                html {
                    scroll-behavior: smooth;
                }
                @keyframes gentle-float {
                    0%, 100% {
                        transform: translateY(0px) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-20px) rotate(1deg);
                    }
                }

                .animate-gentle-float {
                    animation: gentle-float 6s ease-in-out infinite;
                }
            `}</style>
        </>
    );
}
