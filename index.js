import * as L from "leaflet";
import "leaflet-providers";

document.onreadystatechange = () => {
  if (document.readyState === "complete") {
    var madison = L.map('madison').setView([43.073, -89.40], 13);
    L.tileLayer.provider('Stamen.Watercolor').addTo(madison);

  }

}
