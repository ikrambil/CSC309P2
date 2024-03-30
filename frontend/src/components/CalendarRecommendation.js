import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';
import 'flowbite';
import { ScheduleComponent, Inject, ViewsDirective, ViewDirective, Day, Week, Year, Month, Agenda } from '@syncfusion/ej2-react-schedule';
import { registerLicense } from '@syncfusion/ej2-base';

registerLicense('Ngo9BigBOggjHTQxAR8/V1NBaF5cXmZCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdnWXxdcHRWRWBZUkR1WkA=');

const optionsData = {
    option1: [
        {
            Id: 1,
            Subject: "Peter Parker",
            StartTime: new Date(2024, 2, 29, 10, 0),
            EndTime: new Date(2024, 2, 29, 11, 0),
            IsAllDay: false,
        },
        {
            Id: 2,
            Subject: "Marry Jane Watson",
            StartTime: new Date(2024, 2, 31, 13, 0),
            EndTime: new Date(2024, 2, 31, 15, 30),
            IsAllDay: false,
        },
        {
            Id: 3,
            Subject: "Norman Osborn",
            StartTime: new Date(2024, 3, 1, 10, 0),
            EndTime: new Date(2024, 3, 1, 11, 0),
            IsAllDay: false,
        },
    ],
    option2: [
        {
            Id: 1,
            Subject: "Peter Parker",
            StartTime: new Date(2024, 2, 27, 9, 30),
            EndTime: new Date(2024, 2, 27, 11, 0),
            IsAllDay: false,
        },
        {
            Id: 2,
            Subject: "Marry Jane Watson",
            StartTime: new Date(2024, 2, 31, 13, 0),
            EndTime: new Date(2024, 2, 31, 15, 30),
            IsAllDay: false,
        },
        {
            Id: 3,
            Subject: "Norman Osborn",
            StartTime: new Date(2024, 2, 28, 10, 0),
            EndTime: new Date(2024, 2, 28, 11, 0),
            IsAllDay: false,
        },
    ],
    option3: [
        {
            Id: 1,
            Subject: "Peter Parker",
            StartTime: new Date(2024, 2, 29, 10, 0),
            EndTime: new Date(2024, 2, 29, 11, 0),
            IsAllDay: false,
        },
        {
            Id: 2,
            Subject: "Marry Jane Watson",
            StartTime: new Date(2024, 2, 30, 13, 0),
            EndTime: new Date(2024, 2, 30, 15, 30),
            IsAllDay: false,
        },
        {
            Id: 3,
            Subject: "Norman Osborn",
            StartTime: new Date(2024, 3, 1, 10, 0),
            EndTime: new Date(2024, 3, 1, 11, 0),
            IsAllDay: false,
        },
    ],
};

function CalendarRecommendation() {
    /*const [recommendedCalendars, setRecommendedCalendars] = useState([]);
    const [selectedOption, setSelectedOption] = useState(0);
    const navigate = useNavigate();
    const calendarId = 1; // Replace this with the actual calendar ID

    useEffect(() => {
        axios.get(`/calendars/${calendarId}/recommendations/`)
            .then(response => {
                setRecommendedCalendars(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the recommended calendars:', error);
            });
    }, [calendarId]);

    const finalizeCalendar = () => {
        if (recommendedCalendars.length > 0 && selectedOption < recommendedCalendars.length) {
            navigate('/finalized-calendar', { state: { data: recommendedCalendars[selectedOption] } });
        }
    };*/

    const [selectedOption, setSelectedOption] = useState('option1');
    const navigate = useNavigate();

    const finalizeCalendar = () => {
        navigate('/finalizedCalendar', { state: { data: optionsData[selectedOption] } });
    };

    const getButtonClass = (option) => {
        return selectedOption === option ? 'bg-blue-700 text-white' : 'bg-gray-200 text-black';
    };

    return (
        <>
            <Sidebar />
            <div className='p-8 sm:ml-64'>
                <div class="text-left w-full border-b p-4 flex justify-between mb-4 items-center">
                <h1 className="text-2xl md:text-4xl">Calendar Name</h1>
                    <span class="inline-flex align-middle items-center bg-yellow-100 text-yellow-800 text-xs font-medium ml-2.5 px-2.5 py-0.5 rounded-full">
                    <span class="w-2 h-2 me-1 bg-yellow-500 rounded-full"></span>
                    Waiting to Finalize
                    </span>
                </div>
                <div className="flex justify-center mb-4">
                    <button className={`mr-2 p-2 rounded ${getButtonClass('option1')}`} onClick={() => setSelectedOption('option1')}>Option 1</button>
                    <button className={`mr-2 p-2 rounded ${getButtonClass('option2')}`} onClick={() => setSelectedOption('option2')}>Option 2</button>
                    <button className={`p-2 rounded ${getButtonClass('option3')}`} onClick={() => setSelectedOption('option3')}>Option 3</button>
                </div>
                <ScheduleComponent eventSettings={{
                    dataSource: optionsData[selectedOption],
                }}
                currentView='Month'>
                    <ViewsDirective>
                        <ViewDirective option="Day" />
                        <ViewDirective option="Week" />
                        <ViewDirective option="Month" />
                        <ViewDirective option="Year" />
                        <ViewDirective option="Agenda" />
                    </ViewsDirective>

                    <Inject services={[Day, Week, Month, Year, Agenda]} />

                </ScheduleComponent>
                <div className="flex justify-center">
                    <button className="mt-4 p-2 rounded bg-blue-700 text-white" onClick={finalizeCalendar}>Finalize</button>
                </div>

            {/* <div className="flex justify-center mb-4">
                {recommendedCalendars.map((option, index) => (
                    <button
                        key={index}
                        className={`mr-2 p-2 rounded ${selectedOption === index ? 'bg-blue-700 text-white' : 'bg-gray-200 text-black'}`}
                        onClick={() => setSelectedOption(index)}
                    >
                        Option {index + 1}
                    </button>
                ))}
            </div>
            <div className="flex justify-center">
                <button className="mt-4 p-2 rounded bg-blue-700 text-white" onClick={finalizeCalendar}>Finalize</button>
                </div> */}

            </div>
            <Footer />
        </>
    );
}

export default CalendarRecommendation;
