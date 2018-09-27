mapboxgl.accessToken = 'pk.eyJ1IjoiYXhtZTEwMCIsImEiOiJjam0ybHJpYWgycnU1M3BsaXBmbnJicmxuIn0.rec0Fay3v7aDTAuptsaqEA';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/axme100/cjmffc3x90kg62sru3qxh7g7b'
});

$(document).ready(function () {
  $.getJSON({url: "http://0.0.0.0:8000/count/", success: function(result){
            for (var i = 0; i < result.length; i++) {
            	console.log(result[i]);
            };
        }});
});