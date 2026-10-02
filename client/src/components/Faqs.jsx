import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Faqs.css";

// ---- Edit these to match your store ----
const ORDER_SEARCH_PATH = "/myorders"; // your order search / my orders route
const FREEBIES_URL = "#"; // link to your free patterns page
const FACEBOOK_URL = "#"; // your Facebook page
const INSTAGRAM_URL = "#"; // your Instagram page
const CONTACT_EMAIL = "info@zootsyshop.com";
// -----------------------------------------

const faqs = [
    {
        question: "How do I get my pattern after purchasing?",
        answer: (
            <>
                <p>Once your payment is successful, you will receive your pattern in two ways:</p>
                <ol>
                    <li>
                        A <strong>download link</strong> will appear on the <strong>Thank You page</strong>{" "}
                        right after checkout.
                    </li>
                    <li>
                        You will also receive an <strong>email</strong> with a link to instantly download your
                        pattern. Make sure to check your inbox (and spam/junk folder) for the download email.
                    </li>
                </ol>
                <p>
                    You can also search for your order and download your pattern using your{" "}
                    <strong>order number</strong> and <strong>email/phone number</strong> on the following
                    page: <Link to={ORDER_SEARCH_PATH}>Order Search Page</Link>.
                </p>
            </>
        ),
    },
    {
        question: "Can I preview parts of the pattern before buying?",
        answer: (
            <p>
                Yes, we offer a selection of <strong>freebie patterns</strong> that you can download to
                check the clarity and quality of our instructions before making a purchase. Feel free to
                browse and download them here:{" "}
                <a href={FREEBIES_URL} target="_blank" rel="noopener noreferrer">
                    Zootsy Freebies
                </a>
                .
            </p>
        ),
    },
    {
        question: "How can I buy your pattern? / How can I check out?",
        answer: (
            <>
                <p>Buying a pattern from our store is simple! Just follow these steps:</p>
                <ol>
                    <li>Browse our collection and select the pattern you want to purchase.</li>
                    <li>Click <strong>“Add to Cart”</strong> on the product page.</li>
                    <li>
                        Once you've added all the patterns you want to your cart, click on the <strong>cart icon</strong> at the
                        top right corner of the page.
                    </li>
                    <li>Review your items and click <strong>“Checkout”</strong>.</li>
                    <li>Enter your billing information, then choose your preferred payment method.</li>
                    <li>
                        After completing the payment, you'll receive an instant download link on the Thank You
                        page and via email to access your pattern.
                    </li>
                </ol>
            </>
        ),
    },
    {
        question: "What languages are your patterns available in?",
        answer: (
            <p>
                Currently, our patterns are primarily available in <strong>English</strong>. However, we are working on
                expanding our collection to include patterns in other languages. If you're interested in a
                specific language or need help with translation, feel free to reach out to us, and we'll do
                our best to assist!
            </p>
        ),
    },
    {
        question: "I need help with my pattern or have other questions",
        answer: (
            <>
                <p>If you need help or have any questions, you can reach us in two ways:</p>
                <ol>
                    <li>
                        <strong>Email:</strong> Send us an email to{" "}
                        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>, and we'll get back to you as
                        soon as possible.
                    </li>
                    <li>
                        <strong>Social Media:</strong> You can also contact us through our{" "}
                        <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer">
                            Facebook
                        </a>{" "}
                        or{" "}
                        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                            Instagram
                        </a>
                        , where we're always happy to assist!
                    </li>
                </ol>
            </>
        ),
    },
];

const Faqs = () => {
    // Only one FAQ can be open at a time. Opening another closes the current one.
    const [openIndex, setOpenIndex] = useState(0);

    const toggle = (index) => {
        setOpenIndex((current) => (current === index ? null : index));
    };

    return (
        <section className="faqs">
            <p className="faqs__intro">Got a question? We're here to answer</p>
            <h1 className="faqs__title">FAQs</h1>

            <div className="faqs__list">
                {faqs.map((item, index) => {
                    const isOpen = openIndex === index;
                    return (
                        <div className={`faq ${isOpen ? "faq--open" : ""}`} key={item.question}>
                            <h2 className="faq__heading">
                                <button
                                    type="button"
                                    className="faq__question"
                                    aria-expanded={isOpen}
                                    aria-controls={`faq-panel-${index}`}
                                    id={`faq-button-${index}`}
                                    onClick={() => toggle(index)}
                                >
                                    <span>{item.question}</span>
                                    <svg
                                        className="faq__chevron"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </button>
                            </h2>

                            <div
                                className="faq__answer"
                                id={`faq-panel-${index}`}
                                role="region"
                                aria-labelledby={`faq-button-${index}`}
                            >
                                <div className="faq__answer-inner">
                                    <div className="faq__content">{item.answer}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default Faqs;