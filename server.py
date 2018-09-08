from flask import (
    Flask,
    jsonify,
)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database_setup import Base, Itenerary

# Connect to Database and create database session
engine = create_engine('sqlite:///totagoData.db')
Base.metadata.bind = engine
DBSession = sessionmaker(bind=engine)
session = DBSession()
app = Flask(__name__)

# This is an API endpoint that will simply return all of the entries in the database
@app.route('/api/')
def getJSON():
    iteneraries = session.query(Itenerary).all()
    return jsonify(Itenerary=[i.serialize for i in iteneraries])

if __name__ == '__main__':
    app.secret_key = 'super_secret_key'
    app.debug = True
    app.run(host='0.0.0.0', port=8000)