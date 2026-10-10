import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../StoreContext";
import Price from "./Price";
import "./Products.css";     // cards, grid, price, buttons (scoped under .zp)
import "./HotPatterns.css";  // the two headings + tabs
import "./FlyToCart.css";
import flyToCart from "./FlyToCart";
import { optimize, srcSet } from "../utils/cloudinary";

const PLACEHOLDER =
    "data:image/svg+xml;utf8," +
    encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="100%" height="100%" fill="#f1f1f1"/></svg>');
const onImgError = (e) => {
    if (e.currentTarget.src !== PLACEHOLDER) e.currentTarget.src = PLACEHOLDER;
};

const NEW_TAB = "New Arrivals";
const DEFAULT_TABS = [NEW_TAB, "Bundle", "Valentine", "Car Hanging"];

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
    newCount = 8,         // how many random products "New Arrivals" shows
    maxPerTab = 8,        // max products shown in a category tab
}) {
    const { products, categories, status, error, refresh, addToCart } = useStore();
    const [tab, setTab] = useState(tabs[0]);

    /* picked once per product load, so switching tabs does not reshuffle it */
    const randomPicks = useMemo(() => shuffle(products).slice(0, newCount), [products, newCount]);

    const list = useMemo(
        () =>
            tab === NEW_TAB
                ? randomPicks
                : products.filter((p) => key(p.category) === key(tab)).slice(0, maxPerTab),
        [tab, products, randomPicks, maxPerTab]
    );

    const handleAdd = (e, p) => {
        addToCart(p);
        flyToCart(e.currentTarget);
    };

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

                    {status === "ready" && list.length === 0 && (
                        <div className="msg">
                            <p>No patterns in {tab} yet.</p>
                            {products.length > 0 && categories.length > 0 && (
                                <p>Categories in your store: {categories.join(", ")}</p>
                            )}
                        </div>
                    )}

                    {status === "ready" &&
                        list.map((p) => (
                            <article className="card" key={p.id}>
                                <Link className="thumb" to={`/product/${p.id}`} aria-label={`View ${p.name}`}>
                                    <img
                                        src={optimize(p.images?.[0] || PLACEHOLDER, 400)}
                                        srcSet={srcSet(p.images?.[0], [400, 800])}
                                        sizes="(max-width: 800px) 50vw, (max-width: 1100px) 33vw, 25vw"
                                        alt={p.name}
                                        width="400"
                                        height="400"
                                        loading="lazy"
                                        decoding="async"
                                        onError={onImgError}
                                    />
                                </Link>
                                <Link className="name" to={`/product/${p.id}`} title={p.name}>{p.name}</Link>
                                <Price p={p} />
                                {/* addToCart needs the whole product, not just the id */}
                                <button className="add" onClick={(e) => handleAdd(e, p)}>ADD TO CART</button>
                            </article>
                        ))}
                </div>
            </section>
        </div>
    );
}