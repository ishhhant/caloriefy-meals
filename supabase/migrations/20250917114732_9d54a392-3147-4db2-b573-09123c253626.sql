-- Drop the existing restrictive constraint
ALTER TABLE public.meal_plans DROP CONSTRAINT meal_plans_meal_type_check;

-- Add a new constraint that allows all diet types and their combinations with cuisine
ALTER TABLE public.meal_plans ADD CONSTRAINT meal_plans_meal_type_check 
CHECK (meal_type ~ '^(vegetarian|non-vegetarian|eggeatarian|vegan)(-[a-z-]+)?$');