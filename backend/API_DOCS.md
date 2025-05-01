# Swing Sync API Documentation

## Overview

Swing Sync is a comprehensive golf tracking application that helps players record rounds, analyze statistics, and get AI-powered golf advice. This guide explains how to use the available API endpoints.

## Base URL

All API endpoints are relative to: `http://localhost:8000/api`

## Authentication

### User Registration

Create a new user account.

- **URL**: `/user/signup/`
- **Method**: `POST`
- **Permission**: Public
- **Request Body**:
  ```json
  {
    "username": "golfer1",
    "firstname": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "securepassword123",
    "confirmPassword": "securepassword123"
  }
  ```
- **Response**: User details with authentication token

### User Login

Authenticate and receive a JWT token.

- **URL**: `/user/login/`
- **Method**: `POST`
- **Permission**: Public
- **Request Body**:
  ```json
  {
    "username": "golfer1",
    "password": "securepassword123"
  }
  ```
- **Response**:
  ```json
  {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user_id": 1,
    "username": "golfer1"
  }
  ```

### Token Refresh

Refresh your JWT token.

- **URL**: `/token/refresh/`
- **Method**: `POST`
- **Permission**: Public
- **Request Body**:
  ```json
  {
    "refresh": "your-refresh-token"
  }
  ```
- **Response**: New access token

## User Management

### Get User Information

Retrieve information about a specific user.

- **URL**: `/user/<user_id>`
- **Method**: `GET`
- **Authorization**: Bearer Token
- **Response**: User details

### Get All Users

Retrieve information about all users.

- **URL**: `/user/`
- **Method**: `GET`
- **Authorization**: Bearer Token
- **Response**: List of all users

## Golf Courses

### Search for Golf Courses

Search for golf courses by name or location.

- **URL**: `/course/search/`
- **Method**: `GET`
- **Authorization**: Bearer Token
- **Parameters**:
  - `search`: Text to search for golf courses (required)
- **Example**: `/course/search/?search=Augusta`
- **Response**: List of matching golf courses

### Get Saved Courses

Get courses saved in the system.

- **URL**: `/courses/`
- **Method**: `GET`
- **Authorization**: Bearer Token
- **Response**: List of courses with their associated tees and holes

### Get Course Tees

Get tees for a specific course.

- **URL**: `/courses/<course_id>/tees/`
- **Method**: `GET`
- **Authorization**: Bearer Token
- **Response**: List of tees for the specified course

### Get Tee Holes

Get holes for a specific tee.

- **URL**: `/tees/<tee_id>/holes/`
- **Method**: `GET`
- **Authorization**: Bearer Token
- **Response**: List of holes for the specified tee

## Rounds

### Create Round

Create a new round record.

- **URL**: `/rounds/`
- **Method**: `POST`
- **Authorization**: Bearer Token
- **Request Body**:
  ```json
  {
    "tee_id": 1,
    "course_id": 1,
    "notes": "Great round today!",
    "hole_scores": [
      {
        "hole_id": 1,
        "strokes": 4,
        "putts": 2,
        "fairway_hit": true,
        "green_in_regulation": true,
        "penalties": 0
      },
      ...
    ]
  }
  ```
- **Response**: Created round details

### Update Round

Update an existing round.

- **URL**: `/rounds/<round_id>`
- **Method**: `POST`
- **Authorization**: Bearer Token
- **Request Body**: Same format as Create Round
- **Response**: Updated round details

### Get Round Details

Get details about a specific round.

- **URL**: `/rounds/<round_id>`
- **Method**: `GET`
- **Authorization**: Bearer Token
- **Response**: Round details with hole scores

### Get All Rounds

Get all rounds for the authenticated user.

- **URL**: `/rounds/`
- **Method**: `GET`
- **Authorization**: Bearer Token
- **Response**: List of rounds

## Statistics

### Get User Stats

Get statistics for a specific user.

- **URL**: `/player/<user_id>/stats`
- **Method**: `GET`
- **Authorization**: Bearer Token
- **Response**:
  ```json
  {
    "avg_putts_per_round": 30.5,
    "avg_penalities_per_round": 1.2,
    "avg_score_per_round": 82.3,
    "fairway_hit_percentage": 68.5,
    "gir_percentage": 45.2,
    "scores_list": [80, 82, 79, 83, 85]
  }
  ```

### Get Leaderboard

Get leaderboard statistics across all users.

- **URL**: `/leaderboard/`
- **Method**: `GET`
- **Authorization**: Bearer Token
- **Response**: List of users with their performance stats

## AI Golf Assistant

### Chat with AI Golf Pro

Send a message to the AI golf assistant.

- **URL**: `/chat/`
- **Method**: `POST`
- **Authorization**: Bearer Token
- **Request Body**:
  ```json
  {
    "message": "How can I improve my slice?"
  }
  ```
- **Response**:
  ```json
  {
    "response": "Well, that slice is making your ball curve more than a mountain road! Let's fix that. First, check your grip - most slices come from an open clubface at impact..."
  }
  ```

## Golf Swing Video Analysis

Submit a golf swing video for AI analysis.

- **URL**: `/vision/`
- **Method**: `POST`
- **Authorization**: Bearer Token
- **Content Type**: `multipart/form-data`
- **Request Parameters**:
  - `message`: Text message (optional)
  - `video`: Video file of golf swing (optional)
- **Response**: AI analysis of the golf swing

## Authorization Header Format

For authenticated endpoints, include your JWT token in the request header:

```
Authorization: Bearer <your_access_token>
```

## Error Handling

The API uses standard HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource successfully created
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required or failed
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

Error responses include descriptive messages to help troubleshoot issues.
