import L from "../leafletGlobals.js";
import { getInfoFromGeom } from "./infoPanel.js";

export function setupImportPanel(map, layerControl) {
  const control = L.Control.fileLayerLoad({
    position: "topleft",
    fitBounds: true,
    formats: [".geojson", ".json", ".gpx", ".kml"],
    layerOptions: {
      style: { color: "#e67e22", weight: 3 },
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, { radius: 5, color: "#e67e22" }),
      onEachFeature: (feature, layer) => {
        layer.bindPopup(_formatObjectProperties(feature.properties));
        layer.on("click", () => getInfoFromGeom(feature.geometry));
      },
    },
  });
  control.addTo(map);

  control.loader.on("data:loaded", (event) => {
    layerControl.addOverlay(event.layer, `Import : ${event.filename}`);
  });

  control.loader.on("data:error", (event) => {
    console.error(event.error);
    alert(`Erreur d'import : ${event.error.message}`);
  });
};

function _formatObjectProperties(obj) {
  let str = "";
  for(let prop in obj) {
    str += prop + ": " + obj[prop]+ "<br>"
  }
  return str
}

