import { Link, useForm } from '@inertiajs/react';
import {
    Building2,
    CalendarDays,
    IdCard,
    Mail,
    MapPin,
    Phone,
    Save,
    User,
} from 'lucide-react';
import type { ComponentType, FormEvent, ReactNode } from 'react';
import ThemedDateInput from '@/components/themed-date-input';
import patients from '@/routes/patients';

export type PatientFormPatient = {
    nik: string;
    name: string;
    email: string | null;
    phone: string | null;
    birth_place: string | null;
    birth_date: string | null;
    age: number;
    gender: 'male' | 'female';
    address: string | null;
    faskes_id: number | null;
    faskes_name?: string | null;
};

type PatientFormData = {
    nik: string;
    name: string;
    email: string;
    phone: string;
    birth_place: string;
    birth_date: string;
    age: string;
    gender: 'male' | 'female';
    address: string;
    faskes_id: string;
};

type PatientFormProps = {
    mode: 'create' | 'edit';
    patient?: PatientFormPatient;
    faskesOptions?: { id: number; name: string }[];
};

const inputClass =
    'h-12 w-full rounded-[14px] border border-white/70 bg-white/45 px-4 text-sm text-[#22304F] shadow-sm outline-none backdrop-blur-md transition placeholder:text-[#9BA8BC] focus:border-[#13b8ff] focus:bg-white/65 focus:shadow-[0_12px_28px_rgba(8,120,232,0.12)]';

const labelClass =
    'text-[11px] font-black uppercase tracking-[0.24em] text-[#9ea6b6]';

export default function PatientForm({
    faskesOptions = [],
    mode,
    patient,
}: PatientFormProps) {
    const isEdit = mode === 'edit';

    const { data, setData, post, processing, errors, transform } =
        useForm<PatientFormData>({
            nik: patient?.nik ?? '',
            name: patient?.name ?? '',
            email: patient?.email ?? '',
            phone: patient?.phone ?? '',
            birth_place: patient?.birth_place ?? '',
            birth_date: patient?.birth_date ?? '',
            age: patient ? String(patient.age) : '',
            gender: patient?.gender ?? 'male',
            address: patient?.address ?? '',
            faskes_id: patient?.faskes_id ? String(patient.faskes_id) : '',
        });

    function calculateAge(birthDate: string) {
        if (!birthDate) {
            return '';
        }

        const today = new Date();
        const born = new Date(birthDate);

        if (Number.isNaN(born.getTime()) || born > today) {
            return '';
        }

        let age = today.getFullYear() - born.getFullYear();
        const monthDiff = today.getMonth() - born.getMonth();
        const hasBirthdayPassed =
            monthDiff > 0 ||
            (monthDiff === 0 && today.getDate() >= born.getDate());

        if (!hasBirthdayPassed) {
            age -= 1;
        }

        return String(Math.max(age, 0));
    }

    function updateBirthDate(value: string) {
        setData((current) => ({
            ...current,
            age: calculateAge(value),
            birth_date: value,
        }));
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isEdit && patient) {
            transform((formData) => ({
                ...formData,
                _method: 'PUT',
            }));
            post(patients.update.url(patient.nik));

            return;
        }

        transform((formData) => formData);
        post(patients.store.url());
    }

    return (
        <form className="space-y-6" onSubmit={submit}>
            <section className="group relative overflow-hidden rounded-[30px] border border-white/70 bg-white/35 p-6 shadow-[0_24px_55px_rgba(19,184,255,0.1)] backdrop-blur-md">
                <img
                    alt=""
                    className="pointer-events-none absolute -right-28 -bottom-32 w-80 opacity-[0.06] transition duration-500 group-hover:scale-110 group-hover:opacity-[0.1]"
                    src="/asset/images/gigi.png"
                />
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div>
                        <p className="text-[11px] font-black tracking-[0.42em] text-[#49ddd7] uppercase">
                            {isEdit ? 'EDIT PASIEN' : 'TAMBAH PASIEN'}
                        </p>
                        <h2 className="mt-2 text-[32px] leading-none font-black text-[#0878e8] uppercase">
                            {isEdit ? 'Perbarui Data' : 'Data Pasien Baru'}
                        </h2>
                        <p className="mt-4 max-w-2xl text-[15px] leading-[1.8] text-[#808999] italic">
                            Simpan identitas pasien dengan data yang rapi agar
                            riwayat pemeriksaan mudah ditemukan kembali.
                        </p>
                    </div>

                    <div className="rounded-[24px] bg-[linear-gradient(135deg,#20b9ff_0%,#0878e8_100%)] p-5 text-white shadow-[0_24px_55px_rgba(8,120,232,0.22)]">
                        <p className="text-[11px] font-black tracking-[0.28em] text-white/75 uppercase">
                            Login Pasien
                        </p>
                        <p className="mt-3 text-sm leading-7 text-white/85">
                            NIK digunakan sebagai identitas pasien. Untuk data
                            baru, password awal mengikuti NIK pasien.
                        </p>
                    </div>
                </div>

                <div className="mt-8 grid gap-5 lg:grid-cols-2">
                    {faskesOptions.length > 0 && (
                        <Field
                            className="lg:col-span-2"
                            error={errors.faskes_id}
                            icon={Building2}
                            label="Faskes Asal"
                        >
                            <select
                                className={inputClass}
                                onChange={(event) =>
                                    setData('faskes_id', event.target.value)
                                }
                                value={data.faskes_id}
                            >
                                <option value="">Pilih faskes asal</option>
                                {faskesOptions.map((faskes) => (
                                    <option key={faskes.id} value={faskes.id}>
                                        {faskes.name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    )}

                    <Field error={errors.nik} icon={IdCard} label="NIK">
                        <input
                            className={inputClass}
                            disabled={isEdit}
                            maxLength={16}
                            onChange={(event) =>
                                setData('nik', event.target.value)
                            }
                            placeholder="16 digit NIK"
                            value={data.nik}
                        />
                    </Field>

                    <Field error={errors.name} icon={User} label="Nama">
                        <input
                            className={inputClass}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                            placeholder="Nama lengkap pasien"
                            value={data.name}
                        />
                    </Field>

                    <Field error={errors.email} icon={Mail} label="Email">
                        <input
                            className={inputClass}
                            onChange={(event) =>
                                setData('email', event.target.value)
                            }
                            placeholder="email@contoh.com"
                            type="email"
                            value={data.email}
                        />
                    </Field>

                    <Field error={errors.phone} icon={Phone} label="Telepon">
                        <input
                            className={inputClass}
                            inputMode="numeric"
                            maxLength={12}
                            onChange={(event) =>
                                setData(
                                    'phone',
                                    event.target.value
                                        .replace(/\D/g, '')
                                        .slice(0, 12),
                                )
                            }
                            placeholder="11–12 digit nomor telepon"
                            value={data.phone}
                        />
                    </Field>

                    <Field
                        error={errors.birth_place}
                        icon={MapPin}
                        label="Tempat Lahir"
                    >
                        <input
                            className={inputClass}
                            onChange={(event) =>
                                setData('birth_place', event.target.value)
                            }
                            placeholder="Kota kelahiran"
                            type="text"
                            value={data.birth_place}
                        />
                    </Field>

                    <Field
                        error={errors.birth_date}
                        icon={CalendarDays}
                        label="Tanggal Lahir"
                    >
                        <ThemedDateInput
                            className={inputClass}
                            max={new Date().toISOString().slice(0, 10)}
                            onChange={(event) =>
                                updateBirthDate(event.target.value)
                            }
                            value={data.birth_date}
                        />
                    </Field>

                    <Field error={errors.age} icon={User} label="Usia">
                        <input
                            className={`${inputClass} cursor-not-allowed text-[#7B8BA7]`}
                            min={0}
                            placeholder="Terisi otomatis"
                            readOnly
                            type="number"
                            value={data.age}
                        />
                    </Field>

                    <Field error={errors.gender} icon={User} label="Gender">
                        <div className="grid grid-cols-2 gap-3">
                            {(['male', 'female'] as const).map((gender) => (
                                <button
                                    className={`h-12 rounded-[14px] border text-sm font-black transition ${
                                        data.gender === gender
                                            ? 'border-[#13b8ff] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] text-white shadow-[0_12px_28px_rgba(8,120,232,0.22)]'
                                            : 'border-white/70 bg-white/45 text-[#7B8BA7] shadow-sm backdrop-blur-md hover:bg-white/65'
                                    }`}
                                    key={gender}
                                    onClick={() => setData('gender', gender)}
                                    type="button"
                                >
                                    {gender === 'male'
                                        ? 'Laki-laki'
                                        : 'Perempuan'}
                                </button>
                            ))}
                        </div>
                    </Field>

                    <Field
                        className="lg:col-span-2"
                        error={errors.address}
                        icon={MapPin}
                        label="Alamat"
                    >
                        <textarea
                            className="min-h-32 w-full rounded-[14px] border border-white/70 bg-white/45 px-4 py-3 text-sm text-[#22304F] shadow-sm backdrop-blur-md transition outline-none placeholder:text-[#9BA8BC] focus:border-[#13b8ff] focus:bg-white/65 focus:shadow-[0_12px_28px_rgba(8,120,232,0.12)]"
                            onChange={(event) =>
                                setData('address', event.target.value)
                            }
                            placeholder="Alamat lengkap pasien"
                            value={data.address}
                        />
                    </Field>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Link
                        className="inline-flex h-12 items-center justify-center rounded-[14px] border border-white/70 bg-white/45 px-5 text-xs font-black tracking-wider text-[#7B8BA7] uppercase shadow-sm backdrop-blur-md transition hover:bg-white/65"
                        href={patients.index()}
                        prefetch
                    >
                        Batal
                    </Link>
                    <button
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] px-6 text-xs font-black tracking-wider text-white uppercase shadow-[0_12px_28px_rgba(8,120,232,0.22)] transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={processing}
                        type="submit"
                    >
                        <Save size={16} />
                        {processing ? 'Menyimpan' : 'Simpan Pasien'}
                    </button>
                </div>
            </section>
        </form>
    );
}

function Field({
    children,
    className = '',
    error,
    icon: Icon,
    label,
}: {
    children: ReactNode;
    className?: string;
    error?: string;
    icon: ComponentType<{ className?: string; size?: number }>;
    label: string;
}) {
    return (
        <label className={`space-y-2 ${className}`}>
            <span className="flex items-center gap-2">
                <Icon
                    className={error ? 'text-rose-500' : 'text-[#9ea6b6]'}
                    size={14}
                />
                <span className={labelClass}>{label}</span>
            </span>
            {children}
            {error && (
                <span className="block text-xs font-semibold text-rose-500">
                    {error}
                </span>
            )}
        </label>
    );
}
