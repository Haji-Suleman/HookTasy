import { createPortal } from 'react-dom';
import './FloatingButtons.css';
import bag from "../assets/Navbar/svgexport-1.svg"
import cart from "../assets/Navbar/svgexport-20.svg"
export default function FloatingButtons({
    cartCount = 0,
    onCartClick,
    onChatClick,
}) {
    return createPortal(
        <div className="floating-actions">
            <button
                type="button"
                onClick={onChatClick}
                aria-label="Chat with us"
                className="floating-btn floating-btn--chat"
            >
                <img src={cart} alt="" />
            </button>

            <button
                type="button"
                onClick={onCartClick}
                aria-label={`Cart, ${cartCount} items`}
                className="floating-btn floating-btn--cart"
            >
                <img src={bag} alt="" />
                <span aria-hidden="true" className="floating-btn__badge">
                    {cartCount > 99 ? '99+' : cartCount}
                </span>
            </button>
        </div>,
        document.body
    );
}