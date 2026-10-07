import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "./CommentData.css";
import Comment from "../components/Comment";
import { Comments } from "../assets/Comments/Comments";
import CommentModal from "../components/CommentModal";

const AUTOPLAY_DELAY = 2000; // 5 seconds

const CommentData = () => {
    const swiperRef = useRef(null);
    const [selectedComment, setSelectedComment] = useState(null);

    // Pause autoplay while the modal is open, resume when it closes
    const openComment = (item) => {
        swiperRef.current?.autoplay?.stop();
        setSelectedComment(item);
    };

    const closeComment = () => {
        setSelectedComment(null);
        swiperRef.current?.autoplay?.start();
    };

    return (
        <div className="comments-wrapper">
            <div className="comments-list-wrapper">
                <button
                    className="comments-arrow comments-arrow-left"
                    onClick={() => swiperRef.current?.slidePrev()}
                    aria-label="Previous reviews"
                >
                    ‹
                </button>

                <Swiper
                    className="comments-swiper"
                    modules={[Autoplay]}
                    onSwiper={(swiper) => (swiperRef.current = swiper)}
                    slidesPerView="auto"
                    spaceBetween={28}
                    speed={600}
                    grabCursor
                    rewind
                    autoplay={{
                        delay: AUTOPLAY_DELAY,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}
                    breakpoints={{
                        0: { spaceBetween: 14 },
                        601: { spaceBetween: 20 },
                        1201: { spaceBetween: 28 },
                    }}
                >
                    {Comments.map((item) => (
                        <SwiperSlide key={item.id}>
                            <div
                                className="comment-click"
                                onClick={() => openComment(item)}
                            >
                                <Comment
                                    id={item.id}
                                    images={item.images}
                                    rating={item.rating}
                                    name={item.name}
                                    verified={item.verified}
                                    date={item.date}
                                    comment={item.comment}
                                    product={item.product}
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                <button
                    className="comments-arrow comments-arrow-right"
                    onClick={() => swiperRef.current?.slideNext()}
                    aria-label="Next reviews"
                >
                    ›
                </button>
            </div>

            <CommentModal
                isOpen={selectedComment !== null}
                onClose={closeComment}
                commentData={selectedComment}
            />
        </div>
    );
};

export default CommentData;