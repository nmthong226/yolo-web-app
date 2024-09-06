from flask import Flask, request, jsonify, render_template, redirect
from sqlalchemy.orm.exc import NoResultFound, MultipleResultsFound
import os
import pusher
from database import db_session
from model_schema import User, Channel, Message
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    get_jwt_identity
)
from yolo import models as yolo
import json
import datetime
import urllib
import requests
from dotenv import load_dotenv
import os
from flask_cors import CORS, cross_origin
import cv2
from datetime import timedelta
import google.generativeai as genai
import firebase_admin
from firebase_admin import credentials, storage
import re

load_dotenv()

genai.configure(api_key=os.environ["API_KEY"])

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

cred = credentials.Certificate('./yolo-web-app-firebase-adminsdk-jtzsz-58d0d22304.json')
firebase_admin.initialize_app(cred, {'storageBucket': 'yolo-web-app.appspot.com'})

pusher = pusher.Pusher(
    app_id=os.getenv('PUSHER_APP_ID'),
    key=os.getenv('PUSHER_KEY'),
    secret=os.getenv('PUSHER_SECRET'),
    cluster=os.getenv('PUSHER_CLUSTER'),
    ssl=True)

app.config['JWT_SECRET_KEY'] = 'something-super-secret'  # Change this!
jwt = JWTManager(app)

@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()

@app.route('/api/register', methods=["POST"])
def register():
    data = request.get_json()
    print(data)
    # Check if the data is valid
    if not data or not data.get("username") or not data.get("password"):
        return jsonify({
            "status": "error",
            "message": "Username and password are required"
        }), 400
    username = data.get("username").strip()
    if username == "":
        return jsonify({
            "status": "error",
            "message": "Username cannot be blank"
        }), 400
    existing_user = db_session.query(User).filter_by(username=username).first()
    if existing_user:
        return jsonify({
            "status": "error",
            "message": "Username already taken"
        }), 409
    try:
        password = generate_password_hash(data.get("password"))
        new_user = User(username=username, password=password)
        db_session.add(new_user)
        db_session.commit()
    except Exception as e:
        print(f"Error adding user: {e}")
        return jsonify({
            "status": "error",
            "message": "Could not add user"
        }), 500
    return jsonify({
        "status": "success",
        "message": "User added successfully"
    }), 201

@app.route('/api/login', methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    user = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({
            "status": "failed",
            "message": "Failed getting user"
        }), 401

    # Generate a token with custom expiration time (e.g., 6 hours)
    access_token = create_access_token(identity=username, expires_delta=timedelta(hours=6))

    return jsonify({
        "status": "success",
        "message": "login successful",
        "data": {
            "id": user.id,
            "token": access_token,
            "username": user.username
        }
    }), 200

@app.route('/api/users/me', methods=['GET'])
@jwt_required()
def get_user_data():
    # Get the username from the token
    current_user = get_jwt_identity()
    # Query the user from the database
    user = User.query.filter_by(username=current_user).first()
    if not user:
        return jsonify({
            "status": "failed",
            "message": "User not found"
        }), 404
    # Return the user data
    return jsonify({
        "status": "success",
        "data": {
            "id": user.id,
            "username": user.username
        }
    }), 200

@app.route('/api/request-chat', methods=["POST"])
@jwt_required()
def request_chat():
    request_data = request.get_json()
    from_user = request_data.get('from_user', '')
    to_user = request_data.get('to_user', '')
    to_user_channel = "private-notification_user_%s" %(to_user)
    from_user_channel = "private-notification_user_%s" %(from_user)

    try:
        bot = User.query.filter(User.id == to_user).one()
    except NoResultFound:
        print('Error! No bot (yet).')
    except MultipleResultsFound:
        print('Error! Wait what?')

    # try:
    #     yolo.get_model(bot.username)
    # except:
    #     print('Error! Cannot load model!')

    # check if there is a channel that already exists between this two user
    channel = Channel.query.filter( Channel.from_user.in_([from_user, to_user]) ) \
                            .filter( Channel.to_user.in_([from_user, to_user]) ) \
                            .first()
    if not channel:
        # Generate a channel...
        chat_channel = "private-chat_%s_%s" %(from_user, to_user)

        new_channel = Channel()
        new_channel.from_user = from_user
        new_channel.to_user = to_user
        new_channel.name = chat_channel
        db_session.add(new_channel)
        db_session.commit()
    else:
        # Use the channel name stored on the database
        chat_channel = channel.name

    data = {
        "from_user": from_user,
        "to_user": to_user,
        "from_user_notification_channel": from_user_channel,
        "to_user_notification_channel": to_user_channel,
        "channel_name": chat_channel,
    }

    # Trigger an event to the other user
    pusher.trigger(to_user_channel, 'new_chat', data)

    return jsonify(data)

@app.route("/api/pusher/auth",methods=["POST"],endpoint='pusher_authentication')
@jwt_required()
def pusher_authentication():
    return jsonify(pusher.authenticate(
        channel=request.form["channel_name"],
        socket_id=request.form["socket_id"],
    ))

def create_message(message, type, to_user, from_user, channel, ai_mode):
    new_message = Message(message=message, type=type, channel_id=channel, ai_mode=ai_mode)
    new_message.from_user = from_user
    new_message.to_user = to_user
    db_session.add(new_message)
    db_session.commit()
    message = {
        "type": type,
        "from_user": from_user,
        "to_user": to_user,
        "message": message,
        "channel": channel,
        "ai_mode": ai_mode
    }
    return message

def get_images_from_firebase(folder, object_type, object_name):
    bucket = storage.bucket()
    blobs = bucket.list_blobs(prefix=folder)
    # Extract image URLs matching the exact object_name (e.g., "bordercollie")
    image_urls = []
    for blob in blobs:
        # Extract the part of the filename before the underscore
        filename_without_date = blob.name.split('/')[-1].split('_')[0]  # Get the last part of the path
        # Check if the extracted filename matches the object_name
        if filename_without_date.lower() == object_name.lower():
            if len(image_urls) >= 4:
                break
            # Generate a 1-hour signed URL
            img_url = f"https://firebasestorage.googleapis.com/v0/b/yolo-web-app.appspot.com/o/related_images" + "%2F" + object_type + "%2F" + blob.name.split('/')[-1] + "?alt=media"
            image_urls.append(img_url)
    print("Final image URLs:", image_urls)  # Print the list of image URLs
    return image_urls



@app.route("/api/send-message", methods=["POST"], endpoint='send_message')
@jwt_required()
def send_message():
    request_data = request.get_json()
    from_user = request_data.get('from_user', '')
    to_user = request_data.get('to_user', '')
    message = request_data.get('message', '')
    channel = request_data.get('channel')
    ai_mode = request_data.get('ai_mode')

    # Check if the message requests images
    match = re.search(r'Send me some images about (.+)', message, re.IGNORECASE)
    if match:
        # Send the user's command to the bot
        message_content = create_message(message=message, 
                                     type='Text', 
                                     to_user=to_user, 
                                     from_user=from_user, 
                                     channel=channel,
                                     ai_mode=ai_mode)
        pusher.trigger(channel, 'new_message', message_content)

        object_name = match.group(1)
        object_type = {
            1: 'basic',
            2: 'dog',
            3: 'food',
            4: 'plant'
        }.get(int(to_user), None)

        if not object_type:
            message_content = create_message(message=f"Sorry!, I can't handle your command", 
                                             type='Text', 
                                             to_user=from_user, 
                                             from_user=to_user, 
                                             channel=channel,
                                             ai_mode=ai_mode)
            pusher.trigger(channel, 'new_message', message_content)
            return jsonify(message_content)

        image_urls = get_images_from_firebase(f"related_images/{object_type}/", object_type, object_name)

        if not image_urls:
            message_content = create_message(message=f"Oops! I couldn't find any images about {object_name}", 
                                             type='Text', 
                                             to_user=from_user, 
                                             from_user=to_user, 
                                             channel=channel,
                                             ai_mode=ai_mode)
            pusher.trigger(channel, 'new_message', message_content)
            return jsonify(message_content)

        # Here are some images about the object
        message_content = create_message(message=f"Here are some images about {object_name}", 
                                            type='Text', 
                                            to_user=from_user, 
                                            from_user=to_user, 
                                            channel=channel,
                                            ai_mode=ai_mode)
        pusher.trigger(channel, 'new_message', message_content)

        # Send the image URLs to the user
        messages_content = [create_message(message=img_url, 
                                           type='Image', 
                                           to_user=from_user, 
                                           from_user=to_user, 
                                           channel=channel,
                                           ai_mode=ai_mode) for img_url in image_urls]

        for message_content in messages_content:
            pusher.trigger(channel, 'new_message', message_content)

        return jsonify(messages_content)

    # Regular normal message creation
    message_content = create_message(message=message, 
                                     type='Text', 
                                     to_user=to_user, 
                                     from_user=from_user, 
                                     channel=channel,
                                     ai_mode=ai_mode)
    pusher.trigger(channel, 'new_message', message_content)
    return jsonify(message_content)

def upload_file(folder, img_name):
    my_file = open(img_name, "rb")
    my_bytes = my_file.read()
    my_url = "https://firebasestorage.googleapis.com/v0/b/yolo-web-app.appspot.com/o/" + folder + "%2F" + os.path.basename(img_name)
    my_headers = {"Content-Type": "image/jpeg"}
    my_request = urllib.request.Request(my_url, data=my_bytes, headers=my_headers, method="POST")
    try:
        loader = urllib.request.urlopen(my_request)
    except urllib.error.URLError as e:
        message = json.loads(e.read().decode())
        print(message["error"]["message"])
        return ''
    else:
        # print(loader.read().decode())
        result = json.loads(loader.read().decode())
        return result["downloadTokens"]

def handle_request(bot_id, name, inp_dir, ai_activation):
    # try:
    #     bot = User.query.filter(User.id == bot_id).one()
    # except NoResultFound:
    #     print('Error! No bot found.')
    #     return None, None, ["Error! No bot found."]
    # except MultipleResultsFound:
    #     print('Error! Multiple bots found.')
    #     return None, None, ["Error! Multiple bots found."]

    # # Map bot_id to the appropriate model key
    bot_model_map = {
        '1': 'basic',
        '2': 'dog',
        '3': 'food',
        '4': 'plant'
    }

    # # Retrieve the model key based on bot_id
    model_key = bot_model_map.get(bot_id, None)
    if not model_key:
        print(f'Error! Invalid bot_id: {bot_id}')
        return None, None, [f"Error! Invalid bot_id: {bot_id}"]

    try:
        model = yolo.get_model(bot_id)  # Use the model key to load the correct model
    except Exception as e:
        print(f'Error! Cannot load model: {str(e)}')
        return None, None, [f"Error! Cannot load model: {str(e)}"]

    # Save the uploaded file locally
    out_dir = './data/output/{}'.format(name)

    # Ensure the image is saved correctly
    if not os.path.exists(inp_dir):
        print('Error! File not found:', inp_dir)
        return None, None, ["Error! File not found."]
    else:
        print('File saved:', inp_dir)
    
    # Load the image using OpenCV to verify it is not corrupted
    img = cv2.imread(inp_dir)
    if img is None:
        print('Error! Could not read the image file. It may be corrupted.')
        return None, None, ["Error! Could not read the image file."]
    else:
        print('Image loaded:', inp_dir)

    # Run inference with the YOLOv9c model
    try:
        results = model(img)
        # Get the image with bounding boxes plotted
        result_image = results[0].plot()
        # Save the result image to the specified directory with the exact name
        out_path = './data/output/{}.jpg'.format(name)
        cv2.imwrite(out_path, result_image)
    except Exception as e:
        print('Error during inference:', str(e))
        return None, None, ["Error during inference."]
    
    # Filter results based on the confidence threshold
    detections = []
    for result in results[0].boxes.data.cpu().numpy():  # Extracting detections from results
        xmin, ymin, xmax, ymax, confidence, cls_id = result[:6]
        if confidence > 0.3:
            detections.append({
                'class': results[0].names[int(cls_id)],  # Get class name from YOLOv9 model
                'prob': confidence
            })

    # Get current timestamp for naming
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    # Prepare messages based on detection results
    messages = []
    messages.append(f'I have detected {len(detections)} object(s) in the image.')
    # Variable to track the detection with the highest probability
    highest_prob = 0
    highest_class = "unknown"
    for idx, det in enumerate(detections):
        prob = det['prob']
        class_name = det['class']
        # Update highest probability detection
        if prob > highest_prob:
            highest_prob = prob
            highest_class = class_name
        if prob > 0.8:
            messages.append(f'[{idx + 1}] I detected a [{det["class"]}].')
        elif prob > 0.5:
            messages.append(f'[{idx + 1}] I am not so sure but it may be a [{det["class"]}].')
        elif prob > 0.3:
            messages.append(f'[{idx + 1}] I really do not know what this is. My best guess is that it is a [{det["class"]}].')
    
    # Convert to lowercase and remove spaces and special characters using a regex
    highest_class = re.sub(r'[^a-zA-Z0-9]', '', highest_class.lower())
    # Use highest detected object's class name in the output file name
    if highest_class != "unknown":
        object_file_name = f"{highest_class}_{timestamp}.jpg"
        object_out_dir = f'./data/output/{object_file_name}'
        cv2.imwrite(object_out_dir, result_image)  # Save the result image
        upload_folder = f"related_images" + "%2F" + model_key
        object_token = upload_file(upload_folder, object_out_dir)

    # Upload the input and output images to Firebase Storage
    inp_token = upload_file('input', inp_dir)
    out_token = upload_file('output', out_dir+'.jpg')
    inp_url = f'https://firebasestorage.googleapis.com/v0/b/yolo-web-app.appspot.com/o/input%2F{name}.jpg?alt=media&token={inp_token}'
    out_url = f'https://firebasestorage.googleapis.com/v0/b/yolo-web-app.appspot.com/o/output%2F{name}.jpg?alt=media&token={out_token}'
    # Upload the output images into the specific type to Firebase Storage

    # If user activates ai mode, they will get the description about the detected objects
    if ai_activation == '1':
        # Generate more info about the detected objects in the image
        model = genai.GenerativeModel("gemini-1.5-flash")
        if detections:
            # Create a prompt based on the detected objects
            detected_classes = ', '.join([det['class'] for det in detections])
            prompt = f"What is {detected_classes} {model_key}?."
            response = model.generate_content(prompt)
            messages.append(response.text)
        else:
            messages.append("No objects were detected, so I couldn't generate additional information.")

    return inp_url, out_url, messages

@app.route("/api/send-file", methods=["POST"], endpoint='send_file')
@jwt_required()
def send_file():
    request_data = request.form
    from_user = request_data.get('from_user', '')
    to_user = request_data.get('to_user', '')
    channel = request_data.get('channel')
    ai_mode = request_data.get('ai_mode')
    file = request.files['file']
    bot_id = to_user
    name = channel + datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    inp_dir = './data/input/{}.jpg'.format(name)
    file.save(inp_dir)

    # Upload the input image and notify the user
    inp_token = upload_file('input', inp_dir)
    inp_url = f'https://firebasestorage.googleapis.com/v0/b/yolo-web-app.appspot.com/o/input%2F{name}.jpg?alt=media&token={inp_token}'
    inp_img = create_message(message=inp_url, type='Image', to_user=to_user, from_user=from_user, channel=channel, ai_mode=ai_mode)
    pusher.trigger(channel, 'new_message', inp_img)

    message = create_message(message="Please wait, I'm detecting object(s)...", type='Text', to_user=from_user, from_user=to_user, channel=channel, ai_mode=ai_mode)
    pusher.trigger(channel, 'new_message', message)

    # Process the image and perform object detection
    inp_url, out_url, messages = handle_request(bot_id, name, inp_dir, ai_mode)

    # If handle_request fails, return an error message
    if not inp_url or not out_url:
        error_message = create_message(message="There was an error processing the image.", type='Text', to_user=from_user, from_user=to_user, channel=channel, ai_mode=ai_mode)
        pusher.trigger(channel, 'new_message', error_message)
        return jsonify({"error": "Processing failed"}), 500

    # Notify the user with the output image
    out_img = create_message(message=out_url, type='Image', to_user=from_user, from_user=to_user, channel=channel, ai_mode=ai_mode)
    pusher.trigger(channel, 'new_message', out_img)

    # Send the detection results as messages
    for m in messages:
        message = create_message(message=m, type='Text', to_user=from_user, from_user=to_user, channel=channel, ai_mode=ai_mode)
        pusher.trigger(channel, 'new_message', message)

    return jsonify(messages)


@app.route('/api/users',endpoint='users')
@jwt_required()
def users():
    users = User.query.all()
    return jsonify(
        [{"id": user.id, "userName": user.username} for user in users]
    ), 200

@app.route('/api/get-message/<channel_id>',endpoint='get_message')
@jwt_required()
def user_messages(channel_id):
    messages = Message.query.filter( Message.channel_id == channel_id ).all()

    return jsonify([
        {
            "id": message.id,
            "message": message.message, 
            "type": message.type,
            "to_user": message.to_user,
            "channel_id": message.channel_id,  
            "from_user": message.from_user, 
        } 
        for message in messages
    ])

# run Flask app
if __name__ == "__main__":
    app.run(threaded=True)