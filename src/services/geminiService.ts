import { getUser } from '@netlify/identity';
async function ask(question: string, search: boolean) {
  try {
    await getUser();
    const response = await fetch('/api/spiritual-ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question, search }) });
    const result = await response.json();
    return response.ok ? result.text || 'Jawaban belum tersedia.' : result.message || 'Layanan sedang tidak tersedia.';
  } catch { return 'Koneksi terputus. Silakan coba lagi.'; }
}
export const askSpiritualAI = (question: string) => ask(question, false);
export const searchBibleVerse = (query: string) => ask(query, true);
