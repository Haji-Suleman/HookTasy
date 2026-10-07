import React from "react";
import "./Commment.css";

const StarIcon = ({ filled }) => (
    <svg
        className="review-star"
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

const VerifiedBadge = () => (
    <svg
        className="review-verified"
        viewBox="0 0 24 24"
        role="img"
        aria-label="Verified buyer"
    >
        <circle cx="12" cy="12" r="12" fill="currentColor" />
        <path
            d="M7 12.5l3.2 3.2L17 8.9"
            fill="none"
            stroke="#fff"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const Comment = ({ images, rating = 5, name, verified, comment, product }) => {
    const image = Array.isArray(images) ? images[0] : images;
    const stars = Math.round(Number(rating) || 0);

    return (
        <article className="review-card">
            {image && (
                <div className="review-card-image">
                    <img src={image} alt={product || "Customer review"} loading="lazy" />
                </div>
            )}

            <div className="review-card-body">
                <p className="review-card-text">{comment}</p>

                <div className="review-card-stars" aria-label={`${stars} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                        <StarIcon key={n} filled={n <= stars} />
                    ))}
                </div>

                <div className="review-card-name">
                    <span>{name}</span>
                    {verified && <VerifiedBadge />}
                </div>

                <div className="review-card-product">{product}</div>
            </div>
        </article>
    );
};

export default Comment;