"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import styles from "./form-controls.module.scss";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const pad = (n: number) => String(n).padStart(2, "0");

const toIso = (year: number, month: number, day: number) =>
    `${year}-${pad(month + 1)}-${pad(day)}`;

const parseIso = (value: string) => {
    if (!value) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
};

const formatDisplay = (value: string) => {
    const date = parseIso(value);
    if (!date) return "";
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

type FancyDateFieldProps = {
    name?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    "aria-label"?: string;
};

const FancyDateField = ({
    name = "date",
    value,
    onChange,
    placeholder = "dd/mm/yyyy",
    "aria-label": ariaLabel,
}: FancyDateFieldProps) => {
    const [open, setOpen] = useState(false);
    const selected = parseIso(value);
    const [view, setView] = useState(() => selected ?? new Date());
    const rootRef = useRef<HTMLDivElement>(null);
    const panelId = useId();

    useEffect(() => {
        if (selected) setView(new Date(selected.getFullYear(), selected.getMonth(), 1));
    }, [value]);

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

    const cells = useMemo(() => {
        const year = view.getFullYear();
        const month = view.getMonth();
        const first = new Date(year, month, 1);
        const startOffset = (first.getDay() + 6) % 7;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const items: Array<{
            key: string;
            day: number;
            iso: string;
            outside: boolean;
            selected: boolean;
            today: boolean;
        }> = [];

        for (let i = 0; i < startOffset; i += 1) {
            const date = new Date(year, month, -startOffset + i + 1);
            items.push({
                key: `prev-${i}`,
                day: date.getDate(),
                iso: toIso(date.getFullYear(), date.getMonth(), date.getDate()),
                outside: true,
                selected: false,
                today: false,
            });
        }

        for (let day = 1; day <= daysInMonth; day += 1) {
            const iso = toIso(year, month, day);
            const date = new Date(year, month, day);
            items.push({
                key: iso,
                day,
                iso,
                outside: false,
                selected: value === iso,
                today: date.getTime() === today.getTime(),
            });
        }

        while (items.length % 7 !== 0 || items.length < 42) {
            const day = items.length - startOffset - daysInMonth + 1;
            const date = new Date(year, month + 1, day);
            items.push({
                key: `next-${day}`,
                day: date.getDate(),
                iso: toIso(date.getFullYear(), date.getMonth(), date.getDate()),
                outside: true,
                selected: false,
                today: false,
            });
        }

        return items;
    }, [view, value]);

    const monthLabel = view.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

    return (
        <div className={`${styles.fancyControl} ${open ? styles.fancyControlOpen : ""}`} ref={rootRef}>
            <input type="hidden" name={name} value={value} />
            <button
                type="button"
                className={`${styles.fancyTrigger} ${value ? "" : styles.fancyTriggerMuted}`}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls={panelId}
                aria-label={ariaLabel}
                onClick={() => setOpen((v) => !v)}
            >
                <span>{value ? formatDisplay(value) : placeholder}</span>
                <svg className={styles.fancyCalendar} width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                    <rect x="2" y="3" width="12" height="11" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M2 6.5h12M5 2v2.5M11 2v2.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
            </button>
            {open ? (
                <div id={panelId} className={styles.fancyCalendarPanel} role="dialog" aria-label={ariaLabel ?? "Choose a date"}>
                    <div className={styles.fancyCalendarHead}>
                        <button
                            type="button"
                            className={styles.fancyCalendarNav}
                            aria-label="Previous month"
                            onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
                        >
                            ‹
                        </button>
                        <p className={styles.fancyCalendarMonth}>{monthLabel}</p>
                        <button
                            type="button"
                            className={styles.fancyCalendarNav}
                            aria-label="Next month"
                            onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
                        >
                            ›
                        </button>
                    </div>
                    <div className={styles.fancyWeekdays}>
                        {WEEKDAYS.map((day) => (
                            <span key={day}>{day}</span>
                        ))}
                    </div>
                    <div className={styles.fancyDays}>
                        {cells.map((cell) => (
                            <button
                                key={cell.key}
                                type="button"
                                className={[
                                    styles.fancyDay,
                                    cell.outside ? styles.fancyDayOutside : "",
                                    cell.today ? styles.fancyDayToday : "",
                                    cell.selected ? styles.fancyDaySelected : "",
                                ]
                                    .filter(Boolean)
                                    .join(" ")}
                                onClick={() => {
                                    onChange(cell.iso);
                                    setOpen(false);
                                }}
                            >
                                {cell.day}
                            </button>
                        ))}
                    </div>
                    <div className={styles.fancyCalendarFooter}>
                        <button
                            type="button"
                            className={styles.fancyCalendarClear}
                            onClick={() => {
                                onChange("");
                                setOpen(false);
                            }}
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            className={styles.fancyCalendarToday}
                            onClick={() => {
                                const now = new Date();
                                onChange(toIso(now.getFullYear(), now.getMonth(), now.getDate()));
                                setOpen(false);
                            }}
                        >
                            Today
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default FancyDateField;
