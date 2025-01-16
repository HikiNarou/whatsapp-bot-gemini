import { GoogleGenerativeAI, GenerativeModel, Part } from '@google/generative-ai';
import { geminiApiKey } from './config';

// Ambil nama model dari environment variables (atau gunakan default)
const geminiModelName = process.env.GEMINI_MODEL_NAME || "gemini-pro"; // Gunakan gemini-pro sebagai default yang lebih stabil
console.log(`Using Gemini model: ${geminiModelName}`);

let model: GenerativeModel | null = null;

const initializeGemini = () => {
    if (!geminiApiKey) {
        throw new Error("Gemini API Key is missing. Please check your .env file.");
    }
    try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        model = genAI.getGenerativeModel({ model: geminiModelName });
        console.log('Gemini AI model initialized.');
    } catch (error: any) {
        console.error("Error initializing Gemini AI:", error);
        // Handle error inisialisasi di sini, mungkin dengan melempar error atau mengatur flag
        throw new Error(`Failed to initialize Gemini AI: ${error.message}`);
    }
};

// Inisialisasi saat modul di-load
try {
    initializeGemini();
} catch (error) {
    console.error("Failed to initialize Gemini AI on module load:", error);
    // Mungkin atur flag atau state global yang menandakan Gemini tidak siap
}

export const generateResponse = async (prompt: string): Promise<string> => {
    if (!model) {
        console.warn("Gemini AI model not initialized. Attempting to re-initialize.");
        try {
            initializeGemini(); // Coba inisialisasi ulang jika model belum siap
            if (!model) {
                return 'Maaf, layanan AI belum siap saat ini.';
            }
        } catch (error) {
            console.error("Error re-initializing Gemini AI:", error);
            return 'Maaf, layanan AI tidak tersedia saat ini.';
        }
    }
    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
        return text || 'Maaf, tidak ada jawaban yang valid dari AI saat ini.';
    } catch (error: any) {
        console.error("Error generating response from Gemini AI:", error);
        return `Terjadi kesalahan saat berkomunikasi dengan AI: ${error.message}`;
    }
};

// Fungsi untuk membuat soal kuis menggunakan AI
export const generateQuizQuestion = async (topic: string): Promise<string> => {
    const prompt = `Buatlah sebuah soal kuis pilihan ganda tentang ${topic} dengan 4 pilihan jawaban dan sebutkan jawaban yang benar di akhir. Format: Pertanyaan: [pertanyaan], A) [opsi a], B) [opsi b], C) [opsi c], D) [opsi d], Jawaban: [jawaban yang benar]`;
    return generateResponse(prompt);
};

// Contoh fungsi lain (jika diperlukan)
export const summarizeText = async (text: string): Promise<string> => {
    const prompt = `Ringkas teks berikut ini: ${text}`;
    return generateResponse(prompt);
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    const prompt = `Terjemahkan teks berikut ini ke bahasa ${targetLanguage}: ${text}`;
    return generateResponse(prompt);
};

// Contoh penggunaan Part untuk input yang lebih kompleks (misalnya dengan gambar)
export const generateResponseWithContext = async (prompt: string, imageBase64?: string): Promise<string> => {
    if (!model) {
        console.warn("Gemini AI model not initialized. Attempting to re-initialize for context.");
        try {
            initializeGemini();
            if (!model) {
                return 'Maaf, layanan AI belum siap saat ini.';
            }
        } catch (error) {
            console.error("Error re-initializing Gemini AI for context:", error);
            return 'Maaf, layanan AI tidak tersedia saat ini.';
        }
    }
    try {
        const parts: Part[] = [{ text: prompt }];
        if (imageBase64) {
            parts.push({
                inlineData: { mimeType: "image/jpeg", data: imageBase64 } // Asumsi gambar adalah JPEG
            });
        }
        const result = await model.generateContent(parts); // Langsung kirim array parts
        const response = result.response;
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
        return text || 'Maaf, tidak ada jawaban yang valid dari AI saat ini.';
    } catch (error: any) {
        console.error("Error generating response from Gemini AI with context:", error);
        return `Terjadi kesalahan saat berkomunikasi dengan AI: ${error.message}`;
    }
};