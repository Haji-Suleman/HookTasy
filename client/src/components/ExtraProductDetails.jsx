import "./ExtraProductDetails.css";
import reviewsImg from "../assets/Products/reviews.webp";
import qualitiesImg from "../assets/Products/zootsy-diversities.webp";

import judge_logo from "../assets/AboutUS/005_logo-judgeme-2025-rebranding.svg";
import diamond from "../assets/AboutUS/006_diamond.svg";
import silver from "../assets/AboutUS/007_silver.svg";
import top5 from "../assets/AboutUS/009_5-percent.svg";
import top10 from "../assets/AboutUS/010_10-percent.svg";

/* Only turn this on when the badges and review count below are really yours
   (a real Judge.me account, real awards, real number of reviews). */
const SHOW_TRUST_BADGES = false;

const BADGES = [
    { src: diamond, alt: "Verified Reviews" },
    { src: silver, alt: "Silver Transparency" },
    { src: top5, alt: "Top 5 Stores" },
    { src: top10, alt: "Top 10% Trending" },
];

export default function ExtraProductDetails({
    title = "Crochet with Confidence!",
    subtitle = "At Zootsy, our high-quality crochet patterns help you make beautiful projects with ease. Find your next project with us!",
    reviewCount = 0, // pass your real number, only shown with SHOW_TRUST_BADGES
}) {
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
                        width="900"
                        height="600"
                        loading="lazy"
                        decoding="async"
                    />
                    <img
                        className="extra-details__img"
                        src={qualitiesImg}
                        alt="Zootsy crochet patterns compared with other patterns"
                        width="900"
                        height="600"
                        loading="lazy"
                        decoding="async"
                    />
                </div>
            </section>

            {SHOW_TRUST_BADGES && (
                <section className="about-us-reviews">
                    <div className="reviews-left">
                        <div className="stars" aria-label="5 out of 5 stars">★★★★★</div>
                        {reviewCount > 0 && <span className="review-count">{reviewCount} reviews</span>}
                        <div className="judge-me-logo">
                            <span>Verified by</span>
                            <img src={judge_logo} alt="Judge.me" width="100" height="24" loading="lazy" decoding="async" />
                        </div>
                    </div>

                    <div className="reviews-right">
                        {BADGES.map((b) => (
                            <img
                                key={b.alt}
                                src={b.src}
                                alt={b.alt}
                                className="trust-badge"
                                width="80"
                                height="80"
                                loading="lazy"
                                decoding="async"
                            />
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}