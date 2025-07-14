# Ossy Skill Tube Backend

A full-stack e-learning platform backend with video vault management, creator dashboard, and live class functionality.

## Features

### ✅ Video Vault System
- **Video Upload & Compression**: FFmpeg-powered video processing
- **Preview Generation**: Automatic 40-second preview clips
- **Thumbnail Creation**: Auto-generated thumbnails from video frames
- **Local Storage**: Videos stored securely in `/vault` directory
- **ZIP Packaging**: Compressed videos packaged for download
- **Library Management**: User library with offline access

### ✅ Creator Dashboard
- **Video Analytics**: Views, purchases, revenue tracking
- **Performance Metrics**: Conversion rates, average ratings
- **Live Class Management**: Schedule and host live sessions
- **Revenue Tracking**: Real-time earnings and transaction history
- **Creator Progression**: Automatic role upgrades based on performance

### ✅ Authentication System
- **Google OAuth**: Secure Google sign-in integration
- **Magic Links**: Passwordless email authentication
- **Role Management**: Viewer/Creator role system
- **Profile Management**: User profile and wallet integration

### ✅ Payment Integration
- **Multi-Provider Support**: Xendit, PayMongo, Crypto
- **Webhook Verification**: Secure payment confirmation
- **Transaction Tracking**: Complete purchase history
- **Wallet System**: OSSY token management

### ✅ Live Class System
- **LiveKit Integration**: Real-time video streaming
- **Booking System**: Class scheduling and participant management
- **Recording**: Automatic session recording and storage
- **Access Control**: Secure room access with tokens

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Required Environment Variables:**
- `FIREBASE_SERVICE_ACCOUNT`: Firebase admin SDK credentials
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `EMAIL_USER` & `EMAIL_PASS`: SMTP credentials for magic links
- `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`: LiveKit configuration
- Payment provider keys (Xendit, PayMongo, etc.)

### 3. FFmpeg Installation
Install FFmpeg for video processing:

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Windows:**
Download from https://ffmpeg.org/download.html

### 4. Directory Structure
The server will automatically create:
```
backend/
├── vault/          # Compressed video storage
├── library/        # User video libraries
├── uploads/        # Temporary upload storage
└── public/
    ├── previews/   # Video preview clips
    └── thumbnails/ # Video thumbnails
```

### 5. Start Development Server
```bash
npm run dev
```

The server will run on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth sign-in
- `POST /api/auth/magic-link` - Send magic link
- `GET /api/auth/verify/:token` - Verify magic link
- `PUT /api/auth/upgrade/:userId` - Upgrade to creator
- `GET /api/auth/profile/:userId` - Get user profile

### Video Vault
- `POST /api/vault/upload` - Upload video to vault
- `GET /api/vault/video/:videoId` - Get video details
- `POST /api/vault/download/:videoId` - Download video to library
- `GET /api/vault/stats/:userId` - Get creator vault stats

### Creator Dashboard
- `GET /api/classes/dashboard/:userId` - Get creator dashboard
- `GET /api/classes/analytics/:videoId` - Get video analytics
- `POST /api/classes/live/:userId` - Create live class
- `POST /api/classes/book/:classId` - Book live class
- `POST /api/classes/join/:classId` - Join live class

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/webhook/xendit` - Xendit webhook
- `POST /api/payments/webhook/paymongo` - PayMongo webhook

## Video Processing Pipeline

1. **Upload**: Video uploaded via multipart form
2. **Compression**: FFmpeg compresses video to optimal quality
3. **Preview**: 40-second preview clip generated
4. **Thumbnail**: Screenshot extracted at 5-second mark
5. **Storage**: Compressed video stored in vault
6. **ZIP**: Video packaged for download
7. **Metadata**: Video info stored in Firestore

## Creator Dashboard Features

### Analytics
- Total videos uploaded
- Total views and purchases
- Revenue tracking
- Average ratings
- Conversion rates

### Live Classes
- Schedule live sessions
- Participant management
- Room access control
- Recording and playback

### Performance Tracking
- Video performance metrics
- Audience engagement
- Revenue optimization
- Creator progression system

## Security Features

- **Webhook Verification**: HMAC signature validation
- **File Upload Security**: File type and size validation
- **Access Control**: Role-based permissions
- **Token Authentication**: Secure API access
- **Video Protection**: Local storage with access control

## Error Handling

The system includes comprehensive error handling for:
- File upload failures
- Video processing errors
- Payment processing issues
- Authentication failures
- Network connectivity problems

## Monitoring

- Console logging for all operations
- Error tracking and reporting
- Performance metrics
- User activity monitoring

## Deployment

### Production Requirements
- Node.js 18+
- FFmpeg installed
- Firebase project configured
- LiveKit server running
- Payment provider accounts
- SMTP email service

### Environment Variables
Ensure all required environment variables are set in production:
- Database credentials
- API keys
- Service account files
- Webhook secrets

## Support

For issues or questions:
1. Check the console logs for error details
2. Verify environment variables are correctly set
3. Ensure FFmpeg is properly installed
4. Confirm Firebase project configuration