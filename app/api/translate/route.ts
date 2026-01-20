import { NextRequest, NextResponse } from 'next/server';
import { translate } from 'google-translate-api-x';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { text, targetLang = 'es' } = body;

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // Handle array of strings or single string
        if (Array.isArray(text)) {
            const translatedArray = await Promise.all(
                text.map(async (t) => {
                    const res = await translate(t, { to: targetLang }) as any;
                    return res.text;
                })
            );
            return NextResponse.json({ translatedText: translatedArray });
        } else {
            const res = await translate(text, { to: targetLang }) as any;
            return NextResponse.json({ translatedText: res.text });
        }

    } catch (error: any) {
        console.error('Translation Error:', error);
        return NextResponse.json(
            { error: 'Translation failed', details: error.message },
            { status: 500 }
        );
    }
}
