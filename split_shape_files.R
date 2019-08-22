# To split the shape files we are going to be using
# the geojsonio package
# https://docs.ropensci.org/geojsonio/
# https://stackoverflow.com/questions/47145379/subsetting-geojson-data-with-r
https://docs.ropensci.org/geojsonio/


california <- geojsonio::geojson_read("shapefiles/ca.geojson", what = "sp")


sanDiegoCounty <- subset(cities, name %in% c("Seattle WA", "San Francisco CA"))


# First get the zip codes for LA and San Diego County
# https://www.zip-codes.com/county/ca-san-diego.asp