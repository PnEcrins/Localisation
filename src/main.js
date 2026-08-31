import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { createMap } from "./map.js";
import { initApi, getAreaTypes } from "./api/refgeo.js";
import { initInfoPanel } from "./panels/infoPanel.js";
import { setupSearchPanel } from "./panels/searchPanel.js";
import { setupDrawPanel } from "./panels/drawPanel.js";
import { setupImportPanel } from "./panels/importPanel.js";
import { setupGpsPanel } from "./panels/gpsPanel.js";

function showFatalError(message) {
  document.body.insertAdjacentHTML(
    "beforeend",
    `<div style="position:fixed;top:0;left:0;right:0;background:#c0392b;color:white;padding:10px;font-family:sans-serif;z-index:9999">Erreur au démarrage : ${message}</div>`
  );
}

async function main() {
  const config = await fetch("config.json").then((r) => r.json());
  initApi(config.apiBaseUrl);

  const { map, layerControl } = createMap(config);

  // Non bloquant : ne sert qu'à afficher un libellé lisible pour chaque
  // zonage (sinon repli sur "Zonage" générique, voir infoPanel.js) et à
  // filtrer les types techniques. Si l'API est indisponible, l'appli doit
  // quand même se lancer plutôt que planter entièrement pour ça.
  let typesById = new Map();
  try {
    const types = await getAreaTypes();
    typesById = new Map(types.map((t) => [t.id_type, t]));
  } catch (err) {
    console.error("Impossible de charger les types de zonage :", err);
  }

  initInfoPanel({
    communeIdType: config.areaTypes.communes.idType,
    excludedZonageTypeCodes: config.areaTypes.excludedZonageTypeCodes || [],
    typesById,
  });
  await setupSearchPanel(map, config);
  setupDrawPanel(map);
  setupImportPanel(map, layerControl);
  setupGpsPanel(map);
}

main().catch((err) => {
  console.error(err);
  showFatalError(err.message);
});
