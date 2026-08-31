import L from "../leafletGlobals.js";
import { getInfoFromGeom } from "./infoPanel.js";

export function setupDrawPanel(map) {
  const drawnItems = new L.FeatureGroup().addTo(map);

  const drawControl = new L.Control.Draw({
    position: "topleft",
    draw: {

      marker: true,
      polyline: false,
      polygon: true,
      circle: false,
      circlemarker: false,
      rectangle: false,
    },
    edit: {
      featureGroup: drawnItems,
    },
  });
  map.addControl(drawControl);


  // Une seule forme active à la fois
  map.on(L.Draw.Event.CREATED, (e) => {
    drawnItems.clearLayers();
    drawnItems.addLayer(e.layer);

    if (e.layerType === "marker" || e.layerType === "polygon") {
      getInfoFromGeom(e.layer.toGeoJSON().geometry);
    }
  });

  return drawnItems;
}
