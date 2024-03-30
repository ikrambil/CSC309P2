import React, { useState, useEffect } from 'react';


const ContactDropdown = ({ contacts, selectedContacts, onSelectedContactsChange }) => {
  // Handle contact selection changes
  const handleSelectContact = (contactId, isChecked) => {
      const newSelectedContacts = isChecked
          ? [...selectedContacts, contactId]
          : selectedContacts.filter(id => id !== contactId);
      onSelectedContactsChange(newSelectedContacts);
  };

  // Render contacts
  return (
      <div className="w-full flex-col justify-center p-4">
          {contacts.map((contact) => (
              <div key={contact.id} className="flex items-center mb-4">
                  <div className="flex items-center h-5">
                      <input
                          id={`helper-checkbox-${contact.id}`}
                          type="checkbox"
                          checked={selectedContacts.includes(contact.id)}
                          onChange={(e) => handleSelectContact(contact.id, e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                  </div>
                  <div className="ml-3 text-sm">
                      <label htmlFor={`helper-checkbox-${contact.id}`} className="font-medium text-gray-900">{contact.name}</label>
                      <p className="text-xs font-normal text-gray-500">{contact.email}</p>
                  </div>
              </div>
          ))}
      </div>
  );
};

export default ContactDropdown;