/* =========================================================
   Ukekalender – denne uka og neste uke, med bla-funksjon
   ========================================================= */

(function () {
  const rot = document.getElementById("kalender");
  if (!rot) return;

  const MAKS_UKER_FREM = 3;          // hvor langt fram man kan bla
  const denneMandag = finnMandag(new Date());
  let ukeIndeks = 0;                 // 0 = denne uka, 1 = neste uke …

  const ukeGrid = rot.querySelector(".uke");
  const ukeTittel = rot.querySelector("[data-uke-tittel]");
  const ukePeriode = rot.querySelector("[data-uke-periode]");
  const knappForrige = rot.querySelector("[data-forrige]");
  const knappNeste = rot.querySelector("[data-neste]");
  const faner = rot.querySelectorAll("[data-fane]");

  function turerForDag(dag) {
    // TODO back-end: hent turene for valgt uke med fetch("/api/turer?...")
    return TURER.filter(t => sammeDag(t.start, dag)).sort((a, b) => a.start - b.start);
  }

  function turKnapp(tur) {
    const status = plassStatus(tur);
    const ledig = ledigePlasser(tur);
    const klasser = ["tur-knapp",
      status === "fa" ? "fa-plasser" : "", status === "full" ? "full" : "",
      tur.endret ? "endret" : "", tur.avlyst ? "avlyst" : ""].filter(Boolean).join(" ");
    const plassTekst = tur.avlyst ? "Avlyst" : ledig === 0 ? "Fullt" : `${ledig} av ${tur.plasserTotalt} ledige`;

    return lagElement("li", {},
      lagElement("button", {
        class: klasser, type: "button", "data-tur-id": tur.id,
        "aria-haspopup": "dialog",
        "aria-label": `${tur.navn}, kl. ${fmtTid.format(tur.start)}, ${plassTekst}. Åpne detaljer.`,
        onclick: () => modal.vis(tur)
      },
        lagElement("span", { class: "tid", text: `kl. ${fmtTid.format(tur.start)}` }),
        lagElement("span", { class: "navn", text: tur.navn }),
        lagElement("span", { class: "plasser", text: plassTekst })
      )
    );
  }

  function tegn() {
    const mandag = leggTilDager(denneMandag, ukeIndeks * 7);
    const sondag = leggTilDager(mandag, 6);
    const idag = new Date();

    ukeTittel.textContent = ukeIndeks === 0 ? `Denne uka · uke ${ukenummer(mandag)}`
      : ukeIndeks === 1 ? `Neste uke · uke ${ukenummer(mandag)}`
      : `Uke ${ukenummer(mandag)}`;
    ukePeriode.textContent = `${fmtKortDato.format(mandag)} – ${fmtKortDato.format(sondag)} ${sondag.getFullYear()}`;

    knappForrige.disabled = ukeIndeks === 0;
    knappNeste.disabled = ukeIndeks === MAKS_UKER_FREM;
    faner.forEach(f => f.setAttribute("aria-pressed", String(Number(f.dataset.fane) === ukeIndeks)));

    const dager = [];
    let antallTurer = 0;
    for (let i = 0; i < 7; i++) {
      const dag = leggTilDager(mandag, i);
      const turer = turerForDag(dag);
      antallTurer += turer.length;
      const passert = dag < finnDagStart(idag);
      dager.push(lagElement("section", {
        class: `dag${sammeDag(dag, idag) ? " i-dag" : ""}${passert ? " passert" : ""}`,
        "aria-label": fmtLangDato.format(dag)
      },
        lagElement("header", { class: "dag-hode" },
          lagElement("span", { class: "ukedag", text: fmtUkedag.format(dag) }),
          lagElement("span", { class: "dato", text: fmtKortDato.format(dag) })
        ),
        lagElement("ul", { class: "dag-turer" },
          turer.length ? turer.map(turKnapp) : lagElement("li", { class: "ingen-turer", text: "Ingen turer" }))
      ));
    }

    if (antallTurer === 0) {
      ukeGrid.replaceChildren(lagElement("div", { class: "tom-uke" },
        lagElement("p", {}, lagElement("strong", { text: "Ingen turer er lagt ut for denne uka ennå." })),
        lagElement("p", { text: "Turene publiseres vanligvis to uker i forveien. Se innom igjen senere!" })
      ));
    } else {
      ukeGrid.replaceChildren(...dager);
    }
  }

  function finnDagStart(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }

  knappForrige.addEventListener("click", () => { if (ukeIndeks > 0) { ukeIndeks--; tegn(); } });
  knappNeste.addEventListener("click", () => { if (ukeIndeks < MAKS_UKER_FREM) { ukeIndeks++; tegn(); } });
  faner.forEach(f => f.addEventListener("click", () => { ukeIndeks = Number(f.dataset.fane); tegn(); }));

  // Piltaster for å bla mellom uker når kalenderen har fokus
  rot.addEventListener("keydown", e => {
    if (e.target.closest("button.tur-knapp")) return;
    if (e.key === "ArrowRight" && !knappNeste.disabled) knappNeste.click();
    if (e.key === "ArrowLeft" && !knappForrige.disabled) knappForrige.click();
  });

  tegn();
})();

/* Kommende turer på forsiden (de neste tre med ledig plass) */
(function () {
  const liste = document.getElementById("kommende-turer");
  if (!liste) return;
  const naa = new Date();
  const neste = TURER.filter(t => t.start > naa && !t.avlyst).sort((a, b) => a.start - b.start).slice(0, 3);
  liste.replaceChildren(...neste.map(tur => {
    const ledig = ledigePlasser(tur);
    return lagElement("button", { class: "turkort", type: "button", "aria-haspopup": "dialog", onclick: () => modal.vis(tur) },
      lagElement("span", { class: "dato", text: `${fmtLangDato.format(tur.start)} · kl. ${fmtTid.format(tur.start)}` }),
      lagElement("h3", { text: tur.navn }),
      lagElement("span", { class: "meta", text: `📍 ${tur.startsted}` }),
      lagElement("span", { class: "meta", text: `⏱️ ${formaterVarighet(tur.varighetMin)} · ${ledig ? `${ledig} av ${tur.plasserTotalt} ledige` : "Fullt"}` })
    );
  }));
})();
