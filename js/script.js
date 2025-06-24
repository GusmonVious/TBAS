const timeZones = Intl.supportedValuesOf('timeZone');
const timeSync1 = document.getElementById('timeSync1');
const timeSync2 = document.getElementById('timeSync2');
const reset = document.getElementById('reset');

// Hamburger menu functionality
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebarMenu = document.getElementById('sidebarMenu');
const menuOverlay = document.getElementById('menuOverlay');
const closeSidebar = document.getElementById('closeSidebar');

// Open sidebar
hamburgerBtn.addEventListener('click', () => {
    hamburgerBtn.style.visibility = 'hidden';
    sidebarMenu.classList.add('active');
    menuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

// Close sidebar
function closeSidebarMenu() {
    sidebarMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
    document.body.style.overflow = '';
    hamburgerBtn.style.visibility = 'visible';
}

closeSidebar.addEventListener('click', closeSidebarMenu);
menuOverlay.addEventListener('click', closeSidebarMenu);

// Close sidebar on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebarMenu.classList.contains('active')) {
        closeSidebarMenu();
    }
});

const inputs = [
  { inputId: 'tzInput1', listId: 'timeZonesList1', hoursBox: 'hoursBox1', minutesBox: 'minutesBox1', loadingId: 'loadingId1', selectedZone: '' },
  { inputId: 'tzInput2', listId: 'timeZonesList2', hoursBox: 'hoursBox2', minutesBox: 'minutesBox2', loadingId: 'loadingId2', selectedZone: '' }
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

    entry.selectedZone = selectedZone;

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

timeSync1.addEventListener('click', () => syncTime(0, 1));
timeSync2.addEventListener('click', () => syncTime(1, 0));

function syncTime(fromIndex, toIndex) {
  const from = inputs[fromIndex];
  const to = inputs[toIndex];

  const changedHour = parseInt(document.getElementById(from.hoursBox).value);
  const changedMinute = parseInt(document.getElementById(from.minutesBox).value);

  const oldHour = from.currentHours;
  const oldMinute = from.currentMinutes;

  if (isNaN(changedHour) || isNaN(changedMinute)) {
    alert("Invalid time input.");
    return;
  }

  // Prevent syncing if no change
  if (changedHour === oldHour && changedMinute === oldMinute) {
    alert("No time change detected.");
    return;
  }

  // Compute delta
  const originalTotal = oldHour * 60 + oldMinute;
  const newTotal = changedHour * 60 + changedMinute;
  const deltaMinutes = newTotal - originalTotal;

  const toHour = to.currentHours;
  const toMinute = to.currentMinutes;

  if (toHour === '' || toMinute === '') {
    alert("Please fetch both time zones before syncing.");
    return;
  }

  // Apply delta
  let totalTarget = toHour * 60 + toMinute + deltaMinutes;

  // Normalize time (wrap around 0–1439 minutes)
  totalTarget = ((totalTarget % 1440) + 1440) % 1440;

  const updatedHour = Math.floor(totalTarget / 60);
  const updatedMinute = totalTarget % 60;

  // Set new values
  document.getElementById(to.hoursBox).value = updatedHour;
  document.getElementById(to.minutesBox).value = updatedMinute;

  // Reset reference values
  from.currentHours = changedHour;
  from.currentMinutes = changedMinute;
  to.currentHours = updatedHour;
  to.currentMinutes = updatedMinute;
}

reset.addEventListener('click', () => {
  try {
    let success = false;

    if(document.getElementById(inputs[0].inputId).value !== ''){
      switchOn(inputs[0].loadingId);
      fetchAndSetTime(inputs[0].selectedZone, inputs[0]);
      console.log('Resetted left Time-Zone successfully')
      success = true;
    }
    if(document.getElementById(inputs[1].inputId).value !== ''){
      switchOn(inputs[1].loadingId);
      fetchAndSetTime(inputs[1].selectedZone, inputs[1]);
      console.log('Resetted right Time-Zone successfully')
      success = true;
    }

    if(success){
      reset.style.backgroundColor = '#9fe2bf'; // Green
      setTimeout(() => {
        reset.style.backgroundColor = '#dfe8e8'; // Resets to Default
        console.log('Reset Successfully')
      }, 3000)
    } else {
        reset.style.backgroundColor = '#ff6961'; // Red
        setTimeout(() => {
        reset.style.backgroundColor = '#dfe8e8'; // Default
        console.warn('Reset failed: Both inputs are empty')
      }, 3000)
    }

  }
  catch(error){
    console.error('Reset failed due to error:', error);
    reset.style.backgroundColor = '#ff6961'; // red
  }

})

// document.getElementById('setButton').addEventListener('click', () => {
//   try {

//     const entryZone1 = document.getElementById('tzInput1').value;
//     const entryHours1 = parseInt(document.getElementById(inputs[0].hoursBox).value);
//     const entryMinutes1 = parseInt(document.getElementById(inputs[0].minutesBox).value);

//     const entryZone2 = document.getElementById('tzInput2').value;
//     const entryHours2 = parseInt(document.getElementById(inputs[1].hoursBox).value);
//     const entryMinutes2 = parseInt(document.getElementById(inputs[1].minutesBox).value);

//     const span1 = `${entryZone1} ${entryHours1}:${entryHours2}`;
//     const span2 = `${entryZone2} ${entryHours2}:${entryHours2}`;

//     toDoBox = document.createElement('div');
//     toDoBox.classList.add('appointmentBox');

//     toDoBox.innerHTML = `<p>Appointment set at <span class='time1'>${span1},</span> <span class='time2'>${span2}</span></p>`;

//     document.getElementById('toDo').append(toDoBox);
    
//   }
//   catch(error){
//     console.error('Failed to set appointment:', error);
//   }

// })	

let appointmentCount = 0;

document.getElementById('setButton').addEventListener('click', () => {
    appointmentCount++;
    const sidebarContent = document.querySelector('.sidebar-content');
    
    // Create new appointment item for sidebar
    const newAppointment = document.createElement('div');
    newAppointment.className = 'appointment-item';
    newAppointment.innerHTML = `
        <div class="appointment-time">
            <span class="timezone-1">${document.getElementById('tzInput1').value || 'Unknown'}: ${document.getElementById('hoursBox1').value || '00'}:${document.getElementById('minutesBox1').value || '00'}</span>
            <span class="timezone-2">${document.getElementById('tzInput2').value || 'Unknown'}: ${document.getElementById('hoursBox2').value || '00'}:${document.getElementById('minutesBox2').value || '00'}</span>
        </div>
        <div class="appointment-title">New Meeting #${appointmentCount}</div>
    `;
    
    sidebarContent.appendChild(newAppointment);
    
    // Animate the new appointment
    newAppointment.style.opacity = '0';
    newAppointment.style.transform = 'translateX(-20px)';
    setTimeout(() => {
        newAppointment.style.transition = 'all 0.3s ease';
        newAppointment.style.opacity = '1';
        newAppointment.style.transform = 'translateX(0)';
    }, 100);
});