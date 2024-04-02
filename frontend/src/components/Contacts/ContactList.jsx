import ContactCard from "./ContactCard";
import React from 'react';

const ContactsList = ({contacts, onDelete}) => {

  return (
    <div className="flex flex-col align-center justify-center p-8">
      <ul className="w-full divide-y divide-gray-200">
        {contacts.map((contact) => (
          <ContactCard
            key={contact.id}
            name={contact.name}
            email={contact.email}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  );
};

export default ContactsList;