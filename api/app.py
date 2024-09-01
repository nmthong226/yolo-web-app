from flask import Flask, request, jsonify, render_template, redirect
from sqlalchemy.orm.exc import NoResultFound, MultipleResultsFound
import os
import pusher
from database import db_session
from models import User, Channel, Message
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    get_jwt_identity
)
# import module as yolo
import pickle
import json
import datetime
import urllib
import requests
from dotenv import load_dotenv
import os
from flask_cors import CORS, cross_origin

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
load_dotenv()

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

    # Generate a token
    access_token = create_access_token(identity=username)

    return jsonify({
        "status": "success",
        "message": "login successful",
        "data": {
            "id": user.id,
            "token": access_token,
            "username": user.username
        }
    }), 200

@app.route('/api/request_chat', methods=["POST"])
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

def create_message(message, type, to_user, from_user, channel):
    new_message = Message(message=message, type=type, channel_id=channel)
    new_message.from_user = from_user
    new_message.to_user = to_user
    db_session.add(new_message)
    db_session.commit()
    message = {
        "type": type,
        "from_user": from_user,
        "to_user": to_user,
        "message": message,
        "channel": channel
    }
    return message

@app.route("/api/send_message", methods=["POST"],endpoint='send_message')
@jwt_required()
def send_message():
    request_data = request.get_json()
    print(request_data)
    from_user = request_data.get('from_user', '')
    to_user = request_data.get('to_user', '')
    message = request_data.get('message', '')
    channel = request_data.get('channel')
    message = create_message(message=message, 
                            type='Text', 
                            to_user=to_user, 
                            from_user=from_user, 
                            channel=channel)

    # Trigger an event to the other user
    pusher.trigger(channel, 'new_message', message)
    return jsonify(message)

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

def process_query(bot_id, file, name):
    try:
        bot = User.query.filter(User.id == bot_id).one()
    except NoResultFound:
        print('Error! No bot (yet).')
    except MultipleResultsFound:
        print('Error! Wait what?')

    # try:
    #     model = yolo.get_model(bot.username)
    # except:
    #     print('Error! Cannot get model!')

    inp_dir = './data/input/{}.jpg'.format(name)
    out_dir = './data/output/{}'.format(name)
    file.save(inp_dir)
    # r = yolo.detect(model, inp_dir, out_dir=out_dir)

    r = [x for x in r if x['prob'] > 0.3]
    messages = []
    messages.append('I have detected %d object(s) in the images.' % len(r) )
    for idx, det in enumerate(r):
        prob = det['prob']
        if prob > 0.8:
            messages.append('[%d] I detected a [%s].' % (idx, det['class']))
        elif prob > 0.5:
            messages.append('[%d] I am not so sure but it may be a [%s]' % (idx, det['class']))
        elif prob > 0.3:
            messages.append('[%d] I really do not know what this is. My best guess is that it is a [%s].' % (idx, det['class']))

    inp_token = upload_file('input', inp_dir)
    out_token = upload_file('output', out_dir+'.jpg')

    inp_url = 'https://firebasestorage.googleapis.com/v0/b/yolo-web-app.appspot.com/o/input%2F' + name + '.jpg?alt=media&token=' + inp_token
    out_url = 'https://firebasestorage.googleapis.com/v0/b/yolo-web-app.appspot.com/o/output%2F' + name + '.jpg?alt=media&token=' + out_token
    
    return inp_url, out_url, messages

@app.route("/api/send_file", methods=["POST"],endpoint='send_file')
@jwt_required()
def send_file():
    request_data = request.form
    from_user = request_data.get('from_user', '')
    to_user = request_data.get('to_user', '')
    channel = request_data.get('channel')
    file = request.files['file']
    bot_id = to_user
    name = channel + datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    inp_dir = './data/input/{}.jpg'.format(name)
    file.save(inp_dir)
    inp_token = upload_file('input', inp_dir)
    inp_url = 'https://firebasestorage.googleapis.com/v0/b/yolo-web-app.appspot.com/o/input%2F' + name + '.jpg?alt=media&token=' + inp_token
    inp_img = create_message(message=inp_url, 
                            type='Image', 
                            to_user=to_user, 
                            from_user=from_user, 
                            channel=channel)
    pusher.trigger(channel, 'new_message', inp_img)
    message = create_message(message="I'm onto it, please wait for a bit.", 
                            type='Text', 
                            to_user=from_user, 
                            from_user=to_user, 
                            channel=channel)
    pusher.trigger(channel, 'new_message', message)
    try:
        bot = User.query.filter(User.id == bot_id).one()
    except NoResultFound:
        print('Error! No bot (yet).')
    except MultipleResultsFound:
        print('Error! Wait what?')
    # try:
    #     model = yolo.get_model(bot.username)
    # except:
    #     print('Error! Cannot get model!')
    out_dir = './data/output/{}'.format(name)
    # r = yolo.detect(model, inp_dir, out_dir=out_dir)
    r = [x for x in r if x['prob'] > 0.5]
    messages = []
    messages.append('I have detected %d object(s) in the images.' % len(r) )
    for idx, det in enumerate(r):
        prob = det['prob']
        if prob > 0.8:
            messages.append('[%d] I detected a [%s].' % (idx, det['class']))
        elif prob > 0.5:
            messages.append('[%d] I am not so sure but it may be a [%s]' % (idx, det['class']))
        # elif prob > 0.3:
            # messages.append('[%d] I really do not know what this is. My best guess is that it is a [%s].' % (idx, det['class']))
    out_token = upload_file('output', out_dir+'.jpg')
    out_url = 'https://firebasestorage.googleapis.com/v0/b/yolo-web-app.appspot.com/o/output%2F' + name + '.jpg?alt=media&token=' + out_token
    # inp_url, out_url, messages = process_query(bot_id, file, name)
    out_img = create_message(message=out_url, 
                            type='Image', 
                            to_user=from_user, 
                            from_user=to_user, 
                            channel=channel)
    pusher.trigger(channel, 'new_message', out_img)

    for m in messages:
        message = create_message(message=m, 
                            type='Text', 
                            to_user=from_user, 
                            from_user=to_user, 
                            channel=channel)
        pusher.trigger(channel, 'new_message', message)

    return jsonify(messages)

@app.route('/api/users',endpoint='users')
@jwt_required()
def users():
    users = User.query.all()
    return jsonify(
        [{"id": user.id, "userName": user.username} for user in users]
    ), 200

@app.route('/api/get_message/<channel_id>',endpoint='get_message')
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