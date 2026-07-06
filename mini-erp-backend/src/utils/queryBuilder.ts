import { Model, FilterQuery } from "mongoose";

export interface QueryBuilderOptions {
  searchFields?: string[];
  filterableFields?: string[];
  defaultSort?: string;
  defaultLimit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Generic search + filter + sort + pagination helper reusable across modules
 * (products, sales, etc). Reads `search`, `sort`, `page`, `limit` plus any
 * field named in `filterableFields` from the raw query object.
 */
export async function queryCollection<T>(
  model: Model<T>,
  rawQuery: Record<string, unknown>,
  options: QueryBuilderOptions = {}
): Promise<PaginatedResult<T>> {
  const {
    searchFields = [],
    filterableFields = [],
    defaultSort = "-createdAt",
    defaultLimit = 10,
  } = options;

  const filter: FilterQuery<T> = {};

  const search = typeof rawQuery.search === "string" ? rawQuery.search.trim() : "";
  if (search && searchFields.length > 0) {
    (filter as Record<string, unknown>).$or = searchFields.map((field) => ({
      [field]: { $regex: search, $options: "i" },
    }));
  }

  for (const field of filterableFields) {
    const value = rawQuery[field];
    if (value !== undefined && value !== null && value !== "") {
      (filter as Record<string, unknown>)[field] = value;
    }
  }

  const page = Math.max(parseInt(String(rawQuery.page ?? "1"), 10) || 1, 1);
  const limit = Math.max(parseInt(String(rawQuery.limit ?? String(defaultLimit)), 10) || defaultLimit, 1);
  const sort = typeof rawQuery.sort === "string" && rawQuery.sort ? rawQuery.sort : defaultSort;

  const [items, total] = await Promise.all([
    model
      .find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    model.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.max(Math.ceil(total / limit), 1),
  };
}
