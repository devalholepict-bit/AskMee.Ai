import React from 'react'
import { useNavigate } from 'react-router'
import ThemeToggle from '../../../app/components/ThemeToggle'
import Logo from '../../../app/components/Logo'

export default function Navbar() {
  const navigate = useNavigate()
  
  const handleScroll = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 border-b border-[var(--border-color)]" style={{ height: '60px', background: 'rgba(23,22,22,0.95)', backdropFilter: 'blur(10px)' }}>
      <div className="cursor-pointer" onClick={() => window.scrollTo(0,0)}>
        <Logo size="md" />
      </div>

      <div className="hidden md:flex items-center gap-6 text-[14px] font-medium text-[var(--text-muted)]">
        <button onClick={() => handleScroll('hero')} className="hover:text-[var(--text-main)] transition-colors focus:text-[var(--accent)]">Home</button>
        <button onClick={() => handleScroll('about')} className="hover:text-[var(--text-main)] transition-colors focus:text-[var(--accent)]">About</button>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <button 
          onClick={() => navigate('/login')}
          className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-main)] px-[20px] py-[8px] rounded-[8px] text-[14px] font-semibold transition-colors focus:outline-none"
        >
          Sign In
        </button>
      </div>
    </nav>
  )
}
