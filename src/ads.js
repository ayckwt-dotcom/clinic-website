// src/ads.js
function gtagSafe(...args) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(...args);
  } else {
    // Optional: surface in console while testing
    console.warn("gtag not ready yet; event skipped:", args);
  }
}

/** Fire when someone clicks a WhatsApp link */
export function convWhatsapp(eventCallback) {
  gtagSafe("event", "conversion", {
    send_to: "AW-17694041152/wLO_CJmnibgbEMDIlvVB",  // WhatsApp click
    value: 1.0,
    currency: "USD",
    event_callback: eventCallback
  });
}

/** Fire when the contact/appointment form is successfully submitted */
export function convSubmitAppt(eventCallback) {
  gtagSafe("event", "conversion", {
    send_to: "AW-17694041152/O3sqCJynibgbEMDIlvVB",  // Form submit
    value: 1.0,
    currency: "USD",
    event_callback: eventCallback
  });
}
