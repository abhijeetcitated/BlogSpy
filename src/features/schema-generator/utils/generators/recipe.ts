// Recipe Schema Generator

import type { RecipeSchema } from "../../types"

/**
 * Generate JSON-LD for Recipe schema
 */
export function generateRecipeSchema(data: RecipeSchema): object {
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "name": data.name,
    "description": data.description,
    "image": data.image,
    "author": {
      "@type": "Person",
      "name": data.author
    },
    "prepTime": data.prepTime,
    "cookTime": data.cookTime,
    "totalTime": data.totalTime,
    "recipeYield": data.recipeYield,
    "recipeCategory": data.recipeCategory,
    "recipeCuisine": data.recipeCuisine,
    "recipeIngredient": data.ingredients,
    "recipeInstructions": data.instructions.map((instruction, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "text": instruction
    })),
    ...(data.nutrition && {
      "nutrition": {
        "@type": "NutritionInformation",
        "calories": data.nutrition.calories
      }
    })
  }
}
