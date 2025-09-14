import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Utensils, Download, Leaf, Beef, Clock, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MealPlanGeneratorProps {
  onClose: () => void;
}

interface Meal {
  name: string;
  items: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  time: string;
}

interface MealPlan {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  meals: Meal[];
}

export const MealPlanGenerator = ({ onClose }: MealPlanGeneratorProps) => {
  const [formData, setFormData] = useState({
    targetCalories: "",
    dietType: "",
    mealsPerDay: "4"
  });
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Sample meal plans - In real implementation, this would come from Gemini API
  const sampleVegMealPlan: MealPlan = {
    totalCalories: 2000,
    totalProtein: 80,
    totalCarbs: 250,
    totalFats: 67,
    meals: [
      {
        name: "Breakfast",
        time: "7:00 AM",
        items: ["2 Whole Wheat Parathas", "1 Cup Dal", "1 Glass Milk", "1 Apple"],
        calories: 450,
        protein: 18,
        carbs: 65,
        fats: 12
      },
      {
        name: "Lunch", 
        time: "1:00 PM",
        items: ["1.5 Cups Rice", "Dal Tadka", "Mixed Vegetable Sabzi", "1 Cup Curd", "Salad"],
        calories: 600,
        protein: 22,
        carbs: 85,
        fats: 18
      },
      {
        name: "Evening Snack",
        time: "4:00 PM", 
        items: ["1 Cup Masala Chai", "4 Marie Biscuits", "Handful Almonds"],
        calories: 250,
        protein: 8,
        carbs: 30,
        fats: 12
      },
      {
        name: "Dinner",
        time: "8:00 PM",
        items: ["3 Rotis", "Rajma Curry", "Jeera Rice", "Raita", "Green Salad"],
        calories: 700,
        protein: 32,
        carbs: 70,
        fats: 25
      }
    ]
  };

  const sampleNonVegMealPlan: MealPlan = {
    totalCalories: 2000,
    totalProtein: 100,
    totalCarbs: 200,
    totalFats: 67,
    meals: [
      {
        name: "Breakfast",
        time: "7:00 AM", 
        items: ["2 Egg Paratha", "1 Glass Milk", "1 Banana"],
        calories: 480,
        protein: 25,
        carbs: 55,
        fats: 15
      },
      {
        name: "Lunch",
        time: "1:00 PM",
        items: ["1.5 Cups Rice", "Chicken Curry (150g)", "Dal", "Salad"],
        calories: 650,
        protein: 35,
        carbs: 60,
        fats: 20
      },
      {
        name: "Evening Snack", 
        time: "4:00 PM",
        items: ["Boiled Eggs (2)", "1 Cup Green Tea", "Handful Nuts"],
        calories: 280,
        protein: 15,
        carbs: 8,
        fats: 18
      },
      {
        name: "Dinner",
        time: "8:00 PM",
        items: ["3 Rotis", "Fish Curry (120g)", "Vegetable Sabzi", "Curd"],
        calories: 590,
        protein: 25,
        carbs: 77,
        fats: 14
      }
    ]
  };

  const generateMealPlan = async () => {
    const { targetCalories, dietType } = formData;
    
    if (!targetCalories || !dietType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call - In real implementation, call Gemini API here
    setTimeout(() => {
      const plan = dietType === "vegetarian" ? sampleVegMealPlan : sampleNonVegMealPlan;
      
      // Scale the meal plan to match target calories
      const scaleFactor = parseInt(targetCalories) / plan.totalCalories;
      const scaledPlan: MealPlan = {
        totalCalories: parseInt(targetCalories),
        totalProtein: Math.round(plan.totalProtein * scaleFactor),
        totalCarbs: Math.round(plan.totalCarbs * scaleFactor),
        totalFats: Math.round(plan.totalFats * scaleFactor),
        meals: plan.meals.map(meal => ({
          ...meal,
          calories: Math.round(meal.calories * scaleFactor),
          protein: Math.round(meal.protein * scaleFactor),
          carbs: Math.round(meal.carbs * scaleFactor),
          fats: Math.round(meal.fats * scaleFactor)
        }))
      };

      setMealPlan(scaledPlan);
      setIsLoading(false);
      
      toast({
        title: "Meal Plan Generated!",
        description: `Your personalized ${dietType} meal plan is ready.`,
      });
    }, 2000);
  };

  const downloadPDF = () => {
    toast({
      title: "PDF Download",
      description: "PDF generation will be available after Supabase integration.",
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            Meal Plan Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!mealPlan ? (
            <Card>
              <CardHeader>
                <CardTitle>Create Your Meal Plan</CardTitle>
                <CardDescription>
                  Get personalized Indian meal plans with detailed nutrition information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="calories">Target Calories</Label>
                    <Input
                      id="calories"
                      type="number"
                      placeholder="2000"
                      value={formData.targetCalories}
                      onChange={(e) => setFormData({ ...formData, targetCalories: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diet">Diet Preference</Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, dietType: value })}>
                      <SelectTrigger className="input-field">
                        <SelectValue placeholder="Select diet type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vegetarian">
                          <div className="flex items-center gap-2">
                            <Leaf className="h-4 w-4 text-green-600" />
                            Vegetarian
                          </div>
                        </SelectItem>
                        <SelectItem value="non-vegetarian">
                          <div className="flex items-center gap-2">
                            <Beef className="h-4 w-4 text-red-600" />
                            Non-Vegetarian
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={generateMealPlan}
                  className="w-full hero-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Generating Your Meal Plan..." : "Generate Meal Plan"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Daily Nutrition Summary
                    </CardTitle>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {formData.dietType === "vegetarian" ? (
                        <Leaf className="h-3 w-3 text-green-600" />
                      ) : (
                        <Beef className="h-3 w-3 text-red-600" />
                      )}
                      {formData.dietType}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-primary/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Calories</p>
                      <p className="text-2xl font-bold text-primary">{mealPlan.totalCalories}</p>
                    </div>
                    <div className="text-center p-3 bg-success/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Protein</p>
                      <p className="text-2xl font-bold text-success">{mealPlan.totalProtein}g</p>
                    </div>
                    <div className="text-center p-3 bg-warning/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Carbs</p>
                      <p className="text-2xl font-bold text-warning">{mealPlan.totalCarbs}g</p>
                    </div>
                    <div className="text-center p-3 bg-secondary/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Fats</p>
                      <p className="text-2xl font-bold text-secondary">{mealPlan.totalFats}g</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Meal Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mealPlan.meals.map((meal, index) => (
                  <Card key={index} className="feature-card">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{meal.name}</span>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {meal.time}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        {meal.items.map((item, itemIndex) => (
                          <p key={itemIndex} className="text-sm text-muted-foreground">
                            • {item}
                          </p>
                        ))}
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Calories:</span> {meal.calories}
                        </div>
                        <div>
                          <span className="font-medium">Protein:</span> {meal.protein}g
                        </div>
                        <div>
                          <span className="font-medium">Carbs:</span> {meal.carbs}g
                        </div>
                        <div>
                          <span className="font-medium">Fats:</span> {meal.fats}g
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button onClick={() => setMealPlan(null)} variant="outline" className="flex-1">
                  Generate New Plan
                </Button>
                <Button onClick={downloadPDF} className="flex-1 hero-button flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};