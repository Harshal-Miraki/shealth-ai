import { NextResponse } from "next/server";

// Interfaces
interface PatientInfo {
    name: string;
    age: number;
    gender: string;
    scanType: string;
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
}

// Generate a unique patient ID
function generatePatientId(): string {
    const num = Math.floor(Math.random() * 9000) + 1000;
    return `PT-${num}`;
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

        // Create the patient result (only patient info and ID)
        const patientResult: PatientResult = {
            id: patientId,
            patient: {
                id: patientId,
                name: patientInfo.name,
                age: patientInfo.age,
                gender: patientInfo.gender,
                scanType: patientInfo.scanType,
                scanDate: scanDate,
                status: "pending" as const,
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
