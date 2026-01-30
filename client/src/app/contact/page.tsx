"use client";

import React from 'react';
import Navbar from "@/app/(components)/Navbar";
import Footer from "@/app/(components)/Footer";
import { Mail, Phone, MapPin, MessageSquare, Instagram, Facebook, Twitter, Bell } from "lucide-react";

const Contact = () => {
  return (
    <div className='min-h-screen bg-[#F9F8F6] text-black font-sans'>
      <Navbar />
      
      <main className="pt-48 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Header Section */}
          <div className="mb-16 border-b border-gray-100 pb-10">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-2 block">
              EternoLux Concierge
            </span>
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
              Get In <br /> <span className="text-gray-400">Touch</span>
            </h1>
            <p className="mt-6 text-sm font-bold text-gray-500 uppercase tracking-widest max-w-xl">
              Our team is dedicated to providing an exceptional fragrance experience. Whether you seek guidance on a signature scent or need order assistance, the EternoLux circle is here for you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 1. OFFICIAL MAILING ADDRESS */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm flex flex-col items-center text-center">
               <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
                  <MapPin className="text-red-600" size={32} />
               </div>
               <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-4 leading-none">Mailing <br/> Address</h2>
               <p className="text-sm font-bold text-black leading-relaxed uppercase tracking-tight">
                  830 North Blvd #2083 <br />
                  Universal City, TX 78148
               </p>
               <div className="mt-8 pt-8 border-t border-gray-50 w-full">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Digital Inquiry</p>
                  <a href="mailto:support@eternolux.com" className="text-sm font-black hover:text-red-600 transition">
                     support@eternolux.com
                  </a>
               </div>
            </div>

            {/* 2. CONCIERGE CHANNELS */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm flex flex-col justify-center gap-10">
               <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                    <Phone size={20} className="text-black" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Voice Support</p>
                     <p className="text-lg font-black italic leading-tight">Mon–Fri, 9am–5pm CST</p>
                     <a href="tel:1234567890" className="text-xs font-bold text-gray-400 hover:text-black transition tracking-tighter">(123) 456-7890</a>
                  </div>
               </div>
               <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                    <MessageSquare size={20} className="text-black" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">SMS Concierge</p>
                     <p className="text-lg font-black italic leading-tight">Real-time Assistance</p>
                     <button className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:underline transition">Enroll in Text Alerts</button>
                  </div>
               </div>
               <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                    <Bell size={20} className="text-black" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Order Updates</p>
                     <p className="text-lg font-black italic leading-tight">Flash Sale Notifications</p>
                  </div>
               </div>
            </div>

            {/* 3. SOCIAL CONNECTION (ENHANCED) */}
            <div className="bg-black text-white rounded-[2.5rem] p-10 flex flex-col shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2 leading-none">The Digital <br/> <span className="text-gray-500">Atelier</span></h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-8">Follow the Circle</p>
                  
                  <div className="space-y-6">
                     {/* Instagram */}
                     <a href="#" className="flex items-center gap-4 group">
                        <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                           <Instagram size={18} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest group-hover:text-red-600 transition">Instagram</p>
                           <p className="text-[10px] text-gray-500 font-bold leading-tight">Visual scented stories and behind-the-scenes artistry.</p>
                        </div>
                     </a>

                     {/* X.com */}
                     <a href="#" className="flex items-center gap-4 group">
                        <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all font-black italic">
                           X
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest group-hover:text-red-600 transition">X / Twitter</p>
                           <p className="text-[10px] text-gray-500 font-bold leading-tight">Real-time drop alerts and limited-time flash sale access.</p>
                        </div>
                     </a>

                     {/* Facebook */}
                     <a href="#" className="flex items-center gap-4 group">
                        <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                           <Facebook size={18} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest group-hover:text-red-600 transition">Facebook</p>
                           <p className="text-[10px] text-gray-500 font-bold leading-tight">Community reviews and long-form fragrance guides.</p>
                        </div>
                     </a>
                  </div>
               </div>
               
               {/* Decorative Background Text */}
               <div className="absolute -bottom-8 -right-4 text-[120px] font-black italic text-white/5 pointer-events-none uppercase leading-none">
                  Lux
               </div>
            </div>

          </div>

        
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;