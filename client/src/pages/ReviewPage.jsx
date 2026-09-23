import React from "react";
import "./ReviewPage.css";
import CommentData from "./CommentData";
const ReviewsPage = () => {
    return (
        <div className="reviews-page">
            {/* Top Link */}
            <div className="reviews-top-link-wrapper">
                <a href="/shop" className="reviews-top-link">
                    Shop All Patterns
                </a>
            </div>

            {/* Header Section */}
            <div className="reviews-header">
                <h1>Our happy customers are saying</h1>
                <div className="reviews-rating-summary">
                    <span className="reviews-stars">★★★★★</span>
                    <span className="reviews-score">4.86 ★ (1,593)</span>
                </div>
            </div>

            {/* The Carousel Component */}
            <CommentData />
        </div>
    );
};

export default ReviewsPage;