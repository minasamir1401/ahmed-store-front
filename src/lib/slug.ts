export function getProductIdFromParam(param: string): string {
  if (!param) return ''
  if (param.includes('-')) {
    const parts = param.split('-')
    return parts[parts.length - 1]
  }
  return param
}

export function slugify(text: string): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0600-\u06FF-]/g, '') // Keep alphanumeric, spaces, Arabic letters, and dashes
    .replace(/[\s_]+/g, '-')              // Replace spaces/underscores with dashes
    .replace(/-+/g, '-')                  // Collapse multiple dashes
    .replace(/^-+|-+$/g, '');             // Trim leading/trailing dashes
}

export function getProductSlug(product: { title?: string | null; titleEn?: string | null }): string {
  const source = product.titleEn || product.title || ''
  return slugify(source)
}

export function getProductUrlParam(product: { id: string; title?: string | null; titleEn?: string | null }): string {
  const slug = getProductSlug(product)
  return slug ? `${slug}-${product.id}` : product.id
}
