import { NextResponse } from 'next/server';

const getApiKey = () => {
  const key = process.env.OPENROUTER_API_KEY || '';
  const publicKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';
  
  if (key.startsWith('sk-or-')) return key;
  if (publicKey.startsWith('sk-or-')) return publicKey;
  
  // Fallback to whichever is not empty if none have the prefix
  return key || publicKey || '';
};

const OPENROUTER_KEY = getApiKey();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "HTTP-Referer": "https://mithaly.store",
        "X-Title": "Mithaly Admin",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('AI Route Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
