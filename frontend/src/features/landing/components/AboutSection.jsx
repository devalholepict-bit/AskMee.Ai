import React from 'react'
import { useNavigate } from 'react-router'

export default function AboutSection() {
  const navigate = useNavigate()
  
  return (
    <section id="about" className="w-full bg-[#111111] py-[100px] px-[40px] flex flex-col items-center text-center">
      <div className="text-[#F95C4B] text-[11px] font-bold tracking-[3px] uppercase mb-4">ABOUT</div>
      <h2 className="text-[42px] font-bold text-[#e8e8e8] mb-[16px]">Why AskMee.AI?</h2>
      <p className="text-[17px] text-[#666] mb-[60px] max-w-xl mx-auto">
        Built for people who want real answers, not just links.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
        <div className="bg-[#1e1e1e] border border-[#252525] rounded-[16px] p-[32px_28px] text-left transition-all duration-200 hover:border-[#F95C4B] hover:-translate-y-[4px]">
          <div className="text-[32px] mb-4">🌐</div>
          <h3 className="text-white font-bold text-lg mb-2">Live Web Search</h3>
          <p className="text-[#888] text-[14px] leading-relaxed">
            AskMee searches the internet in real-time and cites its sources so you can trust every answer.
          </p>
        </div>

        <div className="bg-[#1e1e1e] border border-[#252525] rounded-[16px] p-[32px_28px] text-left transition-all duration-200 hover:border-[#F95C4B] hover:-translate-y-[4px]">
          <div className="text-[32px] mb-4">🖼️</div>
          <h3 className="text-white font-bold text-lg mb-2">Image Understanding</h3>
          <p className="text-[#888] text-[14px] leading-relaxed">
            Upload any image and ask questions about it. Powered by Pixtral vision AI.
          </p>
        </div>

        <div className="bg-[#1e1e1e] border border-[#252525] rounded-[16px] p-[32px_28px] text-left transition-all duration-200 hover:border-[#F95C4B] hover:-translate-y-[4px]">
          <div className="text-[32px] mb-4">⚡</div>
          <h3 className="text-white font-bold text-lg mb-2">Lightning Fast</h3>
          <p className="text-[#888] text-[14px] leading-relaxed">
            Streaming responses appear word by word so you never wait for the full answer.
          </p>
        </div>
      </div>

      <div className="mt-[80px] flex flex-col items-center">
        <h2 className="text-[32px] font-bold text-[#e8e8e8] mb-[24px]">Ready to get started?</h2>
        <button 
          onClick={() => navigate('/login')}
          className="bg-[#F95C4B] hover:bg-[#e04a39] text-white rounded-[12px] px-[40px] py-[16px] text-[17px] font-semibold border-none cursor-pointer transition-all duration-200 hover:-translate-y-[2px]"
        >
          Start for Free →
        </button>
      </div>
    </section>
  )
}
