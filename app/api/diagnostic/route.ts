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
            diagnosis = "Normal Brain MRI";
            status = "completed";
            report = {
                anatomicalRegion: "Brain / Cerebrum",
                cptCode: "70553",
                icd10Code: "Z00.00",
                primarySpecialty: "Neurology / Neuroradiology",
                severity: "Normal",
                summary: "MRI of the Brain with and without gadolinium contrast demonstrates normal brain parenchyma with preserved gray-white matter differentiation. No evidence of acute infarction, intracranial hemorrhage, mass lesion, or abnormal enhancement. The ventricular system is normal in size and configuration. No midline shift or mass effect. The major intracranial vessels demonstrate normal flow voids.",
                findings: [
                    "Cerebral Hemispheres: Normal cortical thickness and signal intensity",
                    "White Matter: No abnormal T2/FLAIR hyperintensities",
                    "Ventricles: Normal size and configuration, no hydrocephalus",
                    "Basal Ganglia: Symmetric with normal signal characteristics",
                    "Thalami: Symmetric, no abnormal signal",
                    "Brainstem: Normal morphology and signal, no lesions",
                    "Cerebellum: Unremarkable, no tonsillar ectopia",
                    "Pituitary Gland: Normal size and enhancement",
                    "Extra-axial Spaces: No subdural or epidural collections",
                    "Orbits & IACs: Grossly unremarkable"
                ],
                confidence: 97.5,
                recommendations: [
                    "No acute intracranial abnormality identified",
                    "Clinical correlation as indicated",
                    "Routine follow-up per clinical guidelines"
                ],
                riskFactors: [],
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
             } else if (Math.random() > 0.4) {
                // Brain MRI Case
                diagnosis = "White Matter Lesions";
                status = "completed";
                report.anatomicalRegion = "Brain / Cerebrum";
                report.cptCode = "70553";
                report.icd10Code = "G93.89";
                report.severity = "Routine";
                report.primarySpecialty = "Neurology / Neuroradiology";
                report.summary = "MRI of the Brain with and without contrast demonstrates scattered punctate T2/FLAIR hyperintense foci in the periventricular and subcortical white matter, nonspecific in etiology. No acute infarct, hemorrhage, mass lesion, or abnormal enhancement identified. The ventricular system and sulci are appropriate for patient age.";
                report.findings = [
                    "White Matter: Scattered T2/FLAIR hyperintensities in periventricular regions",
                    "Gray Matter: Normal cortical thickness and signal intensity",
                    "Ventricles: Normal size and configuration, no hydrocephalus",
                    "Basal Ganglia: Symmetric, no abnormal signal",
                    "Brainstem: Normal morphology and signal characteristics",
                    "Cerebellum: Unremarkable, no tonsillar ectopia",
                    "Enhancement: No pathological enhancement post-gadolinium",
                    "Extra-axial Spaces: No subdural or epidural collections"
                ];
                report.recommendations = [
                    "Clinical correlation with neurological symptoms",
                    "Consider vascular risk factor assessment (HTN, DM, Lipids)",
                    "Baseline study for future comparison",
                    "Neurology follow-up if new symptoms develop"
                ];
                report.riskFactors = ["Hypertension", "Migraine History", "Age-related Changes"];
                report.confidence = 93.7;

                // Random critical brain finding
                if (Math.random() > 0.6) {
                    diagnosis = "Acute Ischemic Stroke - MCA Territory";
                    status = "critical";
                    report.severity = "Critical";
                    report.icd10Code = "I63.50";
                    report.summary = "CRITICAL FINDING: MRI Brain demonstrates acute restricted diffusion in the right middle cerebral artery (MCA) territory involving the right insular cortex, basal ganglia, and fronto-parietal operculum. DWI positive with corresponding ADC hypointensity confirms acute infarction. MRA shows diminished flow in the right M1 segment. IMMEDIATE STROKE TEAM ACTIVATION RECOMMENDED.";
                    report.findings = [
                        "DWI: Acute restricted diffusion in right MCA territory",
                        "ADC: Corresponding hypointensity confirming cytotoxic edema",
                        "FLAIR: Early sulcal effacement in affected region",
                        "MRA: Diminished flow-related enhancement in right M1 segment",
                        "Hemorrhage: No evidence of hemorrhagic transformation",
                        "Mass Effect: Mild early mass effect, no midline shift",
                        "Prior Infarcts: None identified"
                    ];
                    report.recommendations = [
                        "URGENT: Immediate Stroke Team/Code Stroke activation",
                        "Evaluate for IV thrombolysis (tPA) if within window",
                        "Consider mechanical thrombectomy evaluation",
                        "Continuous neuro monitoring in Stroke Unit",
                        "Antiplatelet therapy as per stroke protocol"
                    ];
                    report.riskFactors = ["Atrial Fibrillation", "Hypertension", "Diabetes", "Hyperlipidemia"];
                    report.confidence = 97.8;
                } else if (Math.random() > 0.5) {
                    diagnosis = "Multiple Sclerosis - Active Lesions";
                    status = "pending";
                    report.severity = "Urgent";
                    report.icd10Code = "G35";
                    report.summary = "MRI of the Brain reveals multiple ovoid T2/FLAIR hyperintense lesions in the periventricular white matter, oriented perpendicular to the ventricles (Dawson's fingers pattern). Juxtacortical and infratentorial lesions also present. Post-contrast imaging demonstrates at least 2 lesions with ring enhancement, suggesting active demyelination. Findings are highly suggestive of Multiple Sclerosis with active disease.";
                    report.findings = [
                        "Periventricular Lesions: Multiple ovoid lesions perpendicular to ventricles",
                        "Juxtacortical Lesions: Present in bilateral frontal and parietal lobes",
                        "Infratentorial: Single lesion in right middle cerebellar peduncle",
                        "Enhancement: 2 lesions with incomplete ring enhancement (active)",
                        "Corpus Callosum: Lesions along callosal-septal interface",
                        "Spinal Cord: Cervical spine screening shows additional lesion at C2",
                        "Optic Nerves: No optic neuritis on current study"
                    ];
                    report.recommendations = [
                        "Urgent Neurology referral for MS evaluation",
                        "Lumbar puncture for CSF analysis (oligoclonal bands)",
                        "Visual evoked potentials if optic neuritis suspected",
                        "Discuss disease-modifying therapy initiation",
                        "Follow-up MRI in 3-6 months to assess disease activity"
                    ];
                    report.riskFactors = ["Young Adult", "Female Gender", "Geographic/Environmental Factors"];
                    report.confidence = 91.5;
                }
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
//
// patient information ,diagnosis , finding , Impression  