/**
 * Formats a number to Indian Rupee currency format (e.g. ₹2,499)
 */
export function formatPrice(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats an ISO date string to an elegant readable format (e.g. 12 Oct 2026)
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Calculates a pseudo MRP old price if not explicitly stored to show discount presentation (e.g. 25% OFF)
 */
export function getPriceDetails(price) {
  const numPrice = Number(price) || 0;
  // Calculate a realistic MRP based on typical 25%-35% festive markup
  const originalPrice = Math.round(numPrice * 1.35 / 100) * 100 - 1; // e.g. 2499 -> 3399
  const discountPercent = originalPrice > numPrice ? Math.round(((originalPrice - numPrice) / originalPrice) * 100) : 0;
  
  return {
    price: numPrice,
    originalPrice,
    discountPercent: discountPercent > 0 ? `${discountPercent}% OFF` : null
  };
}

/**
 * High-definition luxury saree editorial imagery curated for fallbacks and visual rich mockups
 */
export const SAREE_EDITORIAL_IMAGES = [
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1610030469668-9655ec741f22?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=1200&q=85',
];

/**
 * Returns front image URL from product images array or fallback
 */
export function getProductFrontImage(images, fallbackIndex = 0) {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return SAREE_EDITORIAL_IMAGES[fallbackIndex % SAREE_EDITORIAL_IMAGES.length];
  }
  const frontImg = images.find(img => img && (img.isFront === true || img.isFront === 'true'));
  if (frontImg && frontImg.url) return frontImg.url;
  return images[0]?.url || SAREE_EDITORIAL_IMAGES[fallbackIndex % SAREE_EDITORIAL_IMAGES.length];
}

/**
 * Returns all image URLs from a product
 */
export function getAllProductImages(images, fallbackIndex = 0) {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return [
      SAREE_EDITORIAL_IMAGES[fallbackIndex % SAREE_EDITORIAL_IMAGES.length],
      SAREE_EDITORIAL_IMAGES[(fallbackIndex + 1) % SAREE_EDITORIAL_IMAGES.length]
    ];
  }
  return images.map(img => (typeof img === 'string' ? img : img?.url)).filter(Boolean);
}
