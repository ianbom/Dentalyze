import { Form, Head, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Database,
    KeyRound,
    Mail,
    Save,
    ShieldCheck,
    UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import PatientFooter from '@/components/patient-footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';

const roleLabels: Record<string, string> = {
    admin: 'Administrator',
    dokter: 'Dokter',
    radiografer: 'Radiografer',
    pasien: 'Pasien',
};

type ProfileItem = {
    label: string;
    value: unknown;
};

type ProfileData = {
    account: ProfileItem[];
    relatedTitle: string;
    related: ProfileItem[];
};

function formatValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
        return '-';
    }

    if (typeof value === 'boolean') {
        return value ? 'Ya' : 'Tidak';
    }

    if (typeof value === 'object') {
        return JSON.stringify(value);
    }

    return String(value);
}

export default function Profile({
    mustVerifyEmail,
    profileData,
    status,
}: {
    mustVerifyEmail: boolean;
    profileData: ProfileData;
    status?: string;
}) {
    const { auth } = usePage().props;
    const user = auth.user;
    const role = String(user.role ?? 'user');
    const accountItems = profileData.account.map((item) =>
        item.label === 'Role'
            ? { ...item, value: roleLabels[role] ?? item.value }
            : item,
    );
    const profileItems = [...accountItems, ...profileData.related];

    return (
        <>
            <Head title="My Profile" />

            <div className="relative px-12 py-8 lg:px-20">
                <div className="relative z-10 space-y-7">
                    <section className="relative min-h-[250px] overflow-hidden rounded-[34px] border border-white/70 bg-white/35 p-8 text-[#22304F] shadow-[0_24px_55px_rgba(19,184,255,0.1)] backdrop-blur-md lg:p-10">
                        <div className="absolute -top-24 -left-24 h-[320px] w-[320px] rounded-full bg-white/16 blur-[100px]" />
                        <div className="absolute right-[-90px] bottom-[-130px] h-[340px] w-[340px] rounded-full bg-[#49ddd7]/20 blur-[110px]" />
                        <img
                            alt=""
                            className="pointer-events-none absolute right-[-42px] bottom-[-96px] w-[350px] opacity-[0.18] sm:right-[-12px] lg:right-10 lg:bottom-[-112px] lg:w-[440px]"
                            src="/asset/images/gigi.png"
                        />
                        <div className="relative z-10">
                            <p className="text-[11px] font-black tracking-[0.34em] text-[#49ddd7] uppercase">
                                MY PROFILE
                            </p>
                            <h1 className="mt-4 max-w-3xl bg-gradient-to-r from-[#13b8ff] to-[#0878e8] bg-clip-text text-[42px] leading-tight font-black tracking-[-0.04em] text-transparent">
                                {user.name}
                            </h1>
                            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#808999]">
                                Semua data akun dan data terkait user ini
                                ditampilkan dalam satu halaman profile.
                            </p>
                        </div>
                    </section>

                    <section className="rounded-[30px] border border-white/70 bg-white/35 p-7 shadow-[0_18px_45px_rgba(19,184,255,0.08)] backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <span className="grid size-12 place-items-center rounded-[16px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] text-white shadow-[0_12px_28px_rgba(8,120,232,0.22)]">
                                <Database size={20} />
                            </span>
                            <div>
                                <p className="text-[11px] font-black tracking-[0.3em] text-[#49ddd7] uppercase">
                                    Data User
                                </p>
                                <h2 className="mt-1 text-[26px] font-black text-[#132f67]">
                                    Informasi Profile
                                </h2>
                            </div>
                        </div>

                        <ProfileForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />

                        <PasswordForm />

                        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {profileItems.map((item) => (
                                <div
                                    key={item.label}
                                    className="min-w-0 rounded-[18px] border border-white/70 bg-white/45 px-4 py-3 shadow-[0_12px_30px_rgba(19,184,255,0.06)] backdrop-blur-md"
                                >
                                    <p className="text-[10px] font-black tracking-[0.2em] text-[#9ea6b6] uppercase">
                                        {item.label}
                                    </p>
                                    <p className="mt-2 text-sm font-black break-words text-[#22304F]">
                                        {formatValue(item.value)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                    {role === 'pasien' && <PatientFooter className="mt-10" />}
                </div>
            </div>
        </>
    );
}

function ProfileForm({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <Form
            {...ProfileController.update.form()}
            options={{
                preserveScroll: true,
            }}
            className="mt-7 space-y-5 rounded-[24px] border border-white/70 bg-white/45 p-5 shadow-[0_14px_35px_rgba(19,184,255,0.06)] backdrop-blur-md"
        >
            {({ processing, errors, recentlySuccessful }) => (
                <>
                    <div className="grid gap-5 md:grid-cols-3">
                        <Field
                            error={errors.name}
                            icon={UserRound}
                            label="Nama"
                        >
                            <Input
                                id="name"
                                name="name"
                                autoComplete="name"
                                className="h-12 rounded-[16px] border-white/80 bg-white/60 px-4 text-[#22304F] shadow-sm"
                                defaultValue={user.name}
                                required
                            />
                        </Field>
                        <Field
                            error={errors.email}
                            icon={Mail}
                            label="Email Login"
                        >
                            <Input
                                id="email"
                                type="email"
                                className="h-12 rounded-[16px] border-white/80 bg-white/60 px-4 text-[#22304F] shadow-sm"
                                defaultValue={
                                    typeof user.email === 'string'
                                        ? user.email
                                        : ''
                                }
                                name="email"
                                required
                                autoComplete="username"
                                placeholder="email@example.com"
                            />
                        </Field>
                    </div>

                    {mustVerifyEmail && user.email_verified_at === null && (
                        <div className="rounded-[18px] border border-amber-200/80 bg-amber-50/80 p-4 text-sm leading-6 text-amber-700">
                            Email Anda belum terverifikasi.{' '}
                            <Form {...send.form()} className="mt-3">
                                {({ processing }) => (
                                    <button
                                        className="font-black underline underline-offset-4 disabled:opacity-60"
                                        disabled={processing}
                                        type="submit"
                                    >
                                        {processing
                                            ? 'Mengirim email verifikasi...'
                                            : 'Kirim ulang email verifikasi.'}
                                    </button>
                                )}
                            </Form>
                            {status === 'verification-link-sent' && (
                                <div className="mt-2 font-black text-emerald-600">
                                    Link verifikasi baru sudah dikirim.
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 pt-1">
                        <button
                            disabled={processing}
                            data-test="update-profile-button"
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[linear-gradient(135deg,#13b8ff_0%,#0878e8_100%)] px-6 text-xs font-black tracking-[0.14em] text-white uppercase shadow-[0_12px_28px_rgba(24,121,230,0.25)] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
                            type="submit"
                        >
                            <Save size={16} />
                            Simpan Profile
                        </button>

                        {recentlySuccessful && (
                            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-black text-emerald-600">
                                <CheckCircle2 size={15} />
                                Tersimpan
                            </span>
                        )}
                    </div>
                </>
            )}
        </Form>
    );
}

function PasswordForm() {
    const { auth } = usePage().props;
    const user = auth.user;
    const hasEmail = Boolean(user.email);

    if (!hasEmail) {
        return (
            <div className="mt-5 rounded-[22px] border border-[#bdefff] bg-white/45 p-5 text-sm leading-7 text-[#687892] shadow-[0_14px_35px_rgba(19,184,255,0.06)] backdrop-blur-md">
                Simpan email aktif terlebih dahulu agar akun ini bisa memakai
                fitur ganti password dan lupa password lewat email.
            </div>
        );
    }

    return (
        <Form
            {...SecurityController.update.form()}
            options={{
                preserveScroll: true,
            }}
            resetOnError={[
                'password',
                'password_confirmation',
                'current_password',
            ]}
            resetOnSuccess
            className="mt-5 space-y-5 rounded-[24px] border border-white/70 bg-white/45 p-5 shadow-[0_14px_35px_rgba(19,184,255,0.06)] backdrop-blur-md"
        >
            {({ processing, errors, recentlySuccessful }) => (
                <>
                    <div className="flex items-center gap-3">
                        <span className="grid size-11 place-items-center rounded-[16px] bg-[#E4FAFF] text-[#0878e8]">
                            <ShieldCheck size={18} />
                        </span>
                        <div>
                            <p className="text-[11px] font-black tracking-[0.25em] text-[#49ddd7] uppercase">
                                Keamanan Akun
                            </p>
                            <h3 className="text-lg font-black text-[#132f67]">
                                Ubah Password
                            </h3>
                        </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-3">
                        <Field
                            error={errors.current_password}
                            icon={KeyRound}
                            label="Password Saat Ini"
                        >
                            <PasswordInput
                                id="current_password"
                                name="current_password"
                                className="h-12 rounded-[16px] border-white/80 bg-white/60 px-4 text-[#22304F] shadow-sm"
                                autoComplete="current-password"
                                placeholder="Password saat ini"
                            />
                        </Field>

                        <Field
                            error={errors.password}
                            icon={KeyRound}
                            label="Password Baru"
                        >
                            <PasswordInput
                                id="password"
                                name="password"
                                className="h-12 rounded-[16px] border-white/80 bg-white/60 px-4 text-[#22304F] shadow-sm"
                                autoComplete="new-password"
                                placeholder="Password baru"
                            />
                        </Field>

                        <Field
                            error={errors.password_confirmation}
                            icon={KeyRound}
                            label="Konfirmasi"
                        >
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                className="h-12 rounded-[16px] border-white/80 bg-white/60 px-4 text-[#22304F] shadow-sm"
                                autoComplete="new-password"
                                placeholder="Ulangi password baru"
                            />
                        </Field>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-1">
                        <button
                            disabled={processing}
                            data-test="update-password-button"
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[linear-gradient(135deg,#49ddd7_0%,#0878e8_100%)] px-6 text-xs font-black tracking-[0.14em] text-white uppercase shadow-[0_12px_28px_rgba(24,121,230,0.25)] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
                            type="submit"
                        >
                            <KeyRound size={16} />
                            Simpan Password
                        </button>

                        {recentlySuccessful && (
                            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-black text-emerald-600">
                                <CheckCircle2 size={15} />
                                Password tersimpan
                            </span>
                        )}
                    </div>
                </>
            )}
        </Form>
    );
}

function Field({
    children,
    error,
    icon: Icon,
    label,
}: {
    children: React.ReactNode;
    error?: string;
    icon: LucideIcon;
    label: string;
}) {
    return (
        <div className="grid gap-2">
            <Label
                htmlFor={label.toLowerCase()}
                className="flex items-center gap-2 text-[11px] font-black tracking-[0.22em] text-[#9ea6b6] uppercase"
            >
                <Icon size={15} />
                {label}
            </Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'My Profile',
            href: edit(),
        },
    ],
};
