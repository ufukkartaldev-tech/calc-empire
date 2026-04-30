import { getTranslations } from 'next-intl/server';
import { RegisterForm } from '@/components/auth/RegisterForm';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Auth' });
  return {
    title: t('registerTitle'),
    description: t('registerDescription'),
  };
}

export default async function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-500">
        {/* Right Side: Welcome Graphic (Reversed for Register) */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-bl from-emerald-600 via-teal-600 to-cyan-700 text-white relative overflow-hidden order-2">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-8 border border-white/30 shadow-xl">
              <span className="text-white text-xl font-black">CE</span>
            </div>
            <h1 className="text-4xl font-black mb-4 leading-tight">
              Start Your
              <br />
              Journey
            </h1>
            <p className="text-teal-100 text-lg max-w-sm">
              Join thousands of engineers and professionals saving time with our advanced tools.
            </p>
          </div>

          <div className="relative z-10">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
              <p className="italic text-teal-50">
                &quot;CalcEmpire has completely streamlined my daily technical calculations and unit
                conversions.&quot;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-300 rounded-full border-2 border-white/50"></div>
                <div>
                  <p className="font-bold text-sm">Tech Analyst</p>
                  <p className="text-xs text-cyan-200">Verified Member</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Left Side: Form */}
        <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center relative order-1">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
