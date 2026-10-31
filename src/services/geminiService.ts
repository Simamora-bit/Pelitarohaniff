import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function askSpiritualAI(question: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: question,
      config: {
        systemInstruction: `You are "Pelita Rohani AI", a wise and compassionate Christian spiritual guide. 
        Your goal is to provide encouragement, biblical wisdom, and comfort based on Christian teachings.
        Always include relevant Bible verses (Alkitab) in your answers.
        Keep your tone warm, humble, and hopeful.
        If the question is not related to spirituality or the Bible, gently redirect the user to spiritual topics.
        Answer in Indonesian language (Bahasa Indonesia).`,
      },
    });

    return response.text || "Maaf, saya tidak bisa menjawab saat ini. Tetaplah berdoa.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Terjadi kesalahan saat menghubungi AI. Silakan coba lagi nanti.";
  }
}

export async function searchBibleVerse(query: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Cari ayat Alkitab yang berkaitan dengan: "${query}". 
      Berikan daftar maksimal 5 ayat yang paling relevan.
      Format setiap ayat: [Nama Kitab] [Pasal]:[Ayat] - "[Isi Ayat]"
      Berikan juga penjelasan singkat mengapa ayat tersebut relevan.
      Gunakan Bahasa Indonesia.`,
      config: {
        systemInstruction: "Anda adalah mesin pencari Alkitab yang akurat. Berikan ayat-ayat Alkitab yang tepat sesuai dengan kata kunci atau topik yang diberikan.",
      },
    });

    return response.text || "Tidak ditemukan ayat yang relevan.";
  } catch (error) {
    console.error("Gemini API Search Error:", error);
    return "Terjadi kesalahan saat mencari ayat.";
  }
}
