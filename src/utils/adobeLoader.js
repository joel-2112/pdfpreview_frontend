import { ADOBE_SDK_URL } from '../constants/adobeConfig';

let loadingPromise = null;

const SDK_TIMEOUT_MS = 15000;

export const loadAdobeSDK = () => {
  if (typeof window !== 'undefined' && window.AdobeDC) {
    return Promise.resolve(window.AdobeDC);
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  const sdkLoad = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = ADOBE_SDK_URL;
    script.async = true;

    script.onload = () => {
      if (window.AdobeDC) {
        resolve(window.AdobeDC);
      } else {
        document.addEventListener('adobe_dc_view_sdk.ready', () => {
          resolve(window.AdobeDC);
        });
      }
    };

    script.onerror = () => {
      loadingPromise = null;
      reject(new Error('Failed to load Adobe PDF Embed SDK script.'));
    };

    document.body.appendChild(script);
  });

  const timeout = new Promise((_, reject) => {
    setTimeout(() => {
      loadingPromise = null;
      reject(new Error('Adobe PDF Embed SDK load timed out after 15 seconds.'));
    }, SDK_TIMEOUT_MS);
  });

  loadingPromise = Promise.race([sdkLoad, timeout]);

  return loadingPromise;
};
