import { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import './PromoBar.css';

/* =====================================================================
   ICONS (local to PromoBar)
   ===================================================================== */
const Svg = ({ className = 'icon-md', children }) => (
    <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        {children}
    </svg>
);

const ChevronLeft = ({ className }) => <Svg className={className}><path d="M15 5l-7 7 7 7" /></Svg>;
const ChevronRight = ({ className }) => <Svg className={className}><path d="M9 5l7 7-7 7" /></Svg>;
const CloseIcon = ({ className }) => <Svg className={className}><path d="M5 5l14 14M19 5L5 19" /></Svg>;

/* Reusable promo arrow — renders as <button> or a static <span> */
function PromoArrow({ direction, onClick }) {
    const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
    const base = 'promo-bar__nav-btn';
    if (!onClick) {
        return (
            <span aria-hidden="true" className={`${base} ${base}--static`}>
                <Icon className="icon-promo" />
            </span>
        );
    }
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={direction === 'left' ? 'Previous announcement' : 'Next announcement'}
            className={base}
        >
            <Icon className="icon-promo" />
        </button>
    );
}

/* =====================================================================
   PROMO BAR — top announcement strip
   ===================================================================== */
const DEFAULT_ANNOUNCEMENTS = ['Pick 3 & Get 1 Small', 'Pick 5 & Get 2 Large'];

export default function PromoBar({ announcements = DEFAULT_ANNOUNCEMENTS }) {
    const [visible, setVisible] = useState(true);
    const swiperRef = useRef(null);

    const canCycle = announcements.length > 1;

    /* Swiper loop needs enough slides; repeat short lists so autoplay keeps going */
    const slides =
        announcements.length > 1 && announcements.length < 4
            ? [...announcements, ...announcements]
            : announcements;

    if (!visible) return null;

    return (
        <div role="region" aria-label="Promotions" className="promo-bar">
            <div className="promo-bar__inner">
                <PromoArrow
                    direction="left"
                    onClick={canCycle ? () => swiperRef.current?.slidePrev() : undefined}
                />

                <div className="promo-viewport">
                    <Swiper
                        className="promo-swiper"
                        modules={[Autoplay]}
                        onSwiper={(swiper) => (swiperRef.current = swiper)}
                        slidesPerView={1}
                        loop={canCycle}
                        speed={500}
                        allowTouchMove={canCycle}
                        autoplay={
                            canCycle
                                ? { delay: 4000, disableOnInteraction: false }
                                : false
                        }
                    >
                        {slides.map((text, i) => (
                            <SwiperSlide key={`${text}-${i}`}>
                                <p className="promo-text">{text}</p>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                <PromoArrow
                    direction="right"
                    onClick={canCycle ? () => swiperRef.current?.slideNext() : undefined}
                />
            </div>

            <button
                type="button"
                onClick={() => setVisible(false)}
                aria-label="Close announcement bar"
                className="promo-bar__close-btn"
            >
                <CloseIcon className="icon-close-promo" />
            </button>
        </div>
    );
}