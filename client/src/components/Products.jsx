import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { money, useStore } from "../StoreContext";
import CartDrawer from "./Cartdrawer";
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

/* ---------- main component ---------- */
export default function Products() {
    const {
        products, categories, status, error, refresh,
        cartCount, cartItems, addToCart, decreaseItem, removeFromCart,
    } = useStore();
    const [filter, setFilter] = useState("All");
    const [query, setQuery] = useState("");
    const [cartOpen, setCartOpen] = useState(false);
    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return products.filter(
            (p) => (filter === "All" || p.category === filter) && (!q || p.name.toLowerCase().includes(q))
        );
    }, [products, filter, query]);

    /* Map context cart shape → CartDrawer's expected shape */
    const drawerItems = useMemo(
        () =>
            cartItems.map(({ product: p, qty }) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                originalPrice: p.compare,
                qty,
                image: (p.images && p.images[0]) || PLACEHOLDER,
            })),
        [cartItems]
    );

    const handleQtyChange = (id, nextQty) => {
        const cur = cartItems.find((i) => String(i.product.id) === String(id))?.qty ?? 0;
        if (nextQty > cur) addToCart(cartItems.find((i) => String(i.product.id) === String(id)).product);
        else if (nextQty < cur) decreaseItem(id);
    };

    /* Escape closes the cart; page does not scroll behind it */
    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") setCartOpen(false); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() => {
        document.body.style.overflow = cartOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [cartOpen]);

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
                                <Link className="thumb" to={`/product/${p.id}`} aria-label={`View ${p.name}`}>
                                    <img src={p.images[0] || PLACEHOLDER} alt={p.name} loading="lazy" onError={onImgError} />
                                </Link>
                                <Link className="name" to={`/product/${p.id}`}>{p.name}</Link>
                                <Price p={p} />
                                {/* pass the whole product so the cart can snapshot it */}
                                <button className="add" onClick={() => addToCart(p)}>ADD TO CART</button>
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

            <CartDrawer
                isOpen={cartOpen}
                onClose={() => setCartOpen(false)}
                items={drawerItems}
                currency="$"
                onRemove={removeFromCart}
                onQtyChange={handleQtyChange}
                onCheckout={() => setCartOpen(false)}
                continueShoppingHref="/"
                checkoutHref="/checkout"
            />
        </div>
    );
}