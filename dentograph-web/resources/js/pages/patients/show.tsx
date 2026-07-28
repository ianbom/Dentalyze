import { Head, Link } from '@inertiajs/react';
import {
    CalendarDays,
    FileClock,
    IdCard,
    Mail,
    MapPin,
    Pencil,
    Phone,
    User,
    Users,
} from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import type { PatientFormPatient } from '@/pages/patients/_patient-form';
import patients from '@/routes/patients';

type PatientsShowProps = {
    patient: PatientFormPatient & {
        created_at?: string | null;
    };
    permissions: {
        update: boolean;
        delete: boolean;
    };
};

function formatDate(value: string | null | undefined) {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

export default function PatientsShow({
    patient,
    permissions,
}: PatientsShowProps) {
    const genderLabel = patient.gender === 'male' ? 'Laki-laki' : 'Perempuan';

    return (
        <>
            <Head title={`Detail ${patient.name}`} />

            <div className="space-y-6">
                <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
                    <aside className="group relative overflow-hidden rounded-[30px] border border-white/70 bg-white/35 p-6 shadow-[0_24px_55px_rgba(19,184,255,0.1)] backdrop-blur-md">
                        <img
                            alt=""
                            className="pointer-events-none absolute -right-28 -bottom-28 w-80 opacity-[0.08] transition duration-500 group-hover:scale-110 group-hover:opacity-[0.13]"
                            src="/asset/images/gigi.png"
                        />

                        <div className="relative z-10">
                            <span className="grid size-20 place-items-center rounded-[24px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] text-3xl font-black text-white shadow-[0_16px_34px_rgba(8,120,232,0.24)]">
                                {patient.name.slice(0, 1).toUpperCase()}
                            </span>

                            <p className="mt-8 text-[11px] font-black tracking-[0.42em] text-[#49ddd7] uppercase">
                                DETAIL PASIEN
                            </p>
                            <h2 className="mt-2 text-[34px] leading-none font-black text-[#0878e8]">
                                {patient.name}
                            </h2>
                            <p className="mt-4 max-w-sm text-[15px] leading-[1.8] text-[#808999] italic">
                                Profil pasien untuk identitas klinis, kontak,
                                dan akses cepat ke riwayat pemeriksaan.
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] px-5 text-xs font-black tracking-wider text-white uppercase shadow-[0_12px_28px_rgba(8,120,232,0.22)] transition-all hover:scale-[1.02] active:scale-95"
                                    href={patients.history(patient.nik)}
                                    prefetch
                                    title="Riwayat pemeriksaan"
                                >
                                    <FileClock size={16} />
                                    Riwayat Pemeriksaan
                                </Link>

                                {permissions.update && (
                                    <Link
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] border border-white/70 bg-white/45 px-5 text-xs font-black tracking-wider text-[#1599F5] uppercase shadow-sm backdrop-blur-md transition hover:bg-white/65"
                                        href={patients.edit(patient.nik)}
                                        prefetch
                                    >
                                        <Pencil size={16} />
                                        Edit
                                    </Link>
                                )}
                            </div>
                        </div>
                    </aside>

                    <section className="rounded-[30px] border border-white/70 bg-white/35 p-6 shadow-[0_24px_55px_rgba(19,184,255,0.1)] backdrop-blur-md">
                        <div className="grid gap-4 md:grid-cols-2">
                            <InfoCard icon={IdCard} label="NIK">
                                {patient.nik}
                            </InfoCard>
                            <InfoCard icon={User} label="Gender">
                                {genderLabel}
                            </InfoCard>
                            <InfoCard icon={CalendarDays} label="Tanggal Lahir">
                                {formatDate(patient.birth_date)} / {patient.age}{' '}
                                tahun
                            </InfoCard>
                            <InfoCard icon={MapPin} label="Tempat Lahir">
                                {patient.birth_place ?? '-'}
                            </InfoCard>
                            <InfoCard icon={Mail} label="Email">
                                {patient.email ?? '-'}
                            </InfoCard>
                            <InfoCard icon={Phone} label="Telepon">
                                {patient.phone ?? '-'}
                            </InfoCard>
                            <InfoCard icon={Users} label="Terdaftar">
                                {formatDate(patient.created_at)}
                            </InfoCard>
                        </div>

                        <div className="mt-5 rounded-[24px] border border-white/70 bg-white/40 p-5 shadow-sm backdrop-blur-md">
                            <div className="flex items-center gap-2">
                                <MapPin size={16} />
                                <p className="text-[11px] font-black tracking-[0.28em] text-[#9ea6b6] uppercase">
                                    Alamat
                                </p>
                            </div>
                            <p className="mt-4 text-[15px] leading-[1.9] text-[#808999] italic">
                                {patient.address ??
                                    'Alamat pasien belum diisi.'}
                            </p>
                        </div>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <Link
                                className="inline-flex h-12 items-center justify-center rounded-[14px] border border-white/70 bg-white/45 px-5 text-xs font-black tracking-wider text-[#7B8BA7] uppercase shadow-sm backdrop-blur-md transition hover:bg-white/65"
                                href={patients.index()}
                                prefetch
                            >
                                Kembali
                            </Link>
                        </div>
                    </section>
                </section>
            </div>
        </>
    );
}

function InfoCard({
    children,
    icon: Icon,
    label,
}: {
    children: ReactNode;
    icon: ComponentType<{ size?: number }>;
    label: string;
}) {
    return (
        <article className="rounded-[22px] border border-white/70 bg-white/40 p-5 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2">
                <Icon size={16} />
                <p className="text-[11px] font-black tracking-[0.28em] text-[#9ea6b6] uppercase">
                    {label}
                </p>
            </div>
            <p className="mt-4 text-sm font-semibold text-[#22304F]">
                {children}
            </p>
        </article>
    );
}

PatientsShow.layout = ({ patient }: PatientsShowProps) => ({
    breadcrumbs: [
        {
            title: 'Pasien',
            href: patients.index(),
        },
        {
            title: 'Detail Pasien',
            href: patients.show(patient.nik),
        },
    ],
});
