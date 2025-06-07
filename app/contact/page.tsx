"use client";

import React, { useState } from "react";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from "react-icons/fa";

// 假数据：联系信息
const contactInfo = {
  address: "123 Shopping Avenue, Business District, New York, NY 10001",
  phone: "+1 (555) 123-4567",
  email: "support@onlineshop.com",
  hours: [
    "Monday - Friday: 9:00 AM - 6:00 PM",
    "Saturday: 10:00 AM - 4:00 PM",
    "Sunday: Closed",
  ],
  socialMedia: {
    facebook: "https://facebook.com/onlineshop",
    twitter: "https://twitter.com/onlineshop",
    instagram: "https://instagram.com/onlineshop",
  },
};

// 假数据：FAQs
const faqs = [
  {
    question: "How can I track my order?",
    answer:
      "You can track your order by logging into your account and viewing your order history. Each order will have a tracking number once it has been shipped.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 30-day return policy for most items. Products must be returned in their original condition and packaging. Please see our Returns & Refunds page for more details.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location. You can see the shipping options during checkout.",
  },
  {
    question: "How can I change or cancel my order?",
    answer:
      "If you need to change or cancel your order, please contact our customer service team as soon as possible. We can only make changes if the order has not yet been processed for shipping.",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [formStatus, setFormStatus] = useState<{
    submitted: boolean;
    success: boolean;
    message: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setFormStatus({
      submitted: true,
      success: true,
      message:
        "Thank you for your message! Our team will get back to you soon.",
    });

    // Reset form after submission
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });

    // Clear success message after 5 seconds
    setTimeout(() => {
      setFormStatus(null);
    }, 5000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Contact Us</h1>

      {/* Contact Information Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div>
          <h2 className="text-2xl font-semibold mb-6">Get In Touch</h2>
          <p className="text-gray-600 mb-8">
            Have questions about our products or services? Our team is here to
            help. Fill out the form and we&apos;ll get back to you as soon as
            possible.
          </p>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="mr-4 mt-1 text-gray-800">
                <FaMapMarkerAlt size={20} />
              </div>
              <p className="text-gray-700">{contactInfo.address}</p>
            </div>

            <div className="flex items-center">
              <div className="mr-4 text-gray-800">
                <FaPhone size={20} />
              </div>
              <p className="text-gray-700">{contactInfo.phone}</p>
            </div>

            <div className="flex items-center">
              <div className="mr-4 text-gray-800">
                <FaEnvelope size={20} />
              </div>
              <p className="text-gray-700">{contactInfo.email}</p>
            </div>

            <div className="flex items-start">
              <div className="mr-4 mt-1 text-gray-800">
                <FaClock size={20} />
              </div>
              <div>
                <p className="text-gray-700 font-medium mb-1">Business Hours</p>
                {contactInfo.hours.map((hour, index) => (
                  <p key={index} className="text-gray-600 text-sm">
                    {hour}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">Send Us a Message</h2>

          {formStatus && (
            <div
              className={`mb-6 p-4 rounded ${
                formStatus.success
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {formStatus.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
            </div>

            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Frequently Asked Questions
        </h2>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-6 border-b pb-6 last:border-b-0">
              <h3 className="text-lg font-medium mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Map Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-6 text-center">Find Us</h2>

        <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
          <p className="text-gray-500 text-lg">Map Would Be Displayed Here</p>
        </div>
      </div>
    </div>
  );
}
