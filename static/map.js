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
    if (postalCode !== null && postalCode.startsWith("9")) {
    // Get the hits for that postal code
    // Example to follow from map
    // Construct a variable like this but for traits in mapbox
    //{"STATE_ID": "01", "unemployment": 13.17}
    postalCodeHits = mydata[i][1]
    var entry = {"ZCTA5CE10": postalCode, "postalCodeHits": postalCodeHits};
    waData.push(entry);
    }
}


/** View Model **/
var ViewModel = function() {
    var self = this;

    this.highlightedPostalCode = ko.observable("Observable array");

};



// What am I going to put here?



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
        map.addSource("wa-bj10t4", {
            type: "vector",
            url: "mapbox://axme100.1u657h51"
        });

        var expression = ["match", ["get", "ZCTA5CE10"]];

        // Calulate Max Value
        // https://stackoverflow.com/questions/4020796/finding-the-max-value-of-an-attribute-in-an-array-of-objects
        maxValue = Math.max.apply(Math, waData.map(function(o) { return o.postalCodeHits; }))
        
        //console.log("Max value")
        //console.log(maxValue)

        // Calculate color for each state based on the unemployment rate
        waData.forEach(function(row) {
            var green = (row["postalCodeHits"] / maxValue) * 300;
            var color = "rgba(" + 0 + ", " + green + ", " + 0 + ", 1)";
            expression.push(row["ZCTA5CE10"], color);
        });

        // Last value is the default, used where there is no data
        expression.push("rgba(0,0,0,0)");
        console.log("expression: ")
        console.log(expression);

        // Add layer from the vector tile source with data-driven style
        map.addLayer({
            // be careful that second dash works
            "id": "wa-bj10t4-join",
            "type": "fill",
            "source": "wa-bj10t4",
            "source-layer": "wa-bj10t4",
            "paint": {
                "fill-color": expression
            }
        }, 'waterway-label');

        // Add legend from tutorial
        // As of this point this part was just copied over
        // https://www.mapbox.com/help/choropleth-studio-gl-pt-2/#mission-complete
        var layers = ['0-10', '10-20', '20-50', '50-100', '100-200', '200-500', '500-1000', '1000+'];
        var colors = ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];

        for (i = 0; i < layers.length; i++) {
            var layer = layers[i];
            var color = colors[i];
            var item = document.createElement('div');
            var key = document.createElement('span');
            key.className = 'legend-key';
            key.style.backgroundColor = color;

            var value = document.createElement('span');
            value.innerHTML = layer;
            item.appendChild(key);
            item.appendChild(value);
            legend.appendChild(item);
        }

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