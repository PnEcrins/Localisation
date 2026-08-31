import L from "./leafletGlobals.js";
import { buildConfiguredLayer } from "./layers/layers.js";

/**
 * Construit la carte Leaflet et ajoute toutes les couches déclarées dans
 * config.json (peu importe leur source : WMTS, WMS...), assemblées dans le
 * layer control natif de Leaflet (fonds de carte exclusifs vs couches
 * superposables).
 */
export function createMap(config) {
  const [lon, lat] = config.map?.center || [6.2, 44.9];

  const map = L.map("map", {
    center: [lat, lon],
    zoom: config.map?.zoom || 10,
    maxZoom: config.map?.maxZoom || 19,
  });

  L.control.scale({ metric: true, imperial: false }).addTo(map);

  const baseLayers = {};
  const overlays = {};
  let activeBaseLayer = null;

  for (const layerCfg of config.layers || []) {
    try {
      const { layer, label, baseLayer } = buildConfiguredLayer(layerCfg);
      if (baseLayer) {
        baseLayers[label] = layer;
        if (layerCfg.enabled || !activeBaseLayer) activeBaseLayer = layer;
      } else {
        overlays[label] = layer;
        if (layerCfg.enabled) layer.addTo(map);
      }
    } catch (err) {
      console.error(`Impossible de charger la couche "${layerCfg.id}" :`, err);
    }
  }

  if (activeBaseLayer) activeBaseLayer.addTo(map);

  const layerControl = L.control.layers(baseLayers, overlays, { collapsed: true }).addTo(map);

  return { map, layerControl };
}
