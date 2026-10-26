/**
 * Larissa Naves Advocacia — Analytics & Traffic Engine
 * Gerencia Google Tag Manager, Google Ads, Meta Pixel e rastreamento de conversão de WhatsApp e UTMs.
 */

(function () {
  'use strict';

  // Configurações
  const GTM_ID = 'GTM-KCW2QNRC';
  const GOOGLE_ADS_ID = 'AW-17960433898';
  const GOOGLE_ADS_CONVERSION_LABEL = 'AW-17960433898/yW0CPHltKgdEOxmFRC';
  const META_PIXEL_ID = '2181928012730955';

  // 1. Capturar e persistir UTMs e IDs de cliques (gclid, fbclid)
  function getQueryParams() {
    const params = {};
    const search = window.location.search.substring(1);
    if (!search) return params;
    search.split('&').forEach(function (part) {
      const item = part.split('=');
      if (item[0]) {
        params[decodeURIComponent(item[0])] = decodeURIComponent(item[1] || '');
      }
    });
    return params;
  }

  const queryParams = getQueryParams();
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'].forEach(function (param) {
    if (queryParams[param]) {
      try {
        sessionStorage.setItem('ln_' + param, queryParams[param]);
      } catch (e) {}
    }
  });

  // 2. Google Tag Manager
  if (GTM_ID) {
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer',GTM_ID);
  }

  // 3. Google Ads / gtag.js
  if (GOOGLE_ADS_ID) {
    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GOOGLE_ADS_ID);

    const gascript = document.createElement('script');
    gascript.async = true;
    gascript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GOOGLE_ADS_ID;
    document.head.appendChild(gascript);
  }

  // 4. Meta Pixel
  if (META_PIXEL_ID) {
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', META_PIXEL_ID);
    fbq('track', 'PageView');
  }

  // 5. Interceptador de cliques no WhatsApp (disparo de conversões)
  function handleWhatsAppClick(e) {
    const target = e.target.closest('a[href*="wa.me"], a[href*="whatsapp.com"], #whatsapp-button, .whatsapp-float');
    if (!target) return;

    // Disparar conversão Google Ads (beacon: sobrevive à navegação para o WhatsApp)
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        'send_to': GOOGLE_ADS_CONVERSION_LABEL,
        'transport_type': 'beacon',
        'event_timeout': 2000,
        'event_callback': function () {}
      });
    }

    // Disparar conversão Meta Pixel (Lead / Contact)
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Contact');
    }

    // Disparar evento para o dataLayer do GTM
    if (window.dataLayer) {
      window.dataLayer.push({
        'event': 'whatsapp_conversion',
        'conversion_type': 'agendamento'
      });
    }
  }

  document.addEventListener('click', handleWhatsAppClick, true);

})();
