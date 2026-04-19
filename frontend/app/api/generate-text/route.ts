import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, model, word_count } = await req.json();

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ detail: "Prompt is required." }, { status: 400 });
    }

    const words = Math.max(20, Math.min(Number(word_count) || 150, 600));
    const systemMsg = `You are a helpful writing assistant. Write approximately ${words} words. Return only the text, no markdown, no bullet points, no title.`;
    
    const provider = (model || "groq").trim().toLowerCase();

    if (provider === "groq") {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) return NextResponse.json({ detail: "GROQ_API_KEY is not set." }, { status: 500 });
      
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
          messages: [
            { role: "system", "content": systemMsg },
            { role: "user", "content": prompt }
          ],
          temperature: 0.8
        })
      });

      if (!res.ok) {
         const err = await res.text();
         return NextResponse.json({ detail: err }, { status: res.status });
      }
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || "";
      return NextResponse.json({ text: text.trim() });
    }

    if (provider === "deepseek") {
      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) return NextResponse.json({ detail: "DEEPSEEK_API_KEY is not set." }, { status: 500 });

      const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
          messages: [
            { role: "system", "content": systemMsg },
            { role: "user", "content": prompt }
          ],
          temperature: 0.8
        })
      });

      if (!res.ok) {
         const err = await res.text();
         return NextResponse.json({ detail: err }, { status: res.status });
      }
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || "";
      return NextResponse.json({ text: text.trim() });
    }

    if (provider === "gemini") {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return NextResponse.json({ detail: "GEMINI_API_KEY is not set." }, { status: 500 });

      const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `${systemMsg}\n\n${prompt}` }] }],
          generationConfig: { temperature: 0.8 }
        })
      });

      if (!res.ok) {
         const err = await res.text();
         return NextResponse.json({ detail: err }, { status: res.status });
      }
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return NextResponse.json({ text: text.trim() });
    }

    return NextResponse.json({ detail: 'Invalid model. Use "groq", "gemini", or "deepseek".' }, { status: 400 });
  } catch (error: unknown) {
    console.error("AI Generation API Error:", error);
    return NextResponse.json({ detail: (error as Error).message || "Internal Server Error" }, { status: 500 });
  }
}
