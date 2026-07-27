import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import { login } from '@/routes';
import {
    ArrowRight,
    Award,
    BookOpenCheck,
    GraduationCap,
    LogIn,
    ShieldCheck,
    Sparkles,
    Users,
} from 'lucide-react';

const features = [
    {
        icon: BookOpenCheck,
        title: 'Language & Technological Programs',
        description: 'Industry-aligned curricula that blend language proficiency with practical technological training.',
    },
    {
        icon: Users,
        title: 'Experienced Faculty',
        description: 'Dedicated mentors committed to guiding every learner toward academic and professional excellence.',
    },
    {
        icon: ShieldCheck,
        title: 'Trusted Academic Records',
        description: 'A secure digital portal for enrollment, grades, attendance, and school communications.',
    },
    {
        icon: Award,
        title: 'Recognized Excellence',
        description: 'Building disciplined, globally competitive graduates ready for the modern workforce.',
    },
];

export default function Welcome() {
    const { props } = usePage();
    const { branding } = props as any;
    const appName = branding?.app_name || 'DILTrack';

    return (
        <PublicLayout>
            <Head title="Welcome" />

            {/* Hero */}
            <section className="relative overflow-hidden bg-[#5d0000]">
                <img
                    alt="DILTC students"
                    className="absolute inset-0 h-full w-full object-cover opacity-70"
                    src="/images/diltc/hero-banner.png"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#800000]/95 via-[#800000]/85 to-[#FFD700]/10" />

                <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center text-white sm:py-32">
                    <div className="mb-8 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-2 shadow-xl backdrop-blur-sm">
                        <img src="/images/diltc/crest.png" alt={`${appName} crest`} className="h-full w-full object-contain" />
                    </div>

                    <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#FFD700] px-5 py-2 text-xs font-bold tracking-wider text-black shadow-lg">
                        <Sparkles className="h-4 w-4" />
                        WELCOME TO {appName.toUpperCase()}
                    </div>

                    <h1 className="mb-6 text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl">
                        Empowering futures at{' '}
                        <span className="text-[#FFD700] italic">DILTC.</span>
                    </h1>
                    <p className="mb-10 max-w-2xl text-lg leading-relaxed text-white/85">
                        The official academic management portal of the Davao del Sur Institute of Languages and
                        Technological College Inc. &mdash; empowering global citizens through excellence in
                        language and technological training.
                    </p>

                    <div className="flex flex-col gap-4 sm:flex-row">
                        <Link
                            href="/enroll"
                            className="group inline-flex items-center justify-center gap-3 rounded-xl bg-[#FFD700] px-8 py-4 text-base font-bold text-[#5d0000] shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white"
                        >
                            Enroll Online Now
                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link
                            href={login()}
                            className="inline-flex items-center justify-center gap-3 rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
                        >
                            <LogIn className="h-5 w-5" />
                            Sign In to Portal
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
                <div className="mx-auto mb-14 max-w-2xl text-center">
                    <span className="text-xs font-bold tracking-widest text-[#800000] uppercase dark:text-[#FFD700]">
                        Why choose DILTC
                    </span>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
                        Excellence in every step of your journey
                    </h2>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="group relative overflow-hidden rounded-2xl border border-[#800000]/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#800000]/25 hover:shadow-xl hover:shadow-[#800000]/10 dark:border-[#FFD700]/10 dark:bg-zinc-900"
                        >
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#800000] to-[#FFD700]" />
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#800000] to-[#5d0000] text-[#FFD700] shadow-md shadow-[#800000]/25">
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-base font-semibold text-zinc-900 dark:text-white">
                                {feature.title}
                            </h3>
                            <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="border-t border-[#800000]/10 bg-[#fdf9f2] dark:border-[#FFD700]/10 dark:bg-zinc-900">
                <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-16 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#800000]/10 text-[#800000] dark:bg-[#FFD700]/10 dark:text-[#FFD700]">
                        <GraduationCap className="h-7 w-7" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
                        Ready to begin your future at DILTC?
                    </h2>
                    <p className="max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                        Submit your online enrollment application today and our Registrar's Office will guide you
                        through the rest of the process.
                    </p>
                    <Link
                        href="/enroll"
                        className="group inline-flex items-center justify-center gap-3 rounded-xl bg-[#800000] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[#800000]/25 transition-all duration-300 hover:bg-[#5d0000]"
                    >
                        Start Your Application
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </section>
        </PublicLayout>
    );
}
