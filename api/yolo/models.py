from ultralytics import YOLO
from collections import OrderedDict
import os

# Step 1: Define MAX_MODEL
MAX_MODEL = 1  # Limit to one model at a time

# Step 2: Create a models dictionary to store loaded models and get the base path of weight files
models = OrderedDict()
base_path = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(base_path, 'models')

# Step 3: Implement the load_model function
def load_model(model_path):
    try:
        model = YOLO(model_path)  # Replace YOLO with your model loading logic
        return model
    except Exception as e:
        print(f"Error loading model {model_path}: {str(e)}")
        return None

# Step 4: Implement the free_model function
def free_model():
    global models
    if models:
        oldest_key, _ = models.popitem(last=False)
        print(f"Unloading model {oldest_key}.")
    else:
        print("No models to free.")

# Step 5: Implement the get_model function
def get_model(key):
    global models
    # Check if the model is already loaded
    if key in models:
        # Return the already loaded model
        return models[key]
    # If the model isn't loaded and the max limit is reached, free the current model
    if len(models) >= MAX_MODEL:
        free_model()
    # Load the new model based on the key
    model = None
    if key == '1':
        model = load_model(os.path.join(model_path, 'yolov9c.pt'))  # General object detection model
    elif key == '2':
        model = load_model(os.path.join(model_path, 'dog_detect.pt'))  # Dog detection model
    elif key == '3':
        model = load_model(os.path.join(model_path, 'food_detect.pt'))  # Food detection model
    elif key == '4':
        model = load_model(os.path.join(model_path, 'plant_detect.pt'))  # Plant detection model
    if model:
        models[key] = model  # Store the loaded model
        return model
    else:
        raise RuntimeError(f"Failed to load model for key {key}.")