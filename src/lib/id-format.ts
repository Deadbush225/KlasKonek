export function formatKlasKonekId(starId?: string | null) {
  if (!starId) {
    return '';
  }

  return starId
    .replace(/^STAR-LEGACY-/i, 'KK-LEGACY-')
    .replace(/^STAR-/i, 'KK-');
}
