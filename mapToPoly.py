# Code for this functionality largely based on the following post:
# https://stackoverflow.com/questions/20776205/point-in-polygon-with-geojson-in-python

# Right, now, obviously, this code only works with zipCodes but the idea
# is to expand this so that it works better in the future

import json
from shapely.geometry import shape, Point

def mapToPoly(lat, lon):

	with open('wa.geojson') as f:
	    js = json.load(f)

	# construct point based on lon/lat returned by geocoder
	point = Point(lon, lat)
	print(point)

	# check each polygon to see if it contains the point
	for feature in js['features']:
	    polygon = shape(feature['geometry'])
	    #print(polygon)
	    if polygon.contains(point):
	        print(feature['properties']['ZCTA5CE10'])
	        return(feature['properties']['ZCTA5CE10'])
	    else:
	    	print("NOT WASH, TEMP")
	    	return("NOT WASH, TEMP")

mapToPoly(47.6062, -122.3320)
