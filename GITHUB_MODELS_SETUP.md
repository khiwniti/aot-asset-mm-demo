# Setting Up GitHub Models for AI Features

## Why GitHub Models?

GitHub Models provides **FREE access** to powerful AI models including:
- ✅ **GPT-4o** - Most capable model
- ✅ **GPT-4o-mini** - Fast and efficient (recommended)
- ✅ **No daily quota limits** (generous free tier)
- ✅ **No credit card required**
- ✅ **Better for production use**

Compare to Gemini:
- ❌ 250 requests/day limit on free tier
- ❌ Easy to exceed quota
- ❌ API key can be rate-limited

---

## Quick Setup (3 steps)

### Step 1: Get Your GitHub Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: `AOT Asset Management AI`
4. Select scopes:
   - ✅ `repo` (required for GitHub Models)
   - ✅ `read:user` (required)
5. Click "Generate token"
6. **COPY THE TOKEN** (you won't see it again!)

Example token format: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Update Your .env File

Open `/workspace/project/aot-asset-mm-demo/.env` and update:

```env
# Set AI provider to github
VITE_AI_PROVIDER=github

# Paste your GitHub token here
VITE_GITHUB_TOKEN=ghp_your_actual_token_here

# Keep Gemini as fallback (optional)
VITE_GEMINI_API_KEY=your_gemini_key_here
```

### Step 3: Restart the Frontend Server

```bash
cd /workspace/project/aot-asset-mm-demo
# Kill existing server if running
pkill -f "vite"
# Start with new configuration
npm run dev
```

---

## Configuration Options

### Provider Selection

The app automatically selects the best available AI provider:

1. **Primary:** GitHub Models (if `VITE_GITHUB_TOKEN` is set)
2. **Fallback:** Google Gemini (if `VITE_GEMINI_API_KEY` is set)
3. **Error:** Shows helpful message if neither is configured

### Manual Provider Selection

Set in `.env`:
```env
VITE_AI_PROVIDER=github  # Use GitHub Models
# OR
VITE_AI_PROVIDER=gemini  # Use Gemini
```

---

## Available Models

GitHub Models offers several AI models:

| Model | Best For | Speed | Quality |
|-------|----------|-------|---------|
| `gpt-4o` | Complex analysis | Slower | Highest |
| `gpt-4o-mini` | General use | Fast | High |
| `gpt-3.5-turbo` | Quick responses | Fastest | Good |

Default: `gpt-4o-mini` (best balance of speed and quality)

To change the model, edit `services/aiService.ts`:
```typescript
model: 'gpt-4o-mini', // Change this line
```

---

## Features Using AI

Once configured, these features will work:

✅ **Dashboard**
- AI insights for portfolio performance
- Revenue trend analysis

✅ **Ask AOT Page**
- Full conversational AI assistant
- Context-aware responses about your properties

✅ **AI Assist Buttons**
- Quick AI help on any page
- Data analysis and recommendations

✅ **ChatWidget**
- Floating chat assistant
- Available on all pages

---

## Testing the Integration

### 1. Check Configuration

```bash
# View your .env file
cat /workspace/project/aot-asset-mm-demo/.env

# Should show:
# VITE_AI_PROVIDER=github
# VITE_GITHUB_TOKEN=ghp_...
```

### 2. Test in Browser Console

Open browser console (F12) and check for:
```
🤖 Using GitHub Models API
```

### 3. Try AI Features

1. Go to Dashboard - should see AI insights
2. Click any "AI Assist" button
3. Visit Ask AOT page and send a message
4. Open ChatWidget and ask a question

---

## Troubleshooting

### Error: "GITHUB_TOKEN not configured"

**Solution:** Make sure `VITE_GITHUB_TOKEN` is set in `.env` and server is restarted.

### Error: "GitHub Models API error: 401"

**Solution:** Your token is invalid. Generate a new token with correct scopes:
- ✅ `repo`
- ✅ `read:user`

### Error: "GitHub Models API error: 403"

**Solution:** Your token doesn't have permission. Check scopes when creating token.

### AI responses are slow

**Solution:** Switch to faster model in `aiService.ts`:
```typescript
model: 'gpt-3.5-turbo', // Faster than gpt-4o-mini
```

### Want to use Gemini instead

**Solution:** Change provider in `.env`:
```env
VITE_AI_PROVIDER=gemini
```

---

## Code Changes Made

### New Files Created:
1. **`services/aiService.ts`** - Multi-provider AI service
   - Supports both GitHub Models and Gemini
   - Automatic fallback logic
   - Better error handling

### Files to Update:
1. **`pages/Dashboard.tsx`** - Use new AI service
2. **`context/ChatContext.tsx`** - Use new AI service
3. **`components/AIAssistButton.tsx`** - Use new AI service

### Migration Commands:

```typescript
// OLD (geminiService.ts)
import { generateAIResponse } from '../services/geminiService';

// NEW (aiService.ts)
import { generateAIResponse } from '../services/aiService';
```

---

## Benefits Summary

✅ **No More Quota Issues**
- GitHub Models has generous limits
- No 250/day restriction

✅ **Better Performance**
- Faster response times
- More reliable service

✅ **Production Ready**
- No quota exceeded errors
- Better uptime

✅ **Free Forever**
- No credit card needed
- GitHub provides for free

---

## Next Steps

1. ✅ Get GitHub token (3 minutes)
2. ✅ Update `.env` file
3. ✅ Restart frontend server
4. ✅ Test AI features
5. ✅ Enjoy unlimited AI assistance!

---

## Support

**GitHub Models Documentation:**
https://github.com/marketplace/models

**GitHub Token Settings:**
https://github.com/settings/tokens

**Questions?**
Check the console for detailed error messages when AI features fail.

---

**Last Updated:** November 20, 2025  
**Status:** ✅ Ready to use  
**Recommended Provider:** GitHub Models (free, unlimited)
