from flask import (
    Flask,
    render_template,
    request,
    redirect,
    jsonify,
    url_for,
    flash,
    make_response,
    g,
    abort
)

from sqlalchemy import create_engine, asc
from sqlalchemy.orm import sessionmaker
from database_setup import Base, Story, Word, User
from flask import session as login_session
import random
import string
from oauth2client.client import flow_from_clientsecrets
from oauth2client.client import FlowExchangeError
import httplib2
import json
import requests
from flask_httpauth import HTTPBasicAuth
auth = HTTPBasicAuth()

# Connect to Database and create database session
engine = create_engine('sqlite:///totagoData.db')
Base.metadata.bind = engine
DBSession = sessionmaker(bind=engine)
session = DBSession()
app = Flask(__name__)


# This route checks the passowrd
@auth.verify_password
def verify_password(username, password):
    user = session.query(User).filter_by(username=username).first()
    if not user or not user.verify_password(password):
        return False
    g.user = user
    return True


# This method creates a new user, who can make API calls.
@app.route('/api/users', methods=['POST'])
def new_user():
    username = request.json.get('username')
    password = request.json.get('password')
    name = request.json.get('name')
    email = request.json.get('email')
    if username is None or password is None or name is None or email is None:
        abort(400)  # missing arguments
    if session.query(User).filter_by(username=username).first() is not None:
        abort(400)  # existing user
    user = User(username=username, name=name, email=email)
    user.hash_password(password)
    session.add(user)
    session.commit()
    return jsonify({'username': user.username}), 201,
    {'Location': url_for('get_user', id=user.id, _external=True)}


# This method will return JSON information of a user if they exist.
@app.route('/api/users/<int:id>')
def get_user(id):
    user = session.query(User).filter_by(id=id).one()
    if not user:
        abort(400)
    return jsonify({'username': user.username})


# This is an API endpoint that will return all stories
@app.route('/stories/JSON')
@auth.login_required
def storiesJSON():
    stories = session.query(Story).all()
    return jsonify(story=[i.serialize for i in stories])


if __name__ == '__main__':
    app.secret_key = 'super_secret_key'
    app.debug = True
    app.run(host='0.0.0.0', port=8000)