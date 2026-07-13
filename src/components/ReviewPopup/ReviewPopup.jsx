import React, { useState, useContext, useEffect } from 'react'
import './ReviewPopup.css'
import axios from 'axios'
import { StoreContext } from '../../context/StoreContext'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'

const StarRating = ({ value, onChange, readOnly = false }) => {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="stars">
            {[1, 2, 3, 4, 5].map(s => (
                <span
                    key={s}
                    className={`star ${(hovered || value) >= s ? 'filled' : ''}`}
                    onClick={() => !readOnly && onChange && onChange(s)}
                    onMouseEnter={() => !readOnly && setHovered(s)}
                    onMouseLeave={() => !readOnly && setHovered(0)}
                    style={{ cursor: readOnly ? 'default' : 'pointer' }}
                >★</span>
            ))}
        </div>
    );
};

const ReviewPopup = ({ foodItem, onClose }) => {
    const { url, token } = useContext(StoreContext);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchReviews = async () => {
        setLoading(true);
        const res = await axios.get(`${url}/api/user/review/${foodItem._id}`);
        if (res.data.success) setReviews(res.data.reviews);
        setLoading(false);
    };

    useEffect(() => { fetchReviews(); }, [foodItem._id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) { toast.error("Please login to submit a review"); return; }
        setSubmitting(true);
        const res = await axios.post(`${url}/api/user/review/add`,
            { foodId: foodItem._id, rating, comment },
            { headers: { token } }
        );
        if (res.data.success) {
            toast.success("Review submitted!");
            setComment('');
            setRating(5);
            fetchReviews();
        } else {
            toast.error(res.data.message);
        }
        setSubmitting(false);
    };

    const avgRating = reviews.length
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <div className="review-overlay" onClick={onClose}>
            <div className="review-popup" onClick={e => e.stopPropagation()}>
                <div className="review-header">
                    <div className="review-item-info">
                        <img src={`${url}/images/${foodItem.image}`} alt={foodItem.name} />
                        <div>
                            <h3>{foodItem.name}</h3>
                            {reviews.length > 0 && (
                                <div className="avg-rating">
                                    <StarRating value={Math.round(avgRating)} readOnly />
                                    <span>{avgRating} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <img className="close-btn" src={assets.cross_icon} alt="close" onClick={onClose} />
                </div>

                {/* Submit review form */}
                {token && (
                    <form className="review-form" onSubmit={handleSubmit}>
                        <p className="review-form-title">Write a Review</p>
                        <StarRating value={rating} onChange={setRating} />
                        <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Share your experience (optional)"
                            rows={3}
                        />
                        <button type="submit" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                )}

                {/* Reviews list */}
                <div className="reviews-list">
                    <p className="reviews-title">
                        {reviews.length > 0 ? `${reviews.length} Review${reviews.length !== 1 ? 's' : ''}` : 'No reviews yet'}
                    </p>
                    {loading && <p className="rev-loading">Loading...</p>}
                    {reviews.map((r, i) => (
                        <div key={i} className="review-card">
                            <div className="review-card-top">
                                <div className="reviewer-avatar">
                                    {r.userName?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="reviewer-name">{r.userName}</p>
                                    <StarRating value={r.rating} readOnly />
                                </div>
                                <span className="review-date">
                                    {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                            {r.comment && <p className="review-comment">{r.comment}</p>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export { StarRating };
export default ReviewPopup;