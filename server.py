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


@app.route('/map/')
def showMap():
    return render_template('map.html')


# Because CORS is not enabled for this totago API and I'm not ont there domain
# I Am esentially creating a server-side proxy script to get this data then send it to the front end
# See this post here
# https://stackoverflow.com/a/31514305/5420796
@app.route('/destinations/<string:region>')
def getDestination(region):
    
    print(region)

    if region == "washington":
        region_id = "1"
    if region == "california":
        region_id = "7"
    if region == "newyork":
        region_id = "11"
    if region == "canada":
        region_id = "3"
    
    urlString = 'https://www.totago.co/api/v1/destinations.json?publication_stage=verified&region_id=' + region_id

    r = requests.get(urlString)
    json_data = json.loads(r.text)
    return jsonify(json_data)


@app.route('/count/<string:region>/<string:myType>/<string:userID>')
def count(region, myType, userID):

    if myType == "postal":
        column = "postalcodemapped"
    else:
        column = "barriomapped"

    if userID == "none":
        sqlQUERY = "SELECT {}, COUNT(*) FROM itenerary WHERE region = '{}' GROUP BY {} ORDER BY COUNT(*) desc;".format(column, region, column)
    else:
        sqlQUERY = "SELECT {}, COUNT(*) FROM itenerary WHERE region = '{}' AND userid = '{}' GROUP BY {} ORDER BY COUNT(*) desc;".format(column, region, userID, column)

    result = session.execute(sqlQUERY)
    data = []
    for row in result:
        #print(row[0])
        nestedDictionary = {"mapArea": row[0],
                            "mapAreaHits": row[1]}
        data.append(nestedDictionary)
    
    return jsonify(data)

@app.route('/postalCodeToDestination/<string:mapArea>/<string:mapType>/<string:userID>')
def postalCodeToDestination(mapArea, mapType, userID):
    
    if userID == "none":
        if mapType == "postal":
            sqlQUERY = "SELECT postalcodemapped, selecteddestination_id, selecteddestination_name, COUNT(*) FROM itenerary WHERE valid = TRUE and postalcodemapped = '{}' GROUP BY postalcodemapped, selecteddestination_id, selecteddestination_name ORDER BY COUNT(*) DESC;".format(mapArea)
        elif mapType == "barrio":
            sqlQUERY = "SELECT barrioMapped, selecteddestination_id, selecteddestination_name, COUNT(*) FROM itenerary WHERE valid = TRUE and barrioMapped = '{}' GROUP BY barrioMapped, selecteddestination_id, selecteddestination_name ORDER BY COUNT(*) DESC;".format(mapArea)
    else:
        if mapType == "postal":
            sqlQUERY = "SELECT postalcodemapped, selecteddestination_id, selecteddestination_name, COUNT(*) FROM itenerary WHERE valid = TRUE and postalcodemapped = '{}' and userid = '{}' GROUP BY postalcodemapped, selecteddestination_id, selecteddestination_name ORDER BY COUNT(*) DESC;".format(mapArea, userID)
        elif mapType == "barrio":
            sqlQUERY = "SELECT barrioMapped, selecteddestination_id, selecteddestination_name, COUNT(*) FROM itenerary WHERE valid = TRUE and barrioMapped = '{}' and userid = '{}' GROUP BY barrioMapped, selecteddestination_id, selecteddestination_name ORDER BY COUNT(*) DESC;".format(mapArea, userID)

    result = session.execute(sqlQUERY)
    # https://stackoverflow.com/questions/17972020/how-to-execute-raw-sql-in-sqlalchemy-flask-app
    data = []
    
    # This whole for loop could be redundant but we do not want to get rid of it just yet
    for row in result:
        if row[0] == str(mapArea):
            nestedDictionary = {"mapArea": row[0],
                                "destinationID": row[1],
                                "destinationName": row[2],
                                "count": row[3]}
            data.append(nestedDictionary)
  
    return jsonify(data)

if __name__ == '__main__':
    app.secret_key = 'super_secret_key'
    app.debug = True
    app.run(host='0.0.0.0', port=8000)