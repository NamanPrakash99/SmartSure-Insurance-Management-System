import { HiOutlineUserGroup, HiOutlineLightBulb, HiOutlineBadgeCheck } from 'react-icons/hi'

export default function AboutUs() {
  return (
    <div className="space-y-20 py-10">
      {/* Hero Section */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black text-surface-900 dark:text-white tracking-tight">
          Redefining <span className="gradient-text">Insurance</span>
        </h1>
        <p className="text-lg text-surface-500 font-medium leading-relaxed">
          SmartSure is a leading digital insurance platform dedicated to making coverage accessible, transparent, and intelligent for the modern world.
        </p>
      </section>

      {/* Mission/Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: HiOutlineUserGroup,
            title: "Customer First",
            desc: "We build everything with the user in mind, ensuring a seamless and supportive experience."
          },
          {
            icon: HiOutlineLightBulb,
            title: "Innovation",
            desc: "Leveraging state-of-the-art technology to simplify complex insurance processes."
          },
          {
            icon: HiOutlineBadgeCheck,
            title: "Trust & Security",
            desc: "Your data and dreams are safe with our enterprise-grade security protocols."
          }
        ].map((item, idx) => (
          <div key={idx} className="card p-8 group hover:border-primary-500/50 transition-all duration-300">
            <div className="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-500 mb-6 group-hover:scale-110 transition-transform">
              <item.icon className="text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-3">{item.title}</h3>
            <p className="text-surface-500 text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Detailed Info */}
      <div className="card overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-10 md:p-16 space-y-6">
            <h2 className="text-3xl font-black text-surface-900 dark:text-white">Our Story</h2>
            <p className="text-surface-500 leading-relaxed">
              Founded in 2024, SmartSure emerged from a simple observation: insurance is too complicated. We set out to build a system that speaks your language, works on your schedule, and genuinely protects what matters most.
            </p>
            <p className="text-surface-500 leading-relaxed">
              Today, we serve thousands of customers with a suite of products ranging from health to vehicle coverage, all managed from a single, intuitive interface.
            </p>
          </div>
          <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-10 md:p-16 flex flex-col justify-center text-white">
            <div className="text-5xl font-black mb-2">100%</div>
            <div className="text-primary-100 font-bold uppercase tracking-widest text-xs mb-8">Digital Processing</div>
            
            <div className="text-5xl font-black mb-2">24/7</div>
            <div className="text-primary-100 font-bold uppercase tracking-widest text-xs mb-8">Customer Support</div>

            <div className="text-5xl font-black mb-2">0</div>
            <div className="text-primary-100 font-bold uppercase tracking-widest text-xs">Hidden Fees</div>
          </div>
        </div>
      </div>
    </div>
  )
}
