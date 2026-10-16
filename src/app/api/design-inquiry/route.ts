import { describeDesign, estimateDesignPrice, inquiryBudgets, inquiryTimelines, parseDesign, serializeDesign } from "@/data/jewellery-custom-data";
import { BRAND_NAME } from "@/constant/brand";
import { NextResponse } from "next/server";

const CONTACT_METHODS = ["Email", "Phone", "WhatsApp", "Studio appointment"];
const IMAGE_PREFIX = "data:image/jpeg;base64,";
const MAX_IMAGE_LENGTH = 2_000_000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const oneOf = (value: unknown, allowed: string[]) => (typeof value === "string" && allowed.includes(value) ? value : "");

const escapeHtml = (value: string) =>
    value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const makeReference = () =>
    `KTS-${Date.now().toString(36).slice(-4)}${Math.random().toString(36).slice(2, 4)}`.toUpperCase();

export async function POST(request: Request) {
    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const name = text(body.name, 100);
    const email = text(body.email, 200);
    if (!name) return NextResponse.json({ error: "Please tell us your name." }, { status: 400 });
    if (!EMAIL_PATTERN.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });

    const phone = text(body.phone, 30);
    const contactMethod = oneOf(body.contactMethod, CONTACT_METHODS) || "Email";
    const timeline = oneOf(body.timeline, inquiryTimelines);
    const budget = oneOf(body.budget, inquiryBudgets);
    const message = text(body.message, 2000);
    const design = parseDesign(new URLSearchParams(text(body.design, 500)));
    const image =
        typeof body.image === "string" && body.image.startsWith(IMAGE_PREFIX) && body.image.length < MAX_IMAGE_LENGTH
            ? body.image.slice(IMAGE_PREFIX.length)
            : null;

    const reference = makeReference();
    const price = estimateDesignPrice(design);
    const designLink = `${new URL(request.url).origin}/customise?${serializeDesign(design)}`;
    const details: [string, string][] = [
        ...describeDesign(design),
        ["Estimated from", `Rs ${price.toLocaleString("en-LK")}`],
        ["Name", name],
        ["Email", email],
        ["Phone", phone || "–"],
        ["Preferred contact", contactMethod],
        ["Timeline", timeline || "–"],
        ["Budget", budget || "–"],
    ];

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.INQUIRY_TO_EMAIL;

    if (!apiKey || !to) {
        console.info(`[design-inquiry] ${reference}`, { details: Object.fromEntries(details), message, designLink, hasImage: Boolean(image) });
        return NextResponse.json({ reference });
    }

    const html = `
        <h2>New bespoke enquiry ${reference}</h2>
        <table cellpadding="6" style="border-collapse:collapse">
            ${details.map(([k, v]) => `<tr><td><strong>${escapeHtml(k)}</strong></td><td>${escapeHtml(v)}</td></tr>`).join("")}
        </table>
        ${message ? `<p><strong>Message</strong><br>${escapeHtml(message).replace(/\n/g, "<br>")}</p>` : ""}
        <p><a href="${escapeHtml(designLink)}">Open this design in the customiser</a></p>
        ${image ? "<p>A snapshot of the design is attached.</p>" : ""}
    `;

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            from: process.env.INQUIRY_FROM_EMAIL ?? `${BRAND_NAME} <onboarding@resend.dev>`,
            to: to.split(",").map((address) => address.trim()),
            reply_to: email,
            subject: `Bespoke enquiry ${reference} – ${name}`,
            html,
            attachments: image ? [{ filename: `${reference}.jpg`, content: image }] : undefined,
        }),
    });

    if (!response.ok) {
        console.error(`[design-inquiry] ${reference} email failed`, response.status, await response.text());
        return NextResponse.json({ error: "We couldn't send your enquiry just now. Please try again or email us directly." }, { status: 502 });
    }

    return NextResponse.json({ reference });
}
