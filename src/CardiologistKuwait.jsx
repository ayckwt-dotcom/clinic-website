// src/CardiologistKuwait.jsx
import { useHead } from "./seo";

export default function CardiologistKuwait({ lang }) {
  // Per-page SEO (visible in head, not on screen)
  useHead({
    title:
      lang === "en"
        ? "Cardiologist in Kuwait | Dr Altayyeb Yousef"
        : "طبيب قلب في الكويت | د. الطيب يوسف",
    description:
      lang === "en"
        ? "Interventional cardiology, coronary heart disease, valve diseases, echocardiogram (Echo). Book an appointment in Sabah Al-Salem."
        : "قسطرة القلب، أمراض الشرايين التاجية، أمراض الصمامات، الإيكو. احجز موعدك في صباح السالم.",
    canonical: "https://www.6ayyeboon.com/cardiologist-kuwait",
    alternates: [
      { hreflang: "ar-KW", href: "https://www.6ayyeboon.com/cardiologist-kuwait?lang=ar" },
      { hreflang: "en",    href: "https://www.6ayyeboon.com/cardiologist-kuwait?lang=en" },
      { hreflang: "x-default", href: "https://www.6ayyeboon.com/cardiologist-kuwait" }
    ]
  });

  // All content is sr-only → no visual change
  return (
    <section aria-label={lang==="en" ? "Cardiologist in Kuwait" : "طبيب قلب في الكويت"}>
      <div className="sr-only">
        <h1>{lang === "en" ? "Cardiologist in Kuwait" : "طبيب قلب في الكويت"}</h1>
        <p>
          {lang === "en"
            ? "Dr Altayyeb Yousef is a Kuwaiti consultant cardiologist specializing in interventional cardiology, treating coronary heart disease and valve diseases, and providing echocardiogram (Echo), stress testing, Holter and ABPM in Sabah Al-Salem."
            : "الدكتور الطيب يوسف استشاري قلب كويتي مختص في القسطرة القلبية، يعالج أمراض الشرايين التاجية وأمراض الصمامات، ويقدم فحوصات الإيكو، اختبار الجهد، الهولتر وقياس الضغط 24 ساعة في صباح السالم."}
        </p>
        <p>
          {lang === "en"
            ? "Book your appointment online or via phone at 91110420."
            : "احجز موعدك عبر الموقع أو بالاتصال على 91110420."}
        </p>
        <a href={lang === "en" ? "/book?lang=en" : "/book?lang=ar"}>
          {lang === "en" ? "Book appointment" : "احجز موعدك"}
        </a>
      </div>
    </section>
  );
}
