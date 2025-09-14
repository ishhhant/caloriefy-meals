import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Users, Download, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-nutrition.jpg";
import { CalorieCalculator } from "@/components/CalorieCalculator";
import { MealPlanGenerator } from "@/components/MealPlanGenerator";

const Index = () => {
  const [showCalculator, setShowCalculator] = useState(false);
  const [showMealPlan, setShowMealPlan] = useState(false);

  const features = [
    {
      icon: Calculator,
      title: "Smart Calorie Calculator",
      description: "Get your personalized maintenance calories based on height, weight, gender, and activity level."
    },
    {
      icon: TrendingUp,
      title: "Weight Goal Planning",
      description: "Receive tailored recommendations for weight loss (-200 cal) or weight gain (+200 cal) goals."
    },
    {
      icon: Users,
      title: "Indian Meal Plans",
      description: "Get authentic Indian diet plans with both vegetarian and non-vegetarian options."
    },
    {
      icon: Download,
      title: "PDF Download",
      description: "Download your complete meal plans with detailed macros and micros as PDF."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calculator className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                NutriCalc
              </h1>
            </div>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl font-bold leading-tight">
                  Your Personal{" "}
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Nutrition
                  </span>{" "}
                  Assistant
                </h1>
                <p className="text-xl text-muted-foreground">
                  Calculate your perfect calorie intake and get personalized Indian meal plans 
                  with detailed nutrition information. Transform your health journey today.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => setShowCalculator(true)}
                  className="hero-button text-lg"
                  size="lg"
                >
                  Calculate Calories
                </Button>
                <Button 
                  onClick={() => setShowMealPlan(true)}
                  variant="outline" 
                  size="lg"
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-white text-lg"
                >
                  Generate Meal Plan
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={heroImage} 
                  alt="Healthy nutrition and fitness" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold">Why Choose NutriCalc?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get personalized nutrition guidance powered by advanced AI and designed for Indian dietary preferences.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="feature-card text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold">How It Works</h2>
            <p className="text-xl text-muted-foreground">
              Simple steps to your personalized nutrition plan
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Enter Your Details",
                description: "Provide your height, weight, gender, and activity level for accurate calculations."
              },
              {
                step: "02", 
                title: "Get Calorie Targets",
                description: "Receive your maintenance calories and goal-specific recommendations instantly."
              },
              {
                step: "03",
                title: "Generate Meal Plans",
                description: "Get detailed Indian meal plans with macros, micros, and PDF downloads."
              }
            ].map((step, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-white">
              Ready to Transform Your Nutrition?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Join thousands of users who have already started their healthy journey with personalized meal plans.
            </p>
            <Button 
              onClick={() => setShowCalculator(true)}
              variant="secondary" 
              size="lg"
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-4"
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Calculator className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">NutriCalc</span>
            </div>
            <p className="text-muted-foreground">
              Your personal nutrition assistant powered by AI
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showCalculator && <CalorieCalculator onClose={() => setShowCalculator(false)} />}
      {showMealPlan && <MealPlanGenerator onClose={() => setShowMealPlan(false)} />}
    </div>
  );
};

export default Index;