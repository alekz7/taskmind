# TaskMind - AI-Powered Task Planning

TaskMind is a modern task management application that uses AI to help you organize, prioritize, and optimize your workflow. Built with React, TypeScript, and Firebase.

## Features

- **Smart Task Management**: Create, edit, and organize tasks with drag-and-drop functionality
- **Voice to Task**: Record audio and automatically convert it to tasks using AI transcription
- **AI Suggestions**: Get intelligent recommendations for task prioritization and scheduling
- **Real-time Sync**: Tasks sync across devices in real-time using Firebase
- **Multi-language Support**: Available in English, Spanish, and German
- **Dark/Light Theme**: Customizable theme preferences
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Voice to Task Feature

The application includes a voice recording feature that converts speech to text and creates tasks automatically. This feature supports:

- **ElevenLabs Integration**: Uses ElevenLabs Speech-to-Text API for accurate transcription
- **Fallback Service**: Provides demo functionality when API key is not configured
- **Audio Recording**: High-quality audio recording with noise suppression
- **Playback**: Review your recording before processing
- **Error Handling**: Graceful fallback and error messages

### Setting up ElevenLabs API

1. Sign up for an account at [ElevenLabs](https://elevenlabs.io)
2. Navigate to [API Settings](https://elevenlabs.io/app/settings/api-keys)
3. Generate a new API key
4. Add it to your `.env` file:
   ```
   VITE_ELEVENLABS_API_KEY=your_api_key_here
   ```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project (for authentication and database)
- ElevenLabs API key (optional, for voice transcription)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd taskmind
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Fill in your Firebase and ElevenLabs configuration in the `.env` file.

4. Start the development server:
   ```bash
   npm run dev
   ```

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database
4. Get your Firebase configuration from Project Settings
5. Update the `.env` file with your Firebase credentials

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_FIREBASE_API_KEY` | Firebase API key | Yes |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Yes |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | Yes |
| `VITE_ELEVENLABS_API_KEY` | ElevenLabs API key for voice transcription | No |

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Voice Processing**: ElevenLabs Speech-to-Text API
- **Animations**: Framer Motion
- **Drag & Drop**: react-beautiful-dnd
- **Internationalization**: react-i18next
- **Build Tool**: Vite

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── audio/          # Audio recording components
│   ├── dashboard/      # Dashboard-specific components
│   ├── layout/         # Layout components
│   ├── tasks/          # Task management components
│   └── ui/             # Basic UI components
├── lib/                # External service integrations
├── pages/              # Page components
├── store/              # Zustand stores
├── types/              # TypeScript type definitions
└── i18n/               # Internationalization setup
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.