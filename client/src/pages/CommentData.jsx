import React, { useRef, useState } from "react"; // Add useState
import "./CommentData.css";
import Comment from "../components/Comment";
import { Comments } from "../assets/Comments/Comments";
import CommentModal from "../components/CommentModal"; // Import the modal

const CommentData = () => {
    const commentsListRef = useRef(null);

    // 1. Add state for the modal
    const [selectedComment, setSelectedComment] = useState(null);

    const scrollComments = (direction) => {
        // ... (your existing scroll logic remains exactly the same)
        const container = commentsListRef.current;
        if (!container) return;
        const card = container.querySelector(".comment-card");
        if (!card) return;
        const cardWidth = card.offsetWidth;
        const gap = 30;
        container.scrollBy({
            left: direction === "right" ? cardWidth + gap : -(cardWidth + gap),
            behavior: "smooth",
        });
    };

    return (
        <div className="comments-wrapper">
            <div className="comments-list-wrapper">
                <button
                    className="comments-arrow comments-arrow-left"
                    onClick={() => scrollComments("left")}
                    aria-label="Previous reviews"
                >
                    ‹
                </button>

                <div className="comments-list" ref={commentsListRef}>
                    {Comments.map((item) => (
                        // 2. Wrap in a clickable div or pass onClick to Comment
                        <div
                            key={item.id}
                            onClick={() => setSelectedComment(item)}
                            style={{ cursor: "pointer" }}
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
                    ))}
                </div>

                <button
                    className="comments-arrow comments-arrow-right"
                    onClick={() => scrollComments("right")}
                    aria-label="Next reviews"
                >
                    ›
                </button>
            </div>

            {/* 3. Render the Modal */}
            <CommentModal
                isOpen={selectedComment !== null}
                onClose={() => setSelectedComment(null)}
                commentData={selectedComment}
            />
        </div>
    );
};

export default CommentData;