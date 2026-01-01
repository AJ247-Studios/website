/**
 * Site Media Management Library
 * 
 * Handles uploads, metadata, and image operations for the visual editor.
 * Works with site_images, hero_slots, and portfolio_items tables.
 */

import { createClientBrowser } from "@/utils/supabase-browser";

// Types
export interface SiteImage {
  id: string;
  storage_path: string;
  public_url: string | null;
  filename: string;
  mime_type: string;
  file_size: number | null;
  width: number | null;
  height: number | null;
  focal_x: number;
  focal_y: number;
  alt_text: string | null;
  caption: string | null;
  tags: string[];
  category: string | null;
  variants: ImageVariants;
  variants_status: 'pending' | 'processing' | 'ready' | 'failed';
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImageVariants {
  mobile?: { path: string; width: number; height: number; url?: string };
  tablet?: { path: string; width: number; height: number; url?: string };
  desktop?: { path: string; width: number; height: number; url?: string };
  retina?: { path: string; width: number; height: number; url?: string };
}

export interface HeroSlot {
  id: string;
  page_key: string;
  slot_key: string;
  image_id: string | null;
  alt_text_override: string | null;
  aspect_ratio: string;
  object_fit: string;
  hide_on_mobile: boolean;
  mobile_image_id: string | null;
  is_active: boolean;
  sort_order: number;
  updated_by: string | null;
  updated_at: string;
  // Joined image data
  image?: SiteImage | null;
  mobile_image?: SiteImage | null;
}

export interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  cover_image_id: string | null;
  thumbnail_image_id: string | null;
  hover_image_id: string | null;
  categories: string[];
  tags: string[];
  client_name: string | null;
  project_date: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  link_type: 'detail' | 'external' | 'lightbox' | 'none';
  external_url: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  // Joined image data
  cover_image?: SiteImage | null;
  thumbnail_image?: SiteImage | null;
  hover_image?: SiteImage | null;
}

export interface UploadOptions {
  folder?: string;
  category?: 'hero' | 'portfolio' | 'team' | 'general';
  alt_text?: string;
  caption?: string;
  tags?: string[];
  focal_x?: number;
  focal_y?: number;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

// Aspect ratio presets
export const ASPECT_RATIOS: Record<string, { width: number; height: number; label: string }> = {
  '16:9': { width: 16, height: 9, label: 'Widescreen (16:9)' },
  '4:3': { width: 4, height: 3, label: 'Standard (4:3)' },
  '1:1': { width: 1, height: 1, label: 'Square (1:1)' },
  '21:9': { width: 21, height: 9, label: 'Ultra-wide (21:9)' },
  '3:2': { width: 3, height: 2, label: 'Photo (3:2)' },
  '9:16': { width: 9, height: 16, label: 'Portrait (9:16)' },
  'auto': { width: 0, height: 0, label: 'Original' },
};

// Recommended sizes per breakpoint
export const BREAKPOINT_SIZES = {
  mobile: { width: 640, label: 'Mobile', maxWidth: 640 },
  tablet: { width: 1024, label: 'Tablet', maxWidth: 1024 },
  desktop: { width: 1920, label: 'Desktop', maxWidth: 1920 },
  retina: { width: 3840, label: 'Retina/4K', maxWidth: 3840 },
};

/**
 * Get auth headers for authenticated API requests
 * Returns headers with Authorization bearer token if logged in
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClientBrowser();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('Not authenticated. Please log in to access admin features.');
  }
  
  return {
    'Authorization': `Bearer ${session.access_token}`,
  };
}

/**
 * Authenticated fetch wrapper for admin API calls
 */
async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const authHeaders = await getAuthHeaders();
  
  return fetch(url, {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  });
}

/**
 * Get image dimensions from a File or Blob
 */
export async function getImageDimensions(file: File | Blob): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, AVIF, GIF` };
  }
  
  if (file.size > MAX_SIZE) {
    return { valid: false, error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: 10MB` };
  }
  
  return { valid: true };
}

/**
 * Calculate crop area given focal point and target aspect ratio
 */
export function calculateFocalCrop(
  sourceWidth: number,
  sourceHeight: number,
  focalX: number,
  focalY: number,
  targetAspect: number
): { x: number; y: number; width: number; height: number } {
  const sourceAspect = sourceWidth / sourceHeight;
  
  let cropWidth: number;
  let cropHeight: number;
  
  if (sourceAspect > targetAspect) {
    // Source is wider - crop width
    cropHeight = sourceHeight;
    cropWidth = cropHeight * targetAspect;
  } else {
    // Source is taller - crop height
    cropWidth = sourceWidth;
    cropHeight = cropWidth / targetAspect;
  }
  
  // Center crop on focal point, but keep within bounds
  let x = (focalX * sourceWidth) - (cropWidth / 2);
  let y = (focalY * sourceHeight) - (cropHeight / 2);
  
  // Clamp to image bounds
  x = Math.max(0, Math.min(x, sourceWidth - cropWidth));
  y = Math.max(0, Math.min(y, sourceHeight - cropHeight));
  
  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(cropWidth),
    height: Math.round(cropHeight),
  };
}

/**
 * Generate a unique storage key for uploads
 */
export function generateImageKey(filename: string, category?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
  const sanitizedName = filename
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .substring(0, 50);
  
  const folder = category ? `site/${category}` : 'site/general';
  return `${folder}/${timestamp}_${random}_${sanitizedName}.${ext}`;
}

/**
 * Upload an image file via the API
 */
export async function uploadSiteImage(
  file: File,
  options: UploadOptions = {}
): Promise<{ image: SiteImage; url: string }> {
  // Validate
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  // Get dimensions
  const dimensions = await getImageDimensions(file);
  
  // Build form data
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', options.category || 'general');
  formData.append('alt_text', options.alt_text || '');
  formData.append('caption', options.caption || '');
  formData.append('tags', JSON.stringify(options.tags || []));
  formData.append('focal_x', String(options.focal_x ?? 0.5));
  formData.append('focal_y', String(options.focal_y ?? 0.5));
  formData.append('width', String(dimensions.width));
  formData.append('height', String(dimensions.height));
  
  const response = await authFetch('/api/admin/media/upload', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Upload failed: ${error}`);
  }
  
  const data = await response.json();
  return data;
}

/**
 * Update image metadata (focal point, alt text, etc.)
 */
export async function updateSiteImage(
  imageId: string,
  updates: Partial<Pick<SiteImage, 'focal_x' | 'focal_y' | 'alt_text' | 'caption' | 'tags' | 'category'>>
): Promise<SiteImage> {
  const response = await authFetch(`/api/admin/media/${imageId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Update failed: ${error}`);
  }
  
  return response.json();
}

/**
 * Delete a site image
 */
export async function deleteSiteImage(imageId: string): Promise<void> {
  const response = await authFetch(`/api/admin/media/${imageId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Delete failed: ${error}`);
  }
}

/**
 * Fetch all hero slots with their images
 */
export async function fetchHeroSlots(): Promise<HeroSlot[]> {
  const response = await authFetch('/api/admin/media/hero-slots');
  if (!response.ok) throw new Error('Failed to fetch hero slots');
  return response.json();
}

/**
 * Update a hero slot's assigned image
 */
export async function updateHeroSlot(
  slotId: string,
  updates: Partial<Pick<HeroSlot, 'image_id' | 'mobile_image_id' | 'alt_text_override' | 'aspect_ratio' | 'object_fit' | 'hide_on_mobile' | 'is_active'>>
): Promise<HeroSlot> {
  const response = await authFetch(`/api/admin/media/hero-slots/${slotId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Update failed: ${error}`);
  }
  
  return response.json();
}

/**
 * Fetch all portfolio items with their images
 */
export async function fetchPortfolioItems(): Promise<PortfolioItem[]> {
  const response = await authFetch('/api/admin/media/portfolio-items');
  if (!response.ok) throw new Error('Failed to fetch portfolio items');
  return response.json();
}

/**
 * Update a portfolio item
 */
export async function updatePortfolioItem(
  itemId: string,
  updates: Partial<Omit<PortfolioItem, 'id' | 'created_at' | 'updated_at' | 'cover_image' | 'thumbnail_image' | 'hover_image'>>
): Promise<PortfolioItem> {
  const response = await authFetch(`/api/admin/media/portfolio-items/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Update failed: ${error}`);
  }
  
  return response.json();
}

/**
 * Create a new portfolio item
 */
export async function createPortfolioItem(
  data: Pick<PortfolioItem, 'title' | 'slug'> & Partial<PortfolioItem>
): Promise<PortfolioItem> {
  const response = await authFetch('/api/admin/media/portfolio-items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Create failed: ${error}`);
  }
  
  return response.json();
}

/**
 * Delete a portfolio item
 */
export async function deletePortfolioItem(itemId: string): Promise<void> {
  const response = await authFetch(`/api/admin/media/portfolio-items/${itemId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Delete failed: ${error}`);
  }
}

/**
 * Fetch all site images (for media library)
 */
export async function fetchSiteImages(options?: {
  category?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}): Promise<{ images: SiteImage[]; total: number }> {
  const params = new URLSearchParams();
  if (options?.category) params.set('category', options.category);
  if (options?.tags?.length) params.set('tags', options.tags.join(','));
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.offset) params.set('offset', String(options.offset));
  
  const response = await authFetch(`/api/admin/media?${params}`);
  if (!response.ok) throw new Error('Failed to fetch images');
  return response.json();
}

/**
 * Request generation of image variants
 */
export async function requestImageVariants(imageId: string): Promise<void> {
  const response = await authFetch('/api/admin/media/generate-variants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageId }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Variant generation failed: ${error}`);
  }
}

/**
 * Get image URL with optional transformation parameters
 * Uses the focal point for smart cropping
 */
export function getImageUrl(
  image: SiteImage | null | undefined,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'avif' | 'jpeg';
  }
): string {
  if (!image) return '/portfolio/placeholder.webp';
  
  // If we have pre-generated variants and a matching size, use that
  if (image.variants && options?.width) {
    const breakpoint = Object.entries(BREAKPOINT_SIZES).find(
      ([, config]) => options.width! <= config.width
    );
    if (breakpoint) {
      const variant = image.variants[breakpoint[0] as keyof ImageVariants];
      if (variant?.url) return variant.url;
    }
  }
  
  // Otherwise return the public URL or storage path
  return image.public_url || `/api/media/${image.storage_path}`;
}

/**
 * Generate CSS object-position from focal point
 */
export function focalPointToObjectPosition(focalX: number, focalY: number): string {
  return `${(focalX * 100).toFixed(1)}% ${(focalY * 100).toFixed(1)}%`;
}
