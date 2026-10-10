import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "./NewestCollection.css";
import halloween from "../assets/Collection/halloween.webp";
import chrismis from "../assets/Collection/chrismis.webp";
import flowers from "../assets/Collection/flowers.webp";
import alphabet from "../assets/Collection/alphabet.webp";
import backschool from "../assets/Collection/back-to-school.webp";
import car_hanging from "../assets/Collection/car-hanging.webp";
import nurse from "../assets/Collection/nurse.webp";
import sea from "../assets/Collection/sea-animals.webp";

const ITEMS = [
    { src: halloween, label: "Halloween" },
    { src: chrismis, label: "Chrismis" },
    { src: flowers, label: "Flowers" },
    { src: sea, label: "Sea Animals" },
    { src: alphabet, label: "Alphabet" },
    { src: nurse, label: "Nurse & Lab Crochet" },
    { src: backschool, label: "Back to School" },
    { src: car_hanging, label: "Car Hanging" },
];

const EAGER_COUNT = 4; // slides visible on desktop; the rest load lazily

export default function CollectionCarousel({ title = "Newest collection", cards = ITEMS }) {
    const [swiper, setSwiper] = useState(null);
    const [index, setIndex] = useState(0);
    const [isBeginning, setIsBeginning] = useState(true);
    const [isEnd, setIsEnd] = useState(false);

    // Keep the counter and the arrow disabled-states in sync with Swiper
    function sync(s) {
        setIndex(s.activeIndex);
        setIsBeginning(s.isBeginning);
        setIsEnd(s.isEnd);
    }

    return (
        <section className="collection" aria-label={title}>
            <div className="collection__header">
                <div></div>
                <h2 className="collection__title">{title}</h2>

                <div className="collection__nav">
                    <button
                        type="button"
                        className="collection__arrow"
                        onClick={() => swiper?.slidePrev()}
                        disabled={isBeginning}
                        aria-label="Previous"
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                            <path d="M15 5 7 12l8 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    <div className="collection__counter" aria-live="polite">
                        <span>{index + 1}</span>
                        <span className="collection__counter-sep">/</span>
                        <span>{cards.length}</span>
                    </div>

                    <button
                        type="button"
                        className="collection__arrow"
                        onClick={() => swiper?.slideNext()}
                        disabled={isEnd}
                        aria-label="Next"
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                            <path d="M9 5l8 7-8 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>

            <Swiper
                className="collection__viewport"
                grabCursor={true}
                spaceBetween={20}
                slidesPerView={1.14}
                breakpoints={{
                    640: { slidesPerView: 2 },
                    960: { slidesPerView: 4 },
                }}
                onSwiper={(s) => {
                    setSwiper(s);
                    sync(s);
                }}
                onSlideChange={sync}
                onResize={sync}
                onBreakpoint={sync}
                onReachBeginning={sync}
                onReachEnd={sync}
                onFromEdge={sync}
            >
                {cards.map((card, i) => (
                    <SwiperSlide className="collection__card" key={card.label}>
                        <div className="collection__frame">
                            <img
                                src={card.src}
                                alt={card.label || ""}
                                width="700"
                                height="700"
                                loading={i < EAGER_COUNT ? "eager" : "lazy"}
                                decoding="async"
                                draggable="false"
                            />
                        </div>
                        <p className="collection__label">{card.label}</p>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}