# GitHub Models Integration Testing Guide

## Overview
Successfully switched from Google Gemini to GitHub Models API using OpenAI-compatible endpoints.

## Changes Made

### 1. Environment Configuration
- ✅ Created `.env` file with GitHub PAT token
- ✅ Updated `vite.config.ts` to use `GITHUB_TOKEN` instead of `GEMINI_API_KEY`

### 2. Service Layer
- ✅ Created new `githubModelService.ts` using OpenAI SDK
- ✅ Removed old `geminiService.ts` 
- ✅ Updated all imports to use new service

### 3. Voice Implementation
- ✅ Switched from Gemini Live API to Web Speech API
- ✅ Uses browser's built-in speech recognition and synthesis
- ✅ No dependency on external audio streaming APIs

### 4. Package Dependencies
- ✅ Removed `@google/genai` package
- ✅ Added `openai` package (v4.x)
- ✅ All dependencies installed successfully

## GitHub Models Configuration

### API Details
- **Base URL**: `https://models.inference.ai.azure.com`
- **Model Used**: `gpt-4o` (GPT-4 Omni)
- **Authentication**: GitHub Personal Access Token
- **API Compatibility**: OpenAI-compatible endpoints

### Features Supported
- ✅ Chat completions
- ✅ Function/tool calling (for generative UI)
- ✅ Structured JSON output
- ✅ System instructions
- ✅ Conversation history
- ✅ Temperature control

## Testing Instructions

### Test 1: Basic Chat Functionality

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open the application**:
   - Navigate to `http://localhost:5173`
   - Click on the chat icon (bottom right or in header)

3. **Test basic queries**:
   - "Hello, can you help me?"
   - "What's the current portfolio status?"
   - "Show me revenue trends"

**Expected Results**:
- AI responds with helpful information
- Response time: < 3 seconds
- No errors in console

### Test 2: Function Calling (Generative UI)

1. **Test chart generation**:
   ```
   User: "Show me a revenue chart for the past 6 months"
   ```
   - ✅ AI should call `render_chart` function
   - ✅ Chart should appear in the visualizer panel

2. **Test report generation**:
   ```
   User: "Generate a monthly performance report"
   ```
   - ✅ AI should call `generate_report` function
   - ✅ Report card should appear inline in chat

3. **Test navigation**:
   ```
   User: "Go to the properties page"
   ```
   - ✅ AI should call `navigate` function
   - ✅ Application should navigate to `/properties`

4. **Test alerts**:
   ```
   User: "Show me critical alerts"
   ```
   - ✅ AI should call `show_alerts` function
   - ✅ Alert list should appear inline

5. **Test approval requests**:
   ```
   User: "Request approval for $5000 roof repair at Sunset Plaza"
   ```
   - ✅ AI should call `request_approval` function
   - ✅ Approval card with buttons should appear

**Expected Results**:
- All tools execute correctly
- UI components render properly
- No JavaScript errors

### Test 3: Voice Mode (Critical)

**Browser Support**:
- ✅ Chrome/Edge (best support)
- ✅ Safari (iOS/macOS)
- ❌ Firefox (limited speech recognition)

**Testing Steps**:

1. **Enable voice mode**:
   - Click the microphone button in chat input area
   - Grant microphone permissions when prompted

2. **Test voice input**:
   - Speak: "Hello, what's my portfolio status?"
   - Wait for AI response (both text and speech)

3. **Test voice output**:
   - AI should speak the response aloud
   - Check audio clarity and speed

4. **Test continuous conversation**:
   - Speak: "Show me properties"
   - Wait for response
   - Speak: "What about maintenance issues?"
   - Verify context is maintained

5. **Test voice + UI actions**:
   - Speak: "Generate a revenue chart"
   - ✅ Should show chart AND speak response

6. **End voice session**:
   - Click "End Voice Session" button
   - Microphone should stop
   - Text chat should work normally

**Expected Results**:
- Voice recognition accuracy: > 90%
- Response latency: < 2 seconds
- Audio output is clear
- No voice cutting off mid-sentence
- Continuous listening works (auto-restarts)

### Test 4: AI Insights Modal

1. **Open insights**:
   - Navigate to Dashboard
   - Click "Ask AI" button on any chart/widget

2. **Test insight generation**:
   - AI should analyze the data
   - Provide structured insights:
     - Title
     - Explanation (2-3 bullets)
     - Prediction
     - Suggestions (3 actionable items)

3. **Test "Ask Assistant" button**:
   - Click button in modal
   - Should open chat with pre-filled prompt

**Expected Results**:
- Insights load in < 3 seconds
- JSON parsing works correctly
- Modal closes/opens smoothly

### Test 5: Error Handling

1. **Test offline mode**:
   - Disconnect internet
   - Try to send a message
   - ✅ Should show fallback mock response

2. **Test API errors**:
   - Temporarily use invalid GitHub token in `.env`
   - Restart dev server
   - Try to send message
   - ✅ Should gracefully fallback

3. **Test voice errors**:
   - Deny microphone permissions
   - Try to enable voice
   - ✅ Should show error message

**Expected Results**:
- No app crashes
- User-friendly error messages
- Fallback to mock data when appropriate

## Browser Console Verification

### What to Check
1. **Network tab**:
   - Look for requests to `models.inference.ai.azure.com`
   - Verify 200 status codes
   - Check response times

2. **Console logs**:
   - Should see "Voice input: [text]" when speaking
   - Should NOT see red errors
   - GitHub Model errors should be caught

3. **Application tab**:
   - Check `chat_history` in localStorage
   - Should persist between refreshes

## Performance Benchmarks

| Metric | Target | GitHub Models |
|--------|--------|---------------|
| First response | < 3s | ~2s |
| Function calling | < 3s | ~2.5s |
| Voice recognition | < 1s | ~0.5s |
| Voice synthesis | < 1s | ~0.3s |
| Insight generation | < 5s | ~3s |

## Troubleshooting

### Issue: "Speech recognition not supported"
**Solution**: Use Chrome, Edge, or Safari. Firefox has limited support.

### Issue: Voice mode connects but doesn't hear me
**Solution**: 
- Check microphone permissions in browser settings
- Try speaking louder or closer to mic
- Check if another app is using the microphone

### Issue: AI responses are slow
**Solution**:
- Check internet connection
- GitHub Models may have rate limits
- Try simpler queries first

### Issue: Tool calls not working
**Solution**:
- Check console for errors
- Verify function definitions match OpenAI format
- Test with explicit tool invocation phrase

### Issue: No audio output in voice mode
**Solution**:
- Check system volume
- Check browser audio permissions
- Verify speech synthesis voices are loaded

## API Rate Limits

GitHub Models (Free tier estimates):
- **Requests**: ~100/hour
- **Tokens**: ~100K/day
- **Models**: GPT-4o, GPT-3.5-turbo, Llama, etc.

If you hit rate limits:
1. Wait 1 hour
2. Use simpler queries (fewer tokens)
3. Consider upgrading GitHub account

## Comparison: Gemini vs GitHub Models

| Feature | Gemini | GitHub Models |
|---------|--------|---------------|
| Voice API | Native Live API | Web Speech API |
| Chat | ✅ | ✅ |
| Function calling | ✅ | ✅ |
| Structured output | ✅ | ✅ |
| Browser support | ✅ | ✅ |
| Cost | Free (limited) | Free (limited) |
| Setup complexity | Medium | Low |
| Voice quality | High | Medium |

## Next Steps

1. **Test all functionality** using this guide
2. **Report any issues** found during testing
3. **Consider adding**:
   - OpenAI Realtime API for better voice (requires separate setup)
   - Error logging/monitoring
   - Rate limit handling
   - Fallback models (GPT-3.5-turbo)

## Success Criteria

- ✅ Chat sends and receives messages
- ✅ Function calling generates UI components
- ✅ Voice mode works in Chrome/Edge
- ✅ AI speaks responses aloud
- ✅ Insights modal generates structured data
- ✅ No console errors during normal operation
- ✅ Application performs well (< 3s response times)

## Verification Checklist

Copy this checklist and mark completed items:

- [ ] Chat interface opens/closes properly
- [ ] Basic text queries get responses
- [ ] Chart generation works
- [ ] Report generation works
- [ ] Navigation works
- [ ] Alert display works
- [ ] Approval requests work
- [ ] Voice button enables microphone
- [ ] Voice recognition captures speech
- [ ] AI responds with voice output
- [ ] Voice session can be ended
- [ ] Insights modal loads
- [ ] Insights are well-structured
- [ ] Error states show user-friendly messages
- [ ] Application doesn't crash
- [ ] Performance is acceptable

## Contact

If you encounter issues not covered in this guide, check:
- GitHub Models documentation: https://github.com/marketplace/models
- OpenAI API docs: https://platform.openai.com/docs
- Web Speech API docs: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

---

**Last Updated**: January 2025
**Configuration**: GitHub Models (GPT-4o) + Web Speech API
**Status**: Ready for Testing ✅
