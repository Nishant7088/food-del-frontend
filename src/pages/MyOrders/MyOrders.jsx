import React, { useContext, useEffect, useState, useRef } from 'react'
import './MyOrders.css'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import { toast } from 'react-toastify'

// Countdown timer component for each order
const CancelTimer = ({ cancelDeadline, orderId, onCancelled }) => {
    const { url, token } = useContext(StoreContext);
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [expired, setExpired] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        const deadline = new Date(cancelDeadline).getTime();

        const tick = () => {
            const now = Date.now();
            const diff = Math.max(0, Math.floor((deadline - now) / 1000));
            setSecondsLeft(diff);
            if (diff <= 0) {
                setExpired(true);
                clearInterval(intervalRef.current);
            }
        };

        tick();
        intervalRef.current = setInterval(tick, 1000);
        return () => clearInterval(intervalRef.current);
    }, [cancelDeadline]);

    const handleCancel = async () => {
        if (expired || cancelling) return;
        setCancelling(true);
        try {
            const res = await axios.post(
                `${url}/api/order/cancel`,
                { orderId },
                { headers: { token } }
            );
            if (res.data.success) {
                toast.error('Order cancelled successfully.');
                onCancelled(orderId);
            } else {
                toast.error(res.data.message || 'Could not cancel order.');
            }
        } catch (_) {
            toast.error('Error cancelling order.');
        }
        setCancelling(false);
    };

    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    const timerStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const isUrgent = secondsLeft <= 20;

    if (expired) {
        return (
            <div className="cancel-section expired">
                <div className="cancel-timer expired-timer">⏱ Cancellation window closed</div>
                <button className="cancel-btn disabled" disabled>Cancel Order</button>
            </div>
        );
    }

    return (
        <div className="cancel-section">
            <div className={`cancel-timer ${isUrgent ? 'urgent' : ''}`}>
                ⏱ Cancel within &nbsp;
                <span className="timer-countdown">{timerStr}</span>
            </div>
            <button
                className={`cancel-btn ${cancelling ? 'cancelling' : ''}`}
                onClick={handleCancel}
                disabled={cancelling}
            >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
        </div>
    );
};

const MyOrders = () => {
    const { url, token } = useContext(StoreContext);
    const [orders, setOrders] = useState([]);
    const [expanded, setExpanded] = useState({});

    const fetchOrders = async () => {
        const res = await axios.post(`${url}/api/order/userorders`, {}, { headers: { token } });
        if (res.data.success) {
            setOrders(res.data.data.reverse());
        }
    };

    useEffect(() => {
        if (token) fetchOrders();
    }, [token]);

    const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    const handleCancelled = (orderId) => {
        setOrders(prev => prev.filter(o => o._id !== orderId));
    };

    const statusColor = (status) => {
        if (status === 'Delivered') return '#2a8f2a';
        if (status === 'Out for delivery') return '#e07b00';
        return '#3498db';
    };

    const isWithinCancelWindow = (order) => {
        if (!order.cancelDeadline) return false;
        return new Date(order.cancelDeadline).getTime() > Date.now();
    };

    return (
        <div className='my-orders'>
            <h2>My Orders</h2>

            {orders.length === 0 && (
                <div className="no-orders">
                    <p>🛍️ No orders yet!</p>
                    <span>Your order history will appear here.</span>
                </div>
            )}

            <div className="orders-container">
                {orders.map((order) => {
                    const isOpen = expanded[order._id];
                    const firstItem = order.items[0];
                    const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
                    const showTimer = order.status !== 'Delivered' && order.status !== 'Out for delivery';

                    return (
                        <div key={order._id} className={`order-panel ${isOpen ? 'open' : ''}`}>
                            {/* Header — clickable to expand */}
                            <div className="order-panel-header" onClick={() => toggleExpand(order._id)}>
                                <div className="order-thumb-stack">
                                    <img
                                        src={`${url}/images/${firstItem?.image}`}
                                        alt={firstItem?.name}
                                        className="order-thumb"
                                    />
                                    {order.items.length > 1 && (
                                        <span className="extra-items-badge">+{order.items.length - 1}</span>
                                    )}
                                </div>

                                <div className="order-summary">
                                    <p className="order-names">
                                        {order.items.map((it, i) =>
                                            i === order.items.length - 1
                                                ? `${it.name} ×${it.quantity}`
                                                : `${it.name} ×${it.quantity}, `
                                        )}
                                    </p>
                                    <div className="order-meta-row">
                                        <span className="order-date">
                                            {new Date(order.date).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short', year: 'numeric'
                                            })}
                                        </span>
                                        <span className="order-item-count">
                                            {itemCount} item{itemCount !== 1 ? 's' : ''}
                                        </span>
                                        <span className={`payment-mode-tag ${order.paymentMethod === 'cod' ? 'cod' : 'online'}`}>
                                            {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                                        </span>
                                    </div>
                                </div>

                                <div className="order-right">
                                    <p className="order-amount">₹{order.amount}</p>
                                    <span className="order-status" style={{ color: statusColor(order.status) }}>
                                        ● {order.status}
                                    </span>
                                </div>

                                <span className={`chevron ${isOpen ? 'up' : 'down'}`}>›</span>
                            </div>

                            {/* Cancel timer — shown below header if within window */}
                            {showTimer && order.cancelDeadline && (
                                <div className="timer-bar" onClick={e => e.stopPropagation()}>
                                    <CancelTimer
                                        cancelDeadline={order.cancelDeadline}
                                        orderId={order._id}
                                        onCancelled={handleCancelled}
                                    />
                                </div>
                            )}

                            {/* Expanded body */}
                            {isOpen && (
                                <div className="order-panel-body">
                                    <div className="order-items-list">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="order-item-row">
                                                <img
                                                    src={`${url}/images/${item.image}`}
                                                    alt={item.name}
                                                    className="order-item-img"
                                                />
                                                <div className="order-item-details">
                                                    <p className="order-item-name">{item.name}</p>
                                                    <p className="order-item-cat">{item.category}</p>
                                                </div>
                                                <p className="order-item-qty">×{item.quantity}</p>
                                                <p className="order-item-price">₹{item.price * item.quantity}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="order-breakdown">
                                        <div className="breakdown-row">
                                            <span>Subtotal</span>
                                            <span>₹{order.amount - 49 + (order.discount || 0)}</span>
                                        </div>
                                        {order.discount > 0 && (
                                            <div className="breakdown-row discount-row">
                                                <span>Promo ({order.promoCode})</span>
                                                <span>- ₹{order.discount}</span>
                                            </div>
                                        )}
                                        <div className="breakdown-row">
                                            <span>Delivery</span><span>₹49</span>
                                        </div>
                                        <div className="breakdown-row total-row">
                                            <b>Total</b><b>₹{order.amount}</b>
                                        </div>
                                    </div>

                                    <div className="order-delivery-info">
                                        <p className="delivery-info-title">📍 Delivery Address</p>
                                        <p>{order.address.firstName} {order.address.lastName}</p>
                                        <p>{order.address.street}, {order.address.city}, {order.address.state} — {order.address.zipcode}</p>
                                        <p>{order.address.country} | {order.address.phone}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MyOrders;