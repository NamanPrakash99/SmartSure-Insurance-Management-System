import { HiOutlineShieldCheck, HiOutlineLockClosed, HiOutlineScale, HiOutlineSupport } from 'react-icons/hi'

export default function Terms() {
  return (
    <div className="space-y-20 py-10">
      {/* Hero Section */}
      <section className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black text-surface-900 dark:text-white tracking-tight">
          Terms & <span className="gradient-text">Privacy</span>
        </h1>
        <p className="text-lg text-surface-500 font-medium leading-relaxed">
          The fine print, made easy to read. Your trust is our foundation.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { icon: HiOutlineShieldCheck, title: "Your Data", desc: "We never sell your personal information." },
          { icon: HiOutlineLockClosed, title: "Security", desc: "Multi-layered encryption for all data." },
          { icon: HiOutlineScale, title: "Clarity", desc: "No hidden clauses or confusing jargon." },
          { icon: HiOutlineSupport, title: "Support", desc: "Always here if something isn't clear." },
        ].map((item, idx) => (
          <div key={idx} className="card p-6 group hover:bg-surface-50 dark:hover:bg-surface-800 transition-all duration-300">
            <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-500 mb-4 group-hover:scale-110 transition-transform">
              <item.icon className="text-2xl" />
            </div>
            <h3 className="text-base font-bold text-surface-900 dark:text-white mb-2">{item.title}</h3>
            <p className="text-surface-500 text-xs leading-relaxed font-medium">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="card p-8 md:p-16 space-y-12 shadow-2xl">
        <section className="space-y-4 max-w-3xl">
          <h2 className="text-2xl font-black text-surface-900 dark:text-white">1. Use of Service</h2>
          <p className="text-surface-500 leading-relaxed font-medium">
            By using SmartSure, you agree to provide accurate information and follow our community guidelines. We reserve the right to suspend accounts that violate these terms or engage in fraudulent activity.
          </p>
        </section>

        <section className="space-y-4 max-w-3xl">
          <h2 className="text-2xl font-black text-surface-900 dark:text-white">2. Privacy & Data Protection</h2>
          <p className="text-surface-500 leading-relaxed font-medium">
            Your privacy is paramount. We use industry-standard encryption to protect your data. We only collect information necessary to provide and improve our services.
          </p>
        </section>

        <section className="space-y-4 max-w-3xl">
          <h2 className="text-2xl font-black text-surface-900 dark:text-white">3. Claims & Payments</h2>
          <p className="text-surface-500 leading-relaxed font-medium">
            All insurance claims are subject to the specific terms of your policy. Payments are processed securely via our trusted payment gateway partners.
          </p>
        </section>

        <div className="pt-10 border-t border-surface-100 dark:border-surface-800 text-center">
          <p className="text-xs text-surface-400 font-bold uppercase tracking-[4px]">
            Last Updated: April 2026
          </p>
        </div>
      </div>
    </div>
  )
}
