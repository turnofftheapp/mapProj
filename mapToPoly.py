# Code for this functionality largely based on the following post:
# https://stackoverflow.com/questions/20776205/point-in-polygon-with-geojson-in-python

# Right, now, obviously, this code only works with zipCodes but the idea
# is to expand this so that it works better in the future

import json
from shapely.geometry import shape, Point

# Call the data outside of the function so that
# It is stored in memory and only has to run once
with open('shapefiles/wa.geojson') as f:
	wa_js = json.load(f)

with open('shapefiles/ca.geojson') as f:
	ca_js = json.load(f)

with open('shapefiles/ny.geojson') as f:
	ny_js = json.load(f)

with open('shapefiles/canada.geojson') as f:
	canada = json.load(f)


## Load the shapefiles corresponding to city districts
with open('shapefiles/vancouver_area.geojson') as f:
	vancouver_areas_js = json.load(f)

with open('shapefiles/wazillow.geojson') as f:
	wazillow_js = json.load(f)

with open('shapefiles/cazillow.geojson') as f:
	cazillow_js = json.load(f)

with open('shapefiles/nyzillow.geojson') as f:
	nyzillow_js = json.load(f)


def mapToPoly(lat, lon, myType):

	if myType == 'postal':

		# construct point based on lon/lat returned by geocoder
		point = Point(lon, lat)

		# check each polygon to see if it contains the point
		geoData = [wa_js, ca_js, ny_js, canada]

		for data in geoData:

			for feature in data['features']:
			    polygon = shape(feature['geometry'])
			    if polygon.contains(point):
				    
				    try:
				    	usZIP = feature['properties']['ZCTA5CE10']
				    except:
				    	usZIP = False

				    if usZIP:
				    	print(feature['properties']['ZCTA5CE10'])
				    	return(feature['properties']['ZCTA5CE10'])
				    
				    # Otherwise it must come from the canada map
				    else:
				    	print(feature['properties']['CFSAUID'])
				    	return(feature['properties']['CFSAUID'])

	elif myType == 'barrio':

		# construct point based on lon/lat returned by geocoder
		point = Point(lon, lat)

		# check each polygon to see if it contains the point
		geoData = [vancouver_areas_js, wazillow_js, cazillow_js, nyzillow_js]

		for data in geoData:

			for feature in data['features']:
			    polygon = shape(feature['geometry'])
			    if polygon.contains(point):
				    
				    # See if it comes from the a zillow dataset
				    try:
				    	zillowSet = feature['properties']['RegionID']
				    except:
				    	zillowSet = False

				    if zillowSet:
				    	print(feature['properties']['RegionID'])
				    	return(feature['properties']['RegionID'])
				    # Otherwise it must come form the vancouver map
				    else:
				    	print(feature['properties']['MAPID'])
				    	return(feature['properties']['MAPID'])


# Test the function out, make sure to delete this
#mapToPoly(34.0807282,-118.4130493, 'postal')
#mapToPoly(47.6030565,-122.3290662, 'postal')
#mapToPoly(49.283276,-123.1161202, 'postal')
#
#mapToPoly(34.0807282,-118.4130493, 'barrio')
#mapToPoly(47.6030565,-122.3290662, 'barrio')
#mapToPoly(49.283276,-123.1161202, 'barrio')