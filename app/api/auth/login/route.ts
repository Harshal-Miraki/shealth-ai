import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/app/lib/config';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    console.log("Proxy: Received login request");

    try {
        const body = await req.json();

        // Basic validation
        if (!body.email || !body.password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        console.log(`Proxy: Authenticating user ${body.email}...`);

        const response = await fetch(`${config.backendApiUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                email: body.email,
                password: body.password,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Proxy: Login Failed", response.status, errorText);

            try {
                const errorJson = JSON.parse(errorText);
                return NextResponse.json(
                    { error: errorJson.error || errorJson.message || 'Login failed', details: errorJson },
                    { status: response.status }
                );
            } catch (e) {
                return NextResponse.json(
                    { error: 'Login failed', details: errorText },
                    { status: response.status }
                );
            }
        }

        const data = await response.json();
        console.log("Proxy: Login Success");

        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Proxy Error:", error.message);
        return NextResponse.json(
            { error: 'Internal Proxy Error', details: error.message },
            { status: 500 }
        );
    }
}
