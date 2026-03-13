// BookingPage2.jsx
import { useState } from "react";
import { makeT } from "./i18n";
import { useHead } from "./seo";
import { convSubmitAppt } from "./ads"; // ⬅️ Imported from your new central hub

const API_BASE = ""; // same-origin: calls your Vercel function at /api/submit-request

// Convert Arabic-Indic digits → 0–9, then strip non-digits
const normalizeDigits = (s) => {
  const map = {
    '٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9',
    '۰':'0','۱':'1','۲':'2','۳':'3','۴':'4','۵':'5','۶':'6','۷':'7','۸':'8','۹':'9'
  };
  const converted = s.replace(/[٠-٩۰-۹]/g, ch => map[ch]);
  return converted.replace(/\D/g, "");
};

export default function BookingPage2({ lang }) {
  const t = makeT(lang);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ⬇️ Only "required" checks now (no fixed length)
  const getErrors = () => {
    const e = {};
    if (!name.trim()) e.name = t("book.errors.nameReq") || "Full name is required.";
    if (!mobile.trim()) e.mobile = t("book.errors.mobileReq") || "Mobile number is required.";
    return e;
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    setErrors((p) => ({ ...p, name: undefined }));
  };
  const handleNameBlur = () => {
    if (!name.trim())
      setErrors((p) => ({ ...p, name: t("book.errors.nameReq") || "Full name is required." }));
    else setErrors((p) => ({ ...p, name: undefined }));
  };

  const handleMobileChange = (e) => {
    const val = normalizeDigits(e.target.value);
    setMobile(val);
    setErrors((p) => ({ ...p, mobile: undefined }));
  };
  const handleMobileBlur = () => {
    if (!mobile.trim())
      setErrors((p) => ({ ...p, mobile: t("book.errors.mobileReq") || "Mobile number is required." }));
    else setErrors((p) => ({ ...p, mobile: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const eMap = getErrors();
    setErrors(eMap);
    if (Object.keys(eMap).length) {
      if (eMap.name) document.getElementById("bk2-name")?.focus();
      else if (eMap.mobile) document.getElementById("bk2-mobile")?.focus();
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/submit-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: name.trim(), mobile })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.msg || "Failed to submit");
      
      // ⬅️ Calls the tracking function from ads.js only if submission is successful
      convSubmitAppt(); 
      
      alert("📨 Submitted! We’ll contact you during working hours.");
      setName("");
      setMobile("");
      setErrors({});
    } catch (err) {
      alert(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const primaryLabel = t("book.actions.submit") || "Submit Request";
  const disableBtn = loading;

  useHead({
    title: "احجز موعدك أونلاين | 6ayyeboon Clinic",
    description:
      "أرسل طلب الحجز عبر الموقع وسنتواصل معك خلال ساعات العمل لتأكيد الموعد. متاح استشارة أونلاين.",
    canonical: "https://www.6ayyeboon.com/book",
    favVersion: "4"
  });

  return (
    <main className="section book" aria-labelledby="book-title">
      <div className="section__wrap book__wrap">
        <h1 id="book-title" className="section__title section__title--center">
          {t("book.title") || "Book Appointment"}
        </h1>

        <form className="book__form visit__form visit__form--blue" onSubmit={onSubmit} noValidate>
          {/* Online consultation note */}
          <p className="book__note">
            {t("book.noteText")}{" "}
            <a
              href="https://zoom.us/download"
              target="_blank"
              rel="noopener noreferrer"
              className="book__note-link"
            >
              {t("book.noteLink")}
            </a>.
          </p>

          {/* Full name */}
          <div className="form-row">
            <label htmlFor="bk2-name">{t("book.fields.nameLabel") || "Patient full name"}</label>
            <input
              id="bk2-name"
              value={name}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              placeholder={t("book.fields.namePh") || "e.g., Ahmed Ali"}
              required
              aria-invalid={!!errors.name}
            />
            {errors.name && <small className="form-err">{errors.name}</small>}
          </div>

          {/* Mobile */}
          <div className="form-row">
            <label htmlFor="bk2-mobile">{t("book.fields.mobileLabel") || "Mobile number"}</label>
            <input
              id="bk2-mobile"
              type="tel"
              autoComplete="tel"
              value={mobile}
              onChange={handleMobileChange}
              onBlur={handleMobileBlur}
              inputMode="numeric"
              placeholder={t("book.fields.mobilePh") || "e.g., 99xxxxxx"}
              dir={lang === "ar" ? "rtl" : "ltr"}
              required
              aria-invalid={!!errors.mobile}
              aria-describedby="bk2-mobile-note"
            />
            {errors.mobile && <small className="form-err">{errors.mobile}</small>}

            <p id="bk2-mobile-note" className="book__hint" style={{ marginTop: "6px" }}>
              {t("book.request.note") ||
                (lang === "ar"
                  ? "بعد إرسال الطلب، سيتواصل معك فريقنا خلال ساعات العمل لتأكيد الحجز."
                  : "After you submit the request, our team will contact you during working hours to confirm your booking.")}
            </p>
          </div>

          {/* Actions */}
          <div className="book__actions">
            <button className={`btn--primary ${loading ? "loading" : ""}`} type="submit" disabled={disableBtn} aria-busy={loading}>
              {loading ? (t("book.actions.loading") || "Submitting...") : primaryLabel}
            </button>
            <a className="visit__ghost" href="/">{t("book.actions.back") || "Back to Home"}</a>
          </div>
        </form>
      </div>
    </main>
  );
}