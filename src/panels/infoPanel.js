import { getInfo } from "../api/refgeo.js";
import { describeCoordinates } from "../utils/coords.js";

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function renderCoords(c) {
  return `<table class="coords-table">
    <tr><td>WGS84 (degrés décimaux)</td><td>${c.wgs84.x}° / ${c.wgs84.y}°</td></tr>
    <tr><td>Lambert 93</td><td>${c.lambert93.x} m / ${c.lambert93.y} m</td></tr>
  </table>`;
}

function renderResult({ communes, zonages, altitude, typesById }) {
  let alt = "inconnue";
  if (altitude && altitude.altitude_min != null) {
    alt =
      altitude.altitude_max != null && altitude.altitude_max !== altitude.altitude_min
        ? `${altitude.altitude_min} - ${altitude.altitude_max} m`
        : `${altitude.altitude_min} m`;
  }

  const communeLabel = communes.length
    ? communes.map((c) => escapeHtml(c.area_name)).join(", ")
    : "hors zone connue";
  const zonesHtml = zonages.length
    ? `<ul>${zonages
        .map((z) => {
          const label = typesById.get(z.id_type)?.type_name || "Zonage";
          return `<li class="list-info">${escapeHtml(label)} : ${escapeHtml(z.area_name)}</li>`;
        })
        .join("")}</ul>`
    : "<p>Aucun zonage réglementaire à cet endroit.</p>";

  return `
    <p class="altitude"><strong>Altitude :</strong> ${alt}</p>
    <p class="commune"><strong>Commune${communes.length > 1 ? "s" : ""} :</strong> ${communeLabel}</p>
    <strong>Zonages réglementaires :</strong>
    ${zonesHtml}
  `;
}

const content = document.getElementById("info-content");
let options = null;

export function initInfoPanel(opts) {
  options = opts;
}

export async function getInfoFromGeom(geometry) {
  const { communeIdType, excludedZonageTypeCodes, typesById } = options;

  const coordsHtml =
    geometry.type === "Point" ? renderCoords(describeCoordinates(geometry.coordinates)) : "";

  content.innerHTML = coordsHtml + '<p class="loading">Recherche en cours…</p>';

  try {
    const { areas, altitude } = await getInfo(geometry);
    const communes = areas.filter((a) => a.id_type === communeIdType);
    const zonages = areas.filter((a) => {
      if (a.id_type === communeIdType) return false;
      const typeCode = typesById.get(a.id_type)?.type_code;
      return !excludedZonageTypeCodes.includes(typeCode);
    });
    content.innerHTML = coordsHtml + renderResult({ communes, zonages, altitude, typesById });
  } catch (err) {
    content.innerHTML = coordsHtml + `<p class="loading">Erreur : ${err.message}</p>`;
  }
}
