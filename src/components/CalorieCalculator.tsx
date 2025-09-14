import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calculator, Target, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CalorieCalculatorProps {
  onClose: () => void;
}

interface CalorieResult {
  maintenance: number;
  weightLoss: number;
  weightGain: number;
  bmr: number;
}

export const CalorieCalculator = ({ onClose }: CalorieCalculatorProps) => {
  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    age: "",
    gender: "",
    activityLevel: ""
  });
  const [result, setResult] = useState<CalorieResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const activityLevels = [
    { value: "1.2", label: "Level 1 - Sedentary (little/no exercise)" },
    { value: "1.375", label: "Level 2 - Lightly active (2-3 days/week)" },
    { value: "1.55", label: "Level 3 - Moderately active (4-5 days/week)" },
    { value: "1.725", label: "Level 4 - Very active (6-7 days/week)" },
    { value: "1.9", label: "Level 5 - Super active (2x/day, intense workouts)" }
  ];

  const calculateCalories = () => {
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

    // BMR calculation using Mifflin-St Jeor Equation
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

    setTimeout(() => {
      setResult({
        maintenance,
        weightLoss,
        weightGain,
        bmr: Math.round(bmr)
      });
      setIsLoading(false);
      toast({
        title: "Calculation Complete!",
        description: "Your personalized calorie targets are ready.",
      });
    }, 1000);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Calorie Calculator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!result ? (
            <Card>
              <CardHeader>
                <CardTitle>Enter Your Details</CardTitle>
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
                      className="input-field"
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
                      className="input-field"
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
                      className="input-field"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger className="input-field">
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
                    <SelectTrigger className="input-field">
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
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Your Calorie Results
                  </CardTitle>
                  <CardDescription>
                    Based on your personal information and activity level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-accent/50 rounded-lg">
                      <TrendingDown className="h-8 w-8 text-destructive mx-auto mb-2" />
                      <h3 className="font-semibold text-destructive">Weight Loss</h3>
                      <p className="text-2xl font-bold">{result.weightLoss}</p>
                      <p className="text-sm text-muted-foreground">calories/day</p>
                    </div>
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                      <h3 className="font-semibold text-primary">Maintenance</h3>
                      <p className="text-2xl font-bold">{result.maintenance}</p>
                      <p className="text-sm text-muted-foreground">calories/day</p>
                    </div>
                    <div className="text-center p-4 bg-success/10 rounded-lg">
                      <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
                      <h3 className="font-semibold text-success">Weight Gain</h3>
                      <p className="text-2xl font-bold">{result.weightGain}</p>
                      <p className="text-sm text-muted-foreground">calories/day</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>BMR:</strong> {result.bmr} calories/day (calories your body burns at rest)
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button onClick={() => setResult(null)} variant="outline" className="flex-1">
                  Calculate Again
                </Button>
                <Button onClick={onClose} className="flex-1 hero-button">
                  Generate Meal Plan
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};