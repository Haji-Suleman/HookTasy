import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { API_URL } from "../StoreContext";
import "./Verify.css";

/* Yarn-ball loader: the ball spins while a stitched thread runs off it. */
function YarnLoader() {
    return (
        <div className="vf-loader" aria-hidden="true">
            <svg viewBox="0 0 180 130" className="vf-loader__svg">
                <defs>
                    <clipPath id="vf-ball-clip">
                        <circle cx="80" cy="58" r="34" />
                    </clipPath>
                    <radialGradient id="vf-ball-shade" cx="35%" cy="30%" r="80%">
                        <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
                        <stop offset="55%" stopColor="#fff" stopOpacity="0" />
                        <stop offset="100%" stopColor="#5a1030" stopOpacity="0.28" />
                    </radialGradient>
                </defs>

                <ellipse className="vf-loader__shadow" cx="80" cy="110" rx="30" ry="5" />

                {/* thread running off the ball */}
                <path className="vf-loader__thread-base" d="M106 76 C138 78, 128 106, 168 108" />
                <path className="vf-loader__thread" d="M106 76 C138 78, 128 106, 168 108" />

                <g className="vf-loader__bob">
                    <circle className="vf-loader__ball" cx="80" cy="58" r="34" />
                    <g clipPath="url(#vf-ball-clip)">
                        <g className="vf-loader__spin">
                            <path className="vf-loader__line" d="M40 50 C60 30, 100 30, 120 50" />
                            <path className="vf-loader__line vf-loader__line--dark" d="M40 66 C60 46, 100 46, 120 66" />
                            <path className="vf-loader__line" d="M44 82 C62 62, 100 62, 116 82" />
                            <path className="vf-loader__line vf-loader__line--dark" d="M58 26 C48 50, 52 70, 66 92" />
                            <path className="vf-loader__line" d="M88 24 C78 48, 82 70, 96 94" />
                            <path className="vf-loader__line vf-loader__line--dark" d="M112 30 C104 52, 108 72, 118 90" />
                        </g>
                    </g>
                    <circle cx="80" cy="58" r="34" fill="url(#vf-ball-shade)" />
                </g>
            </svg>
        </div>
    );
}

export default function Verify() {
    const [params] = useSearchParams();
    const success = params.get("success");
    const orderId = params.get("orderId");
    const sessionId = params.get("session_id");

    // "loading" | "paid" | "cancelled" | "failed"
    const [status, setStatus] = useState(success === "false" ? "cancelled" : "loading");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const ran = useRef(false); // stops React StrictMode from verifying twice in dev

    useEffect(() => {
        if (ran.current || success === "false") return;
        ran.current = true;

        if (success !== "true" || !orderId || !sessionId) {
            setStatus("failed");
            setMessage("This payment link is incomplete.");
            return;
        }

        (async () => {
            try {
                const res = await fetch(`${API_URL}/api/order/verify`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderId, sessionId }),
                });
                const data = await res.json();
                if (data.success) {
                    setEmail(data.email || "");
                    setStatus("paid");
                } else {
                    setMessage(data.message || "We could not confirm your payment.");
                    setStatus("failed");
                }
            } catch {
                setMessage("We could not reach the server. Please check your connection and refresh this page.");
                setStatus("failed");
            }
        })();
    }, [success, orderId, sessionId]);

    return (
        <div className="vf">
            <div className="vf-card" role="status" aria-live="polite">
                {status === "loading" && (
                    <>
                        <YarnLoader />
                        <h1 className="vf-title">Confirming your payment</h1>
                        <p className="vf-text">This only takes a moment. Please don't close this page.</p>
                    </>
                )}

                {status === "paid" && (
                    <>
                        <div className="vf-icon vf-icon--ok" aria-hidden="true">
                            <svg viewBox="0 0 52 52">
                                <path d="M14 27l8 8 16-17" />
                            </svg>
                        </div>
                        <h1 className="vf-title">Payment received</h1>
                        <p className="vf-text">
                            Thank you for your order.
                            {email && <> Your confirmation is on its way to <strong>{email}</strong>.</>}
                        </p>
                        {orderId && <p className="vf-ref">Order reference: {orderId.slice(-8)}</p>}
                        <Link to="/" className="vf-btn">Continue shopping</Link>
                    </>
                )}

                {status === "cancelled" && (
                    <>
                        <div className="vf-icon vf-icon--warn" aria-hidden="true">
                            <svg viewBox="0 0 52 52">
                                <path d="M26 15v14M26 36v1" />
                            </svg>
                        </div>
                        <h1 className="vf-title">Payment cancelled</h1>
                        <p className="vf-text">You have not been charged. Your items are ready whenever you want to try again.</p>
                        <Link to="/order" className="vf-btn">Return to checkout</Link>
                        <Link to="/" className="vf-link">Back to the shop</Link>
                    </>
                )}

                {status === "failed" && (
                    <>
                        <div className="vf-icon vf-icon--err" aria-hidden="true">
                            <svg viewBox="0 0 52 52">
                                <path d="M17 17l18 18M35 17L17 35" />
                            </svg>
                        </div>
                        <h1 className="vf-title">We couldn't confirm your payment</h1>
                        <p className="vf-text">{message}</p>
                        <p className="vf-text vf-text--small">
                            If money was taken from your account, contact us with the reference below and we'll sort it out.
                        </p>
                        {orderId && <p className="vf-ref">Order reference: {orderId.slice(-8)}</p>}
                        <Link to="/" className="vf-btn">Back to the shop</Link>
                    </>
                )}
            </div>
        </div>
    );
}