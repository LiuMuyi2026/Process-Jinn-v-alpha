# Process Jinn

An AI-powered process planning application that breaks down your goals into actionable strategies and steps.

## 🚀 **Quick Start**

### Local Development
```bash
# Clone and install
git clone <repository-url>
cd process-jinn
npm install

# Set up environment
cp .env.example .env.local
# Add your VITE_GEMINI_API_KEY to .env.local

# Start development
npm run dev
```

### One-Click Vercel Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

## ✨ **Features**

- 🤖 **AI-Powered Planning** - Generate strategies and steps using Google Gemini
- 🔐 **Local Authentication** - Email/password with localStorage
- 💾 **Process Management** - Save, load, and delete processes
- 🌐 **Multi-language** - English and Chinese support
- 📱 **Mobile Responsive** - Works on all devices
- ⚡ **Real-time Editing** - Edit steps with smart regeneration options

## 🛠️ **Technology Stack**

- **Frontend**: React 19 + TypeScript + Vite
- **UI**: TailwindCSS + Lucide Icons
- **AI**: Google Gemini API
- **Storage**: Browser localStorage (no backend required)
- **Deployment**: Vercel optimized

## 🌐 **Deployment**

### Vercel (Recommended)
1. **Push to GitHub**
2. **Import on Vercel** - Auto-detects Vite
3. **Set Environment Variable**: `VITE_GEMINI_API_KEY`
4. **Deploy** - Automatic CI/CD

### Manual Deployment
```bash
# Build for production
npm run build

# Deploy using Vercel CLI
npm install -g vercel
vercel --prod

# Or use deployment script
./deploy.sh
```

## 🔧 **Environment Variables**

Required for production:
```env
VITE_GEMINI_API_KEY=your-gemini-api-key
```

Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## 📋 **Project Structure**

```
├── components/          # React components
├── contexts/           # React contexts
├── services/           # API services
├── localDatabase.ts    # Local storage management
├── translations.ts     # Internationalization
├── types.ts           # TypeScript definitions
├── vercel.json       # Vercel configuration
└── deploy.sh         # Deployment script
```

## 🎯 **Usage**

1. **Sign Up** - Create an account with email/password
2. **Set Goal** - Enter what you want to achieve
3. **Generate** - AI creates 3 strategy options
4. **Select** - Choose your preferred strategy
5. **Execute** - Follow step-by-step plan
6. **Edit** - Modify steps with smart regeneration
7. **Save** - Store processes for later

## 🚀 **Performance**

- **Bundle Size**: ~134KB gzipped
- **Load Time**: <2 seconds on 3G
- **Lighthouse**: 90+ Performance score
- **Mobile**: Fully responsive

## 📚 **Documentation**

- [Local Setup Guide](./LOCAL_SETUP.md)
- [API Key Setup](./API_KEY_SETUP.md)
- [Vercel Deployment](./VERCEL_DEPLOYMENT.md)

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

MIT License - feel free to use this project for personal or commercial purposes.

---

**Built with ❤️ using React, TypeScript, and Google Gemini AI**

- 🤖 **AI-Powered Strategy Generation**: Get multiple strategic approaches to your goals
- 📋 **Step-by-Step Planning**: Detailed breakdown with resource requirements
- 👤 **Local Authentication**: Sign up with email/password - no external services needed
- 💾 **Local Database**: Save processes using browser localStorage
- 📚 **Process History**: View all your saved processes with timestamps
- 🌍 **Multi-language Support**: English and Chinese
- 🔄 **Real-time Editing**: Modify steps and regenerate future steps
- 📱 **Responsive Design**: Works on desktop and mobile
- 🚀 **Zero Configuration**: Works immediately without setup

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Modern web browser with localStorage support

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd process-jinn
npm install
```

### 2. Run Locally

```bash
npm run dev
```

Visit `http://localhost:5173` to start using Process Jinn immediately!

### 3. No Setup Required!

That's it! The app works out of the box with:
- ✅ Built-in local authentication

## 🛠️ **Technology Stack**

- **Frontend**: React 19 + TypeScript + Vite
- **UI**: TailwindCSS + Lucide Icons
- **AI**: Google Gemini API
- **Storage**: Browser localStorage (no backend required)
- **Deployment**: Vercel optimized

## 🌐 **Deployment**

### Vercel (Recommended)
1. **Push to GitHub**
2. **Import on Vercel** - Auto-detects Vite
3. **Set Environment Variable**: `VITE_GEMINI_API_KEY`
4. **Deploy** - Automatic CI/CD

### Manual Deployment
```bash
# Build for production
npm run build

# Deploy using Vercel CLI
npm install -g vercel
vercel --prod

# Or use the deployment script
./deploy.sh
```

## 🔧 **Environment Variables**

Required for production:
```env
VITE_GEMINI_API_KEY=your-gemini-api-key
```

Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## 📋 **Project Structure**

```
├── components/          # React components
├── contexts/           # React contexts
├── services/           # API services
├── localDatabase.ts    # Local storage management
├── translations.ts     # Internationalization
├── types.ts           # TypeScript definitions
├── vercel.json       # Vercel configuration
└── deploy.sh         # Deployment script
```

## 🎯 **Usage**

1. **Sign Up** - Create an account with email/password
2. **Set Goal** - Enter what you want to achieve
3. **Generate** - AI creates 3 strategy options
4. **Select** - Choose your preferred strategy
5. **Execute** - Follow the step-by-step plan
6. **Edit** - Modify steps with smart regeneration
7. **Save** - Store processes for later

## 🚀 **Performance**

- **Bundle Size**: ~134KB gzipped
- **Load Time**: <2 seconds on 3G
- **Lighthouse**: 90+ Performance score
- **Mobile**: Fully responsive

## 📚 **Documentation**
import { exportData } from './localDatabase';
const backup = exportData();

// Import data
import { importData } from './localDatabase';
importData(backup);
```

### Clear All Data
```javascript
import { clearAllData } from './localDatabase';
clearAllData();
```

## 📄 Documentation

- [LOCAL_SETUP.md](LOCAL_SETUP.md) - Detailed local database guide
- [SETUP.md](SETUP.md) - Firebase setup (if you want cloud sync)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- 📖 Check [LOCAL_SETUP.md](LOCAL_SETUP.md) for local database details
- 🐛 Report issues on GitHub
- 💬 Join our community discussions

---

**Start planning smarter with Process Jinn today - no setup required! 🚀**
