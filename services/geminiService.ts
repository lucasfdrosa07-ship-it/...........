import { SYSTEM_INSTRUCTION } from "../constants";

// --- CONFIGURAÇÃO ---
// Chaves de emergência (Só usadas se o usuário NÃO fornecer nenhuma chave)
const FALLBACK_KEYS = [
  "AIzaSyDHsKZv9zk5VN9tlqZ9Ffhl294i-BunRD0",
  "AIzaSyAdmzKq5c0PVqur7WygvyblnfsBY8e1rzE"
];

// Lista de modelos para tentativa (Fallback de Modelos)
const MODELS = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro",
    "gemini-1.0-pro"
];

/**
 * Faz a requisição HTTP pura para o Google
 */
const requestGenAI = async (key: string, model: string, prompt: string, imagePart?: any) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    
    const body: any = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
    };

    if (imagePart) {
      body.contents[0].parts.push({
        inline_data: { mime_type: imagePart.mimeType, data: imagePart.data }
      });
    }

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
        // Retorna o objeto de erro para tratamento superior
        throw { 
            status: response.status, 
            message: data.error?.message || "Erro desconhecido", 
            code: data.error?.code 
        };
    }

    if (data.promptFeedback?.blockReason) {
        throw new Error("BLOCK_SAFETY");
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("EMPTY_RESPONSE");

    return text;
};

/**
 * Função Principal de Envio
 */
export const sendMessageToGemini = async (message: string, imagePart?: any): Promise<string> => {
    const fullPrompt = `${SYSTEM_INSTRUCTION}\n\n---\n\nDIÁLOGO ATUAL:\nUSUÁRIO: ${message}\nMENTOR:`;
    
    // 1. Verificar qual chave usar
    let userKey = localStorage.getItem('USER_GEMINI_KEY');
    
    // Limpeza de espaços invisíveis que causam erro de chave inválida
    if (userKey) userKey = userKey.trim();

    const hasUserKey = userKey && userKey.length > 10;
    
    // Se tem chave do usuário, usamos EXCLUSIVAMENTE ela (não faz fallback para chaves públicas ruins)
    const keysToTry = hasUserKey ? [userKey] : FALLBACK_KEYS;

    let lastError = "";

    // Loop de Chaves (Geralmente 1 se for userKey)
    for (const key of keysToTry) {
        // Loop de Modelos (Se der 404 no Flash, tenta o Pro)
        for (const model of MODELS) {
            try {
                console.log(`[Gemini] Tentando modelo: ${model}...`);
                return await requestGenAI(key!, model, fullPrompt, imagePart);
            } catch (err: any) {
                console.warn(`[Gemini] Falha em ${model}:`, err);
                
                // Tratamento de Erros Específicos
                if (err.status === 404 || err.message?.includes("not found")) {
                    // Modelo não existe/não suportado. Tenta o próximo modelo do loop.
                    continue; 
                }
                
                if (err.status === 400 && err.message?.includes("API key")) {
                    // Chave inválida REALMENTE.
                    if (hasUserKey) {
                        return "ERRO DE CHAVE: O Google recusou sua chave. Verifique se copiou corretamente (sem espaços) e se a API 'Generative Language' está ativada no Google Cloud Console.";
                    }
                    // Se for chave de fallback, break para tentar a próxima chave se houver
                    lastError = "Chaves públicas esgotadas.";
                    break; 
                }

                if (err.status === 429) {
                     // Quota excedida
                     if (hasUserKey) return "ERRO DE LIMITES: Sua chave atingiu o limite gratuito de hoje. Tente amanhã ou use outra chave.";
                }

                lastError = err.message;
            }
        }
    }

    return `FALHA NA CONEXÃO: ${lastError || "Verifique sua internet ou Chave API."}`;
};

export const generateMindMapText = async (topic: string): Promise<string | null> => {
  try {
    const prompt = `Crie um Mapa Mental hierárquico (texto identado) prático sobre: "${topic}". Seja direto.`;
    // Reutiliza a mesma lógica segura
    return await sendMessageToGemini(prompt);
  } catch (error) {
    console.error("Erro MindMap", error);
    return null;
  }
};