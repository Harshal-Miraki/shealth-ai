// AI Diagnosis Service
// Now connects to our internal API endpoint which mimics an LLM backend

export interface PatientInfo {
    name: string;
    age: number;
    gender: string;
    scanType: string; // "CT Scan", "MRI", "X-Ray", "Ultrasound"
}

export interface AIReport {
    summary: string;
    findings: string[];
    confidence: number;
    recommendations: string[];
    riskFactors: string[];
    generatedAt: string;
}

export interface DiagnosisResult {
    id: string;
    patient: {
        id: string;
        name: string;
        age: number;
        gender: string;
        scanType: string;
        scanDate: string;
        status: "completed" | "pending" | "critical";
        diagnosis: string;
        email: string;
        phone: string;
        address: string;
        bloodType: string;
        allergies: string[];
        scanImage: string;
    };
    aiReport: AIReport;
}

// Helper to convert File to Base64
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
}

// Run AI diagnosis by calling our internal API
export async function runAIDiagnosis(
    imageFile: File,
    patientInfo: PatientInfo,
    renderedImageBase64?: string // Optional pre-rendered image for DICOM files
): Promise<DiagnosisResult> {
    
    try {
        // 1. Use pre-rendered image if provided (for DICOM), otherwise convert file to Base64
        const imageBase64 = renderedImageBase64 || await fileToBase64(imageFile);

        // 2. Prepare Payload
        const payload = {
            patientInfo,
            image: imageBase64,
        };

        // 3. Send to API Endpoint
        const response = await fetch('/api/diagnostic', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Diagnosis failed');
        }

        // 4. Return result from API
        const result: DiagnosisResult = await response.json();
        return result;

    } catch (error) {
        console.error("AI Diagnosis Service Error:", error);
        throw error;
    }
}

// Store for new diagnoses (in-memory, resets on page reload)
// In production, this would be stored in a database
const diagnosisStore: Map<string, DiagnosisResult> = new Map();

export function storeDiagnosis(result: DiagnosisResult): void {
    diagnosisStore.set(result.id, result);
    // Also store in sessionStorage for persistence during session
    // Note: We store a lightweight version without the large base64 image to avoid quota issues
    if (typeof window !== 'undefined') {
        try {
            const stored = sessionStorage.getItem('diagnoses') || '{}';
            const diagnoses = JSON.parse(stored);
            
            // Create a lightweight copy without the large base64 image
            const lightweightResult = {
                ...result,
                patient: {
                    ...result.patient,
                    // Replace large base64 with a placeholder - actual image is in memory store
                    scanImage: result.patient.scanImage?.startsWith('data:') 
                        ? '/shelth_dashboard_hero.png'  // Fallback placeholder for sessionStorage
                        : result.patient.scanImage
                }
            };
            
            diagnoses[result.id] = lightweightResult;
            sessionStorage.setItem('diagnoses', JSON.stringify(diagnoses));
        } catch (error) {
            console.warn('Could not save to sessionStorage, data will be in memory only:', error);
        }
    }
}

export function getDiagnosis(id: string): DiagnosisResult | null {
    // First check in-memory store
    if (diagnosisStore.has(id)) {
        return diagnosisStore.get(id) || null;
    }
    // Then check sessionStorage
    if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem('diagnoses') || '{}';
        const diagnoses = JSON.parse(stored);
        return diagnoses[id] || null;
    }
    return null;
}
