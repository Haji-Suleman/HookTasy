import { useEffect, useId, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import DOMPurify from "dompurify";
import "react-quill-new/dist/quill.snow.css";
import { money, useStore } from "../StoreContext";
import CartDrawer from "./Cartdrawer";
import { flyToCart } from "./FlyToCart";
import "./Products.css";
import "./FlyToCart.css";
import "./SingleProduct.css";
import Navbar from "./Navbar";
import Footer from "../pages/Footer";
import ExtraProductDetails from "./ExtraProductDetails";
import Faqs from "./Faqs";
import DealTimer from "./Dealtime";

/* ---------------------------------------------------------------
   YOUR "GUARANTEED SAFE CHECKOUT" IMAGE:
   1) uncomment the import and fix the path/file name
   2) set SECURE_IMG = secureCheckout
   --------------------------------------------------------------- */
// import secureCheckout from "../assets/secure-checkout.png";
const SECURE_IMG = null;

/* "Frequently bought together" real discount: 0.2 = 20% off.
   Keep it 0 until your checkout/backend really applies it. */
const BUNDLE_DISCOUNT = 0;

/* Dummy discount on every product. Set to 0 to turn it off.
   Crossed-out price = real price / (1 - 0.74) */
const FAKE_DISCOUNT = 74;
const wasPrice = (price) =>
    FAKE_DISCOUNT > 0 ? Math.round(Number(price) / (1 - FAKE_DISCOUNT / 100)) : 0;

const WISH_KEY = "zootsy-wishlist";
const readWish = () => {
    try {
        const v = JSON.parse(localStorage.getItem(WISH_KEY));
        return Array.isArray(v) ? v : [];
    } catch {
        return [];
    }
};
const writeWish = (list) => {
    try {
        localStorage.setItem(WISH_KEY, JSON.stringify(list));
    } catch {
        /* storage blocked: the heart still toggles for this visit */
    }
};

const PLACEHOLDER =
    "data:image/svg+xml;utf8," +
    encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="100%" height="100%" fill="#f1f1f1"/></svg>');

const onImgError = (e) => { e.currentTarget.src = PLACEHOLDER; };

/* ---------- description: renders the rich-text HTML safely ---------- */
function ProductDescription({ html }) {
    const clean = useMemo(() => {
        const dirty = DOMPurify.sanitize(html || "", { ADD_ATTR: ["target"] });
        return dirty.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
    }, [html]);

    return (
        <div className="ql-snow">
            <div className="ql-editor sp-desc" dangerouslySetInnerHTML={{ __html: clean }} />
        </div>
    );
}

/* ---------- accordion (closed by default) ---------- */
function Accordion({ title, children }) {
    const [open, setOpen] = useState(false);
    const id = useId();
    return (
        <div className={`sp-acc${open ? " is-open" : ""}`}>
            <button
                type="button"
                className="sp-acc__head"
                aria-expanded={open}
                aria-controls={id}
                onClick={() => setOpen((o) => !o)}
            >
                <span>{title}</span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
            <div className="sp-acc__body" id={id} role="region">
                <div className="sp-acc__inner">{children}</div>
            </div>
        </div>
    );
}

/* ---------- gallery: first image, then videos, then the other images ---------- */
function Gallery({ media, name }) {
    const [swiper, setSwiper] = useState(null);
    const [active, setActive] = useState(0);

    const pauseVideos = (s) => {
        s?.el?.querySelectorAll("video").forEach((v) => v.pause());
    };

    return (
        <div className="sp-gallery">
            <div className="sp-stage">
                <Swiper
                    className="sp-swiper"
                    onSwiper={setSwiper}
                    onSlideChange={(s) => {
                        pauseVideos(s);
                        setActive(s.activeIndex);
                    }}
                    slidesPerView={1}
                    spaceBetween={0}
                    rewind={true}
                >
                    {media.map((m, i) => (
                        <SwiperSlide key={`${m.type}-${i}`} className="sp-slide">
                            {m.type === "image" ? (
                                <img className="sp-media" src={m.src} alt={`${name} ${i + 1}`} onError={onImgError} />
                            ) : (
                                <video
                                    className="sp-media sp-video swiper-no-swiping"
                                    src={m.src}
                                    controls
                                    playsInline
                                    preload="metadata"
                                />
                            )}
                        </SwiperSlide>
                    ))}
                </Swiper>

                {media.length > 1 && (
                    <>
                        <button className="sp-nav sp-nav--prev" onClick={() => swiper?.slidePrev()} aria-label="Previous">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M15 5 7 12l8 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <button className="sp-nav sp-nav--next" onClick={() => swiper?.slideNext()} aria-label="Next">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M9 5l8 7-8 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </>
                )}
            </div>

            {media.length > 1 && (
                <div className="sp-thumbs">
                    {media.map((m, i) => (
                        <button
                            key={`thumb-${m.type}-${i}`}
                            className="sp-thumb"
                            aria-label={`${m.type === "video" ? "Video" : "Image"} ${i + 1}`}
                            aria-current={i === active ? "true" : undefined}
                            onClick={() => swiper?.slideTo(i)}
                        >
                            {m.type === "image" ? (
                                <img src={m.src} alt="" onError={onImgError} />
                            ) : (
                                <>
                                    <video src={`${m.src}#t=0.1`} muted preload="metadata" />
                                    <span className="sp-play" aria-hidden="true">▶</span>
                                </>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ---------- frequently bought together ---------- */
function FrequentlyBought({ product, products, addToCart }) {
    const related = useMemo(() => {
        const others = products.filter((p) => String(p.id) !== String(product.id));
        const same = others.filter((p) => p.category && p.category === product.category);
        const rest = others.filter((p) => !same.includes(p));
        return [...same, ...rest].slice(0, 2);
    }, [products, product]);

    const [off, setOff] = useState({}); // ids the customer un-ticked

    if (!related.length) return null;

    const deal = (n) => Number(n) * (1 - BUNDLE_DISCOUNT);
    const chosen = [product, ...related.filter((p) => !off[p.id])];
    const total = chosen.reduce((s, p) => s + deal(p.price), 0);
    const crossed = chosen.reduce((s, p) => s + wasPrice(p.price), 0);

    const claim = (e) => {
        chosen.forEach((p) => addToCart(p));
        flyToCart(e.currentTarget);
    };

    const row = (p, locked) => {
        const was = wasPrice(p.price);
        return (
            <label className={`sp-fbt__item${locked ? " is-locked" : ""}`} key={p.id}>
                <input
                    type="checkbox"
                    checked={locked ? true : !off[p.id]}
                    disabled={locked}
                    onChange={() => setOff((o) => ({ ...o, [p.id]: !o[p.id] }))}
                />
                <img src={(p.images && p.images[0]) || PLACEHOLDER} alt="" onError={onImgError} />
                <span className="sp-fbt__text">
                    <span className="sp-fbt__name">{p.name}</span>
                    <span className="sp-fbt__price">
                        {money(deal(p.price))}
                        {was > Number(p.price) && <s>{money(was)}</s>}
                    </span>
                </span>
            </label>
        );
    };

    return (
        <section className="sp-fbt" aria-label="Frequently bought together">
            <h2>Frequently bought together</h2>
            {row(product, true)}
            {related.map((p) => row(p, false))}
            <button type="button" className="sp-claim" onClick={claim}>
                Claim Offer · {money(total)}
                {crossed > total && <s>{money(crossed)}</s>}
            </button>
        </section>
    );
}

/* ---------- page ---------- */
export default function SingleProduct() {
    const { id } = useParams();
    const {
        products, status, error, refresh,
        cartCount, cartItems, addToCart, decreaseItem, removeFromCart,
    } = useStore();
    const [added, setAdded] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [liked, setLiked] = useState(false);
    const [shared, setShared] = useState(false);

    const product = products.find((p) => String(p.id) === String(id));

    const media = useMemo(() => {
        if (!product) return [];

        const normalize = (v) => (typeof v === "string" ? v : v?.url || v?.src || null);

        const rawImages = Array.isArray(product.images) ? product.images : [];
        const images = rawImages.map(normalize).filter(Boolean);
        if (images.length === 0) images.push(PLACEHOLDER);

        const videos = (Array.isArray(product.videos) ? product.videos : [])
            .map(normalize)
            .filter(Boolean);

        const [first, ...rest] = images;

        return [
            { type: "image", src: first },
            ...videos.map((src) => ({ type: "video", src })),
            ...rest.map((src) => ({ type: "image", src })),
        ];
    }, [product]);

    /* Map context cart shape → CartDrawer's expected shape */
    const drawerItems = useMemo(
        () =>
            cartItems.map(({ product: p, qty }) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                originalPrice: wasPrice(p.price),
                qty,
                image: (p.images && p.images[0]) || PLACEHOLDER,
            })),
        [cartItems]
    );

    const handleQtyChange = (itemId, nextQty) => {
        const line = cartItems.find((i) => String(i.product.id) === String(itemId));
        if (!line) return;
        if (nextQty > line.qty) addToCart(line.product);
        else if (nextQty < line.qty) decreaseItem(itemId);
    };

    const handleAdd = (e) => {
        addToCart(product);
        setAdded(true);
        flyToCart(e.currentTarget);
    };

    const toggleLike = () => {
        const key = String(id);
        const list = readWish();
        const next = list.includes(key) ? list.filter((x) => x !== key) : [...list, key];
        writeWish(next);
        setLiked(next.includes(key));
    };

    const handleShare = async () => {
        const url = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: product?.name, url });
                return;
            }
            await navigator.clipboard.writeText(url);
            setShared(true);
        } catch {
            /* user cancelled the share sheet */
        }
    };

    // Open every product page at the top, and restore the saved heart
    useEffect(() => {
        window.scrollTo(0, 0);
        setLiked(readWish().includes(String(id)));
    }, [id]);

    useEffect(() => {
        if (!added) return;
        const t = setTimeout(() => setAdded(false), 1200);
        return () => clearTimeout(t);
    }, [added]);

    useEffect(() => {
        if (!shared) return;
        const t = setTimeout(() => setShared(false), 1800);
        return () => clearTimeout(t);
    }, [shared]);

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

    const was = product ? wasPrice(product.price) : 0;
    const pct = product && was > Number(product.price) ? FAKE_DISCOUNT : 0;

    let content;

    if (status === "loading") {
        content = (
            <div className="sp-grid" aria-busy="true">
                <div className="sp-skel sp-skel--img" />
                <div>
                    <div className="sp-skel sp-skel--bar" />
                    <div className="sp-skel sp-skel--bar sp-skel--short" />
                </div>
            </div>
        );
    } else if (status === "error") {
        content = (
            <div className="sp-msg">
                <p>This pattern could not be loaded.</p>
                <p>{error}</p>
                <button className="retry" onClick={refresh}>Try again</button>
            </div>
        );
    } else if (!product) {
        content = (
            <div className="sp-msg">
                <p>We couldn’t find that pattern.</p>
                <Link className="retry sp-retry-link" to="/">Back to all patterns</Link>
            </div>
        );
    } else {
        content = (
            <div className="sp-grid">
                {/* sticky on desktop: stays in view while the right column scrolls */}
                <Gallery key={product.id} media={media} name={product.name} />

                <div className="sp-info">
                    <div className="sp-titleRow">
                        <h1>{product.name}</h1>
                        <button
                            type="button"
                            className="sp-heart"
                            aria-pressed={liked}
                            aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                            onClick={toggleLike}
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                    d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.3 5 6.4 5c1.9 0 3.7 1 5.6 3.2C13.9 6 15.7 5 17.6 5c3.1 0 5 3 3.7 6.3-1.8 4.6-9.3 9.2-9.3 9.2z"
                                    fill={liked ? "currentColor" : "none"}
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    </div>

                    <div className="sp-priceRow">
                        <span className="sp-price">{money(product.price)}</span>
                        {pct > 0 && (
                            <>
                                <s className="sp-compare">{money(was)}</s>
                                <span className="sp-save">SAVE {pct}%</span>
                            </>
                        )}
                    </div>

                    <p className="sp-lang">
                        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                            <circle cx="12" cy="12" r="9" fill="#2f6fe4" />
                            <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" fill="none" stroke="#fff" strokeWidth="1.4" />
                        </svg>
                        English PDF
                    </p>

                    <DealTimer />

                    <button className="add" onClick={handleAdd}>
                        {added ? "ADDED" : "ADD TO CART"}
                    </button>

                    <button type="button" className="sp-share" onClick={handleShare}>
                        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                            <circle cx="6" cy="12" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
                            <circle cx="18" cy="6" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
                            <circle cx="18" cy="18" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
                            <path d="M8 11l8-4M8 13l8 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                        </svg>
                        {shared ? "Link copied!" : "Share"}
                    </button>

                    <FrequentlyBought product={product} products={products} addToCart={addToCart} />

                    {SECURE_IMG && (
                        <div className="sp-secure">
                            <img src={SECURE_IMG} alt="Guaranteed safe and secure checkout" />
                        </div>
                    )}

                    <div className="sp-accs">
                        {product.description && (
                            <Accordion title="Product Description">
                                <ProductDescription html={product.description} />
                            </Accordion>
                        )}

                        <Accordion title="Important Note">
                            <p className="sp-warn">⚠️ This is a digital download; no physical item will be shipped</p>
                            <h3 className="sp-policy">LICENSING POLICY</h3>
                            <ul>
                                <li>This digital pattern is for PERSONAL USE only. Please do not distribute or sell any components of this pattern.</li>
                                <li>
                                    You are allowed to sell the completed products, but you must provide proper credit to us (
                                    <a href="/">zootsyshop.com</a>) as the pattern design
                                </li>
                            </ul>
                        </Accordion>

                        <Accordion title="Refund Policies">
                            <ul>
                                <li>
                                    At Zootsyshop, we want you to be completely satisfied with your purchase.
                                    <ul>
                                        <li><strong>Returns:</strong> Due to the nature of our products being digital downloads, we do not offer returns or exchanges once the purchase is completed.</li>
                                        <li><strong>Refunds:</strong> If you encounter any issues with your order or have not received your download link, please contact our customer support within 7 days of purchase. We will do our best to assist you.</li>
                                        <li><strong>Money-Back Guarantee:</strong> We stand by the quality of our patterns. If you are not satisfied with your purchase due to a technical error or issue with the pattern itself, please reach out to us, and we will evaluate your request for a refund on a case-by-case basis.</li>
                                    </ul>
                                </li>
                            </ul>
                        </Accordion>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="zp sp">
                <main className="sp-wrap">
                    <Link className="sp-back" to="/">
                        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                            <path d="M15 5 7 12l8 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        All patterns
                    </Link>

                    {content}
                </main>

                <button
                    className="fab"
                    data-cart-target
                    onClick={() => setCartOpen(true)}
                    aria-label={`Open cart, ${cartCount} items`}
                >
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

            <ExtraProductDetails />
            <Faqs />
            <Footer />
        </>
    );
}