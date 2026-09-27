import { useEffect, useRef, useState } from "react";
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

function getCardsPerView() {
    if (typeof window === "undefined") return 4;
    const w = window.innerWidth;
    if (w < 640) return 1;
    if (w < 960) return 2;
    return 4;
}

export default function CollectionCarousel({ title = "Newest collection", cards = items }) {
    const viewportRef = useRef(null);
    const [index, setIndex] = useState(0);
    const [cardsPerView, setCardsPerView] = useState(getCardsPerView());
    const dragState = useRef({ dragging: false, pointerId: null, startX: 0, startScroll: 0, moved: false, raf: null });

    const maxIndex = Math.max(0, cards.length - cardsPerView);

    function cardStep() {
        const viewport = viewportRef.current;
        if (!viewport) return 0;
        const first = viewport.querySelector(".collection__card");
        if (!first) return 0;
        const gap = parseFloat(getComputedStyle(viewport.firstElementChild).gap || 0);
        return first.getBoundingClientRect().width + gap;
    }

    function goTo(i, smooth = true) {
        const clamped = Math.min(Math.max(i, 0), maxIndex);
        setIndex(clamped);
        viewportRef.current?.scrollTo({ left: clamped * cardStep(), behavior: smooth ? "smooth" : "auto" });
    }

    useEffect(() => {
        function handleResize() {
            setCardsPerView(getCardsPerView());
        }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        goTo(index, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cardsPerView]);

    // Pointer-based drag: uses pointer capture so a fast swipe never "escapes"
    // the element, and turns scroll-snap off mid-drag so the row tracks the
    // finger/cursor 1:1 instead of fighting the snap points.
    function handlePointerDown(e) {
        const viewport = viewportRef.current;
        viewport.setPointerCapture(e.pointerId);
        viewport.classList.add("is-dragging");
        dragState.current = {
            dragging: true,
            pointerId: e.pointerId,
            startX: e.clientX,
            startScroll: viewport.scrollLeft,
            moved: false,
            raf: null,
        };
    }

    function handlePointerMove(e) {
        const state = dragState.current;
        const viewport = viewportRef.current;
        if (!state.dragging) return;
        const delta = e.clientX - state.startX;
        if (Math.abs(delta) > 6) state.moved = true;
        if (state.raf) cancelAnimationFrame(state.raf);
        state.raf = requestAnimationFrame(() => {
            viewport.scrollLeft = state.startScroll - delta;
        });
    }

    function handlePointerUp(e) {
        const state = dragState.current;
        const viewport = viewportRef.current;
        if (!state.dragging) return;
        if (state.raf) cancelAnimationFrame(state.raf);
        state.dragging = false;
        viewport.classList.remove("is-dragging");
        if (viewport.hasPointerCapture?.(e.pointerId)) {
            viewport.releasePointerCapture(e.pointerId);
        }
        const nearest = Math.round(viewport.scrollLeft / cardStep());
        goTo(nearest);
    }

    return (
        <section className="collection" aria-label={title}>
            <div className="collection__header">
                <div></div>
                <h2 className="collection__title">{title}</h2>

                <div className="collection__nav">
                    <button
                        className="collection__arrow"
                        onClick={() => goTo(index - 1)}
                        disabled={index <= 0}
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
                        onClick={() => goTo(index + 1)}
                        disabled={index >= maxIndex}
                        aria-label="Next"
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M9 5l8 7-8 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>

            <div
                className="collection__viewport"
                ref={viewportRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            >
                <ul className="collection__track">
                    {cards.map((card, i) => (
                        <li className="collection__card" key={i}>
                            <div className="collection__frame">
                                <img src={card.src} alt={card.label || ""} draggable="false" />
                            </div>
                            <p className="collection__label">{card.label}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}