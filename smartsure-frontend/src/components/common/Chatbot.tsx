import React, { useState, useRef, useEffect } from 'react'
import { RiCloseLine, RiSendPlane2Line, RiUser3Line, RiSparklingLine, RiShieldUserLine, RiChat3Line } from 'react-icons/ri'
import { fetchAIResponse } from '../../api/aiService'

interface Message {
  id: number
  type: 'bot' | 'user'
  text: string
  time: string
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    type: 'bot',
    text: "Welcome to SmartSure. I am your specialized AI Assistant. How can I help you today with our 100% digital Health, Life, or Vehicle insurance?",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
]

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMsgText = inputValue
    const newMessage: Message = {
      id: Date.now(),
      type: 'user',
      text: userMsgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, newMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      const response = await fetchAIResponse(userMsgText)
      if (response.success && response.data) {
        addBotMsg(response.data)
      } else {
        addBotMsg("I'm sorry, I specialize exclusively in providing information about SmartSure's digital insurance services (Health, Life, and Vehicle). How can I assist you with those today?")
      }
    } catch (e) {
      setTimeout(() => {
        addBotMsg("I'm sorry, I specialize exclusively in providing information about SmartSure's digital insurance services (Health, Life, and Vehicle). How can I assist you with those today?")
      }, 1200)
    }
  }

  const addBotMsg = (text: string) => {
    const botResponse: Message = {
      id: Date.now() + 1,
      type: 'bot',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(prev => [...prev, botResponse])
    setIsTyping(false)
  }

  return (
    /* PORTAL-LIKE FIXED WRAPPER */
    <div className="fixed inset-0 pointer-events-none z-[999]">
      {/* POSITIONED CONTAINER - Perfect alignment with safety margins */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 lg:bottom-10 lg:right-10 pointer-events-auto flex flex-col items-end">
        
        {/* CHAT WINDOW: Refined height to stay below top edge */}
        {isOpen && (
          <div className="mb-4 w-[calc(100vw-2rem)] sm:w-[340px] md:w-[350px] h-[500px] max-h-[70vh] flex flex-col bg-white dark:bg-surface-950 rounded-[24px] overflow-hidden shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] ring-1 ring-black/[0.04] dark:ring-white/[0.04] animate-modal-slide-up border border-surface-200 dark:border-surface-800 transition-all origin-bottom-right">
            
            {/* LUXURY GRADIENT HEADER */}
            <div className="p-5 sm:p-6 bg-gradient-to-br from-indigo-600 via-primary-600 to-primary-700 text-white flex items-center justify-between shadow-xl relative overflow-hidden flex-shrink-0">
               {/* Decorative visual elements */}
              <div className="absolute top-[-30%] right-[-15%] w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative">
                   <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[18px] bg-white/15 flex items-center justify-center backdrop-blur-2xl border border-white/30 shadow-inner">
                     <RiSparklingLine className="text-xl sm:text-2xl text-white animate-pulse" />
                   </div>
                   <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-400 border-2 border-primary-700 rounded-full animate-pulse shadow-sm shadow-emerald-400/50 flex items-center justify-center">
                     <span className="w-1 h-1 bg-white rounded-full" />
                   </span>
                </div>
                <div>
                  <h3 className="font-bold text-[15px] sm:text-[16px] tracking-tight leading-tight">SmartSure Specialist</h3>
                  <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
                    <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.22em] text-white/70">Verified Professional</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2.5 hover:bg-white/10 rounded-xl transition-all hover:scale-110 active:scale-95"
                aria-label="Close"
              >
                <RiCloseLine className="text-2xl" />
              </button>
            </div>

            {/* MESSAGE FLOW: Ultra-Modern Bubbles */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 sm:space-y-8 bg-surface-50/10 dark:bg-surface-950"
            >
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-count-up`}>
                  <div className={`max-w-[86%] flex gap-3.5 sm:gap-4 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex-shrink-0 flex items-center justify-center text-xs sm:text-sm shadow-md transition-transform hover:rotate-12
                      ${msg.type === 'user' 
                        ? 'bg-primary-600 text-white shadow-primary-500/20' 
                        : 'bg-white dark:bg-surface-800 text-primary-600 border border-surface-100 dark:border-surface-700'}`}>
                      {msg.type === 'user' ? <RiUser3Line /> : <RiShieldUserLine className="text-xl" />}
                    </div>
                    <div className={`p-4 rounded-[22px] text-[13.5px] sm:text-[14.5px] leading-relaxed shadow-[0_3px_15px_-4px_rgba(0,0,0,0.06)]
                      ${msg.type === 'user' 
                        ? 'bg-primary-600 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 rounded-tl-none border border-surface-100 dark:border-surface-700'}`}>
                      {msg.text}
                      <div className={`text-[8.5px] mt-2.5 font-bold uppercase tracking-widest opacity-40 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                        {msg.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-surface-800 px-6 py-4 rounded-[22px] rounded-tl-none border border-surface-100 dark:border-surface-700 shadow-sm flex gap-2">
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                </div>
              )}
            </div>

            {/* INPUT SECTION: Clean Minimal Design */}
            <div className="p-5 sm:p-6 bg-white dark:bg-surface-950 border-t border-surface-100 dark:border-surface-800 flex-shrink-0">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Ask about Health, Life, or Vehicle..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="w-full pl-5 sm:pl-6 pr-14 sm:pr-16 py-4 bg-surface-50 dark:bg-surface-900 border-2 border-transparent rounded-[22px] text-[13px] sm:text-[14px] focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500/40 transition-all outline-none placeholder-surface-400 font-semibold"
                />
                <button 
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="absolute right-2 top-2 p-2 bg-primary-600 hover:bg-primary-500 text-white rounded-[18px] transition-all disabled:opacity-20 active:scale-90 shadow-lg shadow-primary-500/30 group-focus-within:rotate-[-5deg]"
                  aria-label="Send"
                >
                  <RiSendPlane2Line className="text-xl" />
                </button>
              </div>
              <p className="text-[9px] text-center mt-4 sm:mt-5 text-surface-400 dark:text-surface-600 font-black uppercase tracking-[0.35em] opacity-80">SmartSure Intelligence System</p>
            </div>
          </div>
        )}

        {/* ELITE INDUSTRY-LEVEL TOGGLE BUTTON */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative group w-14 h-14 sm:w-[56px] sm:h-[56px] flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 transform-gpu z-50 mt-4
            ${isOpen 
              ? 'bg-surface-950 text-white rotate-[135deg] rounded-full shadow-[0_15px_30px_-5px_rgba(0,0,0,0.5)]' 
              : 'bg-gradient-to-tr from-primary-600 via-indigo-600 to-primary-500 text-white rounded-[20px] shadow-[0_15px_30px_-8px_rgba(79,70,229,0.5)] border-t border-white/20 hover:shadow-[0_20px_40px_-10px_rgba(79,70,229,0.6)] hover:rotate-[-5deg]'}`}
          aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
        >
          {isOpen ? (
            <RiCloseLine className="text-[28px]" />
          ) : (
            <div className="relative flex items-center justify-center w-full h-full">
              {/* Main Professional Chat Bubble */}
              <RiChat3Line className="text-[28px] drop-shadow-md group-hover:scale-110 transition-transform duration-300 ease-out" />
              {/* AI Sparkle Overlays */}
              <RiSparklingLine className="absolute top-[20%] right-[20%] text-sm text-yellow-300 animate-[spin_4s_linear_infinite]" />
            </div>
          )}
          
        </button>
      </div>
    </div>
  )
}
