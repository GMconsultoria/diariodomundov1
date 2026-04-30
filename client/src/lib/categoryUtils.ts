/**
 * Convert category name to URL slug
 * Example: "Ciência e Tecnologia" -> "ciencia-e-tecnologia"
 */
export function categoryToSlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ã/g, 'a')
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/õ/g, 'o')
    .replace(/ú/g, 'u')
    .replace(/ e /g, '-e-')
    .replace(/ /g, '-');
}

/**
 * Get category link path
 */
export function getCategoryLink(category: string): string {
  return `/categoria/${categoryToSlug(category)}`;
}
