# Coding Notes
Here lives notes on how to implement data driven circles for the destination circles as well as notes on getting the zoom level to work properly. Future notes will be added here as well.

# Making circles for destinations with data-driven sizing:
## Looks like I would esentially follow this example: 
https://stackoverflow.com/a/39006388/5420796
## Here is another example from mapBox
https://www.mapbox.com/mapbox-gl-js/example/geojson-polygon/

## Plan:

~~1. First I should read in the CSV of destinations into the backend of python and serve it up as an api end point.
*Instead of reading a CSV, I guess it could be a database, but since it's a relatively small file that won't change much I think it would be better for it to just read in the CSV file into a pandas data frame*~~

~~2. Then I make an additional initial AJAX call on the front end that pulls all of this data~~

1. Before deployment the destination polygon data will be read from a Totago API, because of CORS, for now this data lives in a variable from copy and pasted raw JSON

2. Create a bunch of destination objets, that contain additional information such as the name of the destination, could potentially contain other things like links and pictures.

4. Using computed observables, create a bunch of geoJSONCircle objects from the tutorial above (https://stackoverflow.com/a/39006388/5420796) that live in the viewModel. Note: do this at the end of the model and before the viewModel like it is done in this project: https://github.com/axme100/mapProj/blob/master/js/app.js. **See function createGeoJSONCircle.js**

5. When the map first loads, all of the destination objects' corresponding geoJSON circle objects will be rendered (with the same radius). This will be in the view at the end (it will only be called once)

6. I will create a funcion in the viewModel that is activated when you click on a certain area code, it will pass in this area code as a parameter, make an api call to the local server to get a list of all the of the desintations and associated counts from that area in desceding order (Will have to do SQL query or ORM SQL query)

7. Then use this new table to update the radius of the all the geoJSON circles that live in the viewModel.
	a. Do this like it's done at the end of the stackoverfLow tutorial by Dwyer
	b. Hopefully this will carry into the view

# Issue with zoom level
This was solved by simply converting from geoJSON to MBTiles using the command-line utilit Tippecanoe, you can follow this tutorial:
https://www.mapbox.com/help/large-data-tippecanoe/
Bascially, in ther terminal, just run this is the command to convert:
`$ tippecanoe -o ca.mbtiles ca.geojson`

# Downloading large geoJSON files from github
Instead of copying and pasting a raw Git Hub Document into a text editor, or something like that, you can easily download large files by just grabbing the raw url from github and then use curl
`$ tippecanoe -o ca.mbtiles ca.geojson`


# Dowloading shape files of canada postal codes
In Canada, postal codes are known as Forward Sorting Locations
# This answer explains how you can download them on the Canada Open Government website initiative
https://gis.stackexchange.com/a/28974/137465
# Here is the website where you download the files
# https://www12.statcan.gc.ca/census-recensement/2011/geo/bound-limit/bound-limit-2011-eng.cfm
# You can select between cartographic and non-cartographic files, the former include lakes and shoreline, for our purposes digital should be fine and it's less data
# This post explains the difference:
# https://www150.statcan.gc.ca/n1/pub/92-195-x/2011001/other-autre/carto-eng/carto-eng.htm
# SHP FILES (ARG GIS INVENTED THESE)
https://en.wikipedia.org/wiki/Geography_Markup_Language
# Convert to GEOJSON USING QGIS AND SAVING AS A NEW LAYER
# Seems like it would be simple: https://gis.stackexchange.com/questions/28613/convert-gml-to-geojson/28617
# TODO: CUT THIS DOWN TO JUST BRITISH COLOMBIA (IF NOT TOO MUCH WORK)
# GETTING A PROJECTION WARNING WHEN USING TIPPECANOE
`gfsa.geojson: Warning: GeoJSON specified projection "urn:ogc:def:crs:EPSG::4269", not the expected "urn:ogc:def:crs:OGC:1.3:CRS84".
gfsa.geojson: If "urn:ogc:def:crs:OGC:1.3:CRS84" is not the expected projection, use -s to specify the right one.
1621 features, 8149709 bytes of geometry, 14855 bytes of separate metadata, 9179 bytes of string pool`
# There could be something wrong with this projection later on the line
tippecanoe -o gfsa.mbtiles gfsa.geojson


# Running Postgres locally
# https://postgresapp.com/documentation/troubleshooting.html
