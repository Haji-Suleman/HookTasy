import React, { useState, useEffect } from 'react';
import "./Popup.css";

const Popup = ({ item, url, onClose }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [closing, setClosing] = useState(false);

    const images = item?.images || [];

    useEffect(() => {
        setActiveIndex(0);
    }, [item]);

    const handleClose = () => {
        setClosing(true);
        setTimeout(() => {
            onClose();
        }, 200);
    };

    const goPrev = () => {
        setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goNext = () => {
        setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    if (!item) return null;

    return (
        <div
            className={`popup-overlay ${closing ? "popup-overlay--closing" : ""}`}
            onClick={handleClose}
        >
            <div
                className={`popup-card ${closing ? "popup-card--closing" : ""}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button className="popup-close" onClick={handleClose} aria-label="Close">
                    &times;
                </button>

                <div className="popup-body">
                    <div className="popup-gallery">
                        <div className="popup-main-image">
                            {images.length > 0 ? (
                                <img
                                    src={`${url}/images/${images[activeIndex]}`}
                                    alt={item.name}
                                    key={activeIndex}
                                    className="popup-main-image-el"
                                />
                            ) : (
                                <div className="popup-no-image">No Image</div>
                            )}

                            {images.length > 1 && (
                                <React.Fragment>
                                    <button className="popup-nav popup-nav--prev" onClick={goPrev} aria-label="Previous image">
                                        ‹
                                    </button>
                                    <button className="popup-nav popup-nav--next" onClick={goNext} aria-label="Next image">
                                        ›
                                    </button>
                                </React.Fragment>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className="popup-thumbnails">
                                {images.map((img, index) => (
                                    <img
                                        key={index}
                                        src={`${url}/images/${img}`}
                                        alt={`thumb-${index}`}
                                        className={`popup-thumbnail ${index === activeIndex ? "popup-thumbnail--active" : ""}`}
                                        onClick={() => setActiveIndex(index)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="popup-details">
                        <span className="popup-category-badge">{item.category}</span>
                        <h2 className="popup-title">{item.name}</h2>
                        <p className="popup-price">${item.price}</p>
                        <p className="popup-description">{item.description}</p>

                        {item.pdfLink && (
                            <a href={item.pdfLink} target="_blank" rel="noopener noreferrer" className="popup-pdf-link">
                                View PDF Pattern
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Popup;