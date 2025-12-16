import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, subject, message } = body;

        // Validate input (Phone is optional but good to have)
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Make.com Webhook URL
        // In production, this should be in process.env.MAKE_WEBHOOK_URL
        const WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

        if (!WEBHOOK_URL) {
            console.error('MAKE_WEBHOOK_URL is not defined');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Map to the format expected by the existing Make webhook
        // Interface: name, email, phone, inquiry
        const payload = {
            name,
            email,
            phone: phone || 'Not provided',
            inquiry: `[${subject}] ${message}`, // Combine subject and message
            timestamp: new Date().toISOString(),
        };

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Failed to send to webhook');
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Contact form error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
