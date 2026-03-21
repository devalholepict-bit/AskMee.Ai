import React, { useEffect, useState, useCallback, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { useSelector, useDispatch } from 'react-redux'
import { useChat } from '../hooks/useChat'
import { useAuth } from '../../auth/hook/useAuth'
import { useNavigate } from 'react-router'
import { setError, setCurrentChatId } from '../chat.slice'
import remarkGfm from 'remark-gfm'


/* ── Toast notification component ── */
const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className='fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-black/30 animate-[slideIn_0.3s_ease-out]'>
      <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <circle cx='12' cy='12' r='10'></circle>
        <line x1='15' y1='9' x2='9' y2='15'></line>
        <line x1='9' y1='9' x2='15' y2='15'></line>
      </svg>
      <span>{message}</span>
      <button onClick={onClose} className='ml-2 rounded p-0.5 transition hover:bg-white/20'>
        <svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
          <line x1='18' y1='6' x2='6' y2='18'></line>
          <line x1='6' y1='6' x2='18' y2='18'></line>
        </svg>
      </button>
    </div>
  )
}

/* ── Typing indicator (3 pulsing dots) — shown before first token ── */
const TypingIndicator = () => (
  <div className='mr-auto flex items-center gap-1.5 rounded-2xl bg-[var(--bg-card)] px-5 py-3.5'>
    <div className='h-2.5 w-2.5 rounded-full bg-white/40 animate-[pulse_1.2s_ease-in-out_infinite]'></div>
    <div className='h-2.5 w-2.5 rounded-full bg-white/40 animate-[pulse_1.2s_ease-in-out_0.2s_infinite]'></div>
    <div className='h-2.5 w-2.5 rounded-full bg-white/40 animate-[pulse_1.2s_ease-in-out_0.4s_infinite]'></div>
  </div>
)

/* ── Profile dropdown ── */
const ProfileDropdown = ({ username, onLogout, onOpenProfile }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const initials = username ? username.slice(0, 2).toUpperCase() : '??'

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className='relative mt-auto pt-3 border-t border-[var(--border)]'>
      <button
        onClick={() => setOpen(!open)}
        className='flex w-full cursor-pointer items-center justify-between gap-2 transition hover:bg-white/5 p-2 rounded-xl'
      >
        <div className='flex items-center gap-2 max-w-[85%]'>
          <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white'>
            {initials}
          </div>
          <div className='flex flex-col items-start min-w-0'>
            <span className='truncate text-sm font-medium text-white/90 leading-tight'>{username}</span>
            <span className='text-[10px] text-[var(--text-muted)] leading-tight'>Pro Plan</span>
          </div>
        </div>
        <svg className='text-[var(--text-muted)] shrink-0' xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
          <circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle>
        </svg>
      </button>

      {open && (
        <div className='absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xl shadow-black/40 py-1 z-50'>
          <button 
             onClick={() => { setOpen(false); onOpenProfile(); }}
             className='flex w-full items-center gap-2.5 px-4 py-2 text-sm text-[var(--text-main)] transition hover:bg-[#252525]'
          >
            👤 My Profile
          </button>
          
          <div className='mx-3 my-1 border-t border-[var(--border)]'></div>
          <button
            onClick={() => { setOpen(false); onLogout() }}
            className='flex w-full items-center gap-2.5 px-4 py-2 text-sm text-[#F95C4B] transition hover:bg-[#252525]'
          >
            🚪 Log Out
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Profile Modal ── */
const ProfileModal = ({ user, onClose, handleUpdateUsername }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [username, setUsername] = useState(user?.username || '')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const handleSave = async () => {
    if (username.length < 3 || username.length > 20) {
      setError('Username must be 3-20 characters')
      return;
    }
    if (/\s/.test(username)) {
      setError('Username cannot contain spaces')
      return;
    }
    setIsSaving(true);
    setError('');
    const res = await handleUpdateUsername(username);
    if (res.success) {
      setToastMsg('Username updated!');
      setIsEditing(false);
      setTimeout(() => setToastMsg(''), 3000);
    } else {
      setError(res.message);
    }
    setIsSaving(false);
  }

  return (
     <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
       {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}
       <div className="relative w-full max-w-md rounded-2xl bg-[var(--bg-sidebar)] border border-[var(--border)] shadow-2xl p-6">
         <button onClick={onClose} className="absolute top-4 right-4 text-[#888] hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
         </button>
         
         <h2 className="text-xl font-bold text-white mb-6">My Profile</h2>
         
         <div className="flex flex-col items-center mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F95C4B] text-xl font-bold text-white mb-3">
              {(user?.username || '??').slice(0, 2).toUpperCase()}
            </div>
         </div>

         <div className="space-y-4">
           <div>
             <label className="block text-xs font-semibold text-[#888] uppercase tracking-wider mb-1">Username</label>
             <div className="flex items-start gap-2">
               {isEditing ? (
                 <div className="flex-1">
                   <input 
                     type="text" 
                     value={username} 
                     onChange={e => setUsername(e.target.value)} 
                     className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg px-3 py-2 text-white outline-none focus:border-[#F95C4B] transition-colors"
                     autoFocus
                   />
                   {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
                 </div>
               ) : (
                 <div className="flex-1 bg-[var(--bg-main)] border border-transparent rounded-lg px-3 py-2 text-white">
                   {user?.username}
                 </div>
               )}

               {!isEditing ? (
                 <button onClick={() => setIsEditing(true)} className="p-2 text-[#888] hover:text-white transition rounded-lg hover:bg-white/5">
                   ✏️
                 </button>
               ) : (
                 <div className="flex gap-2">
                   <button onClick={handleSave} disabled={isSaving} className="px-3 py-2 bg-[#F95C4B] text-white text-sm font-medium rounded-lg hover:brightness-110 disabled:opacity-50 transition">Save</button>
                   <button onClick={() => { setIsEditing(false); setUsername(user?.username); setError(''); }} className="px-3 py-2 bg-[#333] text-white text-sm font-medium rounded-lg hover:bg-[#444] transition">Cancel</button>
                 </div>
               )}
             </div>
           </div>

           <div>
             <label className="block text-xs font-semibold text-[#888] uppercase tracking-wider mb-1">Email</label>
             <div className="w-full bg-[var(--bg-main)] border border-transparent rounded-lg px-3 py-2 text-[#aaa] cursor-not-allowed opacity-70">
               {user?.email || 'N/A'}
             </div>
           </div>
         </div>
       </div>
     </div>
  )
}

/* ── NEW USERNAME SETUP MODAL ── */
const UsernameSetupModal = ({ user, handleUpdateUsername, onSuccess }) => {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isValid, setIsValid] = useState(false)

  // Validate on change
  useEffect(() => {
    if (!username) {
      setError('');
      setIsValid(false);
      return;
    }
    if (username.length < 3 || username.length > 20) {
      setError('Must be 3-20 characters long');
      setIsValid(false);
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Letters, numbers, & underscores only');
      setIsValid(false);
      return;
    }
    setError('');
    setIsValid(true);
  }, [username])

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setIsSaving(true);
    const res = await handleUpdateUsername(username);
    if (!res.success) {
      setError(res.message);
      setIsValid(false);
      setIsSaving(false);
    } else {
      onSuccess(username);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,0,0,0.85)] px-4">
       <div className="relative w-full max-w-[400px] rounded-[16px] bg-[#1e1e1e] border border-[#2a2a2a] p-[36px] shadow-2xl flex flex-col items-center">
         
         <div className="text-[48px] leading-none mb-4">👋</div>
         
         <h2 className="text-[22px] font-bold text-white mb-2 text-center">Welcome to AskMee.AI!</h2>
         <p className="text-[14px] text-[#888] mb-8 text-center">Pick a username to get started</p>
         
         <form onSubmit={handleSubmit} className="w-full">
           <div className="relative mb-2">
             <input 
               type="text" 
               value={username} 
               onChange={e => setUsername(e.target.value)} 
               placeholder="e.g. arjun_m or curious_dev"
               className={`w-full bg-[var(--bg-main)] border ${error ? 'border-red-500/50 focus:border-red-500' : isValid ? 'border-green-500/50 focus:border-green-500' : 'border-[#333] focus:border-[#F95C4B]'} rounded-xl px-4 py-3 text-white outline-none transition-colors duration-200`}
               autoFocus
             />
             {username.length > 0 && (
               <div className="absolute right-3 top-1/2 -translate-y-1/2">
                 {isValid ? (
                   <span className="text-green-500 text-sm">✓</span>
                 ) : (
                   <span className="text-red-500 text-sm">✗</span>
                 )}
               </div>
             )}
           </div>

           {error ? (
              <p className="text-red-400 text-[11px] mb-6 min-h-[16px]">{error}</p>
           ) : (
              <p className="text-[#555] text-[11px] mb-6 min-h-[16px]">3–20 chars · letters, numbers, _ only</p>
           )}

           <button 
             type="submit" 
             disabled={!isValid || isSaving} 
             className="w-full py-3 bg-[#F95C4B] text-white font-medium rounded-xl hover:brightness-110 disabled:opacity-40 transition"
           >
             {isSaving ? 'Saving...' : 'Continue →'}
           </button>
         </form>
       </div>
    </div>
  )
}

const NavIcon = ({ name }) => {
  switch (name) {
    case 'Home':
      return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
    case 'Search':
      return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
    case 'History':
      return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
    default: return null
  }
}

const DefaultNavItems = ['Home', 'Search', 'History']

/* ── Auto-growing Textarea Component ── */
const AutoGrowTextarea = ({ value, onChange, onKeyDown, disabled, placeholder }) => {
  const textareaRef = useRef(null)

  const handleInput = (e) => {
    const target = e.target
    target.style.height = 'auto'
    target.style.height = `${Math.min(target.scrollHeight, 160)}px`
    onChange(e.target.value)
  }

  useEffect(() => {
    if (textareaRef.current) {
      if (value === '') {
        textareaRef.current.style.height = 'auto'
      } else {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`
      }
    }
  }, [value])

  return (
    <textarea
      ref={textareaRef}
      rows={1}
      value={value}
      onChange={handleInput}
      onKeyDown={onKeyDown}
      disabled={disabled}
      placeholder={placeholder}
      className='w-full resize-none bg-transparent pt-[14px] pb-[14px] pl-3 pr-4 text-[15px] leading-tight text-[var(--text-main)] outline-none placeholder:text-[var(--text-hint)] disabled:cursor-not-allowed disabled:opacity-50 overflow-y-auto'
      style={{ minHeight: '52px', maxHeight: '160px' }}
    />
  )
}

const Dashboard = () => {
  const chat = useChat()
  const { handleLogout, handleUpdateUsername } = useAuth()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const messagesEndRef = useRef(null)
  
  const [showProfileModal, setShowProfileModal] = useState(false)
  
  const [chatInput, setChatInput] = useState('')
  const chats = useSelector((state) => state.chat.chats)
  const currentChatId = useSelector((state) => state.chat.currentChatId)
  const isLoading = useSelector((state) => state.chat.isLoading)
  const isStreaming = useSelector((state) => state.chat.isStreaming)
  const streamingMessage = useSelector((state) => state.chat.streamingMessage)
  const chatError = useSelector((state) => state.chat.error)
  const user = useSelector((state) => state.auth.user)
  
  const [successToast, setSuccessToast] = useState('')
  const [usernameDone, setUsernameDone] = useState(false)

  const showUsernameModal = !usernameDone && user && !user.hasSetUsername

  // Sidebar specific states
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(() => parseInt(localStorage.getItem('askmee_sidebar_width')) || 220)
  const [isSidebarDragging, setIsSidebarDragging] = useState(false)
  const sidebarRef = useRef(null)

  // Track mobile view
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Top Nav specific states
  const [showHistory, setShowHistory] = useState(true)

  useEffect(() => {
    if (!isSidebarDragging) return
    const handleMouseMove = (e) => {
      let w = e.clientX
      if (w < 180) w = 180
      if (w > 320) w = 320
      setSidebarWidth(w)
    }
    const handleMouseUp = () => {
      setIsSidebarDragging(false)
      if (sidebarOpen) {
        localStorage.setItem('askmee_sidebar_width', sidebarWidth)
      }
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isSidebarDragging, sidebarWidth, sidebarOpen])

  // Web Search toggle state
  const [isWebSearch, setIsWebSearch] = useState(false)

  // Current Model Selector state
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false)
  const models = ['AskMee Pro', 'AskMee Fast', 'AskMee Mini']
  const [selectedModel, setSelectedModel] = useState(models[0])
  const modelDropdownRef = useRef(null)

  useEffect(() => {
    chat.setupSocket()
    chat.handleGetChats()
    // eslint-disable-next-line
  }, [])

  // Close model dropdown on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target)) setModelDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Auto-scroll to bottom when new messages/chunks arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chats, streamingMessage, isLoading])

  const dismissError = useCallback(() => {
    dispatch(setError(null))
  }, [dispatch])

  // Handles both button click and enter key inside textarea
  const handleSubmitMessage = (event) => {
    event?.preventDefault?.()
    const trimmedMessage = chatInput.trim()
    if (!trimmedMessage || isLoading) return
    chat.handleSendMessage({ message: trimmedMessage, chatId: currentChatId })
    setChatInput('')
  }
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitMessage()
    }
  }

  const openChat = (chatId) => {
    chat.handleOpenChat(chatId)
    if (isMobile) setSidebarOpen(false)
  }

  const onLogout = async () => {
    await handleLogout()
    navigate('/login')
  }

  const handleNewChat = () => {
    dispatch(setCurrentChatId(null))
    if (isMobile) setSidebarOpen(false)
  }

  const prefillText = (text) => {
    setChatInput(text)
  }

  const showStreamingBubble = isStreaming && streamingMessage && (
    streamingMessage.chatId === currentChatId || streamingMessage.chatId === "__pending__"
  )

  const activeChatData = currentChatId ? chats[currentChatId] : null;

  const renderModelDropdown = () => (
    <div className="relative" ref={modelDropdownRef}>
      <button
        type="button"
        onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
        className="flex items-center gap-1.5 px-3 py-1 bg-[var(--bg-main)] sm:bg-[var(--bg-card)] rounded-full text-xs font-medium text-[var(--text-main)] hover:text-white transition group border border-transparent hover:border-[#2e2e2e]"
      >
        <span className="truncate max-w-[80px] sm:max-w-none">{selectedModel}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-muted)] group-hover:text-white transition"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </button>

      {modelDropdownOpen && (
        <div className="absolute bottom-full right-0 mb-3 w-48 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xl shadow-black/40 py-1.5 z-50">
          {models.map(m => (
            <button
              key={m}
              type="button"
              onClick={() => { setSelectedModel(m); setModelDropdownOpen(false) }}
              className="w-full flex items-center justify-between px-4 py-2 text-sm text-[var(--text-main)] transition hover:bg-[#252525]"
            >
              <div className="flex items-center gap-2">
                {selectedModel === m ? <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" /> : <div className="w-1.5 h-1.5" />}
                {m}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )

  const renderInputBar = (isWelcomeScreen = false) => (
    <div className={`relative ${isWelcomeScreen ? 'w-full max-w-[620px]' : 'w-full max-w-[800px] mx-auto'}`}>
      <form 
        onSubmit={handleSubmitMessage} 
        className={`relative flex flex-col w-full rounded-[16px] border-[1.5px] border-[#2e2e2e] bg-[var(--bg-card)] transition-colors duration-150 focus-within:border-[var(--accent)]`}
      >
        {/* Top: AutoGrow Textarea Row */}
        <div className="flex w-full min-h-[52px]">
          <div className="pl-3.5 pt-[14px] shrink-0">
             {/* Left icon placeholder matching original reference if necessary or just search glass */}
             {isWelcomeScreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-hint)] mt-0.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
             ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-hint)] mt-0.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
             )}
          </div>
          <AutoGrowTextarea 
            value={chatInput} 
            onChange={setChatInput} 
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={isWelcomeScreen ? 'What can I do for you today?' : 'Reply to AskMee...'} 
          />
        </div>

        {/* Bottom: Actions Row */}
        <div className="flex items-center justify-between pl-3 pr-2 pb-2">
           <div className="flex items-center gap-1.5">
             {/* Left sided actions like attach / search */}
             <button 
                type="button"
                onClick={() => setIsWebSearch(!isWebSearch)}
                className={`flex items-center gap-1.5 text-[12px] font-medium transition-colors px-2 py-1.5 rounded-full ${isWebSearch ? 'text-[var(--accent)] bg-[rgba(249,92,75,0.1)]' : 'text-[var(--text-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                <span className="hidden sm:inline">Web Search</span>
              </button>
              <button type="button" className="flex items-center gap-1 text-[12px] font-medium px-2 py-1.5 rounded-full text-[var(--text-muted)] hover:text-white transition hover:bg-[rgba(255,255,255,0.05)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                <span className="hidden sm:inline">Attach</span>
              </button>
           </div>
           
           <div className="flex items-center gap-2">
             {renderModelDropdown()}
             <button
                type='submit'
                disabled={!chatInput.trim() || isLoading}
                className='shrink-0 rounded-full bg-[var(--accent)] flex items-center justify-center w-[36px] h-[36px] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 shadow-sm'
              >
                {isLoading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                )}
              </button>
           </div>
        </div>
      </form>
      {!isWelcomeScreen && (
         <div className="text-center mt-2.5">
           <span className="text-[11px] text-[#555] hidden sm:block">AskMee.AI searches the live web · Verify important info</span>
         </div>
      )}
    </div>
  )

  const renderToggleButton = () => (
    <button 
      onClick={() => setSidebarOpen(prev => !prev)}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '6px 8px',
        borderRadius: '6px',
        color: '#888',
        display: 'flex',
        alignItems: 'center',
        marginRight: '8px',
      }}
      title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      className="hover:text-[#F95C4B] transition-colors"
    >
      {sidebarOpen ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><path d="M14 15l-3-3 3-3"></path></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><path d="M14 9l3 3-3 3"></path></svg>
      )}
    </button>
  )

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 40,
          }}
        />
      )}

      <main className='flex h-screen w-full bg-[var(--bg-main)] text-[var(--text-main)] font-sans'>

        {/* ── LEFT SIDEBAR (resizable) ── */}
        <aside 
          ref={sidebarRef}
          style={{ 
            width: sidebarOpen ? `${sidebarWidth}px` : '0px',
            minWidth: sidebarOpen ? `${sidebarWidth}px` : '0px',
            maxWidth: sidebarOpen ? `${sidebarWidth}px` : '0px',
            overflow: 'hidden',
            transition: isSidebarDragging ? 'none' : 'all 200ms ease',
            ...(sidebarOpen && isMobile ? { position: 'fixed', zIndex: 50, height: '100%' } : {})
          }}
          className='relative h-full shrink-0 border-r border-[#252525] bg-[#1a1a1a] flex-col flex'
        >
          {/* Drag Handle */}
          {sidebarOpen && (
            <div 
              className="absolute top-0 right-0 w-[4px] h-full cursor-col-resize hover:bg-[var(--accent)] hover:opacity-50 z-20 transition-colors"
              onMouseDown={() => setIsSidebarDragging(true)}
            />
          )}

          <div className="p-4 flex flex-col h-full min-w-0" style={{ opacity: sidebarOpen ? 1 : 0, transition: 'opacity 200ms ease' }}>
            {/* Top Section */}
            <div className='flex items-center justify-between mb-5 px-1 shrink-0'>
              <h1 className='text-[20px] font-bold tracking-tight truncate'>
                <span className="text-white">AskMee</span><span className='text-[var(--accent)]'>.AI</span>
              </h1>
              <button 
                onClick={() => setSidebarOpen(false)} 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
                className='text-[#444] hover:text-[#888] transition shrink-0 ml-2' 
                title="Close sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><path d="M14 15l-3-3 3-3"></path></svg>
              </button>
            </div>

            {/* New Chat Button */}
            <button
              onClick={handleNewChat}
              className='group w-full flex items-center justify-center gap-2 rounded-lg border border-[#2e2e2e] bg-transparent px-3 py-2 text-sm font-medium text-[var(--text-main)] transition-colors duration-150 hover:border-[var(--accent)] hover:text-white mb-5 shrink-0'
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors shrink-0">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span className="truncate">New Chat</span>
            </button>

            {/* Nav Items */}
            <nav className='flex flex-col mb-4 space-y-0.5 shrink-0'>
              {DefaultNavItems.map(item => {
                const isHistory = item === 'History'
                const isActive = item === 'Home' && !currentChatId;
                
                const handleClick = () => {
                  if (isHistory) setShowHistory(!showHistory)
                  else if (!isActive) handleNewChat()
                }

                return (
                  <button 
                    key={item} 
                    onClick={handleClick} 
                    className={`group flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${isActive ? 'bg-[rgba(249,92,75,0.10)] text-[var(--accent)] border-l-[2px] border-[var(--accent)] rounded-l-none font-medium' : 'text-[#666] hover:bg-[#252525] hover:text-[#ccc] border-l-[2px] border-transparent font-normal'}`}
                  >
                    <div className="shrink-0"><NavIcon name={item} /></div>
                    <span className="truncate text-left flex-1">{item}</span>
                    {isHistory && (
                       <svg className={`shrink-0 text-[#555] group-hover:text-[#888] transition-transform duration-200 ${showHistory ? '' : '-rotate-90'}`} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    )}
                  </button>
                )
              })}
            </nav>

            {/* Chat History */}
            <div className={`flex flex-col min-h-0 overflow-hidden transition-[max-height] duration-200 ease-in-out ${showHistory ? 'max-h-[50vh] flex-1' : 'max-h-0'}`}>
              <h3 className='text-[10px] font-semibold text-[#444] uppercase tracking-wider mb-2 px-3 shrink-0'>Recent</h3>
              <div className='flex-1 overflow-y-auto space-y-0.5 pr-1 pb-2'>
                {Object.values(chats).map((c) => (
                  <div
                    key={c.id}
                    className={`group relative flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150
                      ${currentChatId === c.id
                        ? 'border-l-[2px] border-[var(--accent)] rounded-l-none bg-[rgba(255,255,255,0.03)] text-white'
                        : 'border-l-[2px] border-transparent text-[#aaa] hover:bg-[#252525] hover:text-white'
                      }`}
                    onClick={() => openChat(c.id)}
                  >
                    <span className='truncate pr-6 font-medium flex-1'>{c.title}</span>
                    <button
                      type='button'
                      onClick={(e) => { e.stopPropagation(); chat.handleDeleteChat(c.id) }}
                      className='absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#666] opacity-0 transition hover:text-red-400 group-hover:opacity-100 bg-[#252525] hover:bg-[#333]'
                      title='Delete chat'
                    >
                      <svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                        <polyline points='3 6 5 6 21 6'></polyline>
                        <path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'></path>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Profile Row */}
            <div className="mt-auto pt-2 bg-[var(--bg-sidebar)]">
              <ProfileDropdown 
                 username={user?.username || 'User'} 
                 onLogout={onLogout} 
                 onOpenProfile={() => setShowProfileModal(true)}
              />
            </div>
            
          </div>
        </aside>

        {/* ── MAIN AREA ── */}
        <section className='relative flex h-full min-w-0 flex-1 flex-col bg-[var(--bg-main)]'>

          {/* Welcome Screen Topbar (for toggle button) */}
          {!currentChatId && (
            <header className="absolute top-0 left-0 z-10 w-full shrink-0 flex items-center px-6 h-[52px]">
              {renderToggleButton()}
            </header>
          )}

          {!currentChatId ? (
            /* ── WELCOME SCREEN ── */
            <div className="flex flex-col h-full w-full overflow-y-auto pt-[10vh] pb-[10vh]">
              {/* Horizontally centered block, text left-aligned */}
              <div className="w-full max-w-[620px] mx-auto px-6 text-left">
                
                {/* Greeting Text */}
                <div className="mb-2">
                  <p className="text-[16px] text-[#666]">Hello, I am</p>
                  <h2 className="text-[44px] font-bold leading-tight mt-1 mb-2">
                    <span className="text-white">AskMee</span><span className="text-[var(--accent)]">.AI</span>
                  </h2>
                  <h3 className="text-[32px] font-semibold text-[#ddd] leading-tight mb-2">Do you need my guidance?</h3>
                  <p className="text-[15px] text-[#555] mb-[32px]">More than just a search, it's answers you can trust.</p>
                </div>

                {/* Main Input */}
                {renderInputBar(true)}

                {/* Inspiration Cards */}
                <div className="mt-[32px] mb-8 w-full max-w-[620px]">
                  <h4 className="text-[15px] font-medium text-[#888] mb-4">Here's some inspiration for you</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={() => prefillText("Search the web for the latest advancements in AI agents")} className="text-left bg-[var(--bg-card)] border border-[var(--border)] rounded-[12px] p-4 transition-colors duration-150 hover:border-[var(--accent)] group min-w-[160px]">
                      <div className="text-[18px] mb-2">🌐</div>
                      <h5 className="font-semibold text-white text-[15px] mb-1">Web Search</h5>
                      <p className="text-[13px] text-[var(--text-muted)] leading-snug">Real-time internet results with citations</p>
                    </button>
                    <button onClick={() => prefillText("Give me a deep research analysis on quantum computing")} className="text-left bg-[var(--bg-card)] border border-[var(--border)] rounded-[12px] p-4 transition-colors duration-150 hover:border-[var(--accent)] group min-w-[160px]">
                      <div className="text-[18px] mb-2">🔬</div>
                      <h5 className="font-semibold text-white text-[15px] mb-1">Deep Research</h5>
                      <p className="text-[13px] text-[var(--text-muted)] leading-snug">Multi-source comprehensive analysis</p>
                    </button>
                    <button onClick={() => prefillText("Can you help me draft an email proposing a new AI feature?")} className="text-left bg-[var(--bg-card)] border border-[var(--border)] rounded-[12px] p-4 transition-colors duration-150 hover:border-[var(--accent)] group min-w-[160px]">
                      <div className="text-[18px] mb-2">✍️</div>
                      <h5 className="font-semibold text-white text-[15px] mb-1">AI Writing</h5>
                      <p className="text-[13px] text-[var(--text-muted)] leading-snug">Drafts, summaries, and rewrites</p>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            /* ── CHAT VIEW ── */
            <div className="flex flex-col h-full relative">

              {/* Top Bar (Sticky) */}
              <header className="absolute top-0 left-0 z-10 w-full shrink-0 flex items-center justify-between px-6 h-[52px] bg-[rgba(23,22,22,0.9)] backdrop-blur-sm border-b border-[#222]">
                <div className="flex items-center w-full max-w-[60%]">
                  {renderToggleButton()}
                  <div className="truncate text-[14px] text-[#ccc] font-medium ml-1">
                    {activeChatData?.title || 'New Chat'}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block">
                    {/* Compact model view or hide entirely, kept from previous iteration */}
                    <span className="text-xs text-[#666] border border-[#2e2e2e] px-2 py-1 rounded-full">{selectedModel}</span>
                  </div>
                  <button className="text-[var(--text-muted)] hover:text-[var(--accent)] transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                  </button>
                </div>
              </header>

              {/* Messages Area */}
              <div className="messages flex-1 overflow-y-auto w-full mx-auto px-4 sm:px-6 pt-[70px] pb-40">
                <div className="space-y-6 max-w-[800px] mx-auto">
                  {chats[currentChatId]?.messages.map((message, index) => (
                    <div key={index} className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                      {/* AI Avatar */}
                      {message.role !== 'user' && (
                        <div className="shrink-0 mr-3 mt-1">
                          <div className="h-7 w-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-xs font-bold text-white">
                            A
                          </div>
                        </div>
                      )}

                      <div className={`text-[15px] space-y-2 ${message.role === 'user'
                        ? 'max-w-[70%] bg-[rgba(249,92,75,0.12)] text-white px-4 py-3 rounded-tl-[12px] rounded-tr-[12px] rounded-bl-[12px] rounded-br-[2px]'
                        : 'max-w-[80%] bg-[var(--bg-card)] text-[var(--text-main)] px-4 py-3 rounded-tl-[12px] rounded-tr-[12px] rounded-bl-[2px] rounded-br-[12px] border border-[var(--border)] shadow-sm'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        ) : (
                          <>
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <p className='mb-3 last:mb-0 leading-relaxed'>{children}</p>,
                                ul: ({ children }) => <ul className='mb-3 list-disc pl-5 space-y-1'>{children}</ul>,
                                ol: ({ children }) => <ol className='mb-3 list-decimal pl-5 space-y-1'>{children}</ol>,
                                code: ({ children }) => <code className='rounded bg-white/10 px-1 py-0.5 text-[#ff8f82] font-mono text-[13px]'>{children}</code>,
                                pre: ({ children }) => <pre className='mb-3 overflow-x-auto rounded-xl bg-black/40 p-4 border border-[#333] font-mono text-[13px]'>{children}</pre>,
                                h1: ({ children }) => <h1 className='text-xl font-bold mb-3 text-white'>{children}</h1>,
                                h2: ({ children }) => <h2 className='text-lg font-bold mb-2 text-white mt-4'>{children}</h2>,
                                h3: ({ children }) => <h3 className='text-base font-bold mb-2 text-white mt-3'>{children}</h3>,
                                a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className='text-[var(--accent)] hover:underline'>{children}</a>,
                                li: ({ children }) => <li className='leading-relaxed'>{children}</li>
                              }}
                              remarkPlugins={[remarkGfm]}
                            >
                              {message.content}
                            </ReactMarkdown>

                            {/* Source tags placeholder */}
                            {message.content.length > 50 && (
                              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#333]">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-main)] border border-[#333] rounded-full text-[#aaa] hover:border-[var(--accent)] hover:text-white cursor-pointer transition">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                  Sources
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Streaming Response */}
                  {showStreamingBubble && (
                    <div className="flex w-full justify-start">
                      <div className="shrink-0 mr-3 mt-1">
                        <div className="h-7 w-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-xs font-bold text-white">
                          A
                        </div>
                      </div>

                      <div className="text-[15px] space-y-2 max-w-[80%] bg-[var(--bg-card)] text-[var(--text-main)] px-4 py-3 rounded-tl-[12px] rounded-tr-[12px] rounded-bl-[2px] rounded-br-[12px] shadow-sm border border-[var(--border)]">
                        {streamingMessage.content.length === 0 ? (
                          <TypingIndicator />
                        ) : (
                          <>
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <p className='mb-3 last:mb-0 leading-relaxed'>{children}</p>,
                                ul: ({ children }) => <ul className='mb-3 list-disc pl-5 space-y-1'>{children}</ul>,
                                ol: ({ children }) => <ol className='mb-3 list-decimal pl-5 space-y-1'>{children}</ol>,
                                code: ({ children }) => <code className='rounded bg-white/10 px-1 py-0.5 text-[#ff8f82] font-mono text-[13px]'>{children}</code>,
                                pre: ({ children }) => <pre className='mb-3 overflow-x-auto rounded-xl bg-black/40 p-4 border border-[#333] font-mono text-[13px]'>{children}</pre>,
                                h1: ({ children }) => <h1 className='text-xl font-bold mb-3 text-white'>{children}</h1>,
                                h2: ({ children }) => <h2 className='text-lg font-bold mb-2 text-white mt-4'>{children}</h2>,
                                h3: ({ children }) => <h3 className='text-base font-bold mb-2 text-white mt-3'>{children}</h3>,
                                li: ({ children }) => <li className='leading-relaxed'>{children}</li>
                              }}
                              remarkPlugins={[remarkGfm]}
                            >
                              {streamingMessage.content}
                            </ReactMarkdown>
                            <span className='inline-block w-1.5 h-4 bg-[var(--accent)] ml-1 align-middle' style={{ animation: 'blink 1s step-end infinite' }}></span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} className="h-4" />
                </div>
              </div>

              {/* Bottom Input Area (Sticky) */}
              <footer className="absolute bottom-0 left-0 w-full bg-[var(--bg-main)] border-t border-[#222] px-[24px] pb-[20px] pt-[16px]">
                {renderInputBar(false)}
              </footer>

            </div>
          )}
        </section>
      </main>

      {showProfileModal && (
        <ProfileModal 
          user={user} 
          onClose={() => setShowProfileModal(false)}
          handleUpdateUsername={handleUpdateUsername}
        />
      )}

      {showUsernameModal && (
        <UsernameSetupModal 
          user={user}
          handleUpdateUsername={handleUpdateUsername}
          onSuccess={(username) => {
            setUsernameDone(true);
            setSuccessToast(`Welcome, ${username}! 🎉`);
          }}
        />
      )}

      {chatError && <Toast message={chatError} onClose={dismissError} />}
      {successToast && <Toast message={successToast} onClose={() => setSuccessToast('')} />}
    </>
  )
}

export default Dashboard