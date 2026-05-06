import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const storageKeys = {
  chatLog: 'forge-chat-log',
  chatOpen: 'forge-chat-open',
  chatSound: 'forge-chat-sound',
}

function formatChatTime(ts) {
  const d = new Date(ts || Date.now())
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function playNotification() {
  if (localStorage.getItem(storageKeys.chatSound) === 'off') return
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.value = 0.03
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.08)
  } catch {
    // Ignore audio failures.
  }
}

function getAIReply(input) {
  const value = input.toLowerCase()
  if (value.includes('hello') || value.includes('hi')) return 'Hello! Welcome to The Ember Network.'
  if (value.includes('join') || value.includes('membership')) return 'You can join from the Join Community page. We will review your application and onboard you.'
  if (value.includes('program')) return 'Explore the Programs page for modules and the Program Components page for the full breakdown.'
  if (value.includes('idea')) return 'Start by defining one urgent problem, validate with real users, and iterate quickly with mentor feedback.'
  if (value.includes('help')) return "I can help with joining the network, programs, and startup guidance. Ask me anything."
  return "I'm here to help you grow your ideas."
}

function readHistory() {
  try {
    const v = JSON.parse(localStorage.getItem(storageKeys.chatLog) || '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

function writeHistory(next) {
  localStorage.setItem(storageKeys.chatLog, JSON.stringify(next.slice(-40)))
}

export function ChatWidget() {
  const location = useLocation()
  const widgetRef = useRef(null)
  const messagesRef = useRef(null)

  const quickReplies = useMemo(() => ['Join Network', 'Get Help', 'See Programs'], [])
  const [open, setOpen] = useState(() => localStorage.getItem(storageKeys.chatOpen) === '1')
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem(storageKeys.chatSound) !== 'off')
  const [value, setValue] = useState('')
  const [typing, setTyping] = useState(false)
  const [messages, setMessages] = useState(() => {
    const history = readHistory()
    if (history.length) return history
    const seed = [{ role: 'assistant', text: 'Hello! I am Ember Assistant. How can I help today?', ts: Date.now() }]
    writeHistory(seed)
    return seed
  })

  useEffect(() => {
    localStorage.setItem(storageKeys.chatOpen, open ? '1' : '0')
  }, [open])

  useEffect(() => {
    localStorage.setItem(storageKeys.chatSound, soundOn ? 'on' : 'off')
  }, [soundOn])

  useEffect(() => {
    writeHistory(messages)
    const el = messagesRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, typing])

  useEffect(() => {
    const onDocClick = (e) => {
      if (!open) return
      if (!widgetRef.current) return
      if (!widgetRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape' && open) setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    // Keep chat stable across navigation; no-op but pins dependency for future.
  }, [location.pathname])

  const addMessage = (role, text) => {
    setMessages((prev) => [...prev, { role, text, ts: Date.now() }])
  }

  const send = (text) => {
    const trimmed = (text || '').trim()
    if (!trimmed) return
    addMessage('user', trimmed)
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      addMessage('assistant', getAIReply(trimmed))
      playNotification()
    }, 1100)
  }

  return (
    <div ref={widgetRef} id="chat-widget" className="fixed bottom-5 right-4 z-[9999]">
      <button
        id="chat-toggle"
        type="button"
        className="relative grid h-14 w-14 place-content-center rounded-full bg-orange-500 text-white shadow-glow transition-all duration-200 ease-out hover:scale-[1.04] hover:shadow-lg active:scale-[0.98]"
        onClick={() => setOpen((v) => !v)}
        aria-label="Chat with us"
      >
        <span className="absolute inset-0 rounded-full border border-orange-300/80 animate-pulseRing" />
        💬
      </button>
      <div
        id="chat-panel"
        className={[
          'absolute bottom-16 right-0 w-[340px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl transition-all duration-200 ease-out dark:border-zinc-800 dark:bg-zinc-900 md:w-[360px]',
          open ? 'opacity-100 translate-y-0 scale-100' : 'pointer-events-none opacity-0 translate-y-3 scale-[0.98]',
        ].join(' ')}
        aria-hidden={open ? 'false' : 'true'}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-content-center rounded-full bg-orange-500 text-sm font-semibold text-white">EN</div>
            <div>
              <p className="text-sm font-semibold">Ember Assistant</p>
              <p className="text-xs text-emerald-500">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="chat-sound-toggle"
              type="button"
              onClick={() => setSoundOn((v) => !v)}
              className="rounded-full border border-zinc-300 px-2.5 py-1 text-[11px] font-medium text-zinc-600 transition-colors duration-200 ease-out hover:border-orange-400 dark:border-zinc-700 dark:text-zinc-300"
            >
              Sound: {soundOn ? 'On' : 'Off'}
            </button>
            <button
              id="chat-close"
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-zinc-300 px-2.5 py-1 text-xs font-medium transition-colors duration-200 ease-out hover:border-orange-400 dark:border-zinc-700"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
        </div>

        <div ref={messagesRef} id="chat-messages" className="no-scrollbar h-[58vh] max-h-[460px] space-y-3 overflow-y-auto bg-zinc-50 p-4 text-sm dark:bg-zinc-950/60">
          {messages.map((m, idx) => (
            <div key={`${m.role}-${idx}`} className={m.role === 'user' ? 'ml-auto w-fit max-w-[86%]' : 'w-fit max-w-[86%]'}>
              <div className={m.role === 'user' ? 'rounded-2xl rounded-br-sm bg-orange-500 px-3 py-2 text-white' : 'rounded-2xl rounded-bl-sm bg-zinc-200 px-3 py-2 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100'}>
                {m.text}
              </div>
              <p className={`mt-1 text-[10px] text-zinc-500 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                {formatChatTime(m.ts)}
              </p>
            </div>
          ))}
          {typing ? (
            <div className="w-fit max-w-[86%]">
              <div className="rounded-2xl rounded-bl-sm bg-zinc-200 px-3 py-2 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.1s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500" />
                </span>
              </div>
            </div>
          ) : null}
        </div>

        <div className="border-t border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-2 flex flex-wrap gap-2">
            {quickReplies.map((qr) => (
              <button
                key={qr}
                type="button"
                className="quick-reply rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors duration-200 ease-out hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                onClick={() => send(qr)}
              >
                {qr}
              </button>
            ))}
            <Link
              to="/apply"
              className="quick-reply inline-flex items-center rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors duration-200 ease-out hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Apply
            </Link>
          </div>
          <form
            id="chat-form"
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              send(value)
              setValue('')
            }}
          >
            <input
              id="chat-input"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm leading-snug outline-none transition-colors duration-200 ease-out focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="Type a message..."
            />
            <button
              className="grid h-10 w-10 shrink-0 place-content-center rounded-xl bg-orange-500 text-white shadow-sm transition-all duration-200 ease-out hover:bg-orange-400 hover:shadow active:scale-[0.97]"
              aria-label="Send message"
            >
              ➤
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

