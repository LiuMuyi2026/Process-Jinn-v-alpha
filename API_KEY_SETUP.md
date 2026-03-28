# Gemini API Key Setup

The "Failed to generate content" error occurs because the Gemini API key is not properly configured.

## 🔧 **Quick Fix**

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Update Your Environment

Replace the placeholder in `.env.local`:

```env
VITE_GEMINI_API_KEY=your-actual-gemini-api-key-here
```

### 3. Restart Development Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## 🚨 **Important Notes**

- **Never commit API keys** to Git (they're in .gitignore)
- **Keep your API key private** - don't share it
- **Free tier limits** apply - you may hit rate limits

## 🔍 **Testing the Fix**

1. After adding your API key, try creating a process
2. Enter a goal like "Learn to cook pasta"
3. Click generate
4. Should see AI-generated strategies

## 🛠️ **Troubleshooting**

### Still Getting Errors?

1. **Check API key format**: Should start with "AIza..."
2. **Verify environment variable**: Must be `VITE_GEMINI_API_KEY`
3. **Restart server**: Environment changes need restart
4. **Check console**: Look for specific error messages

### API Key Issues?

- **Invalid API key**: Double-check the key is copied correctly
- **Rate limited**: Wait a few minutes and try again
- **No internet**: Check your connection

## 📋 **Environment Variables Reference**

Your `.env.local` should look like:

```env
# Gemini AI API Key (required for AI features)
VITE_GEMINI_API_KEY=AIzaSy...your-full-api-key-here
```

## ✅ **Verification**

Once configured correctly:
- ✅ Authentication works (local database)
- ✅ AI generation works (Gemini API)
- ✅ Process saving works (localStorage)
- ✅ Full app functionality

---

**Need help?** Check the browser console (F12) for detailed error messages!
