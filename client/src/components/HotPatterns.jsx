import { useEffect, useMemo, useState } from "react";
import { useStore } from "../StoreContext";
import { Detail, Price } from "./Products";
import "./Products.css";     // cards, grid, price, buttons, popup (scoped under .zp)
import "./HotPatterns.css";  // the two headings + tabs

const PLACEHOLDER =
    "data:image/svg+xml;utf8," +
    encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="100%" height="100%" fill="#f1f1f1"/></svg>');
const onImgError = (e) => { e.currentTarget.src = PLACEHOLDER; };

const NEW_TAB = "New Arrivals";
const DEFAULT_TABS = ["Bundle", NEW_TAB, "Valentine", "Car Hanging"];

/* "Car Hanging", "car hanging", "CarHanging" and "Car Hangings" all become "carhanging" */
const key = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "").replace(/s$/, "");

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export default function HotPatterns({
    title = "Pattern Picks",
    subtitle = "New & Trending",
    tabs = DEFAULT_TABS,  // "New Arrivals" shows random products, every other tab matches the product category
    newCount = 20,        // how many random products "New Arrivals" shows
}) {
    const { products, status, error, refresh, addToCart } = useStore();
    const [tab, setTab] = useState(tabs[0]);
    const [selectedId, setSelectedId] = useState(null);

    /* picked once per product load, so switching tabs does not reshuffle it */
    const randomPicks = useMemo(() => shuffle(products).slice(0, newCount), [products, newCount]);

    const list = useMemo(
        () => (tab === NEW_TAB ? randomPicks : products.filter((p) => key(p.category) === key(tab))),
        [tab, products, randomPicks]
    );

    const current = selectedId !== null ? products.find((p) => String(p.id) === String(selectedId)) : null;

    useEffect(() => {
        if (!current) return undefined;
        const onKey = (e) => { if (e.key === "Escape") setSelectedId(null); };
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
    }, [current]);

    const onTabKey = (e, i) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        const next = (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
        setTab(tabs[next]);
        document.getElementById(`hp-tab-${next}`)?.focus();
    };

    return (
        <div className="zp">
            <section className="hp-section" aria-labelledby="hp-title">
                <h2 className="hp-head" id="hp-title">
                    <span className="hp-title">{title}</span>
                    <span className="hp-sub">{subtitle}</span>
                </h2>

                <div className="hp-tabs" role="tablist" aria-label="Pattern categories">
                    {tabs.map((t, i) => (
                        <button
                            key={t}
                            id={`hp-tab-${i}`}
                            role="tab"
                            className="hp-tab"
                            aria-selected={t === tab}
                            tabIndex={t === tab ? 0 : -1}
                            onClick={() => setTab(t)}
                            onKeyDown={(e) => onTabKey(e, i)}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="grid" role="tabpanel" aria-live="polite">
                    {status === "loading" &&
                        Array.from({ length: 4 }, (_, i) => (
                            <div className="card skel" key={i}>
                                <div className="thumb" />
                                <div className="bar" />
                                <div className="bar short" />
                            </div>
                        ))}

                    {status === "error" && (
                        <div className="msg">
                            <p>Products could not be loaded.</p>
                            <p>{error}</p>
                            <button className="retry" onClick={refresh}>Try again</button>
                        </div>
                    )}

                    {status === "ready" && list.length === 0 && <p className="msg">No patterns in {tab} yet.</p>}

                    {status === "ready" &&
                        list.map((p) => (
                            <article className="card" key={p.id}>
                                <button className="thumb" onClick={() => setSelectedId(p.id)} aria-label={`View ${p.name}`}>
                                    <img src={p.images[0] || PLACEHOLDER} alt={p.name} loading="lazy" onError={onImgError} />
                                </button>
                                <button className="name" onClick={() => setSelectedId(p.id)}>{p.name}</button>
                                <Price p={p} />
                                <button className="add" onClick={() => addToCart(p.id)}>ADD TO CART</button>
                            </article>
                        ))}
                </div>
            </section>

            {current && <Detail key={current.id} p={current} onClose={() => setSelectedId(null)} />}
        </div>
    );
}