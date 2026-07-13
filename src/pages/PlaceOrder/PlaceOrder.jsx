import React, { useContext, useState, useEffect, Suspense, lazy } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

// Only fetched when the user actually opens the address picker
const AddressPopup = lazy(() => import('../../components/AddressPopup/AddressPopup'));

const PlaceOrder = () => {
    const {
        getTotalCartAmount, token, food_list, cartItems,
        url, DELIVERY_FEE, promoData, setCartItems
    } = useContext(StoreContext);

    const navigate = useNavigate();

    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressPopup, setShowAddressPopup] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [loadingAddress, setLoadingAddress] = useState(true);

    // Load last used address from DB for this specific user
    useEffect(() => {
        const fetchLastAddress = async () => {
            if (!token) return;
            setLoadingAddress(true);
            try {
                const res = await axios.post(
                    `${url}/api/user/address/get`,
                    {},
                    { headers: { token } }
                );
                if (res.data.success) {
                    const { addresses, lastUsedAddressId } = res.data;
                    if (lastUsedAddressId && addresses.length > 0) {
                        const last = addresses.find(a => a._id === lastUsedAddressId);
                        if (last) setSelectedAddress(last);
                        else if (addresses.length > 0) setSelectedAddress(addresses[0]);
                    } else if (addresses.length > 0) {
                        setSelectedAddress(addresses[0]);
                    }
                }
            } catch (_) {}
            setLoadingAddress(false);
        };
        fetchLastAddress();
    }, [token]);

    const buildOrderPayload = () => {
        const orderItems = [];
        food_list.forEach(item => {
            if (cartItems[item._id] > 0) {
                orderItems.push({ ...item, quantity: cartItems[item._id] });
            }
        });
        const subtotal = getTotalCartAmount();
        const discount = promoData ? promoData.discountAmount : 0;
        const finalAmount = subtotal - discount + DELIVERY_FEE;
        return {
            address: selectedAddress,
            items: orderItems,
            amount: finalAmount,
            promoCode: promoData ? promoData.code : '',
            discount
        };
    };

    const placeOrder = async (e) => {
        e.preventDefault();
        if (!token) { toast.error('Please login to place an order.'); return; }
        if (getTotalCartAmount() === 0) { toast.error('Your cart is empty.'); return; }
        if (!selectedAddress) {
            toast.error('Please add and select a delivery address first.');
            setShowAddressPopup(true);
            return;
        }

        const orderData = buildOrderPayload();

        if (paymentMethod === 'cod') {
            const res = await axios.post(`${url}/api/order/placecod`, orderData, { headers: { token } });
            if (res.data.success) {
                setCartItems({});
                toast.success('Order placed! Pay cash on delivery.');
                navigate('/myorders');
            } else {
                toast.error('Error placing order. Please try again.');
            }
        } else {
            try {
                const response = await axios.post(`${url}/api/order/place`, orderData, { headers: { token } });
                if (response.data.success) {
                    const { razorpayOrderId, amount, currency, key, orderId } = response.data;
                    const options = {
                        key, amount, currency,
                        name: 'Tomato Food Delivery',
                        description: 'Food Order Payment',
                        order_id: razorpayOrderId,
                        handler: async (paymentResponse) => {
                            const verifyRes = await axios.post(`${url}/api/order/verify`, {
                                razorpay_order_id: paymentResponse.razorpay_order_id,
                                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                                razorpay_signature: paymentResponse.razorpay_signature,
                                orderId
                            });
                            if (verifyRes.data.success) {
                                setCartItems({});
                                toast.success('Payment successful! Order placed.');
                                navigate('/myorders');
                            } else {
                                toast.error('Payment verification failed. Contact support.');
                            }
                        },
                        prefill: {
                            name: `${selectedAddress.firstName} ${selectedAddress.lastName}`,
                            email: selectedAddress.email,
                            contact: selectedAddress.phone
                        },
                        theme: { color: '#FF6347' },
                        modal: {
                            // Payment dismissed — order is auto-deleted on backend via verifyPayment
                            ondismiss: () => {
                                toast.error('Payment cancelled. Order was not placed.');
                                // Restore cart
                                navigate('/cart');
                            }
                        }
                    };
                    const rzp = new window.Razorpay(options);
                    rzp.open();
                } else {
                    toast.error('Error creating order. Please try again.');
                }
            } catch (error) {
                console.log(error);
                toast.error('Something went wrong. Please try again.');
            }
        }
    };

    const subtotal = getTotalCartAmount();
    const discount = promoData ? promoData.discountAmount : 0;
    const total = subtotal === 0 ? 0 : subtotal - discount + DELIVERY_FEE;

    return (
        <>
            <div className="place-order">
                {/* Left — Delivery Address */}
                <div className="place-order-left">
                    <p className="title">Delivery Information</p>

                    {loadingAddress ? (
                        <div className="addr-loading-msg">Loading your addresses...</div>
                    ) : selectedAddress ? (
                        /* Selected address card */
                        <div className="selected-addr-card">
                            <div className="selected-addr-top">
                                <div className="addr-label-badge">{selectedAddress.label}</div>
                                <button
                                    type="button"
                                    className="change-addr-btn"
                                    onClick={() => setShowAddressPopup(true)}
                                >
                                    Change Address ›
                                </button>
                            </div>
                            <p className="selected-addr-name">
                                {selectedAddress.firstName} {selectedAddress.lastName}
                            </p>
                            <p className="selected-addr-detail">
                                {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} — {selectedAddress.zipcode}
                            </p>
                            <p className="selected-addr-detail">
                                {selectedAddress.country} &nbsp;|&nbsp; 📞 {selectedAddress.phone}
                            </p>
                        </div>
                    ) : (
                        /* No address — prompt to add */
                        <div
                            className="no-addr-prompt"
                            onClick={() => setShowAddressPopup(true)}
                        >
                            <div className="no-addr-icon">📍</div>
                            <div>
                                <p className="no-addr-title">No saved address</p>
                                <p className="no-addr-sub">Tap to add your delivery address</p>
                            </div>
                            <span className="add-addr-arrow">›</span>
                        </div>
                    )}

                    {/* Always visible "Add / Change" button when address exists */}
                    {!loadingAddress && selectedAddress && (
                        <button
                            type="button"
                            className="manage-addr-btn"
                            onClick={() => setShowAddressPopup(true)}
                        >
                            + Manage Saved Addresses
                        </button>
                    )}
                </div>

                {/* Right — Order Summary + Payment */}
                <div className="place-order-right">
                    <div className="cart-total">
                        <h2>Order Summary</h2>
                        <div>
                            <div className="cart-total-details">
                                <p>Subtotal</p><p>₹{subtotal}</p>
                            </div>
                            <hr />
                            {discount > 0 && (
                                <>
                                    <div className="cart-total-details cart-discount">
                                        <p>Promo ({promoData.discountPercent}%)</p>
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
                            <div className="cart-total-details total-row">
                                <b>Total</b><b>₹{total}</b>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="payment-method-section">
                            <p className="payment-title">Payment Method</p>
                            <div className="payment-options">
                                <label className={`payment-option ${paymentMethod === 'razorpay' ? 'active' : ''}`}>
                                    <input
                                        type="radio" name="payment" value="razorpay"
                                        checked={paymentMethod === 'razorpay'}
                                        onChange={() => setPaymentMethod('razorpay')}
                                    />
                                    <span className="payment-icon">💳</span>
                                    <span>Pay Online (Razorpay)</span>
                                </label>
                                <label className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}>
                                    <input
                                        type="radio" name="payment" value="cod"
                                        checked={paymentMethod === 'cod'}
                                        onChange={() => setPaymentMethod('cod')}
                                    />
                                    <span className="payment-icon">💵</span>
                                    <span>Cash on Delivery</span>
                                </label>
                            </div>
                        </div>

                        <button
                            className="place-order-btn"
                            onClick={placeOrder}
                            disabled={!selectedAddress || subtotal === 0}
                        >
                            {!selectedAddress
                                ? 'Add Address to Continue'
                                : paymentMethod === 'cod'
                                    ? 'PLACE ORDER (COD)'
                                    : 'PROCEED TO PAYMENT'
                            }
                        </button>
                    </div>
                </div>
            </div>

            {showAddressPopup && (
                <Suspense fallback={null}>
                    <AddressPopup
                        onClose={() => setShowAddressPopup(false)}
                        onSelect={(addr) => {
                            setSelectedAddress(addr);
                            setShowAddressPopup(false);
                        }}
                    />
                </Suspense>
            )}
        </>
    );
};

export default PlaceOrder;