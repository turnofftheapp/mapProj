/** View Model **/
var ViewModel = function() {
    var self = this;

    self.highlightedPostalCode = ko.observable("");

    self.highlightedDestination = ko.observable("");
    
    // This logic is used to show the highlighted postal code and highlighted destination
    // This logic just shows both of these items making sure "undefined insn't displayed"
    // TODO: This seems a little complicated see if I really need it
    self.displayedInfo = ko.computed(function() {
    
        destinationDisplayed = self.highlightedDestination();
        postalCodeDisplayed = self.highlightedPostalCode();
        

        if (typeof destinationDisplayed !== 'undefined') {
            return postalCodeDisplayed + ' ' + destinationDisplayed;
        } else {
            return postalCodeDisplayed;
        }

    });


    // This array contains the data used to make the choropleth
    // It's necessary to have this here so on the next line, I can calculate the total trips taken per region
    self.regionData = ko.observable("");


    self.highlightedPostalCodeHits = ko.computed(function() {
    
        // https://stackoverflow.com/a/7178381/5420796
        for(var i = 0; i < self.regionData().length; i += 1) {
            if(self.regionData()[i]["ZCTA5CE10"] == self.highlightedPostalCode()) {
                return self.regionData()[i]["postalCodeHits"];
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