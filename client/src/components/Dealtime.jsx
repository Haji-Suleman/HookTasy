import React, { useEffect, useState } from "react";
import "./Dealtime.css";

// Set this to when your offer really ends (local time). After this moment the box hides itself.
const OFFER_ENDS_AT = "2026-10-31T23:59:59";

const pad = (n) => String(n).padStart(2, "0");

const DealTimer = ({
    endsAt = OFFER_ENDS_AT,
    heading = "Limited Time Offer!",
    text = "",
}) => {
    const end = new Date(endsAt).getTime();
    const [left, setLeft] = useState(() => end - Date.now());

    useEffect(() => {
        const tick = () => setLeft(end - Date.now());
        tick();
        const t = setInterval(tick, 1000);
        return () => clearInterval(t);
    }, [end]);

    if (!end || left <= 0) return null;

    const s = Math.floor(left / 1000);
    const units = [
        [Math.floor(s / 3600), "hours"],
        [Math.floor((s % 3600) / 60), "mins"],
        [s % 60, "secs"],
    ];

    return (
        <div className="deal-timer">
            <p className="deal-timer__heading">🔥 {heading} 🔥</p>
            {text && <p className="deal-timer__text">{text}</p>}

            <div className="deal-timer__clock" role="timer" aria-label="Offer countdown">
                {units.map(([n, label], i) => (
                    <React.Fragment key={label}>
                        {i > 0 && <span className="deal-timer__sep">:</span>}
                        <div className="deal-timer__unit">
                            <span className="deal-timer__num">{pad(n)}</span>
                            <span className="deal-timer__label">{label}</span>
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default DealTimer;