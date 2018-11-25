Coding Notes

# Making a circle based on a certain size
## Looks like I would esentially follow this example: 
https://stackoverflow.com/a/39006388/5420796
## Here is another example from mapBox
https://www.mapbox.com/mapbox-gl-js/example/geojson-polygon/

## Plan:

1. First I should read in the CSV of destinations into the backend of python and serve it up as an api end point.
*Instead of reading a CSV, I guess it could be a database, but since it's a relatively small file that won't change much I think it would be better for it to just read in the CSV file into a pandas data frame*

2. Then I make an additional initial AJAX call on the front end that pulls all of this data

3. Create a bunch of destination objets, that contain additional information such as the name of the destination, could potentially contain other things like links and pictures.

4. Using computed observables, create a bunch of geoJSONCircle objects from the tutorial above (https://stackoverflow.com/a/39006388/5420796) that live in the viewModel. Note: do this at the end of the model and before the viewModel like it is done in this project: https://github.com/axme100/mapProj/blob/master/js/app.js. **See function createGeoJSONCircle.js**

5. When the map first loads, all of the destination objects' corresponding geoJSON circle objects will be rendered (with the same radius). This will be in the view at the end (it will only be called once)

6. I will create a funcion in the viewModel that is activated when you click on a certain area code, it will pass in this area code as a parameter, make an api call to the local server to get a list of all the of the desintations and associated counts from that area in desceding order (Will have to do SQL query or ORM SQL query)

7. Then use this new table to update the radius of the all the geoJSON circles that live in the viewModel.
	a. Do this like it's done at the end of the stackoverfLow tutorial by Dwyer
	b. Hopefully this will carry into the view

# Issue with zoom level
This was solved by simply converting from geoJSON to MBTiles using the command-line utilit Tippecanoe, you can follow this tutorial:
https://www.mapbox.com/help/large-data-tippecanoe/