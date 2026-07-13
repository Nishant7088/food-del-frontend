import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom'

const Footer = () => {
    const navigate = useNavigate();

    const scrollTo = (id) => {
        // If not on home page, navigate first then scroll
        if (window.location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
            }, 350);
        } else {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className='footer' id='footer'>
            <div className="footer-content">

                {/* ── Left: Logo + description + social icons ── */}
                <div className="footer-content-left">
                    <img
                        className='footer-logo'
                        src={assets.logo}
                        alt="Tomato Food Delivery logo"
                        onClick={() => navigate('/')}
                        style={{ cursor: 'pointer' }}
                    />
                    <p>
                        Tomato brings delicious food from the best local kitchens straight to your door.
                        Fresh ingredients, fast delivery, and a menu that satisfies every craving.
                    </p>
                    <div className="footer-social-icons">
                        <a
                            href="https://facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Follow us on Facebook"
                        >
                            <img src={assets.facebook_icon} alt="Facebook" />
                        </a>
                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Follow us on Twitter"
                        >
                            <img src={assets.twitter_icon} alt="Twitter" />
                        </a>
                        <a
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Connect on LinkedIn"
                        >
                            <img src={assets.linkedin_icon} alt="LinkedIn" />
                        </a>
                    </div>
                </div>

                {/* ── Center: Company nav links ── */}
                <div className="footer-content-center">
                    <h2>COMPANY</h2>
                    <ul>
                        <li onClick={() => scrollTo('header-section')}>Home</li>
                        <li onClick={() => scrollTo('header-section')}>About Us</li>
                        <li onClick={() => scrollTo('explore-menu')}>Delivery</li>
                        <li onClick={() => scrollTo('footer')}>Privacy Policy</li>
                    </ul>
                </div>

                {/* ── Right: Clickable phone + email ── */}
                <div className="footer-content-right">
                    <h2>GET IN TOUCH</h2>
                    <ul>
                        <li>
                            <a href="tel:+917088311316" aria-label="Call us">
                                📞 +91 7088311316
                            </a>
                        </li>
                        <li>
                            <a href="mailto:anishant415@gmail.com" aria-label="Email us">
                                ✉ anishant415@gmail.com
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <hr />
            <p className="footer-copyright">
                Copyright 2024 © Tomato.com — All Rights Reserved.
            </p>
        </div>
    );
};

export default Footer;