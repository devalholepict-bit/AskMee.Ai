import React from 'react'
import { Navigate } from 'react-router'
import { useSelector } from 'react-redux'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import AboutSection from '../components/AboutSection'

export default function Landing() {
  const user = useSelector(state => state.auth.user)
  
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-[#111111] font-sans text-white">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
      </main>
    </div>
  )
}
