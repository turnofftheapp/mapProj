
# coding: utf-8

# # Import libraries, set options, connect to DB

# In[114]:


# Configuration code for datawrangling
import pandas as pd
import numpy as np
from datetime import datetime
from geocode import geocode
from mapToPoly import mapToPoly
pd.set_option('display.max_row', 30000)
import csv

# Configuration code in order to connect to the database
from sqlalchemy import create_engine, exists
from sqlalchemy.orm import sessionmaker
from database_setup import Itenerary, Base
engine = create_engine('sqlite:///totagoData.db')

# Bind the engine to the metadata of the Base class so that the
# declaratives can be accessed through a DBSession instance
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)

session = DBSession()


# # Read in data as pandas data frame, selecting only certain fields

# In[115]:


fields = ['distinct_id', 'numItinerariesReturned', 'departureDate', 'startFromLocation', 'selectedDestination_id', 'selectedDestination_name', 'time']


# In[116]:


df = pd.read_csv('generated_itineraries.csv', usecols = fields)


# # Wrange field: destinationIDs

# In[117]:


# Replace all of the NAs for destinationIDs with 0
df.selectedDestination_id.fillna(0, inplace = True)

# Remove the 2 cases where the string says null
# Great tutorial here: https://www.youtube.com/watch?v=2AFGPdNn4FM
df = df[df.selectedDestination_id != 'null']

# Convert destinationIDs column to an integer value
df['selectedDestination_id'] = df.selectedDestination_id.astype(int)


# # Wrangle field: numItenerariesReturned

# In[118]:


# Replace all of the NAs for numItinerariesReturned with 1
df.numItinerariesReturned.fillna(1, inplace = True)

# Convert from float to integer
df['numItinerariesReturned'] = df.numItinerariesReturned.astype(int)

# Select, only observatiosn where this field is greater than 0 (now that the NAs are gone)


# # Wrangle Field: Destination Name

# In[119]:


#Replace all of the NAs in
df.selectedDestination_name.fillna("", inplace = True)

print("Number of rows before departure date: ")
print(len(df))


# # Wrangle Field: departureDate

# In[120]:


#Convert destinationIDs column to an integer value
# It looks like there were some complex rows being held in here before, I thought that when df.dtypes returned object that
# meant string but apprently not
df['departureDate'] = df.departureDate.astype(str)

print("number of rows before removal of anamoulous departureDate cases")
print(len(df))


# IT looks like there are some cases where this field is blank, says nan, is in format 24503, or in format "masked" 
# We need to remove these cases from the data frame
# I can see that some blank rows are still printed out.
df = df[df.departureDate != '']
df = df[df.departureDate != 'nan']
df = df[df.departureDate != '24503']
df = df[df.departureDate != '[masked]']


print("number of rows after removal of anamoulous departureDate cases")
print(len(df))

# Create a function extractDate that extracts the first ten characters of an input string
def extractDate(dateString):
    extractedDate = dateString[0:10]
    if len(extractedDate) < 10:
        print(extractedDate)
    return extractedDate

''' Code to test if the extractDate function works

# Apply this function to create  a new column
df['departureDateFixed'] = df.departureDate.apply(extractDate)

cols = ['distinct_id', 'departureDate', 'departureDateFixed', 'numItinerariesReturned', 'selectedDestination_id', 'selectedDestination_name', 'startFromLocation']

df = df[cols]
'''

# Override departure date extracting all of the null time stamps
df['departureDate'] = df.departureDate.apply(extractDate)


# Convert departure date into a time object in pandas
#See here: https://stackoverflow.com/questions/26763344/convert-pandas-column-to-datetime
# Though this actually might not need to be done
#df['departureDate'] = df.departureDate.apply(lambda x: datetime.strptime(x, '%Y-%m-%d'))




#df['departureDate'] = datetime.strptime(df['departureDate'], '%Y-%m-%-d')  
#df['departureDate'] = pd.to_datetime(df['departureDate'], format = '%Y-%m-%-d')



# # Wrangle Field: distinctID

# In[121]:


#It turns out distinc_id correpsonds to a user

# Therefore, create a coloumn that combines the unix time stamp with distinct_id so that we have a primary key for database
df["primary_key"] = df["distinct_id"] + "-" + df["time"].map(str)


vc = df.primary_key.value_counts()
print(vc[vc > 1])


unique_keys = df.primary_key.unique()
#print(len(unique_keys))

#df.head(n = len(df))


# # Create a subset of the datle with sample method to test geocode and database entry logic

# In[122]:


#Out put the entire database
#df.head(len(df))

len(df)


# In[123]:


#Create a random sample of the database, these entries will be added to the database in the next section
sampleDf = df.sample(5)

# Output this random sample
sampleDf.head(len(sampleDf))    


# ## Read in the destination data to allow the possibility to pull the correct names
# 
#  
# 

# In[124]:


f = open("destinations_mapping_Jul-30-18.csv")

reader = csv.reader(f)


destinations = {}


# The index at the end of the for loop just skips the first row which is the header in the csv file
next(reader)
for row in reader:
    destinations[row[0]] = {'name':row[1]}

print(destinations)


# # Loop through the rows in the dataframe, geocode, add entry to database

# In[125]:


# Loop through the subsetted pandas data frame
for index, row in df.iterrows():
   

    # Pull out the primary key into a variable
    testKey = row["primary_key"]
    
    # Check to see if that distinctID is in the data base
    # See this post: https://stackoverflow.com/questions/6587879/how-to-elegantly-check-the-existence-of-an-object-instance-variable-and-simultan?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
    entryExists = session.query(exists().where(Itenerary.distinctKey==testKey)).scalar()

    # If the entry is not in the database
    if not entryExists:
    
        # Get the string to be geocoded
        locationToGeocode = row["startFromLocation"]

        # Try to run the geocode function that returns a dictionary of information
        try:
            geocodeInfo = geocode(locationToGeocode)
            # If geocoding works, set valid to tre
            valid = True

        # If the geocode function doesn't work set valid to false
        except:
            valid = False 

        # If valid is true create a database entry with information from the dataframe, and the returned geocode informaiton
        if valid:
            
            # Sometimes, such as when a generic city is sent to the geocode() function a geometric center
            # is returned, this means there is no postal code
            if not 'postalCode' in geocodeInfo:
                geocodeInfo['postalCode'] = "none"

            databaseEntry = Itenerary(distinctKey=row["primary_key"],
                                      numberItinerariesReturned=row["numItinerariesReturned"],
                                      selectedDestination_id=row["selectedDestination_id"],
                                      selectedDestination_name=row["selectedDestination_name"],
                                      startFromLocation=row["startFromLocation"],
                                      departureDate=row["departureDate"],
                                      # Get data from python dictionary returned from geocode() function
                                      formatted_address=geocodeInfo['formatted_address'],
                                      lat=geocodeInfo['lat'],
                                      lng=geocodeInfo['lng'],
                                      postalCode=geocodeInfo['postalCode'],
                                      valid=valid)
        # If valid is false, just fill in the information that we have from the pandas data frame
        else:
            databaseEntry = Itenerary(distinctKey=row["primary_key"],
                                      numberItinerariesReturned=row["numItinerariesReturned"],
                                      selectedDestination_id=row["selectedDestination_id"],
                                      selectedDestination_name=row["selectedDestination_name"],
                                      startFromLocation=row["startFromLocation"],
                                      departureDate=row["departureDate"],
                                      valid=valid)

        # Add the the information to a database.    
        session.add(databaseEntry)
        session.commit()
    
    else:
        print("Entry already inside of database, but will edit information to new row")
        
        # Get the row what I'm going to modify
        rowToModify = session.query(Itenerary).filter_by(distinctKey=testKey).one()
        
        
        destinationID = rowToModify.selectedDestination_id
        destinationName = rowToModify.selectedDestination_name
        
        
        # See i
        if not destinationName:
            
            #if destinationID != 0 and destinationID != 30 and destinationID != 31 and destinationID != 52 and destinationID != 41 and destinationID != 53 and destinationID != 104 and destinationID != 70 and destinationID != 199 and destinationID != 195:
            key = str(destinationID)
            if key in destinations:
            
                # Pull the data out from the dictionary that was created in the cell above
                newName = destinations[str(destinationID)]['name']
        
                # Add the new name to the new row
                rowToModify.selectedDestination_name = newName
            
            else:
                rowToModify.postalCodeMapped = "DELETED"
        # The code that is commented out below was used to populate the new column of the database that
        # was added manually on the sqlite command line, see git history
        
        # Pull the lat and lng coordinates out
        # lat = rowToModify.lat
        # lng = rowToModify.lng
        
        # Test to see if there is even a lat value in there
        #
        #if lat:
            
            # Match these lat and lng coordinates to a zipCode
            #newZip = mapToPoly(lat, lng)
        
            # Match this new zip to the postalCodeMapped Field in database
            #rowToModify.postalCodeMapped = newZip
        
        # Add to database
                session.add(rowToModify)
                session.commit()

