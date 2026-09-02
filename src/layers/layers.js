import L from "../leafletGlobals.js";

/**
 * Construction de couches génériques, quelle que soit leur source (WMTS,
 * WMS...). Toute nouvelle couche se déclare dans config.json, sans code
 * spécifique à un fournisseur particulier (IGN ou autre).
 */

function buildWmtsLayer(cfg) {
  let url =
    `${cfg.url}?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile` +
    `&LAYER=${encodeURIComponent(cfg.layer)}` +
    `&STYLE=${encodeURIComponent(cfg.style || "normal")}` +
    `&TILEMATRIXSET=${encodeURIComponent(cfg.tileMatrixSet || "PM")}` +
    `&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}` +
    `&FORMAT=${encodeURIComponent(cfg.format || "image/png")}`;

  if (cfg.apiKey) {
    const apiKeyName = cfg.apiKeyName || "apiKey";
    url += `&${apiKeyName}=${cfg.apiKey}`;
  }

  return L.tileLayer(url, {
    tileSize: cfg.tileSize || 256,
    attribution: cfg.attribution || "",
    maxZoom: cfg.maxZoom || 19,
  });
}

function buildWmsLayer(cfg) {
  return L.tileLayer.wms(cfg.url, {
    layers: cfg.layers,
    styles: cfg.styles || "",
    format: cfg.format || "image/png",
    transparent: cfg.transparent ?? true,
    version: cfg.version || "1.3.0",
    attribution: cfg.attribution || "",
  });
}


function buildGeoJsonLayer(cfg) {
  const defaultStyle = {
    color: "#1d6fa5",
    weight: 2,
    fillOpacity: 0,
  };
  const styleConfig = { ...defaultStyle, ...cfg.style };
  const pointColor = cfg.style?.color || defaultStyle.color;

  const layer = L.geoJSON(null, {
    style: styleConfig,
    pointToLayer: (feature, latlng) =>
      L.circleMarker(latlng, { radius: 5, color: pointColor }),
  });

  let loaded = false;
  layer.on("add", async () => {
    if (loaded) return;
    loaded = true;
    try {
      const res = await fetch(cfg.url);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      layer.addData(await res.json());
    } catch (err) {
      loaded = false; // permet de réessayer si on décoche/recoche la couche
      console.error(`Impossible de charger la couche GeoJSON "${cfg.label || cfg.id}" :`, err);
    }
  });

  return layer;
}

/**
 * Construit une couche Leaflet à partir d'une entrée de config.json.
 * Retourne {layer, label, baseLayer} pour l'assemblage du layer control.
 */
export function buildConfiguredLayer(cfg) {
  if (cfg.type === "wmts") {
    return { layer: buildWmtsLayer(cfg), label: cfg.label, baseLayer: !!cfg.baseLayer };
  }
  if (cfg.type === "wms") {
    return { layer: buildWmsLayer(cfg), label: cfg.label, baseLayer: !!cfg.baseLayer };
  }
  if (cfg.type === "geojson") {
    return { layer: buildGeoJsonLayer(cfg), label: cfg.label, baseLayer: false };
  }
  throw new Error(`Type de couche non supporté : "${cfg.type}"`);
}
