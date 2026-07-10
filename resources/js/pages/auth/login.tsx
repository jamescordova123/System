import { Form, Head } from '@inertiajs/react';
import { Mail, Lock } from 'lucide-react';
import React from 'react';

import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Log in" />

            <PasskeyVerify />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            {/* Email Address */}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                                >
                                    Email address
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground/75" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="email@example.com"
                                        className="h-11 rounded-xl border-border/80 bg-background/50 pl-10 transition-all duration-200 hover:bg-background/80 focus:bg-background"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                                    >
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground/75" />
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        className="h-11 rounded-xl border-border/80 bg-background/50 pl-10 transition-all duration-200 hover:bg-background/80 focus:bg-background"
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center space-x-3 py-1">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="rounded border-border/90 data-[state=checked]:bg-indigo-600"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="cursor-pointer text-sm leading-none font-medium text-foreground/80 select-none"
                                >
                                    Remember me
                                </Label>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="mt-2 h-11 w-full cursor-pointer rounded-xl bg-indigo-600 font-semibold text-white shadow-md transition-all duration-200 hover:bg-indigo-500 hover:shadow-indigo-500/25 active:scale-[0.98]"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner className="mr-2" />}
                                Log in
                            </Button>
                        </div>

                        {/* Sign Up Link */}
                        <div className="mt-2 text-center text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <TextLink
                                href={register()}
                                tabIndex={5}
                                className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                            >
                                Sign up
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Log in to your account',
    description: 'Enter your email and password below to log in',
};
