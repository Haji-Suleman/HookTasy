import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL, CURRENCY, money, useStore } from "../StoreContext";
import "./PlaceOrder.css";


const EMPTY_ADDRESS = { email: "" };

/* A guest gets a stable random id saved in this browser, used as userId until real login exists.
   Must be a valid Mongo ObjectId (24 hex characters, no dashes) or the backend's
   `orderModel.save()` / `userModel.findByIdAndUpdate()` will throw a CastError. */
function getGuestId() {
    try {
        let id = localStorage.getItem("guestUserId");
        if (!id || !/^[0-9a-f]{24}$/i.test(id)) {
            const bytes = new Uint8Array(12);
            if (typeof crypto !== "undefined" && crypto.getRandomValues) {
                crypto.getRandomValues(bytes);
            } else {
                for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
            }
            id = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
            localStorage.setItem("guestUserId", id);
        }
        return id;
    } catch {
        // last-resort fallback, still 24 hex chars
        return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    }
}

export default function PlaceOrder() {
    const { cartItems, cartTotal, clearCart } = useStore();
    const navigate = useNavigate();
    const [address, setAddress] = useState(EMPTY_ADDRESS);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const total = cartTotal;

    const items = useMemo(
        () =>
            cartItems.map(({ id, product, qty }) => ({
                _id: product._id || id,
                productId: product._id || id,
                name: product.name,
                price: Number(product.price),
                quantity: Number(qty),
                pdfLink: product.pdfLink || "",
            })),
        [cartItems]
    );

    const onChange = (e) => {
        const { name, value } = e.target;
        setAddress((a) => ({ ...a, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (cartItems.length === 0) {
            setError("Your cart is empty.");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            const res = await fetch(`${API_URL}/api/order/place`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: getGuestId(),
                    items,
                    amount: total,
                    address,
                }),
            });
            let data;
            try {
                data = await res.json();
            } catch {
                throw new Error("The server did not return a valid response.");
            }
            if (!res.ok || !data.success || !data.session_url) {
                throw new Error(data?.message || `The server answered with status ${res.status}.`);
            }
            clearCart();
            window.location.href = data.session_url; // send the browser to Stripe Checkout
        } catch (err) {
            setError(err.message || "Something went wrong placing your order.");
            setSubmitting(false);
        }
    };



    return (
        <div className="po">
            <form className="po-form" onSubmit={onSubmit}>
                <h2 className="po-heading">Contact Information</h2>

                <input required type="email" name="email" placeholder="Email address" value={address.email} onChange={onChange} />

                {error && <p className="po-error">{error}</p>}

                <button type="submit" className="po-submit" disabled={submitting}>
                    {submitting ? "Redirecting to payment…" : "PROCEED TO PAYMENT"}
                </button>
            </form>

            <aside className="po-summary">
                <h2 className="po-heading">Order Summary</h2>
                <ul className="po-items">
                    {cartItems.map(({ id, product, qty }) => (
                        <li key={id} className="po-item">
                            <span className="po-item__name">{product.name} × {qty}</span>
                            <span className="po-item__price">{money(product.price * qty)}</span>
                        </li>
                    ))}
                </ul>
                <div className="po-line">
                    <span>Subtotal</span>
                    <span>{money(cartTotal)}</span>
                </div>

                <div className="po-line po-total">
                    <span>Total</span>
                    <span>{money(total)}</span>
                </div>
            </aside>
        </div>
    );
}