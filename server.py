import sys
from flask import (
    Flask,
    jsonify,
    render_template,
    url_for
)

import os
from sqlalchemy import create_engine, func, text
from sqlalchemy.orm import sessionmaker
from database_setup import Base, Itenerary
import requests
import json

# Connect to postgres database
# First get my password from an environment variable
passWord = os.environ['my_password']

# Concatenate a strings to get the database URI

DATABASE_URI = 'postgres+psycopg2://maxcarey:' + passWord + '@localhost:5432/totago'

# This is how you connect to the remote database
# DATABASE_URI = 'postgres://maxcarey:' + passWord + '@totago.cqfm37jhmjmk.ap-southeast-2.rds.amazonaws.com:5432/totago?sslrootcert=rds-combined-ca-bundle.pem&sslmode=require'

engine = create_engine(DATABASE_URI)


Base.metadata.bind = engine
DBSession = sessionmaker(bind=engine)
session = DBSession()
app = Flask(__name__)

# This is an API endpoint that will simply return all of the entries in the database
@app.route('/api/')
def getJSON():
    iteneraries = session.query(Itenerary).all()
    return jsonify(Itenerary=[i.serialize for i in iteneraries])


# Because CORS is not enabled for this totago API and I'm not ont there domain
# I Am esentially creating a server-side proxy script to get this data then send it to the front end
# See this post here
# https://stackoverflow.com/a/31514305/5420796
@app.route('/destinations/<string:region>')
def getDestination(region):
    
    print(region)

    if region == "seattle":
        region_id = "1"
    if region == "losangeles":
        region_id = "7"
    
    print(region_id)

    print(region)

    urlString = 'https://www.totago.co/api/v1/destinations.json?region_id=' + region_id

    print("URL STRING HERE:")
    print(urlString)

    r = requests.get(urlString)
    json_data = json.loads(r.text)
    return jsonify(json_data)


@app.route('/count/<string:region>')
def count(region):

    # Before all of this I was using regex, but now that I have added a region field to the data
    # things are wokring a lot more smoothly :)

    # List of zip codes available here:
    # https://www.zip-codes.com/state/ca.asp
    #if region == "seattle":
        # In the case of Seattle area, you start with "9" and add 4 additional characterse
    #    whereRegex = "'9[89]...'"

    #if region == "losangeles":
        # In the case of los angeles area
    #    whereRegex = "'9[0123456]...'"

    #if region == "seattle_zillow":
        # All of the values that start with a number
    #    whereRegex ="'^[0-9]'"

    # whereRegex = "'9[89]...'"
    # sqlQUERY = 'SELECT postalcodemapped, COUNT(*) FROM itenerary WHERE postalcodemapped ~ {} GROUP BY postalcodemapped ORDER BY COUNT(*) desc;'.format(whereRegex)
    
    sqlQUERY = "SELECT postalcodemapped, COUNT(*) FROM itenerary WHERE region = 'washington' GROUP BY postalcodemapped ORDER BY COUNT(*) desc;"

    result = session.execute(sqlQUERY)
    data = []
    for row in result:
        #print(row[0])
        nestedDictionary = {"postalCode": row[0],
                            "postalCodeHits": row[1]}
        data.append(nestedDictionary)
    
    return jsonify(data)

@app.route('/map/')
def showMap():
    return render_template('map.html')

@app.route('/postalCodeToDestination/<int:postal_code>')
def postalCodeToDestination(postal_code):
    
    # Construct the raw SQL query
    sql = text('SELECT postalcodemapped, selecteddestination_id, selecteddestination_name, COUNT(*) FROM itenerary WHERE valid = TRUE GROUP BY postalcodemapped, selecteddestination_id, selecteddestination_name ORDER BY COUNT(*) DESC;')
    result = session.execute(sql)
    # https://stackoverflow.com/questions/17972020/how-to-execute-raw-sql-in-sqlalchemy-flask-app
    data = []
    
    for row in result:
        if row[0] == str(postal_code):
            nestedDictionary = {"postalCode": row[0],
                                "destinationID": row[1],
                                "destinationName": row[2],
                                "count": row[3]}
            data.append(nestedDictionary)
    return jsonify(data)

if __name__ == '__main__':
    app.secret_key = 'super_secret_key'
    app.debug = True
    app.run(host='0.0.0.0', port=8000)