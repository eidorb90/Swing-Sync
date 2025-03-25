# Swing-Sync 🏌️‍♂️

A modern golf performance tracking and analysis application that helps golfers improve their game through data-driven insights.

## Features

- Track your golf scores and statistics
- Analyze your performance trends
- View detailed shot analytics
- Secure user authentication system
- Performance analytics dashboard

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

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 19+
- npm or yarn
- Git

### Development Setup

1. Clone the repository

```bash
git clone https://github.com/eidorb90/swing-sync.git
cd swing-sync
```

2. Backend Setup

```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -e .

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

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## API Endpoints

- `POST /api/user/register/` - User registration
- `POST /api/user/login/` - User login
- `POST /api/token/` - Obtain JWT token
- `POST /api/token/refresh/` - Refresh JWT token

## License

This project is licensed under the MIT License - see the LICENSE file for details.
