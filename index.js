import * as L from "leaflet";
import "leaflet-providers";

// console.log("new index.js");

document.onreadystatechange = function() {
  if (document.readyState === "complete") {
    var madison = L.map('madison').setView([43.073, -89.40], 13);
    L.tileLayer.provider('Stamen.Watercolor').addTo(madison);

    var req = new XMLHttpRequest();
    req.open("GET", "https://opendata.arcgis.com/datasets/66e4a6a80ae64865a81bc8d4464a6417_12.geojson");
    req.onreadystatechange = function () {
      if (req.readyState === 4 && req.status === 200) {
        var neighborhoods = JSON.parse(req.responseText);
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
    };

    req.send();
  }


}
// "\ (Neighborhood|Community)Association$"
