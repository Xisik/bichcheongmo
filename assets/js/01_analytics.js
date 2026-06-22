const GA_TRACKING_ID = 'REPLACE_ME_GA_ID';

const gtagScript = document.createElement('script');
gtagScript.async = true;
gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
document.head.appendChild(gtagScript);

window.dataLayer = window.dataLayer || [];
function gtag(){ window.dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', GA_TRACKING_ID);
