import React, { useContext, useState, useEffect, useRef } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext'

const avatarColors = ['#e74c3c','#e67e22','#2ecc71','#3498db','#9b59b6','#1abc9c','#e91e63','#ff5722'];
const getColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

const Navbar = ({ setShowLogin }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    // profileOpen is controlled by JS (mouseenter/mouseleave with delay)
    // so we can add a 500ms grace period before hiding
    const [profileOpen, setProfileOpen] = useState(false);
    const closeTimer = useRef(null);

    const { getTotalCartAmount, token, setToken, setCartItems, userName, setUserName } = useContext(StoreContext);
    const navigate  = useNavigate();
    const location  = useLocation();
    const menuRef   = useRef(null);

    const firstLetter = userName ? userName.charAt(0).toUpperCase() : 'U';

    /* ── Logout ── */
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        setToken('');
        setUserName('');
        setCartItems({});
        setProfileOpen(false);
        navigate('/');
    };

    /* ── Section scroll (works from any page) ── */
    const handleNavClick = (sectionId) => {
        setMenuOpen(false);
        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' }), 350);
        } else {
            document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    /* ── Profile dropdown hover with 500ms close delay ── */
    const handleProfileEnter = () => {
        clearTimeout(closeTimer.current);
        setProfileOpen(true);
    };

    const handleProfileLeave = () => {
        // Wait 500 ms before hiding — lets the cursor travel into the dropdown
        closeTimer.current = setTimeout(() => setProfileOpen(false), 500);
    };

    // Clean up timer on unmount
    useEffect(() => () => clearTimeout(closeTimer.current), []);

    /* ── Close mobile menu on outside click ── */
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <>
            <nav className='navbar' role="navigation" aria-label="Main navigation">
                <Link to='/' onClick={() => setMenuOpen(false)} aria-label="Tomato home">
                    <img className='logo' src={assets.logo} alt='Tomato Food Delivery logo' width="62" height="62" />
                </Link>

                {/* Hamburger — mobile only */}
                <button
                    className="hamburger"
                    onClick={() => setMenuOpen(o => !o)}
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={menuOpen}
                >
                    <span></span><span></span><span></span>
                </button>

                {/* Desktop links */}
                <ul className='navbar-menu' role="list">
                    <li onClick={() => handleNavClick('header-section')}>Home</li>
                    <li onClick={() => handleNavClick('explore-menu')}>Menu</li>
                    <li onClick={() => handleNavClick('app-download')}>Mobile App</li>
                    <li onClick={() => handleNavClick('footer')}>Contact Us</li>
                    {token && (
                        <li className="nav-myorders" onClick={() => navigate('/myorders')}>
                            My Orders
                        </li>
                    )}
                </ul>

                {/* Right side */}
                <div className="navbar-right">

                    <div className="navbar-search-icon">
                        <Link to='/cart' aria-label="Shopping cart">
                            <img src={assets.basket_icon} alt='Cart' width="22" height="22" loading="lazy" />
                        </Link>
                        <div className={getTotalCartAmount() > 0 ? 'dot' : ''} aria-hidden="true"></div>
                    </div>

                    {!token
                        ? <button onClick={() => setShowLogin(true)}>Sign In</button>
                        : (
                            /* ── Profile dropdown ──
                               Both the avatar AND the dropdown listen to the same
                               enter/leave handlers.  The 500 ms close-timer means
                               the user can move the cursor from avatar → dropdown
                               without the menu vanishing.
                            ── */
                            <div
                                className='navbar-profile'
                                onMouseEnter={handleProfileEnter}
                                onMouseLeave={handleProfileLeave}
                            >
                                <div
                                    className="avatar"
                                    style={{ backgroundColor: getColor(userName) }}
                                    aria-haspopup="true"
                                    aria-expanded={profileOpen}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={e => e.key === 'Enter' && setProfileOpen(o => !o)}
                                >
                                    {firstLetter}
                                </div>

                                {/* Dropdown — visible when profileOpen */}
                                <ul
                                    className={`nav-profile-dropdown ${profileOpen ? 'dropdown-visible' : ''}`}
                                    role="menu"
                                >
                                    <div className="dropdown-header">
                                        <div className="avatar-lg" style={{ backgroundColor: getColor(userName) }}>
                                            {firstLetter}
                                        </div>
                                        <span>{userName}</span>
                                    </div>
                                    <hr />
                                    <li
                                        role="menuitem"
                                        onClick={() => { navigate('/myorders'); setProfileOpen(false); }}
                                    >
                                        <img src={assets.bag_icon} alt="" aria-hidden="true" /><p>My Orders</p>
                                    </li>
                                    <hr />
                                    <li role="menuitem" onClick={logout}>
                                        <img src={assets.logout_icon} alt="" aria-hidden="true" /><p>Logout</p>
                                    </li>
                                </ul>
                            </div>
                        )
                    }
                </div>
            </nav>

            {/* Mobile slide-in drawer */}
            <div ref={menuRef} className={`mobile-menu ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
                <ul>
                    <li onClick={() => handleNavClick('header-section')}>Home</li>
                    <li onClick={() => handleNavClick('explore-menu')}>Menu</li>
                    <li onClick={() => handleNavClick('app-download')}>Mobile App</li>
                    <li onClick={() => handleNavClick('footer')}>Contact Us</li>
                    {token && <li onClick={() => { navigate('/myorders'); setMenuOpen(false); }}>My Orders</li>}
                    {!token && <li onClick={() => { setShowLogin(true); setMenuOpen(false); }}>Sign In</li>}
                    {token && <li className="mobile-logout" onClick={logout}>Logout</li>}
                </ul>
            </div>
        </>
    );
};

export default Navbar;