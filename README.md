# Swing-Sync 🏌️‍♂️

A modern golf performance tracking and analysis application that helps golfers improve their game through data-driven insights.

## Features

- Track your golf scores and statistics
- Analyze your performance trends
- View detailed shot analytics
- Secure user authentication system
- Performance analytics dashboard
- AI-powered golf advice using Ollama

## Technology Stack

### Frontend

- React 19 with Vite
- Modern JavaScript (ESM)
- ESLint for code quality

### Backend

- Django 5.1
- Django REST Framework
- SimpleJWT for authentication
- SQLite (development) / PostgreSQL (production)
- Ollama for AI-powered advice
- uv for Python package management

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 19+
- npm or yarn
- Git
- Ollama (for AI features)
- uv (for Python package management)

### Development Setup

1. Clone the repository

```bash
git clone https://github.com/eidorb90/swing-sync.git
cd swing-sync
```

2. Backend Setup

```bash
# Install uv if you don't have it
curl -fsSL https://raw.githubusercontent.com/astral-sh/uv/main/install.sh | sh

# Create and activate virtual environment
uv venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
uv pip install -e .

# Run migrations
cd backend
python manage.py migrate

# Start development server
python manage.py runserver
```

3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

4. Ollama Setup (for AI features)

```bash
# Install Ollama (Mac/Linux)
curl -fsSL https://ollama.com/install.sh | sh

# For Windows, download from: https://ollama.com/download

# Pull the golf advice model
ollama run gemma3

# Start Ollama service
ollama serve
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## API Endpoints

### Authentication

- `POST /api/user/signup/` - Register a new user
- `POST /api/user/login/` - User login and JWT token
- `POST /api/token/refresh/` - Refresh JWT token

### Golf Data

- `GET /api/rounds/` - List user's golf rounds
- `POST /api/rounds/` - Record a new round
- `GET /api/statistics/` - View performance statistics
- `GET /api/ai-advice/` - Get AI-powered golf advice

See the full API documentation in `backend/API_DOCS.md` for detailed request/response formats.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
