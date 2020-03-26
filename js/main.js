const STORE = {
  geojson: "",
  map: "",
  info: "",
};

function createMap(covidData) {
  const ACCESS_TOKEN =
    "pk.eyJ1IjoidW5jdWx0aXZhdGVkcmFiYml0IiwiYSI6ImNrNWs1YXJ0YjBha2IzanF4YmhmcHR2ZTUifQ.3YhMGRpoosV0u46J39b3lQ";
  STORE.map = L.map("map").setView([37.8, -96], 4);
  L.tileLayer(
    `https://api.mapbox.com/styles/v1/uncultivatedrabbit/ck87dyeh90cp71in0vmxym7ox/tiles/256/{z}/{x}/{y}@2x?access_token=${ACCESS_TOKEN}`,
    {
      id: "mapbox/light-v9",
      attribution: null,
      tileSize: 512,
      zoomOffset: -1,
      maxZoom: 18,
    }
  ).addTo(STORE.map);

  const states = [
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
  ];

  statesData.features.map((stateData, i) => {
    const state = stateData.properties;
    if (state.name === states[i][0]) {
      state.appreviation = states[i][1];
    }
  });
  covidData.map(d => {
    const appreviation = d.state;
    statesData.features.map(state => {
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
  STORE.map.attributionControl.addAttribution('Covid-19 data &copy; <a target="_blank" href="https://covidtracking.com">The COVID Tracking Project</a>');
  createInfoControls();
  createLegend();
}

function createInfoControls() {
  STORE.info = L.control();
  STORE.info.onAdd = function(map) {
    this._div = L.DomUtil.create("div", "info"); // create a div with a class "info"
    this.update();
    return this._div;
  };

  // method that we will use to update the control based on feature properties passed

  STORE.info.update = function(props) {
    if (props) {
      if (props.deaths === null) {
        props.deaths = 0;
      }
      // if(String(props.positive).length > 3){
      //   props.positive = +(String(props.positive).split('').slice(-3, 0, ',').join(''));
      // }
      this._div.innerHTML = `
      <h4>DAILY CORONAVIRUS TOTALS IN THE US</h4>
      <b>STATE:</b> ${props.name}<br>
      <b>Positive Cases:</b> ${props.positive}<br>
      <b>DEATHS:</b> ${props.deaths}<br>
      <b>LAST UPDATED: ${props.lastChecked.slice(0,4)}</b>
      `;
    }
  };
  STORE.info.addTo(STORE.map);
}

function createLegend() {
  const legend = L.control({ position: "bottomright" });

  legend.onAdd = function(map) {
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
    .then(res => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("something went wrong");
      }
    })
    .then(data => createMap(data))
    .catch(err => console.log(err));
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
    color: "#666",
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
    click: onClick,
  });
}

(() => {
  getPositiveResults();
})();