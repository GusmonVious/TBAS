const timeZones = Intl.supportedValuesOf('timeZone');
const timeSync1 = document.getElementById('timeSync1');
const timeSync2 = document.getElementById('timeSync2');

const inputs = [
  { inputId: 'tzInput1', listId: 'timeZonesList1', hoursBox: 'hoursBox1', minutesBox: 'minutesBox1', loadingId: 'loadingId1', currentHours: '' },
  { inputId: 'tzInput2', listId: 'timeZonesList2', hoursBox: 'hoursBox2', minutesBox: 'minutesBox2', loadingId: 'loadingId2', currentMinutes: '' }
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

    entry.currentHours = parseInt(hours);
    entry.currentMinutes = parseInt(minutes);
    
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


timeSync1.addEventListener('click', () => {
  const changedHoursBox = document.getElementById(inputs[0].hoursBox);
  const changedMinutesBox = document.getElementById(inputs[0].minutesBox);

  const originalHour = inputs[0].currentHours;
  const originalMinute = inputs[0].currentMinutes;

  const newHour = parseInt(changedHoursBox.value);
  const newMinute = parseInt(changedMinutesBox.value);

  if (isNaN(newHour) || isNaN(newMinute)) {
    alert("Invalid time entered.");
    return;
  }

  // Create a Date object for time zone 1
  const now = new Date();
  const fromTime = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), newHour, newMinute));

  // Format in the second time zone (tzInput2)
  const fromTz = document.getElementById(inputs[0].inputId).value;
  const toTz = document.getElementById(inputs[1].inputId).value;

  if (!fromTz || !toTz || !timeZones.includes(fromTz) || !timeZones.includes(toTz)) {
    alert("Both time zones must be valid.");
    return;
  }

  const options = { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: toTz };
  const formatter = new Intl.DateTimeFormat([], options);
  const parts = formatter.formatToParts(fromTime);

  const targetHour = parseInt(parts.find(p => p.type === "hour").value);
  const targetMinute = parseInt(parts.find(p => p.type === "minute").value);

  // Update second time box
  document.getElementById(inputs[1].hoursBox).value = targetHour;
  document.getElementById(inputs[1].minutesBox).value = targetMinute;

  // Optionally update `currentHours` and `currentMinutes` in inputs[1]
  inputs[1].currentHours = targetHour;
  inputs[1].currentMinutes = targetMinute;
});
