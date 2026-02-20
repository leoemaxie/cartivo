/**
 * Cartivo Voice™ UI Component
 *
 * Provides a full-screen voice agent interface:
 *   - Animated microphone button (start / stop)
 *   - Live transcript display
 *   - Conversation history
 *   - Real-time action log (function calls + results)
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Mic, MicOff, Sparkles, Zap, ShoppingCart, FileText, CheckCircle, XCircle, Loader2, Volume2 } from 'lucide-react'
import {
  CartivoVoiceAgent,
  AgentStatus,
  ConversationMessage,
  ActionLogEntry,
} from '@/services/deepgramVoiceAgent'

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<AgentStatus, string> = {
  idle: 'Tap mic to start',
  connecting: 'Connecting…',
  listening: 'Listening…',
  thinking: 'Thinking…',
  speaking: 'Speaking…',
  function_calling: 'Executing action…',
  error: 'Error — tap to retry',
  closed: 'Session ended',
}

const STATUS_COLORS: Record<AgentStatus, string> = {
  idle: 'bg-slate-100 text-slate-500',
  connecting: 'bg-amber-50 text-amber-600',
  listening: 'bg-green-50 text-green-600',
  thinking: 'bg-indigo-50 text-indigo-600',
  speaking: 'bg-purple-50 text-purple-600',
  function_calling: 'bg-blue-50 text-blue-600',
  error: 'bg-red-50 text-red-600',
  closed: 'bg-slate-100 text-slate-500',
}

const ACTION_ICONS: Record<ActionLogEntry['type'], React.ReactNode> = {
  generateBundle: <Sparkles className="w-4 h-4" />,
  addToCart: <ShoppingCart className="w-4 h-4" />,
  getConfidenceScore: <Zap className="w-4 h-4" />,
  generateShoppingReport: <FileText className="w-4 h-4" />,
  checkout: <CheckCircle className="w-4 h-4" />,
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CartivoVoice() {
  const [status, setStatus] = useState<AgentStatus>('idle')
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [actionLog, setActionLog] = useState<ActionLogEntry[]>([])
  const [liveTranscript, setLiveTranscript] = useState('')
  const [errorBanner, setErrorBanner] = useState<string | null>(null)
  const agentRef = useRef<CartivoVoiceAgent | null>(null)
  const conversationEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll conversation
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, liveTranscript])

  const handleStart = useCallback(async () => {
    setErrorBanner(null)
    setLiveTranscript('')

    const agent = new CartivoVoiceAgent({
      onStatusChange: (s) => setStatus(s),
      onMessage: (msg) =>
        setMessages((prev) => {
          // Avoid exact duplicates from rapid events
          if (prev.length > 0 && prev[prev.length - 1].content === msg.content && prev[prev.length - 1].role === msg.role) {
            return prev
          }
          return [...prev, msg]
        }),
      onActionLog: (entry) =>
        setActionLog((prev) => {
          const idx = prev.findIndex((e) => e.id === entry.id)
          if (idx >= 0) {
            const next = [...prev]
            next[idx] = entry
            return next
          }
          return [...prev, entry]
        }),
      onTranscript: (text, isFinal) => {
        if (isFinal) {
          setLiveTranscript('')
        } else {
          setLiveTranscript(text)
        }
      },
      onError: (err) => setErrorBanner(err),
    })

    agentRef.current = agent
    await agent.start()
  }, [])

  const handleStop = useCallback(() => {
    agentRef.current?.stop()
    agentRef.current = null
    setLiveTranscript('')
  }, [])

  const isActive = status !== 'idle' && status !== 'error' && status !== 'closed'

  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3 sticky top-0 z-20">
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
          <Sparkles className="w-5 h-5 text-white" fill="currentColor" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-none">Cartivo Voice™</h1>
          <p className="text-xs text-slate-500 mt-0.5">Powered by Deepgram Voice Agent</p>
        </div>

        {/* Status chip */}
        <div className={`ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status]}`}>
          {(status === 'connecting' || status === 'thinking' || status === 'function_calling') && (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          )}
          {status === 'listening' && (
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          )}
          {status === 'speaking' && (
            <Volume2 className="w-3.5 h-3.5" />
          )}
          {STATUS_LABELS[status]}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden gap-0 md:gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full">
        {/* Left — Conversation + Mic */}
        <div className="flex flex-col flex-1 gap-4 min-w-0">
          {/* Error banner */}
          <AnimatePresence>
            {errorBanner && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm flex items-start gap-2"
              >
                <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errorBanner}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Conversation */}
          <div className="flex-1 overflow-y-auto rounded-2xl bg-white border border-slate-200 p-4 space-y-3 min-h-[320px] max-h-[50vh]">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-slate-400 py-12">
                <Mic className="w-10 h-10 text-slate-300" />
                <p className="text-sm font-medium">Start a conversation with Cartivo Voice™</p>
                <p className="text-xs max-w-xs">
                  Try: &ldquo;Cartivo, build me a minimalist office outfit under ₦150,000&rdquo;
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'agent' && (
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-white" fill="currentColor" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-md'
                      : 'bg-slate-100 text-slate-800 rounded-bl-md'
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}

            {/* Live interim transcript */}
            {liveTranscript && (
              <div className="flex justify-end">
                <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-md bg-indigo-200/60 text-indigo-800 text-sm italic">
                  {liveTranscript}…
                </div>
              </div>
            )}

            <div ref={conversationEndRef} />
          </div>

          {/* Mic control */}
          <div className="flex flex-col items-center gap-3 py-4">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={isActive ? handleStop : handleStart}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400 ${
                isActive
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
              aria-label={isActive ? 'Stop voice agent' : 'Start voice agent'}
            >
              {/* Pulse ring when listening */}
              {status === 'listening' && (
                <>
                  <span className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-30" />
                  <span className="absolute inset-[-6px] rounded-full border-2 border-indigo-300 opacity-40" />
                </>
              )}
              {isActive ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            </motion.button>
            <p className="text-xs text-slate-500 font-medium">
              {isActive ? 'Tap to stop' : 'Tap to speak'}
            </p>
          </div>
        </div>

        {/* Right — Action Log */}
        <div className="hidden md:flex flex-col w-80 shrink-0 gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex-1 overflow-y-auto max-h-[70vh]">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
              Action Log
            </h2>

            {actionLog.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Zap className="w-8 h-8 mx-auto mb-2 text-slate-200" />
                <p className="text-xs">Actions will appear here when the agent executes functions.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {actionLog.map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`rounded-xl p-3 border text-xs ${
                        entry.status === 'pending'
                          ? 'border-blue-200 bg-blue-50'
                          : entry.status === 'success'
                          ? 'border-green-200 bg-green-50'
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-semibold mb-1">
                        <span
                          className={
                            entry.status === 'pending'
                              ? 'text-blue-600'
                              : entry.status === 'success'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }
                        >
                          {ACTION_ICONS[entry.type]}
                        </span>
                        <span className="text-slate-700 leading-snug">{entry.label}</span>
                        {entry.status === 'pending' && (
                          <Loader2 className="w-3 h-3 animate-spin text-blue-500 ml-auto shrink-0" />
                        )}
                        {entry.status === 'success' && (
                          <CheckCircle className="w-3 h-3 text-green-500 ml-auto shrink-0" />
                        )}
                        {entry.status === 'error' && (
                          <XCircle className="w-3 h-3 text-red-500 ml-auto shrink-0" />
                        )}
                      </div>
                      {entry.detail && (
                        <p className="text-slate-500 leading-snug pl-6">{entry.detail}</p>
                      )}
                      <p className="text-slate-400 pl-6 mt-0.5">
                        {entry.timestamp.toLocaleTimeString()}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Suggestion chips */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
              Try saying…
            </h2>
            <div className="space-y-2">
              {[
                'Build me an office outfit under ₦150,000',
                'Find a smart casual look for ₦80,000',
                'Add the bundle to my cart',
                "What's the confidence score?",
                'Generate a shopping report',
              ].map((s) => (
                <div
                  key={s}
                  className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 leading-snug"
                >
                  &ldquo;{s}&rdquo;
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartivoVoice
