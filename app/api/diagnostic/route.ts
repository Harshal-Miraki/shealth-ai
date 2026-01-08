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
    // New Fields
    anatomicalRegion: string;
    cptCode: string;
    icd10Code: string;
    primarySpecialty: string;
    severity: "Routine" | "Urgent" | "Critical" | "Normal";
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
            diagnosis = isElderly ? "Osteopenia with Degenerative Changes" : "Normal Chest Radiograph";
            status = isElderly ? "completed" : "completed";
            report = {
                anatomicalRegion: "Chest / Thorax",
                cptCode: "71046",
                icd10Code: isElderly ? "M85.8" : "Z00.00",
                primarySpecialty: "Radiology / Pulmonology",
                severity: isElderly ? "Routine" : "Normal",
                summary: isElderly 
                    ? "Radiographic examination demonstrates generalized reduction in bone density consistent with osteopenia. Mild thoracic scoliosis is noted. No acute pulmonary infiltrates, pleural effusions, or pneumothorax identified. Cardiac silhouette remains within normal limits."
                    : "PA and lateral views of the chest reveal clear lung fields bilaterally. The cardiac silhouette, mediastinal contours, and hilar structures are normal in appearance. No focal consolidation, pneumothorax, or pleural effusion is seen. Osseous structures are intact.",
                findings: isElderly 
                    ? [
                        "Bones: Diffuse demineralization suggestive of osteopenia",
                        "Spine: Mild dextroscoliosis of the thoracic spine",
                        "Lungs: Clear parenchymal fields bilaterally",
                        "Heart: Normal size (CTR < 0.5)",
                        "Aorta: Mild atherosclerotic calcification of the aortic knob"
                    ]
                    : [
                        "Lungs: Clear parenchyma without infiltrates or masses",
                        "Heart: Normal cardiac silhouette size and configuration",
                        "Mediastinum: Normal contour and width",
                        "Costophrenic Angles: Sharp and clear",
                        "Bones: No acute fractures or bony abnormalities"
                    ],
                confidence: 94.5,
                recommendations: isElderly
                    ? [
                        "Bone Mineral Density (DEXA) scan recommended",
                        "Calcium (1200mg/day) and Vitamin D supplementation",
                        "Encourage weight-bearing exercises",
                        "Fall risk assessment"
                    ]
                    : [
                        "No acute radiographic abnormalities",
                        "No further imaging indicated",
                        "Routine clinical follow-up"
                    ],
                riskFactors: isElderly ? ["Advanced Age", "Low Bone Mass", "Sedentary Lifestyle"] : [],
                generatedAt: now
            };
            if (Math.random() > 0.7) { // Random critical case
                diagnosis = "Right Lower Lobe Pneumonia";
                status = "critical";
                report.severity = "Urgent";
                report.icd10Code = "J18.9";
                report.summary = "URGENT FINDING: Frontal and lateral chest radiographs demonstrate a focal area of consolidation in the right lower lobe with associated air bronchograms, consistent with lobar pneumonia. No significant pleural effusion. Clinical correlation for infection is advised.";
                report.findings = [
                    "Right Lung: Airspace consolidation in the right lower lobe",
                    "Airways: Air bronchograms visible within the consolidation",
                    "Left Lung: Clear",
                    "Cardiac: Normal size",
                    "Pleura: No pneumothorax or large effusion"
                ],
                report.recommendations = [
                    "Immediate clinical evaluation for pneumonia",
                    "Initiate empirical antibiotic therapy per guidelines",
                    "Sputum culture and sensitivity",
                    "Follow-up CXR in 4-6 weeks to ensure resolution"
                ],
                report.confidence = 89.2;
            }
            break;

        case "ct scan":
        case "ct":
            diagnosis = "No Acute Intracranial Pathology";
            report = {
                anatomicalRegion: "Head / Brain",
                cptCode: "70450",
                icd10Code: "R51.9",
                primarySpecialty: "Neurology / Neuroradiology",
                severity: "Normal",
                summary: "Non-contrast computed tomography of the head demonstrates no evidence of acute intracranial hemorrhage, mass effect, large territorial infarction, or extra-axial collection. Ventricular system size and configuration are normal for age. Midline structures are centered.",
                findings: [
                    "Brain Parenchyma: Normal gray-white matter differentiation",
                    "Ventricles: Symmetrical, no hydrocephalus",
                    "Vascular: No dense artery sign or aneurysm",
                    "Skull/Bones: No calvarial fractures or lytic lesions",
                    "Sinuses: Paranasal sinuses and mastoid air cells are clear"
                ],
                confidence: 98.1,
                recommendations: [
                    "No acute intracranial abnormality detected",
                    "Clinical observation",
                    "MRI Brain may be considered if neurological symptoms persist"
                ],
                riskFactors: ["History of Migraines", "Hypertension"],
                generatedAt: now
            };
             if (Math.random() > 0.8) {
                diagnosis = "Indeterminate Renal Lesion";
                status = "pending";
                report.anatomicalRegion = "Abdomen";
                report.cptCode = "74176";
                report.icd10Code = "N28.89";
                report.severity = "Urgent";
                report.primarySpecialty = "Urology";
                report.summary = "Contrast-enhanced CT of the abdomen reveals a complex 2.1 cm hypodense lesion in the upper pole of the left kidney. The lesion demonstrates minimal enhancement. While possibly a lipid-poor angiomyolipoma or complex cyst, renal cell carcinoma cannot be excluded.",
                report.findings = [
                    "Left Kidney: 2.1cm hypoattenuating mass in upper pole",
                    "Enhancement: Minimal post-contrast enhancement (<10 HU)",
                    "Adrenals: Normal appearance",
                    "Liver/Spleen: Homogeneous echotexture",
                    "Lymph Nodes: No retroperitoneal lymphadenopathy"
                ],
                report.recommendations = [
                    "Dedicated Renal Mass Protocol CT or MRI",
                    "Urology referral for further characterization",
                    "Correlation with urinalysis and renal function tests"
                ],
                report.confidence = 85.5;
             }
            break;

        case "mri":
            diagnosis = "L4-L5 Disc Herniation";
            status = "completed";
            report = {
                anatomicalRegion: "Lumbar Spine",
                cptCode: "72148",
                icd10Code: "M51.26",
                primarySpecialty: "Orthopedics / Neurosurgery",
                severity: "Urgent",
                summary: "MRI of the Lumbar Spine reveals a right paracentral disc protrusion at the L4-L5 level, resulting in mild-to-moderate stenosis of the right lateral recess and potential impingement of the traversing right L5 nerve root. Vertebral body heights and alignment are maintained.",
                findings: [
                    "L4-L5: Right paracentral disc herniation (5mm extrusion)",
                    "Nerve Roots: Contact with descending right L5 nerve root",
                    "Canal Stenosis: Mild central canal stenosis",
                    "Foramina: Patent neural foramina bilaterally",
                    "Cord: Conus meullaris terminates at L1 level, normal signal"
                ],
                confidence: 96.2,
                recommendations: [
                    "Referral to Physical Medicine & Rehabilitation",
                    "Trial of conservative therapy (PT, NSAIDs)",
                    "Epidural steroid injection consideration if pain persists",
                    "Neurosurgical consult if motor weakness develops"
                ],
                riskFactors: ["Occupational Heavy Lifting", "Sedentary Lifestyle", "Obesity"],
                generatedAt: now
            };
             if (Math.random() > 0.7) {
                diagnosis = "Medial Meniscal Tear";
                report.anatomicalRegion = "Knee (Right)";
                report.cptCode = "73721";
                report.icd10Code = "S83.2";
                report.severity = "Routine";
                report.primarySpecialty = "Orthopedics";
                report.summary = "MRI of the Right Knee demonstrates a complex tear involving the posterior horn of the medial meniscus with extension to the inferior articular surface. The anterior cruciate ligament (ACL) and posterior cruciate ligament (PCL) appear intact. Small joint effusion visible.",
                report.findings = [
                    "Medial Meniscus: Complex tear of posterior horn",
                    "Lateral Meniscus: Intact",
                    "Cruciate Ligaments: ACL and PCL intact with normal signal",
                    "Collateral Ligaments: MCL and LCL intact",
                    "Bone Marrow: No contusions or fractures"
                ];
                report.recommendations = [
                    "Orthopedic consultation for knee",
                    "Conservative management vs. Arthroscopic repair",
                    "RICE protocol and activity modification"
                ];
             }
            break;

        default:
            diagnosis = "General Analysis Complete";
            report = {
                anatomicalRegion: "General / Unspecified",
                cptCode: "76499",
                icd10Code: "Z00.00",
                primarySpecialty: "General Medicine",
                severity: "Normal",
                summary: "Automated analysis completed successfully. Image quality is adequate for diagnostic review. No gross anomalies or artifacts detected in the provided scan.",
                findings: [
                    "Image Quality: Satisfactory (Signal-to-Noise Ratio > 20dB)",
                    "Artifacts: None detected",
                    "Exposure: Optimal"
                ],
                confidence: 90.0,
                recommendations: [
                    "Clinical correlation required",
                    "Radiologist review advised"
                ],
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
