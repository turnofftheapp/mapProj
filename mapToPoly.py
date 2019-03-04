# Code for this functionality largely based on the following post:
# https://stackoverflow.com/questions/20776205/point-in-polygon-with-geojson-in-python

# Right, now, obviously, this code only works with zipCodes but the idea
# is to expand this so that it works better in the future

import json
from shapely.geometry import shape, Point

# Call the data outside of the function so that
# It is stored in memory and only has to run once
with open('wa.geojson') as f:
	wa_js = json.load(f)

with open('ca.geojson') as f:
	ca_js = json.load(f)

with open('ny.geojson') as f:
	ny_js = json.load(f)

with open('vancouver_area.geojson') as f:
	vancouver_areas_js = json.load(f)


def mapToPoly(lat, lon):

	# construct point based on lon/lat returned by geocoder
	point = Point(lon, lat)

	# check each polygon to see if it contains the point
	geoData = [wa_js, ca_js, ny_js, vancouver_areas_js]

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
			    else:
			    	print(feature['properties']['MAPID'])
			    	return(feature['properties']['MAPID'])

mapToPoly(34.0807282,-118.4130493)
mapToPoly(47.6030565,-122.3290662)
mapToPoly(49.283276,-123.1161202)