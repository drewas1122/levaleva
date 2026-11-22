/* =========================================================
   Ny tur (ansatte) – live forhåndsvisning + placeholder-innsending
   ========================================================= */

(function () {
  const skjema = document.getElementById("ny-tur-skjema");
  const vis = sel => document.querySelector(`[data-vis="${sel}"]`);

  // Tidligste dato = i dag
  const datoFelt = skjema.dato;
  const idag = new Date();
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  datoFelt.min = iso(idag);
  datoFelt.value = iso(leggTilDager(idag, 1));

  function oppdater() {
    const f = skjema;
    vis("navn").textContent = f.navn.value.trim() || "Navn på tur";
    vis("sted").textContent = `📍 ${f.startsted.value.trim() || "Startsted"}`;
    vis("rute").textContent = `🥾 ${f.rute.value.trim() || "Rute"}`;
    const plasser = Number(f.plasser_totalt.value) || 0;
    vis("info").textContent = `⏱️ ${formaterVarighet(Number(f.varighet_min.value))} · ${plasser} av ${plasser} ledige`;
    const leder = f.turleder_id.selectedOptions[0];
    vis("leder").textContent = `🧭 ${f.turleder_id.value ? leder.textContent : "Turleder"}`;

    if (f.dato.value && f.starttid.value) {
      const d = new Date(`${f.dato.value}T${f.starttid.value}`);
      vis("dato").textContent = `${fmtLangDato.format(d)} · kl. ${fmtTid.format(d)}`;
    } else {
      vis("dato").textContent = "Velg dato og tid";
    }

    const valgt = [...f.querySelectorAll('input[name="ekstra[]"]:checked')].map(c => c.value);
    vis("ekstra").replaceChildren(...valgt.map(v => lagElement("li", { text: v })));
  }

  skjema.addEventListener("input", oppdater);
  skjema.addEventListener("change", oppdater);
  skjema.addEventListener("reset", () => setTimeout(oppdater, 0));

  skjema.addEventListener("submit", e => {
    e.preventDefault(); // Fjernes / erstattes med fetch() når back-end er klar
    if (!skjema.checkValidity()) {
      skjema.reportValidity();
      return;
    }
    const data = Object.fromEntries(new FormData(skjema));
    data.ekstra = new FormData(skjema).getAll("ekstra[]");
    delete data["ekstra[]"];
    console.log("Data som skal sendes til POST /api/turer:", data);
    visToast(`«${data.navn}» er klar til å sendes – lagring kobles til i back-end.`);
  });

  oppdater();
})();
