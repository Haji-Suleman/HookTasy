import { useState, useRef, useEffect } from 'react';
import './PromoBar.css';

/* =====================================================================
   ICONS (local to PromoBar)
   ===================================================================== */
const Svg = ({ className = 'icon-md', children }) => (
    <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        {children}
    </svg>
);

const ChevronLeft = ({ className }) => <Svg className={className}><path d="M15 5l-7 7 7 7" /></Svg>;
const ChevronRight = ({ className }) => <Svg className={className}><path d="M9 5l7 7-7 7" /></Svg>;
const CloseIcon = ({ className }) => <Svg className={className}><path d="M5 5l14 14M19 5L5 19" /></Svg>;

/* Reusable promo arrow — renders as <button> or a static <span> */
function PromoArrow({ direction, onClick }) {
    const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
    const base = 'promo-bar__nav-btn';
    if (!onClick) {
        return (
            <span aria-hidden="true" className={`${base} ${base}--static`}>
                <Icon className="icon-promo" />
            </span>
        );
    }
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={direction === 'left' ? 'Previous announcement' : 'Next announcement'}
            className={base}
        >
            <Icon className="icon-promo" />
        </button>
    );
}

/* =====================================================================
   PROMO BAR — top green announcement strip
   ===================================================================== */
const DEFAULT_ANNOUNCEMENTS = ['Pick 3 & Get 1 Small', 'Pick 5 & Get 2 Large'];

export default function PromoBar({ announcements = DEFAULT_ANNOUNCEMENTS }) {
    const [visible, setVisible] = useState(true);
    const [index, setIndex] = useState(0);
    const intervalRef = useRef(null);

    const total = announcements.length;
    const canCycle = total > 1;

    const goPrev = () => setIndex((i) => (i - 1 + total) % total);
    const goNext = () => setIndex((i) => (i + 1) % total);

    /* Auto-cycle every 4 seconds */
    useEffect(() => {
        if (!canCycle || !visible) return undefined;
        intervalRef.current = setInterval(goNext, 4000);
        return () => clearInterval(intervalRef.current);
    }, [canCycle, visible, total]);

    if (!visible) return null;

    /* Each slide's horizontal offset relative to the active one, normalized
       to the shortest wrap-around distance so the track never has to travel
       "the long way round". */
    const getDelta = (i) => {
        let d = ((i - index) % total + total) % total;
        if (d > total / 2) d -= total;
        return d;
    };

    return (
        <div role="region" aria-label="Promotions" className="promo-bar">
            <div className="promo-bar__inner">
                <PromoArrow direction="left" onClick={canCycle ? goPrev : undefined} />

                {/* Sliding stack — new slide enters from the left, old slide exits
            to the right (left-to-right swipe). */}
                <div className="promo-viewport">
                    {announcements.map((text, i) => {
                        const delta = getDelta(i);
                        return (
                            <p
                                key={text}
                                className="promo-text"
                                style={{ transform: `translateX(${-delta * 100}%)` }}
                                data-active={delta === 0 ? 'true' : 'false'}
                                aria-live={delta === 0 ? 'polite' : 'off'}
                                aria-hidden={delta !== 0}
                            >
                                {text}
                            </p>
                        );
                    })}
                </div>

                <PromoArrow direction="right" onClick={canCycle ? goNext : undefined} />
            </div>

            <button
                type="button"
                onClick={() => setVisible(false)}
                aria-label="Close announcement bar"
                className="promo-bar__close-btn"
            >
                <CloseIcon className="icon-close-promo" />
            </button>
        </div>
    );
}