document.addEventListener("DOMContentLoaded", function() {
    let isDragging = false;

    // Function to toggle cell selection
    function toggleSelection(cell) {
        cell.classList.toggle('selected');
        //cell.textContent = cell.classList.contains('selected') ? 'Selected' : '';
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

    // Ensure dragging is stopped if the user releases the mouse anywhere on the page
    document.addEventListener('mouseup', function() {
        isDragging = false;
    });

    /*document.getElementById('nextButton').addEventListener('click', function() {
        const selectedCells = document.querySelectorAll('.selected');
        const selectedTimes = Array.from(selectedCells).map(cell => {
            return {
                time: cell.getAttribute('data-time'),
                date: cell.getAttribute('data-date')
            };
        });
    
        // Now `selectedTimes` is an array of objects with time and date properties
        // You can process this array as needed to display the information
        // For demonstration, let's log the array to the console
        console.log(selectedTimes);
    
        // Redirect or display the times as needed
        // Example: 
        // window.location.href = 'your_new_page.html?times=' + encodeURIComponent(JSON.stringify(selectedTimes));
    }); */

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

