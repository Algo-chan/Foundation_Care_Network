"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeTriage = void 0;
const analyzeTriage = async (input) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        throw new Error('Anthropic API key is not configured');
    }
    const prompt = `
    You are an expert medical triage assistant for the Foundation Care Network in Ethiopia.
    Based on the following patient data, provide a triage assessment.
    
    PATIENT SYMPTOMS: ${input.symptoms}
    VITALS:
    - Blood Pressure: ${input.vitals?.bloodPressure || 'N/A'}
    - Heart Rate: ${input.vitals?.heartRate || 'N/A'} bpm
    - Temperature: ${input.vitals?.temp || 'N/A'} °C
    - Oxygen Saturation: ${input.vitals?.oxygenSat || 'N/A'}%
    
    PATIENT HISTORY: ${input.patientHistory || 'N/A'}

    Provide your response in JSON format with the following fields:
    - priority: "CRITICAL", "URGENT", "NON-URGENT"
    - summary: A brief summary of the situation.
    - recommendation: Immediate steps the health worker or patient should take.
    - specialized_doctor: The type of specialist that should be consulted (e.g., Cardiologist, Pediatrician, General Practitioner).
  `;
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 1000,
                messages: [{ role: 'user', content: prompt }]
            })
        });
        const data = await response.json();
        const content = data.content[0].text;
        // Attempt to parse JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return {
            priority: "NON-URGENT",
            summary: "Could not parse AI response",
            recommendation: "Please consult a health professional.",
            specialized_doctor: "General Practitioner"
        };
    }
    catch (error) {
        console.error('AI Triage Error:', error);
        throw new Error('Failed to analyze triage data');
    }
};
exports.analyzeTriage = analyzeTriage;
