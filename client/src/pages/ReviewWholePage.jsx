import React from "react";
import "./ReviewWholePage.css"
import CommentData from "./CommentData";
import Footer from "./Footer";
import Navbar from "../components/Navbar";

const STARS = [0, 1, 2, 3, 4];

const ReviewsWholePage = () => {
    return (
        <>
            <Navbar />
            <div className="reviews-page">
                {/* floating colour blobs (decoration only) */}
                <span className="reviews-blob reviews-blob-1" aria-hidden="true" />
                <span className="reviews-blob reviews-blob-2" aria-hidden="true" />

                {/* Top Link */}
                <div className="reviews-top-link-wrapper">
                    <a href="/shop" className="reviews-top-link">
                        Shop All Patterns
                    </a>
                </div>

                {/* Header Section */}
                <div className="reviews-header">
                    <h1>Happy <span className="reviews-title-accent">customers</span></h1>
                    <span className="reviews-divider" aria-hidden="true" />
                    <p>Discover why crochet lovers are all smiles—read their reviews and stories about their projects from Hooktasy's patterns!</p>
                    <div className="reviews-rating-summary">
                        <span className="reviews-stars" aria-label="5 out of 5 stars">
                            {STARS.map((i) => (
                                <span key={i} className="reviews-star" style={{ "--i": i }} aria-hidden="true">★</span>
                            ))}
                        </span>
                        <span className="reviews-score">4.86 ★ (1,593)</span>
                    </div>
                </div>

                {/* The Carousel Component */}
                <div className="reviews-carousel-wrap">
                    <CommentData />
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ReviewsWholePage;