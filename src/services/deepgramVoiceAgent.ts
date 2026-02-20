/**
 * Cartivo Voice™ — Deepgram Voice Agent Service
 *
 * Connects to the Deepgram Voice Agent API via WebSocket.
 * Handles microphone streaming, function calling, and session lifecycle.
 *
 * Deepgram Voice Agent API docs:
 *   https://developers.deepgram.com/docs/voice-agent-api
 */

import { buildSmartSetup, SetupConstraints, SetupBuilderResult } from './setupBuilder'
import { addItemsToCart, getCart, Cart, CartItem } from './cartStore'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AgentStatus =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'function_calling'
  | 'error'
  | 'closed'

export interface ConversationMessage {
  id: string
  role: 'user' | 'agent' | 'system'
  content: string
  timestamp: Date
}

export interface ActionLogEntry {
  id: string
  type: 'generateBundle' | 'addToCart' | 'getConfidenceScore' | 'generateShoppingReport' | 'checkout'
  status: 'pending' | 'success' | 'error'
  label: string
  detail?: string
  timestamp: Date
}

export interface VoiceAgentCallbacks {
  onStatusChange: (status: AgentStatus) => void
  onMessage: (msg: ConversationMessage) => void
  onActionLog: (entry: ActionLogEntry) => void
  onTranscript: (text: string, isFinal: boolean) => void
  onError: (error: string) => void
}

// ---------------------------------------------------------------------------
// Function calling schemas (sent to Deepgram as tool definitions)
// ---------------------------------------------------------------------------

const FUNCTION_DEFINITIONS = [
  {
    name: 'generateBundle',
    description:
      'Compute an optimised product bundle that matches the user\'s budget, style, and category preferences. Always call this first when the user asks for a recommendation.',
    parameters: {
      type: 'object',
      properties: {
        budget: {
          type: 'number',
          description: 'Maximum total budget in Naira (₦). Ask the user if not provided.',
        },
        style: {
          type: 'string',
          description:
            'Style preference, e.g. minimalist, modern, casual, office, streetwear, sustainable.',
        },
        category: {
          type: 'string',
          description:
            'Comma-separated product categories, e.g. "tops,bottoms,shoes" or "jacket,trousers,belt".',
        },
      },
      required: ['budget', 'style', 'category'],
    },
  },
  {
    name: 'addToCart',
    description: 'Add the last generated bundle to the user\'s cart. Always confirm with the user before calling this.',
    parameters: {
      type: 'object',
      properties: {
        bundleId: {
          type: 'string',
          description: 'The bundle session ID returned by generateBundle.',
        },
      },
      required: ['bundleId'],
    },
  },
  {
    name: 'getConfidenceScore',
    description: 'Return the AI Confidence Index™ score for a generated bundle.',
    parameters: {
      type: 'object',
      properties: {
        bundleId: {
          type: 'string',
          description: 'The bundle session ID.',
        },
      },
      required: ['bundleId'],
    },
  },
  {
    name: 'generateShoppingReport',
    description: 'Generate a detailed shopping report summary for a bundle.',
    parameters: {
      type: 'object',
      properties: {
        bundleId: {
          type: 'string',
          description: 'The bundle session ID.',
        },
      },
      required: ['bundleId'],
    },
  },
  {
    name: 'checkout',
    description:
      'Initiate checkout for the current cart. Always confirm with the user before calling this.',
    parameters: {
      type: 'object',
      properties: {
        cartId: {
          type: 'string',
          description: 'The cart ID to check out.',
        },
      },
      required: ['cartId'],
    },
  },
]

// ---------------------------------------------------------------------------
// Session state (in-memory only — no audio stored)
// ---------------------------------------------------------------------------

interface BundleSession {
  bundleId: string
  result: SetupBuilderResult
  constraints: SetupConstraints
  confidenceScore: number
}

// ---------------------------------------------------------------------------
// Voice Agent class
// ---------------------------------------------------------------------------

export class CartivoVoiceAgent {
  private ws: WebSocket | null = null
  private mediaStream: MediaStream | null = null
  private audioContext: AudioContext | null = null
  private scriptProcessor: ScriptProcessorNode | null = null
  private callbacks: VoiceAgentCallbacks
  private bundleSessions = new Map<string, BundleSession>()
  private lastBundleId: string | null = null
  private msgCounter = 0

  constructor(callbacks: VoiceAgentCallbacks) {
    this.callbacks = callbacks
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  async start(): Promise<void> {
    const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY as string | undefined
    if (!apiKey) {
      this.callbacks.onError(
        'VITE_DEEPGRAM_API_KEY is not set. Add it to your .env.local file.'
      )
      this.callbacks.onStatusChange('error')
      return
    }

    this.callbacks.onStatusChange('connecting')

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    } catch {
      this.callbacks.onError('Microphone access denied. Please allow microphone permissions.')
      this.callbacks.onStatusChange('error')
      return
    }

    // Connect to Deepgram Voice Agent endpoint
    const url = `wss://agent.deepgram.com/agent?token=${apiKey}`
    this.ws = new WebSocket(url)
    this.ws.binaryType = 'arraybuffer'

    this.ws.onopen = () => {
      this._sendSettings()
      this.callbacks.onStatusChange('listening')
      this._startAudioCapture()
    }

    this.ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        this._handleMessage(event.data)
      }
      // Binary frames are audio from the agent — play them
      else if (event.data instanceof ArrayBuffer) {
        this._playAgentAudio(event.data)
      }
    }

    this.ws.onerror = () => {
      this.callbacks.onError('WebSocket connection error.')
      this.callbacks.onStatusChange('error')
    }

    this.ws.onclose = () => {
      this.callbacks.onStatusChange('closed')
      this._stopAudioCapture()
    }
  }

  stop(): void {
    this._stopAudioCapture()
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close()
    }
    this.ws = null
    this.callbacks.onStatusChange('idle')
  }

  // -------------------------------------------------------------------------
  // Settings message — configures agent persona + function tools
  // -------------------------------------------------------------------------

  private _sendSettings(): void {
    const settings = {
      type: 'Settings',
      audio: {
        input: { encoding: 'linear16', sample_rate: 16000 },
        output: { encoding: 'linear16', sample_rate: 24000, container: 'none' },
      },
      agent: {
        listen: { model: 'nova-3' },
        think: {
          provider: { type: 'open_ai' },
          model: 'gpt-4o-mini',
          instructions:
            'You are Cartivo Voice™, an AI shopping copilot for Cartivo. ' +
            'You compute optimised product bundles and take real actions when instructed. ' +
            'Always clarify the budget if not provided (use Nigerian Naira ₦). ' +
            'Always confirm with the user before calling addToCart or checkout. ' +
            'After generating a bundle, offer the confidence score and ask if they want to add it to their cart. ' +
            'Be concise, helpful, and conversational.',
          functions: FUNCTION_DEFINITIONS,
        },
        speak: { model: 'aura-2-andromeda-en' },
      },
    }
    this._send(settings)
  }

  // -------------------------------------------------------------------------
  // Incoming message handler
  // -------------------------------------------------------------------------

  private _handleMessage(raw: string): void {
    let msg: Record<string, unknown>
    try {
      msg = JSON.parse(raw)
    } catch {
      return
    }

    const type = msg.type as string

    switch (type) {
      case 'ConversationText': {
        const role = msg.role as 'user' | 'assistant'
        const content = msg.content as string
        this.callbacks.onMessage({
          id: this._nextId(),
          role: role === 'assistant' ? 'agent' : 'user',
          content,
          timestamp: new Date(),
        })
        if (role === 'user') {
          this.callbacks.onTranscript(content, true)
        }
        break
      }

      case 'UserStartedSpeaking':
        this.callbacks.onStatusChange('listening')
        break

      case 'AgentThinking':
        this.callbacks.onStatusChange('thinking')
        break

      case 'AgentStartedSpeaking':
        this.callbacks.onStatusChange('speaking')
        break

      case 'AgentAudioDone':
        this.callbacks.onStatusChange('listening')
        break

      case 'FunctionCallRequest': {
        this.callbacks.onStatusChange('function_calling')
        const functionName = msg.function_name as string
        const callId = msg.function_call_id as string
        const inputRaw = msg.input as string | Record<string, unknown>
        let args: Record<string, unknown> = {}
        try {
          args = typeof inputRaw === 'string' ? JSON.parse(inputRaw) : (inputRaw ?? {})
        } catch {
          args = {}
        }
        this._dispatchFunction(functionName, callId, args)
        break
      }

      case 'Error': {
        const errMsg = (msg.message ?? msg.description ?? 'Unknown agent error') as string
        this.callbacks.onError(`Agent error: ${errMsg}`)
        this.callbacks.onStatusChange('error')
        break
      }

      default:
        break
    }
  }

  // -------------------------------------------------------------------------
  // Function dispatcher — routes to real backend actions
  // -------------------------------------------------------------------------

  private async _dispatchFunction(
    name: string,
    callId: string,
    args: Record<string, unknown>
  ): Promise<void> {
    const logId = this._nextId()

    const logEntry: ActionLogEntry = {
      id: logId,
      type: name as ActionLogEntry['type'],
      status: 'pending',
      label: this._labelForFunction(name, args),
      timestamp: new Date(),
    }
    this.callbacks.onActionLog(logEntry)

    let output: unknown
    let errorMsg: string | null = null

    try {
      switch (name) {
        case 'generateBundle':
          output = await this._generateBundle(args)
          break
        case 'addToCart':
          output = await this._addToCart(args)
          break
        case 'getConfidenceScore':
          output = this._getConfidenceScore(args)
          break
        case 'generateShoppingReport':
          output = this._generateShoppingReport(args)
          break
        case 'checkout':
          output = this._checkout(args)
          break
        default:
          throw new Error(`Unknown function: ${name}`)
      }
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : String(err)
      output = { error: errorMsg }
    }

    // Send result back to Deepgram
    this._send({
      type: 'FunctionCallResponse',
      function_call_id: callId,
      output: JSON.stringify(output),
    })

    // Update action log
    this.callbacks.onActionLog({
      ...logEntry,
      status: errorMsg ? 'error' : 'success',
      detail: errorMsg ?? this._detailForOutput(name, output),
    })

    this.callbacks.onStatusChange('listening')
  }

  // -------------------------------------------------------------------------
  // Function implementations
  // -------------------------------------------------------------------------

  private async _generateBundle(args: Record<string, unknown>): Promise<object> {
    const budget = Number(args.budget)
    const style = String(args.style ?? 'modern')
    const categoryRaw = String(args.category ?? 'tops,bottoms,shoes')

    if (!budget || budget <= 0) throw new Error('Budget must be a positive number.')

    const categories = categoryRaw.split(',').map((c) => c.trim()).filter(Boolean)
    const constraints: SetupConstraints = {
      categories,
      maxBudget: budget,
      stylePreference: style.split(',').map((s) => s.trim()),
      minSustainability: 0,
    }

    const result = await buildSmartSetup(constraints)

    // Calculate confidence score (0-100)
    const avgDurability =
      result.products.reduce(
        (sum, p) => sum + (p.performanceMetrics?.durabilityScore ?? 50),
        0
      ) / Math.max(result.products.length, 1)
    const avgRating =
      result.products.reduce(
        (sum, p) => sum + (p.performanceMetrics?.averageRating ?? 3),
        0
      ) / Math.max(result.products.length, 1)
    const withinBudget = result.totalCost <= budget ? 20 : 0
    const compatBonus = result.isCompactible ? 15 : 0
    const confidenceScore = Math.min(
      100,
      Math.round((avgDurability * 0.4) + (avgRating * 10 * 0.25) + withinBudget + compatBonus)
    )

    const bundleId = `bundle_${Date.now()}`
    this.bundleSessions.set(bundleId, {
      bundleId,
      result,
      constraints,
      confidenceScore,
    })
    this.lastBundleId = bundleId

    return {
      bundleId,
      productCount: result.products.length,
      products: result.products.map((p) => ({
        id: p._id,
        name: p.name,
        price: p.price,
        category: p.category?._id ?? '',
      })),
      totalCost: result.totalCost,
      remainingBudget: result.remainingBudget,
      isCompatible: result.isCompactible,
      confidenceScore,
      summary: result.explanation,
    }
  }

  private async _addToCart(args: Record<string, unknown>): Promise<object> {
    const bundleId = String(args.bundleId ?? this.lastBundleId ?? '')
    const session = this.bundleSessions.get(bundleId)
    if (!session) {
      throw new Error(`Bundle "${bundleId}" not found. Please generate a bundle first.`)
    }

    const cartItems: CartItem[] = session.result.products.map((p) => ({
      productId: p._id,
      name: p.name,
      price: p.price,
      category: p.category?._id ?? '',
      quantity: 1,
    }))

    const cart = addItemsToCart(cartItems)

    return {
      success: true,
      cartId: cart.cartId,
      itemsAdded: cartItems.length,
      cartTotal: cart.totalCost,
      message: `${cartItems.length} item${cartItems.length !== 1 ? 's' : ''} added to your cart.`,
    }
  }

  private _getConfidenceScore(args: Record<string, unknown>): object {
    const bundleId = String(args.bundleId ?? this.lastBundleId ?? '')
    const session = this.bundleSessions.get(bundleId)
    if (!session) {
      throw new Error(`Bundle "${bundleId}" not found.`)
    }
    return {
      bundleId,
      confidenceScore: session.confidenceScore,
      label:
        session.confidenceScore >= 85
          ? 'Excellent'
          : session.confidenceScore >= 70
          ? 'Good'
          : 'Fair',
    }
  }

  private _generateShoppingReport(args: Record<string, unknown>): object {
    const bundleId = String(args.bundleId ?? this.lastBundleId ?? '')
    const session = this.bundleSessions.get(bundleId)
    if (!session) {
      throw new Error(`Bundle "${bundleId}" not found.`)
    }
    const { result, confidenceScore } = session
    return {
      bundleId,
      report: {
        title: 'Cartivo Smart Bundle Report',
        generatedAt: new Date().toISOString(),
        productCount: result.products.length,
        totalCost: result.totalCost,
        budgetUsed: session.constraints.maxBudget - result.remainingBudget,
        remainingBudget: result.remainingBudget,
        confidenceScore,
        compatibilityStatus: result.isCompactible ? 'All items compatible' : 'Some items may conflict',
        products: result.products.map((p) => ({
          name: p.name,
          price: p.price,
          durability: p.performanceMetrics?.durabilityScore ?? 'N/A',
          sustainability: p.sustainabilityScore,
          rating: p.performanceMetrics?.averageRating ?? 'N/A',
        })),
        summary: result.explanation,
      },
    }
  }

  private _checkout(args: Record<string, unknown>): object {
    const cartId = String(args.cartId ?? '')
    const cart: Cart = getCart()
    if (cart.items.length === 0) {
      throw new Error('Your cart is empty. Add items before checking out.')
    }
    // In a real app this would call a payment gateway.
    // Here we record the checkout intent and clear the cart for demo purposes.
    const orderRef = `ORD-${Date.now()}`
    return {
      success: true,
      orderId: orderRef,
      cartId: cart.cartId,
      itemCount: cart.items.length,
      totalCharged: cart.totalCost,
      message: `Order ${orderRef} placed successfully. Thank you for shopping with Cartivo!`,
    }
  }

  // -------------------------------------------------------------------------
  // Audio capture — PCM16 at 16 kHz streamed to Deepgram
  // -------------------------------------------------------------------------

  private _startAudioCapture(): void {
    if (!this.mediaStream) return

    this.audioContext = new AudioContext({ sampleRate: 16000 })
    const source = this.audioContext.createMediaStreamSource(this.mediaStream)
    // ScriptProcessorNode is deprecated but universally supported in browsers
    this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1)

    this.scriptProcessor.onaudioprocess = (e) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
      const float32 = e.inputBuffer.getChannelData(0)
      const pcm16 = this._floatToPcm16(float32)
      this.ws.send(pcm16)
    }

    source.connect(this.scriptProcessor)
    this.scriptProcessor.connect(this.audioContext.destination)
  }

  private _stopAudioCapture(): void {
    this.scriptProcessor?.disconnect()
    this.scriptProcessor = null
    this.audioContext?.close()
    this.audioContext = null
    this.mediaStream?.getTracks().forEach((t) => t.stop())
    this.mediaStream = null
  }

  private _floatToPcm16(float32: Float32Array): ArrayBuffer {
    const buffer = new ArrayBuffer(float32.length * 2)
    const view = new DataView(buffer)
    for (let i = 0; i < float32.length; i++) {
      const s = Math.max(-1, Math.min(1, float32[i]))
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    }
    return buffer
  }

  // -------------------------------------------------------------------------
  // Agent audio playback — PCM16 at 24 kHz
  // -------------------------------------------------------------------------

  private _playbackCtx: AudioContext | null = null
  private _playbackQueue: AudioBuffer[] = []
  private _isPlaying = false

  private _playAgentAudio(buffer: ArrayBuffer): void {
    if (!this._playbackCtx) {
      this._playbackCtx = new AudioContext({ sampleRate: 24000 })
    }
    const ctx = this._playbackCtx
    const int16 = new Int16Array(buffer)
    const float32 = new Float32Array(int16.length)
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / (int16[i] < 0 ? 0x8000 : 0x7fff)
    }
    const audioBuffer = ctx.createBuffer(1, float32.length, 24000)
    audioBuffer.copyToChannel(float32, 0)
    this._playbackQueue.push(audioBuffer)
    if (!this._isPlaying) this._drainPlaybackQueue()
  }

  private _drainPlaybackQueue(): void {
    if (!this._playbackCtx || this._playbackQueue.length === 0) {
      this._isPlaying = false
      return
    }
    this._isPlaying = true
    const ctx = this._playbackCtx
    const buf = this._playbackQueue.shift()!
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.connect(ctx.destination)
    src.onended = () => this._drainPlaybackQueue()
    src.start()
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  private _send(obj: object): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(obj))
    }
  }

  private _nextId(): string {
    return `msg_${++this.msgCounter}_${Date.now()}`
  }

  private _labelForFunction(name: string, args: Record<string, unknown>): string {
    switch (name) {
      case 'generateBundle':
        return `Generating bundle — ₦${Number(args.budget).toLocaleString()} · ${args.style} · ${args.category}`
      case 'addToCart':
        return `Adding bundle to cart`
      case 'getConfidenceScore':
        return `Fetching Confidence Index™`
      case 'generateShoppingReport':
        return `Generating shopping report`
      case 'checkout':
        return `Initiating checkout`
      default:
        return name
    }
  }

  private _detailForOutput(name: string, output: unknown): string {
    if (!output || typeof output !== 'object') return ''
    const o = output as Record<string, unknown>
    switch (name) {
      case 'generateBundle':
        return `${o.productCount} products · ₦${Number(o.totalCost).toLocaleString()} · Confidence ${o.confidenceScore}%`
      case 'addToCart':
        return `${o.itemsAdded} item(s) added · Cart total ₦${Number(o.cartTotal).toLocaleString()}`
      case 'getConfidenceScore':
        return `Score: ${o.confidenceScore}% (${o.label})`
      case 'generateShoppingReport':
        return 'Report generated'
      case 'checkout':
        return `Order ${o.orderId} placed`
      default:
        return ''
    }
  }
}
