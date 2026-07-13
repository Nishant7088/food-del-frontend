import React, { useState, Suspense, lazy } from 'react'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Footer from './components/Footer/Footer'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Login modal is only needed once the user clicks "Sign In"
const LoginPopup = lazy(() => import('./components/LoginPopup/LoginPopup'));

/*
  ══════════════════════════════════════════════════════════
  PERFORMANCE FIX — Route-based code splitting (helps "Network
  dependency tree" + "Legacy JavaScript" + overall bundle size)

  Home is NOT lazy because it's needed immediately on first load.
  Every other route is lazy — its JS chunk is only downloaded
  when the user actually navigates there, instead of all being
  bundled into the single initial JS payload the browser must
  parse before First Contentful Paint.
  ══════════════════════════════════════════════════════════
*/
import Home from './pages/Home/Home'

const Cart       = lazy(() => import('./pages/Cart/Cart'))
const PlaceOrder  = lazy(() => import('./pages/PlaceOrder/PlaceOrder'))
const Verify      = lazy(() => import('./pages/Verify/Verify'))
const MyOrders    = lazy(() => import('./pages/MyOrders/MyOrders'))

// Minimal fallback — avoids a jarring blank screen during chunk download
const RouteFallback = () => (
    <div style={{ padding: '100px 0', textAlign: 'center', color: '#999' }}>
        Loading...
    </div>
);

const App = () => {
    const [showLogin, setShowLogin] = useState(false);

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
                draggable
                theme="colored"
            />
            {showLogin && (
                <Suspense fallback={null}>
                    <LoginPopup setShowLogin={setShowLogin} />
                </Suspense>
            )}
            <div className='app'>
                <Navbar setShowLogin={setShowLogin} />
                <Suspense fallback={<RouteFallback />}>
                    <Routes>
                        <Route path='/' element={<Home />} />
                        <Route path='/cart' element={<Cart />} />
                        <Route path='/order' element={<PlaceOrder />} />
                        <Route path='/verify' element={<Verify />} />
                        <Route path='/myorders' element={<MyOrders />} />
                    </Routes>
                </Suspense>
            </div>
            <Footer />
        </>
    );
};

export default App;