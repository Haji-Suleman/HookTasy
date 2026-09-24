import React from "react";
import CommentData from "./CommentData";
import Footer from "./Footer";
import Navbar from "../components/Navbar";
const ReviewsWholePage = () => {
    return (
        <>
            <Navbar />
            <div className="reviews-page">
                {/* Top Link */}
                <div className="reviews-top-link-wrapper">
                    <a href="/shop" className="reviews-top-link">
                        Shop All Patterns
                    </a>
                </div>

                {/* Header Section */}
                <div className="reviews-header">
                    <h1>Happy customers</h1>
                    <p>Discover why crochet lovers are all smiles—read their reviews and stories about their projects from Hooktasy's patterns!</p>
                    <div className="reviews-rating-summary">
                        <span className="reviews-stars">★★★★★</span>
                        <span className="reviews-score">4.86 ★ (1,593)</span>
                    </div>
                </div>

                {/* The Carousel Component */}
                <CommentData />
            </div>
            <Footer />
        </>
    );
};

export default ReviewsWholePage;