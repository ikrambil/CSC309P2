import React from 'react';
import {Link } from 'react-router-dom';


const CalendarCard = ({ title, id, description, link, pending, accepted, finalized }) => {
    const totalInvitations = parseInt(pending, 10) + parseInt(accepted, 10);
    const maxLength = 100; // Maximum length of the description

    // Truncate description if it exceeds maxLength
    const truncatedDescription = description.length > maxLength ? `${description.substring(0, maxLength)}...` : description;

  // Determine the status and styling based on responses and whether it's finalized
  let statusText, statusStyle, statusIndicatorColor;
  if (finalized) {
    statusText = 'Finalized';
    statusStyle = 'bg-green-100';
    statusIndicatorColor = 'bg-green-500';
  } else if (totalInvitations === parseInt(accepted, 10)) {
    statusText = 'Waiting to Finalize';
    statusStyle = 'bg-yellow-100';
    statusIndicatorColor = 'bg-yellow-500';
  } else {
    statusText = 'Waiting for Recipients';
    statusStyle = 'bg-red-100';
    statusIndicatorColor = 'bg-red-500';
  }
  
  return (
    <div className="card bg-white border border-gray-200 rounded-lg shadow-md p-4 m-4 w-full aspect-ratio-4/3 transition-transform duration-300 hover:-translate-y-1">
      <div className="flex justify-between items-left p-4">
        <div className="flex-1">
          <h5 className="text-2xl font-bold text-gray-900">{title}</h5>
          <p className="text-gray-500 text-xl py-2">{truncatedDescription}</p>
          <p className="text-gray-500 py-2">{parseInt(accepted, 10)}/{totalInvitations} invitations accepted</p>
          <span className={`inline-flex items-center ${statusStyle} text-xs font-medium px-2.5 py-0.5 rounded-full mt-4`}>
            <span className={`w-2 h-2 me-1 ${statusIndicatorColor} rounded-full`}></span>
            {statusText}
          </span>
        </div>
      </div>
      <div className="p-4 pt-8 border-t border-gray-200 ">
        <div className="flex justify-between items-center">
            <div className="flex space-x-2">
                <Link to= {`/view-calendar/${id}`} className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded hover:bg-gray-200" >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M4.1543 1C4.1543 0.447715 4.60201 0 5.1543 0H17.6163C18.2486 0 18.855 0.251171 19.302 0.698257C19.7491 1.14534 20.0003 1.75172 20.0003 2.384V14.846C20.0003 15.3983 19.5526 15.846 19.0003 15.846C18.448 15.846 18.0003 15.3983 18.0003 14.846V2.384C18.0003 2.28216 17.9598 2.18449 17.8878 2.11247C17.8158 2.04046 17.7181 2 17.6163 2H5.1543C4.60201 2 4.1543 1.55228 4.1543 1Z" fill="currentColor"></path>
                        <path fillRule="evenodd" clipRule="evenodd" d="M0 5C0 4.44772 0.447715 4 1 4H15C15.5523 4 16 4.44772 16 5V19C16 19.5523 15.5523 20 15 20H1C0.447715 20 0 19.5523 0 19V5ZM2 6V18H14V6H2Z" fill="currentColor"></path>
                    </svg>
                    View Calendar
                </Link>
            </div>
            </div>
      </div>
    </div>
  );
};

export default CalendarCard;
