import { GoogleGenAI } from '@google/genai';

export default async (request: Request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Permintaan tidak valid.' }, { status: 400 });
  }
  if (!body || typeof body !== 'object') {
    return Response.json({ error: 'Permintaan tidak valid.' }, { status: 400 });
  }
  const { action, input } = body as { action?: unknown; input?: unknown };
  if ((action !== 'ask' && action !== 'search') || typeof input !== 'string' || !input.trim() || input.length > 4000) {
    return Response.json({ error: 'Masukkan pertanyaan atau kata kunci maksimal 4000 karakter.' }, { status: 400 });
  }

  try {
    const ai = new GoogleGenAI({});
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: action === 'search'
        ? `Cari maksimal 5 ayat Alkitab yang berkaitan dengan: ${input}. Format: [Nama Kitab] [Pasal]:[Ayat] - "[Isi Ayat]". Jelaskan singkat relevansinya dalam Bahasa Indonesia.`
        : input,
      config: {
        maxOutputTokens: 2048,
        systemInstruction: action === 'search'
          ? 'Anda adalah mesin pencari Alkitab yang akurat. Berikan ayat yang tepat sesuai kata kunci atau topik dalam Bahasa Indonesia.'
          : 'Anda adalah Pelita Rohani AI, pembimbing rohani Kristen yang bijaksana dan penuh kasih. Berikan penghiburan dan hikmat berdasarkan ajaran Kristen, sertakan ayat Alkitab yang relevan, dan jawab dalam Bahasa Indonesia dengan rendah hati dan penuh harapan. Arahkan pertanyaan di luar topik kembali pada kerohanian dan Alkitab.',
      },
    });
    return Response.json({ text: response.text || 'Belum ada jawaban. Silakan coba lagi.' });
  } catch {
    return Response.json({ error: 'Layanan AI sementara tidak tersedia. Silakan coba lagi nanti.' }, { status: 503 });
  }
};
