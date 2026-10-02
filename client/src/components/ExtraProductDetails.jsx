import React from "react";
import "./ExtraProductDetails.css";
import reviewsImg from "../assets/Products/reviews.png";

import judge_logo from "../assets/AboutUS/005_logo-judgeme-2025-rebranding.svg";
import diamond from "../assets/AboutUS/006_diamond.svg";
import silver from "../assets/AboutUS/007_silver.svg";
import top5 from "../assets/AboutUS/009_5-percent.svg";
import top10 from "../assets/AboutUS/010_10-percent.svg";
import qualitiesImg from "../assets/Products/zootsy-diversities.png"
const ExtraProductDetails = ({
    title = "Crochet with Confidence!",
    subtitle = "At Zootsy, our high-quality crochet patterns help you make beautiful projects with ease. Find your next project with us!",
}) => {
    return (
        <>
            <section className="extra-details">
                <h2 className="extra-details__title">{title}</h2>
                <p className="extra-details__subtitle">{subtitle}</p>

                <div className="extra-details__grid">
                    <img
                        className="extra-details__img"
                        src={reviewsImg}
                        alt="Crochet projects made by Zootsy customers"
                        loading="lazy"
                    />
                    <img
                        className="extra-details__img"
                        src={qualitiesImg}
                        alt="Zootsy crochet patterns compared with other patterns"
                        loading="lazy"
                    />
                </div>

            </section>
            <section className="about-us-reviews" >
                <div className="reviews-left">
                    <div className="stars">
                        ★★★★★
                    </div>
                    <span className="review-count">1111 reviews</span>
                    <div className="judge-me-logo">
                        <span>Verified by</span>
                        <img src={judge_logo} alt="Judge.me" />
                    </div>
                </div>

                <div className="reviews-right">
                    <img src={diamond} alt="Verified Reviews" className="trust-badge" />
                    <img src={silver} alt="Silver Transparency" className="trust-badge" />
                    <img src={top5} alt="Top 5 Stores" className="trust-badge" />
                    <img src={top10} alt="Top 10% Trending" className="trust-badge" />
                </div>
            </section>
        </>
    );
};

export default ExtraProductDetails;