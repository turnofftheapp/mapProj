# Running Postgres locally
### https://postgresapp.com/documentation/troubleshooting.html


# Making circles for destinations with data-driven sizing:

This app uses computed observables to create a bunch of geoJSONCircle ojbects (https://stackoverflow.com/a/39006388/5420796) that live in the viewModel.

Note: do this at the end of the model and before the viewModel like it is done in this project: https://github.com/axme100/mapProj/blob/master/js/app.js. **See function createGeoJSONCircle.js**

When the map first loads, all of the destination objects' corresponding geoJSON circle objects will be rendered (with the same radius). This will be in the view at the end (it will only be called once)]. Then, a funcion in the viewModel that is activated when you click on a certain area code will pass in this area code as a parameter, make an api call to the local server to get a list of all the of the desintations and associated counts from that area in desceding order (Will have to do SQL query or ORM SQL query)

Then use this new table to update the radius of the all the geoJSON circles that live in the viewModel.
	
## Inspiration
- https://stackoverflow.com/a/39006388/5420796
- https://www.mapbox.com/mapbox-gl-js/example/geojson-polygon/


# Preference for MBTiles over geojson
MBTiles are mapbox's preferred format and the maps work at all zoom levels when you convert to this format. You can convert from geoJSON to MBTiles using the command-line utilit Tippecanoe, you can follow this tutorial:
## https://www.mapbox.com/help/large-data-tippecanoe/
Bascially, in ther terminal, just run this is the command to convert:
`$ tippecanoe -o ca.mbtiles ca.geojson`

# Canadian postal code files
In Canada, postal codes are known as Forward Sorting Locations

## Resources
- This answer explains how you can download them on the Canada Open Government website initiative https://gis.stackexchange.com/a/28974/137465
- Here is the website where you download the files:https://www12.statcan.gc.ca/census-recensement/2011/geo/bound-limit/bound-limit-2011-eng.cfm
- You can select between cartographic and non-cartographic files, the former include lakes and shoreline, for our purposes digital should be fine and it's less data
- This post explains the difference:
# https://www150.statcan.gc.ca/n1/pub/92-195-x/2011001/other-autre/carto-eng/carto-eng.htm


# Best practices

## Downloading large geoJSON files from github
Instead of copying and pasting a raw Git Hub Document into a text editor, or something like that, you can easily download large files by just grabbing the raw url from github and then use curl
`$ tippecanoe -o ca.mbtiles ca.geojson`
