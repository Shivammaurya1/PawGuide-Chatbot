# 🐾 PawGuide Pet Chatbot

![PawGuide Banner](https://i.imgur.com/placeholder.jpg)

PawGuide is an AI-powered pet care assistant that provides personalized advice and information about pet care, behavior, training, nutrition, and health. Built with Next.js and powered by Gemini AI, PawGuide offers a modern, responsive interface for pet owners to get reliable information about their furry, feathered, or scaly friends.

## ✨ Features

- **AI-Powered Responses**: Get accurate, helpful information about pet care using Gemini AI
- **Pet Profiles**: Add multiple pets with detailed information for personalized advice
- **Knowledge Cards**: Save useful information for quick reference later
- **Chat History**: Save and load previous conversations
- **Voice Input**: Speak your questions instead of typing
- **Dark/Light Mode**: Choose your preferred theme
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Keyboard Shortcuts**: Navigate efficiently with keyboard commands
- **Accessibility**: Built with accessibility in mind
- **Welcome Tour**: Interactive onboarding for new users
- **Quick Suggestions**: Contextual follow-up questions based on conversation
- **Scroll-to-Top Button**: Easy navigation for long conversations
- **Markdown Support**: Rich text formatting in AI responses

## 🛠️ Technologies Used

- **Frontend**:
  - Next.js 14 (App Router)
  - React 18
  - TypeScript
  - Tailwind CSS
  - shadcn/ui components
  - Framer Motion for animations
  - React Markdown for rendering responses
  - LocalStorage for data persistence

- **Backend**:
  - Python with FastAPI
  - Google Generative AI (Gemini Pro)
  - Next.js API Routes
  - RESTful API design

## 📋 Prerequisites

- Node.js 18.0.0 or later
- Python 3.8 or later
- Google Generative AI API key (Gemini)
- npm or yarn package manager
- Git

## 🚀 Installation and Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/pawguide-pet-chatbot.git
cd pawguide-pet-chatbot
```

### Step 2: Frontend Setup (Next.js)

1. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

2. **Create a `.env.local` file** in the root directory:

   ```env
   BACKEND_URL=http://localhost:8000/api
   ```

3. **Build the application (for production):**

   ```bash
   npm run build
   # or
   yarn build
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

### Step 3: Backend Setup (Python FastAPI)

1. **Navigate to the backend directory:**

   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**

   - macOS/Linux:

     ```bash
     python -m venv venv
     source venv/bin/activate
     ```

   - Windows:

     ```bash
     python -m venv venv
     venv\Scripts\activate
     ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Create a `.env` file** with your API key:

   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

5. **Start the backend server:**

   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Step 4: Verify Installation

- Frontend: [http://localhost:3000](http://localhost:3000)  
- Backend: [http://localhost:8000](http://localhost:8000)  
- API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### ➕ Add Environment Variables

Make sure to add the following environment variable to your project:

```env
BACKEND_URL=http://localhost:8000/api
```

You're now ready to run **PawGuide Pet Chatbot** locally! 🌟

