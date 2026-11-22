# LevaLeva – påmelding til trimturer (front-end)

Åpne `index.html` i nettleseren. Ingen installasjon trengs.

## Sider
| Fil | Innhold |
|---|---|
| `index.html` | Forside: intro, «slik fungerer det», kommende turer (åpner modal), personvern |
| `pamelding.html` | Ukeplan (denne og neste uke, bla med ‹ › eller faner), modalvindu med turinfo og «Meld meg på» |
| `ny-tur.html` | For ansatte: skjema for ny tur med live forhåndsvisning |

## Filer
- `css/style.css` – felles design for alle sider («oppslagstavle»: rutepapir, post-it-lapper, håndskrift; blått fra logoen)
- `js/felles.js` – datohjelpere og modalvinduet (`<dialog>`)
- `js/data.js` – **eksempeldata** for turer og vær (erstattes av back-end)
- `js/kalender.js` – ukekalender og «kommende turer»
- `js/ny-tur.js` – forhåndsvisning og innsending av ny tur
- `img/logo.png` – offisiell LevaLeva-logo (stående, brukes i bunnteksten)
- `img/logo-liggende.png` – liggende versjon til toppmenyen (laget av delene i den offisielle logoen)
- `img/favicon.png` – ikon i nettleserfanen (korset fra logoen)

## Klart for back-end (merket med `TODO back-end` i koden)
| Funksjon | Forslag til endepunkt | Hvor |
|---|---|---|
| Hente turer for en uke | `GET /api/turer?fra=…&til=…` | `data.js`, `kalender.js` |
| Melde seg på | `POST /api/pameldinger` (`tur_id`) | skjema i modalen, `felles.js` |
| Lage ny tur | `POST /api/turer` | `ny-tur.html` (skjema har `name`-attributter) |
| Værmelding (4 dager) | `GET /api/vaer?tidspunkt=…` (MET/yr) | `felles.js` → `vaerBoks()` |
| Innlogging | ID-porten (OIDC) | knapper med `data-idporten` |

**Personvern:** API-et skal bare returnere `antallPameldt`, aldri navn på påmeldte.
