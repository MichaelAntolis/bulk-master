import { NextRequest, NextResponse } from "next/server";

interface OpenFoodFactsProduct {
  product_name?: string;
  brands?: string;
  code?: string;
  nutriments?: {
    "energy-kcal_100g"?: number;
    "energy-kcal"?: number;
    proteins_100g?: number;
    proteins?: number;
    carbohydrates_100g?: number;
    carbohydrates?: number;
    fat_100g?: number;
    fat?: number;
  };
}

interface NormalizedFood {
  food_name: string;
  brand: string;
  barcode: string;
  calories_per_100g: number;
  protein_g_per_100g: number;
  carbs_g_per_100g: number;
  fat_g_per_100g: number;
}

// Static fallback data jika Open Food Facts tidak bisa diakses
const FALLBACK_FOODS: NormalizedFood[] = [
  { food_name: "Chicken Breast", brand: "Generic", barcode: "", calories_per_100g: 165, protein_g_per_100g: 31, carbs_g_per_100g: 0, fat_g_per_100g: 3.6 },
  { food_name: "Eggs", brand: "Generic", barcode: "", calories_per_100g: 155, protein_g_per_100g: 13, carbs_g_per_100g: 1.1, fat_g_per_100g: 11 },
  { food_name: "White Rice (cooked)", brand: "Generic", barcode: "", calories_per_100g: 130, protein_g_per_100g: 2.7, carbs_g_per_100g: 28, fat_g_per_100g: 0.3 },
  { food_name: "Oats", brand: "Generic", barcode: "", calories_per_100g: 389, protein_g_per_100g: 17, carbs_g_per_100g: 66, fat_g_per_100g: 7 },
  { food_name: "Banana", brand: "Generic", barcode: "", calories_per_100g: 89, protein_g_per_100g: 1.1, carbs_g_per_100g: 23, fat_g_per_100g: 0.3 },
  { food_name: "Whole Milk", brand: "Generic", barcode: "", calories_per_100g: 61, protein_g_per_100g: 3.2, carbs_g_per_100g: 4.8, fat_g_per_100g: 3.3 },
  { food_name: "Greek Yogurt", brand: "Generic", barcode: "", calories_per_100g: 59, protein_g_per_100g: 10, carbs_g_per_100g: 3.6, fat_g_per_100g: 0.4 },
  { food_name: "Almonds", brand: "Generic", barcode: "", calories_per_100g: 579, protein_g_per_100g: 21, carbs_g_per_100g: 22, fat_g_per_100g: 50 },
  { food_name: "Sweet Potato", brand: "Generic", barcode: "", calories_per_100g: 86, protein_g_per_100g: 1.6, carbs_g_per_100g: 20, fat_g_per_100g: 0.1 },
  { food_name: "Salmon", brand: "Generic", barcode: "", calories_per_100g: 208, protein_g_per_100g: 20, carbs_g_per_100g: 0, fat_g_per_100g: 13 },
  { food_name: "Tuna (canned)", brand: "Generic", barcode: "", calories_per_100g: 116, protein_g_per_100g: 26, carbs_g_per_100g: 0, fat_g_per_100g: 1 },
  { food_name: "Brown Rice (cooked)", brand: "Generic", barcode: "", calories_per_100g: 111, protein_g_per_100g: 2.6, carbs_g_per_100g: 23, fat_g_per_100g: 0.9 },
  { food_name: "Pasta (cooked)", brand: "Generic", barcode: "", calories_per_100g: 131, protein_g_per_100g: 5, carbs_g_per_100g: 25, fat_g_per_100g: 1.1 },
  { food_name: "Bread (Whole Wheat)", brand: "Generic", barcode: "", calories_per_100g: 247, protein_g_per_100g: 13, carbs_g_per_100g: 41, fat_g_per_100g: 4.2 },
  { food_name: "Peanut Butter", brand: "Generic", barcode: "", calories_per_100g: 588, protein_g_per_100g: 25, carbs_g_per_100g: 20, fat_g_per_100g: 50 },
  { food_name: "Beef (ground, lean)", brand: "Generic", barcode: "", calories_per_100g: 215, protein_g_per_100g: 26, carbs_g_per_100g: 0, fat_g_per_100g: 12 },
  { food_name: "Whey Protein Powder", brand: "Generic", barcode: "", calories_per_100g: 400, protein_g_per_100g: 80, carbs_g_per_100g: 8, fat_g_per_100g: 5 },
  { food_name: "Broccoli", brand: "Generic", barcode: "", calories_per_100g: 34, protein_g_per_100g: 2.8, carbs_g_per_100g: 7, fat_g_per_100g: 0.4 },
  { food_name: "Avocado", brand: "Generic", barcode: "", calories_per_100g: 160, protein_g_per_100g: 2, carbs_g_per_100g: 9, fat_g_per_100g: 15 },
  { food_name: "Cottage Cheese", brand: "Generic", barcode: "", calories_per_100g: 98, protein_g_per_100g: 11, carbs_g_per_100g: 3.4, fat_g_per_100g: 4.3 },
];

function searchFallback(query: string): NormalizedFood[] {
  const q = query.toLowerCase().trim();
  return FALLBACK_FOODS.filter(
    (f) => f.food_name.toLowerCase().includes(q)
  ).slice(0, 8);
}

async function fetchOpenFoodFacts(query: string, page = "1"): Promise<NormalizedFood[]> {
  // Try World first, fallback to Indonesia server
  const baseUrls = [
    "https://world.openfoodfacts.org",
    "https://id.openfoodfacts.org",
  ];

  for (const baseUrl of baseUrls) {
    try {
      const url = new URL(`${baseUrl}/cgi/search.pl`);
      url.searchParams.set("search_terms", query.trim());
      url.searchParams.set("search_simple", "1");
      url.searchParams.set("action", "process");
      url.searchParams.set("json", "1");
      url.searchParams.set("page_size", "12");
      url.searchParams.set("page", page);
      url.searchParams.set("fields", "product_name,brands,code,nutriments");

      const response = await fetch(url.toString(), {
        signal: AbortSignal.timeout(8000), // 8 second timeout
        headers: {
          "User-Agent": "BulkMaster/1.0 nutritional tracker",
          "Accept": "application/json",
        },
      });

      if (!response.ok) continue;

      // Safety: check Content-Type before parsing JSON
      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json") && !contentType.includes("text/json")) {
        console.warn(`Food Facts returned non-JSON response from ${baseUrl}`);
        continue;
      }

      const data = await response.json();
      const products: OpenFoodFactsProduct[] = data.products || [];

      const results: NormalizedFood[] = products
        .filter(
          (p) =>
            p.product_name &&
            (p.nutriments?.["energy-kcal_100g"] !== undefined ||
              p.nutriments?.["energy-kcal"] !== undefined)
        )
        .map((p) => ({
          food_name: p.product_name!,
          brand: p.brands || "",
          barcode: p.code || "",
          calories_per_100g: Math.round(
            p.nutriments?.["energy-kcal_100g"] ??
            p.nutriments?.["energy-kcal"] ?? 0
          ),
          protein_g_per_100g:
            Math.round((p.nutriments?.proteins_100g ?? p.nutriments?.proteins ?? 0) * 10) / 10,
          carbs_g_per_100g:
            Math.round((p.nutriments?.carbohydrates_100g ?? p.nutriments?.carbohydrates ?? 0) * 10) / 10,
          fat_g_per_100g:
            Math.round((p.nutriments?.fat_100g ?? p.nutriments?.fat ?? 0) * 10) / 10,
        }))
        .filter((f) => f.calories_per_100g > 0)
        .slice(0, 8);

      if (results.length > 0) return results;
    } catch (err) {
      console.warn(`Food Facts fetch failed for ${baseUrl}:`, (err as Error).message);
    }
  }

  return []; // Both URLs failed
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const page = searchParams.get("page") || "1";

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [], source: "empty" });
  }

  // Try Open Food Facts
  const offResults = await fetchOpenFoodFacts(query, page);

  if (offResults.length > 0) {
    return NextResponse.json({ results: offResults, source: "openfoodfacts" });
  }

  // Fallback: search local static database
  const fallbackResults = searchFallback(query);
  return NextResponse.json({
    results: fallbackResults,
    source: "local",
    notice: fallbackResults.length === 0
      ? "No results found. Try manual entry."
      : "Showing local database (Open Food Facts temporarily unavailable)",
  });
}
