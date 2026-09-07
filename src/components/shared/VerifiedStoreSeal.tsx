'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

/** iPhone, iPad, iPod — plus iPadOS Safari, which reports itself as a Mac but has a touch screen. */
function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

/**
 * Saudi Business Center "متجر موثّق" seal.
 *
 * The vendor script normally draws the seal inside `.sbc-verify-seal`, and
 * globals.css unpins it so it sits in the footer beside the CR number. On iOS
 * Safari the script injects the badge outside that container and pins it to a
 * screen corner, where our CSS cannot reach it and it floats over the page.
 * Until the vendor fixes that, the seal is not rendered on iOS at all.
 *
 * The decision is made after mount so the server and first client render agree.
 */
export function VerifiedStoreSeal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(!isIOS());
  }, []);

  if (!show) return null;

  return (
    <>
      <div className="sbc-verify-seal" data-token="SHVHY2xMRXY2L1MxOEQ0c0tYbmdSZz09" data-position="bottom-left" />
      <Script
        src="https://eauthenticate.saudibusiness.gov.sa/EAuthSealApi/seal.js"
        strategy="lazyOnload"
      />
    </>
  );
}
