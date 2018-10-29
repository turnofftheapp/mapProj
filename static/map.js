// It looks like it is totally fine to have this token published on a git repository
// Mapbox public tokens start with pk and can only be used to retrieve data
// See Mapbox documentation here: https://www.mapbox.com/help/define-access-token/
mapboxgl.accessToken = 'pk.eyJ1IjoiYXhtZTEwMCIsImEiOiJjam0ybHJpYWgycnU1M3BsaXBmbnJicmxuIn0.rec0Fay3v7aDTAuptsaqEA';

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
	var mydata = [];
	$.ajax({
  		url: 'http://0.0.0.0:8000/count/',
  		async: false,
  		dataType: 'json',
  		success: function (json) {
    		mydata = json;
  		}
	});

	// Confirm that we got all of the data
	//console.log(mydata)

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
});

  


});