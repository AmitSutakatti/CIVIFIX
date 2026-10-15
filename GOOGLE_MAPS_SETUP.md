# Google Maps API Setup Guide

This guide will help you set up Google Maps API for location detection in the CivicFix application.

## Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API** (for displaying the map)
   - **Geocoding API** (for converting coordinates to addresses)
   - **Places API** (optional, for place autocomplete)

### Enable APIs:
1. Navigate to "APIs & Services" > "Library"
2. Search for each API and click "Enable"

## Step 2: Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy your API key
4. (Recommended) Restrict the API key:
   - Click on the API key to edit it
   - Under "Application restrictions", select "HTTP referrers"
   - Add your domain (e.g., `http://localhost:3000/*` for development)
   - Under "API restrictions", select "Restrict key"
   - Choose: Maps JavaScript API, Geocoding API

## Step 3: Configure Frontend

1. Create or update `frontend/.env` file:
```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

2. Restart your frontend development server:
```bash
cd frontend
npm run dev
```

## Step 4: Test the Integration

1. Go to the "Report Issue" page
2. Click "Select on Map" button
3. You should see an interactive Google Map
4. Click on the map or drag the marker to select a location
5. The coordinates and address will be automatically filled

## Features

- **Interactive Map**: Click anywhere on the map to select location
- **Draggable Marker**: Drag the marker to fine-tune location
- **Auto-detect Location**: Uses browser geolocation API
- **Reverse Geocoding**: Automatically converts coordinates to address
- **Google Maps Link**: View selected location on Google Maps

## Troubleshooting

### Map Not Loading
- Check if API key is set in `.env` file
- Verify API key is not restricted incorrectly
- Check browser console for errors
- Ensure Maps JavaScript API is enabled

### Geocoding Not Working
- Verify Geocoding API is enabled
- Check API key restrictions
- Ensure API key has access to Geocoding API

### CORS Errors
- Add your domain to API key restrictions
- For development: `http://localhost:3000/*`
- For production: `https://yourdomain.com/*`

## Cost Information

Google Maps API has a free tier:
- **Maps JavaScript API**: $200 free credit per month
- **Geocoding API**: $200 free credit per month
- **Places API**: $200 free credit per month

For most applications, the free tier is sufficient. Monitor usage in Google Cloud Console.

## Security Best Practices

1. **Restrict API Key**: Always restrict your API key to specific domains
2. **Use Environment Variables**: Never commit API keys to version control
3. **Monitor Usage**: Set up billing alerts in Google Cloud Console
4. **Rotate Keys**: Regularly rotate API keys for security

---

**Note**: The map will show an error message if the API key is not configured, but the application will still work with browser geolocation as a fallback.

