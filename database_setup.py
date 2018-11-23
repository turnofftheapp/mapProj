import os
import sys
from sqlalchemy import Column, ForeignKey, Integer, String, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy import create_engine

Base = declarative_base()

class Itenerary(Base):
    __tablename__ = 'itenerary'

    # Primary Key
    ## String
    distinctKey = Column(
        String(), primary_key=True)
    
    
    #Departure date
    ## String
    departureDate = Column(String())

    # Number of Itineraries Returned
    ## Int
    numberItinerariesReturned = Column(Integer)

    # Selected Destination ID
    ## Int
    selectedDestination_id = Column(Integer)

    # Selected Destination Name
    ## String
    selectedDestination_name = Column(String())

    # startFromLocation
    ## String
    startFromLocation = Column(String())

    # Formatted Address
    formatted_address = Column(String())

    # Lat
    lat = Column(Float)

    # Lng
    lng = Column(Float)

    # Postal Code
    postalCode = Column(
        String())

    # Postal Code Mapped
    # When this script was originally run, I didn't have this column in there
    postalCodeMapped = Column(
        String())


    # Whether or not the row is a valid observation
    valid = Column(
        Boolean, nullable = False)

    @property
    def serialize(self):
        # Returns object data in easily serializeable format

        return {
            'primary_key': self.distinctKey,
            'numberItinerariesReturned': self.numberItinerariesReturned,
            'selectedDestination_id': self.selectedDestination_id,
            'selectedDestination_name': self.selectedDestination_name,
            'startFromLocation': self.startFromLocation,
            'formatted_address': self.formatted_address,
            'lat': self.lat,
            'lng': self.lng,
            'postalCode': self.postalCode,
            'valid': self.valid

        }

engine = create_engine(
                      'sqlite:///totagoData.db')

Base.metadata.create_all(engine)