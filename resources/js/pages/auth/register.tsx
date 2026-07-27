import { Form, Head, Link } from '@inertiajs/react';
import { Lock, Mail, User, UserPlus } from 'lucide-react';

import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
    registrationEnabled?: boolean;
};

const fieldClass =
    'h-12 rounded-xl border-slate-200 bg-slate-50/50 pl-11 text-sm transition-all focus:border-[#800000] focus:bg-white focus:ring-4 focus:ring-[#800000]/5';

export default function Register({
    passwordRules,
    registrationEnabled = true,
}: Props) {
    if (!registrationEnabled) {
        return (
            <>
                <Head title="Registration Disabled" />
                <div className="space-y-6 text-center">
                    <p className="text-sm text-slate-500">
                        New user registration is currently disabled by the administrator.
                    </p>
                    <Button asChild className="h-12 w-full rounded-xl bg-[#800000] font-bold hover:bg-[#5d0000]">
                        <Link href={login()}>Back to Log in</Link>
                    </Button>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="space-y-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="name"
                                    className="text-[11px] font-bold tracking-widest text-slate-500 uppercase"
                                >
                                    Full Name
                                </Label>
                                <div className="relative">
                                    <User className="absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        name="name"
                                        placeholder="Juan Dela Cruz"
                                        className={fieldClass}
                                    />
                                </div>
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="text-[11px] font-bold tracking-widest text-slate-500 uppercase"
                                >
                                    Institutional Email
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        name="email"
                                        placeholder="username@diltc.edu.ph"
                                        className={fieldClass}
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="password"
                                    className="text-[11px] font-bold tracking-widest text-slate-500 uppercase"
                                >
                                    Security Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute top-1/2 left-4 z-10 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                                    <PasswordInput
                                        id="password"
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Create a strong password"
                                        passwordrules={passwordRules}
                                        className={`${fieldClass} pr-12`}
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="text-[11px] font-bold tracking-widest text-slate-500 uppercase"
                                >
                                    Confirm Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute top-1/2 left-4 z-10 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                                    <PasswordInput
                                        id="password_confirmation"
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Re-enter your password"
                                        passwordrules={passwordRules}
                                        className={`${fieldClass} pr-12`}
                                    />
                                </div>
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-12 w-full rounded-xl bg-[#800000] text-base font-bold text-white shadow-lg shadow-[#800000]/20 transition-all hover:bg-[#5d0000] active:scale-[0.98]"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing ? (
                                    <Spinner className="mr-2" />
                                ) : (
                                    <UserPlus className="mr-2 h-4 w-4" />
                                )}
                                Create Account
                            </Button>
                        </div>

                        <div className="text-center text-sm text-slate-500">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={6} className="font-bold text-[#800000] hover:text-[#5d0000]">
                                Sign in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Create your account',
    description: 'Enter your details below to register for the portal.',
};
