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
        case "Transit Commuters": commuters()
        break;

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
          currentMap.layer.forEach((layer) => layer.remove());
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
        currentMap.layer = [neighborhoodsLayer];
      }

      getReq(neighborhoodsUrl, drawOverviewMap);

    };

    var bikers =  function () {
      // Remove current map's layer
      if (currentMap.name !== "Bikers" && currentMap.layer !== null) {
        currentMap.layer.forEach(layer => layer.remove());
      };

      // URLs for data
      var bikePathsUrl = "https://opendata.arcgis.com/datasets/eea6d3fb4ca64f8199d9e1482ff45ae2_11.geojson";

      var stationInfoUrl = "https://gbfs.bcycle.com/bcycle_madison/station_information.json";

      var stationStatusUrl = "https://gbfs.bcycle.com/bcycle_madison/station_status.json";

      // Promises to asynchronously retrieve data
      var getStationInfo = new Promise(function(resolve) {
        getReq(stationInfoUrl, function (respText) {
          resolve(JSON.parse(respText));
        })
      });

      var getStationStatus = new Promise(function(resolve) {
        getReq(stationStatusUrl, function (respText) {
          resolve(JSON.parse(respText));
        })
      });

      var getBikePaths = new Promise(function(resolve) {
        getReq(bikePathsUrl, function(respText){
          resolve(JSON.parse(respText))
        });
      });

      Promise.all([getStationInfo, getStationStatus, getBikePaths]) .then(function(stationAndPathData){

        // Draw bike share stations
        var info = stationAndPathData[0].data.stations;
        var status = stationAndPathData[1].data.stations;

        // Configure icon to represent a bike station
        var icon = L.icon({
          iconUrl: "http://www.universitybikeprograms.org/wp-content/uploads/2015/05/i405_TDM_icon_bike99992.gif",
          iconSize: [30, 30]
        });

        var bikeStationsMarkers = info.map(function (station, idx) {
            return L.marker([station.lat, station.lon], { icon: icon })
                .bindTooltip("<div><strong style='color: green'>" + "BCycle" + "</strong></div><div>" + station.address + "</div>" + "<br><div style='margin-right: 10px'>Bikes for rent: <b>" + status[idx].num_bikes_available + "</b></div><div>Free Docks: <b>" + status[idx].num_docks_available + "</b></div>" );
        })

        var stationsMarkersLayer = L.layerGroup(bikeStationsMarkers);
        stationsMarkersLayer.addTo(madison);

        // Draw bike paths
        var bikePaths = stationAndPathData[2];

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

        // reflect changes in currentMap
        currentMap.name = "Bikers";
        currentMap.layer = [bikePathsLayer, stationsMarkersLayer];
      })


    };

    var commuters = function () {
      // Remove current map's layer
      if (currentMap.name !== "Transit Commuters" && currentMap.layer !== null) {
        currentMap.layer.forEach(layer => layer.remove());
      };
      
      // URLs for data
      var busStopsUrl = "https://opendata.arcgis.com/datasets/58d6ef381b594afbb06862dc51480aa1_3.geojson";

      // Promises to retrieve data

      var getBusStops = new Promise(function (resolve) {
        getReq(busStopsUrl, respText => {
          resolve(JSON.parse(respText));
        })
      });

      Promise.all([getBusStops]).then(busData => {

        var stops = busData[0].features;

        var busStopIcon = L.icon({
          iconUrl: "https://image.flaticon.com/icons/svg/0/622.svg",
          iconSize: [30, 30]
        });

        var stopsMarkers = stops.map(function (stop) {
          const coords = stop.geometry.coordinates;
          return L.marker([coords[1], coords[0]],
                          { icon: busStopIcon });
        });
        // debugger
        var stopsLayer = L.layerGroup(stopsMarkers);

        stopsLayer.addTo(madison);

        currentMap.name = "Transit Commuters";
        currentMap.layer = [stopsLayer];
      })
    }


    // Use currentMap to keep track of map layer displayed
    var currentMap = {
      layer: null,
      name: null
    };

    // Initialize map based on the default value of the map selection drop down menu
    selectMap(document.getElementsByTagName('select').item(0).value);
  }


}
