/* =========================================================
   Felles hjelpefunksjoner + modalvindu for turdetaljer
   Brukes av forsiden og påmeldingssiden.
   ========================================================= */

/* ---------- Dato ---------- */
function finnMandag(dato) {
  const d = new Date(dato);
  const ukedag = (d.getDay() + 6) % 7; // mandag = 0
  d.setDate(d.getDate() - ukedag);
  d.setHours(0, 0, 0, 0);
  return d;
}
function leggTilDager(dato, antall) {
  const d = new Date(dato);
  d.setDate(d.getDate() + antall);
  return d;
}
function sammeDag(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function ukenummer(dato) { // ISO 8601
  const d = new Date(Date.UTC(dato.getFullYear(), dato.getMonth(), dato.getDate()));
  const dag = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dag);
  const aarStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - aarStart) / 86400000 + 1) / 7);
}
const fmtUkedag = new Intl.DateTimeFormat("nb-NO", { weekday: "long" });
const fmtKortDato = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short" });
const fmtLangDato = new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long" });
const fmtTid = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit" });

function sluttTid(tur) { return new Date(tur.start.getTime() + tur.varighetMin * 60000); }
function formaterVarighet(min) {
  const t = Math.floor(min / 60), m = min % 60;
  if (!t) return `${m} min`;
  return m ? `${t} t ${m} min` : `${t} time${t > 1 ? "r" : ""}`;
}
function ledigePlasser(tur) { return Math.max(0, tur.plasserTotalt - tur.antallPameldt); }
function plassStatus(tur) {
  const ledig = ledigePlasser(tur);
  if (ledig === 0) return "full";
  if (ledig <= 3) return "fa";
  return "ledig";
}
function erPassert(tur) { return tur.start < new Date(); }
/* Værmelding vises bare hvis turen er innen de fire neste dagene */
function innenFireDager(tur) {
  const naa = new Date();
  return tur.start >= naa && tur.start - naa <= 4 * 24 * 60 * 60 * 1000;
}

function lagElement(tag, attrs = {}, ...barn) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") el.className = v;
    else if (k === "text") el.textContent = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v);
  }
  barn.flat().forEach(b => b != null && el.append(b));
  return el;
}

/* ---------- Toast-melding ---------- */
function visToast(tekst) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = lagElement("div", { class: "toast", role: "status", "aria-live": "polite" });
    document.body.append(t);
  }
  t.textContent = tekst;
  t.classList.add("vis");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("vis"), 4000);
}

/* ---------- Modalvindu ---------- */
const modal = (() => {
  const dialog = lagElement("dialog", { class: "modal", id: "tur-modal", "aria-labelledby": "modal-tittel" });
  document.body.append(dialog);

  // Lukk ved klikk utenfor innholdet (på bakgrunnen)
  dialog.addEventListener("click", e => {
    if (e.target === dialog) dialog.close();
  });

  function detalj(ikon, tittel, verdi, bred) {
    return lagElement("div", { class: bred ? "bred" : "" },
      lagElement("span", { class: "ikon", "aria-hidden": "true", text: ikon }),
      lagElement("dt", { text: tittel }),
      lagElement("dd", { text: verdi })
    );
  }

  function vaerBoks(tur) {
    if (erPassert(tur)) return null;
    if (!innenFireDager(tur)) {
      return lagElement("p", { class: "vaer-ingen", text: "🌤️ Værmelding vises når det er fire dager eller mindre til turen." });
    }
    const v = hentEksempelVaer(tur); // TODO back-end: GET /api/vaer?tidspunkt=...
    return lagElement("section", { class: "vaer", "aria-label": "Værmelding for turen" },
      lagElement("span", { class: "vaerikon", "aria-hidden": "true", text: v.ikon }),
      lagElement("div", {},
        lagElement("div", { class: "temp", text: `${v.temp}° · ${v.tekst}` }),
        lagElement("div", { class: "vaerdata" },
          lagElement("span", { text: `💨 ${v.vind} m/s` }),
          lagElement("span", { text: `💧 ${String(v.nedbor).replace(".", ",")} mm` })
        )
      ),
      lagElement("p", { class: "kilde", text: "Eksempeldata – skal hentes fra Meteorologisk institutt (yr.no)." })
    );
  }

  function vis(tur) {
    const ledig = ledigePlasser(tur);
    const status = plassStatus(tur);
    const passert = erPassert(tur);
    const prosent = Math.round((tur.antallPameldt / tur.plasserTotalt) * 100);

    const hodeMerke = tur.avlyst ? lagElement("span", { class: "merkelapp", text: "Avlyst" })
      : passert ? lagElement("span", { class: "merkelapp merkelapp-gra", text: "Gjennomført" })
      : tur.endret ? lagElement("span", { class: "merkelapp", text: "Endret" }) : null;

    let knapp;
    if (tur.avlyst || passert) {
      knapp = lagElement("button", { class: "knapp knapp-primar", disabled: "", text: passert ? "Turen er gjennomført" : "Turen er avlyst" });
    } else if (ledig === 0) {
      knapp = lagElement("button", { class: "knapp knapp-primar", disabled: "", text: "Fullt – ingen ledige plasser" });
    } else {
      // Skjemaet er klart for back-end: POST /api/pameldinger med tur_id
      knapp = lagElement("form", { action: "/api/pameldinger", method: "post", class: "pameldingsskjema" },
        lagElement("input", { type: "hidden", name: "tur_id", value: tur.id }),
        lagElement("button", { type: "submit", class: "knapp knapp-primar", text: "Meld meg på" })
      );
      knapp.addEventListener("submit", e => {
        e.preventDefault(); // Fjernes når back-end er på plass
        visInnlogging(tur);
      });
    }

    dialog.replaceChildren(
      lagElement("header", { class: "modal-hode" },
        hodeMerke,
        lagElement("h2", { id: "modal-tittel", text: tur.navn }),
        lagElement("div", { class: "dato", text: `${fmtLangDato.format(tur.start)} · kl. ${fmtTid.format(tur.start)}–${fmtTid.format(sluttTid(tur))}` }),
        lagElement("button", { class: "modal-lukk", "aria-label": "Lukk", text: "×", onclick: () => dialog.close() })
      ),
      lagElement("div", { class: "modal-kropp" },
        tur.endret ? lagElement("p", { class: "endringsmelding", role: "note" }, lagElement("strong", { text: "Endring: " }), tur.endret) : null,
        lagElement("div", { class: `plassmaler ${status}` },
          lagElement("div", { class: "tall" },
            lagElement("span", {}, lagElement("strong", { text: ledig }), ` ledige plasser av ${tur.plasserTotalt}`),
            lagElement("span", { class: "personvern", text: `${tur.antallPameldt} påmeldt` })
          ),
          lagElement("div", { class: "stolpe", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": tur.plasserTotalt, "aria-valuenow": tur.antallPameldt, "aria-label": "Påmeldte" },
            lagElement("div", { class: "fyll", style: `width:${prosent}%` }))
        ),
        lagElement("dl", { class: "detaljer" },
          detalj("📅", "Dato og tid", `${fmtKortDato.format(tur.start)}, kl. ${fmtTid.format(tur.start)}`),
          detalj("⏱️", "Varighet", formaterVarighet(tur.varighetMin)),
          detalj("🧭", "Turleder", tur.turleder, true),
          detalj("📍", "Oppmøte / start", tur.startsted),
          detalj("🥾", "Turen går", tur.rute)
        ),
        tur.ekstraInfo.length ? lagElement("h3", { text: "Ekstra informasjon" }) : null,
        tur.ekstraInfo.length ? lagElement("ul", { class: "ekstra" }, tur.ekstraInfo.map(i => lagElement("li", { text: i }))) : null,
        vaerBoks(tur)
      ),
      lagElement("footer", { class: "modal-fot" },
        lagElement("p", { class: "personvern" }, "🔒 Av personvernhensyn vises bare antall påmeldte, ikke hvem."),
        knapp
      )
    );

    if (!dialog.open) dialog.showModal();
    dialog.querySelector(".modal-lukk").focus();
  }

  /* Placeholder-steg: påmelding krever innlogging med ID-porten */
  function visInnlogging(tur) {
    const kropp = dialog.querySelector(".modal-kropp");
    kropp.replaceChildren(
      lagElement("div", { class: "bekreft" },
        lagElement("div", { class: "ikon", "aria-hidden": "true", text: "🔐" }),
        lagElement("h3", { text: "Logg inn for å bekrefte påmeldingen" }),
        lagElement("p", { text: `Du melder deg på «${tur.navn}» ${fmtLangDato.format(tur.start)} kl. ${fmtTid.format(tur.start)}. For å beskytte personvernet ditt bruker vi ID-porten.` }),
        lagElement("a", { class: "knapp knapp-idporten", href: "#idporten", onclick: e => { e.preventDefault(); visToast("ID-porten kobles til i back-end (placeholder)."); }, text: "Logg inn med ID-porten" })
      )
    );
    dialog.querySelector(".modal-fot").replaceChildren(
      lagElement("button", { class: "knapp knapp-sekundar", text: "← Tilbake til turen", onclick: () => vis(tur) }),
      lagElement("p", { class: "personvern", text: "Du kan melde deg av igjen når som helst." })
    );
  }

  return { vis, lukk: () => dialog.close() };
})();

/* ---------- Innloggingsknapp i toppmenyen (placeholder) ---------- */
document.addEventListener("click", e => {
  const lenke = e.target.closest("[data-idporten]");
  if (lenke) {
    e.preventDefault();
    visToast("Innlogging med ID-porten kobles til i back-end (placeholder).");
  }
});
