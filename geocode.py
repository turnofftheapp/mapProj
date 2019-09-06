import googlemaps
import json
import os
from datetime import datetime

# Get the api key from the environment variable
my_key = os.environ['google_api_key']

def geocode(address):
	# Is this the best place for the gmaps object?
	gmaps = googlemaps.Client(key=my_key)
	geocode_result = gmaps.geocode(address)
	#print(json.dumps(geocode_result, indent=2))
	geoCodeInfo = {}
	geoCodeInfo["formatted_address"] = geocode_result[0]["formatted_address"]
	geoCodeInfo["lat"] = geocode_result[0]["geometry"]["location"]["lat"]
	geoCodeInfo["lng"] = geocode_result[0]["geometry"]["location"]["lng"]
	address_components = geocode_result[0]["address_components"]
	
	# Loop through the address componens to check if there is a postal code
	# If there is a postal code, grab it and add it to the dictionary
	for component in address_components:
		componentTypeFirstIndex = component["types"][0]
		if componentTypeFirstIndex == "postal_code":
			postalCode = component["long_name"]
			geoCodeInfo["postalCode"] = postalCode
	return(geoCodeInfo)