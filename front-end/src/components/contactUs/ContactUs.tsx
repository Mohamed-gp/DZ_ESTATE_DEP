import React from "react";

const ContactUs: React.FC = () => {
  return (
    <div className="contact-us container mx-auto my-14 py-12 rounded-lg bg-white p-6 text-center shadow-lg">
      <h2 className="mb-4 text-3xl font-bold" style={{ color: "#1563DF" }}>
        Contact Us
      </h2>
      <p className="mb-4 text-gray-700">
        Thank you for your interest in our app. If you have any questions or
        need further information, please feel free to contact us.
      </p>
      <p className="font-bold text-gray-700">
        Email:{" "}
        <a
          href="mailto:estin@estin.dz"
          className="text-blue-600 hover:underline"
        >
          estin@estin.dz
        </a>
      </p>
    </div>
  );
};

export default ContactUs;
