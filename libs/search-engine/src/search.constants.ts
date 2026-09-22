export enum SearchIndex {
  ACTIVE_INGREDIENTS = 'active_ingredients',
  MEDICINES = 'medicines',
}

export const SEARCH_INDEX_CONFIG = [
  {
    name: SearchIndex.ACTIVE_INGREDIENTS,
    searchable: ['nameAr', 'nameEn', 'atcCode', 'therapeuticClass'],
    filterable: ['categoryId', 'prescriptionType', 'dangerLevel', 'isActive', 'nameEn', 'nameAr'],
  },
  {
    name: SearchIndex.MEDICINES,
    searchable: ['nameAr', 'nameEn', 'internationalBarcode'],
    filterable: ['activeIngredientId', 'companyId', 'pharmaceuticalForm', 'origin', 'status', 'nameEn', 'nameAr'],
  },
];

/**
 * Extracts only minimal required fields (ID, searchable keys, filterable keys)
 * to drastically cut down bandwidth, RAM usage, and index storage size in Meilisearch.
 */
export function transformDocumentForSearch(indexName: SearchIndex, document: Record<string, any>): Record<string, any> {
  if (!document) return {};

  const config = SEARCH_INDEX_CONFIG.find((c) => c.name === indexName);
  if (!config) return document;

  // Preserve primary key 'id' plus all searchable & filterable attributes
  const allowedKeys = new Set<string>([
    'id',
    ...config.searchable,
    ...config.filterable,
  ]);

  const minimalDoc: Record<string, any> = {};
  for (const key of Object.keys(document)) {
    if (allowedKeys.has(key) && document[key] !== undefined && document[key] !== null) {
      minimalDoc[key] = document[key];
    }
  }

  return minimalDoc;
}
