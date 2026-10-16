"use client";
import {
    jewelleryCollections,
    jewelleryFeatures,
    jewelleryMaterials,
    jewelleryPriceRanges,
    jewelleryProducts,
    jewelleryStyles,
    JewelleryStyle,
} from "@/data/jewellery-data";
import FancySelect from "@/components/jewellery/form/FancySelect";
import JewelleryFeatureTile from "./JewelleryFeatureTile";
import JewelleryProductCard from "./JewelleryProductCard";
import { Fragment, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./jewellery-shop.module.scss";

type SortKey = "featured" | "price-asc" | "price-desc" | "new";

const toggle = <T,>(list: T[], value: T) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

interface FilterGroupProps<T extends string> {
    title: string;
    options: readonly T[];
    selected: T[];
    onToggle: (value: T) => void;
}

const FilterGroup = <T extends string>({ title, options, selected, onToggle }: FilterGroupProps<T>) => (
    <div className={styles.filterGroup}>
        <h4 className={styles.filterTitle}>{title}</h4>
        <ul>
            {options.map((option) => (
                <li key={option}>
                    <label className={styles.filterOption}>
                        <input type="checkbox" checked={selected.includes(option)} onChange={() => onToggle(option)} />
                        <span>{option}</span>
                    </label>
                </li>
            ))}
        </ul>
    </div>
);

const JewelleryShopArea = () => {
    const [activeStyle, setActiveStyle] = useState<JewelleryStyle | "All">("All");
    const [materials, setMaterials] = useState<string[]>([]);
    const [styleFilters, setStyleFilters] = useState<string[]>([]);
    const [collections, setCollections] = useState<string[]>([]);
    const [prices, setPrices] = useState<string[]>([]);
    const [sort, setSort] = useState<SortKey>("featured");
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!filtersOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setFiltersOpen(false);
        };
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [filtersOpen]);

    const filtered = useMemo(() => {
        const ranges = jewelleryPriceRanges.filter((r) => prices.includes(r.label));
        const list = jewelleryProducts.filter((p) =>
            (activeStyle === "All" || p.style === activeStyle) &&
            (!materials.length || materials.includes(p.material)) &&
            (!styleFilters.length || styleFilters.includes(p.style)) &&
            (!collections.length || collections.includes(p.collection)) &&
            (!ranges.length || ranges.some((r) => p.price >= r.min && p.price < r.max))
        );
        if (sort === "price-asc") return [...list].sort((a, b) => a.price - b.price);
        if (sort === "price-desc") return [...list].sort((a, b) => b.price - a.price);
        if (sort === "new") return [...list].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
        return list;
    }, [activeStyle, materials, styleFilters, collections, prices, sort]);

    const filterCount = materials.length + styleFilters.length + collections.length + prices.length;
    const hasFilters = filterCount > 0;
    const clearFilters = () => {
        setMaterials([]);
        setStyleFilters([]);
        setCollections([]);
        setPrices([]);
        setActiveStyle("All");
    };

    const filters = (
        <>
            <FilterGroup
                title="Material"
                options={jewelleryMaterials}
                selected={materials as typeof jewelleryMaterials}
                onToggle={(v) => setMaterials((s) => toggle(s, v))}
            />
            <FilterGroup
                title="Price"
                options={jewelleryPriceRanges.map((r) => r.label)}
                selected={prices}
                onToggle={(v) => setPrices((s) => toggle(s, v))}
            />
            <FilterGroup
                title="Style"
                options={jewelleryStyles}
                selected={styleFilters as typeof jewelleryStyles}
                onToggle={(v) => setStyleFilters((s) => toggle(s, v))}
            />
            <FilterGroup
                title="Collection"
                options={jewelleryCollections}
                selected={collections as typeof jewelleryCollections}
                onToggle={(v) => setCollections((s) => toggle(s, v))}
            />
            {hasFilters && (
                <button type="button" className={styles.clearBtn} onClick={clearFilters}>
                    Clear all
                </button>
            )}
        </>
    );

    return (
        <section className={styles.shop}>
            <aside className={styles.sidebar}>{filters}</aside>

            <div className={styles.main}>
                <div className={styles.toolbar}>
                    <button
                        type="button"
                        className={styles.filterToggle}
                        onClick={() => setFiltersOpen(true)}
                        aria-expanded={filtersOpen}
                        aria-controls="shop-filters-drawer"
                    >
                        Filters
                        {filterCount > 0 ? <span className={styles.filterCount}>{filterCount}</span> : null}
                    </button>
                    <div className={styles.toolbarRight}>
                        <span>{filtered.length} items</span>
                        <div className={styles.sortSelect}>
                            <FancySelect
                                compact
                                alignEnd
                                aria-label="Sort products"
                                value={sort}
                                onChange={(value) => setSort(value as SortKey)}
                                options={[
                                    { value: "featured", label: "Featured" },
                                    { value: "new", label: "Newest" },
                                    { value: "price-asc", label: "Price: low to high" },
                                    { value: "price-desc", label: "Price: high to low" },
                                ]}
                            />
                        </div>
                    </div>
                    <div className={styles.pills}>
                        {(["All", ...jewelleryStyles] as const).map((style) => (
                            <button
                                key={style}
                                type="button"
                                className={`${styles.pill} ${activeStyle === style ? styles.pillActive : ""}`}
                                onClick={() => setActiveStyle(style)}
                            >
                                {style}
                            </button>
                        ))}
                    </div>
                </div>

                {filtered.length ? (
                    <div className={styles.grid}>
                        {filtered.map((product, index) => {
                            const feature = jewelleryFeatures.find(
                                (f) => f.insertBefore === index && filtered.length - index >= 4
                            );
                            return (
                                <Fragment key={product.id}>
                                    {feature && <JewelleryFeatureTile feature={feature} />}
                                    <JewelleryProductCard product={product} />
                                </Fragment>
                            );
                        })}
                    </div>
                ) : (
                    <div className={styles.empty}>
                        <p>No pieces match these filters.</p>
                        <button type="button" className={styles.clearBtn} onClick={clearFilters}>
                            Clear filters
                        </button>
                    </div>
                )}
            </div>

            {mounted &&
                createPortal(
                    <>
                        <div
                            className={`${styles.filterOverlay} ${filtersOpen ? styles.filterOverlayOpen : ""}`}
                            onClick={() => setFiltersOpen(false)}
                            aria-hidden={!filtersOpen}
                        />
                        <aside
                            id="shop-filters-drawer"
                            className={`${styles.filterDrawer} ${filtersOpen ? styles.filterDrawerOpen : ""}`}
                            aria-hidden={!filtersOpen}
                            inert={!filtersOpen}
                        >
                            <div className={styles.filterDrawerTop}>
                                <h3 className={styles.filterDrawerTitle}>Filters</h3>
                                <button
                                    type="button"
                                    className={styles.filterDrawerClose}
                                    onClick={() => setFiltersOpen(false)}
                                    aria-label="Close filters"
                                >
                                    Close
                                </button>
                            </div>
                            <div className={styles.filterDrawerBody}>{filters}</div>
                            <div className={styles.filterDrawerFooter}>
                                {hasFilters && (
                                    <button type="button" className={styles.clearBtn} onClick={clearFilters}>
                                        Clear all
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className={styles.filterApply}
                                    onClick={() => setFiltersOpen(false)}
                                >
                                    Show {filtered.length} items
                                </button>
                            </div>
                        </aside>
                    </>,
                    document.body
                )}
        </section>
    );
};

export default JewelleryShopArea;
