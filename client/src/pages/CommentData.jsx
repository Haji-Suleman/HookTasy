import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "./CommentData.css";
import Comment from "../components/Comment";
import { Comments } from "../assets/Comments/Comments";
import CommentModal from "../components/CommentModal";

const CommentData = () => {
    const swiperRef = useRef(null);
    const [selectedComment, setSelectedComment] = useState(null);
    const [atStart, setAtStart] = useState(true);
    const [atEnd, setAtEnd] = useState(false);

    const syncEdges = (swiper) => {
        setAtStart(swiper.isBeginning);
        setAtEnd(swiper.isEnd);
    };

    return (
        <div className="comments-wrapper">
            <div className="comments-list-wrapper">
                <button
                    className="comments-arrow comments-arrow-left"
                    onClick={() => swiperRef.current?.slidePrev()}
                    disabled={atStart}
                    aria-label="Previous reviews"
                >
                    ‹
                </button>

                <Swiper
                    className="comments-swiper"
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                        syncEdges(swiper);
                    }}
                    onSlideChange={syncEdges}
                    onReachBeginning={syncEdges}
                    onReachEnd={syncEdges}
                    onResize={syncEdges}
                    slidesPerView="auto"
                    spaceBetween={30}
                    speed={500}
                    grabCursor
                    breakpoints={{
                        0: { spaceBetween: 15 },
                        601: { spaceBetween: 20 },
                        1201: { spaceBetween: 30 },
                    }}
                >
                    {Comments.map((item) => (
                        <SwiperSlide key={item.id}>
                            <div
                                className="comment-click"
                                onClick={() => setSelectedComment(item)}
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
                    disabled={atEnd}
                    aria-label="Next reviews"
                >
                    ›
                </button>
            </div>

            <CommentModal
                isOpen={selectedComment !== null}
                onClose={() => setSelectedComment(null)}
                commentData={selectedComment}
            />
        </div>
    );
};

export default CommentData;