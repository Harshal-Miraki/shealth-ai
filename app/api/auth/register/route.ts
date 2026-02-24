import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/app/lib/config';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    console.log("Proxy: Received registration request");

    try {
        const body = await req.json();

        // Basic validation
        // Updated to match the "full_name" field required by the API
        if (!body.email || !body.password || !body.full_name) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        console.log(`Proxy: Registering user ${body.email}...`);

        // Forward to external API
        // Spread the entire body to ensure we pass everything (e.g. password_confirmation, username, role)
        const payload = {
            ...body,
            // Ensure specific mappings if needed (e.g. mapping fullName to name if not done in service)
            // But relying on service to send correct shape is better.
        };

        const response = await fetch(`${config.backendApiUrl}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add browser-like headers just in case of WAF
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Proxy: Upstream Registration Error", response.status, errorText);

            try {
                const errorJson = JSON.parse(errorText);
                return NextResponse.json(
                    { error: errorJson.error || 'Registration failed', details: errorJson },
                    { status: response.status }
                );
            } catch (e) {
                return NextResponse.json(
                    { error: 'Registration failed', details: errorText },
                    { status: response.status }
                );
            }
        }

        const data = await response.json();
        console.log("Proxy: Registration Success", response.status);

        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Proxy Error:", error.message);
        return NextResponse.json(
            { error: 'Internal Proxy Error', details: error.message },
            { status: 500 }
        );
    }
}
