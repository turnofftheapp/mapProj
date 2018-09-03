import googlemaps
import json
import os
from datetime import datetime

# Get api key
my_key = os.environ['my_key']

def geocode(address):
	# Is the gmaps object something that I want to include within or outside of the function
	gmaps = googlemaps.Client(key=my_key)
	geocode_result = gmaps.geocode(address)
	#print(json.dumps(geocode_result, indent=2))
	geoCodeInfo = {}
	geoCodeInfo["formatted_address"] = geocode_result[0]["formatted_address"]
	geoCodeInfo["lat"] = geocode_result[0]["geometry"]["location"]["lat"]
	geoCodeInfo["lng"] = geocode_result[0]["geometry"]["location"]["lng"]
	address_components = geocode_result[0]["address_components"]
	#print(address_components)
	for component in address_components:
		componentTypeFirstIndex = component["types"][0]
		if componentTypeFirstIndex == "postal_code":
			postalCode = component["long_name"]
			geoCodeInfo["postalCode"] = postalCode
			#print(postalCode)
	print(geoCodeInfo)
	return(geoCodeInfo)