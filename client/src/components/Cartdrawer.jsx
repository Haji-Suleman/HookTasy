import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../StoreContext';
import './Cartdrawer.css';

/* ---------------------------------------------------------------
   YOUR PAYMENT LOGOS: import your image(s) and list them here.
   One strip image or several separate logos both work.
   --------------------------------------------------------------- */
// import paymentLogos from '../assets/payment-logos.png';
const PAYMENT_LOGOS = [
    // { src: paymentLogos, alt: 'Accepted payment methods' },
];

/* Free-gift milestones (by number of items in the cart) */
const GIFT_TIERS = [
    { at: 3, label: 'FREE SMALL' },
    { at: 5, label: 'FREE BIG' },
];

const RESERVE_SECONDS = 10 * 60;

const CloseIcon = ({ className = 'icon-md' }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 5l14 14M19 5L5 19" />
    </svg>
);

const MinusIcon = () => (
    <svg viewBox="0 0 24 24" className="icon-sm" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
        <path d="M5 12h14" />
    </svg>
);

const PlusIcon = () => (
    <svg viewBox="0 0 24 24" className="icon-sm" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
    </svg>
);

const TrashIcon = () => (
    <svg viewBox="0 0 24 24" className="icon-md" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
    </svg>
);

const GiftIcon = () => (
    <svg viewBox="0 0 24 24" className="icon-md" fill="currentColor" aria-hidden="true">
        <path d="M20 7h-2.2A3 3 0 0 0 12 4.8 3 3 0 0 0 6.2 7H4a1 1 0 0 0-1 1v3h8V7h2v4h8V8a1 1 0 0 0-1-1zM9 7a1 1 0 1 1 1-1v1H9zm6 0h-1V6a1 1 0 1 1 1 1zM4 13v6a1 1 0 0 0 1 1h6v-7H4zm9 0v7h6a1 1 0 0 0 1-1v-6h-7z" />
    </svg>
);

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export default function CartDrawer({
    isOpen,
    onClose,
    items = [],
    currency = 'Rs.',
    onRemove,
    onQtyChange,
    onCheckout,
    continueShoppingHref = '/',
    checkoutHref = '/checkout',
    linkComponent: LinkComp = 'a',
    linkProp = 'href',
    showTimer = true,
    showGiftBar = true,
    onApplyDiscount, // pass a function to show the discount box: (code) => void
}) {
    const closeBtnRef = useRef(null);
    const { products = [], addToCart } = useStore();

    const [order, setOrder] = useState([]);
    const [secs, setSecs] = useState(RESERVE_SECONDS);
    const [code, setCode] = useState('');

    const count = items.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const format = (n) =>
        `${currency}${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    /* open: lock scroll, focus close button, Escape closes */
    useEffect(() => {
        if (!isOpen) return undefined;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        closeBtnRef.current?.focus();
        const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
        document.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prevOverflow;
            document.removeEventListener('keydown', onKey);
        };
    }, [isOpen, onClose]);

    /* pick a fresh random order of products every time the drawer opens */
    useEffect(() => {
        if (isOpen && products.length) setOrder(shuffle(products));
    }, [isOpen, products.length]); // eslint-disable-line react-hooks/exhaustive-deps

    /* suggestions = random products that are not already in the cart */
    const suggestions = useMemo(() => {
        const inCart = new Set(items.map((i) => String(i.id)));
        return order.filter((p) => !inCart.has(String(p.id))).slice(0, 5);
    }, [order, items]);

    /* reservation countdown */
    useEffect(() => {
        if (count === 0) { setSecs(RESERVE_SECONDS); return undefined; }
        if (!isOpen) return undefined;
        const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
        return () => clearInterval(t);
    }, [isOpen, count]);

    const mm = String(Math.floor(secs / 60)).padStart(2, '0');
    const ss = String(secs % 60).padStart(2, '0');

    /* free gift progress */
    const maxTier = GIFT_TIERS[GIFT_TIERS.length - 1].at;
    const nextTier = GIFT_TIERS.find((t) => count < t.at);
    const progress = Math.min(count / maxTier, 1) * 100;

    const renderLink = (to, children, props) => (
        <LinkComp {...props} {...{ [linkProp]: to }}>{children}</LinkComp>
    );

    const tab = isOpen ? 0 : -1;

    /* suggested products (used on desktop side panel AND mobile strip) */
    const renderSuggestions = (variant) => (
        <div className={`cd-sug cd-sug--${variant}`}>
            {suggestions.map((p) => (
                <div className="cd-sug__card" key={p.id}>
                    <img
                        className="cd-sug__img"
                        src={(p.images && p.images[0]) || ''}
                        alt={p.name}
                        loading="lazy"
                    />
                    <p className="cd-sug__name">{p.name}</p>
                    <p className="cd-sug__price">
                        <strong>{format(p.price)}</strong>
                        {p.compare > p.price && <s>{format(p.compare)}</s>}
                    </p>
                    <button type="button" tabIndex={tab} className="cd-sug__add" onClick={() => addToCart(p)}>
                        Add to cart
                    </button>
                </div>
            ))}
        </div>
    );

    return createPortal(
        <div className={`cart-drawer-root${isOpen ? ' cart-drawer-root--open' : ''}`}>
            <div className="cart-drawer-overlay" onClick={onClose} />

            <div className="cart-drawer-wrap" data-open={isOpen ? 'true' : 'false'}>
                {/* ---------- LEFT: suggested products (desktop) ---------- */}
                {suggestions.length > 0 && (
                    <aside className="cart-drawer-upsell" aria-label="Suggested products">
                        <h3 className="cart-drawer-upsell__title">Great Gifts<br />Come Together</h3>
                        {renderSuggestions('side')}
                    </aside>
                )}

                {/* ---------- RIGHT: the cart ---------- */}
                <aside
                    aria-label="Shopping cart"
                    aria-hidden={!isOpen}
                    className="cart-drawer-panel"
                    data-open={isOpen ? 'true' : 'false'}
                >
                    <div className="cart-drawer-header">
                        <h2 className="cart-drawer-title">Your cart ({count})</h2>
                        <button
                            type="button"
                            ref={closeBtnRef}
                            onClick={onClose}
                            aria-label="Close cart"
                            tabIndex={tab}
                            className="cart-drawer-close"
                        >
                            <CloseIcon />
                        </button>
                    </div>

                    {showTimer && count > 0 && secs > 0 && (
                        <div className="cart-drawer-timer" role="timer">
                            Your products are reserved for <strong>{mm}:{ss}</strong> minutes!
                        </div>
                    )}

                    <div className="cart-drawer-body">
                        {items.length === 0 ? (
                            <div className="cart-drawer-empty">
                                <p className="cart-drawer-empty__text">Your Cart is Empty</p>
                                {renderLink(continueShoppingHref, 'Continue Shopping', {
                                    tabIndex: tab,
                                    onClick: onClose,
                                    className: 'cart-drawer-continue',
                                })}
                            </div>
                        ) : (
                            <>
                                {showGiftBar && (
                                    <div className="cd-gift">
                                        <p className="cd-gift__text">
                                            {nextTier
                                                ? <>You're {nextTier.at - count} from free gift</>
                                                : <>You unlocked all free gifts!</>}
                                        </p>
                                        <div className="cd-gift__track">
                                            <div className="cd-gift__bar">
                                                <div className="cd-gift__fill" style={{ width: `${progress}%` }} />
                                            </div>
                                            {GIFT_TIERS.map((t) => (
                                                <div
                                                    key={t.at}
                                                    className={`cd-gift__stop${count >= t.at ? ' is-done' : ''}`}
                                                    style={{ left: `${(t.at / maxTier) * 100}%` }}
                                                >
                                                    <span className="cd-gift__circle"><GiftIcon /></span>
                                                    <span className="cd-gift__label">{t.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <ul className="cart-drawer-list">
                                    {items.map((item) => (
                                        <li key={item.id} className="cart-drawer-item">
                                            <img src={item.image} alt="" className="cart-drawer-item__img" />

                                            <div className="cart-drawer-item__info">
                                                <p className="cart-drawer-item__name">{item.name}</p>

                                                <div className="cart-drawer-item__row">
                                                    <div className="cart-drawer-item__qty" role="group" aria-label={`Quantity for ${item.name}`}>
                                                        <button type="button" tabIndex={tab}
                                                            onClick={() => onQtyChange?.(item.id, Math.max(1, item.qty - 1))}
                                                            aria-label="Decrease quantity" className="cart-drawer-item__qty-btn">
                                                            <MinusIcon />
                                                        </button>
                                                        <span className="cart-drawer-item__qty-value">{item.qty}</span>
                                                        <button type="button" tabIndex={tab}
                                                            onClick={() => onQtyChange?.(item.id, item.qty + 1)}
                                                            aria-label="Increase quantity" className="cart-drawer-item__qty-btn">
                                                            <PlusIcon />
                                                        </button>
                                                    </div>

                                                    <div className="cart-drawer-item__price">
                                                        {item.originalPrice > item.price && (
                                                            <span className="cart-drawer-item__price-was">{format(item.originalPrice * item.qty)}</span>
                                                        )}
                                                        <span className="cart-drawer-item__price-now">{format(item.price * item.qty)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button type="button" tabIndex={tab}
                                                onClick={() => onRemove?.(item.id)}
                                                aria-label={`Remove ${item.name} from cart`}
                                                className="cart-drawer-item__remove">
                                                <TrashIcon />
                                            </button>
                                        </li>
                                    ))}
                                </ul>

                                {/* mobile only: swipeable suggestions */}
                                {suggestions.length > 0 && (
                                    <div className="cd-mobile-sug">
                                        <h3 className="cd-mobile-sug__title">Great gifts come together</h3>
                                        {renderSuggestions('strip')}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {items.length > 0 && (
                        <div className="cart-drawer-footer">
                            {onApplyDiscount && (
                                <form
                                    className="cd-discount"
                                    onSubmit={(e) => { e.preventDefault(); if (code.trim()) onApplyDiscount(code.trim()); }}
                                >
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="Discount code"
                                        aria-label="Discount code"
                                        tabIndex={tab}
                                        className="cd-discount__input"
                                    />
                                    <button type="submit" tabIndex={tab} className="cd-discount__btn">Apply</button>
                                </form>
                            )}

                            {renderLink(checkoutHref, (
                                <>
                                    <span>Checkout</span>
                                    <span>{format(subtotal)}</span>
                                </>
                            ), {
                                tabIndex: tab,
                                onClick: onCheckout,
                                className: 'cart-drawer-checkout',
                            })}

                            {PAYMENT_LOGOS.length > 0 && (
                                <div className="cd-pay">
                                    {PAYMENT_LOGOS.map((l) => (
                                        <img key={l.alt} src={l.src} alt={l.alt} className="cd-pay__img" />
                                    ))}
                                </div>
                            )}

                            {renderLink(continueShoppingHref, 'Continue Shopping', {
                                tabIndex: tab,
                                onClick: onClose,
                                className: 'cd-continue',
                            })}
                        </div>
                    )}
                </aside>
            </div>
        </div>,
        document.body
    );
}