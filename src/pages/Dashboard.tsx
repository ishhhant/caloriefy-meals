import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Utensils, History, Target } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MealPlanGenerator } from "@/components/MealPlanGenerator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showMealPlan, setShowMealPlan] = useState(false);
  const [dailyGoal, setDailyGoal] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDailyGoal();
    }
  }, [user]);

  const fetchDailyGoal = async () => {
    if (!user) return;

    try {
      // First check profiles table for stored goal
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData?.height && profileData?.weight && profileData?.activity_level && profileData?.gender) {
        // Calculate maintenance calories from profile
        const heightCm = profileData.height;
        const weightKg = profileData.weight;
        const activity = profileData.activity_level;
        const gender = profileData.gender;

        // Estimate age as 25 (can be stored in profile if needed)
        const ageYears = 25;

        let bmr: number;
        if (gender === "male") {
          bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
        } else {
          bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
        }

        const maintenance = Math.round(bmr * activity);
        setDailyGoal(maintenance);
        return;
      }

      // Fallback to last calorie history entry
      const { data: historyData } = await supabase
        .from('calorie_history')
        .select('maintenance_calories')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (historyData) {
        setDailyGoal(historyData.maintenance_calories);
      }
    } catch (error) {
      console.error('Error fetching daily goal:', error);
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-xl text-muted-foreground">
              Your nutrition dashboard is ready
            </p>
          </div>

          {/* Daily Goal Card */}
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Today's Calorie Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dailyGoal ? (
                <div>
                  <p className="text-4xl font-bold text-primary">{dailyGoal}</p>
                  <p className="text-muted-foreground">calories per day</p>
                </div>
              ) : (
                <div>
                  <p className="text-muted-foreground mb-4">
                    No calorie goal set yet. Calculate your personalized target!
                  </p>
                  <Button
                    onClick={() => navigate("/calculator")}
                    className="hero-button"
                  >
                    Calculate Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="feature-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/calculator")}>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Calculator className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Calculate Calories</CardTitle>
                <CardDescription>
                  Get your personalized daily calorie target based on your stats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Start Calculator
                </Button>
              </CardContent>
            </Card>

            <Card className="feature-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowMealPlan(true)}>
              <CardHeader>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                  <Utensils className="h-6 w-6 text-success" />
                </div>
                <CardTitle>Generate Meal Plan</CardTitle>
                <CardDescription>
                  Create a personalized meal plan with Indian cuisine options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full hero-button">
                  Generate Now
                </Button>
              </CardContent>
            </Card>

            <Card className="feature-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/history")}>
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <History className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>View History</CardTitle>
                <CardDescription>
                  Access your saved meal plans and calorie calculations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  View History
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showMealPlan && <MealPlanGenerator onClose={() => setShowMealPlan(false)} />}
    </div>
  );
};

export default Dashboard;
