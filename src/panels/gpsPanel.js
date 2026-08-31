import L from "../leafletGlobals.js";

const GpsControl = L.Control.extend({
  options: { position: "topleft", onClick: () => {} },

  onAdd() {
    const container = L.DomUtil.create("div", "leaflet-bar leaflet-control-gps");
    const link = L.DomUtil.create("a", "", container);
    link.href = "#";
    link.title = "Localiser un point à partir de coordonnées GPS";
    link.innerHTML = "GPS";
    link.style = "padding : 0px"

    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.on(link, "click", L.DomEvent.stop);
    L.DomEvent.on(link, "click", this.options.onClick);

    return container;
  },
});

export function setupGpsPanel(map) {
  const modal = document.getElementById("gps-modal");
  const form = document.getElementById("gps-form");
  const xInput = document.getElementById("gps-x");
  const yInput = document.getElementById("gps-y");
  const errorEl = document.getElementById("gps-error");
  const cancelBtn = document.getElementById("gps-cancel");

  function openModal() {
    errorEl.textContent = "";
    modal.classList.add("open");
    xInput.focus();
  }

  function closeModal() {
    modal.classList.remove("open");
  }

  new GpsControl({ onClick: openModal }).addTo(map);

  cancelBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const x = parseFloat(xInput.value);
    const y = parseFloat(yInput.value);

    if (!Number.isFinite(x) || Math.abs(x) > 180 || !Number.isFinite(y) || Math.abs(y) > 90) {
      errorEl.textContent = "Coordonnées invalides (X = longitude, Y = latitude, en degrés décimaux).";
      return;
    }

    const marker = L.marker([y, x]);
    map.fire(L.Draw.Event.CREATED, { layer: marker, layerType: "marker" });
    map.panTo([y, x]);

    closeModal();
    form.reset();
  });
}
