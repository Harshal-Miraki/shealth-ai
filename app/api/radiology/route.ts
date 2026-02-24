import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/app/lib/config';

export const runtime = 'nodejs';

// Fallback mock response generator when external API is unavailable
function generateMockRadiologyReport(fileCount: number) {
    const studyId = `STUDY-${Date.now()}`;
    const modality = 'CT';
    
    const findings = {
        study_summary: {
            dominant_finding: 'No acute intracranial abnormality', 
            // study_confidence: 0.92 + Math.random() * 0.06,
            clinical_priority: Math.random() > 0.7 ? 'Urgent' : 'Standard'
        },
        limitations: [
            'Motion artifacts minimal',
            'Study quality: Diagnostic'
        ]
    };

    const preliminaryReport = modality === 'CT' 
        ? `CT Head without contrast: No evidence of acute intracranial hemorrhage, mass effect, or midline shift. Ventricles and sulci are normal in size and configuration. Gray-white matter differentiation is preserved. No acute infarct on non-contrast imaging. Paranasal sinuses and mastoid air cells are clear. Reviewed ${fileCount} image(s).`
        : modality === 'MR'
            ? `MRI Brain with and without contrast: Normal brain parenchyma with preserved gray-white matter differentiation. No evidence of acute infarction, hemorrhage, or mass lesion. The ventricular system is normal in size. No abnormal enhancement. Major intracranial vessels demonstrate normal flow voids. Reviewed ${fileCount} image(s).`
            : `Chest radiograph (PA and Lateral views): Lungs are clear bilaterally with no focal consolidation, effusion, or pneumothorax. Cardiac silhouette is within normal limits. Mediastinal contours are unremarkable. No acute osseous abnormalities. Reviewed ${fileCount} image(s).`;

    const aiAnalysis = `
1. DIAGNOSTIC REPORT:
*Summary*: ${preliminaryReport}

*Findings*:
- ${findings.study_summary.dominant_finding}
- Ventricles and sulci are normal in size and configuration.
- Gray-white matter differentiation is preserved.
- No acute infarct on non-contrast imaging.
- Paranasal sinuses and mastoid air cells are clear.

2. PREVENTIVE MEASURES:
* Clinical correlation is recommended.
* Follow up if symptoms persist.
`;

    return {
        study_id: studyId,
        modality: modality,
        preliminary_report: preliminaryReport,
        findings: findings,
        ai_analysis: aiAnalysis, // Added for frontend compatibility
        processing_time_ms: 1500 + Math.floor(Math.random() * 1000),
        model_version: 'fallback-v1.0',
        _fallback: true
    };
}

export async function POST(req: NextRequest) {
    console.log("Proxy: Received radiology request");

    try {
        const formData = await req.formData();
        
        // Removed legacy 'files' check

        // - dcm_zip: The zip file (from frontend) - mapped from 'files' (or 'dcm_zip' if we changed frontend to send that key, checking frontend...)
        // Frontend sends 'dcm_zip' directly now.
        
        const dcmZip = formData.get('dcm_zip');
        const modality = formData.get('modality') || "DX";
        const bodyParts = formData.get('body_parts') || "Head";
        
        // Wait, did we change frontend only or also allow 'files' fallback?
        // Frontend sends 'dcm_zip'.
        
        if (!dcmZip) {
             console.error("Proxy: No dcm_zip found in request");
             return NextResponse.json({ error: 'No dcm_zip provided' }, { status: 400 });
        }

        const upstreamFormData = new FormData();
        upstreamFormData.append('dcm_zip', dcmZip);
        upstreamFormData.append('modality', modality);
        upstreamFormData.append('body_parts', bodyParts);
        
        console.log(`Proxy: Forwarding request to MedicalAI. Modality: ${modality}, BodyPart: ${bodyParts}`);

        const headers = new Headers();
        headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log("Proxy: Sending fetch request to external API...");
        
        try {
            // Using exact endpoint confirmed via openapi.json
            const response = await fetch(`${config.medicalAiApiUrl}/detect`, {
                method: 'POST',
                body: upstreamFormData,
                headers: headers,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Proxy: Upstream API Error", response.status);
                console.error("Proxy: Error Body Snippet:", errorText.substring(0, 500));
                
                // Return error to frontend
                try {
                    const errorJson = JSON.parse(errorText);
                    return NextResponse.json(
                        { error: 'Upstream API Error', details: errorJson, status: response.status },
                        { status: response.status }
                    );
                } catch (e) {
                    return NextResponse.json(
                        { error: 'Upstream API Error', details: errorText, status: response.status },
                        { status: response.status }
                    );
                }
            }

            const data = await response.json();
            console.log("Proxy: Upstream API Success", response.status);
            return NextResponse.json(data);

        } catch (fetchError: any) {
            console.error("Proxy: Network/Fetch Error:", fetchError.message);
            return NextResponse.json(
                { error: 'Network Error', details: fetchError.message },
                { status: 502 }
            );
        }

    } catch (error: any) {
        console.error("Proxy Error:", error.message);
        return NextResponse.json(
            { error: 'Internal Proxy Error', details: error.message },
            { status: 500 }
        );
    }
}
