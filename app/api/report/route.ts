import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

// Initialize the new Google GenAI SDK
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File | null
    const lat = formData.get('lat') as string | null
    const lng = formData.get('lng') as string | null
    const email = formData.get('email') as string | null

    if (!file || !lat || !lng) {
      return NextResponse.json({ error: 'Missing required image or location payload' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is missing. Operating in fallback simulation mode.")
      return NextResponse.json({ error: 'AI Verification Engine failed due to missing API key' }, { status: 500 })
    }

    // 1. Process the File Buffer into Base64 for the API
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64String = buffer.toString('base64')
    
    // Extrapolate the mimeType (image/jpeg, image/png)
    const mimeType = file.type || 'image/jpeg'

    // 2. Invoke Gemini Vision with strict JSON structural output instructions and spoof verification
    const promptText = `
You are an expert AI waste forensics engine for Samudra Sutra.
Analyze this submitted photo strictly against potential marine pollution or river waste characteristics.

CRITICAL ANTI-SPOOFING WARNING: You must heavily scrutinize the image to determine if it is a photo of a screen (e.g., someone pointing their camera at another mobile phone, laptop, monitor, or TV displaying waste). 
Look specifically for:
- Moiré patterns (grid-like pixel artifacts/lines that happen when taking a photo of a screen).
- Glare, glass reflections, or physical bezels/edges of a mobile phone or monitor in the frame.
- Unnatural backlighting or warped color profiles typical of displays.
If you detect ANY evidence whatsoever that this is a photo *of a screen*, or a digital manipulation, rather than physical waste in its natural environment, you MUST set "isGenuine" to false.

1. Determine if this image is a genuine, physical photograph taken in the natural environment (and definitely NOT a photo of a screen or phone). (isGenuine)
2. Determine if it is actually displaying waste/pollution. (isWaste)
3. If it is waste, classify the primary material strictly from one of these types: [plastic, chemical, sewage, debris, oil, mixed].
4. Determine visual severity strictly from one of these: [low, medium, high, critical].
5. Give a rough volumetric estimation (number from 50 to 1000).

Respond ONLY with valid, raw JSON in this exact structure, with no markdown code blocks or backticks around it:
{
  "isGenuine": boolean,
  "isWaste": boolean,
  "type": "plastic|chemical|sewage|debris|oil|mixed",
  "severity": "low|medium|high|critical",
  "estimatedVolume": number,
  "confidenceScore": number
}
    `.trim()

    let aiResult;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: "user",
            parts: [
              { text: promptText },
              { inlineData: { mimeType, data: base64String } }
            ]
          }
        ]
      });

      const rawText = response.text || "{}"
      // Defensive JSON parsing from raw text
      const cleanJsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
      aiResult = JSON.parse(cleanJsonStr)

    } catch (apiError) {
      console.error('Gemini API Error:', apiError)
      return NextResponse.json({ error: 'AI Verification Engine failed' }, { status: 500 })
    }

    if (!aiResult.isGenuine) {
       return NextResponse.json({ 
         success: false, 
         error: "AI Anti-Spoof Failed: System detected a screen/monitor reflection, Moiré pattern, or digital synthesis. Please capture physical waste in the environment.",
         credits: 0 
       })
    }

    if (!aiResult.isWaste) {
       return NextResponse.json({ 
         success: false, 
         error: "AI Evaluation Failed: Subject is not identifiable as marine waste or pollution.",
         credits: 0 
       })
    }

    // 3. Flow Simulation Base Math
    const latitude = parseFloat(lat)
    const longitude = parseFloat(lng)
    const distanceToCoast = Math.sqrt(Math.pow(latitude - 19.0, 2) + Math.pow(longitude - 72.8, 2))
    const etaToOcean = Math.max(1, Math.floor(distanceToCoast * 60)) 
    const riskIndexInner = Math.max(10, Math.min(100, Math.floor(aiResult.confidenceScore * 100) - (etaToOcean * 2)))

    // 4. Determine Credits logic! (Gamification)
    const baseCredits = 50
    const bonus = aiResult.severity === 'critical' ? 50 : aiResult.severity === 'high' ? 25 : 0
    const creditsEarned = baseCredits + bonus

    // 5. Structure the standardized payload for the client to push to Firebase
    const reportPayload = {
      id: `cit_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      type: aiResult.type,
      severity: aiResult.severity,
      location: { lat: latitude, lon: longitude, name: 'Citizen Origin', zone: 'Urban' },
      source: 'citizen',
      estimatedVolume: aiResult.estimatedVolume,
      riskIndex: riskIndexInner,
      flowPath: [],
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      etaToOcean,
      etaToRiver: 0
    }

    // Return pure data to Client! Handing off Database insertions (Firebase) strictly to the client.
    return NextResponse.json({ 
      success: true, 
      reportId: reportPayload.id,
      credits: creditsEarned,
      reportData: reportPayload
    })

  } catch (error) {
    console.error('Server execution error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
