/**
 * Validation utilities and business rules for Michaforge Enterprises
 */

/**
 * Normalizes any Kenyan phone number to standard E.164 format (+254XXXXXXXXX).
 * Handles formats: 0714843208, 0110123456, 254714843208, +254 714 843 208, etc.
 */
export function normalizeKenyanPhoneNumber(input: string): string {
  if (!input) return '';
  // Remove all whitespace, dashes, parens
  let cleaned = input.trim().replace(/[\s\-\(\)]/g, '');

  if (cleaned.startsWith('+254')) {
    // Check length: +254 + 9 digits = 13 chars
    return cleaned;
  }
  if (cleaned.startsWith('254')) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('0')) {
    // Replace leading 0 with +254
    return `+254${cleaned.slice(1)}`;
  }
  if (cleaned.length === 9) {
    return `+254${cleaned}`;
  }
  return cleaned;
}

/**
 * Validates whether a phone number matches Kenyan format (+254 followed by 9 digits).
 */
export function isValidKenyanPhoneNumber(phone: string): boolean {
  const normalized = normalizeKenyanPhoneNumber(phone);
  return /^\+254(7|1)\d{8}$/.test(normalized);
}

/**
 * Generates an official WhatsApp click-to-chat URL with properly encoded pre-filled text.
 */
export function generateWhatsAppLink(
  phoneNumber: string,
  productName?: string,
  sku?: string,
  customMessage?: string
): string {
  const normalized = normalizeKenyanPhoneNumber(phoneNumber).replace('+', '');
  let message = '';

  if (customMessage) {
    message = customMessage;
  } else if (productName) {
    const skuSuffix = sku ? ` (SKU: ${sku})` : '';
    message = `Hello Michaforge Enterprises, I would like to enquire about ${productName}${skuSuffix}. Please share the current price and availability.`;
  } else {
    message =
      'Hello Michaforge Enterprises, I would like to enquire about your plumbing and hardware materials.';
  }

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

/**
 * Formats monetary amounts in KES with proper commas and currency prefix.
 * Strict rule: Never display 0 or negative numbers as current price.
 */
export function formatCurrency(
  amount?: number | null,
  currency: string = 'KES'
): string {
  if (amount === undefined || amount === null || amount <= 0) {
    return 'Contact for Price';
  }
  const prefix = currency === 'KES' ? 'KSh' : currency;
  return `${prefix} ${amount.toLocaleString('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Validates a submitted price. Must be a valid positive number or null/undefined.
 */
export function validatePriceValue(
  value: unknown
): { valid: boolean; error?: string; parsed?: number | null } {
  if (value === null || value === undefined || value === '') {
    return { valid: true, parsed: null };
  }
  const num = typeof value === 'number' ? value : Number(value);
  if (isNaN(num)) {
    return { valid: false, error: 'Price must be a valid number' };
  }
  if (num < 0) {
    return { valid: false, error: 'Price cannot be negative' };
  }
  return { valid: true, parsed: Math.round(num * 100) / 100 };
}

/**
 * Validates product SKU. Must be alphanumeric and reasonable length.
 */
export function isValidSku(sku: string): boolean {
  if (!sku) return false;
  return /^[A-Za-z0-9\-_]{2,30}$/.test(sku.trim());
}

/**
 * Validates image upload MIME types.
 */
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
];

export function isAllowedImageMimeType(mime: string): boolean {
  return ALLOWED_IMAGE_MIME_TYPES.includes(mime.toLowerCase());
}

/**
 * Validates image upload file size (maximum 5MB).
 */
export function isAllowedFileSize(sizeBytes: number, maxMb: number = 5): boolean {
  return sizeBytes > 0 && sizeBytes <= maxMb * 1024 * 1024;
}
