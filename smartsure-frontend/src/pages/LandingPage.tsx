import { Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import Chatbot from '../components/common/Chatbot'
import { Button } from '../components/common/Button'
import {
  RiShieldCheckFill,
  RiArrowRightLine,
  RiCustomerService2Line,
  RiSecurePaymentLine,
  RiLineChartLine
} from 'react-icons/ri'
import { HiOutlineLightBulb, HiOutlineGlobe, HiOutlineSparkles } from 'react-icons/hi'

export default function LandingPage() {
  return (
    <>
    <DashboardLayout>
      <div className="space-y-32 pb-20">
        
        {/* HERO SECTION */}
        <section className="relative pt-12 md:pt-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-primary-500/10 blur-[120px] rounded-full -z-10" />
          
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-widest">
              <HiOutlineSparkles /> Now with AI-Driven Claims
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-surface-900 dark:text-white tracking-tight leading-[1.1]">
              Smart Insurance for a <span className="gradient-text">Modern World</span>
            </h1>
            
            <p className="text-lg md:text-xl text-surface-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Experience the future of insurance management. Fast, transparent, and completely digital. Protecting what matters most to you, 24/7.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link to="/register" className="w-full sm:w-auto">
                <Button 
                  className="!px-8 !py-4 text-lg w-full"
                  rightIcon={<RiArrowRightLine />}
                >
                  Get Protected Now
                </Button>
              </Link>
              <Link to="/about" className="w-full sm:w-auto">
                <Button 
                  variant="secondary"
                  className="!px-8 !py-4 text-lg w-full"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-surface-900 dark:text-white">Why Choose SmartSure?</h2>
            <p className="text-surface-500 font-medium lowercase italic">Tailored for excellence, built for trust.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: RiShieldCheckFill,
                color: 'text-primary-500',
                bg: 'bg-primary-500/10',
                title: "Instant Coverage",
                desc: "Don't wait for paperwork. Get insured in minutes with our automated appraisal system."
              },
              {
                icon: RiSecurePaymentLine,
                color: 'text-emerald-500',
                bg: 'bg-emerald-500/10',
                title: "Secure Payments",
                desc: "Enterprise-grade encryption for all your premium payments and claim payouts."
              },
              {
                icon: RiLineChartLine,
                color: 'text-amber-500',
                bg: 'bg-amber-500/10',
                title: "Transparent Pricing",
                desc: "No hidden fees or complicated clauses. We believe in crystal clear insurance for everyone."
              }
            ].map((feature, idx) => (
              <div key={idx} className="card p-8 group hover:translate-y-[-8px] transition-all duration-300">
                <div className={`w-14 h-14 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-surface-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MIDDLE SECTION: PROMO */}
        <section className="card p-1">
          <div className="bg-gradient-to-br from-primary-600 to-indigo-800 rounded-[22px] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
              <div className="p-10 md:p-16 space-y-8 text-white">
                <h2 className="text-4xl md:text-5xl font-black leading-tight">Managing Insurance <br/><span className="text-primary-200">Simplified.</span></h2>
                <p className="text-lg text-primary-50/80 font-medium leading-relaxed">
                  Join over 50,000+ members who trust SmartSure for their daily protection. From health to property, we've got you covered.
                </p>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-3">
                    <HiOutlineGlobe className="text-3xl text-primary-300" />
                    <div>
                      <div className="font-black text-xl">Global</div>
                      <div className="text-[10px] uppercase font-bold text-primary-200">Coverage</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <RiCustomerService2Line className="text-3xl text-primary-300" />
                    <div>
                      <div className="font-black text-xl">24/7</div>
                      <div className="text-[10px] uppercase font-bold text-primary-200">Live Support</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-10 md:p-16 flex justify-center">
                 <div className="w-full max-w-sm aspect-square bg-white/10 backdrop-blur-3xl rounded-[40px] border border-white/20 flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-700">
                    <RiShieldCheckFill className="text-white text-[120px] drop-shadow-2xl opacity-50" />
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST SIGNALS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 py-10 border-y border-surface-100 dark:border-surface-800">
           <div className="text-center group">
              <div className="text-4xl font-black text-surface-900 dark:text-white mb-2 group-hover:text-primary-500 transition-colors">99.9%</div>
              <div className="text-xs font-bold text-surface-400 tracking-widest uppercase">Claims Approval Rate</div>
           </div>
           <div className="text-center group">
              <div className="text-4xl font-black text-surface-900 dark:text-white mb-2 group-hover:text-primary-500 transition-colors">2 Min</div>
              <div className="text-xs font-bold text-surface-400 tracking-widest uppercase">Policy Generation</div>
           </div>
           <div className="text-center group">
              <div className="text-4xl font-black text-surface-900 dark:text-white mb-2 group-hover:text-primary-500 transition-colors">4.9/5</div>
              <div className="text-xs font-bold text-surface-400 tracking-widest uppercase">Customer Rating</div>
           </div>
        </section>

        {/* FINAL CTA */}
        <section className="text-center space-y-8 max-w-2xl mx-auto py-10">
           <HiOutlineLightBulb className="text-5xl text-amber-500 mx-auto" />
           <h2 className="text-4xl font-black text-surface-900 dark:text-white">Ready for Peace of Mind?</h2>
           <p className="text-surface-500 font-medium">Join SmartSure today and experience insurance that actually works for you.</p>
           <div className="flex justify-center">
              <Link to="/register">
                <Button className="!px-12 !py-4 text-xl">
                  Create Free Account
                </Button>
              </Link>
           </div>
        </section>

      </div>
    </DashboardLayout>
    <Chatbot />
    </>
  )
}
