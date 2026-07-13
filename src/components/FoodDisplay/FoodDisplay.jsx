import React, { useContext, useEffect, useState, useCallback } from 'react'
import './FoodDisplay.css'
import { StoreContext } from '../../context/StoreContext'
import FoodItem from '../FoodItem/FoodItem'
import axios from 'axios'

const FoodDisplay = ({ category }) => {
    const { food_list, restaurantOpen, url } = useContext(StoreContext);
    const [ratingsMap, setRatingsMap] = useState({});

    // Fetch all ratings in one parallel batch when food_list loads
    const fetchAllRatings = useCallback(async () => {
        if (!food_list.length) return;
        try {
            const results = await Promise.all(
                food_list.map(item =>
                    axios.get(`${url}/api/user/review/${item._id}`)
                        .then(res => ({
                            id: item._id,
                            reviews: res.data.success ? res.data.reviews : []
                        }))
                        .catch(() => ({ id: item._id, reviews: [] }))
                )
            );
            const map = {};
            results.forEach(({ id, reviews }) => {
                if (reviews.length > 0) {
                    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
                    map[id] = { avg: Math.round(avg * 2) / 2, count: reviews.length };
                } else {
                    map[id] = { avg: 0, count: 0 };
                }
            });
            setRatingsMap(map);
        } catch (_) {}
    }, [food_list, url]);

    useEffect(() => { fetchAllRatings(); }, [fetchAllRatings]);

    const visibleItems = food_list.filter(item =>
        category === "All" || category === item.category
    );

    return (
        <div className='food-display' id='food-display'>
            <h2>Top dishes near you</h2>

            {!restaurantOpen && (
                <div className="restaurant-closed-banner" role="alert">
                    <span className="closed-icon" aria-hidden="true">🔴</span>
                    <div>
                        <p className="closed-title">Restaurant is currently closed</p>
                        <p className="closed-sub">
                            You can browse the menu but ordering is unavailable right now. We'll be back soon!
                        </p>
                    </div>
                </div>
            )}

            <div className="food-display-list">
                {visibleItems.map((item, index) => (
                    <FoodItem
                        key={item._id}
                        id={item._id}
                        name={item.name}
                        description={item.description}
                        price={item.price}
                        image={item.image}
                        avgRating={ratingsMap[item._id]?.avg ?? null}
                        reviewCount={ratingsMap[item._id]?.count ?? 0}
                        // First 4 cards load eagerly, rest lazy
                        loading={index < 4 ? "eager" : "lazy"}
                    />
                ))}
            </div>
        </div>
    );
};

export default FoodDisplay;