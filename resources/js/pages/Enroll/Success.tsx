import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Success() {
    return (
        <>
            <Head title="Application Submitted" />
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#fff8f0] to-white px-4">
                <div className="w-full max-w-md rounded-2xl border border-[#800000]/10 bg-white p-8 text-center shadow-lg">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#800000]/10 text-[#800000]">
                        <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Application Submitted</h1>
                    <p className="mt-3 text-sm leading-relaxed text-slate-500">
                        Your online enrollment form has been sent to the Registrar. Please wait for further instructions via your contact number or Facebook account.
                    </p>
                    <div className="mt-8 flex flex-col gap-3">
                        <Button asChild className="h-11 rounded-xl bg-[#800000] font-bold hover:bg-[#5d0000]">
                            <Link href="/login">
                                <LogIn className="mr-2 h-4 w-4" /> Go to Login
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-11 rounded-xl">
                            <Link href="/enroll">Submit Another Application</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
