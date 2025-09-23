<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Thermomix Recipe Genius

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

An intelligent web application that leverages AI to generate and convert recipes optimized for the Thermomix TM6 with **precision weight-based measurements**. All recipes emphasize the Thermomix's built-in digital scale for accurate, professional-grade cooking.

## 🤖 How the App Works

### Recipe Generation
The app uses AI (Gemini or Grok) to generate recipes with a strong emphasis on **weight-based measurements** (grams/ounces) rather than volume.

### System Instructions
The AI is specifically instructed to:
- Use grams as the primary unit for ALL ingredients (e.g., "200 g flour", "50 g butter")
- Emphasize the Thermomix's built-in digital scale
- Avoid volume measurements when possible
- Place ingredients directly on the scale in the mixing bowl

### Recipe Structure
- **Ingredients**: Listed with precise weight amounts (e.g., "200 g all-purpose flour")
- **Steps**: Include instructions that reference weighing, but these are text-based only

### The Thermomix TM6 Reality
- **Built-in Scale**: The TM6 does have an integrated digital scale in the mixing bowl
- **Manual Process**: Users must physically place ingredients on the scale and add them until the target weight is reached
- **No App Integration**: The web app has **no direct connection** to the physical Thermomix device

### What Actually Happens
1. The app generates recipes like: "Add 200 g flour to the mixing bowl"
2. The user reads this on their screen
3. The user manually places the mixing bowl on the scale and adds flour until it shows 200g
4. The Thermomix then uses its other functions (mixing, cooking, etc.) based on the recipe steps

### Conclusion
The app successfully creates **weight-focused recipes** that are optimized for the Thermomix's scale capabilities. However, the actual weighing process requires **manual user interaction** with the physical device - the app provides the instructions, but doesn't automate the weighing itself.

## ✨ Features

- **🎯 Weight-Based Precision**: All recipes use grams/ounces as primary measurements
- **🤖 Multi-Provider AI**: Choose between Google Gemini and xAI Grok
- **⚖️ Scale-Optimized**: Instructions designed for Thermomix's built-in weighing system
- **🔄 Recipe Generation**: Create original recipes from simple descriptions
- **📋 Recipe Conversion**: Transform any recipe into weight-based Thermomix format
- **🎛️ TM6 Optimized**: Specific speed settings, temperatures, and durations
- **🧪 API Testing**: Built-in functionality to test your API keys
- **💾 Recipe Storage**: Save and manage your favorite recipes
- **📱 Modern UI**: Clean, responsive interface built with React and Tailwind CSS

## 🚀 Future Versions

We're planning exciting enhancements to bring Thermomix Recipe Genius even closer to seamless integration:

- **🖥️ Official Software Integration**: Direct connection with Thermomix's official Cookidoo platform
- **📤 Recipe Upload**: Automatically add generated recipes to your Thermomix online account
- **🔌 Hardware API**: Real-time weighing data and automated recipe execution
- **📱 Mobile App**: Native iOS/Android apps with enhanced Thermomix connectivity
- **🤖 Smart Scaling**: AI-powered recipe scaling based on available ingredients
- **📊 Nutrition Tracking**: Integration with nutrition databases for complete meal analysis

## 🚀 Quick Start

### Prerequisites

- **Node.js** (version 18 or higher)
- **AI API Key** - Choose one:
  - **Google Gemini API Key** - Get one from [Google AI Studio](https://ai.studio.google.com/)
  - **xAI Grok API Key** - Get one from [xAI Console](https://console.x.ai/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/thermomix-recipe-genius-weight-based.git
   cd thermomix-recipe-genius-weight-based
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

5. **Set up your API key**
   - Go to Profile → Settings
   - Choose your preferred AI provider (Gemini or Grok)
   - Enter your API key
   - Click "Test API" to verify it works

## 📖 Usage

### 🎯 Weight-Based Recipe Generation
This fork specializes in **precision weight measurements** using the Thermomix's built-in digital scale:

- **All solid ingredients** measured in **grams** (e.g., "200g flour", "150g butter")
- **Liquids** measured in **milliliters** when weight isn't practical
- **Scale utilization** emphasized in cooking instructions
- **Professional precision** for consistent results

### Generating a New Recipe
1. Click on the "Generate Recipe" tab
2. Enter a description with weight expectations (e.g., "Chocolate cake with 200g flour and 150g sugar")
3. Select your AI provider (Gemini or Grok)
4. Click "Create Recipe"
5. Get a weight-optimized Thermomix recipe with precise measurements

### Converting an Existing Recipe
1. Click on the "Convert Recipe" tab
2. Paste either:
   - The full text of a recipe (with cups/tablespoons)
   - A URL to a recipe webpage
3. Click "Create Recipe"
4. Receive a weight-based Thermomix adaptation with gram measurements

### Managing API Keys
- Go to Profile → Settings
- Choose between Gemini and Grok providers
- Enter your API key for the selected provider
- Use "Test API" to verify functionality
- Switch providers anytime for comparison

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Project Structure

```
thermomix-recipe-genius/
├── components/           # React components
│   ├── Icons.tsx        # SVG icon components
│   ├── LoadingSpinner.tsx # Loading animation
│   └── RecipeDisplay.tsx # Recipe display component
├── services/            # API services
│   └── geminiService.ts # Gemini AI integration
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
└── index.html          # HTML template
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |

## 🔧 Configuration

The app uses structured output from Gemini AI to ensure consistent recipe formatting. The schema includes:
- Recipe title and description
- Servings and total time
- Ingredient list with amounts
- Step-by-step instructions with Thermomix settings

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Environment Setup for Production

Ensure your production environment has the `GEMINI_API_KEY` set. For client-side applications, consider using environment variables or a backend proxy for API keys.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Important Notes

- **API Key Security**: Never commit your actual Gemini API key to version control. Use `.env.local` and ensure it's in `.gitignore`.
- **AI Limitations**: Recipes are generated by AI and should be reviewed for safety and accuracy before use.
- **Thermomix Compatibility**: Recipes are optimized for TM6 but may work on other models with adjustments.

## 🆘 Troubleshooting

### Common Issues

**"API_KEY environment variable not set"**
- Ensure you've created `.env.local` and added your Gemini API key
- Restart the development server after adding the key

**Build fails**
- Ensure Node.js version 18+
- Run `npm install` to ensure all dependencies are installed

**Recipes not generating**
- Check your internet connection
- Verify your Gemini API key is valid and has quota remaining

## 🙏 Acknowledgments

- Powered by [Google Gemini AI](https://ai.google.dev/)
- Built with [React](https://reactjs.org/) and [Vite](https://vitejs.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

Made with ❤️ for Thermomix enthusiasts
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1oZ529F_sBMwWKx7A1mFAtXo9eiy7qTxX

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
