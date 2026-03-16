/**
 * Adds Cloudinary transformations to image URLs.
 * Non-Cloudinary URLs are returned unchanged.
 */
export function getOptimizedImageUrl(url: string | null | undefined, width = 120): string {
  if (!url || !url.includes('cloudinary.com')) return url ?? '';
  return url.replace('/upload/', `/upload/f_auto,q_auto:good,w_${width},c_fill/`);
}
