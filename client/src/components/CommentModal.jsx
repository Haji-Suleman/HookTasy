import React, { useState } from "react";
import "./CommentModal.css";
const CommentModal = ({ isOpen, onClose, commentData }) => {
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    if (!isOpen || !commentData) return null;

    const images = commentData.images || [
        "https://placehold.co/600x800/333/fff?text=Main+Image",
        "https://placehold.co/150x150/eee/999?text=Thumb+1",
        "https://placehold.co/150x150/eee/999?text=Thumb+2",
        "https://placehold.co/150x150/eee/999?text=Thumb+3",
        "https://placehold.co/150x150/eee/999?text=Thumb+4",
    ];

    const handlePrevImage = () => {
        setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>

                {/* Close Button */}
                <button className="modal-close-btn" onClick={onClose} aria-label="Close">
                    ✕
                </button>

                {/* Left Side: Image Gallery */}
                <div className="modal-left">
                    <div className="modal-main-image-wrapper">
                        <img
                            src={images[activeImageIndex]}
                            alt="Review"
                            className="modal-main-image"
                        />

                        <button className="modal-arrow modal-arrow-left" onClick={handlePrevImage} aria-label="Previous image">
                            ‹
                        </button>
                        <button className="modal-arrow modal-arrow-right" onClick={handleNextImage} aria-label="Next image">
                            ›
                        </button>
                    </div>

                    <div className="modal-thumbnails">
                        {images.map((img, index) => (
                            <button
                                key={index}
                                className={`modal-thumb-btn ${index === activeImageIndex ? "active" : ""}`}
                                onClick={() => setActiveImageIndex(index)}
                            >
                                <img src={img} alt={`Thumb ${index}`} className="modal-thumb-img" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Side: Comment Details */}
                <div className="modal-right">
                    <div className="modal-stars">
                        {"★".repeat(commentData.rating || 5)}
                        {"☆".repeat(5 - (commentData.rating || 5))}
                    </div>

                    <div className="modal-user-info">
                        <div className="modal-avatar">
                            {commentData.name ? commentData.name.charAt(0) : "D"}
                        </div>
                        <div className="modal-user-text">
                            <div className="modal-user-header">
                                <h3 className="modal-user-name">{commentData.name || "Diane W."}</h3>
                                {commentData.verified && (
                                    <span className="modal-verified-badge">Verified</span>
                                )}
                            </div>
                            <p className="modal-user-date">{commentData.date || "04/01/2026"}</p>
                        </div>
                    </div>

                    <p className="modal-comment-text">
                        {commentData.comment || "Fun and quick and easy to make. I used DK weight cotton blend yarn and liked the way it came out better than Red Heart yarn"}
                    </p>

                    <div className="modal-product-tag">
                        {commentData.product || "8in1 Farm Animal Popping Coasters..."}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CommentModal;