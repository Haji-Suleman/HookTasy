import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./CommentModal.css";

const getSrc = (img) => (typeof img === "string" ? img : img?.url || img?.src || "");

const Star = ({ filled }) => (
    <svg
        className="cm-star"
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
    >
        <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8L12 2.5z" />
    </svg>
);

const CommentModal = ({ isOpen, onClose, commentData }) => {
    const [index, setIndex] = useState(0);
    const touchStartX = useRef(null);

    const images = (
        Array.isArray(commentData?.images)
            ? commentData.images
            : commentData?.images
                ? [commentData.images]
                : []
    )
        .map(getSrc)
        .filter(Boolean);
    const total = images.length;

    const prev = () => setIndex((i) => (i - 1 + total) % total);
    const next = () => setIndex((i) => (i + 1) % total);

    // Start from the first image whenever a different review opens
    useEffect(() => {
        setIndex(0);
    }, [commentData?.id, isOpen]);

    // Lock page scroll + keyboard controls while open
    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const onKey = (e) => {
            if (e.key === "Escape") onClose();
            if (total > 1 && e.key === "ArrowLeft") prev();
            if (total > 1 && e.key === "ArrowRight") next();
        };
        window.addEventListener("keydown", onKey);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKey);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, total]);

    if (!isOpen || !commentData) return null;

    const { rating = 5, name = "", date, comment, product, productUrl } = commentData;
    const stars = Math.round(Number(rating) || 0);

    const onTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const onTouchEnd = (e) => {
        if (touchStartX.current === null || total < 2) return;
        const diff = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(diff) > 50) (diff > 0 ? prev : next)();
        touchStartX.current = null;
    };

    return createPortal(
        <div className="cm-overlay" onClick={onClose}>
            <div
                className="cm-modal"
                role="dialog"
                aria-modal="true"
                aria-label={`Review by ${name}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button className="cm-close" onClick={onClose} aria-label="Close review">
                    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                        <path
                            d="M5 5l14 14M19 5L5 19"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            fill="none"
                        />
                    </svg>
                </button>

                {total > 0 && (
                    <div className="cm-media">
                        <div
                            className="cm-stage"
                            onTouchStart={onTouchStart}
                            onTouchEnd={onTouchEnd}
                        >
                            {/* contain = the whole photo always fits, never cropped */}
                            <img
                                key={images[index]}
                                className="cm-stage-img"
                                src={images[index]}
                                alt={product || `Review by ${name}`}
                            />

                            {total > 1 && (
                                <>
                                    <button
                                        className="cm-nav cm-nav-left"
                                        onClick={prev}
                                        aria-label="Previous photo"
                                    >
                                        ‹
                                    </button>
                                    <button
                                        className="cm-nav cm-nav-right"
                                        onClick={next}
                                        aria-label="Next photo"
                                    >
                                        ›
                                    </button>
                                </>
                            )}
                        </div>

                        {total > 1 && (
                            <div className="cm-thumbs">
                                {images.map((src, i) => (
                                    <button
                                        key={src + i}
                                        className={`cm-thumb ${i === index ? "is-active" : ""}`}
                                        onClick={() => setIndex(i)}
                                        aria-label={`Show photo ${i + 1}`}
                                    >
                                        <img src={src} alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="cm-body">
                    <div className="cm-stars" aria-label={`${stars} out of 5 stars`}>
                        {[1, 2, 3, 4, 5].map((n) => (
                            <Star key={n} filled={n <= stars} />
                        ))}
                    </div>

                    <div className="cm-author">
                        <div className="cm-avatar" aria-hidden="true">
                            {name.trim().charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="cm-name">{name}</div>
                            {date && <div className="cm-date">{date}</div>}
                        </div>
                    </div>

                    <p className="cm-text">{comment}</p>

                    {product && (
                        <div className="cm-product">
                            {productUrl ? (
                                <a href={productUrl}>{product}</a>
                            ) : (
                                <span>{product}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CommentModal;