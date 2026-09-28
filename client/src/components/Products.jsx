import { useEffect, useMemo, useState } from "react";
import { money, useStore } from "../StoreContext";
import "./Products.css";

const PLACEHOLDER =
    "data:image/svg+xml;utf8," +
    encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="100%" height="100%" fill="#f1f1f1"/></svg>');

const onImgError = (e) => { e.currentTarget.src = PLACEHOLDER; };

export function Price({ p }) {
    return (
        <p className="price">
            {money(p.price)}
            {p.compare > p.price && <s>{money(p.compare)}</s>}
        </p>
    );
}

/* ---------- product popup ---------- */
export function Detail({ p, onClose }) {
    const { addToCart } = useStore();
    const [idx, setIdx] = useState(0);
    const [added, setAdded] = useState(false);
    const imgs = p.images.length ? p.images : [PLACEHOLDER];

    useEffect(() => {
        if (!added) return;
        const t = setTimeout(() => setAdded(false), 1200);
        return () => clearTimeout(t);
    }, [added]);

    return (
        <div className="overlay" onClick={onClose}>
            <div className="modal" role="dialog" aria-modal="true" aria-label={p.name} onClick={(e) => e.stopPropagation()}>
                <button className="x" onClick={onClose} aria-label="Close" autoFocus>&times;</button>
                <div className="d-body">
                    <div>
                        <img className="d-main" src={imgs[idx]} alt={p.name} onError={onImgError} />
                        {imgs.length > 1 && (
                            <div className="d-thumbs">
                                {imgs.map((s, i) => (
                                    <button key={i} aria-label={`Image ${i + 1}`} aria-current={i === idx ? "true" : undefined} onClick={() => setIdx(i)}>
                                        <img src={s} alt="" onError={onImgError} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="d-info">
                        {p.category && <p className="cat">{p.category}</p>}
                        <h2>{p.name}</h2>
                        <Price p={p} />
                        {p.description && <p className="d-desc">{p.description}</p>}
                        <button className="add" onClick={() => { addToCart(p.id); setAdded(true); }}>
                            {added ? "ADDED" : "ADD TO CART"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ---------- cart drawer ---------- */
function CartDrawer({ onClose }) {
    const { cartItems, cartTotal, addToCart, decreaseItem, removeFromCart, clearCart } = useStore();
    return (
        <div className="overlay side" onClick={onClose}>
            <aside className="drawer" role="dialog" aria-modal="true" aria-label="Cart" onClick={(e) => e.stopPropagation()}>
                <h2>Your cart</h2>
                <ul className="c-list">
                    {cartItems.length === 0 && <li className="c-empty">Your cart is empty.</li>}
                    {cartItems.map(({ product: p, qty }) => (
                        <li key={p.id}>
                            <img src={p.images[0] || PLACEHOLDER} alt="" onError={onImgError} />
                            <div>
                                {p.name}
                                <small>{money(p.price)}</small>
                                <div className="qty">
                                    <button onClick={() => decreaseItem(p.id)} aria-label={`Remove one ${p.name}`}>&minus;</button>
                                    <span>{qty}</span>
                                    <button onClick={() => addToCart(p.id)} aria-label={`Add one ${p.name}`}>+</button>
                                </div>
                            </div>
                            <button className="rm" onClick={() => removeFromCart(p.id)}>Remove</button>
                        </li>
                    ))}
                </ul>
                <div className="total"><span>Total</span><span>{money(cartTotal)}</span></div>
                {cartItems.length > 0 && <button className="link" onClick={clearCart}>Clear cart</button>}
                <button className="add" onClick={onClose}>Close</button>
            </aside>
        </div>
    );
}

/* ---------- main component ---------- */
export default function Products() {
    const { products, categories, status, error, refresh, cartCount, addToCart } = useStore();
    const [filter, setFilter] = useState("All");
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const [cartOpen, setCartOpen] = useState(false);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return products.filter(
            (p) => (filter === "All" || p.category === filter) && (!q || p.name.toLowerCase().includes(q))
        );
    }, [products, filter, query]);

    const current = selectedId !== null ? products.find((p) => String(p.id) === String(selectedId)) : null;
    const overlayOpen = Boolean(current) || cartOpen;

    /* Escape closes popups; page does not scroll behind them */
    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") { setSelectedId(null); setCartOpen(false); } };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() => {
        document.body.style.overflow = overlayOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [overlayOpen]);

    return (
        <div className="zp">
            <main className="wrap">
                <h2 className="title">Top Favorite Patterns</h2>

                {status === "ready" && products.length > 0 && (
                    <div className="toolbar">
                        <input
                            type="search"
                            className="search"
                            placeholder="Search patterns"
                            aria-label="Search patterns"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {categories.length > 1 && (
                            <div className="filters">
                                {["All", ...categories].map((c) => (
                                    <button key={c} aria-pressed={c === filter} onClick={() => setFilter(c)}>{c}</button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <section className="grid" aria-live="polite">
                    {status === "loading" &&
                        Array.from({ length: 8 }, (_, i) => (
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
                            <p>If this keeps happening, check that the backend allows requests from this site (CORS).</p>
                            <button className="retry" onClick={refresh}>Try again</button>
                        </div>
                    )}

                    {status === "ready" && visible.length === 0 && (
                        <p className="msg">{products.length === 0 ? "No products to show yet." : "No patterns match your search."}</p>
                    )}

                    {status === "ready" &&
                        visible.map((p) => (
                            <article className="card" key={p.id}>
                                <button className="thumb" onClick={() => setSelectedId(p.id)} aria-label={`View ${p.name}`}>
                                    <img src={p.images[0] || PLACEHOLDER} alt={p.name} loading="lazy" onError={onImgError} />
                                </button>
                                <button className="name" onClick={() => setSelectedId(p.id)}>{p.name}</button>
                                <Price p={p} />
                                <button className="add" onClick={() => addToCart(p.id)}>ADD TO CART</button>
                            </article>
                        ))}
                </section>
            </main>

            <button className="fab" onClick={() => setCartOpen(true)} aria-label={`Open cart, ${cartCount} items`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 8h12l-1 12H7L6 8z" />
                    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                </svg>
                <span className="badge">{cartCount}</span>
            </button>

            {current && <Detail key={current.id} p={current} onClose={() => setSelectedId(null)} />}
            {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} />}
        </div>
    );
}