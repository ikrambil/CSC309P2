document.addEventListener("DOMContentLoaded", function() {
    let isDragging = false;

    function toggleSelection(cell) {
        cell.classList.toggle('selected');
    }

    document.querySelectorAll('.selectable').forEach(function(cell) {
        cell.addEventListener('mousedown', function(e) {
            e.preventDefault(); // Prevent text selection
            isDragging = true;
            toggleSelection(this);
        });
        cell.addEventListener('mouseenter', function() {
            if (isDragging) {
                toggleSelection(this);
            }
        });
    });

    // Function to toggle cell selection
    function toggleCellSelection(cell) {
        // If cell is already selected, toggle between selected1 and purple-selected
        if (cell.classList.contains('selected1')) {
            cell.classList.remove('selected1');
            cell.classList.add('purple-selected');
        } else if (cell.classList.contains('purple-selected')) {
            // If cell is purple-selected, toggle it back
            cell.classList.remove('purple-selected');
            cell.classList.add('selected1');
        } else {
            // If cell is not selected, add the selected class
            cell.classList.add('selected');
        }
    }

    function togglePurpleCell(cell){
        if(cell.classList.contains('purple-selected1')){
            cell.classList.remove('purple-selected1');
            cell.classList.add('selected1');
        }
        else if(cell.classList.contains('selectable2')){
            cell.classList.add('purple-selected1');
        }
    }

    // Apply event listeners to each selectable cell
    document.querySelectorAll('.selectable1').forEach(function(cell) {
        cell.addEventListener('mousedown', function(e) {
            e.preventDefault(); // Prevent text selection
            isDragging = true;
            toggleCellSelection(this);
        });
        cell.addEventListener('mouseenter', function() {
            if (isDragging) {
                toggleCellSelection(this);
            }
        });
    });

    document.querySelectorAll('.selectable2').forEach(function(cell){
        cell.addEventListener('mousedown', function(e){
            e.preventDefault();
            isDragging = true;
            togglePurpleCell(this);
        });
        cell.addEventListener('mouseenter', function(){
            if(isDragging){
                togglePurpleCell(this);
            }
        });
    });

    // Ensure dragging is stopped if the user releases the mouse anywhere on the page
    document.addEventListener('mouseup', function() {
        isDragging = false;
    });

    // Initialize a base date as the current date
    let baseDate = new Date();

    function setBaseDateToCurrentWeek() {
        let dayOfWeek = baseDate.getDay(); // Sunday - 0, Monday - 1, etc.
        let daysToSunday = dayOfWeek === 0 ? 0 : -dayOfWeek; // Adjust to get to the nearest past Sunday
        baseDate.setDate(baseDate.getDate() + daysToSunday);
    }

    function populateCalendarDates() {
        // Update each day column header with new dates from the base date
        document.querySelectorAll('thead tr th:not(:first-child)').forEach((th, index) => {
            let newDate = new Date(baseDate);
            newDate.setDate(newDate.getDate() + index); // Increment the date for each column
            let day = newDate.getDate();
            let month = newDate.getMonth() + 1; // Adjust month from 0-indexed to 1-indexed
            let year = newDate.getFullYear(); // You might not need the year, but it's here if you do
            let dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            th.textContent = `${dayNames[newDate.getDay()]} ${month}/${day}`;
        });
    }

    function adjustCalendarDates(isNextWeek) {
        if (isNextWeek) {
            baseDate.setDate(baseDate.getDate() + 7);
        } else {
            baseDate.setDate(baseDate.getDate() - 7);
        }
        populateCalendarDates();
    }

    // Initialize the calendar with the current week when the page loads
    document.addEventListener('DOMContentLoaded', function() {
        setBaseDateToCurrentWeek();
        populateCalendarDates();
    });

    // Attach event listeners to the buttons for next and last week
    document.getElementById('lastWeekButton').addEventListener('click', function() {
        adjustCalendarDates(false);
    });

    document.getElementById('nextWeekButton').addEventListener('click', function() {
        adjustCalendarDates(true);
    });
});