// It looks like it is totally fine to have this token published on a git repository
// Mapbox public tokens start with pk and can only be used to retrieve data
// See Mapbox documentation here: https://www.mapbox.com/help/define-access-token/
mapboxgl.accessToken = 'pk.eyJ1IjoiYXhtZTEwMCIsImEiOiJjam0ybHJpYWgycnU1M3BsaXBmbnJicmxuIn0.rec0Fay3v7aDTAuptsaqEA';

function getMapData () {

    

    // make a region URL with the correct parameter
    // TODO: Create backend calls so that is can work for other regions
    // As of now, this just calls a backend call for all the data and
    // then filters in to Seattle specifically
    regionURL = '/count/' + my.viewModel.currentRegion() + "/" + my.viewModel.mapType();

    console.log(regionURL)

    var mydata = [];
    $.ajax({
        url: regionURL,
        dataType: 'json',
        success: function (json) {
            mydata = json;
            // Lines 26 - 43 are going to have to be incorporated ino the function above
            var arrayLength = mydata.length;
            var mapData = [];

            for (var i = 0; i < arrayLength; i++) {
    
                var mapArea = mydata[i]['mapArea'];
    
                if (mapArea !== null) {
                    // Get the hits for that postal code
                    // Example to follow from map
                    // Construct a variable like this but for traits in mapbox
                    //{"STATE_ID": "01", "unemployment": 13.17}
                    mapAreaHits = mydata[i]['mapAreaHits']
                    
                    // The canada maps have different fields
                    // That is, not ZCTA5CE10 nor RegionID
                    if (my.viewModel.currentRegion() == "canada") {

                         if (my.viewModel.mapType() == "postal") {
                            mapAreaName = "CFSAUID";
                        } else if (my.viewModel.mapType() == "barrio") {
                            mapAreaName = "MAPID"
                        }

                    // If it is not Canada then it comes from the US
                    // So ZCTA5EC10 should work just fine
                    } else {

                        if (my.viewModel.mapType() == "postal") {
                            mapAreaName = "ZCTA5CE10";
                        } else if (my.viewModel.mapType() == "barrio") {
                            mapAreaName = "RegionID"
                        }
                    
                    }
                    var entry = {mapAreaName: mapArea.toString(), "mapAreaHits": mapAreaHits};
                    mapData.push(entry);
                }
            }
            // Call the helper function to render the map
            renderMap(mapData);      
        }
    });

    
};


// Pull the array of destination objects out of the JSON variable
// This will have to become an AJAX call before deployment
//var waDestinations = destinationsWA['destinations'];
//console.log("Original Destinations:")
//console.log(waDestinations);

function getDestinationData () {

    var url = '/destinations/' + my.viewModel.currentRegion()

    var mydata = [];
    $.ajax({
        //url: 'https://www.totago.co/api/v1/destinations.json?region_id=1',
        url: url,
        dataType: 'json',
        success: function (json) {
            mydata = json;
            console.log("New Desintations: ")
            console.log(mydata['destinations'])
            // Call the function to add these circles with this data 
            addDestinationCircles(mydata['destinations'])
        }
    });
};

function getDestinationFromAreaData(mapArea) {

    console.log(mapArea);

    console.log("Made it inside");
    console.log('/postalCodeToDestination/' + mapArea + "/" + my.viewModel.mapType());
    var postalCodeToDestination = [];
        $.ajax({
            url: '/postalCodeToDestination/' + mapArea + "/" + my.viewModel.mapType(),
            async: false,
            dataType: 'json',
            success: function (json) {
                console.log("Got your data")
                mapAreaData = json;
                my.viewModel.postalCodeToDestinationData(mapAreaData);
                renderGraph();
                setCircles();
            }
        });
}

// Function to Create Objects that will live in the view model
// This comes from this post:
// https://stackoverflow.com/a/39006388/5420796
// Pretty sure that points can be left blank
var createGeoJSONCircle = function(center, radiusInKm, points) {
    if(!points) points = 64;

    var coords = {
        // The only thing that was switched up in this function was teh
        // order of the two points
        latitude: center[0],
        longitude: center[1]
    };

    var km = radiusInKm;

    var ret = [];
    var distanceX = km/(111.320*Math.cos(coords.latitude*Math.PI/180));
    var distanceY = km/110.574;

    var theta, x, y;
    for(var i=0; i<points; i++) {
        theta = (i/points)*(2*Math.PI);
        x = distanceX*Math.cos(theta);
        y = distanceY*Math.sin(theta);

        ret.push([coords.longitude+x, coords.latitude+y]);
    }
    ret.push(ret[0]);

    return {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": [{
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [ret]
                }
            }]
        }
    };
};


let regionData = [
  {
    name: "washington",
    coordinates: [-122.33, 47.60],
    displayName: "Seattle, WA"
  },
  {
    name: "california",
    coordinates: [-118.2437, 34.0522],
    displayName: "Los Angeles, California"
  },
  {
    name: "newyork",
    coordinates: [-74.00, 40.71],
    displayName: "New York, New York"
  },
  {
    name: "canada",
    coordinates: [-123.120, 49.282],
    displayName: "Vancouver, BC"
  }
]