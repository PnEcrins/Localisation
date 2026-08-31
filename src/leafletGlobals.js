/**
 * leaflet-draw et leaflet-filelayer sont d'anciens plugins UMD qui
 * s'enregistrent sur `window.L` (et `window.toGeoJSON` pour le second) au
 * lieu d'exporter proprement un module ES. On prépare donc ces globales une
 * bonne fois pour toutes ici, puis on importe les plugins pour déclencher
 * leur auto-enregistrement. Tout le reste de l'appli importe L depuis ce
 * fichier (jamais directement depuis "leaflet") pour garantir l'ordre.
 */
import L from "leaflet";
import * as toGeoJSON from "@mapbox/togeojson";
import registerFileLayer from "leaflet-filelayer";
import "leaflet-draw";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

window.L = L;
window.toGeoJSON = toGeoJSON;

// leaflet-filelayer expose une factory (branche CommonJS de son bundle UMD,
// prise par Vite) plutôt que de s'enregistrer tout seul : il faut l'appeler
// explicitement pour qu'il ajoute L.Control.fileLayerLoad.
registerFileLayer(window, L, toGeoJSON);

export default L;
