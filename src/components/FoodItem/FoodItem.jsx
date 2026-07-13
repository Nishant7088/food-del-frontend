import React, { useContext, useState, Suspense, lazy } from 'react'
import './FoodItem.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'
import { toast } from 'react-toastify'

/*
  PERFORMANCE FIX — ReviewPopup is rendered once per FoodItem card
  (could be 30+ times on the Home page), but only ever NEEDED if the
  user actually clicks "Reviews". Lazy-loading means its JS chunk is
  fetched once, on-demand, the first time any review popup is opened
  — instead of being part of the critical bundle multiplied by every
  card on the page.
*/
const ReviewPopup = lazy(() => import('../ReviewPopup/ReviewPopup'));

/* ─── Dynamic Half-Star Rating ─── */
const StarDisplay = ({ avg, count }) => {
    if (!avg || count === 0) {
        return (
            <div className="star-display no-reviews" title="No reviews yet">
                {[1,2,3,4,5].map(s => (
                    <svg key={s} className="star-svg empty" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                ))}
                <span className="star-count">(0)</span>
            </div>
        );
    }

    const rounded = Math.round(avg * 2) / 2;
    const stars = [];

    for (let i = 1; i <= 5; i++) {
        if (rounded >= i) {
            stars.push(
                <svg key={i} className="star-svg full" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
            );
        } else if (rounded >= i - 0.5) {
            const clipId = `hc-${i}-${Math.random().toString(36).slice(2,8)}`;
            stars.push(
                <svg key={i} className="star-svg half" viewBox="0 0 24 24" aria-hidden="true">
                    <defs>
                        <clipPath id={clipId}>
                            <rect x="0" y="0" width="12" height="24"/>
                        </clipPath>
                    </defs>
                    <path className="star-bg" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    <path className="star-fg" clipPath={`url(#${clipId})`} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
            );
        } else {
            stars.push(
                <svg key={i} className="star-svg empty" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
            );
        }
    }

    return (
        <div
            className="star-display"
            title={`${rounded}/5 stars (${count} review${count !== 1 ? 's' : ''})`}
            aria-label={`Rated ${rounded} out of 5`}
        >
            {stars}
            <span className="star-count">({count})</span>
        </div>
    );
};

/* ─── Food Item Card ─── */
const FoodItem = ({ id, name, price, description, image, avgRating, reviewCount, loading = "lazy" }) => {
    const { cartItems, addToCart, removeFromCart, url, restaurantOpen } = useContext(StoreContext);
    const [showReview, setShowReview] = useState(false);

    const foodItem = { _id: id, name, price, description, image };

    const handleAdd = () => {
        if (!restaurantOpen) {
            toast.error("Restaurant is currently closed.");
            return;
        }
        addToCart(id);
    };

    return (
        <>
            <article
                className={`food-item ${!restaurantOpen ? 'food-item-closed' : ''}`}
                aria-label={name}
            >
                {/* Image */}
                <div className='food-item-img-container'>
                    <img
                        className='food-item-image'
                        src={`${url}/images/${image}`}
                        alt={name}
                        loading={loading}
                        decoding="async"
                        width="300"
                        height="200"
                    />

                    {!restaurantOpen && (
                        <div className="closed-overlay" aria-hidden="true">
                            <span>Currently Unavailable</span>
                        </div>
                    )}

                    {restaurantOpen && (
                        !cartItems[id]
                            ? <img
                                className='add'
                                onClick={handleAdd}
                                src={assets.add_icon_white}
                                alt="Add to cart"
                                loading="lazy"
                              />
                            : <div className='food-item-counter'>
                                <img className='add-more' onClick={() => removeFromCart(id)} src={assets.remove_icon_red} alt="Remove one" loading="lazy"/>
                                <p>{cartItems[id]}</p>
                                <img className='add-more' onClick={handleAdd} src={assets.add_icon_green} alt="Add one" loading="lazy"/>
                              </div>
                    )}
                </div>

                {/* Info — flex:1 fills remaining card height */}
                <div className="food-item-info">
                    <div className="food-item-name-rating">
                        <p className="food-item-name">{name}</p>
                        <StarDisplay avg={avgRating} count={reviewCount} />
                    </div>

                    {/* Description grows → pushes price/btn to bottom */}
                    <p className="food-item-desc">{description}</p>

                    {/* Always at card bottom */}
                    <div className="food-item-bottom">
                        <p className="food-item-price">₹{price}</p>
                        <button
                            className="review-btn"
                            onClick={() => setShowReview(true)}
                            aria-label={`Reviews for ${name}`}
                        >
                            Reviews
                        </button>
                    </div>
                </div>
            </article>

            {showReview && (
                <Suspense fallback={null}>
                    <ReviewPopup foodItem={foodItem} onClose={() => setShowReview(false)} />
                </Suspense>
            )}
        </>
    );
};

export default FoodItem;