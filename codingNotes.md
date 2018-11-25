Coding Notes

# Making a circle based on a certain size
# Looks like I would esentially follow this example: 
https://stackoverflow.com/a/39006388/5420796

# Here is another example from mapBox
https://www.mapbox.com/mapbox-gl-js/example/geojson-polygon/

# Plan:

## First I should read in the CSV into the backend of python and serve it up as an api end point.
-Instead of reading a CSV, I guess it could be a database, but since it's a relatively small file that won't change much I think it would be better for it to just read in the CSV file into a pandas data frame.

# Then I make an additional initial AJAX call on the front end that pulls the data

# First create a bunch of destination objets, that contain additional information such as the name of the destination.

# Use computed observables to create a bunch of the following step.

# Create a bunch of geoJSONCircle objects from the tutorial above (https://stackoverflow.com/a/39006388/5420796) that live in the viewModel. Note: do this at the end of the model and before the viewModel like it is done in this project: https://github.com/axme100/mapProj/blob/master/js/app.js. **See function createGeoJSONCircle.js**

# When the map first loads, all of the destination objects will be created (with the same radius). This will be in the view at the end (it will only be called once)

# Then, inside the view, I will render circles with al the geoJSON

# I will create a funcion in the viewModel that is activated when you click on a certain area code, it will pass in this area code as a parameter, make an api call to the local server to get a list of all the of the desintations and associated counts from that area in desceding order

	-Will have to do SQL query or ORM SQL query

# Then use this new table to update the radius of the destinationID objects.
	- Do this like it's done at the end of the stackoverfLow tutorial by Dwyer
	-Hopefully this will carry into the view

# Issue with zoom level
https://github.com/mapbox/mapbox-gl-js/issues/4954
https://www.mapbox.com/help/adjust-tileset-zoom-extent/
## Looks like this might be the way to solve it
https://www.mapbox.com/help/large-data-tippecanoe/

