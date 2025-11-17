"use client";

import React from "react";
import { Facebook, Instagram, X } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-white text-black py-8">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        {/* Quick Links Section */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
          <ul>
            <li className="mb-2">
              <a href="/shop" className="text-sm hover:underline">
                Shop
              </a>
            </li>
            <li className="mb-2">
              <a href="/contact" className="text-sm hover:underline">
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Stay Connected Section */}
        <div className="flex flex-col items-center">
          <h4 className="text-lg font-semibold mb-4">Stay Connected</h4>
          <p className="text-sm mb-4 text-center">
            Follow us on social media for updates, promotions, and more.
          </p>
          <div className="flex space-x-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <Facebook className="text-black hover:text-gray-600" size={24} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <Instagram className="text-black hover:text-gray-600" size={24} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              aria-label="X"
            >
              <X className="text-black hover:text-gray-600" size={24} />
            </a>
          </div>
        </div>

        {/* Newsletter Section */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
          <p className="text-sm mb-4">
            Subscribe to our newsletter to get the latest updates and offers!
          </p>
          <form className="flex items-center space-x-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 text-sm text-black rounded-md border border-gray-300"
            />
            <button
              type="submit"
              className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-8 text-center pt-4">
        <p className="text-xs text-gray-500">
          &copy; {new Date().getFullYear()} EternoLux - All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
