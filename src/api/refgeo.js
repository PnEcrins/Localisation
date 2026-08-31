let apiBaseUrl = "";

export function initApi(baseUrl) {
  apiBaseUrl = baseUrl.replace(/\/$/, "");
}

async function postGeom(path, geometry, extra = {}) {
  const res = await fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ geometry, ...extra }),
  });
  if (!res.ok) {
    throw new Error(`Erreur API ${path} (${res.status})`);
  }
  return res.json();
}

/**
 * Point cliqué sur la carte -> zonages intersectés + altitude.
 * geometry doit être un GeoJSON en EPSG:4326.
 */
export function getInfo(geometry) {
  return postGeom("/info", geometry);
}

export function getAreasIntersection(geometry) {
  return postGeom("/areas", geometry);
}

/**
 * Liste des aires de ref_geo.l_areas pour un id_type donné (communes, secteurs...).
 * withGeom=true pour récupérer les géométries (utile pour calculer une emprise de zoom).
 */
export async function getAreas({ idType, typeCode, withGeom = true } = {}) {
  const params = new URLSearchParams();
  if (idType != null) params.set("id_type", idType);
  if (typeCode) params.set("type_code", typeCode);
  if (withGeom) params.set("format", "geojson");
  else params.set("without_geom", "true");
  params.set("limit", "1000");

  const res = await fetch(`${apiBaseUrl}/areas?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Erreur API /areas (${res.status})`);
  }
  return res.json();
}

export async function getAreaTypes() {
  const res = await fetch(`${apiBaseUrl}/types`);
  if (!res.ok) {
    throw new Error(`Erreur API /types (${res.status})`);
  }
  return res.json();
}
