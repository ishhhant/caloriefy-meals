# Caloriefy Meals 🍽️

A comprehensive nutrition and meal planning application that helps users calculate their daily calorie needs and generate personalized meal plans based on their dietary preferences and goals.

## 🌟 Features

- **Calorie Calculator**: Calculate daily calorie requirements using the Mifflin-St Jeor equation
- **Personalized Meal Plans**: AI-powered meal plan generation with dietary preferences
- **Multiple Diet Types**: Support for vegetarian, non-vegetarian, vegan, and eggeatarian diets
- **Cuisine Variety**: Indian, Continental, and Chinese cuisine options
- **User Authentication**: Secure user accounts with Supabase
- **Responsive Design**: Beautiful, mobile-friendly interface with dark/light theme support
- **Data Persistence**: Save and track your nutrition history

## 🚀 Live Demo

**[View Live App](https://nutri-calc-beta.vercel.app/)**

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (Database, Authentication, Edge Functions)
- **AI Integration**: Google Gemini API for meal plan generation
- **Deployment**: Vercel
- **Additional**: React Query, React Router, Lucide Icons

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google Gemini API key

## ⚡ Quick Start

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd caloriefy-meals
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase and Gemini API credentials.

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Run the provided migrations in the `supabase/migrations` folder
3. Update your `.env` file with Supabase credentials

### Gemini API Setup
1. Get your API key from Google AI Studio
2. Add the key to your Supabase Edge Function environment variables

## 📱 Usage

1. **Sign up/Login** to create your account
2. **Calculate Calories** by entering your personal details
3. **Generate Meal Plans** by selecting your dietary preferences
4. **View Results** and save your nutrition data
5. **Track Progress** through your saved history

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev) - AI-powered development platform
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Powered by [Supabase](https://supabase.com/) and [Google Gemini](https://ai.google.dev/)

---

⭐ **Star this repo if you found it helpful!**

