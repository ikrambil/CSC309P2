import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import BrowseCalendarCard from './BrowseCalendarCard';
import Sidebar from './Sidebar';
import Footer from './Footer';

const BrowsePage = () => {
  const [calendars, setCalendars] = useState([]);
  const { accessToken } = useAuth();



  useEffect(() => {
    const fetchCalendars = async () => {
      const url = 'http://localhost:8000/calendars/browse/';
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
  
          // Process each calendar to calculate its overall time range
          const processedCalendars = data.map(calendar => {
              // Directly use the availability array from the calendar object
              const { availability } = calendar;
  
              const timeRange = availability.reduce((range, slot) => {
                  const startTime = new Date(slot.start_time);
                  const endTime = new Date(slot.end_time);
                  return {
                      start: !range.start || startTime < range.start ? startTime : range.start,
                      end: !range.end || endTime > range.end ? endTime : range.end,
                  };
              }, { start: null, end: null });
  
              // Format the start and end times back to ISO strings
              console.log(timeRange)
              const options = { month: 'numeric', day: 'numeric' };
              return {
                  ...calendar,
                  timeRangeStart: timeRange.start ? timeRange.start.toLocaleDateString('en-US', options) : null,
                  timeRangeEnd: timeRange.end ? timeRange.end.toLocaleDateString('en-US', options) : null,
              };
          });
  
          setCalendars(processedCalendars);
      } catch (error) {
          console.error('Error fetching Calendars:', error);
      }
    };
  
    fetchCalendars();
  }, [accessToken]);
  return (
    <>
    <Sidebar/>
    <div className="app-container">
        <div className="p-8 sm:ml-64">
            <div className="text-4xl text-left w-full border-b p-4">
                <h1 className="font-bold">All Calendars: <p className="font-normal text-xl"> Select any Calendar you wish to join!</p></h1>
            </div>
            {calendars.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-4">
                {calendars.map((calendar, index) => (
                    <BrowseCalendarCard key={index} id={calendar.id} title={calendar.name} description={calendar.description} pending={calendar.pendingInvitationsCount} accepted={calendar.acceptedInvitationsCount} finalized={calendar.finalized} timeRangeStart={calendar.timeRangeStart}
                    timeRangeEnd={calendar.timeRangeEnd} link="#" />
                ))}
            </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-4 text-xl text-gray-600">There currently exist no other calendars! Check back later to explore!</p>
                </div>
            )}
            
        </div>
      <Footer/>
    </div>
    </>
  );
};

export default BrowsePage;
