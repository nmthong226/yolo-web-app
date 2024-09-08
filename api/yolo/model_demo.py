from ultralytics import YOLO
from collections import OrderedDict
import os

# Step 1: Define MAX_MODEL (Still 1 for the demo)
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

# Step 4: Implement the free_model function (Still in place in case you need it)
def free_model():
    global models
    if models:
        oldest_key, _ = models.popitem(last=False)
        print(f"Unloading model {oldest_key}.")
    else:
        print("No models to free.")

# Step 5: Implement the get_model function for the demo (Only handle yolov9.pt)
def get_model():
    global models
    # Check if the model is already loaded
    if 'demo' in models:
        # Return the already loaded model
        return models['demo']
    # If the model isn't loaded and the max limit is reached, free the current model
    if len(models) >= MAX_MODEL:
        free_model()
    # Load the yolov9.pt model for the demo
    model = load_model(os.path.join(model_path, 'yolov9c.pt'))
    if model:
        models['demo'] = model  # Store the loaded model
        return model
    else:
        raise RuntimeError(f"Failed to load yolov9c.pt model.")

# Call the get_model function when needed to ensure the yolov9.pt model is loaded