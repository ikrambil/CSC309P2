import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import CalendarCard from './CalendarCard';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Dashboard = () => {
  const [calendars, setCalendars] = useState([]);
  const { userId } = useParams();
  const { accessToken } = useAuth();


  useEffect(() => {
    const fetchCalendars = async () => {
      const url = 'http://localhost:8000/calendars/all/';
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
          setCalendars(data);
      } catch (error) {
          console.error('Error fetching Calendars:', error);
          // Handle error
      }
  };

    fetchCalendars();
  }, []);

  return (
    <>
    <Sidebar/>
    <div className="app-container">
        <div className="p-8 sm:ml-64">
            <div className="text-4xl text-left w-full border-b p-4">
                <h1 className="font-bold">Calendars:</h1>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-4">
                {calendars.map((calendar, index) => (
                    <CalendarCard key={index} id={calendar.id} title={calendar.name} description={calendar.description} pending={calendar.pendingInvitationsCount} accepted={calendar.acceptedInvitationsCount} finalized={calendar.finalized} link="#" />
                ))}
            </div>
        </div>
      <Footer/>
    </div>
    </>
  );
};

export default Dashboard;
