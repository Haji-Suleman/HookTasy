import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/* ---------- CONFIG ---------- */
// Vite reads VITE_API_URL from .env; falls back to the live backend
export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");
export const LIST_PATH = "/api/food/list"; // mounted as app.use("/api/food", foodRouter)
export const CURRENCY = "Rs.";

/* ---------- helpers ---------- */
export const money = (n) =>
    CURRENCY + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const pick = (o, keys) => {
    for (const k of keys) if (o[k] !== undefined && o[k] !== null && o[k] !== "") return o[k];
};

// The backend may return [..] or { data: [..] } / { products: [..] } etc.
function extractList(data) {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") {
        for (const k of ["data", "products", "items", "list", "result", "results"]) {
            if (Array.isArray(data[k])) return data[k];
            if (data[k] && typeof data[k] === "object") {
                const inner = extractList(data[k]);
                if (inner.length) return inner;
            }
        }
        const first = Object.values(data).find(Array.isArray);
        if (first) return first;
    }
    return [];
}

export function normalizeProduct(p, i) {
    let imgs = pick(p, ["images", "imageUrls", "image_urls", "photos", "gallery", "imageList"]) || [];
    if (typeof imgs === "string") {
        try { imgs = JSON.parse(imgs); } catch { imgs = imgs.split(","); }
    }
    imgs = (Array.isArray(imgs) ? imgs : [imgs])
        .map((x) => (typeof x === "string" ? x : x && (x.url || x.src || x.secure_url)))
        .filter(Boolean)
        .map((s) => s.trim());
    const one = pick(p, ["image", "thumbnail", "img"]);
    if (!imgs.length && one) imgs = [one];

    return {
        id: pick(p, ["id", "_id"]) ?? i,
        name: pick(p, ["name", "title"]) || "Untitled",
        price: Number(pick(p, ["price", "salePrice", "sale_price"])) || 0,
        compare: Number(pick(p, ["comparePrice", "compare_price", "compareAtPrice", "originalPrice", "oldPrice"])) || 0,
        category: pick(p, ["category", "type"]) || "",
        description: pick(p, ["description", "desc"]) || "",
        images: imgs,
    };
}

/* ---------- context ---------- */
export const StoreContext = createContext(null);

export function StoreProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error"
    const [error, setError] = useState("");
    const [cart, setCart] = useState(() => {
        try { return JSON.parse(localStorage.getItem("cart") || "[]"); } catch { return []; }
    });

    /* fetch the list from `${API_URL}/list` */
    const loadProducts = useCallback(async (signal) => {
        setStatus("loading");
        setError("");
        try {
            const res = await fetch(API_URL + LIST_PATH, { headers: { Accept: "application/json" }, signal });
            if (!res.ok) throw new Error(`The server answered with status ${res.status}.`);
            let data;
            try { data = await res.json(); } catch { throw new Error("The server did not return valid JSON."); }
            setProducts(extractList(data).map(normalizeProduct));
            setStatus("ready");
        } catch (err) {
            if (err.name === "AbortError") return;
            setError(err.message || "Something went wrong.");
            setStatus("error");
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        loadProducts(controller.signal);
        return () => controller.abort();
    }, [loadProducts]);

    /* keep the cart between visits */
    useEffect(() => {
        try { localStorage.setItem("cart", JSON.stringify(cart)); } catch { }
    }, [cart]);

    /* cart actions */
    const addToCart = useCallback((id) => {
        setCart((c) =>
            c.some((i) => String(i.id) === String(id))
                ? c.map((i) => (String(i.id) === String(id) ? { ...i, qty: i.qty + 1 } : i))
                : [...c, { id, qty: 1 }]
        );
    }, []);

    const decreaseItem = useCallback((id) => {
        setCart((c) =>
            c.flatMap((i) => (String(i.id) !== String(id) ? [i] : i.qty > 1 ? [{ ...i, qty: i.qty - 1 }] : []))
        );
    }, []);

    const removeFromCart = useCallback((id) => {
        setCart((c) => c.filter((i) => String(i.id) !== String(id)));
    }, []);

    const clearCart = useCallback(() => setCart([]), []);

    /* derived values */
    const categories = useMemo(() => [...new Set(products.map((p) => p.category).filter(Boolean))], [products]);

    const cartItems = useMemo(
        () =>
            cart
                .map((i) => ({ ...i, product: products.find((p) => String(p.id) === String(i.id)) }))
                .filter((i) => i.product),
        [cart, products]
    );
    const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
    const cartTotal = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);

    const value = {
        products, categories, status, error, refresh: () => loadProducts(),
        cartItems, cartCount, cartTotal, addToCart, decreaseItem, removeFromCart, clearCart,
    };

    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
    const ctx = useContext(StoreContext);
    if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
    return ctx;
}