import { useParams, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useCallback }  from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import ContactDropdown from './ContactDropdown';
import AvailabilityPicker from './Availibility';
import { formatISO, parseISO, format, subHours, startOfDay } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const EditCalendar = () => {
  let { calendarId } = useParams(); // Assuming you're using React Router and have a route like /edit-calendar/:id
  let navigate = useNavigate();
  const { accessToken } = useAuth(); 

  // State for the form fields
  const [calendarName, setCalendarName] = useState('');
  const [description, setDescription] = useState('');

  const [selectedDates, setSelectedDates] = useState({});
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true); // New state to manage submit button

  const [contacts, setContacts] = useState([]); // Add this line

  let calendar;
  
  useEffect(() => {
    // Check if at least one toggle is selected
    const isAnyDateActive = Object.values(selectedDates).some(date => date.active);
    setIsSubmitDisabled(!isAnyDateActive); // Enable submit if any date is active
  }, [selectedDates]); // Re-run check when selectedDates changes

  const [selectedContacts, setSelectedContacts] = useState([]);
  const isAnyContactSelected = selectedContacts.length > 0;

  // Adjust useEffect to consider both dates and contacts for disabling submit
  useEffect(() => {
    const isAnyDateActive = true;
    const isAnyContactSelected = selectedContacts.length > 0;
    setIsSubmitDisabled(!(isAnyDateActive && isAnyContactSelected));
  }, [selectedDates, selectedContacts]);

const handleSelectedContactsChange = (selectedIds) => {
    setSelectedContacts(selectedIds);
};

const handleSelectedDatesChange = useCallback((updatedSelectedDates) => {
  setSelectedDates(updatedSelectedDates);
}, []);

useEffect(() => {
    const fetchContacts = async () => {
      const url = 'http://localhost:8000/accounts/profile/contacts/';
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });
  
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setContacts(data); // Assume data is the array of contacts
      } catch (error) {
        console.error('Error fetching contacts:', error);
        // Handle error
      }
    };
  
    fetchContacts();
  }, [accessToken]); // accessToken as a dependency
  
  // Fetch Invitation Information
  useEffect(() => {
    if (contacts.length > 0) { // Ensures contacts are loaded
      const fetchCalendarData = async () => {
        const url = `http://localhost:8000/calendars/${calendarId}/`;
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
          });
          if (!response.ok) throw new Error('Network response was not ok');
          const calendarData = await response.json();
  
          // Populate form states with fetched data
          setCalendarName(calendarData.name);
          setDescription(calendarData.description);
          calendar = calendarData.availability;
  
          // Loop through participants and enable contacts that are in the participants field
          const participantEmails = calendarData.participants; // Assuming this is an array of emails
          const participantIds = contacts.filter(contact => participantEmails.includes(contact.email)).map(contact => contact.id);
          setSelectedContacts(participantIds);

          const transformedAvailability = calendarData.availability.reduce((acc, curr) => {
            const dateKey = curr.start_time.split('T')[0]; // Extract date part from start_time
            if (!acc[dateKey]) {
              acc[dateKey] = {
                active: true,
                timeRanges: [],
              };
            }
            acc[dateKey].timeRanges.push({
              startTime: parseISO(curr.start_time),
              endTime: parseISO(curr.end_time),
            });
            return acc;
          }, {});
  
          setSelectedDates(transformedAvailability);
        } catch (error) {
          console.error('Error fetching calendar data:', error);
        }
      };
  
      fetchCalendarData();
    }
  }, [contacts, calendarId, accessToken]);
  console.log(selectedContacts);
  const handleSubmit = async (e) => {
    e.preventDefault();
    let availability;
    // Check if any date is active, implying the user has set new availability
    const isAnyDateActive = Object.values(selectedDates).some(date => date.active);
    const participants = selectedContacts.map(contactId => 
        contacts.find(contact => contact.id === contactId)?.email);

    if (isAnyDateActive) {
        // Transform selectedDates into your API's expected format for availability
      availability = Object.entries(selectedDates)
      .filter(([_, value]) => value.active) // Filter for active dates
      .flatMap(([date, value]) => {
          if (Array.isArray(value.timeRanges)) {
              return value.timeRanges.map(({ startTime, endTime }) => {
                  // Check if startTime and endTime are strings before parsing
                  const startDateTime = typeof startTime === 'string' ? parseISO(startTime) : startTime;
                  const endDateTime = typeof endTime === 'string' ? parseISO(endTime) : endTime;
  
                  // Subtract 24 hours from the datetime objects to adjust for the timezone offset
                  const dateObj = startOfDay(parseISO(date));
                  const adjustedDateObj = subHours(dateObj, 24);
                  const adjustedDateString = format(adjustedDateObj, 'yyyy-MM-dd');
  
                  // Use the date part from the 'date' and time part from adjustedStartDateTime and adjustedEndDateTime
                  const formattedStartTime = format(new Date(`${adjustedDateString}T${format(startDateTime, 'HH:mm')}`), "yyyy-MM-dd'T'HH:mm");
                  const formattedEndTime = format(new Date(`${adjustedDateString}T${format(endDateTime, 'HH:mm')}`), "yyyy-MM-dd'T'HH:mm");
  
                  return {
                      start_time: formattedStartTime,
                      end_time: formattedEndTime,
                  };
              });
          }
          return [];
      });
    }
    else{
        availability = calendar.availability
    }
    const formData = {
        name: calendarName,
        description,
      };
      const requestData = JSON.stringify({
        ...formData,
        participants: participants, // Use the directly prepared data
        availability: JSON.stringify(availability), // Use the directly prepared data
      });
      console.log(requestData);
    
      try {
        const url = `http://localhost:8000/calendars/${calendarId}/update-availability/`;
        const response = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: requestData,
        });
    
        if (!response.ok) {
          // Handle the error according to your application's needs
          throw new Error('Failed to update calendar');
        }
        const updatedCalendar = await response.json();
        console.log('Calendar updated successfully:', updatedCalendar);
        // Redirect or perform any follow-up actions as needed
        navigate(`/view-calendar/${calendarId}`); // Adjust the redirect path as necessary
      } catch (error) {
        console.error('Error updating calendar:', error);
      }
    };

  return (
    <>
    <Sidebar/>
    <div className='p-8 sm:ml-64'>
      <div className="text-left w-full border-b p-4 flex justify-between mb-4 items-center">
        <h1 className="text-2xl md:text-4xl">Edit Your Calendar:</h1>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
      <div className='w-1/2'>
        <div className="mb-6">
            <label htmlFor="calendarName" className="block mb-2 text-sm font-medium text-gray-900">Name: </label>
            <input type="text" id="calendarName" value={calendarName} onChange={(e) => setCalendarName(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="My Calendar" required />
        </div>
        <div className="mb-6">
            <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900">Description: </label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Describe your meeting" required></textarea>
        </div>
        <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-900">Contacts: </label>
            <ContactDropdown
                contacts={contacts}
                selectedContacts={selectedContacts}
                onSelectedContactsChange={handleSelectedContactsChange}
            />
            {
              !isAnyContactSelected && (
                <div className=" w-full text-center text-sm font-medium text-bold text-red-700 bg-red-300 rounded-lg">Please select at least one contact.</div>
              )
            }
        </div>
        <div className="mb-6">
            <p className="text-sm font-medium text-gray-900">Availability (Enter your new availability, leave blank if there are no changes):</p>
            <AvailabilityPicker setSelectedDates={handleSelectedDatesChange} />
            {isSubmitDisabled && (
          <div className=" w-full text-center text-sm font-medium text-bold text-red-700 bg-red-300 rounded-lg">Please select at least one date.</div>
        )}
        </div>
      </div>
      <button disabled={isSubmitDisabled} type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Edit!</button>
    </form>
    </div>
    <Footer/>
  </>
    );
};

export default EditCalendar;
