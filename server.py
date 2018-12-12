from flask import (
    Flask,
    jsonify,
    render_template,
    url_for
)

from sqlalchemy import create_engine, func, text
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

@app.route('/count/')
def count():
    
    # https://stackoverflow.com/questions/17972020/how-to-execute-raw-sql-in-sqlalchemy-flask-app
    # Do it with good old SQL
    # When you do it like this the result is not jsonifyble
    
    #result = session.execute('SELECT postalCode, count(*) FROM itenerary GROUP BY postalCode ORDER BY COUNT(*) desc;')
    
    # DO it with the ORM Syntax:
    result = session.query(Itenerary.postalCodeMapped, func.count(Itenerary.postalCodeMapped)).group_by(Itenerary.postalCodeMapped).all()
    # It looks like the result object is a list of tuples

    #for r in result:
    #	print(r)

    print("Done printing******")
    return jsonify(result)

@app.route('/map/')
def showMap():
    return render_template('map.html')

@app.route('/postalCodeToDestination/<int:postal_code>')
def postalCodeToDestination(postal_code):
    
    # Construct the raw SQL query
    sql = text('SELECT postalCodeMapped, selectedDestination_ID, selectedDestination_name, COUNT(*) FROM itenerary GROUP BY postalCodeMapped, selectedDestination_ID ORDER BY COUNT(*) DESC;')
    result = session.execute(sql)
    # https://stackoverflow.com/questions/17972020/how-to-execute-raw-sql-in-sqlalchemy-flask-app
    data = []
    for row in result:
        if row[0] == postal_code:
            nestedDictionary = {"postalCode": row[0],
                                "destinationID": row[1],
                                "destinationName": row[2],
                                "count": row[3]}
            data.append(nestedDictionary)
    print(data)
    return jsonify(data)

@app.route('/example/')
def showExampleMap():
    return render_template('example.html')

if __name__ == '__main__':
    app.secret_key = 'super_secret_key'
    app.debug = True
    app.run(host='0.0.0.0', port=8000)