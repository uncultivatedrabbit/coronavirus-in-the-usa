function getUserInput() {
  const form = document.getElementById("states-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const selector = document.getElementById("states");
    const userSelection = selector.options[selector.selectedIndex].value;
    const userSelectedState = selector.options[
      selector.selectedIndex
    ].getAttribute("data-state-name");
    getDailyCoronavirusData(userSelection, userSelectedState);
  });
}

function getDailyCoronavirusData(userSelection, userSelectedState) {
  let url;
  if (!userSelection) {
    url = `https://covidtracking.com/api/v1/us/daily.json`;
  } else {
    const label = document.getElementById("charts-label");
    label.innerText = userSelectedState;
    url = `https://covidtracking.com/api/v1/states/${userSelection}/daily.json`;
  }
  fetch(url)
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error(res.statusText);
      }
    })
    .then((data) => {
      const oldPositiveChart = document.getElementById("positiveChart");
      const newPositiveChart = document.createElement("canvas");
      newPositiveChart.id = "positiveChart";
      newPositiveChart.setAttribute("aria-label", "Coronavirus positive graph");
      newPositiveChart.setAttribute("role", "img");
      oldPositiveChart.parentNode.replaceChild(
        newPositiveChart,
        oldPositiveChart
      );
      const oldDeathChart = document.getElementById("deathChart");
      const newDeathChart = document.createElement("canvas");
      newDeathChart.id = "deathChart";
      newDeathChart.setAttribute("aria-label", "Coronavirus death graph");
      newDeathChart.setAttribute("role", "img");
      oldDeathChart.parentNode.replaceChild(newDeathChart, oldDeathChart);
      dataParser(data);
    });
}

function dataParser(data) {
  let dailyDeaths = [];
  let dailyPositives = [];

  data.forEach((dailyData) => {
    if (dailyData.date > 20200303) {
      dailyPositives.push(dailyData.positive);
      if (dailyData.death === null || !dailyData.death) {
        dailyData.death = 0;
      }
      dailyDeaths.push(dailyData.death);
    }
  });
  // take into consideration that different states began tracking data on different days in march
  const oneDay = 1000 * 60 * 60 * 24;
  const presentDay = new Date();
  const firstChartedDay = new Date(presentDay.getFullYear(), 2, 4);
  const totalDaysCharted =
    (
      Math.round(presentDay.getTime() - firstChartedDay.getTime()) / oneDay
    ).toFixed(0);

  if (
    dailyDeaths.length !== totalDaysCharted &&
    dailyPositives.length !== totalDaysCharted
  ) {
    const difference = totalDaysCharted - dailyDeaths.length;
    for (let i = 0; i < difference; i++) {
      dailyDeaths.unshift(0);
      dailyPositives.unshift(0);
    }
  }

  createPositivesChart(dailyPositives.sort((x, y) => x - y));
  createDeathChart(dailyDeaths.sort((x, y) => x - y));
}

function createDeathChart(dailyDeaths) {
  const ctx = document.getElementById("deathChart").getContext("2d");
  const deathChart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          data: dailyDeaths,
          label: "Coronavirus Deaths",
          borderWidth: 2,
          borderColor: "#c23616",
          backgroundColor: "rgba(194, 54, 22, 0.3)",
          fill: true,
          pointRadius: 2,
          pointHoverRadius: 10,
        },
      ],
    },
    options: {
      responsive: true,
      aspectRatio: 5,
      tooltips: {
        mode: "index",
        intersect: true,
        titleFontFamily: "Montserrat",
        titleFontSize: 16,
        bodyFontFamily: "Open Sans",
        bodyFontSize: 14,
      },
      hover: {
        mode: "nearest",
        intersect: true,
        onHover: function (e) {
          const point = this.getElementAtEvent(e);
          if (point.length) e.target.style.cursor = "pointer";
          else e.target.style.cursor = "default";
        },
      },
      scales: {
        yAxes: [
          {
            gridLines: {
              color: "rgba(210, 218, 226, 0.2)",
            },
            ticks: {
              fontColor: "white",
              beginAtZero: true,
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
              fontColor: "white",
              autoSkip: true,
              maxTicksLimit: 20,
            },
          },
        ],
      },
      legend: {
        display: true,
        labels: {
          fontColor: "white",
          fontSize: 18,
          letterSpacing: "5px",
        },
      },
      animation: {
        duration: 1000,
        animationEasing: "easeInBounce",
      },
    },
    plugins: [
      {
        beforeInit: function (chart) {
          const time = chart.options.scales.xAxes[0].time, // 'time' object reference
            timeDiff = moment(time.max).diff(moment(time.min), "d"); // difference (in days) between min and max date
          // populate 'labels' array
          // (create a date string for each date between min and max, inclusive)
          for (i = 0; i <= timeDiff; i++) {
            var _label = moment(time.min).add(i, "d").format("YYYY-MM-DD");
            chart.data.labels.push(_label);
          }
        },
      },
    ],
  });
}

function createPositivesChart(dailyPositives) {
  const ctx = document.getElementById("positiveChart").getContext("2d");
  const postivesChart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          data: dailyPositives,
          label: "Coronavirus Positive Cases",
          borderWidth: 2,
          borderColor: "#0097e6",
          backgroundColor: "rgba(0, 151, 230, 0.3)",
          fill: true,
          pointRadius: 2,
          pointHoverRadius: 10,
        },
      ],
    },
    options: {
      responsive: true,
      aspectRatio: 5,
      tooltips: {
        mode: "index",
        intersect: true,
        titleFontFamily: "Montserrat",
        titleFontSize: 16,
        bodyFontFamily: "Open Sans",
        bodyFontSize: 14,
      },
      hover: {
        mode: "nearest",
        intersect: true,
        onHover: function (e) {
          const point = this.getElementAtEvent(e);
          if (point.length) e.target.style.cursor = "pointer";
          else e.target.style.cursor = "default";
        },
      },
      scales: {
        yAxes: [
          {
            gridLines: {
              color: "rgba(210, 218, 226, 0.2)",
            },
            ticks: {
              fontColor: "white",
              beginAtZero: true,
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
              fontColor: "white",
              autoSkip: true,
              maxTicksLimit: 20,
            },
          },
        ],
      },
      legend: {
        display: true,
        labels: {
          fontColor: "white",
          fontSize: 18,
          letterSpacing: "5px",
        },
      },
      animation: {
        duration: 1000,
        animationEasing: "easeInBounce",
      },
    },
    plugins: [
      {
        beforeInit: function (chart) {
          const time = chart.options.scales.xAxes[0].time, // 'time' object reference
            timeDiff = moment(time.max).diff(moment(time.min), "d"); // difference (in days) between min and max date
          // populate 'labels' array
          // (create a date string for each date between min and max, inclusive)
          for (i = 0; i <= timeDiff; i++) {
            var _label = moment(time.min).add(i, "d").format("YYYY-MM-DD");
            chart.data.labels.push(_label);
          }
        },
      },
    ],
  });
}

(() => {
  getDailyCoronavirusData();
  getUserInput();
})();
