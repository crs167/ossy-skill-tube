# 🚀 Ossy Skill Tube - Launch Guide

## Quick Start

### Option 1: Automated Launch (Recommended)
```bash
# Terminal 1: Start Backend
cd backend
./start.sh

# Terminal 2: Start Frontend
./start-frontend.sh
```

### Option 2: Manual Launch
```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend
python3 -m http.server 3000
```

## 🌐 Access URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/vault/videos

## 📋 Prerequisites

### Required Software
- **Node.js** (v18+)
- **npm** (comes with Node.js)
- **FFmpeg** (for video processing)
- **Python 3** (for frontend server)

### FFmpeg Installation
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

## 🔧 Configuration

### 1. Environment Setup
The backend will automatically create a `.env` file from the template. You'll need to configure:

```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
```

### 2. Required Environment Variables
```env
# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Payment Providers (Optional for testing)
XENDIT_SECRET_KEY=your-xendit-secret-key
PAYMONGO_SECRET_KEY=your-paymongo-secret-key
```

## 🎯 Features Ready to Test

### ✅ Video Vault System
- **Upload Videos**: Use the "Become a Creator" button
- **Preview Generation**: Automatic 40-second previews
- **Thumbnail Creation**: Auto-generated from video frames
- **Video Gallery**: Displays all uploaded videos
- **Category Filtering**: Filter by video categories
- **Search Functionality**: Search videos by title/description

### ✅ Frontend Features
- **Responsive Design**: Works on desktop and mobile
- **Video Player**: Modal-based video preview player
- **Upload Modal**: Complete video upload interface
- **Loading States**: Visual feedback during operations
- **Error Handling**: User-friendly error messages

### ✅ Backend API
- **Video Management**: Upload, list, download videos
- **Preview Streaming**: Video preview playback
- **File Processing**: FFmpeg video compression
- **Database Integration**: Firebase Firestore
- **Error Handling**: Comprehensive error responses

## 🧪 Testing the Platform

### 1. Upload Your First Video
1. Open http://localhost:3000
2. Click "Become a Creator"
3. Fill in video details:
   - **Title**: "My First Skill Video"
   - **Description**: "Learn something amazing"
   - **Category**: Choose any category
   - **Price**: 5 OSSY
   - **Video File**: Select any MP4 video file
4. Click "Upload & Process"
5. Wait for processing (compression + preview generation)

### 2. View Uploaded Videos
1. After upload, videos appear in the gallery
2. Click play button to watch preview
3. Use category filters to organize videos
4. Search functionality to find specific videos

### 3. Test Video Player
1. Click any video's play button
2. Preview plays in modal player
3. Shows video stats (views, rating)
4. Download button for purchased videos

## 📁 Directory Structure
```
ossy-skill-tube/
├── index.html              # Frontend application
├── start-frontend.sh       # Frontend launcher
├── backend/
│   ├── src/
│   │   ├── server.ts       # Main server file
│   │   ├── vault/          # Video vault system
│   │   ├── auth/           # Authentication
│   │   ├── payments/       # Payment processing
│   │   └── classes/        # Creator dashboard
│   ├── vault/              # Compressed video storage
│   ├── library/            # User video libraries
│   ├── uploads/            # Temporary upload storage
│   ├── public/
│   │   ├── previews/       # Video preview clips
│   │   └── thumbnails/     # Video thumbnails
│   └── start.sh            # Backend launcher
└── LAUNCH_GUIDE.md         # This file
```

## 🔍 Troubleshooting

### Backend Issues
```bash
# Check if Node.js is installed
node --version

# Check if FFmpeg is installed
ffmpeg -version

# Check if dependencies are installed
cd backend
npm list

# Check server logs
npm run dev
```

### Frontend Issues
```bash
# Check if Python is installed
python3 --version

# Check if backend is running
curl http://localhost:3001/api/vault/videos

# Check browser console for errors
# Press F12 in browser
```

### Common Issues
1. **"FFmpeg not found"**: Install FFmpeg
2. **"Cannot connect to backend"**: Start backend first
3. **"Upload failed"**: Check file size (max 2GB)
4. **"Preview not playing"**: Check video format (MP4 recommended)

## 🚀 Production Deployment

### Backend Deployment
1. Set up production environment variables
2. Install FFmpeg on server
3. Configure Firebase production project
4. Set up payment provider accounts
5. Configure domain and SSL

### Frontend Deployment
1. Build static files
2. Deploy to CDN (Cloudflare, AWS S3)
3. Configure domain
4. Set up SSL certificate

## 📞 Support

For issues or questions:
1. Check the console logs for error details
2. Verify environment variables are correctly set
3. Ensure FFmpeg is properly installed
4. Confirm Firebase project configuration

## 🎉 Success!

Once both servers are running:
- ✅ Backend API: http://localhost:3001
- ✅ Frontend: http://localhost:3000
- ✅ Video uploads working
- ✅ Preview generation working
- ✅ Video gallery displaying
- ✅ Search and filtering working

Your Ossy Skill Tube platform is now live and ready for testing!