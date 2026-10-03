import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/* ---------- CONFIG ---------- */
export const API_URL = ("https://hooktasy.onrender.com").replace(/\/$/, "");
export const LIST_PATH = "/api/food/list";
export const CURRENCY = "$";
const CART_KEY = "cart";

/* ---------- helpers ---------- */
export const money = (n) =>
    CURRENCY + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const pick = (o, keys) => {
    for (const k of keys) if (o[k] !== undefined && o[k] !== null && o[k] !== "") return o[k];
};

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

    // ---- NEW: normalize videos the same way ----
    let vids = pick(p, ["videos", "videoUrls", "video_urls", "videoList", "video"]) || [];
    if (typeof vids === "string") {
        try { vids = JSON.parse(vids); } catch { vids = vids.split(","); }
    }
    vids = (Array.isArray(vids) ? vids : [vids])
        .map((x) => (typeof x === "string" ? x : x && (x.url || x.src || x.secure_url)))
        .filter(Boolean)
        .map((s) => s.trim());
    // -------------------------------------------

    return {
        id: pick(p, ["id", "_id"]) ?? i,
        name: pick(p, ["name", "title"]) || "Untitled",
        price: Number(pick(p, ["price", "salePrice", "sale_price"])) || 0,
        compare: Number(pick(p, ["comparePrice", "compare_price", "compareAtPrice", "originalPrice", "oldPrice"])) || 0,
        category: pick(p, ["category", "type"]) || "",
        description: pick(p, ["description", "desc"]) || "",
        images: imgs,
        videos: vids,   // <-- ADD THIS
    };
}
/* Read the saved cart and drop anything malformed */
function loadCart() {
    try {
        const raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
        if (!Array.isArray(raw)) return [];
        return raw.filter(
            (i) => i && i.id != null && Number.isFinite(i.qty) && i.qty > 0 && i.snapshot
        );
    } catch {
        return [];
    }
}

/* ---------- context ---------- */
export const StoreContext = createContext(null);

export function StoreProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error"
    const [error, setError] = useState("");
    const [cart, setCart] = useState(loadCart);

    /* fetch the list */
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

    /* persist cart */
    useEffect(() => {
        try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* storage full or blocked */ }
    }, [cart]);

    /* Once the store has loaded, drop cart items whose product no longer exists.
       Skipped when the list is empty so a bad/empty response can't wipe the cart. */
    useEffect(() => {
        if (status !== "ready" || products.length === 0) return;
        const ids = new Set(products.map((p) => String(p.id)));
        setCart((c) => {
            const next = c.filter((i) => ids.has(String(i.id)));
            return next.length === c.length ? c : next;
        });
    }, [status, products]);

    /* cart actions — addToCart takes the FULL product */
    const addToCart = useCallback((product) => {
        if (!product || product.id == null) return;
        setCart((c) => {
            const idx = c.findIndex((i) => String(i.id) === String(product.id));
            if (idx >= 0) {
                const next = c.slice();
                next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
                return next;
            }
            return [
                ...c,
                {
                    id: product.id,
                    qty: 1,
                    snapshot: {
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        compare: product.compare,
                        images: product.images,
                    },
                },
            ];
        });
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

    const refresh = useCallback(() => loadProducts(), [loadProducts]);

    /* derived values */
    const categories = useMemo(() => [...new Set(products.map((p) => p.category).filter(Boolean))], [products]);

    /* Live lookup first, snapshot fallback second (used while loading or if the fetch fails) */
    const cartItems = useMemo(
        () =>
            cart
                .map((i) => {
                    const live = products.find((p) => String(p.id) === String(i.id));
                    const product = live || i.snapshot;
                    return product ? { id: i.id, qty: i.qty, product } : null;
                })
                .filter(Boolean),
        [cart, products]
    );
    const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
    const cartTotal = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);

    const value = useMemo(
        () => ({
            products, categories, status, error, refresh,
            cartItems, cartCount, cartTotal, addToCart, decreaseItem, removeFromCart, clearCart,
        }),
        [products, categories, status, error, refresh, cartItems, cartCount, cartTotal,
            addToCart, decreaseItem, removeFromCart, clearCart]
    );

    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
    const ctx = useContext(StoreContext);
    if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
    return ctx;
}