export const FEATURED_PRODUCT_TAG = '__mystikeys_featured__';

// A URL fragment keeps the selected artwork encoded in the existing media
// array without changing the URL requested by the browser or the schema.
export const FEATURED_IMAGE_MARKER = '#mystikeys-featured-image';

export function stripFeaturedImageMarker(url: string) {
  return url.endsWith(FEATURED_IMAGE_MARKER)
    ? url.slice(0, -FEATURED_IMAGE_MARKER.length)
    : url;
}

function hasLegacyFeaturedFileName(url: string) {
  try {
    const fileName = decodeURIComponent(new URL(stripFeaturedImageMarker(url)).pathname.split('/').pop() ?? '');
    return /(?:^|[-_])featured[-_]/i.test(fileName);
  } catch {
    return false;
  }
}

export function getFeaturedImageIndex(media: string[]) {
  const markedIndex = media.findIndex(url => url.endsWith(FEATURED_IMAGE_MARKER));
  if (markedIndex >= 0) return markedIndex;

  const legacyIndex = media.findIndex(hasLegacyFeaturedFileName);
  return legacyIndex >= 0 ? legacyIndex : 0;
}

export function getFeaturedImage(media: string[]) {
  if (media.length === 0) return undefined;
  return stripFeaturedImageMarker(media[getFeaturedImageIndex(media)] ?? media[0]);
}

export function cleanProductMedia(media: string[]) {
  return media.map(stripFeaturedImageMarker);
}

export function markFeaturedImage(media: string[], index?: number) {
  const cleanMedia = cleanProductMedia(media);
  if (index === undefined) return cleanMedia;
  return cleanMedia.map((url, mediaIndex) => (
    mediaIndex === index ? `${url}${FEATURED_IMAGE_MARKER}` : url
  ));
}

