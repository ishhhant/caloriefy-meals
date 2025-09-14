-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  height DECIMAL(5,2),
  weight DECIMAL(5,2),
  gender TEXT CHECK (gender IN ('male', 'female')),
  activity_level INTEGER CHECK (activity_level >= 1 AND activity_level <= 3),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create calorie history table
CREATE TABLE public.calorie_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  height DECIMAL(5,2) NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  gender TEXT NOT NULL,
  activity_level INTEGER NOT NULL,
  maintenance_calories INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for calorie history
ALTER TABLE public.calorie_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calorie history" 
ON public.calorie_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calorie history" 
ON public.calorie_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create meal plans history table
CREATE TABLE public.meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_calories INTEGER NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('vegetarian', 'non-vegetarian')),
  meal_plan JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for meal plans
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own meal plans" 
ON public.meal_plans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal plans" 
ON public.meal_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$;

-- Trigger to create profile on user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();