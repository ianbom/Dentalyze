import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const [loginType, setLoginType] = useState<'petugas' | 'pasien'>('petugas');

    return (
        <>
            <Head title="Login - Dentalyze AI" />

            {/* Header */}
            <div className="mb-8">
                <div className="inline-flex rounded-full border border-[#49ddd7]/20 bg-[#49ddd7]/10 px-4 py-2 text-[11px] font-black tracking-[0.3em] text-[#49ddd7] uppercase">
                    Secure Access
                </div>

                <h2 className="mt-5 text-5xl font-black tracking-tight text-[#55b8ff]">
                    LOGIN
                </h2>

                <p className="mt-4 text-[15px] leading-7 text-[#7f8da3]">
                    Masuk ke sistem Dentalyze untuk melakukan analisis
                    radiografi dan verifikasi laporan klinis.
                </p>
            </div>

            {/* Switcher */}
            <div className="mb-8 flex rounded-[20px] border border-[#d8eefc] bg-[#f7fbff] p-1.5">
                <button
                    type="button"
                    onClick={() => setLoginType('petugas')}
                    className={`flex-1 rounded-[16px] py-3 text-sm font-black transition-all duration-300 ${
                        loginType === 'petugas'
                            ? 'bg-gradient-to-r from-[#13b8ff] to-[#0878e8] text-white shadow-[0_12px_30px_rgba(19,184,255,0.24)]'
                            : 'text-[#8c9db4] hover:text-[#1aa0ff]'
                    }`}
                >
                    Petugas
                </button>

                <button
                    type="button"
                    onClick={() => setLoginType('pasien')}
                    className={`flex-1 rounded-[16px] py-3 text-sm font-black transition-all duration-300 ${
                        loginType === 'pasien'
                            ? 'bg-gradient-to-r from-[#13b8ff] to-[#0878e8] text-white shadow-[0_12px_30px_rgba(19,184,255,0.24)]'
                            : 'text-[#8c9db4] hover:text-[#1aa0ff]'
                    }`}
                >
                    Pasien
                </button>
            </div>

            {/* Form */}
            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="space-y-6"
            >
                {({ processing, errors }) => (
                    <>
                        {/* Email/NIK */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="text-[13px] font-bold tracking-[0.18em] text-[#6b7b93] uppercase"
                            >
                                {loginType === 'petugas'
                                    ? 'Email'
                                    : 'Email / NIK'}
                            </Label>

                            <Input
                                id="email"
                                type={
                                    loginType === 'petugas' ? 'email' : 'text'
                                }
                                name="email"
                                required
                                autoFocus
                                tabIndex={1}
                                placeholder={
                                    loginType === 'petugas'
                                        ? 'admin@dentalyze.id'
                                        : 'Masukkan email atau NIK'
                                }
                                className="h-14 rounded-[18px] border border-[#cde7ff] bg-white px-5 text-[15px] font-semibold text-[#44516b] shadow-[0_12px_30px_rgba(19,184,255,0.08)] transition-all duration-300 placeholder:text-[#9aa8bd] focus:border-[#49ddd7] focus:shadow-[0_18px_40px_rgba(19,184,255,0.18)] focus-visible:ring-0"
                            />

                            <InputError message={errors.email} />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <Label
                                    htmlFor="password"
                                    className="text-[13px] font-bold tracking-[0.18em] text-[#6b7b93] uppercase"
                                >
                                    Password
                                </Label>

                                {canResetPassword && (
                                    <TextLink
                                        href={request()}
                                        className="ml-auto text-sm font-black text-[#1aa0ff] transition hover:text-[#0878e8]"
                                    >
                                        Lupa Password?
                                    </TextLink>
                                )}
                            </div>

                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                placeholder="••••••••"
                                className="h-14 rounded-[18px] border border-[#cfe9ff] bg-white px-5 text-[15px] font-medium text-[#3b4a68] shadow-[0_10px_30px_rgba(19,184,255,0.12)] transition-all duration-300 placeholder:text-[#9aa8bd] focus:border-[#49ddd7] focus:shadow-[0_18px_40px_rgba(19,184,255,0.22)] focus-visible:ring-0"
                            />

                            <InputError message={errors.password} />
                        </div>

                        {/* Remember */}
                        <div className="flex items-center gap-3 pt-1">
                            <Checkbox
                                id="remember"
                                name="remember"
                                className="border-2 border-[#b8dfff] shadow-[0_4px_14px_rgba(19,184,255,0.08)] data-[state=checked]:border-[#13b8ff] data-[state=checked]:bg-[#13b8ff] data-[state=checked]:text-white"
                            />

                            <Label
                                htmlFor="remember"
                                className="text-[14px] font-medium text-[#6d7b92]"
                            >
                                Keep me logged in
                            </Label>
                        </div>

                        {/* Button */}
                        <Button
                            type="submit"
                            disabled={processing}
                            className="mt-4 h-14 w-full rounded-[18px] bg-gradient-to-r from-[#2bbcff] to-[#147df0] text-sm font-black tracking-[0.22em] text-white uppercase shadow-[0_16px_35px_rgba(19,184,255,0.24)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_22px_45px_rgba(19,184,255,0.34)] active:scale-[0.98]"
                        >
                            {processing && <Spinner />}
                            Log in
                        </Button>

                        {/* Register
                        {canRegister &&
                            loginType ===
                                'pasien' && (
                                <div className="pt-2 text-center text-sm text-[#7f8da3]">
                                    Don't have an
                                    account?{' '}
                                    <TextLink
                                        href={register()}
                                        className="font-semibold text-[#1aa0ff]"
                                    >
                                        Sign up here
                                    </TextLink>
                                </div>
                            )} */}
                    </>
                )}
            </Form>

            {/* Status */}
            {status && (
                <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}
