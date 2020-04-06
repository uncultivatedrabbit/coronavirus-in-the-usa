const STORE = {
  geojson: "",
  map: "",
  info: "",
  totalInfo: "",
  states: [
    ["Alabama", "AL"],
    ["Alaska", "AK"],
    ["Arizona", "AZ"],
    ["Arkansas", "AR"],
    ["California", "CA"],
    ["Colorado", "CO"],
    ["Connecticut", "CT"],
    ["Delaware", "DE"],
    ["District of Columbia", "DC"],
    ["Florida", "FL"],
    ["Georgia", "GA"],
    ["Hawaii", "HI"],
    ["Idaho", "ID"],
    ["Illinois", "IL"],
    ["Indiana", "IN"],
    ["Iowa", "IA"],
    ["Kansas", "KS"],
    ["Kentucky", "KY"],
    ["Louisiana", "LA"],
    ["Maine", "ME"],
    ["Maryland", "MD"],
    ["Massachusetts", "MA"],
    ["Michigan", "MI"],
    ["Minnesota", "MN"],
    ["Mississippi", "MS"],
    ["Missouri", "MO"],
    ["Montana", "MT"],
    ["Nebraska", "NE"],
    ["Nevada", "NV"],
    ["New Hampshire", "NH"],
    ["New Jersey", "NJ"],
    ["New Mexico", "NM"],
    ["New York", "NY"],
    ["North Carolina", "NC"],
    ["North Dakota", "ND"],
    ["Ohio", "OH"],
    ["Oklahoma", "OK"],
    ["Oregon", "OR"],
    ["Pennsylvania", "PA"],
    ["Rhode Island", "RI"],
    ["South Carolina", "SC"],
    ["South Dakota", "SD"],
    ["Tennessee", "TN"],
    ["Texas", "TX"],
    ["Utah", "UT"],
    ["Vermont", "VT"],
    ["Virginia", "VA"],
    ["Washington", "WA"],
    ["West Virginia", "WV"],
    ["Wisconsin", "WI"],
    ["Wyoming", "WY"],
    ["Puerto Rico", "PR"],
  ],
};

function createMap(covidData) {
  const corner1 = L.latLng(6.8217305109, -179.1295026197);
  const corner2 = L.latLng(74.2072030765, -49.9302838697);
  const bounds = L.latLngBounds(corner1, corner2);
  const ACCESS_TOKEN =
    "pk.eyJ1IjoidW5jdWx0aXZhdGVkcmFiYml0IiwiYSI6ImNrNWs1YXJ0YjBha2IzanF4YmhmcHR2ZTUifQ.3YhMGRpoosV0u46J39b3lQ";
  STORE.map = L.map("map").setView([37.8, -96], 4).setMaxBounds(bounds);
  L.tileLayer(
    `https://api.mapbox.com/styles/v1/uncultivatedrabbit/ck87dyeh90cp71in0vmxym7ox/tiles/256/{z}/{x}/{y}@2x?access_token=${ACCESS_TOKEN}`,
    {
      id: "mapbox/light-v9",
      attribution: null,
      tileSize: 512,
      zoomOffset: -1,
      maxZoom: 8,
      minZoom: 4,
    }
  ).addTo(STORE.map);

  statesData.features.map((stateData, i) => {
    const state = stateData.properties;
    if (state.name === STORE.states[i][0]) {
      state.appreviation = STORE.states[i][1];
    }
  });
  covidData.map((d) => {
    const appreviation = d.state;
    statesData.features.map((state) => {
      if (state.properties.appreviation === appreviation) {
        state.properties.positive = d.positive;
        state.properties.deaths = d.death;
        state.properties.hospitalized = d.hospitalized;
        state.properties.lastChecked = d.lastUpdateEt;
      }
    });
  });
  STORE.geojson = L.geoJson(statesData, {
    style: style,
    onEachFeature: onEachFeature,
  }).addTo(STORE.map);
  STORE.map.attributionControl.addAttribution(
    'Covid-19 data &copy; <a target="_blank" href="https://covidtracking.com">The COVID Tracking Project</a>'
  );
  createInfoControls();
  createLegend();
  getTotalCumulativeData();
}

function createTotalsInfoDisplay(totalData) {
  if (
    String(totalData[0].positive).length > 3 &&
    !String(totalData[0].positive).includes(",")
  ) {
    const largerThanThousand = String(totalData[0].positive).split("");
    largerThanThousand.splice(-3, 0, ",");
    totalData[0].positive = largerThanThousand.join("");
  }
  if (
    String(totalData[0].negative).length > 3 &&
    !String(totalData[0].negative).includes(",")
  ) {
    const largerThanThousand = String(totalData[0].negative).split("");
    largerThanThousand.splice(-3, 0, ",");
    largerThanThousand.splice(-7, 0, ",");
    totalData[0].negative = largerThanThousand.join("");
  }
  if (
    String(totalData[0].death).length > 3 &&
    !String(totalData[0].death).includes(",")
  ) {
    const largerThanThousand = String(totalData[0].death).split("");
    largerThanThousand.splice(-3, 0, ",");
    totalData[0].death = largerThanThousand.join("");
  }
  STORE.totalInfo = L.control({ position: "bottomleft" });
  STORE.totalInfo.onAdd = function (map) {
    this._div = L.DomUtil.create("div", "total-info info"); // create a div with a class "info"
    this.update();
    return this._div;
  };
  STORE.totalInfo.update = function (props) {
    this._div.innerHTML = `
      <h4>COUNTRY-WIDE TOTALS</h4>
      <span class="info-title">TOTAL TESTED POSITIVE:</span> ${totalData[0].positive}<br>
      <span class="info-title">TOTAL TESTED NEGATIVE:</span> ${totalData[0].negative}<br>
      <span class="info-title">TOTAL DEATHS:</span> ${totalData[0].death} <br>
      `;
  };

  STORE.totalInfo.addTo(STORE.map);
}

function createInfoControls() {
  STORE.info = L.control();
  STORE.info.onAdd = function (map) {
    this._div = L.DomUtil.create("div", "info"); // create a div with a class "info"
    this.update();
    return this._div;
  };

  STORE.info.update = function (props) {
    if (props) {
      if (props.deaths === null) {
        props.deaths = 0;
      }
      if (
        String(props.positive).length > 3 &&
        !String(props.positive).includes(",")
      ) {
        const largerThanThousand = String(props.positive).split("");
        largerThanThousand.splice(-3, 0, ",");
        props.positive = largerThanThousand.join("");
      }
    }
    this._div.innerHTML =
      "<h4>DAILY <span class='danger'>CORONAVIRUS</span> TOTALS BY STATE</h4>" +
      (props
        ? `<div class="info-data">
      <span class="info-title">STATE:</span> ${props.name}<br>
      <span class="info-title">TESTED POSITIVE:</span> ${props.positive}<br>
      <span class="info-title">DEATHS:</span> ${props.deaths}<br>
      <span class="info-title">LAST UPDATED: </span>${props.lastChecked.slice(
        0,
        4
      )}
      </div>`
        : "Hover Over State");
  };
  STORE.info.addTo(STORE.map);
}

function createLegend() {
  const legend = L.control({ position: "bottomright" });

  legend.onAdd = function (map) {
    const div = L.DomUtil.create("div", "info legend"),
      grades = [0, 50, 100, 200, 500, 1000, 2500, 5000, 10000],
      labels = [];

    for (let i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' +
        getColor(grades[i] + 1) +
        '"></i> ' +
        grades[i] +
        (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }

    return div;
  };

  legend.addTo(STORE.map);
}

function getColor(d) {
  d = +String(d).replace(/[,]/, "");
  return d > 10000
    ? "#67000d"
    : d > 5000
    ? "#a50f15"
    : d > 2500
    ? "#cb181d"
    : d > 1000
    ? "#ef3b2c"
    : d > 500
    ? "#fb6a4a"
    : d > 200
    ? "#fc9272"
    : d > 100
    ? "#fcbba1"
    : d > 50
    ? "#fee0d2"
    : "#fff5f0";
}

function getPositiveResults() {
  const url = "https://covidtracking.com/api/states";
  fetch(url)
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("something went wrong");
      }
    })
    .then((data) => createMap(data))
    .catch((err) => console.log(err));
}

function getTotalCumulativeData() {
  const url = "https://covidtracking.com/api/v1/us/current.json";
  fetch(url)
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("something went wrong");
      }
    })
    .then((data) => createTotalsInfoDisplay(data))
    .catch((err) => console.log(err));
}

function style(data) {
  return {
    fillColor: getColor(data.properties.positive),
    weight: 1,
    opacity: 1,
    color: "white",
    dashArray: "0",
    fillOpacity: 0.7,
  };
}

function highlightFeature(e) {
  const layer = e.target;
  layer.setStyle({
    weight: 2,
    color: "#1e272e",
    dashArray: "",
    fillOpacity: 0.7,
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
  STORE.info.update(layer.feature.properties);
}

function resetHighlight(e) {
  STORE.geojson.resetStyle(e.target);
  STORE.info.update();
}

function onClick(e) {
  STORE.map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    // click: onClick,
    // contextmenu: highlightFeature,
  });
}

(() => {
  getPositiveResults();
})();
