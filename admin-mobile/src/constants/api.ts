export const TABLES = {
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  INQUIRIES: 'inquiries',
} as const;

export const STORAGE = {
  BUCKET: 'media',
  PRODUCTS_PATH: 'products',
  CATEGORIES_PATH: 'categories',
} as const;

export const PAGINATION = {
  INQUIRIES_PAGE_SIZE: 20,
} as const;

export const LIGHTING_OPTIONS = ['Cool White', 'Warm White', 'Yellow', 'RGB'] as const;

export const BADGE_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'New Arrival', label: 'New Arrival' },
  { value: 'Bestseller', label: 'Bestseller' },
  { value: 'Premium', label: 'Premium' },
] as const;

export const CATEGORY_TYPE_OPTIONS = [
  { value: 'Indoor Collection', label: 'Indoor Collection' },
  { value: 'Outdoor Collection', label: 'Outdoor Collection' },
] as const;
