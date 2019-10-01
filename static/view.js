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
// TODO: Decide if the type parameter actually needs to come into this point
function renderMap (mapData) {
    
    // Send map data to view model
    // So that we can derive the total count and display it
    
    // But first delete the map data
    // if there is any

    if (my.viewModel.regionData().length > 0) {
        my.viewModel.regionData.removeAll();
    }


    // Add the correct layer for the map
    // This needs to be further parameterized
    addMapSource();
    
    // I'm esentially passing in the map data
    createChoropleth(mapData);

    //Get Desination Data
    //Once the data is returned sucsessfully,
    // An additional functio will be called that will render all of this data
    getDestinationData();
    
}

map.on('load', function() {
    // Thig logic is mostly an adaptation of the following blog
    // The big difference being that the data comes from an AJAX call that extracts the data from a local database
    // whereas in the example the data is hard coded
    //https://www.mapbox.com/mapbox-gl-js/example/data-join/
    
    
    // Render map
    // TODO: Make region a global variable in the view model
    // And don't have the default just be Seattle like it is here
    
    getMapData(my.viewModel.currentRegion(), my.viewModel.mapType());
    enableMapClick();


});


function addMapSource () {

    // TODO: Parameterize this function further
    // TODO: I will need to keep parameterizing this function as well
    if (my.viewModel.currentRegion() == "washington") {
        if (my.viewModel.mapType() == "postal") {
            url = "mapbox://axme100.0bz1txrj";
            // Set the current source layer
            my.viewModel.currentSourceLayer("wa");
        } else if (my.viewModel.mapType() == "barrio") {
            url = "mapbox://axme100.1u3r9yki";
            my.viewModel.currentSourceLayer("wazillow");
        }
    } else if (my.viewModel.currentRegion() == "california") {
        if (my.viewModel.mapType()=="postal") {
            url = "mapbox://axme100.1e3djubr";
            my.viewModel.currentSourceLayer("ca");
        } else if (my.viewModel.mapType()=="barrio") {
            url = "mapbox://axme100.8u48g7xl";
            my.viewModel.currentSourceLayer("cazillow");
        }
    } else if (my.viewModel.currentRegion() == "newyork") {
        if (my.viewModel.mapType()=="postal") {
            url = "mapbox://axme100.8oa45yw8";
            my.viewModel.currentSourceLayer("ny");
        } else if (my.viewModel.mapType()=="barrio") {
            url = "mapbox://axme100.1bcb4m9d";
            my.viewModel.currentSourceLayer("nyzillow");
        }
    } else if (my.viewModel.currentRegion() == "canada") {
        if (my.viewModel.mapType()=="postal") {
            url = "mapbox://axme100.5owh56ok";
            my.viewModel.currentSourceLayer("canada-dydv58");
        } else if (my.viewModel.mapType()=="barrio") {
            url = "mapbox://axme100.7hpuslix";
            my.viewModel.currentSourceLayer("vancouver_area");
        }
    }

    // Add source for zip code polygons hosted on Mapbox, based on US Census Data:
    // https://www.census.gov/geo/maps-data/data/cbf/cbf_state.html
    map.addSource(my.viewModel.currentSourceLayer(), {
        type: "vector",
        url: url
    });
    

}
    
function createChoropleth (mapData) {
    
    if (my.viewModel.currentRegion() == "canada") {
        if (my.viewModel.mapType() == "postal") {
            var expression = ["match", ["get", "CFSAUID"]];
        } else if (my.viewModel.mapType() == "barrio") {
            var expression = ["match", ["get", "MAPID"]];
        }

    // In the case of a US map these are the fields all of the polygon names
    // Are the same
    } else {

        if (my.viewModel.mapType() == "postal") {
            var expression = ["match", ["get", "ZCTA5CE10"]];
        } else if (my.viewModel.mapType() == "barrio") {
            var expression = ["match", ["get", "RegionID"]];
        }
    }

    // Calulate Max Value
    // https://stackoverflow.com/questions/4020796/finding-the-max-value-of-an-attribute-in-an-array-of-objects
    maxValue = Math.max.apply(Math, mapData.map(function(o) { return o.mapAreaHits; }));
    console.log(maxValue);

    // Calculate color for each state based on the number of hits in that area
    mapData.forEach(function(row) {
        var green = (row.mapAreaHits / maxValue) * 500;
        var color = "rgba(" + 0 + ", " + green + ", " + 0 + ", 1)";
        expression.push(row.mapAreaName, color);
    });

    // Last value is the default, used where there is no data
    expression.push("rgba(0,0,0,0)");


    // Add layer from the vector tile source with data-driven style
    map.addLayer({
        // be careful that second dash works
        "id": my.viewModel.currentSourceLayer() + '-join',
        "type": "fill",
        "source": my.viewModel.currentSourceLayer(),
        "source-layer": my.viewModel.currentSourceLayer(),
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
    
    console.log("made it here")

    var myDataLength = myData.length;


    for (var i = 0; i < myDataLength; i++) {
    
        var name = myData[i].name;
        var id = myData[i].id;
        var lat = parseFloat(myData[i].begin_lat);
        var lng = parseFloat(myData[i].begin_lng);

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
        };
        
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
    $('#myChart').remove();
    $('#graph-container').append('<canvas id="myChart"><canvas>');

    var ctx = $("#myChart");
    
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

}

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
        nameID = my.viewModel.destinationCircles()[i].name;
        lat = my.viewModel.destinationCircles()[i].lat;
        lng = my.viewModel.destinationCircles()[i].lng;
        map.getSource(nameID).setData(createGeoJSONCircle([lat, lng], 0).data);

    }

    // First loop over the postalCode data loop
    for (var i = 0; i < my.viewModel.postalCodeToDestinationData().length; i++) {
        
        // Get the destinationID that we want to size
        destinationToSize = my.viewModel.postalCodeToDestinationData()[i].destinationID;
        
        sizeFactor = Math.log(my.viewModel.postalCodeToDestinationData()[i].count) + 1;
        
        // Get that item from the destinationCircles objects
        // Thought now that I think about it, I could just have this information be part of the
        // postalCodeToDestinationData
        let destinationCircleObjectToSize = my.viewModel.destinationCircles().find(i => i.id === destinationToSize);

        if (destinationCircleObjectToSize != null){
            nameID = destinationCircleObjectToSize.name;
            lat = destinationCircleObjectToSize.lat;
            lng = destinationCircleObjectToSize.lng;
            map.getSource(nameID).setData(createGeoJSONCircle([lat, lng], sizeFactor).data);

        }
    }
}

function changeRegion (region, type, toggle=false) {
    
    // If not toggling that means you are changing regions,
    // If we are changing regions, need to delete data Here
    // This is also going to deelte the map data
    if (!toggle) {
     deleteMapData();   
    }

    // Set the current region in the view model
    my.viewModel.currentRegion(region);
    

    // Pull information from the global object region data
    // You can find this object hard coded at end of model.js
    var regionInfo = regionData.find(obj => {
        return obj.name === region
    })


    // Set display
    my.viewModel.currentRegionDisplay(regionInfo.displayName);

    // Fly to new location
    map.flyTo({
        center: regionInfo.coordinates,
        zoom: [8]
    });
    
    // Call the get Map data function in model
    getMapData();
}

function toggleMapType () {

    deleteMapData()

    if (my.viewModel.mapType() == "barrio") {
        my.viewModel.mapType("postal"); 
    } else if (my.viewModel.mapType() == "postal") {
        my.viewModel.mapType("barrio")
    }
    
    changeRegion(my.viewModel.currentRegion(), my.viewModel.mapType(), toggle=true)
}

function filterByUserID (userID) {
    
    if (my.viewModel.userID() == 'none') {
        my.viewModel.userID(userID);
    } else {
        my.viewModel.userID('none')
    }

        changeRegion(my.viewModel.currentRegion(), my.viewModel.mapType(), toggle=false, filterUser=true)
}


function deleteMapData () {

    // Just acsess the global varibles to change the layers
    // But first create the variable otherLayer which just appends
    // "-join to the base layer", "other"
    
    sourceLayer = my.viewModel.currentSourceLayer();
    choroplethLayer = sourceLayer + "-join"
   

    // Actually remove the layeres
    map.removeLayer(choroplethLayer);
    map.removeSource(my.viewModel.currentSourceLayer());


    // Next delete all the destination circles and they will just
    // Be re-populated.
    for (var i = 0; i < my.viewModel.destinationCircles().length; i++) {

        // First get the name of the desintation circle
        nameID = my.viewModel.destinationCircles()[i].name;
        
        // Remove theme
        map.removeLayer(nameID);
        map.removeSource(nameID);

    }


    // Remove all the of these objects from the view model
    my.viewModel.destinationCircles.removeAll();


    my.viewModel.postalCodeToDestinationData.removeAll();

}

function enableMapClick () {

// This code basically renders the zip code that is being displayed
    map.on('mousemove', function (e) {
        
        // First get the actual features taht are being rendered
        var features = map.queryRenderedFeatures(e.point);

        //console.log(features);
        
        hoveredData = getHoveredMapArea(features)
        console.log("******HERE");
        console.log(hoveredData);

        if (hoveredData instanceof Array) {
            mapAreaToDisplay = hoveredData[0];
            barrioID = hoveredData[1];
            my.viewModel.highlightedMapArea(mapAreaToDisplay);
            my.viewModel.selectedMapArea(barrioID);
        // If it's a a postal code then we are displaying and sending
        // data to the same thing
        } else {
            my.viewModel.highlightedMapArea(hoveredData);
            my.viewModel.selectedMapArea(hoveredData);
        }

        // Get hovered destination
        my.viewModel.highlightedDestination(getHoveredDestination(features));


        });

    // When clicking the map load all of the data
    map.on('click', function (e) { 

        // This is where I will call a fucntion to the back end and update the viewModel:
        // With an array of objects giving me the counts for specific zip code two the different destination
        
        // Freeze the postal code that is highlighted
        var mapArea = my.viewModel.selectedMapArea();
        
        // Call a function to get the data
        getDestinationFromAreaData(mapArea);

    });

}

function getHoveredMapArea (features) {

    // First get the object where the value of the source property
    // is either washington or one of the other map names
        var result = features.filter(obj => {
            return obj.source === my.viewModel.currentSourceLayer()
        })

        if (typeof result[0] !== 'undefined') {

            if (my.viewModel.currentRegion()=="canada") {

                if (my.viewModel.mapType() == "postal") {

                    hoveredTargetArea = result[0].properties.CFSAUID;

                } else if (my.viewModel.mapType() == "barrio") {

                    hoveredArea = result[0].properties.NAME;
                    hoveredRegionID = result[0].properties.MAPID;

                    hoveredTargetArea = [hoveredArea, hoveredRegionID]

                }

            } else {
            
                if (my.viewModel.mapType() == "postal") {

                    hoveredTargetArea = result[0].properties.ZCTA5CE10;

                } else if (my.viewModel.mapType() == "barrio") {

                    hoveredArea = result[0].properties.Name;
                    hoveredRegionID = result[0].properties.RegionID;

                    hoveredTargetArea = [hoveredArea, hoveredRegionID]

                }
            }
        }

        // Set the value of hoveredPostal Code
        return hoveredTargetArea; 
}

function getHoveredDestination (features) {

        // Here is where I need to get the hovered destination
        // As of now the fill-color seems to be the unique identifier that
        // I have, so I will obviously have to change this if the fill color changes
        console.log("features:");
        console.log(features);

        var result = features.filter(obj => {
            return obj.layer.paint["fill-color"] == "red";
        })

        if (typeof result[0] !== 'undefined') {
            console.log(result);
            var hoveredDestination = result[0].source;
            return hoveredDestination;
        }

        

}
/** Apply Bindings */
// This was copied over from my udacity project: https://github.com/axme100/mapProj/blob/master/js/app.js
// I'm creating an instance of my view model called "my" 
// The idea for this comes from the following post on the next line:
// https://stackoverflow.com/questions/46943988/how-can-i-access-an-observable-outside-the-viewmodel-in-knockoutjs?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
my = { viewModel: new ViewModel() };
ko.applyBindings(my.viewModel);