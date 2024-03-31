import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Footer from './Footer';
import AvailabilityPicker from './Availibility';
import {format, parseISO, startOfDay, subHours } from 'date-fns';
import { useParams, useNavigate } from 'react-router-dom';
import 'flowbite';
import { ScheduleComponent, Inject, ViewsDirective, ViewDirective, Day, Week, Year, Month, Agenda } from '@syncfusion/ej2-react-schedule';
import { registerLicense } from '@syncfusion/ej2-base';

registerLicense('Ngo9BigBOggjHTQxAR8/V1NBaF5cXmZCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdnWXxdcHRWRWBZUkR1WkA=');



const ViewInvite = () => {
  const [invitation, setInvitation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [calendar, setCalendar] = useState(null);
  const [selectedDates, setSelectedDates] = useState({});
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true); 
  const { accessToken } = useAuth(); 
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if at least one toggle is selected
    const isAnyDateActive = Object.values(selectedDates).some(date => date.active);
    setIsSubmitDisabled(!isAnyDateActive); // Enable submit if any date is active
  }, [selectedDates]); // Re-run check when selectedDates changes


  useEffect(() => {
    if (token) {
      fetchInvitationDetails(token);
    }
  }, [token, accessToken]); // accessToken added if it's used in the future

  useEffect(() => {
    // This ensures fetchCalendarDetails is called only after invitation is successfully fetched
    if (invitation) {
      fetchCalendarDetails(invitation.calendar); // Assuming invitation contains a calendar ID
    }
  }, [invitation, accessToken]); // Dependency on invitation

  const fetchInvitationDetails = async () => {
    const url = `http://localhost:8000/calendars/invitations/${token}/view/`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${accessToken}`, Uncomment if needed
            },
        });
  
        if (!response.ok) throw new Error('Network response was not ok');
        let data = await response.json();
  
        // Check if availability is a string and parse it to JSON
        if (data.availability && typeof data.availability === 'string') {
            data.availability = JSON.parse(data.availability);
        }
  
        setInvitation(data);
        // console.log(data);
    } catch (error) {
        console.error('Error fetching invitation:', error);
        // Handle error
    } finally {
        setIsLoading(false); // Ensure to set loading state to false regardless of the fetch outcome
    }
  };

    const fetchCalendarDetails = async (calendar_id) => {
        const url = `http://localhost:8000/calendars/${calendar_id}/`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    //'Authorization': `Bearer ${accessToken}`,
                },
            });
    
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setCalendar(data);
           // console.log(data);
        } catch (error) {
            console.error('No Calendar exists', error);
            // Handle error
            //navigate('/dashboard/')
        } finally {
            setIsLoading(false); // Ensure to set loading state to false regardless of the fetch outcome
        }
        };
    //console.log(invitation);
    //console.log(calendar);

    const handleEditAvailabilityClick = () => {
        // Redirect to the edit-availability page
        navigate(`/edit-invite/${token}`); // Adjust the path as needed
      };
  if (isLoading) return (<div>Loading...</div>);

  const events = (invitation.availability || []).map((slot, index) => {
    return {
      Id: index + 1,
      Subject: 'Availability',
      StartTime: new Date(slot.start_time),
      EndTime: new Date(slot.end_time)
    };
  });

  return (
    <>
      <div className='p-8'>
        <div className="text-left w-full border-b p-4 flex justify-between mb-4 items-left">
          <h1 className="text-2xl md:text-4xl">Welcome! You have been invited to {calendar?.name}</h1>
        </div>
        <div >
          <div className="mb-6">
                <div className="text-left w-full border-b p-4 flex justify-left mb-4 items-left">
                    <h1 className="text-xl md:text-2xl">Description:</h1>
                </div>
                <div  className="block px-8 text-sm text-xl text-gray-900 ">{calendar?.description} </div>
            </div>
            <div className="mb-6 flex-col justify-center">
                <div className="text-left w-full border-b p-4 flex justify-left mb-4 items-left">
                    <h1 className="text-xl md:text-2xl">Here is your availability:</h1>
                </div>
                {invitation && invitation.availability && invitation.availability.length > 0 ? (
                    <div>
                       <ScheduleComponent eventSettings={{ 
                          dataSource: events 
                          }} 
                          currentView='Month'
                          readonly={true}
                          >
                          <ViewsDirective>
                              <ViewDirective option="Day" />
                              <ViewDirective option="Week" />
                              <ViewDirective option="Month" />
                              <ViewDirective option="Year" />
                              <ViewDirective option="Agenda" />
                          </ViewsDirective>
                          <Inject services={[Day, Week, Month, Year, Agenda]} />
                        </ScheduleComponent>
                    </div>
                    
                ) : (
                    <div>
                        <p>Please put in your availability.</p>
                    </div>
                )}
                <div className='p-8 flex justify-center'>
                <button onClick={handleEditAvailabilityClick} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                            Edit Availability
                </button>
                </div>
            </div>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default ViewInvite;
