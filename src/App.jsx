import BookingPage2 from "./BookingPage2";
import { useState, useEffect } from "react";
import LangToggle from "./LangToggle";
import { makeT, setLangAttrs } from "./i18n";   // <-- add this

const getInitialLang = () => {
  // 1) URL override ?lang=ar|en
  const sp = new URLSearchParams(window.location.search);
  const q = sp.get("lang");
  if (q === "ar" || q === "en") return q;

  // 2) previously-selected language (persisted)
  const saved = localStorage.getItem("lang");
  if (saved === "ar" || saved === "en") return saved;

  // 3) default to Arabic
  return "ar";
};

export default function App() {
  const isBookingPage = typeof window !== "undefined" && window.location.pathname === "/book";
  const [locView, setLocView] = useState("map"); // 'map' | 'photo'
  /*const [lang, setLang] = useState(localStorage.getItem("lang") || "en");*/
  const [lang, setLang] = useState(getInitialLang());

  useEffect(() => {
    setLangAttrs(lang);               // centralised place to set dir/lang
    localStorage.setItem("lang", lang);
  }, [lang]);

  const t = makeT(lang);              // translator for current lang

  // Bold "GIG" and "GlobeMed" wherever they appear in the localized string
  const renderWithBrands = (text) => {
    const BRAND_REGEX = /(GIG|GlobeMed|Wapmed)/g;
    return text.split(BRAND_REGEX).map((part, i) =>
      part === "GIG" || part === "GlobeMed" || part === "Wapmed"
        ? <strong className="ins__brand" key={i}>{part}</strong>
        : <span key={i}>{part}</span>
    );
  };

  // inside your component
  const [mobileOpen, setMobileOpen] = useState(false);
  // prevent background scroll while drawer is open (nice on phones)
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [mobileOpen]);
  const closeDrawer = () => setMobileOpen(false);

  // Helper to append ?lang= to cross-page links
  const withLang = (href) => {
    try {
      const url = new URL(href, window.location.origin);
      url.searchParams.set("lang", lang);
      return url.pathname + url.search + url.hash;
    } catch (_) {
      // Fallback for anchors like "#id"
      return href;
    }
  };

// add state for the loading spinner/disable
const [sending, setSending] = useState(false);

// submit handler for the Contact form
async function onContactSubmit(e) {
  e.preventDefault();
  if (sending) return;

  const form = e.currentTarget;
  const fd = new FormData(form);

  const payload = {
    name: fd.get("name")?.toString().trim(),
    phone: fd.get("phone")?.toString().trim(),
    email: fd.get("email")?.toString().trim(),
    message: fd.get("message")?.toString().trim(),
    company: fd.get("company")?.toString() || "" // honeypot
  };

  try {
    setSending(true);
    const r = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const out = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(out.msg || "Failed to send");

    alert("✅ Message sent! We’ll get back to you soon.");
    form.reset();
  } catch (err) {
    alert(err.message || "Something went wrong. Please try again.");
  } finally {
    setSending(false);
  }
}



  return (
    <>
      {/* Top blue strip: email, phone, socials */}
      <div className="topstrip">
        <div className="container">
          <div className="contact">
            <a
              href="https://wa.me/96591110420?"
              className="link link--contact link--wa"
              target="_blank"
              rel="noopener"
              aria-label="WhatsApp"
            >
              {/* WhatsApp badge (small) */}
              <svg viewBox="0 0 64 64" width="20" height="20" aria-hidden="true">
                <defs>
                  {/* use a unique id to avoid clashing with the footer gradient */}
                  <linearGradient id="waGHeader" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#5EE676"/>
                    <stop offset="1" stopColor="#25D366"/>
                  </linearGradient>
                </defs>

                {/* rounded-square background */}
                <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#waGHeader)"/>

                {/* official glyph, centered */}
                <g transform="translate(12,12) scale(1.7)">
                  <path fill="#fff" d="M17.1 13.6c-.297-.149-1.758-.867-2.028-.967-.273-.101-.471-.149-.67.149-.198.297-.767.967-.941 1.165-.173.198-.347.223-.644.074-1.758-.867-2.91-1.549-4.046-3.503-.305-.524.305-.486.874-1.612.097-.198.049-.371-.025-.52-.075-.149-.669-1.611-.916-2.209-.242-.579-.487-.5-.67-.51l-.571-.01c-.198 0-.52.074-.792.372-.271.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.086 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a8.854 8.854 0 01-4.51-1.234l-.323-.192-3.351.878.894-3.257-.211-.334a8.86 8.86 0 01-1.362-4.71c.001-4.866 3.957-8.822 8.826-8.822 2.359 0 4.568.919 6.228 2.579a8.76 8.76 0 012.593 6.243c-.003 4.867-3.959 8.823-8.83 8.823M19.08 4.926A10.573 10.573 0 0012.05 2c-5.87 0-10.64 4.76-10.642 10.631a10.57 10.57 0 001.437 5.345L2 22l4.124-1.086a10.61 10.61 0 004.905 1.251h.004c5.871 0 10.64-4.76 10.642-10.631a10.59 10.59 0 00-3.535-7.608"/>
                </g>
              </svg>

              <span><bdi>(+965) 91110420</bdi></span>
            </a>

            <a href="mailto: reception@6ayyeboon.com" className="link link--contact">
              {/* mail icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M2 6a2 2 0 012-2h16a2 2 0 012 2v.2l-10 6.25L2 6.2V6zm0 2.8V18a2 2 0 002 2h16a2 2 0 002-2V8.8l-9.37 5.86a2 2 0 01-2.26 0L2 8.8z"/>
              </svg>
              <span><bdi>reception@6ayyeboon.com</bdi></span>
            </a>
          </div>
          <div className="strip-right">
            <LangToggle lang={lang} setLang={setLang} />
            <div className="social">
              {/* Instagram */}
              <a className="social__btn" href="https://instagram.com/dr_altayyeb/" target="_blank" rel="noopener" aria-label="Instagram">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zM18 6.8a1 1 0 1 0 1 1 1 1 0 0 0-1-1z"/>
                </svg>
              </a>

              {/* X */}
              <a className="social__btn" href="https://x.com/6ayyeboon" target="_blank" rel="noopener" aria-label="X">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 3h3.4l6.1 7.7L16.8 3H21l-7.2 9.2L21 21h-3.4l-6.5-8.2L7.2 21H3l7.6-9.7L3 3z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main nav: brand + menu */}
      <div className="nav">
        <div className="container">
          <a href={withLang("/")} className="brand">
            <img src="/Clinic-logo.png" alt="Altayyeb Yousef Clinic logo" className="brand__logo" />
            <span className="brand__text">{t("brand")}</span>
          </a>
          <nav className="menu">
            <a href="#about-services"   className="link">{t("nav.about")}</a>
            <a href="#services"         className="link">{t("nav.services")}</a>
            <a href="#insurance"        className="link">{t("nav.Insurance")}</a>
            <a href="#location"         className="link">{t("nav.location")}</a>
            <a href="#contact"          className="link">{t("nav.contact")}</a>
            <a href={withLang("/book")} className="btn">{t("cta.book")}</a>
          </nav>

          <button
            className={`nav__toggle ${mobileOpen ? "is-open" : ""}`}
            aria-expanded={mobileOpen}
            aria-controls="mobile-drawer"
            aria-label="Open menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span /><span /><span />
          </button>
          {/* Mobile drawer (hidden on desktop) */}
          <div
            id="mobile-drawer"
            className={`nav__drawer ${mobileOpen ? "is-open" : ""}`}
            role="dialog"
            aria-modal="true"
          >
            {/* If you want the language switcher up top on mobile, you can place <LangToggle /> here too */}
            <ul className="menu menu--mobile">
              <li><a href="#about-services" onClick={closeDrawer}>{t("nav.about")}</a></li>
              <li><a href="#services" onClick={closeDrawer}>{t("nav.services")}</a></li>
              <li><a href="#insurance" onClick={closeDrawer}>{t("nav.Insurance")}</a></li>
              <li><a href="#location" onClick={closeDrawer}>{t("nav.location")}</a></li>
              <li><a href="#contact" onClick={closeDrawer}>{t("nav.contact")}</a></li>
              <a
                href={withLang("/book")}
                className="btn btn--primary btn-appointment"
                onClick={closeDrawer}
              >
                {t("cta.book")}
              </a>
            </ul>
          </div>

          {/* Dimmed backdrop behind the drawer */}
          <div
            className={`nav__backdrop ${mobileOpen ? "is-open" : ""}`}
            onClick={closeDrawer}
          />
        </div>
      </div>

      {isBookingPage ? (
        <BookingPage2 lang={lang} />
      ) : (
        <>

          <section class="hero full-bleed" role="banner">
            <div class="hero__inner">
              <h1>{t("hero.h1")}</h1>
              <p>{t("hero.sub")}</p>
              <div class="hero__cta">
                <a class="btn--primary" href="#about">{t("cta.learn")}</a>
              </div>
            </div>
            {/* <img src="heart_ecg_transparent.png" alt="Heart" class="hero__heart" /> */}
            <video
              className="hero__heart"
              autoPlay
              muted
              loop
              playsInline
              poster="/heart_ecg_transparent.png"
              preload="metadata"
            >
              <source src="/Heart_Beat2_v2.webm" type="video/webm" />
              <source src="/Heart_Beat2_v2.mp4"  type="video/mp4" />
            </video>
          </section>

          <section className="info-row">
            {/* Working Hours */}
            <div className="ui-box ui-box--pretty">
              <div className="ui-box__head">
                <span className="ui-badge ui-badge--teal" aria-hidden="true">
                  {/* clock */}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M12 7v5l3 2"/>
                  </svg>
                </span>
                <h3 className="ui-box__title">{t("info.workingTitle")}</h3>
              </div>
              <div className="ui-underline"></div>
              <div className="ui-chip">
                <svg className="ui-chip__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
                </svg>
                <span>{t("info.working.line1")}</span>
                <span>{t("info.working.line2")}</span>
                <span>{t("info.working.line3")}</span>
              </div>
            </div>

            {/* Location (anchor link; no need to carry lang) */}
            <a href="#location" className="ui-box ui-box--pretty ui-box--link" aria-labelledby="info-location-title">
              <div className="ui-box__head">
                <span className="ui-badge ui-badge--green" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21s-6-4.35-6-9a6 6 0 1 1 12 0c0 4.65-6 9-6 9Z"/><circle cx="12" cy="12" r="2.5"/>
                  </svg>
                </span>
                <h3 id="info-location-title" className="ui-box__title">{t("info.locationTitle")}</h3>
              </div>
              <div className="ui-underline"></div>
              <div className="ui-chip">
                <span>{t("info.locationLine")}</span>
              </div>
            </a>

            {/* Online Consultation → /book (preserve lang) */}
            <a href={withLang("/book")} className="ui-box ui-box--pretty ui-box--link" aria-labelledby="info-online-title">
              <div className="ui-box__head">
                <span className="ui-badge ui-badge--violet" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="6" width="14" height="12" rx="2"/><path d="M22 8l-6 4 6 4V8z"/>
                  </svg>
                </span>
                <h3 id="info-online-title" className="ui-box__title">{t("info.onlineTitle")}</h3>
              </div>
              <div className="ui-underline"></div>
              <div className="ui-chip">
                <span>{t("info.onlineLine")}</span>
              </div>
            </a>
          </section>

          <div id="about-services" className="anchor-offset" />
          {/* ABOUT */}
          <section id="about" className="section about" aria-labelledby="about-title">
            <div className="section__wrap about__grid">
              {/* Left: deep-blue panel with copy */}
              <div className="about__panel">
                <h2 id="about-title" className="section__kicker">{t("about.kicker")}</h2>
                <div className="about__rule" aria-hidden="true"></div>
                <h3 className="about__heading">{t("about.title")}</h3>
                <p>
                  {t("about.p1")}
                </p>
                <p>
                  {t("about.p2_beforeStrong")}
                  <strong>{t("about.p2_strong")}</strong>
                  {t("about.p2_afterStrong")}
                </p>
                <h4 className="about__sub">{t("about.awardsTitle")}</h4>
                <ul className="about__bullets">
                  {t("about.awards").map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>

              {/* Right: portrait + caption (replace image path) */}
              <figure className="about__figure">
                <img src="/DrAltayyeb2.png" alt="Dr Altayyeb Yousef" />
                <figcaption className="about__caption">
                  <strong>{t("profile.name")}</strong>
                  <span>{t("profile.title")}</span>
                </figcaption>
              </figure>
            </div>

          </section>

          {/* MEDICAL EDUCATION & TRAINING */}
          <section id="education" className="section edu" aria-labelledby="edu-title">
            <div className="section__wrap">
              <h2 id="edu-title" className="section__title section__title--center">
                {t("edu.title")}
              </h2>

              <p className="edu__intro">
                {t("edu.intro")}
              </p>

              {/* NEW two-column layout, photo on the left */}
              <div className="edu__layout edu__layout--photo">
                {/* Left: photo from /public (change the filename if needed) */}
                <aside className="edu__photo" aria-label={t("edu.title")}>
                  <img src="/Stans.jpg" alt="" />
                </aside>

                <div className="edu__grid">
                  {/* Internal Medicine */}
                  <article className="edu__card">
                    <header className="edu__head">
                      <h3 className="edu__h3">{t("edu.cards.internal.title")}</h3>
                    </header>
                    <ul className="edu__list">
                      {t("edu.cards.internal.items").map((li, i) => (
                        <li key={i}><span className="edu__tick" aria-hidden="true">✓</span>{li}</li>
                      ))}
                    </ul>
                  </article>

                  {/* Cardiology */}
                  <article className="edu__card">
                    <header className="edu__head">
                      <h3 className="edu__h3">{t("edu.cards.cardiology.title")}</h3>
                    </header>
                    <ul className="edu__list">
                      {t("edu.cards.cardiology.items").map((li, i) => (
                        <li key={i}><span className="edu__tick" aria-hidden="true">✓</span>{li}</li>
                      ))}
                    </ul>
                  </article>

                  {/* Interventional Cardiology */}
                  <article className="edu__card">
                    <header className="edu__head">
                      <h3 className="edu__h3">{t("edu.cards.interventional.title")}</h3>
                    </header>
                    <ul className="edu__list">
                      {t("edu.cards.interventional.items").map((li, i) => (
                        <li key={i}><span className="edu__tick" aria-hidden="true">✓</span>{li}</li>
                      ))}
                    </ul>
                  </article>

                  {/* Structural Heart & Valve Diseases */}
                  <article className="edu__card">
                    <header className="edu__head">
                      <h3 className="edu__h3">{t("edu.cards.structural.title")}</h3>
                    </header>
                    <ul className="edu__list">
                      {t("edu.cards.structural.items").map((li, i) => (
                        <li key={i}><span className="edu__tick" aria-hidden="true">✓</span>{li}</li>
                      ))}
                    </ul>
                  </article>
                </div>
              </div>
            </div>
          </section>

          <section id="services" className="section services anchor-offset-serv" aria-labelledby="services-title">
            <div className="section__wrap">
              <h2 id="services-title" className="section__title section__title--center">
                {t("services.title")}
              </h2>

              {/* NEW layout: left media + right services list */}
              <div className="services__layout">
                {/* Left: portrait video */}
                <aside className="services__media" aria-label={t("services.title")}>
                  <div className="portrait-frame">
                    {/* blurred poster behind to avoid black bars */}
                    <img className="portrait-bg" src="/assets/heart-portrait.jpg" alt="" aria-hidden="true" />
                    <video
                      className="portrait-vid"
                      poster="/assets/heart-portrait.jpg"
                      autoPlay
                      muted
                      loop
                      playsInline
                    >
                      <source src="/assets/heart-portrait.webm" type="video/webm" />
                      <source src="/Heart_Beat.mp4" type="video/mp4" />
                    </video>
                  </div>
                  {/* (optional) caption */}
                  {/* <p className="services__caption">Advanced diagnostics and compassionate care.</p> */}
                </aside>

                {/* Right: your existing services grid, a bit narrower */}
                <ol className="services__grid services__list services__grid--tight">
                  <li className="service-card">
                    <span className="service-card__num">1</span>
                    <h3 className="service-card__title">{t("services.items.consult")}</h3>
                  </li>
                  <li className="service-card">
                    <span className="service-card__num">2</span>
                    <h3 className="service-card__title">{t("services.items.valvular")}</h3>
                  </li>
                  <li className="service-card">
                    <span className="service-card__num">3</span>
                    <h3 className="service-card__title">{t("services.items.angiogram")}</h3>
                  </li>
                  <li className="service-card">
                    <span className="service-card__num">4</span>
                    <h3 className="service-card__title">{t("services.items.echo")}</h3>
                  </li>
                  <li className="service-card">
                    <span className="service-card__num">5</span>
                    <h3 className="service-card__title">{t("services.items.stress")}</h3>
                  </li>
                  <li className="service-card">
                    <span className="service-card__num">6</span>
                    <h3 className="service-card__title">{t("services.items.holter")}</h3>
                  </li>
                  <li className="service-card">
                    <span className="service-card__num">7</span>
                    <h3 className="service-card__title">{t("services.items.ecg")}</h3>
                  </li>
                  <li className="service-card">
                    <span className="service-card__num">8</span>
                    <h3 className="service-card__title">{t("services.items.abpm")}</h3>
                  </li>
                </ol>
              </div>
            </div>
          </section>

          {/* INSURANCE */}
          <section id="insurance" className="section insurance anchor-offset-Insu" aria-labelledby="insurance-title">
            <div className="section__wrap">
              <div className="ins__grid">
                {/* Left: logos */}
                <figure className="ins__logos" aria-label={t("insurance.title")}>
                  <img src="/gig-logo.png" alt="GIG Insurance" />
                  <img src="/globmed-logo.png" alt="GlobMed Insurance" />
                    <img src="/wapmed-logo.png"   alt="Warba Insurance" />   {/* NEW */}

                </figure>

                {/* Right: copy */}
                <div className="ins__copy">
                  <h2 id="insurance-title" className="section__title">{t("insurance.title")}</h2>
                  <p className="ins__lead">
                    {renderWithBrands(t("insurance.lead"))}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ===== VISIT & CONTACT ===== */}
          <section id="visit-contact" className="section anchor-offset">
            <div className="section__wrap visit__container">

              {/* Title BEFORE the block (matches CSS) */}
              <h2 id="location-title" className="section__title section__title--center">
                {t("location.title")}
              </h2>

              {/* LOCATION BLOCK */}
              <div id="location" className="visit__block anchor-offset-loc" aria-labelledby="location-title">
                <div className="visit__grid">
                  {/* LEFT: card + map (stacked) */}
                  <div className="visit__left">
                    <div className="visit__card">
                      <div className="section__kicker2">{t("location.kicker")}</div>
                      <h2 className="visit__title">{t("location.cardTitle")}</h2>

                      <p className="visit__address">{t("location.address")}</p>

                      <div className="visit__actions">
                        <a
                          className="btn--primary"
                          href="https://www.google.com/maps/search/?api=1&query=29.2592593%2C48.0850217"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {t("location.btnMap")}
                        </a>
                        <a className="btn visit__ghost" href="tel:+96591110420">{t("location.btnCall")}</a>
                      </div>
                    </div>

                    {/* Map below the card */}
                    <div className="visit__mapframe">
                      <iframe
                        title="Clinic location map"
                        src="https://www.google.com/maps?q=29.2592593,48.0850217&z=17&output=embed"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>

                  {/* RIGHT: clinic photo */}
                  <div className="visit__photo">
                    <img src="/Clinic2.jpeg" alt="Clinic building exterior" />
                  </div>
                </div>
              </div>

              {/* Title BEFORE the contact block (you already had this correct) */}
              <h2 id="contact-title" className="section__title section__title--center">
                {t("contact.title")}
              </h2>

              {/* CONTACT BLOCK */}
              <div id="contact" className="visit__block anchor-offset-loc" aria-labelledby="contact-title">
                <div className="visit__grid">
                  <div className="visit__card visit__note">
                    <div className="section__kicker2">{t("contact.kicker")}</div>
                    <h2 className="visit__title">{t("contact.heading")}</h2>
                    <p className="visit__lead">{t("contact.lead")}</p>
                    <ul className="visit__hours">
                      <li>{t("contact.hours1")}</li>
                      <li>{t("contact.hours2")}</li>
                      <li>{t("contact.hours3")}</li>
                    </ul>
                    <div className="visit__actions">
                      <a className="btn--primary" href="tel:+96591110420">{t("contact.call")}</a>
                    </div>
                  </div>

                  <form className="visit__form visit__form--blue" onSubmit={onContactSubmit}>
                    <div className="form-row">
                      <label htmlFor="vc-name">{t("form.fullName")}</label>
                      <input id="vc-name" name="name" required />
                    </div>
                    <div className="form-row">
                      <label htmlFor="vc-phone">{t("form.phone")}</label>
                      <input id="vc-phone" name="phone" type="tel" inputMode="tel" pattern="[\d+\s()\-]{6,}" required />
                    </div>
                    <div className="form-row">
                      <label htmlFor="vc-email">{t("form.email")}</label>
                      <input id="vc-email" name="email" type="email" />
                    </div>
                    <div className="form-row">
                      <label htmlFor="vc-msg">{t("form.message")}</label>
                      <textarea id="vc-msg" name="message" rows="5" required />
                    </div>
                    <input type="text" name="company" className="hp" tabIndex="-1" autoComplete="off" />
                    <button
                      type="submit"
                      className="btn--primary"
                      disabled={sending}
                      aria-busy={sending}
                    >
                      {sending ? (t("form.sending") || "Sending…") : t("form.send")}
                    </button>

                    <p className="visit__disclaimer">{t("form.disclaimer")}</p>
                  </form>
                </div>
              </div>
            </div>
          </section>

        </>
      )}

      <footer class="site-footer" id="footer">
        <div class="container footer__wrap">
          <div class="footer__info">
            <strong class="footer__brand">{t("footer.brand")}</strong>
            <div>{t("footer.addr")}</div>
            
            <div class="footer__contact">
              <a class="footer__tel" href="tel:+96591110420">
                <bdi>{t("footer.phone")}</bdi>
              </a>
              <a
                class="footer__wa badge"
                href="https://wa.me/96591110420?"
                target="_blank"
                rel="noopener"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 64 64" width="36" height="36" aria-hidden="true">
                  <defs>
                    <linearGradient id="waG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stop-color="#5EE676"/>
                      <stop offset="1" stop-color="#25D366"/>
                    </linearGradient>
                  </defs>

                  <rect x="1" y="6" width="50" height="50" rx="14" fill="url(#waG)"/>

                  <g transform="translate(7,10) scale(1.7)">
                    <path fill="#fff" d="M17.1 13.6c-.297-.149-1.758-.867-2.028-.967-.273-.101-.471-.149-.67.149-.198.297-.767.967-.941 1.165-.173.198-.347.223-.644.074-1.758-.867-2.91-1.549-4.046-3.503-.305-.524.305-.486.874-1.612.097-.198.049-.371-.025-.52-.075-.149-.669-1.611-.916-2.209-.242-.579-.487-.5-.67-.51l-.571-.01c-.198 0-.52.074-.792.372-.271.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.086 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a8.854 8.854 0 01-4.51-1.234l-.323-.192-3.351.878.894-3.257-.211-.334a8.86 8.86 0 01-1.362-4.71c.001-4.866 3.957-8.822 8.826-8.822 2.359 0 4.568.919 6.228 2.579a8.76 8.76 0 012.593 6.243c-.003 4.867-3.959 8.823-8.83 8.823M19.08 4.926A10.573 10.573 0 0012.05 2c-5.87 0-10.64 4.76-10.642 10.631a10.57 10.57 0 001.437 5.345L2 22l4.124-1.086a10.61 10.61 0 004.905 1.251h.004c5.871 0 10.64-4.76 10.642-10.631a10.59 10.59 0 00-3.535-7.608"/>
                  </g>
                </svg>
              </a>


            </div>
            
            </div>

          <nav class="footer__nav">
            <div class="footer__social" aria-label="Social links">
              <a class="social__btn" href="https://instagram.com/dr_altayyeb/" target="_blank" rel="noopener" aria-label="Instagram">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zM18 6.8a1 1 0 1 0 1 1 1 1 0 0 0-1-1z"/></svg>
              </a>
              <a class="social__btn" href="https://x.com/6ayyeboon" target="_blank" rel="noopener" aria-label="X">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h3.4l6.1 7.7L16.8 3H21l-7.2 9.2L21 21h-3.4l-6.5-8.2L7.2 21H3l7.6-9.7L3 3z"/></svg>
              </a>
            </div>
          </nav>
        </div>

        <div class="footer__bottom">
          <div class="container">
            <small><bdi>{t("footer.copyright")}</bdi></small>
          </div>
        </div>
      </footer>

    </>
  );
}
