const timeZones = Intl.supportedValuesOf('timeZone');

const inputs = [
  { inputId: 'tzInput1', listId: 'timeZonesList1', hoursBox: 'hoursBox1', minutesBox: 'minutesBox1', loadingId: 'loadingId1' },
  { inputId: 'tzInput2', listId: 'timeZonesList2', hoursBox: 'hoursBox2', minutesBox: 'minutesBox2', loadingId: 'loadingId2' }
];

function setupAutocomplete(inputId, hoursId, minutesId) {
  new autoComplete({
    selector: `#${inputId}`,
    placeHolder: "Search for a time zone",
    data: { src: timeZones, cache: true },
    resultItem: { highlight: true },
    events: {
      input: {
        selection: (event) => {
          const selection = event.detail.selection.value;
          document.getElementById(inputId).value = selection;
          fetchAndSetTime(selection, hoursId, minutesId);
        }
      }
    }
  });
}

setupAutocomplete("tzInput1", "hoursBox1", "minutesBox1");
setupAutocomplete("tzInput2", "hoursBox2", "minutesBox2");


// Function to fetch and update time
async function fetchAndSetTime(selectedZone, entry) {
  if (!timeZones.includes(selectedZone)) {
    console.warn("Invalid time zone:", selectedZone);
    return;
  }

  try {
    const res = await fetch(`https://timeapi.io/api/time/current/zone?timeZone=${encodeURIComponent(selectedZone)}`);
    const data = await res.json();
    const [hours, minutes] = data.time.split(':');

    document.getElementById(entry.hoursBox).value = parseInt(hours);
    document.getElementById(entry.minutesBox).value = parseInt(minutes);
    
    switchOff(entry.loadingId);

  } catch (err) {
    console.error("Failed to fetch time:", err);
  }
}

// Populate datalists and add listeners
inputs.forEach(entry => {
  const datalist = document.getElementById(entry.listId);
  const input = document.getElementById(entry.inputId);

  // Populate the datalist
  timeZones.forEach(zone => {
    const option = document.createElement('option');
    option.value = zone;
    datalist.appendChild(option);
  });

  // On change (when user selects from list or blurs)
  input.addEventListener('change', function () {
    fetchAndSetTime(this.value, entry);
  });

  // On pressing Enter key
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      switchOn(entry.loadingId);
      fetchAndSetTime(this.value, entry);
    }
  });
});

function switchOn(loadingId) {
  const loadingDiv = document.getElementById(loadingId);
  loadingDiv.className = "";
  loadingDiv.classList.add('spinner');
}

function switchOff(loadingId) {
  const loadingDiv = document.getElementById(loadingId);
  loadingDiv.className = "";
  loadingDiv.classList.add('fa-solid', 'fa-check');
}