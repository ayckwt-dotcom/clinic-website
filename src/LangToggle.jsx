export default function LangToggle({ lang, setLang }) {
  const isAR = lang === "ar";
  const next = () => setLang(isAR ? "en" : "ar");

  return (
    <div className="lang-switch" role="group" aria-label="Language switch">
      <span className={`lang-switch__label ${!isAR ? "is-active" : ""}`}>EN</span>

      <button
        type="button"
        className={`lang-switch__btn ${isAR ? "is-ar" : ""}`}
        onClick={next}
        aria-pressed={isAR}
        aria-label={isAR ? "Switch to English" : "التبديل إلى العربية"}
      >
        <span className="lang-switch__knob" />
      </button>

      <span className={`lang-switch__label ${isAR ? "is-active" : ""}`}>AR</span>
    </div>
  );
}
