import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Utensils, Download, Leaf, Beef, Clock, Target, History, Egg, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

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
    mealsPerDay: "3 meals",
    cuisineType: "north-indian"
  });
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mealHistory, setMealHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("generator");
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMealHistory();
    }
  }, [user]);

  const fetchMealHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setMealHistory(data || []);
    } catch (error) {
      console.error('Error fetching meal history:', error);
    }
  };

  const generateMealPlan = async () => {
    const { targetCalories, dietType, mealsPerDay, cuisineType } = formData;
    
    if (!targetCalories || !dietType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate meal plans.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Invoking meal plan generation with:', {
        targetCalories: parseInt(targetCalories),
        dietType,
        mealsPerDay,
        cuisineType,
        userId: user.id
      });
      
      const { data, error } = await supabase.functions.invoke('generate-meal-plan', {
        body: {
          targetCalories: parseInt(targetCalories),
          dietType,
          mealsPerDay,
          cuisineType,
          userId: user.id
        }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      setMealPlan(data);
      fetchMealHistory(); // Refresh history
      
      toast({
        title: "Meal Plan Generated!",
        description: `Your personalized ${dietType} ${cuisineType} meal plan is ready.`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate meal plan. Please try again.",
        variant: "destructive"
      });
      console.error('Error generating meal plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!mealPlan) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 20;

    // Title
    pdf.setFontSize(20);
    pdf.setFont(undefined, 'bold');
    pdf.text('PERSONALIZED MEAL PLAN', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Summary
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text('Daily Nutrition Summary', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Target Calories: ${mealPlan.totalCalories}`, 20, yPosition);
    yPosition += 7;
    pdf.text(`Total Protein: ${mealPlan.totalProtein}g`, 20, yPosition);
    yPosition += 7;
    pdf.text(`Total Carbs: ${mealPlan.totalCarbs}g`, 20, yPosition);
    yPosition += 7;
    pdf.text(`Total Fats: ${mealPlan.totalFats}g`, 20, yPosition);
    yPosition += 15;

    // Meals
    mealPlan.meals.forEach((meal, index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text(`${meal.name} (${meal.time})`, 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      
      // Food items
      meal.items.forEach(item => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(`• ${item}`, 25, yPosition);
        yPosition += 5;
      });

      yPosition += 5;
      
      // Nutrition info
      pdf.text(`Calories: ${meal.calories} | Protein: ${meal.protein}g | Carbs: ${meal.carbs}g | Fats: ${meal.fats}g`, 25, yPosition);
      yPosition += 15;
    });

    // Footer
    pdf.setFontSize(8);
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 20, pdf.internal.pageSize.getHeight() - 10);

    // Save PDF
    pdf.save(`meal-plan-${new Date().toISOString().split('T')[0]}.pdf`);

    toast({
      title: "Downloaded!",
      description: "Your meal plan PDF has been downloaded.",
    });
  };

  const loadHistoryMealPlan = (historyItem: any) => {
    setMealPlan(historyItem.meal_plan);
    setActiveTab("generator");
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            Meal Plan Generator
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generator">Generator</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            {!mealPlan ? (
              <Card>
                <CardHeader>
                  <CardTitle>Create Your Meal Plan</CardTitle>
                  <CardDescription>
                    Get personalized meal plans with detailed nutrition information
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
                          <SelectItem value="eggeatarian">
                            <div className="flex items-center gap-2">
                              <Egg className="h-4 w-4 text-orange-600" />
                              Eggeatarian
                            </div>
                          </SelectItem>
                          <SelectItem value="vegan">
                            <div className="flex items-center gap-2">
                              <Leaf className="h-4 w-4 text-green-800" />
                              Vegan
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="meals">Number of Meals</Label>
                      <Select onValueChange={(value) => setFormData({ ...formData, mealsPerDay: value })}>
                        <SelectTrigger className="input-field">
                          <SelectValue placeholder="Select meals per day" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3 meals">3 Meals</SelectItem>
                          <SelectItem value="3 meals + 1 snack">3 Meals + 1 Snack</SelectItem>
                          <SelectItem value="3 meals + 2 snacks">3 Meals + 2 Snacks</SelectItem>
                          <SelectItem value="4 meals">4 Meals</SelectItem>
                          <SelectItem value="5 meals">5 Small Meals</SelectItem>
                          <SelectItem value="6 meals">6 Small Meals</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cuisine">Cuisine Type</Label>
                      <Select onValueChange={(value) => setFormData({ ...formData, cuisineType: value })}>
                        <SelectTrigger className="input-field">
                          <SelectValue placeholder="Select cuisine type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="north-indian">North Indian</SelectItem>
                          <SelectItem value="south-indian">South Indian</SelectItem>
                          <SelectItem value="maharashtrian">Maharashtrian</SelectItem>
                          <SelectItem value="gujarati">Gujarati</SelectItem>
                          <SelectItem value="punjabi">Punjabi</SelectItem>
                          <SelectItem value="bengali">Bengali</SelectItem>
                          <SelectItem value="continental">Continental</SelectItem>
                          <SelectItem value="mediterranean">Mediterranean</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={generateMealPlan}
                    className="w-full hero-button"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Your Meal Plan...
                      </>
                    ) : (
                      "Generate Meal Plan"
                    )}
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
                        ) : formData.dietType === "eggeatarian" ? (
                          <Egg className="h-3 w-3 text-orange-600" />
                        ) : formData.dietType === "vegan" ? (
                          <Leaf className="h-3 w-3 text-green-800" />
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
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Meal Plan History
                </CardTitle>
                <CardDescription>
                  View and reload your previously generated meal plans
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mealHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No meal plans generated yet. Create your first meal plan!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {mealHistory.map((item, index) => (
                      <Card key={item.id} className="p-4 hover:bg-accent/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">
                              {item.target_calories} Calories • {item.meal_type}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}
                            </p>
                            {item.meal_plan?.preferences && (
                              <div className="flex gap-2 mt-2">
                                <Badge variant="outline">{item.meal_plan.preferences.mealsPerDay}</Badge>
                                <Badge variant="outline">{item.meal_plan.preferences.cuisineType}</Badge>
                              </div>
                            )}
                          </div>
                          <Button 
                            onClick={() => loadHistoryMealPlan(item)}
                            variant="outline"
                            size="sm"
                          >
                            Load Plan
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};