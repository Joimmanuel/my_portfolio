async function processTranslationWithGemini() {
    /*const apiKey = document.getElementById('apiKey').value.trim();*/
	const apiKey = "AIzaSyD2RNGD75inFm3P-_yRZIwrCHMDnj7L280";
    const textRaw = document.getElementById('inputText').value.trim();
    const outputArea = document.getElementById('outputArea');

    if (!apiKey) {
        alert("Silakan masukkan API Key Gemini terlebih dahulu!");
        return;
    }
    if (!textRaw) {
        alert("Silakan masukkan teks yang ingin diterjemahkan!");
        return;
    }

    outputArea.innerHTML = '<div class="loading-text">Mencari model AI yang tersedia dan menerjemahkan... Mohon tunggu sebentar.</div>';

    const systemPrompt = `
    Tugasmu adalah sebagai penerjemah ahli bahasa Mandarin dan Indonesia sesuai EYD.
    Pisahkan teks di bawah ini per baris. 
    
    KEMBALIKAN OUTPUT HANYA DALAM FORMAT JSON ARRAY SEPERTI INI, TANPA KATA-KATA LAIN DI AWAL ATAU DI AKHIR:
    [
      { "hanyu": "Tulisan Mandarin aslinya (pertahankan emoji)", "pinyin": "Pinyin DENGAN NADA mandarin spasi per kata", "indo": "Terjemahan bahasa Indonesia sesuai EYDs" }
    ]
    
    Teks yang harus diproses:
    ${textRaw}
    `;
	
    try {
        const listModelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const modelCheckRes = await fetch(listModelsUrl);
        const modelCheckData = await modelCheckRes.json();

        if (modelCheckData.error) {
            throw new Error(`Gagal mengecek model: ${modelCheckData.error.message}`);
        }

        const validModels = modelCheckData.models.filter(m => 
            m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")
        );

        if (validModels.length === 0) {
            throw new Error("API Key ini tidak memiliki akses ke model teks apa pun.");
        }

        // KITA PAKSA MENGGUNAKAN FLASH AGAR LIMITNYA BESAR (15 Request / Menit)
        let selectedModelName = validModels[0].name; 
        const preferredModels = ["gemini-3.1-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-flash"];
        
        for (let pref of preferredModels) {
            const found = validModels.find(m => m.name.includes(pref));
            if (found) {
                selectedModelName = found.name;
                break;
            }
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/${selectedModelName}:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: systemPrompt }]
                }],
                generationConfig: {
                    temperature: 0.2
                }
            })
        });

        const data = await response.json();

		// Tangkap error dari server Google
        if (data.error) {
            if (data.error.message.includes("high demand") || data.error.code === 503) {
                throw new Error("⏳ Server AI Google saat ini sedang penuh/sibuk (High Demand).<br>Tunggu sekitar 1 menit, lalu coba klik Terjemahkan lagi ya!");
            }
            if (data.error.message.includes("Quota exceeded") || data.error.message.includes("rate limit")) {
                throw new Error("⏳ Kamu menekan tombol terlalu cepat. Tunggu sekitar 1 Menit, lalu coba lagi.");
            }
            throw new Error(`API Error: ${data.error.message}`);
        }

        let geminiResponseText = data.candidates[0].content.parts[0].text;
        
        const jsonMatch = geminiResponseText.match(/\[[\s\S]*\]/);
        
        if (!jsonMatch) {
            throw new Error("AI tidak mengembalikan format JSON yang benar.");
        }

        const cleanJsonString = jsonMatch[0];
        const translatedArray = JSON.parse(cleanJsonString);

        let finalHTML = `<div style="margin-bottom: 15px; font-size: 12px; color: #7f8c8d;">Menggunakan model kecepatan tinggi: ${selectedModelName}</div>`;
        translatedArray.forEach(item => {
            finalHTML += `
                <div class="result-block">
                    <div class="result-row"><span class="result-label">Tulisan Hanyu:</span> ${item.hanyu}</div>
                    <div class="result-row"><span class="result-label">Pinyin:</span> ${item.pinyin}</div>
                    <div class="result-row"><span class="result-label">Bahasa Indonesia:</span> ${item.indo}</div>
                </div>
            `;
        });

        outputArea.innerHTML = finalHTML;

    } catch (error) {
        outputArea.innerHTML = `
            <div class="result-block" style="border-left-color: #f39c12; background-color: #fdfae3;">
                <div class="result-row" style="color: #d35400;">
                    <b>Pesan Sistem:</b><br><br>
                    ${error.message}
                </div>
            </div>
        `;
    }
}

function clearAll() {
    document.getElementById('inputText').value = "";
    document.getElementById('outputArea').innerHTML = "";
}