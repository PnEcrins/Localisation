import proj4 from "proj4";

proj4.defs(
  "EPSG:2154",
  "+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
);

function utmZoneFromLon(lon) {
  return Math.floor((lon + 180) / 6) + 1;
}

function toDms(deg, isLat) {
  const dir = deg >= 0 ? (isLat ? "N" : "E") : isLat ? "S" : "W";
  const abs = Math.abs(deg);
  const d = Math.floor(abs);
  const minFloat = (abs - d) * 60;
  const m = Math.floor(minFloat);
  const s = ((minFloat - m) * 60).toFixed(2);
  return `${d}°${m}'${s}"${dir}`;
}

/**
 * lngLat: [lon, lat] en degrés décimaux (WGS84 / EPSG:4326)
 * Retourne toutes les représentations utiles pour l'agent sur le terrain.
 */
export function describeCoordinates([lon, lat]) {
  const zone = utmZoneFromLon(lon);
  const utmDef = `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs`;
  const [xUtm, yUtm] = proj4(utmDef, [lon, lat]);
  const [xL93, yL93] = proj4("EPSG:2154", [lon, lat]);

  return {
    wgs84: { x: lon.toFixed(6), y: lat.toFixed(6) },
    dms: { x: toDms(lon, false), y: toDms(lat, true) },
    utm: { zone, x: xUtm.toFixed(1), y: yUtm.toFixed(1) },
    lambert93: { x: xL93.toFixed(1), y: yL93.toFixed(1) },
  };
}
