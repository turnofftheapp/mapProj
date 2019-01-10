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

// Pull the array of destination objects out of the JSON variable
// This will have to become an AJAX call before deployment
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

    self.highlightedPostalCode = ko.observable("");
    
    self.highlightedPostalCodeHits = ko.computed(function() {
    
        // https://stackoverflow.com/a/7178381/5420796
        for(var i = 0; i < waData.length; i += 1) {
            if(waData[i]["ZCTA5CE10"] == self.highlightedPostalCode()) {
                return waData[i]["postalCodeHits"];
            }
        }   

    });

    // Create an empty array of destination circle objects
    self.destinationCircles = ko.observableArray([]);

    // Populate that array
    var waDestinationsLength = waDestinations.length;
    for (var i = 0; i < waDestinationsLength; i++) {
    
        var name = waDestinations[i]['name'];

        
        var id = waDestinations[i]["id"];
        var name = waDestinations[i]['name'];
        var lat = parseFloat(waDestinations[i]['begin_lat']);
        var lng = parseFloat(waDestinations[i]['begin_lng']);

        latLngArray = [];
        latLngArray.push(lat);
        latLngArray.push(lng);

        geoJSONCircle = createGeoJSONCircle(latLngArray, 1);
        
        destinationObject = {
            name: name,
            geoJSONCircle: geoJSONCircle,
            id: id,
            lat: lat,
            lng: lng
        }
        
        // Push out to observable array
        self.destinationCircles.push(destinationObject);
    }

    self.postalCodeToDestinationData = ko.observableArray([]);

    self.postalCodeToDestinationDataGraph = ko.computed(function() {
        
        //console.log("here: ")
        //console.log(self.postalCodeToDestinationData())
        arrayToReturn = [];
        
        subArrayLabels = [];
        subArrayCounts = [];

        lengthOfDestinationData = self.postalCodeToDestinationData().length
        //console.log("length: ")
        //console.log(lengthOfDestinationData)



        // https://stackoverflow.com/a/7178381/5420796
        for(var i = 0; i < lengthOfDestinationData; i += 1) {
            
            //console.log(self.postalCodeToDestinationData()[i].count)
            //console.log(self.postalCodeToDestinationData()[i].destinationID.toString())
            
            subArrayCounts.push(self.postalCodeToDestinationData()[i].count);
            subArrayLabels.push(self.postalCodeToDestinationData()[i].destinationName);

            //addToDict = {x: self.postalCodeToDestinationData()[i].destinationID.toString(), y: self.postalCodeToDestinationData()[i].count}
            //console.log(addToDict);
            //arrayToReturn.push(addToDict);
        }

        arrayToReturn.push(subArrayLabels);
        arrayToReturn.push(subArrayCounts);
        //console.log("arrayToREtyrn: ")
        //console.log(arrayToReturn);
        return arrayToReturn;  

    });

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
            

            map.addSource(name,circle);
            map.addLayer({
                "id": name,
                "type": "fill",
                "source": name,
                "layout": {},
                "paint": {
                    "fill-color": "red",
                    "fill-opacity": 1.0
                }
            });

            var mapLayer = map.getLayer(name);

        }

        // This code basically renders the zip code that is being displayed
        map.on('mousemove', function (e) {
        var features = map.queryRenderedFeatures(e.point);
        //console.log(features);
        
        var hoveredPostalCode = features[0]['properties']['ZCTA5CE10'];
        
        // In the case that the red dot blocks the zip code we have to get the
        // second rendered feature down
        if (hoveredPostalCode == null){
            var hoveredPostalCode = features[1]['properties']['ZCTA5CE10'];
        }


        // Remember observables are functions
        // https://stackoverflow.com/a/14159596/5420796
        my.viewModel.highlightedPostalCode(hoveredPostalCode);
        });
    
        map.on('click', function (e) { 

            // This is where I will call a fucntion to the back end and update the viewModel:
            // With an array of objects giving me the counts for specific zip code two the different destinations

            //console.log(my.viewModel.highlightedPostalCode());
            var postalCode = my.viewModel.highlightedPostalCode();

            var postalCodeToDestination = [];
                $.ajax({
                url: 'http://0.0.0.0:8000/postalCodeToDestination/' + postalCode,
                async: false,
                dataType: 'json',
                success: function (json) {
                postalCodeToDestination = json;
                }
            });
                //console.log(postalCodeToDestination);
                my.viewModel.postalCodeToDestinationData(postalCodeToDestination);
                renderGraph();
                setCircles();
        });


    });

    function renderGraph () {
        // Really helpful blog with some example charts to get started right away:
        // http://tobiasahlin.com/blog/chartjs-charts-to-get-you-started/#1-bar-chart

        // Create an array of strings with the labesls of the zip codes
        var arrayOfLabels = my.viewModel.postalCodeToDestinationDataGraph()[0];

        // Create an array of numbers counts
        var arrayOfCounts = my.viewModel.postalCodeToDestinationDataGraph()[1];
        
        //.remove() and .append() were used on the canvas element within it's parent
        // This solved the issue listed below: 
        /*https://stackoverflow.com/a/25064035/5420796*/
        $('#myChart').remove()
        $('#graph-container').append('<canvas id="myChart"><canvas>')

        var ctx = $("#myChart")
        
        var myChart = new Chart(ctx, {

            type: 'horizontalBar',
            data: {
            labels: arrayOfLabels,
            datasets: [
                {
              label: "Total Trips from This Zip Code",
              backgroundColor: ["#80ff80", "#66ff66","#4dff4d","#33ff33","#33ff33", "#33ff33", "#33ff33", "#33ff33", "#33ff33", "#33ff33", "#33ff33"],
              data: arrayOfCounts
                }
                        ]
            },
            options: {
            legend: { display: true },
            title: {
            display: true,
            text: 'Destination Counts For Selected Zip Code'
            }
            }
        });

    };

    function setCircles () {
        
        // Have an an embedded for loop that goes the destination Circle ID
        // Looks for a match in the destination circles
        // If there is a match it increaes the size of the circle
        //console.log(my.viewModel.postalCodeToDestinationData())
        //console.log(my.viewModel.destinationCircles())


        // The following for loop makes all of the data double in size
        // Starting from the insdie out for this for loop
        for (var i = 0; i < my.viewModel.destinationCircles().length; i++) {
            nameID = my.viewModel.destinationCircles()[i]['name']
            lat = my.viewModel.destinationCircles()[i]['lat']
            lng = my.viewModel.destinationCircles()[i]['lng']
            map.getSource(nameID).setData(createGeoJSONCircle([lat, lng], 2).data);

        };
    };


});

/** Apply Bindings */
// This was copied over from my udacity project: https://github.com/axme100/mapProj/blob/master/js/app.js
// I'm creating an instance of my view model called "my" 
// The idea for this comes from the following post on the next line:
// https://stackoverflow.com/questions/46943988/how-can-i-access-an-observable-outside-the-viewmodel-in-knockoutjs?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
my = { viewModel: new ViewModel() };
ko.applyBindings(my.viewModel);