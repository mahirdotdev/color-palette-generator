"use client"
import { generateRandomHexColor } from "@/libs/color-generator";
import { useState } from "react";

export default function App() {
  // 1. Definisikan 'ingatan' untuk palet kita.
  // Nilai awalnya adalah sebuah array kosong.
  const [palette, setPalette] = useState<string[]>([]);


  //tambahan atau bonus
  // State untuk menyimpan deskripsi dari LLM
  const [llmDescription, setLlmDescription] = useState<{ mood: string; usage_scenarios: string[] } | null>(null);

  // State untuk indikator loading LLM
  const [isLoadingLLM, setIsLoadingLLM] = useState<boolean>(false);
  // State untuk pesan error LLM
  const [llmError, setLlmError] = useState<string | null>(null);

  // 2. Buat fungsi yang akan dipanggil saat tombol Generate Palette diklik.
  const handleGeneratePalette = () => {
    const newPalette = [
      generateRandomHexColor(),
      generateRandomHexColor(),
      generateRandomHexColor(),
      generateRandomHexColor(),
      generateRandomHexColor(),
      generateRandomHexColor(),
      generateRandomHexColor(),
      generateRandomHexColor(),
      generateRandomHexColor(),
    ];
    // 3. Update 'ingatan' dengan palet yang baru.
    // Ini akan memicu React untuk menggambar ulang!
    setPalette(newPalette);




    // Reset deskripsi LLM saat palet baru dibuat
    setLlmDescription(null);
    setLlmError(null);
  };

  // Fungsi untuk memanggil Gemini API dan mendapatkan deskripsi palet
  const handleDescribePalette = async () => {
    if (palette.length === 0) {
      setLlmError("Harap hasilkan palet terlebih dahulu.");
      return;
    }

    setIsLoadingLLM(true);
    setLlmDescription(null);
    setLlmError(null);

    const prompt = `Given the following color palette (hex codes: ${palette.join(', ')}), describe the overall mood or feeling it evokes and suggest 2-3 suitable usage scenarios (e.g., for a brand, website, interior design, art, etc.). Format your response as a JSON object with 'mood' (string) and 'usage_scenarios' (array of strings).`;

    const chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });

    const payload = {
      contents: chatHistory,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            "mood": { "type": "STRING" },
            "usage_scenarios": {
              "type": "ARRAY",
              "items": { "type": "STRING" }
            }
          },
          "propertyOrdering": ["mood", "usage_scenarios"]
        }
      }
    };

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload })
      });

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
        const json = result.candidates[0].content.parts[0].text;
        const parsedJson = JSON.parse(json);
        setLlmDescription(parsedJson);
      } else {
        setLlmError("Gagal mendapatkan deskripsi dari Gemini API. Coba lagi.");
        console.error("Unexpected API response structure:", result);
      }
    } catch (error) {
      setLlmError("Terjadi kesalahan saat memanggil Gemini API.");
      console.error("Error calling Gemini API:", error);
    } finally {
      setIsLoadingLLM(false);
    }
  };


  return (
    <main className="bg-slate-900 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white">Generator Palet Warna</h1>
        <p className="text-slate-400 mt-2">Klik tombol untuk mendapatkan kombinasi warna baru.</p>
      </div>

      {/* Tombol yang menjadi 'pemicu' */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button
          onClick={handleGeneratePalette}
          className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-blue-700 transition-transform hover:scale-105 shadow-lg"
        >
          Generate Palette
        </button>
        <button
          onClick={handleDescribePalette}
          className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-purple-700 transition-transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          disabled={isLoadingLLM || palette.length === 0}
        >
          {isLoadingLLM ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            '✨ Jelaskan Palet'
          )}
        </button>
      </div>


      {/* Wadah untuk menampilkan palet warna kita */}
      <div className="flex flex-col md:flex-row flex-wrap justify-center gap-4 mb-8">
        {palette.map((color, index) => (
          <div key={index} className="text-center group cursor-pointer">
            {/* Tampilan 'div' ini bergantung pada 'ingatan' (state) kita */}
            <div
              className="w-32 h-48 rounded-lg shadow-lg transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-xl flex items-end justify-center pb-4"
              style={{ backgroundColor: color }} // Atur warna background secara dinamis!
            >
              {/* Teks hex color di dalam kotak warna, terlihat lebih baik */}
              <p className="font-mono text-white bg-black bg-opacity-50 rounded-md px-2 py-1 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {color}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Area untuk menampilkan deskripsi dari LLM */}
      {llmError && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4 text-center">
          <p>{llmError}</p>
        </div>
      )}

      {llmDescription && (
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg max-w-2xl w-full text-white text-center">
          <h2 className="text-2xl font-semibold mb-3">Deskripsi Palet ✨</h2>
          <p className="text-slate-300 mb-4">
            <span className="font-bold">Suasana Hati:</span> {llmDescription.mood}
          </p>
          <h3 className="text-xl font-semibold mb-2">Skenario Penggunaan:</h3>
          <ul className="list-disc list-inside text-slate-300">
            {llmDescription.usage_scenarios.map((scenario, index) => (
              <li key={index}>{scenario}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
