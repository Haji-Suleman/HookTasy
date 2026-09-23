import React from "react";
import "./Commment.css";

const Comment = ({
    name,
    comment,
    rating,
    verified,
    product,
    images,
}) => {
    return (
        <div className="comment-card">

            <div className="comment-image-wrapper">
                <img
                    className="comment-card-image"
                    src={images?.[0]}
                    alt={`${name} review`}
                />
            </div>

            <div className="comment-card-content">

                <p className="comment-text">
                    {comment}
                </p>

                <div
                    className="comment-stars"
                    aria-label={`${rating} out of 5 stars`}
                >
                    {"★".repeat(rating)}
                </div>

                <div className="comment-customer">
                    <span>{name}</span>

                    {verified && (
                        <span className="comment-verified">
                            ✓
                        </span>
                    )}
                </div>

                <p className="comment-product">
                    {product}
                </p>

            </div>

        </div>
    );
};

export default Comment;