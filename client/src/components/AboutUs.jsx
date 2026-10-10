import { Link } from "react-router-dom";
import "./AboutUs.css";
import aboutP from "../assets/p.webp";
import Downloadable from "../assets/AboutUS/001_bx-arrow-to-bottom.svg";
import Quality_Guarantee from "../assets/AboutUS/002_bx-check-shield.svg";
import OS from "../assets/AboutUS/003_bx-headphone.svg";
import SP from "../assets/AboutUS/004_bx-credit-card.svg";
import judge_logo from "../assets/AboutUS/005_logo-judgeme-2025-rebranding.svg";
import diamond from "../assets/AboutUS/006_diamond.svg";
import silver from "../assets/AboutUS/007_silver.svg";
import top5 from "../assets/AboutUS/009_5-percent.svg";
import top10 from "../assets/AboutUS/010_10-percent.svg";

/* defined once, outside the component, so it is not rebuilt on every render */
const FEATURES = [
    { id: 1, icon: Downloadable, title: "Instant Delivery", description: "Downloadable instantly after purchase" },
    { id: 2, icon: Quality_Guarantee, title: "Quality Guarantee", description: "Crochet patterns are quality-tested" },
    { id: 3, icon: OS, title: "Online Support", description: "24 hours a day, 7 days a week" },
    { id: 4, icon: SP, title: "Secure Payment", description: "100% secure payment guaranteed" },
];

const BADGES = [
    { src: diamond, alt: "Verified Reviews" },
    { src: silver, alt: "Silver Transparency" },
    { src: top5, alt: "Top 5 Stores" },
    { src: top10, alt: "Top 10% Trending" },
];

export default function AboutUs() {
    return (
        <div className="about-us-page">
            {/* Top Link */}
            <div className="reviews-top-link-wrapper">
                <Link to="/shop" className="reviews-top-link">
                    Shop All Patterns
                </Link>
            </div>

            {/* TOP SECTION: Image & Text */}
            <section className="about-us-section">
                <div className="about-us-image-wrapper">
                    <img
                        src={aboutP}
                        alt="Hands crocheting with yellow yarn"
                        width="800"
                        height="800"
                        loading="lazy"
                        decoding="async"
                    />
                </div>

                <div className="about-us-text-wrapper">
                    <h2>Designed by crochet lover, for crochet lovers</h2>
                    <p>
                        At Zootsy, every pattern is thoughtfully crafted by passionate crochet enthusiasts,
                        just like you. We create designs that inspire joy in every stitch, made with love for
                        those who love to crochet.
                    </p>
                    <Link to="/about" className="about-us-link reviews-top-link">Read more</Link>
                </div>
            </section>

            {/* MIDDLE SECTION: Features */}
            <section className="about-us-features">
                {FEATURES.map((f) => (
                    <div key={f.id} className="feature-item">
                        <div className="feature-icon">
                            <img src={f.icon} alt="" width="40" height="40" loading="lazy" decoding="async" />
                        </div>
                        <div className="feature-text">
                            <h3>{f.title}</h3>
                            <p>{f.description}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* BOTTOM SECTION: Reviews & Badges */}
            <section className="about-us-reviews">
                <div className="reviews-left">
                    <div className="stars" aria-label="5 out of 5 stars">★★★★★</div>
                    <span className="review-count">1111 reviews</span>
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
        </div>
    );
}