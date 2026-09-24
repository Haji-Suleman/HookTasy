import React from 'react';
import './Earn.css';
import heroEarn from "../assets/svgexport-1.svg"
import open from "../assets/sectionCardFirstTitle.svg"
import money from "../assets/sectionCardSecondTitle.svg"
import earnmoney from "../assets/sectionCardThirdTitle.svg"
import googlePlayBadge from "../assets/googleplay.svg"
import appStoreBadge from "../assets/appstore.svg"
import Navbar from '../components/Navbar';
const Earn = () => {
    return (
        <>
            <Navbar />
            <div className="affiliate-page">

                {/* Top Section (Header + Hero) with light grey background */}
                <div className="affiliate-top-bg">

                    {/* Header */}
                    <header className="aff-header">
                        <div className="aff-logo">HOOKTASY</div>
                        <button className="aff-login-btn">Login</button>
                    </header>

                    {/* Hero Section */}
                    <section className="aff-hero">
                        <div className="aff-hero-content">
                            <p className="aff-subtitle">Profit from our experience</p>
                            <h1 className="aff-title">Earn up to 30% commission for every successful referral</h1>
                            <button className="aff-join-btn">Join Now</button>
                        </div>

                        {/* PLACEHOLDER: Put your hero image/chart SVG here */}
                        <div className="aff-hero-image-placeholder">
                            <img src={heroEarn} alt="Affiliate Chart" />
                        </div>
                    </section>
                </div>

                <hr className="aff-divider" />

                {/* How It Works Section */}
                <section className="aff-how-it-works">
                    <h2 className="aff-section-title">How does it work ?</h2>

                    <div className="aff-cards-grid">

                        {/* Card 1: Join */}
                        <div className="aff-card">
                            <img className="aff-icon-placeholder" src={open} alt="" />
                            <h3>Join</h3>
                            <p>It's free and easy to join.</p>
                            <p>Get up and running today.</p>
                            <a href="#join" className="aff-card-link">Join Now</a>
                        </div>

                        {/* Card 2: Advertise */}
                        <div className="aff-card">
                            <img src={money} className="aff-icon-placeholder" />
                            <h3>Advertise</h3>
                            <p>Choose from our products to advertise to your customers.</p>
                            <p>Whether you are a large network, content site, social media influencer or blogger, we have simple linking tools to meet your advertising needs and help you monetize</p>
                            <a href="#tools" className="aff-card-link">Linking Tools</a>
                        </div>

                        {/* Card 3: Earn */}
                        <div className="aff-card">
                            <img src={earnmoney} className="aff-icon-placeholder" />
                            <h3>Earn</h3>
                            <p>Get up to 30% in commissions on successful referrals.</p>
                            <p>Earn commissions from all qualifying purchases, not just the products you advertised. Plus, our competitive conversion rates help you maximize your earnings.</p>
                            <a href="#commissions" className="aff-card-link">Product Commissions</a>
                        </div>

                    </div>

                    {/* Bottom CTA */}
                    <div className="aff-bottom-cta">
                        <button className="aff-join-btn">Join Now</button>
                    </div>
                </section >

            </div >
            <footer className="aff-footer">
                <div className="aff-footer-container">

                    {/* Top Columns Section */}
                    <div className="aff-footer-columns">

                        {/* Column 1 */}
                        <div className="aff-footer-col">
                            <h4>Learn</h4>
                            <ul>
                                <li><a href="#commissions">Commissions</a></li>
                                <li><a href="#tools">Tools</a></li>
                                <li><a href="#reporting">Reporting</a></li>
                            </ul>
                        </div>

                        {/* Column 2 */}
                        <div className="aff-footer-col">
                            <h4>Customer Support</h4>
                            <ul>
                                <li><a href="#contact">Contact us</a></li>
                            </ul>
                        </div>

                        {/* Column 3 */}
                        <div className="aff-footer-col">
                            <h4>Legal</h4>
                            <ul>
                                <li><a href="#terms">Terms & Conditions</a></li>
                                <li><a href="#privacy">Privacy Policy</a></li>
                            </ul>
                        </div>

                        {/* Column 4 (Copyright & Language) */}
                        <div className="aff-footer-col aff-footer-col-right">
                            <p className="aff-footer-copyright">@2026, hooktasy.com</p>
                            <a href="#language" className="aff-footer-lang">
                                English <span className="lang-arrow">▾</span>
                            </a>
                        </div>

                    </div>

                    {/* App Badges Section */}
                    <div className="aff-footer-badges">
                        <a href="#googleplay">
                            <img src={googlePlayBadge} alt="Get it on Google Play" />
                        </a>
                        <a href="#appstore">
                            <img src={appStoreBadge} alt="Download on the App Store" />
                        </a>
                    </div>

                    {/* Bottom Attribution */}
                    <div className="aff-footer-credit">
                        <span className="bolt-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                            </svg>
                        </span>
                        by Goaffpro
                    </div>

                </div>
            </footer>

        </>
    );
};

export default Earn;