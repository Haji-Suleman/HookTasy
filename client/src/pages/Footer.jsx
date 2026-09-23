import React from 'react';
import './Footer.css';

// --- IMAGE IMPORTS ---
// Replace these placeholder paths with your actual asset paths
import facebookIcon from '../assets/Footer/svgexport-27.svg';
import pinterestIcon from '../assets/Footer/svgexport-26.svg';
import instagramIcon from '../assets/Footer/svgexport-28.svg';
import youtubeIcon from '../assets/Footer/svgexport-29.svg';

import payment1 from '../assets/Footer/svgexport-30.svg';
import payment2 from '../assets/Footer/svgexport-31.svg';
import payment3 from '../assets/Footer/svgexport-32.svg';
import payment4 from '../assets/Footer/svgexport-33.svg';
import payment5 from '../assets/Footer/svgexport-34.svg';
import payment6 from '../assets/Footer/svgexport-35.svg';
import payment7 from '../assets/Footer/svgexport-36.svg';
import payment8 from '../assets/Footer/svgexport-37.svg';
import payment9 from '../assets/Footer/svgexport-38.svg';
import payment10 from '../assets/Footer/svgexport-39.svg';
import payment11 from '../assets/Footer/svgexport-40.svg';
import payment12 from '../assets/Footer/svgexport-41.svg';

// Add as many payment icons as you have

const Footer = () => {
    // Arrays to easily map your links and images
    const storeInfo = {
        name: "Anna LLC",
        address: "30 N Gould St Ste N\nSheridan, LA 82801",
        email: "contact@hooktasy.com"
    };

    const socialLinks = [
        { id: 1, icon: facebookIcon, alt: "Facebook", link: "#" },
        { id: 2, icon: pinterestIcon, alt: "Pinterest", link: "#" },
        { id: 3, icon: instagramIcon, alt: "Instagram", link: "#" },
        { id: 4, icon: youtubeIcon, alt: "YouTube", link: "#" }
    ];

    const informationLinks = ["Contact us", "FAQs", "About us", "Affiliates"];

    const mainMenuLinks = [
        "NEW", "EXPLORE ALL", "COLLECTIONS", "ANIMALS",
        "GIFTS", "Testimonials", "Affiliate Program",
        "About us", "FAQ", "Contact Us"
    ];

    const serviceLinks = ["Privacy policy", "Shipping Policy", "Refund policy", "Terms of service"];

    // Array for the bottom payment icons
    const paymentIcons = [payment1, payment2, payment3, payment4, payment5, payment6, payment7, payment8, payment8, payment9, payment10, payment11, payment12];

    return (
        <footer className="footer-section">
            <div className="footer-container">
                {/* Top Section: 4 Columns */}
                <div className="footer-top">

                    {/* Column 1: Our Store */}
                    <div className="footer-column">
                        <h3>Our store</h3>
                        <p>{storeInfo.name}</p>
                        <p className="address-text">
                            Address: {storeInfo.address.split('\n').map((line, i) => (
                                <React.Fragment key={i}>{line}<br /></React.Fragment>
                            ))}
                        </p>
                        <p>Email: <a href={`mailto:${storeInfo.email}`}>{storeInfo.email}</a></p>

                        <div className="social-icons">
                            {socialLinks.map((social) => (
                                <a key={social.id} href={social.link} className="social-link" aria-label={social.alt}>
                                    <img src={social.icon} alt={social.alt} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Information */}
                    <div className="footer-column">
                        <h3>Information</h3>
                        <ul>
                            {informationLinks.map((link, index) => (
                                <li key={index}><a href="#">{link}</a></li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Main Menu */}
                    <div className="footer-column">
                        <h3>Main Menu</h3>
                        <ul>
                            {mainMenuLinks.map((link, index) => (
                                <li key={index}><a href="#">{link}</a></li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: Service */}
                    <div className="footer-column">
                        <h3>Service</h3>
                        <ul>
                            {serviceLinks.map((link, index) => (
                                <li key={index}><a href="#">{link}</a></li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Section: Copyright & Payment Icons */}
                <div className="footer-bottom">
                    <div className="footer-bottom-left">
                        <p className="copyright-text">© HOOKTASTY 2024</p>
                        <button className="follow-shop-btn">
                            <span className="heart-icon">♥</span> Follow on shop
                        </button>
                    </div>

                    <div className="footer-bottom-right">
                        {paymentIcons.map((icon, index) => (
                            <img
                                key={index}
                                src={icon}
                                alt={`Payment method ${index + 1}`}
                                className="payment-icon"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;