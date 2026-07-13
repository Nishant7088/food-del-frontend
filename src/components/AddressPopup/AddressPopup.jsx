import React, { useState, useContext, useEffect } from 'react'
import './AddressPopup.css'
import axios from 'axios'
import { StoreContext } from '../../context/StoreContext'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'

const EMPTY_FORM = {
    label: "Home", firstName: "", lastName: "",
    email: "", street: "", city: "",
    state: "", zipcode: "", country: "", phone: ""
};

const AddressPopup = ({ onClose, onSelect }) => {
    const { url, token } = useContext(StoreContext);
    const [addresses, setAddresses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(true);
    const [lastUsedId, setLastUsedId] = useState("");

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const res = await axios.post(
                `${url}/api/user/address/get`,
                {},
                { headers: { token } }
            );
            if (res.data.success) {
                setAddresses(res.data.addresses);
                setLastUsedId(res.data.lastUsedAddressId || "");
            }
        } catch (_) {}
        setLoading(false);
    };

    useEffect(() => {
        if (token) fetchAddresses();
    }, [token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const res = await axios.post(
            `${url}/api/user/address/add`,
            { address: form },
            { headers: { token } }
        );
        if (res.data.success) {
            toast.success("Address saved!");
            setForm(EMPTY_FORM);
            setShowForm(false);
            await fetchAddresses();
            // Auto-select the newly added address
            if (res.data.address) {
                onSelect(res.data.address);
                onClose();
            }
        } else {
            toast.error(res.data.message);
        }
    };

    const handleDelete = async (e, addressId) => {
        e.stopPropagation();
        const res = await axios.post(
            `${url}/api/user/address/delete`,
            { addressId },
            { headers: { token } }
        );
        if (res.data.success) {
            toast.info("Address removed");
            fetchAddresses();
        }
    };

    const handleSelect = async (addr) => {
        // Save last used address to DB for this user
        await axios.post(
            `${url}/api/user/address/setlast`,
            { addressId: addr._id },
            { headers: { token } }
        ).catch(() => {});
        onSelect(addr);
        onClose();
    };

    // Sort: last used first
    const sortedAddresses = [...addresses].sort((a, b) => {
        if (a._id === lastUsedId) return -1;
        if (b._id === lastUsedId) return 1;
        return 0;
    });

    return (
        <div className="address-popup-overlay" onClick={onClose}>
            <div className="address-popup" onClick={e => e.stopPropagation()}>
                <div className="address-popup-header">
                    <h3>Select Delivery Address</h3>
                    <img src={assets.cross_icon} alt="close" onClick={onClose} />
                </div>

                {loading ? (
                    <div className="addr-loading">Loading your addresses...</div>
                ) : (
                    <div className="address-list">
                        {sortedAddresses.map((addr) => (
                            <div
                                key={addr._id}
                                className={`address-card ${addr._id === lastUsedId ? 'last-used' : ''}`}
                                onClick={() => handleSelect(addr)}
                            >
                                <div className="address-card-left">
                                    <div className="address-card-label">{addr.label}</div>
                                    {addr._id === lastUsedId && (
                                        <div className="last-used-tag">Last used</div>
                                    )}
                                </div>
                                <div className="address-card-body">
                                    <p className="addr-name">{addr.firstName} {addr.lastName}</p>
                                    <p>{addr.street}, {addr.city}, {addr.state} — {addr.zipcode}</p>
                                    <p>{addr.country} &nbsp;|&nbsp; 📞 {addr.phone}</p>
                                </div>
                                <button
                                    className="addr-delete-btn"
                                    onClick={(e) => handleDelete(e, addr._id)}
                                    title="Remove address"
                                >✕</button>
                            </div>
                        ))}

                        {/* Add new address */}
                        <div
                            className="address-card add-new-card"
                            onClick={() => setShowForm(true)}
                        >
                            <span className="plus-icon">＋</span>
                            <p>Add New Address</p>
                        </div>
                    </div>
                )}

                {/* Add address form */}
                {showForm && (
                    <div className="address-form-wrap" onClick={e => e.stopPropagation()}>
                        <div className="address-form-header">
                            <h4>New Address</h4>
                            <img src={assets.cross_icon} alt="close" onClick={() => setShowForm(false)} />
                        </div>
                        <form onSubmit={handleSave} className="address-form">
                            <div className="addr-label-row">
                                {['Home', 'Work', 'Other'].map(l => (
                                    <button
                                        type="button" key={l}
                                        className={`label-chip ${form.label === l ? 'active' : ''}`}
                                        onClick={() => setForm(p => ({ ...p, label: l }))}
                                    >{l}</button>
                                ))}
                            </div>
                            <div className="addr-row">
                                <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" required />
                                <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" required />
                            </div>
                            <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="Email" required />
                            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" required />
                            <input name="street" value={form.street} onChange={handleChange} placeholder="Street" required />
                            <div className="addr-row">
                                <input name="city" value={form.city} onChange={handleChange} placeholder="City" required />
                                <input name="state" value={form.state} onChange={handleChange} placeholder="State" required />
                            </div>
                            <div className="addr-row">
                                <input name="zipcode" value={form.zipcode} onChange={handleChange} placeholder="Zip Code" required />
                                <input name="country" value={form.country} onChange={handleChange} placeholder="Country" required />
                            </div>
                            <button type="submit" className="save-addr-btn">Save &amp; Select Address</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddressPopup;