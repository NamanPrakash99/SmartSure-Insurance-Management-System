import axios from 'axios'

// Your active Gemini API Key
const GEMINI_API_KEY = 'AIzaSyA1bcypUKaLbh1fRcqtyVXdvxauSMBfzz8'

interface GeminiModel {
  name: string
  supportedGenerationMethods: string[]
}

/**
 * AI Service for Gemini integration with automatic model discovery and STRICT SmartSure custom instructions.
 * This version enforces a "Zero Outside Knowledge" policy to keep responses 100% website-relevant.
 */
export const fetchAIResponse = async (userMessage: string): Promise<string> => {
  if (!GEMINI_API_KEY) throw new Error('API Key is missing.')

  try {
    // 1. PROJECT-SPECIFIC DISCOVERY: Find which model version Google wants for this account
    const discoveryUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
    const discoveryResponse = await axios.get<{ models: GeminiModel[] }>(discoveryUrl)
    
    // We'll pick the most useful generative model for this account
    const discoveredModel = discoveryResponse.data.models.find(m => 
      m.supportedGenerationMethods.includes('generateContent') && 
      (m.name.includes('flash') || m.name.includes('pro'))
    )
    
    if (!discoveredModel) throw new Error('No compatible chat models found for this key.')

    console.log(`SmartSure Assistant using discovered model: ${discoveredModel.name}`)

    // 2. DISCOVERED MODEL CHAT: Using the path Google provided for this account
    const chatUrl = `https://generativelanguage.googleapis.com/v1beta/${discoveredModel.name}:generateContent?key=${GEMINI_API_KEY}`
    
    const response = await axios.post(chatUrl, {
      contents: [{
        parts: [{
          text: `STRICT SYSTEM ROLE: You are the SmartSure AI Specialist. You serve the SmartSure website EXCLUSIVELY. 
          Use ONLY the following knowledge base. If a user asks something NOT related to SmartSure or these facts, politely state: "I'm sorry, I specialize exclusively in providing information about SmartSure's digital insurance services."

          SMARTSURE KNOWLEDGE BASE:
          - Tagline: "Smart Insurance for a Modern World."
          - Location: India (proudly serving Indian customers).
          - Categories: Health Insurance, Life Insurance, and Vehicle Insurance ONLY.
          - Key Statistics: 
              * 50k+ Users trust us.
              * 99.9% of Claims are approved by our AI.
              * 2 Minutes to get an instant policy.
          - Core Services: 
              * AI-Driven Claims: No paperwork, lightning-fast processing for health, life, and vehicle.
              * Instant Policies: 100% digital, zero paperwork for health, life, and vehicle segments.
              * Expert Assistance: 24/7 digital support for life, health, and vehicle insurance needs.
          - Philosophy: Fast, Transparent, Completely Digital. We eliminate the traditional slow insurance model.
          - Features: Online quote generation, claim status monitoring, and instant digital policy storage in user dashboards.

          RESTRICTIONS:
          1. NEVER mention Travel, Home, Property, or Pet insurance.
          2. NEVER answer general knowledge questions (e.g., "tell me how to cook", "who is the prime minister").
          3. ALWAYS maintain the "SmartSure Specialist" personality.
          4. ALWAYS decline to answer non-SmartSure questions by saying you specialize exclusively in SmartSure.

          User asks: ${userMessage}`
        }]
      }]
    }, {
      headers: { 'Content-Type': 'application/json' }
    })

    const AIOutput = response.data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (AIOutput) return AIOutput

    throw new Error('No valid content parts in AI response')
    
  } catch (error: any) {
    console.error('DIAGNOSTIC AI ERROR:', error.response?.data || error.message)
    throw error 
  }
}
