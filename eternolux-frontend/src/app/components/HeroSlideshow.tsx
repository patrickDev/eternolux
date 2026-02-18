// src/app/components/HeroSlideshow.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  cta: string;
  ctaLink: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "New Arrivals",
    subtitle: "Spring Collection 2025",
    description: "Discover the latest luxury fragrances crafted for the modern connoisseur",
    image: "/slides/slide1.jpg",
    cta: "Shop New Arrivals",
    ctaLink: "/homebase?filter=new",
  },
  {
    id: 2,
    title: "Best Sellers",
    subtitle: "Most Loved Fragrances",
    description: "Experience our customers' favorite scents that define elegance",
    image: "/slides/slide2.jpg",
    cta: "Shop Best Sellers",
    ctaLink: "/homebase?sort=popular",
  },
  {
    id: 3,
    title: "Luxury Collection",
    subtitle: "Premium Exclusives",
    description: "Indulge in our curated selection of rare and exclusive fragrances",
    image: "/slides/slide3.jpg",
    cta: "Explore Luxury",
    ctaLink: "/homebase?filter=luxury",
  },
];

export default function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden" style={{ fontFamily: FONT }}>
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              unoptimized
              className="object-cover"
              priority={index === 0}
              onError={(e) => {
                // Fallback to gradient if image doesn't load
                (e.target as HTMLImageElement).style.display = "none";
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  parent.style.background = "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)";
                }
              }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center">
            <div className="container mx-auto px-6">
              <div className="max-w-2xl">
                <p className="text-red-400 text-sm font-black uppercase tracking-[0.3em] mb-3">
                  {slide.subtitle}
                </p>
                <h2 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                  {slide.title}
                </h2>
                <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                  {slide.description}
                </p>
                <a
                  href={slide.ctaLink}
                  className="inline-block bg-white hover:bg-red-600 text-gray-900 hover:text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-2xl hover:shadow-red-500/50 hover:scale-105"
                >
                  {slide.cta}
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} strokeWidth={3} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight size={24} strokeWidth={3} />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
