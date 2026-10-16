import { audiences, getTestingService } from "@/data/testing-services";
import { BRAND_NAME } from "@/constant/brand";
import { NextResponse } from "next/server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

const makeReference = (prefix: string) =>
    `${prefix}-${Date.now().toString(36).slice(-4)}${Math.random().toString(36).slice(2, 4)}`.toUpperCase();

const escapeHtml = (value: string) =>
    value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

export async function POST(request: Request) {
    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "send" }, { status: 400 });
    }

    const kind = body.kind === "testing" ? "testing" : body.kind === "visit" ? "visit" : "";
    if (!kind) return NextResponse.json({ error: "send" }, { status: 400 });

    const name = text(body.name, 100);
    const phone = text(body.phone, 30);
    const email = text(body.email, 200);
    if (!name) return NextResponse.json({ error: "name" }, { status: 400 });
    if (phone.replace(/\D/g, "").length < 9) return NextResponse.json({ error: "phone" }, { status: 400 });
    if (email && !EMAIL_PATTERN.test(email)) return NextResponse.json({ error: "email" }, { status: 400 });

    const date = text(body.date, 20);
    const note = text(body.note, 2000);
    const details: [string, string][] = [
        ["Name", name],
        ["Phone", phone],
        ["Email", email || "–"],
        ["Preferred date", date || "–"],
    ];

    if (kind === "visit") {
        details.push(
            ["Weight (g)", text(body.weight, 20) || "–"],
            ["Carat", text(body.carat, 10) || "–"],
            ["Indicative price", text(body.estimate, 40) || "–"]
        );
    } else {
        const service = getTestingService(text(body.service, 40));
        const audience = text(body.audience, 20);
        if (!service) return NextResponse.json({ error: "service" }, { status: 400 });
        if (!audiences.includes(audience as (typeof audiences)[number])) return NextResponse.json({ error: "send" }, { status: 400 });
        details.push(["Audience", audience], ["Service", service.id]);
    }

    if (note) details.push(["Notes", note]);

    const reference = makeReference(kind === "visit" ? "VISIT" : "TEST");
    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.INQUIRY_TO_EMAIL;

    if (!apiKey || !to) {
        console.info(`[booking] ${reference}`, Object.fromEntries(details));
        return NextResponse.json({ reference });
    }

    const subject = kind === "visit" ? `Old gold visit ${reference} – ${name}` : `Testing booking ${reference} – ${name}`;
    const html = `
        <h2>${escapeHtml(subject)}</h2>
        <table cellpadding="6" style="border-collapse:collapse">
            ${details.map(([label, value]) => `<tr><td><strong>${escapeHtml(label)}</strong></td><td>${escapeHtml(value)}</td></tr>`).join("")}
        </table>
    `;

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            from: process.env.INQUIRY_FROM_EMAIL ?? `${BRAND_NAME} <onboarding@resend.dev>`,
            to: to.split(",").map((address) => address.trim()),
            reply_to: email || undefined,
            subject,
            html,
        }),
    });

    if (!response.ok) {
        console.error(`[booking] ${reference} email failed`, response.status, await response.text());
        return NextResponse.json({ error: "send" }, { status: 502 });
    }

    return NextResponse.json({ reference });
}
