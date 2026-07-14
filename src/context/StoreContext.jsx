import { createContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

// ── Axios instance with base URL and timeout ──
const api = axios.create({
    baseURL: "https://food-del-backend-zp5h.onrender.com", 
    timeout: 10000,
});

// ── Attach token to every request automatically ──
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.token = token;
    return config;
});

const StoreContextProvider = (props) => {
    const [cartItems, setCartItems]       = useState({});
    const [food_list, setFoodList]        = useState([]);
    const [token, setToken]               = useState("");
    const [userName, setUserName]         = useState("");
    const [promoData, setPromoData]       = useState(null);
    const [restaurantOpen, setRestaurantOpen] = useState(true);

    const url         = "https://food-del-backend-zp5h.onrender.com";
    const DELIVERY_FEE = 49;

    // ── Cart helpers ──
    const addToCart = useCallback(async (itemId) => {
        if (!restaurantOpen) return;
        setCartItems(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
        if (localStorage.getItem("token")) {
            await api.post("/api/cart/add", { itemId }).catch(() => {});
        }
    }, [restaurantOpen]);

    const removeFromCart = useCallback(async (itemId) => {
        setCartItems(prev => ({ ...prev, [itemId]: prev[itemId] - 1 }));
        if (localStorage.getItem("token")) {
            await api.post("/api/cart/remove", { itemId }).catch(() => {});
        }
    }, []);

    const getTotalCartAmount = useCallback(() => {
        let total = 0;
        for (const id in cartItems) {
            if (cartItems[id] > 0) {
                const item = food_list.find(p => p._id === id);
                if (item) total += item.price * cartItems[id];
            }
        }
        return total;
    }, [cartItems, food_list]);

    const getCartItemCount = useCallback(() =>
        Object.values(cartItems).reduce((sum, qty) => sum + (qty > 0 ? qty : 0), 0),
    [cartItems]);

    // ── Promo helpers ──
    const applyPromo  = useCallback((data) => setPromoData(data), []);
    const removePromo = useCallback(() => setPromoData(null), []);

    const getFinalAmount = useCallback(() => {
        const sub  = getTotalCartAmount();
        if (sub === 0) return 0;
        const disc = promoData ? promoData.discountAmount : 0;
        return sub - disc + DELIVERY_FEE;
    }, [getTotalCartAmount, promoData]);

    // ── Boot: fetch food list + restaurant status in parallel ──
    useEffect(() => {
        const boot = async () => {
            try {
                // Fire both requests at the same time
                const [foodRes, statusRes] = await Promise.all([
                    api.get("/api/food/list"),
                    api.get("/api/restaurant/status"),
                ]);
                if (foodRes.data.success)   setFoodList(foodRes.data.data);
                if (statusRes.data.success) setRestaurantOpen(statusRes.data.isOpen);
            } catch (_) {}

            // Load user data if logged in
            const savedToken = localStorage.getItem("token");
            const savedName  = localStorage.getItem("userName");
            if (savedToken) {
                setToken(savedToken);
                if (savedName) setUserName(savedName);
                try {
                    const cartRes = await api.get("/api/cart/get");
                    if (cartRes.data.success) setCartItems(cartRes.data.cartData);
                } catch (_) {}
            }
        };
        boot();

        // Poll restaurant status every 20 seconds
        const poll = setInterval(async () => {
            try {
                const res = await api.get("/api/restaurant/status");
                if (res.data.success) setRestaurantOpen(res.data.isOpen);
            } catch (_) {}
        }, 20000);

        return () => clearInterval(poll);
    }, []);

    const contextValue = {
        food_list, cartItems, setCartItems,
        addToCart, removeFromCart,
        getTotalCartAmount, getCartItemCount,
        url, token, setToken,
        userName, setUserName,
        DELIVERY_FEE, promoData,
        applyPromo, removePromo, getFinalAmount,
        restaurantOpen,
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
