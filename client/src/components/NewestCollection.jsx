import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "./NewestCollection.css";
import halloween from "../assets/Navbar/001_1_09e65484-34e5-4eb7-8a25-28110cb77099.png"
import chrismis from "../assets/Navbar/002_HTS_Subscription_8b271e49-390d-4e3f-af69-34b2304e83e6.png"
import flowers from "../assets/Navbar/003_25_Flower_Bundle_Crochet_Pattern_Hooktasy.png"
import alphabet from "../assets/Navbar/007_abc.jpeg"
import backschool from "../assets/Navbar/004_B_n_sao_c_a_meow_meow_80c4cd48-e8df-438d-8c5c-1b5378f3652b.png"
import car_hanging from "../assets/Navbar/005_Christmas_ornament_crochet_pattern.jpg"
import nurse from "../assets/Navbar/006_1_befcfb7a-ff7b-4cf2-8464-27196196752b.png"
import sea from "../assets/Navbar/seaAnimals.png"
// Replace this array with your own items — each needs an image src and a label.
const items = [
    { src: halloween, label: "Halloween" },
    { src: chrismis, label: "Chrismis" },
    { src: flowers, label: "Flowers" },
    { src: sea, label: "Sea Animals" },
    { src: alphabet, label: "Alphabet" },
    { src: nurse, label: "Nurse & Lab Crochet" },
    { src: backschool, label: "Back to School" },
    { src: car_hanging, label: "Car Hanging" },
    { src: halloween, label: "Halloween" },
    { src: chrismis, label: "Chrismis" },
    { src: flowers, label: "Flowers" },
];

export default function CollectionCarousel({ title = "Newest collection", cards = items }) {
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
                        className="collection__arrow"
                        onClick={() => swiper?.slidePrev()}
                        disabled={isBeginning}
                        aria-label="Previous"
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M15 5 7 12l8 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    <div className="collection__counter">
                        <span>{index + 1}</span>
                        <span className="collection__counter-sep">/</span>
                        <span>{cards.length}</span>
                    </div>

                    <button
                        className="collection__arrow"
                        onClick={() => swiper?.slideNext()}
                        disabled={isEnd}
                        aria-label="Next"
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16">
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
                    <SwiperSlide className="collection__card" key={i}>
                        <div className="collection__frame">
                            <img src={card.src} alt={card.label || ""} draggable="false" />
                        </div>
                        <p className="collection__label">{card.label}</p>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}