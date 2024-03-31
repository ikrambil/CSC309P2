import React, { useState, useEffect } from "react";
import Footer from "../Footer.js";
import ContactList from "./ContactList.jsx";
import Sidebar from "../Sidebar.js";
import { useAuth } from "../../context/AuthContext.js";
import '../../App.css';

const ContactPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // Correct initial state
  const [contacts, setContacts] = useState([]); // State to store contacts
  const [triggerFetch, setTriggerFetch] = useState(false); // State to trigger re-fetch of contacts list
  const { accessToken } = useAuth();

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch contacts when component mounts
  useEffect(() => {
    const fetchContacts = async () => {
      console.log("fetched");
      try {
        const response = await fetch(
          "https://csc309p2.onrender.com/accounts/profile/contacts/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`,
            },
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setContacts(data || []); // Set to an empty array if undefined
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    fetchContacts();
  }, [accessToken, triggerFetch]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const contactData = {
      contact_name: name,
      contact_email: email,
    };

    try {
      const response = await fetch(
        "https://csc309p2.onrender.com/accounts/profile/addcontact/",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify(contactData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        console.log("Contact added successfully");

        setName("");
        setEmail("");
        setIsModalOpen(false);
        setTriggerFetch(!triggerFetch); // Toggle triggerFetch to re-fetch contacts
      }
    } catch (error) {
      console.error("Error adding contact:", error);
    }
  };

  return (
    <>
      <Sidebar />

      <div className="p-8 sm:ml-64">
        <div className="text-4xl text-left w-full border-b p-4 flex justify-between">
          <h2 className="font-bold">Contacts:</h2>
          <button
            onClick={toggleModal}
            className="add-contact-button text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm px-4 text-center inline-flex items-center"
          >
            <p className="mr-1">Add Contacts</p>
            <svg
              className="ml-2 w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {isModalOpen && (
          <div className="overlay fixed top-0 right-0 left-0 bottom-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="relative p-4 w-full max-w-md max-h-full bg-white rounded-lg shadow">
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Contact
                </h3>
                <button
                  onClick={toggleModal}
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>
              <form className="p-5" onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {contacts.length > 0 ? (
          <ContactList contacts={contacts} />
        ) : (
          <div className="text-center p-5">
            <p>You have no contacts</p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ContactPage;

