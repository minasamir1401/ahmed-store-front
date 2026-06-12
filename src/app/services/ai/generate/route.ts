import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

type GenerateRequest = {
  provider?: string
  model?: string
  models?: string[]
  messages?: ChatMessage[]
  max_tokens?: number
}

const DEFAULT_OPENROUTER_MODEL = 'meta-llama/llama-3.3-70b-instruct:free'

async function handleGemini(body: GenerateRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 })
  }

  let systemInstruction = ''
  const geminiContents = []
  
  for (const msg of body.messages || []) {
    if (msg.role === 'system') {
      systemInstruction += msg.content + '\n'
    } else {
      geminiContents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })
    }
  }

  const payload: any = { contents: geminiContents }
  if (systemInstruction) {
    payload.systemInstruction = { parts: [{ text: systemInstruction.trim() }] }
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    return NextResponse.json({ error: data.error?.message || 'Gemini request failed' }, { status: response.status })
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  return NextResponse.json({
    choices: [{ message: { content: text } }]
  })
}

async function handleOpenRouter(body: GenerateRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.APIFREE_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key is not configured' }, { status: 500 })
  }

  const model = body.model || body.models?.[0] || DEFAULT_OPENROUTER_MODEL
  const payload: any = {
    messages: body.messages,
    max_tokens: body.max_tokens || 1800
  }

  if (body.models && body.models.length > 0) {
    payload.models = body.models
  } else {
    payload.model = model
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://mithaly.com',
      'X-Title': 'Mithaly',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    return NextResponse.json({ error: data.error?.message || data.error || 'OpenRouter request failed' }, { status: response.status })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as GenerateRequest | null

  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: 'messages are required' }, { status: 400 })
  }

  if (body.provider === 'gemini') {
    return handleGemini(body)
  }

  return handleOpenRouter(body)
}
