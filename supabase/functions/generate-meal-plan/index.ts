import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { targetCalories, dietType, mealsPerDay, cuisineType, userId } = await req.json();
    console.log('Received request:', { targetCalories, dietType, mealsPerDay, cuisineType, userId });

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not found');
      throw new Error('GEMINI_API_KEY not found');
    }

    // Prompt
    const prompt = `Generate a detailed ${dietType} meal plan for ${mealsPerDay} meals with ${cuisineType} cuisine for ${targetCalories} calories per day.

IMPORTANT GUIDELINES:
- This meal plan is for FITNESS-FOCUSED individuals who prioritize health
- ALL meals MUST be EASY TO PREPARE AT HOME using simple cooking methods
- Focus on WHOLE FOODS, NATURAL INGREDIENTS, and NUTRIENT-DENSE options
- STRICTLY AVOID: junk food, processed foods, fast food, fried items, packaged snacks, sugary items
- Prioritize: lean proteins, whole grains, fresh vegetables, fruits, healthy fats, legumes
- Use healthy cooking methods: grilling, steaming, baking, sautéing with minimal oil
- Include specific portion sizes and weights for meal tracking

Requirements:
- Diet type: ${dietType} (vegetarian/non-vegetarian/eggeatarian/vegan)
- Cuisine: ${cuisineType}
- Number of meals: ${mealsPerDay}
- Target calories: ${targetCalories}
- Fitness-focused, home-cooked, clean eating only

For each meal, provide:
1. Meal name and timing
2. List of food items with exact weights/quantities (home-cooked preparations)
3. Detailed macronutrient breakdown (calories, protein, carbs, fats)

Return ONLY this JSON (no extra text):

{
  "totalCalories": number,
  "totalProtein": number,
  "totalCarbs": number,
  "totalFats": number,
  "meals": [
    {
      "name": "meal name",
      "time": "time",
      "items": ["food item with weight", "food item with weight"],
      "calories": number,
      "protein": number,
      "carbs": number,
      "fats": number
    }
  ]
}`;

    console.log('Calling Gemini API with prompt length:', prompt.length);

    // Call new Gemini API endpoint
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
            responseMimeType: "application/json" // force JSON
          }
        })
      }
    );

    console.log('Gemini API response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response data:', JSON.stringify(data, null, 2));

    const mealPlanText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    if (!mealPlanText) {
      console.error('Invalid Gemini API response structure:', data);
      throw new Error('Invalid response from Gemini API - no content generated');
    }

    let mealPlan;
    try {
      mealPlan = JSON.parse(mealPlanText);
      console.log('Successfully parsed meal plan:', JSON.stringify(mealPlan, null, 2));
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Failed to parse text:', mealPlanText);
      throw new Error('Failed to parse meal plan from AI response');
    }

    // Store meal plan in database if userId is provided
    if (userId) {
      console.log('Storing meal plan in database for user:', userId);
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error: insertError } = await supabase
        .from('meal_plans')
        .insert({
          user_id: userId,
          target_calories: targetCalories,
          meal_plan: {
            ...mealPlan,
            preferences: { dietType, mealsPerDay, cuisineType }
          },
          meal_type: `${dietType}-${cuisineType}`
        });

      if (insertError) {
        console.error('Error storing meal plan:', insertError);
        throw new Error(`Failed to store meal plan: ${insertError.message}`);
      }
      console.log('Meal plan stored successfully');
    }

    return new Response(JSON.stringify(mealPlan), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-meal-plan function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});