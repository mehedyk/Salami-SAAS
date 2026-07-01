// ─── Allowed types ────────────────────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
])

const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

const MAX_AVATAR_SIZE_MB = 2
const MAX_COVER_SIZE_MB  = 4
const MAX_RECEIPT_SIZE_MB = 5

// ─── Validation results ───────────────────────────────────────────────────────

export interface MimeValidationResult {
  valid: boolean
  error?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf('.')).toLowerCase()
}

function mbToBytes(mb: number): number {
  return mb * 1024 * 1024
}

/**
 * Read the first 4 bytes of a file to check the magic number.
 * Prevents MIME type spoofing (e.g., an .exe renamed to .jpg).
 */
async function readMagicBytes(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = (e) => resolve(new Uint8Array(e.target?.result as ArrayBuffer))
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file.slice(0, 4))
  })
}

function isValidImageMagic(bytes: Uint8Array): boolean {
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return true
  // PNG:  89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return true
  // WEBP: 52 49 46 46 (RIFF)
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) return true
  return false
}

// ─── Public validators ────────────────────────────────────────────────────────

export async function validateImageFile(
  file: File,
  type: 'avatar' | 'cover' | 'receipt'
): Promise<MimeValidationResult> {
  const maxMb =
    type === 'avatar'  ? MAX_AVATAR_SIZE_MB  :
    type === 'cover'   ? MAX_COVER_SIZE_MB   :
    MAX_RECEIPT_SIZE_MB

  // 1. MIME type check
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed.' }
  }

  // 2. Extension check
  const ext = getExtension(file.name)
  if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
    return { valid: false, error: 'File extension not allowed.' }
  }

  // 3. Size check
  if (file.size > mbToBytes(maxMb)) {
    return { valid: false, error: `File must be under ${maxMb}MB.` }
  }

  // 4. Magic bytes check — actual content validation
  try {
    const magic = await readMagicBytes(file)
    if (!isValidImageMagic(magic)) {
      return { valid: false, error: 'File content does not match an image format.' }
    }
  } catch {
    return { valid: false, error: 'Could not verify file integrity.' }
  }

  return { valid: true }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
