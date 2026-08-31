import L from "../leafletGlobals.js";
import { getAreas } from "../api/refgeo.js";
import { getInfoFromGeom } from "./infoPanel.js";

function sortByName(features) {
  return [...features].sort((a, b) =>
    a.properties.area_name.localeCompare(b.properties.area_name, "fr")
  );
}

function fillSelect(select, features, firstOption="") {
  select.innerHTML =
    '<option value="">-- '+firstOption+' --</option>' +
    features.map((f, i) => `<option value="${i}">${f.properties.area_name}</option>`).join("");
}

// Surlignage de la commune/du secteur sélectionné : une seule forme à la
// fois, une nouvelle sélection remplace la précédente.
let highlightLayer = null;

function zoomToFeature(map, feature) {
  if (highlightLayer) map.removeLayer(highlightLayer);
  highlightLayer = L.geoJSON(feature, {
    style: { color: "#2f5233", weight: 2, fillColor: "#2f5233", fillOpacity: 0.15 },
  }).addTo(map);  
  map.fitBounds(highlightLayer.getBounds(), { padding: [40, 40] });
}


const SearchControl = L.Control.extend({
  options: { position: "topright" },

  onAdd() {
    const container = L.DomUtil.create("div", "leaflet-bar search-control");
    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.disableScrollPropagation(container);

    this.communeSelect = L.DomUtil.create("select", "", container);
    this.secteurSelect = L.DomUtil.create("select", "", container);

    return container;
  },
});

export async function setupSearchPanel(map, config) {
  const control = new SearchControl().addTo(map);
  const { communeSelect, secteurSelect } = control;

  const [communesRaw, secteursRaw] = await Promise.all([
    getAreas({ idType: config.areaTypes.communes.idType }),
    getAreas({ idType: config.areaTypes.secteurs.idType }),
  ]);

  const prefixes = config.areaTypes.communes.codeDepartementsPrefix || [];
  const communes = prefixes.length
    ? communesRaw.filter((f) => prefixes.some((p) => (f.properties.area_code || "").startsWith(p)))
    : communesRaw;

  const sortedCommunes = sortByName(communes);
  const sortedSecteurs = sortByName(secteursRaw);

  fillSelect(communeSelect, sortedCommunes, "Communes");
  fillSelect(secteurSelect, sortedSecteurs, "Secteurs");

  communeSelect.addEventListener("change", () => {
    if (communeSelect.value !== "") zoomToFeature(map, sortedCommunes[Number(communeSelect.value)]);
  });
  secteurSelect.addEventListener("change", () => {
    if (secteurSelect.value !== "") zoomToFeature(map, sortedSecteurs[Number(secteurSelect.value)]);
  });
}
