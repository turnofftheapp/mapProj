import os
import sys
from sqlalchemy import Column, ForeignKey, Integer, String, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy import create_engine
from sqlalchemy_utils import database_exists, create_database


# Here it a tutorial that I loosely followed to get the logic for the next
# few lines:
# https://www.compose.com/articles/using-postgresql-through-sqlalchemy/

# First get my password from an environment variable
passWord = os.environ['my_password']

# Concatenate a strings to get the database URI
DATABASE_URI = 'postgres+psycopg2://maxcarey:' + passWord + '@localhost:5432/totago'

engine = create_engine(DATABASE_URI)


# If the database specified at the end of the database url does not 
# work then I need this logic in order to create the database
# You can see this here: https://stackoverflow.com/a/30971098/5420796

if not database_exists(engine.url):
    create_database(engine.url)
print(database_exists(engine.url))


Base = declarative_base()

class Itenerary(Base):
    __tablename__ = 'itenerary'

    # Primary Key
    ## String
    distinctkey = Column(
        String(), primary_key=True)
    
    
    #Departure date
    ## String
    departuredate = Column(String())

    # Number of Itineraries Returned
    ## Int
    numberitinerariesreturned = Column(Integer)

    # Selected Destination ID
    ## Int
    selecteddestination_id = Column(Integer)

    # Selected Destination Name
    ## String
    selecteddestination_name = Column(String())

    # startFromLocation
    ## String
    startfromlocation = Column(String())

    # Formatted Address
    formatted_address = Column(String())

    # Lat
    lat = Column(Float)

    # Lng
    lng = Column(Float)

    # Postal Code
    postalcode = Column(
        String())

    # Postal Code Mapped
    # When this script was originally run, I didn't have this column in there
    postalcodemapped = Column(
        String())

    barriomapped = Column(
        String())

    region = Column(
        String())

    # Whether or not the row is a valid observation
    valid = Column(
        Boolean, nullable = False)

    @property
    def serialize(self):
        # Returns object data in easily serializeable format

        return {
            'primary_key': self.distinctkey,
            'numberItinerariesReturned': self.numberitinerariesreturned,
            'selectedDestination_id': self.selecteddestination_id,
            'selectedDestination_name': self.selecteddestination_name,
            'startFromLocation': self.startfromlocation,
            'formatted_address': self.formatted_address,
            'lat': self.lat,
            'lng': self.lng,
            'postalCode': self.postalcode,
            'postalCodeMapped': self.postalcodemapped,
            'barriomapped': self.barriomapped,
            'region': self.region,
            'valid': self.valid

        }


Base.metadata.create_all(engine)
print(database_exists(engine.url))