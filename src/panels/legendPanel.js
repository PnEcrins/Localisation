import L from "../leafletGlobals.js";

export function setupLegendPanel(map, config) {
  const LegendControl = L.Control.extend({
    options: { position: "bottomright" },

    onAdd(map) {
      const container = L.DomUtil.create("div", "leaflet-control-legend");

      // Filtre les couches geojson avec un style configuré
      const legendLayers = config.layers.filter(
        (layer) => layer.type === "geojson" && layer.style
      );

      if (legendLayers.length === 0) return container;

      const title = L.DomUtil.create("div", "legend-title", container);
      title.textContent = "Légende";

      const list = L.DomUtil.create("ul", "legend-list", container);

      legendLayers.forEach((layerCfg) => {
        const item = L.DomUtil.create("li", "legend-item", list);

        const colorBox = L.DomUtil.create("div", "legend-color-box", item);
        colorBox.style.backgroundColor = layerCfg.style.color || "#1d6fa5";
        colorBox.style.borderColor = layerCfg.style.color || "#1d6fa5";


        const label = L.DomUtil.create("span", "legend-label", item);
        label.textContent = layerCfg.label;
      });

      L.DomEvent.disableClickPropagation(container);
      return container;
    },
  });

  const legend = new LegendControl();
  legend.addTo(map);
}
