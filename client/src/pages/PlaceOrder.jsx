import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL, CURRENCY, money, useStore } from "../StoreContext";
import "./PlaceOrder.css";

const DELIVERY_FEE = 2; // must match the backend's delivery charge (in the same currency as item.price)

const EMPTY_ADDRESS = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
};

/* A guest gets a stable random id saved in this browser, used as userId until real login exists.
   NOTE: if orderModel/userModel expect a Mongo ObjectId for userId, this string will not save —
   see the note above this file. */
function getGuestId() {
    try {
        let id = localStorage.getItem("guestUserId");
        if (!id) {
            id = typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            localStorage.setItem("guestUserId", id);
        }
        return id;
    } catch {
        return `guest-${Date.now()}`;
    }
}

export default function PlaceOrder() {
    const { cartItems, cartTotal, clearCart } = useStore();
    const navigate = useNavigate();
    const [address, setAddress] = useState(EMPTY_ADDRESS);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const deliveryFee = cartItems.length ? DELIVERY_FEE : 0;
    const total = cartTotal + deliveryFee;

    const items = useMemo(
        () =>
            cartItems.map(({ product, qty }) => ({
                name: product.name,
                price: product.price,
                quantity: qty,
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

    if (cartItems.length === 0) {
        return (
            <div className="po">
                <div className="po-empty">
                    <p>Your cart is empty.</p>
                    <button className="po-link" onClick={() => navigate("/")}>Continue shopping</button>
                </div>
            </div>
        );
    }

    return (
        <div className="po">
            <form className="po-form" onSubmit={onSubmit}>
                <h2 className="po-heading">Delivery Information</h2>

                <div className="po-row">
                    <input required name="firstName" placeholder="First name" value={address.firstName} onChange={onChange} />
                    <input required name="lastName" placeholder="Last name" value={address.lastName} onChange={onChange} />
                </div>
                <input required type="email" name="email" placeholder="Email address" value={address.email} onChange={onChange} />
                <input required type="tel" name="phone" placeholder="Phone" value={address.phone} onChange={onChange} />
                <input required name="street" placeholder="Street address" value={address.street} onChange={onChange} />
                <div className="po-row">
                    <input required name="city" placeholder="City" value={address.city} onChange={onChange} />
                    <input required name="state" placeholder="State / Province" value={address.state} onChange={onChange} />
                </div>
                <div className="po-row">
                    <input required name="zipcode" placeholder="Zip code" value={address.zipcode} onChange={onChange} />
                    <input required name="country" placeholder="Country" value={address.country} onChange={onChange} />
                </div>

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
                <div className="po-line">
                    <span>Delivery Fee</span>
                    <span>{money(deliveryFee)}</span>
                </div>
                <div className="po-line po-total">
                    <span>Total</span>
                    <span>{money(total)}</span>
                </div>
            </aside>
        </div>
    );
}