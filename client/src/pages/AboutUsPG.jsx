import React from 'react';
import './AboutUsPG.css';
// Adjust the file extensions to match your actual assets
import aboutHero from '../assets/AboutUS/about-hero.png';
import aboutFeature from '../assets/AboutUS/second.png';
import Footer from './Footer';
import icon1 from "../assets/AboutUS/001_icon-1.png"
import icon2 from "../assets/AboutUS/002_icon-2.png"
import icon3 from "../assets/AboutUS/003_icon-3.png"
import Navbar from '../components/Navbar';

const AboutUs = () => {
    return (
        <>
            <Navbar />
            <div className="about-us-page">
                {/* Breadcrumbs */}
                <div className="about-breadcrumbs-container">
                    <nav className="about-breadcrumbs" aria-label="Breadcrumb">
                        <a href="/" className="breadcrumb-link">Home</a>
                        <span className="breadcrumb-separator">›</span>
                        <span className="breadcrumb-current">About us</span>
                    </nav>
                </div>

                {/* Hero Image */}
                <div className="about-hero-wrapper">
                    <img
                        src={aboutHero}
                        alt="Person crocheting"
                        className="about-hero-image"
                    />
                </div>

                {/* Intro Section */}
                <section className="about-intro">
                    <h1 className="about-intro-title">Proudly Vietnamese handmade business</h1>
                    <div className="about-intro-text">
                        <p>
                            We <strong>design and create a variety of crochet patterns</strong>, including adorable amigurumi and charming home decor pieces, inspired by the rich culture and artistry of Vietnam.
                        </p>
                        <p>
                            At Hooktasy, we cherish our customers and strive to build lasting relationships rooted in trust and satisfaction. We are dedicated to providing <strong>high-quality crochet patterns</strong> and <strong>exceptional customer service</strong> that surpasses your expectations.
                        </p>
                    </div>
                </section>

                {/* Features Section */}
                <section className="about-features">
                    <div className="about-features-image">
                        <img src={aboutFeature} alt="Crochet animals collection" />
                    </div>

                    <div className="about-features-content">
                        <h2 className="about-features-title">Why you'll love us</h2>

                        <div className="feature-item">
                            <div className="feature-icon">
                                <img src={icon1} alt="" />

                            </div>
                            <div className="feature-text">
                                <h3>Unique Patterns</h3>
                                <p>Our patterns are clear, easy - to - follow, making them perfect for crocheters of all skill levels.</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">
                                <img src={icon2} alt="" />
                            </div>
                            <div className="feature-text">
                                <h3>Quality Guarantee</h3>
                                <p>We use high-quality graphics and clear instructions to ensure happy crocheting time.</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">
                                {/* Customer Support Icon */}
                                <img src={icon3} alt="" />
                            </div>
                            <div className="feature-text">
                                <h3>Customer Support</h3>
                                <p>We provide fast and friendly support, ensuring an enjoyable shopping experience.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />

        </>
    );
};

export default AboutUs;