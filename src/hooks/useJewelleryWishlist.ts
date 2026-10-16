"use client";
import { getJewelleryProduct, JewelleryProduct } from "@/data/jewellery-data";
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "kts-wishlist";
const EMPTY: number[] = [];

let ids: number[] | null = null;
const listeners = new Set<() => void>();

const read = (): number[] => {
    if (ids) return ids;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as number[]) : EMPTY;
        ids = Array.isArray(parsed)
            ? parsed.filter((id) => typeof id === "number" && getJewelleryProduct(id))
            : EMPTY;
    } catch {
        ids = EMPTY;
    }
    return ids;
};

const write = (next: number[]) => {
    ids = next;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
        // storage unavailable (private mode); keep in memory only
    }
    listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
        if (event.key !== STORAGE_KEY) return;
        ids = null;
        listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
    };
};

export const isWishlisted = (productId: number) => read().includes(productId);

export const toggleWishlist = (productId: number) => {
    const current = read();
    write(current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]);
};

export const removeFromWishlist = (productId: number) => {
    write(read().filter((id) => id !== productId));
};

const useJewelleryWishlist = () => {
    const wishIds = useSyncExternalStore(subscribe, read, () => EMPTY);

    const items: JewelleryProduct[] = wishIds.flatMap((id) => {
        const product = getJewelleryProduct(id);
        return product ? [product] : [];
    });

    return {
        items,
        count: items.length,
        has: (productId: number) => wishIds.includes(productId),
        toggle: toggleWishlist,
        remove: removeFromWishlist,
    };
};

export default useJewelleryWishlist;
