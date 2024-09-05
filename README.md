# YOLO Web App

This project is a web application designed to detect objects in user-uploaded images using YOLOv10 models. The application provides users with additional information about the detected objects via a chatbot-like interface similar to ChatGPT or Gemini.

## Technologies

### Frontend:
- ReactJS
- TailwindCSS
- PusherJS

### Backend:
- Python
- Flask API
- YOLOv10 Models

### Database:
- Firebase (stores uploaded images)
- SQLite (stores users, channels, and messages)

## Project Structure
The application has two main folders:
- `frontend`: ReactJS-based frontend to handle the user interface and PusherJS events.
- `backend`: Python Flask API for handling YOLO model detections and backend logic.
- `yolo`: Handles YOLO models and weights for object detection (in backend directory).

### YOLO Folder Structure
- `yolo/models`: Contains the trained YOLO `.pt` files (e.g., `best.pt`) that are used for object detection.

## Environment Setup

### Prerequisites
Ensure you have the following installed:
- Node.js (for the frontend)
- Python (for the backend)
- SQLite
- Firebase setup (for image storage)

### Frontend Environment
Create a `.env` file inside the `frontend` folder with the following variables:
```bash
VITE_API_BASE='http://127.0.0.1:5000'
VITE_PUSHER_KEY='YOUR-KEY'
VITE_PUSHER_CLUSTER='YOUR-CLUSTER'
```
### Backend Environment
Create two .env files inside the backend folder:
- 1 .env for general backend configuration:
```bash
PUSHER_APP_ID='YOUR-PUSHER-APP-ID'
PUSHER_KEY='YOUR-PUSHER-KEY'
PUSHER_SECRET='YOUR-PUSHER-SECRET'
PUSHER_CLUSTER='YOUR-PUSHER-CLUSTER'
API_KEY='YOUR-GEMINI-KEY'  # Gemini API Key
```
- 2 .flaskenv for Flask configuration:
```bash
FLASK_APP=app.py
FLASK_ENV=development
```
## Installation
### Backend (Flask API)
- Navigate to the backend folder:
```bash
cd backend
```
- Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
```
- Install the dependencies:
```bash
pip install -r requirements.txt
```
- Set up SQLite database:
```bash
flask db init
flask db migrate
flask db upgrade
```
- Run the Flask server:
```bash
flask run
```
### Frontend (ReactJS)
- Navigate to the frontend folder:
```bash
cd frontend
```
- Install the dependencies:
```bash
npm install
```
- Start the React development server:
```bash
npm run dev
```
## Usage
### Object Detection
- Users can upload an image via the chat interface.
- The image is stored in Firebase.
- YOLOv10 models, running in the Flask backend, will process the image and detect objects.
- The detected objects are returned to the user in the chat interface along with additional information.

### Real-time Communication
` The application uses PusherJS for real-time message delivery between the user and the bot.

## Contributing
- Fork the repository.
- Create your feature branch (git checkout -b feature/YourFeature).
- Commit your changes (git commit -m 'Add YourFeature').
- Push to the branch (git push origin feature/YourFeature).
- Open a pull request.
