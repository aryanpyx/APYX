# APYX - Multilingual Voice AI Assistant

## Overview

APYX is a JARVIS-inspired multilingual voice AI assistant built with React and Express. The application supports English, Hindi, and Bhojpuri languages with voice recognition and text-to-speech capabilities. It provides a modern, responsive interface with real-time chat functionality and various AI-powered features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack architecture with clear separation between frontend, backend, and shared components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints under `/api` prefix
- **Development**: Hot reloading with Vite middleware integration

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (Replit Database) - ACTIVE
- **Migrations**: Managed through Drizzle Kit
- **Storage**: DatabaseStorage class implementing full CRUD operations
- **Tables**: Users, Conversations, Reminders, Notes with proper relationships

## Key Components

### Voice Interface
- **Speech Recognition**: Browser Web Speech API for voice input
- **Text-to-Speech**: Web Speech Synthesis API for voice output
- **Language Support**: English (British accent), Hindi, Bhojpuri
- **Activation**: Tap-to-speak interface with visual feedback

### Chat System
- **AI Integration**: OpenAI GPT-4o for conversational AI
- **Message History**: Persistent conversation storage
- **Multilingual Support**: Language detection and appropriate responses
- **Real-time Updates**: Live chat interface with TanStack Query

### UI Components
- **Design System**: shadcn/ui with custom JARVIS-inspired theming
- **Responsive Design**: Mobile-first approach with PWA capabilities
- **Dark Theme**: Space-black aesthetic with cyan/blue accents
- **Interactive Elements**: Animated components with smooth transitions

### Settings Management
- **Voice Configuration**: Enable/disable voice output and accent selection
- **Language Selection**: Dynamic language switching
- **Model Selection**: AI model configuration options
- **Preferences**: Persistent user settings storage

## Data Flow

1. **Voice Input**: User speaks → Web Speech API → Text conversion → API request
2. **Chat Processing**: Message → OpenAI API → AI response → Database storage
3. **Voice Output**: AI response → Text-to-Speech → Audio playback
4. **State Management**: TanStack Query manages server state and caching
5. **Real-time Updates**: Optimistic updates for immediate UI feedback

## External Dependencies

### AI Services
- **OpenAI API**: GPT-4o model for conversational AI
- **Configuration**: Environment variable based API key management
- **Error Handling**: Graceful fallbacks for API failures

### Database
- **Replit PostgreSQL**: Managed PostgreSQL database
- **Connection**: Environment-based connection string (DATABASE_URL)
- **Schema**: User conversations, reminders, and notes with persistent storage
- **Status**: Fully operational with real-time data persistence

### Browser APIs
- **Web Speech API**: For voice recognition functionality
- **Speech Synthesis API**: For text-to-speech output
- **Service Worker**: PWA functionality and offline caching

### UI Libraries
- **Radix UI**: Headless UI primitives for accessibility
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe component variants
- **Date-fns**: Date manipulation utilities

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with Express backend
- **Hot Reloading**: Full-stack hot reload with Vite middleware
- **Environment**: NODE_ENV=development for development features

### Production
- **Build Process**: 
  - Frontend: Vite build to `dist/public`
  - Backend: esbuild compilation to `dist/index.js`
- **Static Serving**: Express serves built frontend assets
- **Process Management**: Single Node.js process serving both frontend and API

### Environment Configuration
- **Database**: `DATABASE_URL` for PostgreSQL connection
- **AI Service**: `OPENAI_API_KEY` or similar for OpenAI integration
- **Build**: Automated build process combining frontend and backend

### PWA Features
- **Service Worker**: Offline caching and background sync
- **Manifest**: App installation capabilities
- **Responsive**: Mobile-optimized interface
- **Performance**: Optimized bundle size and loading times