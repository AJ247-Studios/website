"use client";

/**
 * Contact Page - WhatsApp Focused
 * 
 * Primary: WhatsApp button
 * Secondary: Email option
 * No form submission
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const services = [
  { value: "sports", label: "Sports Coverage" },
  { value: "concerts", label: "Concert & Events" },
  { value: "weddings", label: "Wedding Coverage" },
  { value: "portraits", label: "Photo Sessions" },
  { value: "corporate", label: "Corporate Events" },
  { value: "brand", label: "Brand / Commercial" },
  { value: "press", label: "Press Inquiry" },
  { value: "other", label: "Something Else" },
];

export default function ContactPageClient() {
  const searchParams = useSearchParams();
  const [selectedService, setSelectedService] = useState("");

  useEffect(() => {
    const service = searchParams.get("service");
    if (service) {
      setSelectedService(service);
    }
  }, [searchParams]);

  const handleWhatsAppClick = () => {
    const message = selectedService
      ? `Hi! I'm interested in ${services.find(s => s.value === selectedService)?.label || "your services"}.`
      : "Hi! I'd like to discuss a photo/video project.";
    window.open(`https://wa.me/48503685377?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleEmailClick = () => {
    const subject = selectedService
      ? `Inquiry: ${services.find(s => s.value === selectedService)?.label}`
      : "Photo/Video Project Inquiry";
    const body = selectedService
      ? `Hi AJ247 Studios,\n\nI'm interested in ${services.find(s => s.value === selectedService)?.label}. Here's a bit about what I need:\n\n`
      : "Hi AJ247 Studios,\n\nI'd like to discuss a photo/video project. Here's a bit about what I need:\n\n";
    window.location.href = `mailto:aj247studios@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <main>
      {/* Hero */}
      <section className="pt-8 sm:pt-12 pb-6 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Get in Touch
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            We'd love to hear about your project. Reach out anytime.
          </p>
        </div>
      </section>

      {/* Main Contact Options */}
      <section className="py-8 sm:py-12 bg-white dark:bg-slate-950">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Service selector (optional) */}
          <div className="mb-8">
            <label htmlFor="service" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              What are you looking for? <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <select
              id="service"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="">Select a service (helps us prepare)</option>
              {services.map((service) => (
                <option key={service.value} value={service.value}>
                  {service.label}
                </option>
              ))}
            </select>
          </div>

          {/* Primary: WhatsApp */}
          <button
            onClick={handleWhatsAppClick}
            className="w-full flex items-center justify-center gap-3 px-6 py-5 text-lg font-semibold text-white bg-emerald-600 rounded-2xl hover:bg-emerald-700 transition-colors mb-4"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chat on WhatsApp
          </button>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-8">
            Usually replies within 2 hours during business hours
          </p>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
            <span className="text-sm text-slate-400">or</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
          </div>

          {/* Secondary: Email */}
          <button
            onClick={handleEmailClick}
            className="w-full flex items-center justify-center gap-3 px-6 py-5 text-lg font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Send an Email
          </button>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">
            aj247studios@gmail.com
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-8 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Phone</h3>
              <a href="tel:+48503685377" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600">
                +48 503 685 377
              </a>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Location</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Kraków, Poland</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Hours</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Mon - Sun: 9am - 7pm</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-40">
        <button
          onClick={handleWhatsAppClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-emerald-600 rounded-xl"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </button>
      </div>

      {/* Spacer for mobile sticky CTA */}
      <div className="lg:hidden h-20" />
    </main>
  );
}
