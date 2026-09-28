import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './Cartdrawer.css';

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
}) {
    const closeBtnRef = useRef(null);

    const count = items.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const format = (n) =>
        `${currency}${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

    /* Plain render helper (not a component) so links aren't remounted on every render */
    const renderLink = (to, children, props) => (
        <LinkComp {...props} {...{ [linkProp]: to }}>{children}</LinkComp>
    );

    return createPortal(
        <div className={`cart-drawer-root${isOpen ? ' cart-drawer-root--open' : ''}`}>
            <div className="cart-drawer-overlay" onClick={onClose} />

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
                        tabIndex={isOpen ? 0 : -1}
                        className="cart-drawer-close"
                    >
                        <CloseIcon />
                    </button>
                </div>

                <div className="cart-drawer-body">
                    {items.length === 0 ? (
                        <div className="cart-drawer-empty">
                            <p className="cart-drawer-empty__text">Your Cart is Empty</p>
                            {renderLink(continueShoppingHref, 'Continue Shopping', {
                                tabIndex: isOpen ? 0 : -1,
                                onClick: onClose,
                                className: 'cart-drawer-continue',
                            })}
                        </div>
                    ) : (
                        <ul className="cart-drawer-list">
                            {items.map((item) => (
                                <li key={item.id} className="cart-drawer-item">
                                    <img src={item.image} alt="" className="cart-drawer-item__img" />

                                    <div className="cart-drawer-item__info">
                                        <p className="cart-drawer-item__name">{item.name}</p>

                                        <div className="cart-drawer-item__price">
                                            <span className="cart-drawer-item__price-now">{format(item.price)}</span>
                                            {item.originalPrice && item.originalPrice > item.price && (
                                                <span className="cart-drawer-item__price-was">{format(item.originalPrice)}</span>
                                            )}
                                        </div>

                                        <div className="cart-drawer-item__qty" role="group" aria-label={`Quantity for ${item.name}`}>
                                            <button type="button" tabIndex={isOpen ? 0 : -1}
                                                onClick={() => onQtyChange?.(item.id, Math.max(1, item.qty - 1))}
                                                aria-label="Decrease quantity" className="cart-drawer-item__qty-btn">
                                                <MinusIcon />
                                            </button>
                                            <span className="cart-drawer-item__qty-value">{item.qty}</span>
                                            <button type="button" tabIndex={isOpen ? 0 : -1}
                                                onClick={() => onQtyChange?.(item.id, item.qty + 1)}
                                                aria-label="Increase quantity" className="cart-drawer-item__qty-btn">
                                                <PlusIcon />
                                            </button>
                                        </div>
                                    </div>

                                    <button type="button" tabIndex={isOpen ? 0 : -1}
                                        onClick={() => onRemove?.(item.id)}
                                        aria-label={`Remove ${item.name} from cart`}
                                        className="cart-drawer-item__remove">
                                        <CloseIcon className="icon-sm" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="cart-drawer-footer">
                        <div className="cart-drawer-subtotal">
                            <span>Subtotal</span>
                            <span className="cart-drawer-subtotal__value">{format(subtotal)}</span>
                        </div>
                        {renderLink(checkoutHref, 'Checkout', {
                            tabIndex: isOpen ? 0 : -1,
                            onClick: onCheckout,
                            className: 'cart-drawer-checkout',
                        })}
                    </div>
                )}
            </aside>
        </div>,
        document.body
    );
}