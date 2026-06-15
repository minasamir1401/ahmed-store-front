export const productDateValue = (product: any) => {
  const rawDate = product?.updatedAt || product?.createdAt || product?.id
  const parsed = Date.parse(rawDate)
  return Number.isNaN(parsed) ? 0 : parsed
}

export const newestProducts = <T extends any>(items: T[]) => {
  return [...items].sort((a: any, b: any) => productDateValue(b) - productDateValue(a))
}

export const sortProductsForDisplay = <T extends any>(items: T[], sortBy = 'default') => {
  const products = [...items]
  if (sortBy === 'price-asc') return products.sort((a: any, b: any) => Number(a?.price || 0) - Number(b?.price || 0))
  if (sortBy === 'price-desc') return products.sort((a: any, b: any) => Number(b?.price || 0) - Number(a?.price || 0))
  return newestProducts(products)
}
