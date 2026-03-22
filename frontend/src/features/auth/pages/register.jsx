import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../hook/useAuth'
import { useSelector } from 'react-redux'
import Logo from '../../../app/components/Logo'
import { useTheme } from '../../../app/context/ThemeContext'

const Register = () => {
    const [ isFlipped, setIsFlipped ] = useState(true)
    const [ username, setUsername ] = useState('')
    const [ email, setEmail ] = useState('')
    const [ password, setPassword ] = useState('')
    const [ successMsg, setSuccessMsg ] = useState('')
    const [ localError, setLocalError ] = useState('')
    const [ isSubmitting, setIsSubmitting ] = useState(false)

    const error = useSelector(state => state.auth.error)
    const { handleRegister, handleLogin } = useAuth()
    const navigate = useNavigate()
    const { theme } = useTheme()

    const submitForm = async (event) => {
        event.preventDefault()
        setLocalError('')
        setSuccessMsg('')
        setIsSubmitting(true)
        const payload = { username, email, password }
        const success = await handleRegister(payload)
        setIsSubmitting(false)
        if (success) {
            setSuccessMsg('Registration successful! Please check your email to verify, then login.')
            setTimeout(() => navigate('/login'), 2000)
        }
    }

    const submitLogin = async (event) => {
        event.preventDefault()
        setLocalError('')
        setIsSubmitting(true)
        const payload = { email, password }
        const success = await handleLogin(payload)
        setIsSubmitting(false)
        if (success) {
            navigate('/')
        }
    }

    const displayError = localError || error

    return (
        <section style={{ fontFamily: "'Poppins', sans-serif" }} className="min-h-screen bg-[#171616] flex flex-col items-center justify-center text-[#F95C4B]">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
                @import url('https://unicons.iconscout.com/release/v2.1.9/css/unicons.css');

                .preserve-3d { transform-style: preserve-3d; }
                .perspective { perspective: 800px; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .flip-transition { transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1); }
            `}</style>

            {successMsg && (
                <div className="mb-4 w-[440px] rounded-lg bg-green-500/20 border border-green-500/50 px-4 py-3 text-green-300 text-sm text-center">
                    {successMsg}
                </div>
            )}
            {displayError && !successMsg && (
                <div className="mb-4 w-[440px] rounded-lg bg-red-500/20 border border-red-500/50 px-4 py-3 text-red-300 text-sm text-center">
                    {displayError}
                </div>
            )}

            <div className="mb-4 flex items-center justify-center space-x-6 pb-4">
                <span className={`text-lg font-bold uppercase transition-colors duration-200 ${!isFlipped ? 'text-[#F95C4B]' : 'text-gray-400'}`}>Log In</span>
                <div 
                    onClick={() => setIsFlipped(!isFlipped)} 
                    className="relative h-[34px] w-[80px] cursor-pointer rounded-full bg-[#1e1e1e] flex items-center shadow-inner transition-colors duration-300"
                >
                    <div 
                        className={`absolute h-[28px] w-[28px] rounded-full bg-[#F95C4B] shadow-md transition-transform duration-300 ease-in-out
                        ${isFlipped ? 'translate-x-[48px]' : 'translate-x-[4px]'}`}
                    ></div>
                </div>
                <span className={`text-lg font-bold uppercase transition-colors duration-200 ${isFlipped ? 'text-[#F95C4B]' : 'text-gray-400'}`}>Sign Up</span>
            </div>

            <div className="perspective w-[440px] h-[480px]">
                <div className={`preserve-3d relative w-full h-full flip-transition ${isFlipped ? 'rotate-y-180' : ''}`}>
                    
                    {/* Log In */}
                    <div className="backface-hidden absolute w-full h-full rounded-2xl bg-[#171616] shadow-[0_15px_35px_rgba(0,0,0,0.5)] p-10 flex flex-col justify-center">
                        <div className="mb-4 flex justify-center w-full"><Logo size="md" /></div>
                        <form onSubmit={submitLogin} className="space-y-6">
                            <div className="relative">
                                <i className="uil uil-at absolute top-[14px] left-4 text-gray-400 text-xl"></i>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="Your Email" 
                                    required
                                    className="w-full bg-[#1e1e1e] text-zinc-100 rounded-lg pl-12 pr-4 py-3 outline-none ring-0 transition focus:ring-2 focus:ring-[#F95C4B] border border-transparent shadow-[0_4px_8px_rgba(0,0,0,0.1)] placeholder:text-gray-500"
                                />
                            </div>
                            <div className="relative">
                                <i className="uil uil-lock-alt absolute top-[14px] left-4 text-gray-400 text-xl"></i>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Your Password" 
                                    required
                                    className="w-full bg-[#1e1e1e] text-zinc-100 rounded-lg pl-12 pr-4 py-3 outline-none ring-0 transition focus:ring-2 focus:ring-[#F95C4B] border border-transparent shadow-[0_4px_8px_rgba(0,0,0,0.1)] placeholder:text-gray-500"
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full rounded-lg bg-[#F95C4B] px-4 py-3 font-semibold text-[#ffffff] transition hover:bg-[#e04a39] hover:shadow-[0_8px_24px_rgba(249,92,75,0.2)] focus:outline-none uppercase tracking-wide mt-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Logging in...' : 'Submit'}
                            </button>
                        </form>
                    </div>

                    {/* Sign Up */}
                    <div className="backface-hidden rotate-y-180 absolute w-full h-full rounded-2xl bg-[#171616] shadow-[0_15px_35px_rgba(0,0,0,0.5)] p-10 flex flex-col justify-center">
                        <div className="mb-4 flex justify-center w-full"><Logo size="md" /></div>
                        <form onSubmit={submitForm} className="space-y-6">
                            <div className="relative">
                                <i className="uil uil-user absolute top-[14px] left-4 text-gray-400 text-xl"></i>
                                <input 
                                    type="text" 
                                    value={username}
                                    onChange={(event) => setUsername(event.target.value)}
                                    placeholder="Your Username" 
                                    required
                                    className="w-full bg-[#1e1e1e] text-zinc-100 rounded-lg pl-12 pr-4 py-3 outline-none ring-0 transition focus:ring-2 focus:ring-[#F95C4B] border border-transparent shadow-[0_4px_8px_rgba(0,0,0,0.1)] placeholder:text-gray-500"
                                />
                            </div>
                            <div className="relative">
                                <i className="uil uil-at absolute top-[14px] left-4 text-gray-400 text-xl"></i>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="Your Email" 
                                    required
                                    className="w-full bg-[#1e1e1e] text-zinc-100 rounded-lg pl-12 pr-4 py-3 outline-none ring-0 transition focus:ring-2 focus:ring-[#F95C4B] border border-transparent shadow-[0_4px_8px_rgba(0,0,0,0.1)] placeholder:text-gray-500"
                                />
                            </div>
                            <div className="relative">
                                <i className="uil uil-lock-alt absolute top-[14px] left-4 text-gray-400 text-xl"></i>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Your Password" 
                                    required
                                    className="w-full bg-[#1e1e1e] text-zinc-100 rounded-lg pl-12 pr-4 py-3 outline-none ring-0 transition focus:ring-2 focus:ring-[#F95C4B] border border-transparent shadow-[0_4px_8px_rgba(0,0,0,0.1)] placeholder:text-gray-500"
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full rounded-lg bg-[#F95C4B] px-4 py-3 font-semibold text-[#ffffff] transition hover:bg-[#e04a39] hover:shadow-[0_8px_24px_rgba(249,92,75,0.2)] focus:outline-none uppercase tracking-wide mt-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Signing up...' : 'Submit'}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </section>
    )
}

export default Register