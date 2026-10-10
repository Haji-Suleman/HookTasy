import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "./AboutUsPG.css";
import aboutHero from "../assets/AboutUS/about-hero.webp";
import aboutFeature from "../assets/AboutUS/second.webp";
import icon1 from "../assets/AboutUS/001_icon-1.webp";
import icon2 from "../assets/AboutUS/002_icon-2.webp";
import icon3 from "../assets/AboutUS/003_icon-3.webp";
import Footer from "./Footer";
import Navbar from "../components/Navbar";

/* static data lives outside the component */
const FEATURES = [
    {
        icon: icon1,
        title: "Unique Patterns",
        text: "Our patterns are clear, easy-to-follow, making them perfect for crocheters of all skill levels.",
    },
    {
        icon: icon2,
        title: "Quality Guarantee",
        text: "We use high-quality graphics and clear instructions to ensure happy crocheting time.",
    },
    {
        icon: icon3,
        title: "Customer Support",
        text: "We provide fast and friendly support, ensuring an enjoyable shopping experience.",
    },
];

export default function AboutUs() {
    return (
        <>
            <Helmet>
                <title>About Us | Zootsy Shop</title>
                <meta
                    name="description"
                    content="Learn about Zootsy Shop and the crochet patterns we design for crochet lovers."
                />
                <link rel="canonical" href="https://zootsyshop.com/about" />
            </Helmet>

            <Navbar />

            <div className="about-us-page">
                {/* Breadcrumbs */}
                <div className="about-breadcrumbs-container">
                    <nav className="about-breadcrumbs" aria-label="Breadcrumb">
                        <Link to="/" className="breadcrumb-link">Home</Link>
                        <span className="breadcrumb-separator" aria-hidden="true">›</span>
                        <span className="breadcrumb-current" aria-current="page">About us</span>
                    </nav>
                </div>

                {/* Hero image: first thing on the page, so load it first */}
                <div className="about-hero-wrapper">
                    <img
                        src={aboutHero}
                        alt="Person crocheting"
                        className="about-hero-image"
                        width="1600"
                        height="700"
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                    />
                </div>

                {/* Intro Section */}
                <section className="about-intro">
                    <h1 className="about-intro-title">Your title here</h1>
                    <div className="about-intro-text">
                        <p>
                            We <strong>design and create a variety of crochet patterns</strong>, including adorable
                            amigurumi and charming home decor pieces.
                        </p>
                        <p>
                            At Zootsy, we cherish our customers and strive to build lasting relationships rooted in
                            trust and satisfaction. We are dedicated to providing <strong>high-quality crochet patterns</strong> and{" "}
                            <strong>exceptional customer service</strong> that surpasses your expectations.
                        </p>
                    </div>
                </section>

                {/* Features Section */}
                <section className="about-features">
                    <div className="about-features-image">
                        <img
                            src={aboutFeature}
                            alt="Crochet animals collection"
                            width="900"
                            height="900"
                            loading="lazy"
                            decoding="async"
                        />
                    </div>

                    <div className="about-features-content">
                        <h2 className="about-features-title">Why you'll love us</h2>

                        {FEATURES.map((f) => (
                            <div className="feature-item" key={f.title}>
                                <div className="feature-icon">
                                    <img
                                        src={f.icon}
                                        alt=""
                                        width="48"
                                        height="48"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </div>
                                <div className="feature-text">
                                    <h3>{f.title}</h3>
                                    <p>{f.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <Footer />
        </>
    );
}