import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Target, TrendingUp, TrendingDown } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface CalorieResult {
  maintenance: number;
  weightLoss: number;
  weightGain: number;
  bmr: number;
}

const CalculatorPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    age: "",
    gender: "",
    activityLevel: ""
  });
  const [result, setResult] = useState<CalorieResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const activityLevels = [
    { value: "1.2", label: "Level 1 - Sedentary (little/no exercise)" },
    { value: "1.375", label: "Level 2 - Lightly active (2-3 days/week)" },
    { value: "1.55", label: "Level 3 - Moderately active (4-5 days/week)" },
    { value: "1.725", label: "Level 4 - Very active (6-7 days/week)" },
    { value: "1.9", label: "Level 5 - Super active (2x/day, intense workouts)" }
  ];

  const calculateCalories = async () => {
    const { height, weight, age, gender, activityLevel } = formData;
    
    if (!height || !weight || !age || !gender || !activityLevel) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to calculate your calories.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    const heightCm = parseFloat(height);
    const weightKg = parseFloat(weight);
    const ageYears = parseFloat(age);
    const activity = parseFloat(activityLevel);

    let bmr: number;
    if (gender === "male") {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
    }

    const maintenance = Math.round(bmr * activity);
    const weightLoss = maintenance - 200;
    const weightGain = maintenance + 200;

    try {
      await supabase.from('calorie_history').insert({
        user_id: user!.id,
        height: heightCm,
        weight: weightKg,
        gender,
        activity_level: activity,
        maintenance_calories: maintenance
      });

      setResult({ maintenance, weightLoss, weightGain, bmr: Math.round(bmr) });
      
      toast({
        title: "Calculation Complete!",
        description: "Your personalized calorie targets are ready.",
      });
    } catch (error) {
      console.error('Error saving calorie data:', error);
      setResult({ maintenance, weightLoss, weightGain, bmr: Math.round(bmr) });
    } finally {
      setIsLoading(false);
    }
  };

  const setAsGoal = async () => {
    if (!result || !user) return;

    try {
      await supabase
        .from('profiles')
        .update({
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
          gender: formData.gender,
          activity_level: parseFloat(formData.activityLevel)
        })
        .eq('user_id', user.id);

      toast({
        title: "Goal Set!",
        description: "Your daily calorie goal has been updated.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error('Error setting goal:', error);
      toast({
        title: "Error",
        description: "Failed to set goal. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Calorie Calculator</h1>
            <p className="text-xl text-muted-foreground">
              Calculate your personalized daily calorie requirements
            </p>
          </div>

          {!result ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Enter Your Details
                </CardTitle>
                <CardDescription>
                  Provide accurate information for precise calorie calculations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="170"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="70"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age (years)</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity">Activity Level</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, activityLevel: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      {activityLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={calculateCalories}
                  className="w-full hero-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Calculating..." : "Calculate My Calories"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Your Calorie Results
                  </CardTitle>
                  <CardDescription>
                    Based on Mifflin-St Jeor equation and your activity level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-6 bg-accent/50 rounded-lg">
                      <TrendingDown className="h-8 w-8 text-destructive mx-auto mb-2" />
                      <h3 className="font-semibold text-destructive">Weight Loss</h3>
                      <p className="text-3xl font-bold">{result.weightLoss}</p>
                      <p className="text-sm text-muted-foreground">calories/day</p>
                    </div>
                    <div className="text-center p-6 bg-primary/10 rounded-lg">
                      <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                      <h3 className="font-semibold text-primary">Maintenance</h3>
                      <p className="text-3xl font-bold">{result.maintenance}</p>
                      <p className="text-sm text-muted-foreground">calories/day</p>
                    </div>
                    <div className="text-center p-6 bg-success/10 rounded-lg">
                      <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
                      <h3 className="font-semibold text-success">Weight Gain</h3>
                      <p className="text-3xl font-bold">{result.weightGain}</p>
                      <p className="text-sm text-muted-foreground">calories/day</p>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>BMR:</strong> {result.bmr} calories/day (calories your body burns at rest)
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button onClick={setAsGoal} className="flex-1 hero-button" size="lg">
                  Set as My Daily Goal
                </Button>
                <Button onClick={() => navigate("/dashboard")} variant="outline" className="flex-1" size="lg">
                  Go Back to Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;
