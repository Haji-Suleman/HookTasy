import React, { useState, useEffect, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import "./Popup.css";

const Popup = ({ item, url, onClose }) => {
    const [swiper, setSwiper] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [closing, setClosing] = useState(false);

    // Images first, then videos, all in one gallery
    const media = useMemo(() => {
        const images = (item?.images || []).map((src) => ({ type: 'image', src }));
        const videos = (item?.videos || []).map((src) => ({ type: 'video', src }));
        return [...images, ...videos];
    }, [item]);

    // Start from the first slide whenever a different product is opened
    useEffect(() => {
        setActiveIndex(0);
        if (swiper && !swiper.destroyed) {
            swiper.slideTo(0, 0);
        }
    }, [item, swiper]);

    const pauseAllVideos = () => {
        if (swiper && !swiper.destroyed) {
            swiper.el.querySelectorAll('video').forEach((v) => v.pause());
        }
    };

    const handleClose = () => {
        pauseAllVideos();
        setClosing(true);
        setTimeout(() => {
            onClose();
        }, 200);
    };

    const goPrev = () => swiper?.slidePrev();
    const goNext = () => swiper?.slideNext();

    const goTo = (index) => swiper?.slideTo(index);

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
                            {media.length > 0 ? (
                                <Swiper
                                    className="popup-swiper"
                                    onSwiper={setSwiper}
                                    onSlideChange={(s) => {
                                        pauseAllVideos();
                                        setActiveIndex(s.activeIndex);
                                    }}
                                    spaceBetween={0}
                                    slidesPerView={1}
                                    rewind={true}
                                >
                                    {media.map((m, index) => (
                                        <SwiperSlide
                                            key={`${m.type}-${index}`}
                                            className="popup-slide"
                                        >
                                            {m.type === 'image' ? (
                                                <img
                                                    src={m.src}
                                                    alt={`${item.name} ${index + 1}`}
                                                    className="popup-main-image-el"
                                                />
                                            ) : (
                                                <video
                                                    src={m.src}
                                                    controls
                                                    playsInline
                                                    preload="metadata"
                                                    className="popup-main-image-el popup-main-video swiper-no-swiping"
                                                />
                                            )}
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            ) : (
                                <div className="popup-no-image">No Image</div>
                            )}

                            {media.length > 1 && (
                                <React.Fragment>
                                    <button
                                        className="popup-nav popup-nav--prev"
                                        onClick={goPrev}
                                        aria-label="Previous"
                                    >
                                        ‹
                                    </button>

                                    <button
                                        className="popup-nav popup-nav--next"
                                        onClick={goNext}
                                        aria-label="Next"
                                    >
                                        ›
                                    </button>
                                </React.Fragment>
                            )}
                        </div>

                        {media.length > 1 && (
                            <div className="popup-thumbnails">
                                {media.map((m, index) => (
                                    <div
                                        key={`thumb-${m.type}-${index}`}
                                        className={`popup-thumbnail ${index === activeIndex
                                            ? "popup-thumbnail--active"
                                            : ""
                                            }`}
                                        onClick={() => goTo(index)}
                                    >
                                        {m.type === 'image' ? (
                                            <img src={m.src} alt={`thumb-${index}`} />
                                        ) : (
                                            <>
                                                <video
                                                    src={m.src}
                                                    muted
                                                    preload="metadata"
                                                />
                                                <span className="popup-thumbnail-play">
                                                    ▶
                                                </span>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="popup-details">
                        <span className="popup-category-badge">
                            {item.category}
                        </span>

                        <h2 className="popup-title">
                            {item.name}
                        </h2>

                        <p className="popup-price">
                            ${item.price}
                        </p>

                        {/* Render Quill HTML as formatted content */}
                        <div
                            className="popup-description"
                            dangerouslySetInnerHTML={{
                                __html: item.description || ""
                            }}
                        />

                        {item.pdfLink && (
                            <a
                                href={item.pdfLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="popup-pdf-link"
                            >
                                View PDF Pattern
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Popup;