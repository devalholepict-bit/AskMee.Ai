import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import Logo from '../../../app/components/Logo'

const WORDS = ["coding", "research", "writing", "learning", "design", "everything"]

export default function HeroSection() {
  const navigate = useNavigate()
  const [wordIndex, setWordIndex] = useState(0)
  const [text, setText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let timer;
    const currentWord = WORDS[wordIndex]
    
    if (isDeleting) {
      if (text === '') {
        setIsDeleting(false)
        setWordIndex((prev) => (prev + 1) % WORDS.length)
      } else {
        timer = setTimeout(() => {
          setText(currentWord.substring(0, text.length - 1))
        }, 30)
      }
    } else {
      if (text === currentWord) {
        timer = setTimeout(() => {
          setIsDeleting(true)
        }, 1500)
      } else {
        timer = setTimeout(() => {
          setText(currentWord.substring(0, text.length + 1))
        }, 50)
      }
    }
    
    return () => clearTimeout(timer)
  }, [text, isDeleting, wordIndex])

  return (
    <section id="hero" className="w-full min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center pt-16 px-6 text-center relative overflow-hidden">
      <div className="mb-6 animate-[slideIn_0.8s_ease-out]">
        <Logo size="lg" />
      </div>
      <h1 className="leading-[1.1] mb-5 flex flex-col items-center">
        <span className="text-[var(--text-main)] font-[800]" style={{ fontSize: 'clamp(42px, 7vw, 80px)' }}>Every answer for</span>
        <span className="text-[var(--accent)] font-[800] min-h-[clamp(42px,7vw,80px)] flex items-center" style={{ fontSize: 'clamp(42px, 7vw, 80px)' }}>
          {text}<span className="animate-[blink_1s_step-end_infinite] font-light -mt-2">|</span>
        </span>
      </h1>
      
      <p className="text-[18px] text-[var(--text-muted)] max-w-[540px] leading-[1.6]">
        Get instant answers with real-time web search, image understanding, and AI-powered intelligence.
      </p>
      
      <button 
        onClick={() => navigate('/login')}
        className="mt-[40px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-main)] rounded-[12px] px-[40px] py-[16px] text-[17px] font-semibold border-none cursor-pointer transition-all duration-200 hover:-translate-y-[2px]"
      >
        Get Started Free →
      </button>
      
      <div className="mt-5 text-[13px] text-[var(--text-muted)]">
        Already have an account?{' '}
        <span onClick={() => navigate('/login')} className="text-[var(--accent)] cursor-pointer hover:underline font-medium">
          Sign in
        </span>
      </div>

      <div className="absolute bottom-10 flex flex-col items-center animate-[slideIn_0.8s_ease-out]">
        <span className="text-[12px] text-[var(--text-hint)] mb-[12px]">Powered by leading AI models</span>
        <div className="flex flex-wrap gap-3 justify-center">
          {['Mistral', 'GPT-4', 'Claude', 'Gemini', 'Llama', 'Pixtral'].map(model => (
            <div key={model} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] px-[14px] py-[6px] text-[12px] text-[var(--text-muted)]">
              {model}
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}
