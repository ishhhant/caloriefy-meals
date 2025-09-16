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
    const { 
      targetCalories, 
      dietType, 
      mealsPerDay, 
      cuisineType, 
      userId 
    } = await req.json();

    console.log('Received request:', { targetCalories, dietType, mealsPerDay, cuisineType, userId });

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    console.log('GEMINI_API_KEY available:', !!geminiApiKey);
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not found in environment variables');
      throw new Error('GEMINI_API_KEY not found');
    }

    // Create detailed prompt for Gemini
    const prompt = `Generate a detailed ${dietType} meal plan for ${mealsPerDay} with ${cuisineType} cuisine for ${targetCalories} calories per day.

Requirements:
- Diet type: ${dietType} (vegetarian/non-vegetarian/eggeatarian/vegan)
- Cuisine: ${cuisineType}
- Number of meals: ${mealsPerDay}
- Target calories: ${targetCalories}

For each meal, provide:
1. Meal name and timing
2. List of food items with exact weights/quantities
3. Detailed macronutrient breakdown (calories, protein, carbs, fats)

Return response in this exact JSON format:
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
}

Ensure all nutritional values are accurate and the total calories match the target. Use authentic ${cuisineType} recipes and ingredients.`;

    console.log('Calling Gemini API with prompt length:', prompt.length);

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    console.log('Gemini API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response data:', JSON.stringify(data, null, 2));
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid Gemini API response structure:', data);
      throw new Error('Invalid response from Gemini API - no content generated');
    }

    let mealPlanText = data.candidates[0].content.parts[0].text;
    
    // Clean up the response to extract JSON
    mealPlanText = mealPlanText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let mealPlan;
    try {
      mealPlan = JSON.parse(mealPlanText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Fallback to a basic structure if parsing fails
      throw new Error('Failed to parse meal plan from AI response');
    }

    // Store meal plan in database if userId is provided
    if (userId) {
      console.log('Storing meal plan in database for user:', userId);
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: insertData, error: insertError } = await supabase
        .from('meal_plans')
        .insert({
          user_id: userId,
          target_calories: targetCalories,
          meal_plan: {
            ...mealPlan,
            preferences: {
              dietType,
              mealsPerDay,
              cuisineType
            }
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