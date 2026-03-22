import React, { useState, useEffect } from 'react'
import { useNavigate, Navigate, useSearchParams } from 'react-router'
import { useAuth } from '../hook/useAuth'
import { useSelector, useDispatch } from 'react-redux'
import { clearError } from '../auth.slice'
import ThemeToggle from '../../../app/components/ThemeToggle'
import Logo from '../../../app/components/Logo'
import { useTheme } from '../../../app/context/ThemeContext'

const Login = () => {
    const [searchParams] = useSearchParams()
    const verified = searchParams.get('verified')

    const [ isFlipped, setIsFlipped ] = useState(false)
    const [ email, setEmail ] = useState('')
    const [ password, setPassword ] = useState('')
    const [ username, setUsername ] = useState('')
    const [ successMsg, setSuccessMsg ] = useState('')
    const [ isSubmitting, setIsSubmitting ] = useState(false)

    const user = useSelector(state => state.auth.user)
    const loading = useSelector(state => state.auth.loading)
    const error = useSelector(state => state.auth.error)

    const dispatch = useDispatch()
    const { handleLogin, handleRegister } = useAuth()
    const navigate = useNavigate()
    const { theme } = useTheme()

    useEffect(() => {
        dispatch(clearError())
    }, [dispatch])

    const submitForm = async (event) => {
        event.preventDefault()
        setSuccessMsg('')
        setIsSubmitting(true)
        const payload = { email, password }
        const success = await handleLogin(payload)
        setIsSubmitting(false)
        if (success) {
            navigate("/")
        }
    }

    const submitRegister = async (event) => {
        event.preventDefault()
        setSuccessMsg('')
        setIsSubmitting(true)
        const payload = { username, email, password }
        const success = await handleRegister(payload)
        setIsSubmitting(false)
        if (success) {
            setSuccessMsg('Registration successful! Check your email to verify, then login.')
            setIsFlipped(false)
            setUsername('')
            setEmail('')
            setPassword('')
        }
    }

    if (!loading && user) {
        return <Navigate to="/" replace />
    }

    const displayError = error && !error.includes('401') && !error.includes('Unauthorized')

    return (
        <section style={{ fontFamily: "'Poppins', sans-serif" }} className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center text-[var(--accent)]">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
                @import url('https://unicons.iconscout.com/release/v2.1.9/css/unicons.css');

                .preserve-3d { transform-style: preserve-3d; }
                .perspective { perspective: 800px; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .flip-transition { transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1); }
            `}</style>
            
            <div className="fixed top-6 right-6 z-50">
                <ThemeToggle />
            </div>

            {successMsg && (
                <div className="mb-4 w-[440px] rounded-lg bg-green-500/20 border border-green-500/50 px-4 py-3 text-green-300 text-sm text-center">
                    {successMsg}
                </div>
            )}
            {displayError && !successMsg && (
                <div className="mb-4 w-[440px] rounded-lg bg-red-500/20 border border-red-500/50 px-4 py-3 text-red-300 text-sm text-center">
                    {error}
                </div>
            )}

            <div className="mb-4 flex items-center justify-center space-x-6 pb-4">
                <span className={`text-lg font-bold uppercase transition-colors duration-200 ${!isFlipped ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>Log In</span>
                <div 
                    onClick={() => setIsFlipped(!isFlipped)} 
                    className="relative h-[34px] w-[80px] cursor-pointer rounded-full bg-[var(--bg-input)] flex items-center shadow-inner transition-colors duration-300"
                >
                    <div 
                        className={`absolute h-[28px] w-[28px] rounded-full bg-[var(--accent)] shadow-md transition-transform duration-300 ease-in-out
                        ${isFlipped ? 'translate-x-[48px]' : 'translate-x-[4px]'}`}
                    ></div>
                </div>
                <span className={`text-lg font-bold uppercase transition-colors duration-200 ${isFlipped ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>Sign Up</span>
            </div>

            <div className="perspective w-[440px] h-[480px]">
                <div className={`preserve-3d relative w-full h-full flip-transition ${isFlipped ? 'rotate-y-180' : ''}`}>
                    
                    {/* Log In */}
                    <div className="backface-hidden absolute w-full h-full rounded-2xl bg-[var(--bg-card)] shadow-[0_15px_35px_var(--shadow)] p-10 flex flex-col justify-center">
                        <div className="mb-4 flex justify-center w-full"><Logo size="md" /></div>
                        
                        {verified === 'true' && (
                            <div className="mb-4 w-full rounded-lg bg-green-500/20 border border-green-500/50 px-4 py-3 text-green-300 text-sm text-center font-medium shadow-sm">
                                ✓ Email verified! You can now log in.
                            </div>
                        )}
                        {verified === 'false' && (
                            <div className="mb-4 w-full rounded-lg bg-red-500/20 border border-red-500/50 px-4 py-3 text-red-300 text-sm text-center font-medium shadow-sm">
                                ✕ Link expired or invalid. Please register again.
                            </div>
                        )}

                        <form onSubmit={submitForm} className="space-y-6">
                            <div className="relative">
                                <i className="uil uil-at absolute top-[14px] left-4 text-[var(--text-muted)] text-xl"></i>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="Your Email" 
                                    required
                                    className="w-full bg-[var(--bg-input)] text-[var(--text-main)] rounded-lg pl-12 pr-4 py-3 outline-none ring-0 transition focus:ring-2 focus:ring-[var(--accent)] border border-[var(--border-input)] shadow-[0_4px_8px_var(--shadow)] placeholder:text-[var(--text-muted)]"
                                />
                            </div>
                            <div className="relative">
                                <i className="uil uil-lock-alt absolute top-[14px] left-4 text-[var(--text-muted)] text-xl"></i>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Your Password" 
                                    required
                                    className="w-full bg-[var(--bg-input)] text-[var(--text-main)] rounded-lg pl-12 pr-4 py-3 outline-none ring-0 transition focus:ring-2 focus:ring-[var(--accent)] border border-[var(--border-input)] shadow-[0_4px_8px_var(--shadow)] placeholder:text-[var(--text-muted)]"
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full rounded-lg bg-[var(--accent)] px-4 py-3 font-semibold text-[White] transition hover:bg-[var(--accent-hover)] hover:shadow-[0_8px_24px_rgba(249,92,75,0.2)] focus:outline-none uppercase tracking-wide mt-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white"
                            >
                                {isSubmitting ? 'Logging in...' : 'Submit'}
                            </button>
                        </form>
                    </div>

                    {/* Sign Up */}
                    <div className="backface-hidden rotate-y-180 absolute w-full h-full rounded-2xl bg-[var(--bg-card)] shadow-[0_15px_35px_var(--shadow)] p-10 flex flex-col justify-center">
                        <div className="mb-4 flex justify-center w-full"><Logo size="md" /></div>
                        <form onSubmit={submitRegister} className="space-y-6">
                            <div className="relative">
                                <i className="uil uil-user absolute top-[14px] left-4 text-[var(--text-muted)] text-xl"></i>
                                <input 
                                    type="text" 
                                    value={username}
                                    onChange={(event) => setUsername(event.target.value)}
                                    placeholder="Your Username" 
                                    required
                                    className="w-full bg-[var(--bg-input)] text-[var(--text-main)] rounded-lg pl-12 pr-4 py-3 outline-none ring-0 transition focus:ring-2 focus:ring-[var(--accent)] border border-[var(--border-input)] shadow-[0_4px_8px_var(--shadow)] placeholder:text-[var(--text-muted)]"
                                />
                            </div>
                            <div className="relative">
                                <i className="uil uil-at absolute top-[14px] left-4 text-[var(--text-muted)] text-xl"></i>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="Your Email" 
                                    required
                                    className="w-full bg-[var(--bg-input)] text-[var(--text-main)] rounded-lg pl-12 pr-4 py-3 outline-none ring-0 transition focus:ring-2 focus:ring-[var(--accent)] border border-[var(--border-input)] shadow-[0_4px_8px_var(--shadow)] placeholder:text-[var(--text-muted)]"
                                />
                            </div>
                            <div className="relative">
                                <i className="uil uil-lock-alt absolute top-[14px] left-4 text-[var(--text-muted)] text-xl"></i>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Your Password" 
                                    required
                                    className="w-full bg-[var(--bg-input)] text-[var(--text-main)] rounded-lg pl-12 pr-4 py-3 outline-none ring-0 transition focus:ring-2 focus:ring-[var(--accent)] border border-[var(--border-input)] shadow-[0_4px_8px_var(--shadow)] placeholder:text-[var(--text-muted)]"
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full rounded-lg bg-[var(--accent)] px-4 py-3 font-semibold text-white transition hover:bg-[var(--accent-hover)] hover:shadow-[0_8px_24px_rgba(249,92,75,0.2)] focus:outline-none uppercase tracking-wide mt-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

export default Login
