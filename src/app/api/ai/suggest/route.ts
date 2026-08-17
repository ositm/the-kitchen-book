import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { pantry = [], mood = "quick", prompt = "", dietaryPreference } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    // 1. If Gemini API Key is provided, call Google Gemini 1.5/2.0 Flash (Free Tier)
    if (apiKey) {
      try {
        const systemInstruction = `You are "Chef Oracle", an expert Nigerian & West African culinary assistant on The Kitchen Book.
Your mission is to suggest creative, authentic, delicious meals based ONLY or PRIMARILY on what the user has in their pantry: [${pantry.join(", ")}].

Format your response strictly as valid JSON with this schema:
{
  "suggestions": [
    {
      "id": "ai-1",
      "title": "Name of dish",
      "cuisine": "Nigerian / Igbo / Yoruba / Hausa / Street Food",
      "cookTime": "25 mins",
      "difficulty": "Easy / Medium",
      "description": "Short appetizing 2-sentence description",
      "whyItWorks": "Why this combination works with their pantry items",
      "haveIngredients": ["ingredient1", "ingredient2"],
      "missingIngredients": ["optional salt", "optional garnish"],
      "steps": [
        "Step 1: Prep instructions...",
        "Step 2: Cooking instructions...",
        "Step 3: Simmer instructions..."
      ],
      "chefTip": "A practical Nigerian cooking hack (e.g. foil steam trap, palm oil bleaching temperature, etc.)"
    }
  ]
}`;

        const userMessage = `My pantry has: ${pantry.length > 0 ? pantry.join(", ") : "Rice, Tomatoes, Onions, Palm oil, Pepper"}.
${mood ? `Cooking scenario/mood: ${mood}.` : ""}
${prompt ? `User prompt: ${prompt}` : "Suggest 2-3 distinct delicious Nigerian meals I can cook right now with these ingredients."}`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${systemInstruction}\n\n${userMessage}` }] }],
              generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json"
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            if (parsed.suggestions && parsed.suggestions.length > 0) {
              return NextResponse.json({ ...parsed, provider: "Gemini AI Flash" });
            }
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini API call fallback to Chef Oracle Rule Engine:", geminiErr);
      }
    }

    // 2. Built-in Nigerian Culinary Reasoning Engine
    const normalized = pantry.map((i: string) => i.toLowerCase().trim());

    const hasRice = normalized.some((i: string) => i.includes("rice"));
    const hasBeans = normalized.some((i: string) => i.includes("bean"));
    const hasYam = normalized.some((i: string) => i.includes("yam"));
    const hasPlantain = normalized.some((i: string) => i.includes("plantain") || i.includes("dodo"));
    const hasGarri = normalized.some((i: string) => i.includes("garri") || i.includes("cassava"));
    const hasEgg = normalized.some((i: string) => i.includes("egg"));
    const hasTomatoes = normalized.some((i: string) => i.includes("tomato"));
    const hasPalmOil = normalized.some((i: string) => i.includes("palm") || i.includes("red oil"));
    const hasVegOil = normalized.some((i: string) => i.includes("vegetable") || i.includes("oil") || i.includes("groundnut"));
    const hasPepper = normalized.some((i: string) => i.includes("pepper") || i.includes("atarodo") || i.includes("scotch"));
    const hasOnion = normalized.some((i: string) => i.includes("onion"));
    const hasFish = normalized.some((i: string) => i.includes("fish") || i.includes("crayfish"));
    const hasEgusi = normalized.some((i: string) => i.includes("egusi") || i.includes("melon"));
    const hasUgu = normalized.some((i: string) => i.includes("ugu") || i.includes("spinach") || i.includes("leaf") || i.includes("vegetable"));
    const hasOkra = normalized.some((i: string) => i.includes("okra") || i.includes("okro"));
    const hasNoodles = normalized.some((i: string) => i.includes("noodle") || i.includes("indomie") || i.includes("spaghetti") || i.includes("pasta"));

    const suggestions: any[] = [];

    // Combination 1: Rice + Beans -> Classic One-Pot Rice & Beans with Palm Oil Stew
    if (hasRice && hasBeans) {
      suggestions.push({
        id: "ai-rice-and-beans",
        title: "Classic Nigerian Rice & Beans with Smoky Pepper Sauce",
        cuisine: "Nigerian",
        cookTime: "40 mins",
        difficulty: "Easy",
        description: "Tender honey beans boiled together with fluffy rice, topped with a fried spicy pepper and onion sauce.",
        whyItWorks: "The nutty flavor of beans combines with rice starch to form a complete protein meal that satisfies deep hunger.",
        haveIngredients: normalized.filter((i: string) => ["rice", "beans", "palm oil", "vegetable oil", "onions", "pepper", "tomatoes", "maggi"].some(k => i.includes(k))),
        missingIngredients: ["Salt", "Water"],
        steps: [
          "Boil beans in 3 cups of water for 25 minutes until halfway tender.",
          "Wash rice thoroughly and add into the same pot with the beans, adding a pinch of salt.",
          "Cover and simmer on low heat for 15 minutes until both are soft and water is absorbed.",
          "In a separate small pan, heat oil, fry chopped onions and blended peppers for 5 minutes, and pour over the rice & beans."
        ],
        chefTip: "Adding a small piece of unpeeled onion while boiling the beans cuts the cooking time and adds natural sweetness."
      });
    }

    // Combination 2: Yam + Egg / Palm Oil
    if (hasYam) {
      if (hasEgg) {
        suggestions.push({
          id: "ai-yam-egg-sauce",
          title: "Boiled White Yam with Spicy Tomato & Egg Sauce",
          cuisine: "Nigerian",
          cookTime: "20 mins",
          difficulty: "Easy",
          description: "Soft boiled yam slices served with a vibrant, peppery tomato, onion, and egg sauce.",
          whyItWorks: "Warm, fluffy yam is the perfect neutral canvas for rich, seasoned spicy scrambled eggs.",
          haveIngredients: normalized.filter((i: string) => ["yam", "eggs", "onions", "tomatoes", "pepper", "vegetable oil", "maggi"].some(k => i.includes(k))),
          missingIngredients: ["Salt for boiling"],
          steps: [
            "Peel and slice yam into rounds. Boil in salted water for 15 minutes until fork-tender.",
            "Heat 2 tablespoons of oil in a skillet, add diced onions and peppers, and fry for 3 minutes.",
            "Whisk eggs with seasoning and pour into the pan, stirring gently into thick curds.",
            "Serve hot yam with the egg sauce spooned over."
          ],
          chefTip: "Add a splash of water to the boiling yam pot right before taking it off the fire to keep the yam moist and soft."
        });
      } else {
        suggestions.push({
          id: "ai-yam-asaro",
          title: "Rich One-Pot Yam Porridge (Asaro)",
          cuisine: "Yoruba food",
          cookTime: "25 mins",
          difficulty: "Easy",
          description: "Tender yam chunks simmered in a savory palm oil and pepper broth, mashed into a velvety porridge.",
          whyItWorks: "Yam starch naturally thickens the palm oil pepper base into a velvety comforting sauce.",
          haveIngredients: normalized.filter((i: string) => ["yam", "palm oil", "onions", "crayfish", "pepper", "fish", "maggi"].some(k => i.includes(k))),
          missingIngredients: ["Water", "Salt"],
          steps: [
            "Peel and cut yam into bite-sized cubes. Rinse thoroughly.",
            "Place yam in a pot, add water just covering the yam, and bring to a boil for 10 minutes.",
            "Add palm oil, chopped onions, blended pepper, crayfish, and seasoning cubes.",
            "Cook until yam is soft, then lightly mash half the chunks with a wooden spoon to create a thick porridge."
          ],
          chefTip: "Mashing only 50% of the yam leaves hearty bite-sized chunks while creating a rich creamy broth."
        });
      }
    }

    // Combination 3: Noodles
    if (hasNoodles) {
      suggestions.push({
        id: "ai-street-noodles",
        title: "Lagos Street-Style Spicy Stir-Fry Noodles & Egg",
        cuisine: "Street Food",
        cookTime: "10 mins",
        difficulty: "Easy",
        description: "Springy noodles stir-fried in a spicy tomato-onion-pepper relish, topped with a fried sunny egg.",
        whyItWorks: "Fast carbohydrates and savory spice packets elevated with fresh atarodo and fried egg protein.",
        haveIngredients: normalized.filter((i: string) => ["noodle", "eggs", "onions", "pepper", "tomatoes", "vegetable oil"].some(k => i.includes(k))),
        missingIngredients: ["Noodle seasoning packet"],
        steps: [
          "Boil noodles in 1 cup of water for 3 minutes. Drain excess water.",
          "In a frying pan, heat 1 tablespoon of oil, sauté chopped onions and fresh pepper for 2 minutes.",
          "Toss the boiled noodles and seasoning into the pan and stir-fry for 1 minute.",
          "Fry an egg sunny-side up and place directly on top of the spicy noodles."
        ],
        chefTip: "Do not overboil the noodles; leaving them slightly firm gives them that authentic Lagos roadside texture."
      });
    }

    // Combination 4: Plantain (Dodo)
    if (hasPlantain) {
      suggestions.push({
        id: "ai-dodo-frittata",
        title: "Spicy Fried Dodo & Golden Egg Stir-Fry",
        cuisine: "Street Food",
        cookTime: "15 mins",
        difficulty: "Easy",
        description: "Sweet caramelized ripe plantains folded into a spicy onion-tomato scrambled egg frittata.",
        whyItWorks: "The sweetness of ripe dodo balances the peppery bite of seasoned eggs for a quick high-protein breakfast or dinner.",
        haveIngredients: normalized.filter((i: string) => ["plantain", "eggs", "onions", "tomatoes", "pepper", "vegetable oil", "oil"].some(k => i.includes(k))),
        missingIngredients: ["Pinch of salt"],
        steps: [
          "Dice ripe plantains into small cubes and fry in hot vegetable oil until golden brown.",
          "Whisk eggs with a pinch of salt and seasoning cube.",
          "In a clean pan, sauté chopped onions and pepper in 1 tablespoon of oil for 1 minute.",
          "Pour in the whisked eggs and gently fold in the fried plantain cubes until softly set."
        ],
        chefTip: "Sprinkle a dash of dried curry powder into the egg mixture for that distinct Lagos bukkah aroma."
      });
    }

    // Combination 5: Okra + Seafood / Fish
    if (hasOkra) {
      suggestions.push({
        id: "ai-quick-okra",
        title: "15-Minute Fresh Seafood Okra Soup (Ila Alasepo)",
        cuisine: "Yoruba / Niger Delta",
        cookTime: "15 mins",
        difficulty: "Easy",
        description: "Crunchy chopped fresh okra cooked in a light palm oil broth with crayfish, atarodo, and fish.",
        whyItWorks: "Okra cooks in under 8 minutes, locking in vitamins and producing a silky soup with zero wait time.",
        haveIngredients: normalized.filter((i: string) => ["okra", "palm oil", "crayfish", "pepper", "fish", "onions", "maggi"].some(k => i.includes(k))),
        missingIngredients: ["Potash / Kaun (optional)"],
        steps: [
          "Finely chop or grate fresh okra.",
          "Boil 1.5 cups of water with palm oil, crayfish, chopped peppers, and seasoning for 5 minutes.",
          "Add fish or available protein and let it simmer for 3 minutes.",
          "Stir in chopped okra, cook uncovered on medium-high heat for 4 minutes so it stays crunchy and green."
        ],
        chefTip: "Never cover the pot while cooking okra to maintain its bright green color and maximum elasticity."
      });
    }

    // Combination 6: Egusi + Greens / Fish
    if (hasEgusi || (hasUgu && hasPalmOil && !hasOkra)) {
      suggestions.push({
        id: "ai-quick-egusi",
        title: "Caking Style Quick Egusi Soup",
        cuisine: "Igbo / Nigerian",
        cookTime: "25 mins",
        difficulty: "Medium",
        description: "Fluffy clusters of melon seeds cooked in rich palm oil and seasoned crayfish broth, finished with greens.",
        whyItWorks: "Egusi provides healthy proteins and fats, creating a filling soup even without meat.",
        haveIngredients: normalized.filter((i: string) => ["egusi", "palm oil", "crayfish", "onions", "ugu", "fish", "pepper", "maggi"].some(k => i.includes(k))),
        missingIngredients: ["Garri or Semo for swallow"],
        steps: [
          "Mix ground egusi with 3 tablespoons of warm water and a pinch of salt to form a thick paste.",
          "Heat palm oil in a pot, add diced onions, and drop the egusi paste into small lumps.",
          "Fry on low heat for 5 minutes without stirring so the lumps cake into meat-like balls.",
          "Add pepper mix, crayfish, and 1 cup of water. Simmer for 15 minutes, then fold in sliced vegetables."
        ],
        chefTip: "Do not stir the egusi for the first 5 minutes of frying if you want large, fluffy gourmet clusters!"
      });
    }

    // Combination 7: Rice + Palm Oil / Crayfish / Pepper -> Concoction Jollof
    if (hasRice && !hasBeans) {
      suggestions.push({
        id: "ai-concoction-rice",
        title: "Smoky Palm Oil Concoction Rice (Native Jollof)",
        cuisine: "Nigerian",
        cookTime: "30 mins",
        difficulty: "Easy",
        description: "A rustic, flavor-packed one-pot rice infused with red palm oil, ground crayfish, and spicy atarodo.",
        whyItWorks: "Palm oil and crayfish coat long-grain rice grains with deep savory umami without needing expensive meat.",
        haveIngredients: normalized.filter((i: string) => ["rice", "palm oil", "crayfish", "onions", "pepper", "atarodo", "maggi", "fish", "tomatoes"].some(k => i.includes(k))),
        missingIngredients: ["Salt"],
        steps: [
          "Heat palm oil in a pot on medium heat for 2 minutes (do not bleach).",
          "Sauté sliced onions and coarse blended atarodo/tomatoes until fragrant.",
          "Stir in ground crayfish, seasoning cubes, and 2 cups of water.",
          "Add washed rice, cover tightly with foil and a lid, and simmer on low heat for 25 minutes until fluffy."
        ],
        chefTip: "Trap the steam with aluminum foil before putting on the pot lid to guarantee perfectly cooked, non-soggy grains."
      });
    }

    // Combination 8: Garri -> Gourmet Savory Garri Soak
    if (hasGarri && suggestions.length === 0) {
      suggestions.push({
        id: "ai-gourmet-garri",
        title: "Gourmet Ice-Cold Garri with Roasted Groundnuts & Sweet Milk",
        cuisine: "Street Food",
        cookTime: "5 mins",
        difficulty: "Easy",
        description: "Crisp cassava flakes soaked in ice-cold water, topped with crunchy roasted groundnuts and creamy milk.",
        whyItWorks: "The ultimate Nigerian lifesaver: cooling, instantly filling, and combines sweet, salty, and crunchy textures.",
        haveIngredients: normalized.filter((i: string) => ["garri", "groundnut", "sugar", "milk"].some(k => i.includes(k))),
        missingIngredients: ["Cold water", "Ice blocks"],
        steps: [
          "Pour 1 cup of crisp garri into a bowl.",
          "Add cold water and rinse off excess floating chaff once.",
          "Top with chilled water, ice blocks, a spoonful of sugar, and roasted groundnuts.",
          "Pair with warm fried plantain or roasted fish for a royal Nigerian afternoon refreshment."
        ],
        chefTip: "Store garri in the fridge for 10 minutes before soaking to make the flakes extra crunchy!"
      });
    }

    // Fallback if no specific rule matched
    if (suggestions.length === 0) {
      suggestions.push({
        id: "ai-quick-pepper-soup",
        title: "Soothing Nigerian Light Pepper Soup",
        cuisine: "Nigerian",
        cookTime: "20 mins",
        difficulty: "Easy",
        description: "A spicy, fragrant broth seasoned with local spices, onions, and whatever protein or carbs you have.",
        whyItWorks: "A versatile soup that extracts deep flavor from minimal pantry spices and warming peppers.",
        haveIngredients: normalized.slice(0, 4),
        missingIngredients: ["Pepper soup spice mix", "Fresh scent leaf or uziza"],
        steps: [
          "Bring 3 cups of water to a rolling boil with sliced onions and crushed scotch bonnets.",
          "Add your available protein (fish, chicken, or eggs) and seasoning cubes.",
          "Simmer on medium heat for 15 minutes to infuse the broth.",
          "Serve piping hot."
        ],
        chefTip: "Add a squeeze of fresh lime or ginger to cut through richness and soothe the throat."
      });
    }

    return NextResponse.json({
      suggestions: suggestions.slice(0, 3),
      pantryCount: pantry.length,
      provider: "Chef Oracle Culinary Engine"
    });
  } catch (error: any) {
    console.error("AI Meal Suggestion error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate AI meal suggestions" },
      { status: 500 }
    );
  }
}
