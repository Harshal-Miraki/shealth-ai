import { NextResponse } from "next/server";

// Interfaces
interface PatientInfo {
    name: string;
    age: number;
    gender: string;
    scanType: string;
}

interface AIReport {
    summary: string;
    findings: string[];
    confidence: number;
    recommendations: string[];
    riskFactors: string[];
    generatedAt: string;
}

interface PatientResult {
    id: string;
    patient: {
        id: string;
        name: string;
        age: number;
        gender: string;
        scanType: string;
        scanDate: string;
        status: "completed" | "pending" | "critical";
        email: string;
        phone: string;
        address: string;
        bloodType: string;
        allergies: string[];
        scanImage: string;
    };
    aiReport: AIReport; // Add AI Report
    diagnosis: string;  // Add easy access diagnosis
    status: "completed" | "pending" | "critical";
}

// Generate a unique patient ID
function generatePatientId(): string {
    const num = Math.floor(Math.random() * 9000) + 1000;
    return `PT-${num}`;
}

function generateMockReport(scanType: string, patientAge: number): { report: AIReport; diagnosis: string; status: "completed" | "pending" | "critical" } {
    const now = new Date().toISOString();
    let report: AIReport;
    let diagnosis: string;
    let status: "completed" | "pending" | "critical" = "completed";

    const isElderly = patientAge > 60;

    switch (scanType.toLowerCase()) {
        case "x-ray":
            diagnosis = isElderly ? "Signs of Osteopenia" : "Normal Chest Radiograph";
            status = isElderly ? "completed" : "completed";
            report = {
                summary: isElderly 
                    ? "X-Ray reveals reduced bone density consistent with osteopenia. No acute fractures or dislocations observed."
                    : "Chest X-Ray is unremarkable. Lungs are clear, cardiac silhouette is normal size. No pleural effusion or pneumothorax.",
                findings: isElderly 
                    ? [
                        "Bones: Generalized decrease in bone density",
                        "Joints: Mild degenerative changes in shoulder joint",
                        "Soft Tissues: Normal",
                        "Lungs: Clear fields"
                    ]
                    : [
                        "Lungs: Clear, no infiltrates",
                        "Heart: Normal size",
                        "Bones: No fractures",
                        "Diaphragm: Normal contour"
                    ],
                confidence: 94.5,
                recommendations: isElderly
                    ? [
                        "DEXA scan recommended for further evaluation",
                        "Calcium and Vitamin D supplementation",
                        "Weight-bearing exercises"
                    ]
                    : [
                        "No further imaging required currently",
                        "Routine follow-up in 1 year"
                    ],
                riskFactors: isElderly ? ["Age > 60", "Low BMI"] : [],
                generatedAt: now
            };
            if (Math.random() > 0.7) { // Random critical case
                diagnosis = "Pneumonia Detected";
                status = "critical";
                report.summary = "URGENT: Opacity noted in right lower lobe consistent with pneumonia. Clinical correlation advised.";
                report.findings = ["Right Lower Lobe: Consolidation present", "Air Bronchograms: Visible", "Heart: Normal limits"];
                report.recommendations = ["Urgent Pulmonology referral", "Antibiotic therapy initiated", "Follow-up CXR in 2 weeks"];
                report.confidence = 89.2;
            }
            break;

        case "ct scan":
        case "ct":
            diagnosis = "No Acute Intracranial Pathology";
            report = {
                summary: "Head CT scan demonstrates no evidence of acute hemorrhage, mass effect, or territorial infarction. Ventricles are normal in size.",
                findings: [
                    "Brain Parenchyma: Normal density",
                    "Ventricles: Symmetrical and normal size",
                    "Midline Shift: None",
                    "Bone Window: No fractures"
                ],
                confidence: 98.1,
                recommendations: [
                    "Clinical observation",
                    "MRI if symptoms persist"
                ],
                riskFactors: ["History of migraines"],
                generatedAt: now
            };
             if (Math.random() > 0.8) {
                diagnosis = "Suspicious Renal Mass";
                status = "pending";
                report.summary = "Abdominal CT reveals a 2cm hypodense lesion in the left kidney. Characteristics are indeterminate.";
                report.findings = ["Left Kidney: 2.1cm hypodense lesion upper pole", "Liver: Normal", "Spleen: Normal", "Lymph Nodes: No lymphadenopathy"];
                report.recommendations = ["Contrast-enhanced CT recommended", "Urology consultation"];
                report.confidence = 85.5;
             }
            break;

        case "mri":
            diagnosis = "Lumbar Disc Herniation";
            status = "completed";
            report = {
                summary: "MRI of Lumbar spine shows L4-L5 disc herniation with mild nerve root compression. No spinal canal stenosis.",
                findings: [
                    "L4-L5: Right paracentral disc protrusion",
                    "Nerve Roots: Mild impingement of right L5 root",
                    "Cord Signal: Normal",
                    "Alignment: Normal lumbar lordosis maintained"
                ],
                confidence: 96.2,
                recommendations: [
                    "Physiotherapy for 6 weeks",
                    "Pain management",
                    "Neurosurgical review if motor deficits develop"
                ],
                riskFactors: ["Occupational heavy lifting", "Sedentary lifestyle"],
                generatedAt: now
            };
             if (Math.random() > 0.7) {
                diagnosis = "Meniscal Tear";
                report.summary = "MRI Knee demonstrates a complex tear of the posterior horn of the medial meniscus. ACL and PCL are intact.";
                report.findings = ["Medial Meniscus: Grade 3 signal in posterior horn", "Lateral Meniscus: Intact", "Ligaments: ACL/PCL intact", "Fluid: Small joint effusion"];
                report.recommendations = ["Orthopedic consultation", "Arthroscopy may be indicated", "RICE protocol"];
             }
            break;

        default:
            diagnosis = "Analysis Complete";
            report = {
                summary: "General analysis completed. No specific anomalies flagged by the system.",
                findings: ["Scan quality: Adequate", "Artifacts: None"],
                confidence: 90.0,
                recommendations: ["Clinical correlation required"],
                riskFactors: [],
                generatedAt: now
            };
    }

    return { report, diagnosis, status };
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { patientInfo, image } = body;

        if (!patientInfo || !image) {
            return NextResponse.json(
                { error: "Missing required fields: patientInfo or image" },
                { status: 400 }
            );
        }

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const patientId = generatePatientId();
        const scanDate = new Date().toISOString().split("T")[0];
        
        // Generate mock AI report
        const { report, diagnosis, status } = generateMockReport(patientInfo.scanType, patientInfo.age);

        // Create the patient result 
        const patientResult: PatientResult = {
            id: patientId,
            patient: {
                id: patientId,
                name: patientInfo.name,
                age: patientInfo.age,
                gender: patientInfo.gender,
                scanType: patientInfo.scanType,
                scanDate: scanDate,
                status: status,
                email: `${patientInfo.name
                    .toLowerCase()
                    .replace(/\s+/g, ".")}@email.com`,
                phone:
                    "+91 " +
                    Math.floor(Math.random() * 90000 + 10000) +
                    " " +
                    Math.floor(Math.random() * 90000 + 10000),
                address: "Mumbai, Maharashtra, India",
                bloodType: [
                    "A+",
                    "A-",
                    "B+",
                    "B-",
                    "O+",
                    "O-",
                    "AB+",
                    "AB-",
                ][Math.floor(Math.random() * 8)],
                allergies: Math.random() > 0.5 ? ["Penicillin"] : [],
                scanImage: image,
            },
            aiReport: report, // Include the report
            diagnosis: diagnosis, // Include diagnosis
            status: status // Include status
        };

        return NextResponse.json(patientResult);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
