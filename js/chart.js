function getDailyCoronavirusData() {
  const url = "https://covidtracking.com/api/us/daily";
  fetch(url)
    .then(res => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error(res.statusText);
      }
    })
    .then(data => dataParser(data));
}
getDailyCoronavirusData();

function dataParser(data) {
  let dailyDeaths = [];
  let dailyPositives = [];

  data.forEach(dailyData => {
    dailyPositives.push(dailyData.positive);
    if (dailyData.death === null) {
      dailyData.death = 0;
    }
    dailyDeaths.push(dailyData.death);
  });
  createPositivesChart(dailyPositives.sort((x, y) => x - y));
  createDeathChart(dailyDeaths.sort((x, y) => x - y));
}

function createDeathChart(dailyDeaths) {
  const ctx = document.getElementById("deathChart").getContext("2d");
  const chart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          data: dailyDeaths,
          label: 'Nationwide Coronavirus Deaths',
          borderWidth: 2,
          borderColor: "#c23616",
          backgroundColor:"#c23616",
          fill: true,
          pointRadius: 2,
        },
      ],
    },
    options: {
      responsive: true,
      tooltips: {
        mode: "index",
        intersect: false,
      },
      hover: {
        mode: "nearest",
        intersect: true,
        onHover: function(e) {
          const point = this.getElementAtEvent(e);
          if (point.length) e.target.style.cursor = 'pointer';
          else e.target.style.cursor = 'default';
       }
      },
      scales: {
        yAxes: [
          {
            gridLines: {
              color: "rgba(210, 218, 226, 0.2)",
            },
            ticks: {
              fontColor: "white"
            },
          },
          
        ],
        xAxes: [
          {
            type: "time",
            gridLines: {
              color: "rgba(210, 218, 226, 0.2)",
            },
            time: {
              parser: "YYYY-MM-DD",
              unit: "day",
              displayFormats: {
                day: "MMM D",
              },
              min: "2020-03-04",
              max: Date.now(),
            },
            ticks: {
              source: "data",
              fontColor: "white"
            },
          },
        ],
      },
      legend: {
        display: true,
        labels: {
          fontColor: "white",
          fontSize: 18,
          letterSpacing: "5px"
      }
      },
      animation: {
        duration: 0,
      },
    },
    plugins: [
      {
        beforeInit: function(chart) {
          const time = chart.options.scales.xAxes[0].time, // 'time' object reference
            timeDiff = moment(time.max).diff(moment(time.min), "d"); // difference (in days) between min and max date
          // populate 'labels' array
          // (create a date string for each date between min and max, inclusive)
          for (i = 0; i <= timeDiff; i++) {
            var _label = moment(time.min)
              .add(i, "d")
              .format("YYYY-MM-DD");
            chart.data.labels.push(_label);
          }
        },
      },
    ],
  });
}

function createPositivesChart(dailyPositives) {
  const ctx = document.getElementById("positiveChart").getContext("2d");
  const chart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          data: dailyPositives,
          label: "Nationwide Coronavirus Positive Cases",
          borderWidth: 2,
          borderColor: "#0097e6",
          backgroundColor:"#0097e6",
          fill: true,
          pointRadius: 2,
        },
      ],
    },
    options: {
      responsive: true,
      tooltips: {
        mode: "index",
        intersect: false,
      },
      hover: {
        mode: "nearest",
        intersect: true,
        onHover: function(e) {
          const point = this.getElementAtEvent(e);
          if (point.length) e.target.style.cursor = 'pointer';
          else e.target.style.cursor = 'default';
       }
      },
      scales: {

        yAxes: [
          {
            gridLines: {
              color: "rgba(210, 218, 226, 0.2)",
            },
            ticks: {
              fontColor: "white"
            },
          },
        ],
        xAxes: [
          {
            type: "time",
            gridLines: {
              color: "rgba(210, 218, 226, 0.2)",
            },
            time: {
              parser: "YYYY-MM-DD",
              unit: "day",
              displayFormats: {
                day: "MMM D",
              },
              min: "2020-03-04",
              max: Date.now(),
            },
            ticks: {
              source: "data",
              fontColor: "white"
            },
          },
        ],
      },
      legend: {
        display: true,
          labels: {
              fontColor: "white",
              fontSize: 18,
              letterSpacing: "5px"
          }
      },
      animation: {
        duration: 0,
      },
    },
    plugins: [
      {
        beforeInit: function(chart) {
          const time = chart.options.scales.xAxes[0].time, // 'time' object reference
            timeDiff = moment(time.max).diff(moment(time.min), "d"); // difference (in days) between min and max date
          // populate 'labels' array
          // (create a date string for each date between min and max, inclusive)
          for (i = 0; i <= timeDiff; i++) {
            var _label = moment(time.min)
              .add(i, "d")
              .format("YYYY-MM-DD");
            chart.data.labels.push(_label);
          }
        },
      },
    ],
  });
}

(() => getDailyCoronavirusData())();
