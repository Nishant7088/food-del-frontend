import React, { useContext, useEffect, useState } from "react";
import "./Cart.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Cart = () => {
    const {
        cartItems, food_list, removeFromCart, addToCart,
        getTotalCartAmount, url, DELIVERY_FEE,
        promoData, applyPromo, removePromo, restaurantOpen
    } = useContext(StoreContext);

    const navigate = useNavigate();
    const [allPromos, setAllPromos] = useState([]);
    const [selectedPromoCode, setSelectedPromoCode] = useState("");
    const subtotal = getTotalCartAmount();

    useEffect(() => {
        const fetchPromos = async () => {
            try {
                const res = await axios.get(`${url}/api/promo/active`);
                if (res.data.success) setAllPromos(res.data.data);
            } catch (_) {}
        };
        fetchPromos();
    }, [url]);

    const handlePromoSelect = async (code) => {
        setSelectedPromoCode(code);
        removePromo();
        if (!code) return;
        if (subtotal === 0) { toast.warning("Add items to cart first."); return; }
        const res = await axios.post(`${url}/api/promo/validate`, { code, orderAmount: subtotal });
        if (res.data.success) {
            applyPromo({ code, discountPercent: res.data.discountPercent, discountAmount: res.data.discountAmount });
            toast.success(`${res.data.discountPercent}% discount applied! You save ₹${res.data.discountAmount}`);
        } else {
            toast.error(res.data.shortBy
                ? `Add ₹${res.data.shortBy} more to unlock this offer.`
                : res.data.message
            );
        }
    };

    const getPromoHint = (promo) => {
        if (subtotal >= promo.minOrderAmount) return `${promo.discountPercent}% off ✓`;
        return `Add ₹${promo.minOrderAmount - subtotal} more for ${promo.discountPercent}% off`;
    };

    const handleCheckout = () => {
        if (!restaurantOpen) {
            toast.error("Restaurant is currently closed. Orders are not accepted right now.");
            return;
        }
        navigate("/order");
    };

    const discount = promoData ? promoData.discountAmount : 0;
    const total = subtotal === 0 ? 0 : subtotal - discount + DELIVERY_FEE;
    const hasItems = food_list.some(item => cartItems[item._id] > 0);

    return (
        <div className="cart">
            {/* Closed banner */}
            {!restaurantOpen && (
                <div className="cart-closed-banner">
                    🔴 <strong>Restaurant is closed.</strong> You can view your cart but cannot place orders right now.
                </div>
            )}

            <div className="cart-items">
                <div className="cart-items-title">
                    <p>Image</p><p>Name</p><p>Price</p>
                    <p>Quantity</p><p>Total</p><p>Actions</p>
                </div>
                <br /><hr />
                {food_list.map((item, index) => {
                    if (cartItems[item._id] > 0) {
                        return (
                            <div key={index}>
                                <div className="cart-items-title cart-items-item">
                                    <img src={`${url}/images/${item.image}`} alt={item.name} />
                                    <p>{item.name}</p>
                                    <p>₹{item.price}</p>
                                    <p>{cartItems[item._id]}</p>
                                    <p>₹{item.price * cartItems[item._id]}</p>
                                    <div className="cart-item-actions">
                                        <img onClick={() => removeFromCart(item._id)} src={assets.remove_icon_red} alt="remove" />
                                        <img onClick={() => addToCart(item._id)} src={assets.add_icon_green} alt="add" />
                                    </div>
                                </div>
                                <hr />
                            </div>
                        );
                    }
                    return null;
                })}
                {!hasItems && (
                    <div className="cart-empty">
                        <p>Your cart is empty. <span onClick={() => navigate("/")}>Browse Menu</span></p>
                    </div>
                )}
            </div>

            <div className="cart-bottom">
                <div className="cart-total">
                    <h2>Cart Total</h2>
                    <div>
                        <div className="cart-total-details"><p>Subtotal</p><p>₹{subtotal}</p></div>
                        <hr />
                        {discount > 0 && (
                            <>
                                <div className="cart-total-details cart-discount">
                                    <p>Discount ({promoData.discountPercent}%)</p>
                                    <p>- ₹{discount}</p>
                                </div>
                                <hr />
                            </>
                        )}
                        <div className="cart-total-details">
                            <p>Delivery Fee</p>
                            <p>{subtotal === 0 ? '₹0' : `₹${DELIVERY_FEE}`}</p>
                        </div>
                        <hr />
                        <div className="cart-total-details">
                            <b>Total</b><b>₹{total}</b>
                        </div>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={subtotal === 0 || !restaurantOpen}
                        className={!restaurantOpen ? 'btn-closed' : ''}
                    >
                        {!restaurantOpen ? 'Restaurant Closed' : 'PROCEED TO CHECKOUT'}
                    </button>
                </div>

                <div className="cart-promocode">
                    <div>
                        <p>Apply a Promo Code</p>
                        <div className="cart-promocode-select-wrap">
                            <select
                                value={selectedPromoCode}
                                onChange={(e) => handlePromoSelect(e.target.value)}
                                className="cart-promocode-select"
                            >
                                <option value="">-- Select Promo Code --</option>
                                {allPromos.map((promo) => (
                                    <option key={promo._id} value={promo.code}>
                                        {promo.code} — {getPromoHint(promo)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {promoData && (
                            <button className="promo-remove-btn" onClick={() => {
                                removePromo();
                                setSelectedPromoCode("");
                                toast.info("Promo code removed.");
                            }}>
                                Remove Promo
                            </button>
                        )}
                        {allPromos.length === 0 && <p className="promo-none">No promo codes available.</p>}
                        {allPromos.length > 0 && subtotal > 0 && (
                            <div className="promo-hints">
                                {allPromos
                                    .filter(p => subtotal < p.minOrderAmount)
                                    .map(p => (
                                        <div key={p._id} className="promo-hint-item">
                                            🏷️ Add <b>₹{p.minOrderAmount - subtotal}</b> more to unlock <b>{p.code}</b> ({p.discountPercent}% off)
                                        </div>
                                    ))
                                }
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;