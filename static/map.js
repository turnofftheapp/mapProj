// It looks like it is totally fine to have this token published on a git repository
// Mapbox public tokens start with pk and can only be used to retrieve data
// See Mapbox documentation here: https://www.mapbox.com/help/define-access-token/
mapboxgl.accessToken = 'pk.eyJ1IjoiYXhtZTEwMCIsImEiOiJjam0ybHJpYWgycnU1M3BsaXBmbnJicmxuIn0.rec0Fay3v7aDTAuptsaqEA';

/** MODEL **/
// The model pulls the data from a local endpoint 
var mydata = [];
$.ajax({
    url: 'http://0.0.0.0:8000/count/',
    async: false,
    dataType: 'json',
    success: function (json) {
        mydata = json;
    }
});



var arrayLength = mydata.length;
var waData = [];
for (var i = 0; i < arrayLength; i++) {
    var postalCode = mydata[i][0];
    // All of the Washington State Zip codes start with 9, so we shuld just grab those ones
    if (postalCode !== null && postalCode.toString().startsWith("9")) {
    // Get the hits for that postal code
    // Example to follow from map
    // Construct a variable like this but for traits in mapbox
    //{"STATE_ID": "01", "unemployment": 13.17}
    postalCodeHits = mydata[i][1]
    var entry = {"ZCTA5CE10": postalCode.toString(), "postalCodeHits": postalCodeHits};
    waData.push(entry);
    }
}


/*  Get the destination data*/
// No need for AJAX call because of CORS, when developing locally, need to call another file
// Call the data
//var myDestinations = [];
//$.ajax({
//    url: 'https://www.totago.co/api/v1/destinations.json?region_id=1',
//    async: false,
//    dataType: 'json',
//    success: function (json) {
//        myDestinations = json;
//    }
//});


// Pull the array of destination objects out of the JSON variable
var waDestinations = destinationsWA['destinations'];



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

    console.log("internal function coordinates");
    console.log(ret);

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



/** View Model **/
var ViewModel = function() {
    var self = this;

    self.highlightedPostalCode = ko.observable("Observable array");
    
    self.highlightedPostalCodeHits = ko.computed(function() {
    
        // https://stackoverflow.com/a/7178381/5420796
        for(var i = 0; i < waData.length; i += 1) {
            //console.log(waData[i]["ZCTA5CE10"]);
            if(waData[i]["ZCTA5CE10"] == self.highlightedPostalCode()) {
                //console.log(waData[i]["postalCodeHits"]);
                return waData[i]["postalCodeHits"];
            }
        }   

    });

    // Create an empty array of destination circle objects
    self.destinationCircles = ko.observableArray([]);


    var waDestinationsLength = waDestinations.length;
    //console.log(waDestinationsLength);
    //console.log(waDestinationsLength);
    for (var i = 0; i < waDestinationsLength; i++) {
    
        var name = waDestinations[i]['name'];
        var lat = parseFloat(waDestinations[i]['begin_lat']);
        var lng = parseFloat(waDestinations[i]['begin_lng']);

        //console.log("Check me: ")
        //console.log(lat);
        //console.log(lng);

        latLngArray = [];
        latLngArray.push(lat);
        latLngArray.push(lng);
        
        console.log("Before function call")
        console.log(latLngArray);

        geoJSONCircle = createGeoJSONCircle(latLngArray, 1);
        console.log(geoJSONCircle);
        
        destinationObject = {
            name: name,
            geoJSONCircle: geoJSONCircle
        }
        
        // Push out to observable array
        self.destinationCircles.push(destinationObject);
    }

};


/** VIEW **/
// Create the map object
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    // Old style that already had built in property
    //style: 'mapbox://styles/axme100/cjmffc3x90kg62sru3qxh7g7b'
    center: [-122.33, 47.60],
    // TODO: NOTICE HOW THE TILESET ONLY APPEARS AT A ZOOM LEVEL OF 8, AT THIS POINT, ANYWAY
    zoom: 8
});

$(document).ready(function () {
    map.on('load', function() {
        // Thig logic is mostly an adaptation of the following blog
        // The big difference being that the data comes from an AJAX call that extracts the data from a local database
        // whereas in the example the data is hard coded
        //https://www.mapbox.com/mapbox-gl-js/example/data-join/
        
        // Add source for zip code polygons hosted on Mapbox, based on US Census Data:
        // https://www.census.gov/geo/maps-data/data/cbf/cbf_state.html
        map.addSource("wa", {
            type: "vector",
            url: "mapbox://axme100.0bz1txrj"
        });

        var expression = ["match", ["get", "ZCTA5CE10"]];

        // Calulate Max Value
        // https://stackoverflow.com/questions/4020796/finding-the-max-value-of-an-attribute-in-an-array-of-objects
        maxValue = Math.max.apply(Math, waData.map(function(o) { return o.postalCodeHits; }))
        
        //console.log("Max value")
        //console.log(maxValue)

        // Calculate color for each state based on the unemployment rate
        waData.forEach(function(row) {
            var green = (row["postalCodeHits"] / maxValue) * 500;
            var color = "rgba(" + 0 + ", " + green + ", " + 0 + ", 1)";
            expression.push(row["ZCTA5CE10"], color);
        });

        // Last value is the default, used where there is no data
        expression.push("rgba(0,0,0,0)");

        // Add layer from the vector tile source with data-driven style
        map.addLayer({
            // be careful that second dash works
            "id": "wa-join",
            "type": "fill",
            "source": "wa",
            "source-layer": "wa",
            "paint": {
                "fill-color": expression
            }
        }, 'waterway-label');

        for (var i = 0; i < my.viewModel.destinationCircles().length; i++) {

            var name = my.viewModel.destinationCircles()[i].name;
            var circle = my.viewModel.destinationCircles()[i].geoJSONCircle;
            
            console.log(name);
            console.log(circle);

            map.addSource(name,circle);
            map.addLayer({
                "id": name,
                "type": "fill",
                "source": name,
                "layout": {},
                "paint": {
                    "fill-color": "blue",
                    "fill-opacity": 1.0
                }
            });

            var mapLayer = map.getLayer(name);

            // This code esentially if the layer is undefined when it's added
            if(typeof mapLayer == 'undefined') {
            // Remove map layer & source.
            console.log("UNDEFINED LAYER");
            }

        }

        circle = createGeoJSONCircle([47.708013, -122.335167], 1)
        console.log("Circle should have to be like this: ")
        console.log(circle);
        map.addSource("Mount Si", circle);

        map.addLayer({
            "id": "Mount Si",
            "type": "fill",
            "source": "Mount Si",
            "layout": {},
            "paint": {
                "fill-color": "red",
                "fill-opacity": 1.0
            }
        });


        // TODO: Add legend from tutorial
        // As of this point this part was just copied over
        // https://www.mapbox.com/help/choropleth-studio-gl-pt-2/#mission-complete
        //var layers = ['0-10', '10-20', '20-50', '50-100', '100-200', '200-500', '500-1000', '1000+'];
        //var colors = ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];

        //for (i = 0; i < layers.length; i++) {
        //   var layer = layers[i];
        //    var color = colors[i];
        //    var item = document.createElement('div');
        //    var key = document.createElement('span');
        //    key.className = 'legend-key';
        //    key.style.backgroundColor = color;

        //    var value = document.createElement('span');
        //    value.innerHTML = layer;
        //    item.appendChild(key);
        //    item.appendChild(value);
        //    legend.appendChild(item);
        //}

        map.on('mousemove', function (e) {
        var features = map.queryRenderedFeatures(e.point);
        var hoveredPostalCode = features[0]['properties']['ZCTA5CE10'];
        // Remember observables are functions
        // https://stackoverflow.com/a/14159596/5420796
        my.viewModel.highlightedPostalCode(hoveredPostalCode);
        });
    });
});

/** Apply Bindings */
// This cod was also just copied over from what I had on knockout from
// My Udacity project
// https://github.com/axme100/mapProj/blob/master/js/app.js
// I'm creating an instance of my view model called "my" 
// The idea for this comes from the following post on the next line:
// https://stackoverflow.com/questions/46943988/how-can-i-access-an-observable-outside-the-viewmodel-in-knockoutjs?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
my = { viewModel: new ViewModel() };
ko.applyBindings(my.viewModel);