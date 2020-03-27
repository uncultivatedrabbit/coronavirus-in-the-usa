function handleToggle() {
  const toggle = document.getElementById("toggle");
  const map = document.getElementById("map");
  const graphs = document.getElementById("graphs")
  toggle.addEventListener("change", () => {


    if (toggle.checked) {
      map.classList.add('hidden');
      graphs.classList.remove('hidden');
    } else {
      map.classList.remove('hidden');
      graphs.classList.add('hidden');
    }
  });
}

(() => handleToggle())();
