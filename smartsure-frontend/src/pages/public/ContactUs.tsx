import { useState } from 'react'
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiOutlinePaperAirplane } from 'react-icons/hi'
import { toast } from 'react-toastify'
import { FormInput } from '../../components/common/FormInput'
import { FormTextarea } from '../../components/common/FormTextarea'
import { Button } from '../../components/common/Button'

export default function ContactUs() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Thank you! Your message has been received. We'll be in touch shortly.")
    setFormData({ name: '', email: '', message: '' })
  }

  return (
    <div className="space-y-20 py-10">
      {/* Hero Section */}
      <section className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black text-surface-900 dark:text-white tracking-tight">
          Get in <span className="gradient-text">Touch</span>
        </h1>
        <p className="text-lg text-surface-500 font-medium leading-relaxed">
          Questions or feedback? We'd love to hear from you. Our team typically responds within 2 business hours.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
        {/* Info Cards */}
        <div className="space-y-6">
          {[
            { icon: HiOutlineMail, title: "Support Email", data: "support@smartsure.co", desc: "For all general inquiries" },
            { icon: HiOutlinePhone, title: "Phone Number", data: "+91 800 123 4567", desc: "Mon-Fri from 9am to 6pm IST" },
            { icon: HiOutlineLocationMarker, title: "Head Office", data: "Knowledge Park III, Greater Noida", desc: "SmartSure Tower, Level 4" },
          ].map((item, idx) => (
            <div key={idx} className="card p-6 flex items-center gap-4 group hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
              <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform">
                <item.icon className="text-2xl" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-surface-400 uppercase tracking-widest">{item.title}</h3>
                <div className="text-base font-bold text-surface-900 dark:text-white">{item.data}</div>
                <p className="text-xs text-surface-500 font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="card p-8 md:p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            <FormInput
              label="Name"
              required
              placeholder="Full Name"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
            />
            <FormInput
              type="email" 
              label="Email Address"
              required
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})}
            />
            <FormTextarea 
              label="Message"
              required
              rows={4}
              placeholder="How can we help?"
              value={formData.message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, message: e.target.value})}
            />
            <Button 
              type="submit" 
              className="w-full !py-4 group"
              rightIcon={<HiOutlinePaperAirplane className="text-lg group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
            >
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
