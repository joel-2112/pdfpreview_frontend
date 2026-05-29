import { ADOBE_SDK_URL } from '../constants/adobeConfig';

let loadingPromise = null;

export const loadAdobeSDK = () => {
  if (typeof window !== 'undefined' && window.AdobeDC) {
    return Promise.resolve(window.AdobeDC);
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise((resolve, reject) => {
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

    script.onerror = (err) => {
      loadingPromise = null;
      reject(new Error('Failed to load Adobe PDF Embed SDK script.'));
    };

    document.body.appendChild(script);
  });

  return loadingPromise;
};
