/* =========================================================
   EKSEMPELDATA (placeholder)
   ---------------------------------------------------------
   I ferdig løsning hentes dette fra back-end, f.eks.:
     GET /api/turer?fra=2026-11-23&til=2026-11-29
   Hver tur bør ha samme feltnavn som under, så resten av
   koden fungerer uten endringer.

   Merk: API-et skal KUN returnere antall påmeldte
   (antallPameldt) – aldri navn på hvem som er påmeldt.
   ========================================================= */

const TURLEDERE = [
  "Kari Nordmo (fysioterapeut)",
  "Ola Skjelstad (lege)",
  "Ingrid Haugan (sykepleier)",
  "Mats Ekle (tannpleier)",
  "Siri Lyngstad (ergoterapeut)"
];

/* Turene lages relativt til mandag denne uka, slik at
   kalenderen alltid har eksempelinnhold, uansett dato. */
function lagEksempelturer() {
  const mandag = finnMandag(new Date());

  // dag = antall dager etter mandag denne uka (0–13)
  const maler = [
    { dag: 0, tid: "10:00", navn: "Morgentur rundt Levangerelva", varighet: 60, leder: 0, start: "LevaLeva, hovedinngangen", rute: "Langs Levangerelva til Moan og tilbake", plasser: 15, pameldt: 9, info: ["Tilrettelagt for rullestol", "Flatt terreng"] },
    { dag: 1, tid: "13:00", navn: "Staven-tur med kaffe", varighet: 90, leder: 2, start: "Parkeringen ved Levanger kirke", rute: "Opp til utsiktspunktet på Staven", plasser: 12, pameldt: 12, info: ["Kaffepause på toppen", "Ta med staver om du har"] },
    { dag: 2, tid: "09:30", navn: "Rolig gåtur i sentrum", varighet: 45, leder: 4, start: "Torget i Levanger", rute: "Trehusbyen – Sjøsiden – Torget", plasser: 20, pameldt: 6, info: ["Tilrettelagt for rullestol", "Benker underveis"] },
    { dag: 3, tid: "17:00", navn: "Ettermiddagstur Røstadmarka", varighet: 75, leder: 1, start: "Røstad, ved Nord universitet", rute: "Lysløypa i Røstadmarka", plasser: 15, pameldt: 13, info: ["Hodelykt anbefales", "Grus og skogsti"] },
    { dag: 4, tid: "11:00", navn: "Fjæretur Eidsbotn", varighet: 60, leder: 3, start: "Eidsbotn badeplass", rute: "Langs fjæra mot Hylla", plasser: 12, pameldt: 4, info: ["Fruktpause ved gapahuken"] },
    { dag: 6, tid: "12:00", navn: "Søndagstur til Hoklingen", varighet: 120, leder: 0, start: "Parkering Hoklingen", rute: "Rundt Hoklingen", plasser: 18, pameldt: 11, info: ["Matpakkepause ved gapahuken", "Barnevennlig"] },

    { dag: 7, tid: "10:00", navn: "Morgentur rundt Levangerelva", varighet: 60, leder: 0, start: "LevaLeva, hovedinngangen", rute: "Langs Levangerelva til Moan og tilbake", plasser: 15, pameldt: 7, info: ["Tilrettelagt for rullestol", "Flatt terreng"] },
    { dag: 7, tid: "14:00", navn: "Trim for knær og hofter", varighet: 45, leder: 4, start: "LevaLeva, gymsalen (inne)", rute: "Innendørs – enkel styrke og balanse", plasser: 10, pameldt: 10, info: ["Innendørs", "Tilrettelagt for rullestol"] },
    { dag: 8, tid: "13:00", navn: "Staven-tur med kaffe", varighet: 90, leder: 2, start: "Parkeringen ved Levanger kirke", rute: "Opp til utsiktspunktet på Staven", plasser: 12, pameldt: 5, info: ["Kaffepause på toppen", "Ta med staver om du har"],
      endret: "Oppmøtested er flyttet til parkeringen ved kirken på grunn av veiarbeid." },
    { dag: 9, tid: "09:30", navn: "Rolig gåtur i sentrum", varighet: 45, leder: 4, start: "Torget i Levanger", rute: "Trehusbyen – Sjøsiden – Torget", plasser: 20, pameldt: 3, info: ["Tilrettelagt for rullestol", "Benker underveis"] },
    { dag: 10, tid: "17:00", navn: "Ettermiddagstur Røstadmarka", varighet: 75, leder: 1, start: "Røstad, ved Nord universitet", rute: "Lysløypa i Røstadmarka", plasser: 15, pameldt: 2, info: ["Hodelykt anbefales", "Grus og skogsti"] },
    { dag: 11, tid: "11:00", navn: "Fjæretur Eidsbotn", varighet: 60, leder: 3, start: "Eidsbotn badeplass", rute: "Langs fjæra mot Hylla", plasser: 12, pameldt: 0, info: ["Fruktpause ved gapahuken"] },
    { dag: 12, tid: "10:30", navn: "Lørdagstur Ekle", varighet: 150, leder: 1, start: "Ekle, parkering ved Ekletjønna", rute: "Ekletjønna – Ekleberget (300 moh.)", plasser: 15, pameldt: 8, info: ["Noe stigning", "Varm drikke ved bålplassen"],
      avlyst: false },
    { dag: 13, tid: "12:00", navn: "Søndagstur til Hoklingen", varighet: 120, leder: 0, start: "Parkering Hoklingen", rute: "Rundt Hoklingen", plasser: 18, pameldt: 1, info: ["Matpakkepause ved gapahuken", "Barnevennlig"] }
  ];

  return maler.map((m, i) => {
    const [t, min] = m.tid.split(":").map(Number);
    const start = leggTilDager(mandag, m.dag);
    start.setHours(t, min, 0, 0);
    return {
      id: i + 1,
      navn: m.navn,
      start,                       // Date-objekt (fra back-end: ISO-streng)
      varighetMin: m.varighet,
      turleder: TURLEDERE[m.leder],
      startsted: m.start,
      rute: m.rute,
      plasserTotalt: m.plasser,
      antallPameldt: m.pameldt,    // kun antall – aldri navn
      ekstraInfo: m.info,
      endret: m.endret || null,
      avlyst: !!m.avlyst
    };
  });
}

/* Eksempel-værmelding. Erstattes med kall til back-end,
   som igjen henter fra MET/yr (api.met.no) for Levanger. */
function hentEksempelVaer(tur) {
  const varianter = [
    { ikon: "☀️", tekst: "Klarvær", temp: 2, vind: 3, nedbor: 0 },
    { ikon: "⛅", tekst: "Delvis skyet", temp: 1, vind: 4, nedbor: 0 },
    { ikon: "☁️", tekst: "Skyet", temp: 3, vind: 5, nedbor: 0.2 },
    { ikon: "🌧️", tekst: "Lett regn", temp: 4, vind: 6, nedbor: 1.8 },
    { ikon: "🌨️", tekst: "Snøbyger", temp: -2, vind: 5, nedbor: 2.4 }
  ];
  return varianter[tur.id % varianter.length];
}

const TURER = lagEksempelturer();
