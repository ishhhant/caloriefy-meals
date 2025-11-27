import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { History as HistoryIcon, Clock, Utensils, Calendar, Eye } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MealPlanEntry {
  id: string;
  created_at: string;
  target_calories: number;
  meal_type: string;
  meal_plan: any;
}

const History = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mealHistory, setMealHistory] = useState<MealPlanEntry[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MealPlanEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMealHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <HistoryIcon className="h-10 w-10 text-primary" />
              Meal Plan History
            </h1>
            <p className="text-xl text-muted-foreground">
              View and manage your saved meal plans
            </p>
          </div>

          {mealHistory.length === 0 ? (
            <Card className="py-12">
              <CardContent className="text-center space-y-4">
                <Utensils className="h-16 w-16 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">No meal plans yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Generate your first meal plan to get started!
                  </p>
                  <Button onClick={() => navigate("/dashboard")} className="hero-button">
                    Go to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {mealHistory.map((entry) => (
                <Card key={entry.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-base">
                            {entry.target_calories} calories
                          </Badge>
                          <Badge className="text-base capitalize">
                            {entry.meal_type}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(entry.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(entry.created_at).toLocaleTimeString()}
                          </div>
                        </div>

                        {entry.meal_plan?.preferences && (
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary">
                              {entry.meal_plan.preferences.mealsPerDay}
                            </Badge>
                            <Badge variant="secondary">
                              {entry.meal_plan.preferences.cuisineType}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() => setSelectedPlan(entry)}
                        variant="outline"
                        className="ml-4"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedPlan && (
        <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-primary" />
                Meal Plan Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Nutrition Summary</CardTitle>
                  <CardDescription>
                    {new Date(selectedPlan.created_at).toLocaleDateString()} • {selectedPlan.meal_type}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-primary/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Calories</p>
                      <p className="text-2xl font-bold text-primary">
                        {selectedPlan.meal_plan?.totalCalories || selectedPlan.target_calories}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-success/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Protein</p>
                      <p className="text-2xl font-bold text-success">
                        {selectedPlan.meal_plan?.totalProtein || 0}g
                      </p>
                    </div>
                    <div className="text-center p-3 bg-warning/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Carbs</p>
                      <p className="text-2xl font-bold text-warning">
                        {selectedPlan.meal_plan?.totalCarbs || 0}g
                      </p>
                    </div>
                    <div className="text-center p-3 bg-secondary/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Fats</p>
                      <p className="text-2xl font-bold text-secondary">
                        {selectedPlan.meal_plan?.totalFats || 0}g
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedPlan.meal_plan?.meals && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPlan.meal_plan.meals.map((meal: any, index: number) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{meal.name}</span>
                          <Badge variant="outline">{meal.time}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-1">
                          {meal.items?.map((item: string, itemIndex: number) => (
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
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default History;
