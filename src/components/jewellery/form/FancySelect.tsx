"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./form-controls.module.scss";

export type FancySelectOption = {
    value: string;
    label: string;
};

type FancySelectProps = {
    value: string;
    options: FancySelectOption[];
    onChange: (value: string) => void;
    name?: string;
    placeholder?: string;
    compact?: boolean;
    alignEnd?: boolean;
    "aria-label"?: string;
};

const FancySelect = ({
    value,
    options,
    onChange,
    name,
    placeholder,
    compact = false,
    alignEnd = false,
    "aria-label": ariaLabel,
}: FancySelectProps) => {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const listId = useId();
    const selected = options.find((option) => option.value === value);
    const label = selected?.label ?? placeholder ?? "";

    useEffect(() => {
        if (!open) return;
        const onPointer = (event: MouseEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
        };
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onPointer);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onPointer);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    return (
        <div
            className={[
                styles.fancyControl,
                open ? styles.fancyControlOpen : "",
                compact ? styles.fancyCompact : "",
                alignEnd ? styles.fancyAlignEnd : "",
            ]
                .filter(Boolean)
                .join(" ")}
            ref={rootRef}
        >
            {name ? <input type="hidden" name={name} value={value} /> : null}
            <button
                type="button"
                className={`${styles.fancyTrigger} ${selected ? "" : styles.fancyTriggerMuted}`}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listId}
                aria-label={ariaLabel}
                onClick={() => setOpen((v) => !v)}
            >
                <span>{label}</span>
                <svg className={styles.fancyChevron} width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                    <path d="M2.5 5L7 9.5 11.5 5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
            {open ? (
                <ul id={listId} className={styles.fancyMenu} role="listbox" aria-label={ariaLabel}>
                    {options.map((option) => {
                        const active = option.value === value;
                        return (
                            <li key={option.value} role="option" aria-selected={active}>
                                <button
                                    type="button"
                                    className={`${styles.fancyOption} ${active ? styles.fancyOptionActive : ""}`}
                                    onClick={() => {
                                        onChange(option.value);
                                        setOpen(false);
                                    }}
                                >
                                    {option.label}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            ) : null}
        </div>
    );
};

export default FancySelect;
