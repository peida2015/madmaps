import * as L from "leaflet";
import "leaflet-providers";


function getReq(url, successHandler) {
  var req = new XMLHttpRequest();
  req.open("GET", url);

  req.onreadystatechange = function () {
    if (req.readyState === 4 && req.status === 200) {
      successHandler(req.responseText);
    };
  };
  req.send();
}

document.onreadystatechange = function() {
  if (document.readyState === "complete") {
    var selectMap = function (mapName) {
      console.log(mapName);
      switch(mapName) {
        case "Overview": overview();
        break;
        case "Bikers": bikers();
        break;
        case "Transit Commuters":

      }
    };

    document.getElementsByTagName('select').item(0).onchange = function (e) {
      selectMap(e.currentTarget.value);
    };

    // Setup leaflet map with Madison as center and select tile provider.
    var madison = L.map('madison').setView([43.073, -89.40], 13);
    L.tileLayer.provider('Stamen.Watercolor').addTo(madison);

    var overview = function () {
      var neighborhoodsUrl = "https://opendata.arcgis.com/datasets/66e4a6a80ae64865a81bc8d4464a6417_12.geojson";

      function drawOverviewMap(respText) {
        var neighborhoods = JSON.parse(respText);

        if (currentMap.name !== "Overview" && currentMap.layer !== null) {
          currentMap.layer.remove();
        }

        var neighborhoodsLayer = L.geoJSON(neighborhoods, {
          style: {
            color: "green",
            weight: 2,
            fillColor: "gray"
          },
          onEachFeature: function (feature, layer) {
            layer.bindTooltip(feature.properties.NEIGHB_NAME.replace(/ (Neighborhood|Community|Homeowners|Condominium|Village|Property Owners) Association$/, ""),
            {
              className: "tip",
              opacity: 0.8,
              direction: "center"
            });
          }
        })

        neighborhoodsLayer.addTo(madison);

        currentMap.name = "Overview";
        currentMap.layer = neighborhoodsLayer;
      }

      getReq(neighborhoodsUrl, drawOverviewMap);

    };

    var bikers =  function () {
      var bikePathsUrl = "https://opendata.arcgis.com/datasets/eea6d3fb4ca64f8199d9e1482ff45ae2_11.geojson";

      if (currentMap.name !== "Bikers" && currentMap.layer !== null) {
        currentMap.layer.remove();
      };

      function drawBikePaths(respText) {
        var bikePaths = JSON.parse(respText);
        var bikePathsLayer = L.geoJSON(bikePaths, {
          style: function (feature, layer){
            // Show bike paths' widths, with default of 8 for null values
            return {
              color: "blue",
              weight: (feature.properties.BikePaWdth||8)/2,
              fillColor: "gray"
            };
          },
          onEachFeature: function (feature, layer) {
            layer.bindTooltip(String(feature.properties.BikePaWdth)).addTo(madison);
          }
        });

        bikePathsLayer.addTo(madison);

        currentMap.name = "Bikers";
        currentMap.layer = bikePathsLayer;
      }

      getReq(bikePathsUrl, drawBikePaths);

      // draw bike share stations
      var bikeStationsUrl = "https://opendata.arcgis.com/datasets/ce3fbee2fc894d3bbd2009be8247229a_9.geojson";

      function drawBikeStations (respText) {
        var bikeStations = JSON.parse(respText);

        // Configure icon to represent a bike station
        var icon = L.icon({
          iconUrl: "http://www.universitybikeprograms.org/wp-content/uploads/2015/05/i405_TDM_icon_bike99992.gif",
          iconSize: [30, 30]
        });

        var bikeStationsMarkers = bikeStations.features.map(function (station) {
            var coor = station.geometry.coordinates;
            return L.marker([coor[1], coor[0]], { icon: icon });
        })

        var layerGroup = L.layerGroup(bikeStationsMarkers)
        layerGroup.addTo(madison);
      }

      getReq(bikeStationsUrl, drawBikeStations);

    };

    // Use currentMap to keep track of map layer displayed
    var currentMap = {
      layer: null,
      name: null
    };

    // Initialize map based on the default value of the map selection drop down menu
    selectMap(document.getElementsByTagName('select').item(0).value);
  }


}
