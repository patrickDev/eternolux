"use client";

import React from 'react';
import Navbar from "@/app/(components)/Navbar";
import Footer from "@/app/(components)/Footer";
import Header from '../(components)/Header';
import { Facebook, Instagram, X } from "lucide-react";

const Contact = () => {
  return (
    <div className='w-full bg-white text-black'>
      <Navbar />
      <Header name="Contact" />
      <section className="w-full py-12 mt-24">
        <div className="container mx-auto px-4 lg:px-8 mb-24">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-black">Contact Us</h1>
            <p className="mt-2 text-black">
              Our team is here to help! Reach out to us through any of the methods below.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* X */}
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <h2 className="text-2xl font-semibold mt-4 text-black">X</h2>
              <p className="mt-2 text-black">
                Message us on X, and someone from our Customer Delight team will respond.
              </p>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition"
              >
                Visit X
              </a>
            </div>

            {/* Email Us */}
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <h2 className="text-2xl font-semibold mt-4 text-black">Email Us</h2>
              <p className="mt-2 text-black">Send us an email at:</p>
              <a
                href="mailto:support@eternolux.com"
                className="text-black font-medium mt-2 block"
              >
                support@eternolux.com
              </a>
            </div>

            {/* Text with Us */}
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <h2 className="text-2xl font-semibold mt-4 text-black">Text with Us</h2>
              <p className="mt-2 text-black">
                Sign up to text with our Customer Delight team Monday through Friday (9-5 CST).
              </p>
              <button className="mt-4 bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition">
                Sign Up
              </button>
            </div>

            {/* Instagram */}
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <Instagram className="mx-auto text-black" size={48} />
              <h2 className="text-2xl font-semibold mt-4 text-black">Instagram</h2>
              <p className="mt-2 text-black">
                DM us on Instagram, and someone from our Customer Delight team will respond.
              </p>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition"
              >
                Visit Instagram
              </a>
            </div>

            {/* Facebook */}
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <Facebook className="mx-auto text-black" size={48} />
              <h2 className="text-2xl font-semibold mt-4 text-black">Facebook</h2>
              <p className="mt-2 text-black">
                Message us on Facebook, and someone from our Customer Delight team will respond.
              </p>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition"
              >
                Visit Facebook
              </a>
            </div>

            {/* Phone */}
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <h2 className="text-2xl font-semibold mt-4 text-black">Call Us</h2>
              <p className="mt-2 text-black">Give us a ring at:</p>
              <a
                href="tel:xxx xxx xxxx"
                className="text-black font-medium mt-2 block"
              >
                (xxx) xxx xxxx
              </a>
              <p className="mt-2 text-black">to hear all messaging options.</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Contact;
