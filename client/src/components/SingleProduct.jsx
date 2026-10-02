import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import DOMPurify from "dompurify";
import "react-quill-new/dist/quill.snow.css";
import { useStore } from "../StoreContext";
import { Price } from "./Products";
import CartDrawer from "./Cartdrawer";
import "./Products.css";
import "./SingleProduct.css";
import Navbar from "./Navbar";
import Footer from "../pages/Footer";
import ExtraProductDetails from "./ExtraProductDetails";
import Faqs from "./Faqs";

const PLACEHOLDER =
    "data:image/svg+xml;utf8," +
    encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="100%" height="100%" fill="#f1f1f1"/></svg>');

const onImgError = (e) => { e.currentTarget.src = PLACEHOLDER; };

/* ---------- description: renders the rich-text HTML safely ---------- */
function ProductDescription({ html }) {
    // Make links open in a new tab, safely
    const clean = useMemo(() => {
        const dirty = DOMPurify.sanitize(html || "", { ADD_ATTR: ["target"] });
        return dirty.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
    }, [html]);

    return (
        <div className="ql-snow">
            <div
                className="ql-editor sp-desc"
                dangerouslySetInnerHTML={{ __html: clean }}
            />
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
                                <img
                                    className="sp-media"
                                    src={m.src}
                                    alt={`${name} ${i + 1}`}
                                    onError={onImgError}
                                />
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

/* ---------- page ---------- */
export default function SingleProduct() {
    const { id } = useParams();
    const {
        products, status, error, refresh,
        cartCount, cartItems, addToCart, decreaseItem, removeFromCart,
    } = useStore();
    const [added, setAdded] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);

    const product = products.find((p) => String(p.id) === String(id));

    // Image 1 first, then every video, then the remaining images.
    // Normalizes entries so they can be plain strings OR objects like { url } / { src }.
    const media = useMemo(() => {
        if (!product) return [];

        const normalize = (v) =>
            typeof v === "string" ? v : v?.url || v?.src || null;

        const rawImages = Array.isArray(product.images) ? product.images : [];
        const images = rawImages.map(normalize).filter(Boolean);
        if (images.length === 0) images.push(PLACEHOLDER);

        const videos = (Array.isArray(product.videos) ? product.videos : [])
            .map(normalize)
            .filter(Boolean);

        const [first, ...rest] = images;

        // TEMP debug — remove once the image shows correctly.
        console.log("[SingleProduct] images:", images, "videos:", videos);

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
                originalPrice: p.compare,
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

    // Open every product page at the top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (!added) return;
        const t = setTimeout(() => setAdded(false), 1200);
        return () => clearTimeout(t);
    }, [added]);

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
                {/* key resets the gallery to the first slide when the product changes */}
                <Gallery key={product.id} media={media} name={product.name} />

                <div className="sp-info">
                    {product.category && <p className="cat">{product.category}</p>}
                    <h1>{product.name}</h1>
                    <Price p={product} />
                    {product.description && <ProductDescription html={product.description} />}

                    {/* pass the whole product so the cart can snapshot it */}
                    <button className="add" onClick={() => { addToCart(product); setAdded(true); }}>
                        {added ? "ADDED" : "ADD TO CART"}
                    </button>
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
            <ExtraProductDetails />

            <Faqs />
            <Footer />
        </>
    );
}