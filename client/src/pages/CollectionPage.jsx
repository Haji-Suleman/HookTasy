import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore, money } from '../StoreContext';
import Navbar from '../components/Navbar';
import Footer from './Footer';
import CartDrawer from '../components/Cartdrawer';
import flyToCart from '../components/FlyToCart';
import { optimize, srcSet } from '../utils/cloudinary';
import './CollectionPage.css';

const PLACEHOLDER =
    "data:image/svg+xml;utf8," +
    encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="100%" height="100%" fill="#f1f1f1"/></svg>');

const onImgError = (e) => { e.currentTarget.src = PLACEHOLDER; };

export default function CollectionPage() {
    const params = useParams();
    const {
        products, status, error, refresh,
        cartCount, cartItems, addToCart, decreaseItem, removeFromCart,
    } = useStore();
    const [cartOpen, setCartOpen] = useState(false);

    // Convert URL slug (e.g., 'best-sellers') to display name (e.g., 'Best Sellers')
    const categoryTitle = useMemo(() => {
        const id = params.categoryId || params.parentCategory;
        if (!id) return 'Collection';
        return id
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }, [params]);

    // Filter products based on categoryId
    const visible = useMemo(() => {
        if (!products || products.length === 0) return [];

        const id = params.categoryId || params.parentCategory;
        if (!id || id === 'all') return products.slice(0, 10);

        // Try to match categoryId (slug) with product category (name)
        const slug = id.toLowerCase();
        const filtered = products.filter(p =>
            p.category?.toLowerCase().replace(/\s+/g, '-') === slug ||
            p.category?.toLowerCase() === slug
        );

        // If the specific category is empty, return 10 random products as a fallback
        if (filtered.length === 0) {
            return [...products].sort(() => 0.5 - Math.random()).slice(0, 10);
        }

        return filtered;
    }, [products, params]);

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

    const handleQty = (id, nextQty) => {
        const entry = cartItems.find((i) => String(i.product.id) === String(id));
        if (!entry) return;
        if (nextQty > entry.qty) addToCart(entry.product);
        else if (nextQty < entry.qty) decreaseItem(id);
    };

    const handleAdd = (e, p) => {
        addToCart(p);
        flyToCart(e.currentTarget);
    };

    return (
        <div className="collection-page">
            <Navbar />
            <main className="collection-main">
                <div className="collection-header">
                    <h1>{categoryTitle}</h1>
                    <p>{visible.length} items found</p>
                </div>

                {status === "loading" && (
                    <div className="grid">
                        {Array.from({ length: 8 }, (_, i) => (
                            <div className="card skel" key={i}><div className="thumb" /><div className="bar" /><div className="bar short" /></div>
                        ))}
                    </div>
                )}

                {status === "error" && (
                    <div className="msg">
                        <p>Error loading products: {error}</p>
                        <button className="retry" onClick={refresh}>Try again</button>
                    </div>
                )}

                {status === "ready" && visible.length === 0 && (
                    <div className="msg">
                        <p>No products found in this collection.</p>
                    </div>
                )}

                {status === "ready" && (
                    <section className="grid">
                        {visible.map((p, idx) => (
                            <article className="card" key={p.id}>
                                <Link className="thumb" to={`/product/${p.id}`}>
                                    <img
                                        src={optimize(p.images[0] || PLACEHOLDER, 400)}
                                        srcSet={srcSet(p.images[0], [400, 800])}
                                        alt={p.name}
                                        onError={onImgError}
                                    />
                                </Link>
                                <Link className="name" to={`/product/${p.id}`}>{p.name}</Link>
                                <p className="price">
                                    {money(p.price)}
                                    {p.compare > p.price && <s>{money(p.compare)}</s>}
                                </p>
                                <button className="add" onClick={(e) => handleAdd(e, p)}>ADD TO CART</button>
                            </article>
                        ))}
                    </section>
                )}
            </main>
            <Footer />
            <CartDrawer
                isOpen={cartOpen}
                onClose={() => setCartOpen(false)}
                items={drawerItems}
                currency="$"
                onRemove={removeFromCart}
                onQtyChange={handleQty}
                onCheckout={() => setCartOpen(false)}
                continueShoppingHref="/"
                checkoutHref="/checkout"
            />
        </div>
    );
}
