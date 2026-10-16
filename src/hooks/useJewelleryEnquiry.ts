"use client";
import { getJewelleryProduct, JewelleryProduct } from "@/data/jewellery-data";
import { useSyncExternalStore } from "react";

export const ENQUIRY_HOLD_HOURS = 48;
const STORAGE_KEY = "kts-enquiries";
const LEGACY_STORAGE_KEY = "kts-reserves";
const EMPTY: Enquiry[] = [];

export interface Enquiry {
    id: string;
    productId: number;
    finish: string;
    option: string | null;
    indicativePrice: number;
    name: string;
    phone: string;
    note: string;
    createdAt: number;
}

export interface EnquiryWithProduct extends Enquiry {
    product: JewelleryProduct;
    expiresAt: number;
    isExpired: boolean;
}

export interface PendingEnquiry {
    productId: number;
    finish: string;
    option: string | null;
    indicativePrice: number;
}

let enquiries: Enquiry[] | null = null;
let pending: PendingEnquiry | null = null;
const listeners = new Set<() => void>();

const holdMs = () => ENQUIRY_HOLD_HOURS * 60 * 60 * 1000;

const notify = () => listeners.forEach((listener) => listener());

const parseList = (raw: string | null): Enquiry[] => {
    if (!raw) return EMPTY;
    try {
        const parsed = JSON.parse(raw) as Enquiry[];
        return Array.isArray(parsed) ? parsed.filter((item) => getJewelleryProduct(item.productId)) : EMPTY;
    } catch {
        return EMPTY;
    }
};

const read = (): Enquiry[] => {
    if (enquiries) return enquiries;
    try {
        const current = window.localStorage.getItem(STORAGE_KEY);
        const legacy = !current ? window.localStorage.getItem(LEGACY_STORAGE_KEY) : null;
        enquiries = parseList(current ?? legacy);
        if (legacy && !current && enquiries.length) {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(enquiries));
            window.localStorage.removeItem(LEGACY_STORAGE_KEY);
        }
    } catch {
        enquiries = EMPTY;
    }
    return enquiries;
};

const write = (next: Enquiry[]) => {
    enquiries = next;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
        // private mode — keep in memory
    }
    notify();
};

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
        if (event.key !== STORAGE_KEY && event.key !== LEGACY_STORAGE_KEY) return;
        enquiries = null;
        listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
    };
};

export const getPendingEnquiry = () => pending;

export const setPendingEnquiry = (next: PendingEnquiry | null) => {
    pending = next;
    notify();
};

export const addEnquiry = (input: Omit<Enquiry, "id" | "createdAt"> & { createdAt?: number }): Enquiry => {
    const entry: Enquiry = {
        ...input,
        id: `E${Date.now().toString(36).toUpperCase()}`,
        createdAt: input.createdAt ?? Date.now(),
    };
    write([entry, ...read()]);
    pending = null;
    notify();
    return entry;
};

export const removeEnquiry = (id: string) => {
    write(read().filter((item) => item.id !== id));
};

const enrich = (item: Enquiry): EnquiryWithProduct | null => {
    const product = getJewelleryProduct(item.productId);
    if (!product) return null;
    const expiresAt = item.createdAt + holdMs();
    return {
        ...item,
        product,
        expiresAt,
        isExpired: Date.now() > expiresAt,
    };
};

const useJewelleryEnquiry = () => {
    const items = useSyncExternalStore(subscribe, read, () => EMPTY);
    const pendingEnquiry = useSyncExternalStore(subscribe, getPendingEnquiry, () => null);

    const active = items.flatMap((item) => {
        const row = enrich(item);
        return row && !row.isExpired ? [row] : [];
    });

    return {
        items: active,
        count: active.length,
        pending: pendingEnquiry,
        setPending: setPendingEnquiry,
        add: addEnquiry,
        remove: removeEnquiry,
    };
};

export default useJewelleryEnquiry;
