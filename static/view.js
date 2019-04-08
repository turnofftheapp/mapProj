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


// This is esentially  helper function that will be loaded
// Once data is sucsessully returned from getMapData()
function renderMap (mapData, region) {
    

    // Send map data to view model
    // So that we can derive the total count and display it
    
    // But first delete the map data
    // if there is any

    if (my.viewModel.regionData().length > 0) {
        my.viewModel.regionData.removeAll();
    }

    

    my.viewModel.regionData(mapData);

    // Add the correct layer for the map
    // This needs to be further parameterized
    addMapSource(region);
    
    // I'm esentially passing in the map data
    createChoropleth(mapData, region);

    //Get Desination Data
    //Once the data is returned sucsessfully,
    // An additional functio will be called that will render all of this data
    getDestinationData(region);
    
};

map.on('load', function() {
    // Thig logic is mostly an adaptation of the following blog
    // The big difference being that the data comes from an AJAX call that extracts the data from a local database
    // whereas in the example the data is hard coded
    //https://www.mapbox.com/mapbox-gl-js/example/data-join/
    
    
    // Render map
    // TODO: Make region a global variable in the view model
    // And don't have the default just be Seattle like it is here
    var region = "seattle"
    
    getMapData(region);

    
    // This code basically renders the zip code that is being displayed
    map.on('mousemove', function (e) {
        var features = map.queryRenderedFeatures(e.point);
        var hoveredPostalCode = features[0]['properties']['ZCTA5CE10'];
    
        // In the case that the red dot blocks the zip code we have to get the
        // second rendered feature down
        if (hoveredPostalCode == null){
            var hoveredPostalCode = features[1]['properties']['ZCTA5CE10'];
            // But in this case we also want to get the red dot so we can
            // display it to the user
            var hoveredDestination = features[0]["layer"]["id"];
            //console.log(hoveredDestination);
        }


        // Remember observables are functions
        // https://stackoverflow.com/a/14159596/5420796
        my.viewModel.highlightedPostalCode(hoveredPostalCode);
    
        my.viewModel.highlightedDestination(hoveredDestination);


        });

    
    // When clicking the map load all of the data
    map.on('click', function (e) { 

        // This is where I will call a fucntion to the back end and update the viewModel:
        // With an array of objects giving me the counts for specific zip code two the different destinations

        //console.log(my.viewModel.highlightedPostalCode());
        var postalCode = my.viewModel.highlightedPostalCode();

        var postalCodeToDestination = [];
            $.ajax({
            //url: 'http://0.0.0.0:8000/postalCodeToDestination/' + postalCode,
            url: '/postalCodeToDestination/' + postalCode,
            async: false,
            dataType: 'json',
            success: function (json) {
            postalCodeToDestination = json;
            }
        });
            //my.viewModel.postalCodeToDestinationData.removeAll();
            my.viewModel.postalCodeToDestinationData(postalCodeToDestination);
            renderGraph();
            setCircles();
    });


});


function addMapSource (region) {


        // TODO: Parameterize this function further
        if (region == "seattle") {
            url = "mapbox://axme100.0bz1txrj"
            name = "wa"
        } else if (region == "losangeles") {
            console.log("got here")
            url = "mapbox://axme100.1e3djubr"
            name = "ca"
        }


        

        //var mapLayer = map.getSource(name);
        //if(typeof mapLayer !== 'undefined') {
        //// Remove map layer & source.
        //map.removeSource(name);
        //var layerName = name + '-join';
        //map.removeLayer(layerName);
        //}


        // Add source for zip code polygons hosted on Mapbox, based on US Census Data:
        // https://www.census.gov/geo/maps-data/data/cbf/cbf_state.html
        map.addSource(name, {
            type: "vector",
            url: url
        });

}
    

function createChoropleth (mapData, region) {

    console.log("region: ")
    console.log(region)
    
    // TODO: Parameterize this function further
        if (region == "seattle") {
            id = "wa-join"
            sourceLayer = "wa"
        } else if (region == "losangeles") {
            console.log("got here too")
            id = "ca-join"
            sourceLayer = "ca"
        }

    
    //var mapLayer = map.getLayer(id);
    //    if(typeof mapLayer !== 'undefined') {
    //    // Remove map layer & source.
    //    map.removeLayer(id);
    //    }

    var expression = ["match", ["get", "ZCTA5CE10"]];

    // Calulate Max Value
    // https://stackoverflow.com/questions/4020796/finding-the-max-value-of-an-attribute-in-an-array-of-objects
    maxValue = Math.max.apply(Math, mapData.map(function(o) { return o.postalCodeHits; }))


    // Calculate color for each state based on the unemployment rate
    mapData.forEach(function(row) {
        var green = (row["postalCodeHits"] / maxValue) * 500;
        var color = "rgba(" + 0 + ", " + green + ", " + 0 + ", 1)";
        expression.push(row["ZCTA5CE10"], color);
    });

    // Last value is the default, used where there is no data
    expression.push("rgba(0,0,0,0)");

    // Add layer from the vector tile source with data-driven style
    map.addLayer({
        // be careful that second dash works
        "id": id,
        "type": "fill",
        "source": sourceLayer,
        "source-layer": sourceLayer,
        "paint": {
            "fill-color": expression
        }
    }, 'waterway-label');

    }


function addDestinationCircles (myData) {

    // First I need to delete all of the desination circles
    // In the case there are some there already
    //https://stackoverflow.com/a/21470076/5420796
    //my.viewModel.destinationCircles.removeAll();

    // This should be 24 in the case of Seattle
    var myDataLength = myData.length;


    for (var i = 0; i < myDataLength; i++) {
    
        var name = myData[i]['name'];

        
        var id = myData[i]["id"];
        var name = myData[i]['name'];
        var lat = parseFloat(myData[i]['begin_lat']);
        var lng = parseFloat(myData[i]['begin_lng']);

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
        
        // Push the object to the observable array in the view model
        // After all we are going to have to change the size of these guys
        my.viewModel.destinationCircles.push(destinationObject);
    }

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
}


function renderGraph () {
    // Really helpful blog with some example charts to get started right away:
    // http://tobiasahlin.com/blog/chartjs-charts-to-get-you-started/#1-bar-chart

    // Create an array of strings with the labesls of the zip codes
    var arrayOfLabels = my.viewModel.postalCodeToDestinationDataGraph()[0];

    // Create an array of numbers counts
    var arrayOfCounts = my.viewModel.postalCodeToDestinationDataGraph()[1];
    
    
    // Get a random list of colors
    // Function copied from StackOverFlow Post Below
    // https://stackoverflow.com/questions/1484506/random-color-generator

    function getRandomColor() {
        var letters = '0123456789ABCDEF';
            
        var color = '#';
            
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    
    arrayOfColors = [];


    // Loop over the postalCodeToDestinationData() and get a random color for each element
    // populating the arrayOfColors database
    for (var i = 0; i < my.viewModel.postalCodeToDestinationData().length; i++) {
        randomColor = getRandomColor();
        arrayOfColors.push(randomColor);
    }

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
          backgroundColor: arrayOfColors,
          data: arrayOfCounts
            }
                    ]
        },
        
        options: {
        legend: { display: true },
        title: {
        display: true,
        text: 'Destination Counts For Selected Zip Code'
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
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

    // First loop over the all the destinations and set the
    // Size to 1 so that when this function is called multiple times
    // It resets the size of the circles 

    for (var i = 0; i < my.viewModel.destinationCircles().length; i++) {
        nameID = my.viewModel.destinationCircles()[i]['name']
        console.log(nameID)
        lat = my.viewModel.destinationCircles()[i]['lat']
        console.log(lat);
        lng = my.viewModel.destinationCircles()[i]['lng']
        console.log(lng)
        map.getSource(nameID).setData(createGeoJSONCircle([lat, lng], 0).data);

    };

    // First loop over the postalCode data loop
    for (var i = 0; i < my.viewModel.postalCodeToDestinationData().length; i++) {
        
        // Get the destinationID that we want to size
        destinationToSize = my.viewModel.postalCodeToDestinationData()[i]['destinationID'];
        
        sizeFactor = Math.log(my.viewModel.postalCodeToDestinationData()[i]['count']) + 1;
        
        // Get that item from the destinationCircles objects
        // Thought now that I think about it, I could just have this information be part of the
        // postalCodeToDestinationData
        let destinationCircleObjectToSize = my.viewModel.destinationCircles().find(i => i.id === destinationToSize);

        if (destinationCircleObjectToSize != null){
            nameID = destinationCircleObjectToSize['name']
            lat = destinationCircleObjectToSize['lat']
            lng = destinationCircleObjectToSize['lng']
            map.getSource(nameID).setData(createGeoJSONCircle([lat, lng], sizeFactor).data);

        };
    };
};

function changeRegion (region) {


    if (my.viewModel.currentRegion() == "Seattle") {

        // First test this to see if it works    
        map.removeLayer('wa-join');
        map.removeSource('wa');

    }

    if (my.viewModel.currentRegion() == "Los Angeles") {

        // First test this to see if it works    
        map.removeLayer('ca-join');
        map.removeSource('ca');

    }

    // First remove all the data in the view so that we can start over, here. 
    my.viewModel.postalCodeToDestinationData.removeAll();
    my.viewModel.destinationCircles.removeAll();

    if (region == "losangeles") {
        
        // Set view model to Los Angeles
        my.viewModel.currentRegion("Los Angeles");

        // Fly to Los Angeles
        // TODO: Instead of hardcoding in these coordinates
        // calculate the bounds dynamically.
        map.flyTo({
            center: [-118.2437, 34.0522],
            zoom: [8]
        });
    } else if (region == "seattle") {
       my.viewModel.currentRegion("Seattle"); 
        map.flyTo({
            center: [-122.33, 47.60],
            zoom: [8]
        });
    }

    getMapData(region);
}

/** Apply Bindings */
// This was copied over from my udacity project: https://github.com/axme100/mapProj/blob/master/js/app.js
// I'm creating an instance of my view model called "my" 
// The idea for this comes from the following post on the next line:
// https://stackoverflow.com/questions/46943988/how-can-i-access-an-observable-outside-the-viewmodel-in-knockoutjs?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
my = { viewModel: new ViewModel() };
ko.applyBindings(my.viewModel);