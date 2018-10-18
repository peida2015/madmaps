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
    document.getElementsByTagName('select').item(0).onchange = function (e) {
      console.log(e.currentTarget.value);
      switch(e.currentTarget.value) {
        case "Overview":
        case "Bikers":
        case "Transit Commuters":

      }
    }

    // Setup leaflet map with Madison as center and select tile provider.
    var madison = L.map('madison').setView([43.073, -89.40], 13);
    L.tileLayer.provider('Stamen.Watercolor').addTo(madison);

    var overview = function () {
      var neighborhoodsUrl = "https://opendata.arcgis.com/datasets/66e4a6a80ae64865a81bc8d4464a6417_12.geojson";

      function drawOverviewMap(respText) {
        var neighborhoods = JSON.parse(respText);

        L.geoJSON(neighborhoods, {
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
        }).addTo(madison);
      }

      getReq(neighborhoodsUrl, drawOverviewMap);

    };

    var bikers =  function () {
      var bikePathsUrl = "https://opendata.arcgis.com/datasets/eea6d3fb4ca64f8199d9e1482ff45ae2_11.geojson";

      function drawBikePaths(respText) {
        var bikePaths = JSON.parse(respText);
        L.geoJSON(bikePaths, {
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
        }).addTo(madison);
      }

      getReq(bikePathsUrl, drawBikePaths);
    };

    // Default map
    bikers();
  }


}
