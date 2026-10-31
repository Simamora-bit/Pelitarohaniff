async function requestAI(action: 'ask' | 'search', input: string): Promise<string> {
  const response = await fetch('/.netlify/functions/spiritual-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, input }),
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) throw new Error('Layanan AI belum tersedia');
  const data = await response.json();
  if (typeof data.text !== 'string') throw new Error('Respons AI tidak valid');
  return data.text;
}

export async function askSpiritualAI(question: string) {
  try {
    return await requestAI('ask', question);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Terjadi kesalahan saat menghubungi AI. Silakan coba lagi nanti.";
  }
}

export async function searchBibleVerse(query: string) {
  try {
    return await requestAI('search', query);
  } catch (error) {
    console.error("Gemini API Search Error:", error);
    return "Terjadi kesalahan saat mencari ayat.";
  }
}
