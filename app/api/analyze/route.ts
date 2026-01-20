import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image, metadata } = body;

    // Simulate network delay and processing (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock Response Logic
    // In a real app, 'image' (base64) would be sent to a Python/FastAPI backend.
    
    // Randomize confidence slightly to make it feel "live"
    const confidence = (0.85 + Math.random() * 0.14).toFixed(2); // 0.85 - 0.99
    
    const mockDiagnosis = {
      status: "success",
      analysis: "Anomaly Detected",
      finding: "Possible consolidation in the lower right lobe consistent with pneumonia.",
      confidence: parseFloat(confidence),
      timestamp: new Date().toISOString(),
      recommendation: "Immediate clinical correlation recommended. Follow-up CT scan suggested.",
      heatmap: "mock_heatmap_base64_string_would_go_here",
      metadata_received: {
         patientId: metadata?.patientId || "Unknown",
         modality: metadata?.modality || "Unknown"
      }
    };

    return NextResponse.json(mockDiagnosis);

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process image analysis." },
      { status: 500 }
    );
  }
}
