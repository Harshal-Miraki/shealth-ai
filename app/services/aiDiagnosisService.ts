
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
    dicomFiles?: File[]; // Field to hold the raw files in memory
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
    files: File[],
    patientInfo: PatientInfo,
    renderedMediaBase64?: string
): Promise<DiagnosisResult> {

    try {
        if (files.length === 0) {
            throw new Error("At least one file is required for diagnosis.");
        }
        // 1. Use pre-rendered media if provided, otherwise convert the first file to Base64
        const imageBase64 = renderedMediaBase64 || await fileToBase64(files[0]);

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

        // 4. Get result from API and attach the raw files for in-memory storage
        const result: DiagnosisResult = await response.json();
        result.dicomFiles = files; // Attach the files to the result object

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
    // The full result with File objects is stored in the in-memory map
    diagnosisStore.set(result.id, result);

    // Persist to localStorage
    if (typeof window !== 'undefined') {
        try {
            const stored = localStorage.getItem('shelth_diagnoses') || '{}';
            const diagnoses = JSON.parse(stored);

            // Create a copy without File objects (which can't be serialized)
            const serializableResult: DiagnosisResult = {
                ...result,
                dicomFiles: undefined // File objects can't be stored in localStorage
            };

            diagnoses[result.id] = serializableResult;

            try {
                localStorage.setItem('shelth_diagnoses', JSON.stringify(diagnoses));
            } catch (quotaError) {
                // If quota exceeded, try storing without the large base64 image
                console.warn('LocalStorage quota exceeded, storing without image:', quotaError);
                const lightweightResult: DiagnosisResult = {
                    ...result,
                    patient: {
                        ...result.patient,
                        scanImage: '/shelth_dashboard_hero.png' // Fallback placeholder
                    },
                    dicomFiles: undefined
                };
                diagnoses[result.id] = lightweightResult;
                localStorage.setItem('shelth_diagnoses', JSON.stringify(diagnoses));
            }
        } catch (error) {
            console.warn('Could not save to localStorage, data will be in memory only:', error);
        }
    }
}

export function getDiagnosis(id: string): DiagnosisResult | null {
    // First check in-memory store (which has the File objects)
    if (diagnosisStore.has(id)) {
        return diagnosisStore.get(id) || null;
    }
    // Then check localStorage for the lightweight version
    if (typeof window !== 'undefined') {
        try {
            const stored = localStorage.getItem('shelth_diagnoses') || '{}';
            const diagnoses = JSON.parse(stored);
            return diagnoses[id] || null;
        } catch (e) {
            console.error("Error reading from localStorage", e);
            return null;
        }
    }
    return null;
}

export function getAllDiagnoses(): DiagnosisResult[] {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem('shelth_diagnoses') || '{}';
        const diagnosesMap = JSON.parse(stored);
        return Object.values(diagnosesMap);
    } catch (e) {
        console.error("Error fetching all diagnoses", e);
        return [];
    }
}

export function deleteDiagnosis(id: string): void {
    if (diagnosisStore.has(id)) {
        diagnosisStore.delete(id);
    }

    if (typeof window !== 'undefined') {
        try {
            const stored = localStorage.getItem('shelth_diagnoses') || '{}';
            const diagnoses = JSON.parse(stored);
            if (diagnoses[id]) {
                delete diagnoses[id];
                localStorage.setItem('shelth_diagnoses', JSON.stringify(diagnoses));
            }
        } catch (e) {
            console.error("Error deleting diagnosis", e);
        }
    }
}