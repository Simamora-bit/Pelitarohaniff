import { GoogleGenAI } from '@google/genai';
import { getUser } from '@netlify/identity';
import type { Config } from '@netlify/functions';
export default async (req: Request) => {
  if (req.method !== 'POST') return new Response(null, { status: 405 });
  if (!await getUser()) return Response.json({ message: 'Silakan masuk untuk menggunakan pencarian dan tanya jawab Alkitab.' }, { status: 401 });
  try {
    const { question, search } = await req.json();
    if (typeof question !== 'string' || !question.trim() || question.length > 2000) return Response.json({ message: 'Isi pertanyaan maksimal 2.000 karakter.' }, { status: 400 });
    const ai = new GoogleGenAI({});
    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: search ? `Cari maksimal 5 ayat Alkitab yang relevan beserta referensi dan penjelasan singkat: ${question}` : question,
      config: { maxOutputTokens: 1600, systemInstruction: 'Anda adalah pendamping rohani Kristen Pelita Rohani. Jawab dalam Bahasa Indonesia dengan kasih dan sertakan referensi Alkitab yang tepat. Jika tidak yakin dengan kutipan atau referensi, nyatakan dengan jujur. Arahkan pertanyaan di luar topik kembali ke iman dan Alkitab.' },
    });
    return Response.json({ text: result.text }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return Response.json({ message: 'Layanan Alkitab sedang tidak tersedia. Silakan coba lagi nanti.' }, { status: 503 }); }
};
export const config: Config = { path: '/api/spiritual-ai' };
