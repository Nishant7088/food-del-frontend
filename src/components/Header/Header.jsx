import React from 'react'
import './Header.css'
import { assets } from '../../assets/assets'

const Header = () => {
    return (
        <div className='header' id='header-section'>
            {/*
              ══════════════════════════════════════════════════════════
              PERFORMANCE FIX — Largest Contentful Paint (was 27.0s!)
              The header image is almost certainly the LCP element.
              Three changes here fix it:

              1. fetchPriority="high" — tells the browser "download this
                 image FIRST, before anything else", instead of waiting
                 in the normal queue behind fonts/JS/etc.

              2. loading="eager" + decoding="sync" — this image is above
                 the fold and visible immediately, so we explicitly opt
                 OUT of lazy loading (lazy loading the LCP image is one
                 of the most common causes of a slow LCP).

              3. Explicit width/height — reserves the layout space before
                 the image downloads, preventing layout shift (CLS) and
                 letting the browser paint the page skeleton instantly
                 instead of waiting to know the image's aspect ratio.
              ══════════════════════════════════════════════════════════
            */}
            <img
                className="header-bg-image"
                src={assets.header_img}
                alt="Delicious food spread ready to order"
                fetchpriority="high"
                loading="eager"
                decoding="sync"
                width="1280"
                height="435"
            />

            <div className="header-contents">
                <h2>Order your favourite food here</h2>
                <p>Choose from a diverse menu featuring a delectable array of dishes crafted with the finest ingredients and culinary expertise. Our mission is to satisfy your cravings and elevate your dining experience, one delicious meal at a time.</p>
                <button onClick={() => document.getElementById('explore-menu')?.scrollIntoView({ behavior: 'smooth' })}>
                    View Menu
                </button>
            </div>
        </div>
    );
};

export default Header;