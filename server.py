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


# Connect to postgres database
# First get my password from an environment variable
passWord = os.environ['my_password']

# Concatenate a strings to get the database URI
DATABASE_URI = 'postgres+psycopg2://maxcarey:' + passWord + '@localhost:5432/totago'

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

@app.route('/count/')
def count():
    
    result = session.execute('SELECT postalcodemapped, COUNT(*) FROM itenerary GROUP BY postalcodemapped ORDER BY COUNT(*) desc;')
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
    sql = text('SELECT postalcodemapped, selecteddestination_id, selecteddestination_name, COUNT(*) FROM itenerary GROUP BY postalcodemapped, selecteddestination_id, selecteddestination_name ORDER BY COUNT(*) DESC;')
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

@app.route('/example/')
def showExampleMap():
    return render_template('example.html')

if __name__ == '__main__':
    app.secret_key = 'super_secret_key'
    app.debug = True
    app.run(host='0.0.0.0', port=8000)