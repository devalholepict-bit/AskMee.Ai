import React from 'react'
import { useNavigate } from 'react-router'

export default function Navbar() {
  const navigate = useNavigate()
  
  const handleScroll = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 border-b border-[#252525]" style={{ height: '60px', background: 'rgba(23,22,22,0.95)', backdropFilter: 'blur(10px)' }}>
      <div className="flex items-center text-[20px] font-bold cursor-pointer" onClick={() => window.scrollTo(0,0)}>
        <span className="text-white">AskMee</span>
        <span className="text-[#F95C4B]">.AI</span>
      </div>

      <div className="hidden md:flex items-center gap-6 text-[14px] font-medium text-[#888]">
        <button onClick={() => handleScroll('hero')} className="hover:text-[#e8e8e8] transition-colors focus:text-[#F95C4B]">Home</button>
        <button onClick={() => handleScroll('about')} className="hover:text-[#e8e8e8] transition-colors focus:text-[#F95C4B]">About</button>
      </div>

      <button 
        onClick={() => navigate('/login')}
        className="bg-[#F95C4B] hover:bg-[#e04a39] text-white px-[20px] py-[8px] rounded-[8px] text-[14px] font-semibold transition-colors focus:outline-none"
      >
        Sign In
      </button>
    </nav>
  )
}
