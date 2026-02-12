"use client";

/**
 * Contact Page Client Component
 * 
 * ACCEPTANCE CRITERIA:
 * - Contact form visible above-the-fold on mobile without scrolling
 * - WhatsApp button prominent for instant contact
 * - Prefill from portfolio links (?project=slug&service=type)
 * - Trust panel visible alongside form
 * - Success state with next steps + calendar booking link
 * 
 * ANALYTICS HOOKS:
 * - onSubmitLead: Track form submissions
 * - onWhatsAppClick: Track instant contact clicks
 * - onCalendlyClick: Track calendar booking clicks
 */

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// Service options with routing tags
const services = [
  { value: "sports", label: "Sports Coverage", tag: "booking" },
  { value: "concerts", label: "Concert & Events", tag: "booking" },
  { value: "weddings", label: "Wedding Coverage", tag: "booking" },
  { value: "portraits", label: "Photo Sessions", tag: "booking" },
  { value: "corporate", label: "Corporate Events", tag: "commercial" },
  { value: "brand", label: "Brand / Commercial", tag: "commercial" },
  { value: "press", label: "Press Inquiry", tag: "press" },
  { value: "other", label: "Something Else", tag: "booking" },
];

// Client logos for trust panel
const clientLogos = [
  { name: "Wisła Kraków", src: "/clients/wisla-krakow.png" },
  { name: "Tauron Arena", src: "/clients/tauron-arena.png" },
  { name: "TechFlow", src: "/clients/techflow.png" },
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  preferredDate: string;
  message: string;
  // Hidden fields for analytics
  source: string;
  projectSlug: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  projectType?: string;
}

export default function ContactPageClient() {
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Form data with localStorage persistence
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    projectType: "",
    preferredDate: "",
    message: "",
    source: "",
    projectSlug: "",
  });

  // Prefill from URL params (from portfolio "Book this style" links)
  useEffect(() => {
    const project = searchParams.get("project");
    const service = searchParams.get("service");
    const from = searchParams.get("from");

    if (project || service) {
      setFormData(prev => ({
        ...prev,
        projectType: service || prev.projectType,
        projectSlug: project || "",
        source: from || "portfolio",
        message: project 
          ? `I'm interested in a project similar to "${project.replace(/-/g, " ")}".`
          : prev.message,
      }));
    }

    // Restore from localStorage if available
    const saved = localStorage.getItem("contactFormDraft");
    if (saved && !project) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        // Ignore invalid JSON
      }
    }
  }, [searchParams]);

  // Persist form data to localStorage
  useEffect(() => {
    if (formData.name || formData.email || formData.message) {
      localStorage.setItem("contactFormDraft", JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        projectType: formData.projectType,
        message: formData.message,
      }));
    }
  }, [formData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Please enter your name";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.projectType) {
      newErrors.projectType = "Please select a service type";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Focus first error field
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        document.getElementById(firstError)?.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      // Analytics: Track successful submission
      // analytics.track("contact_submitted", { service: formData.projectType });

      // Clear localStorage draft
      localStorage.removeItem("contactFormDraft");
      
      setIsSubmitted(true);
    } catch (error) {
      // Show error to user - don't fake success!
      setErrors({
        name: "Something went wrong. Please try WhatsApp or email us directly at aj247studios@gmail.com",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppClick = () => {
    // Analytics: Track WhatsApp click
    // analytics.track("whatsapp_click", { page: "contact" });
    const message = encodeURIComponent(
      formData.projectType 
        ? `Hi! I'm interested in ${services.find(s => s.value === formData.projectType)?.label || "your services"}.`
        : "Hi! I'd like to discuss a photo/video project."
    );
    window.open(`https://wa.me/48503685377?text=${message}`, "_blank");
  };

  // Success state
  if (isSubmitted) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Request Received!
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            Thanks, {formData.name.split(" ")[0]}! We&apos;ll get back to you within 2 hours during business hours.
          </p>

          {/* Next steps */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 mb-6 text-left">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4">What happens next?</h2>
            <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <span>We&apos;ll review your request and prepare a personalized quote</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <span>You&apos;ll receive an email with pricing and availability</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <span>Schedule a quick call to finalize details (optional)</span>
              </li>
            </ol>
          </div>

          {/* Quick actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://calendly.com/aj247studios/consultation"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Schedule a Call Now
            </a>
            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Browse Portfolio
            </Link>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-8">
            Need faster response?{" "}
            <button onClick={handleWhatsAppClick} className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
              Message us on WhatsApp
            </button>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* Hero - Minimal, goal-focused */}
      <section className="pt-8 sm:pt-12 pb-6 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
              Book a Shoot
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Get a personalized quote within 2 hours. No commitment required.
            </p>
          </div>
        </div>
      </section>

      {/* Main content - Form visible above fold */}
      <section className="py-6 sm:py-8 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Form Column - Primary focus */}
            <div className="lg:col-span-3 order-1">
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800"
                noValidate
              >
                {/* Form fields - Minimal: 5 fields max visible initially */}
                <div className="space-y-5">
                  {/* Name & Email - Required */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-900 dark:text-white mb-1.5">
                        Your name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        autoComplete="name"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "name-error" : undefined}
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.name 
                            ? "border-red-500 focus:ring-red-500" 
                            : "border-slate-200 dark:border-slate-700 focus:ring-blue-500"
                        } bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:border-transparent transition-colors`}
                        placeholder="Jan Kowalski"
                      />
                      {errors.name && (
                        <p id="name-error" className="mt-1 text-sm text-red-500" role="alert">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-900 dark:text-white mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        autoComplete="email"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.email 
                            ? "border-red-500 focus:ring-red-500" 
                            : "border-slate-200 dark:border-slate-700 focus:ring-blue-500"
                        } bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:border-transparent transition-colors`}
                        placeholder="jan@example.com"
                      />
                      {errors.email && (
                        <p id="email-error" className="mt-1 text-sm text-red-500" role="alert">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Project Type - Required */}
                  <div>
                    <label htmlFor="projectType" className="block text-sm font-medium text-slate-900 dark:text-white mb-1.5">
                      What do you need? <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="projectType"
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleInputChange}
                      aria-invalid={!!errors.projectType}
                      aria-describedby={errors.projectType ? "projectType-error" : undefined}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.projectType 
                          ? "border-red-500 focus:ring-red-500" 
                          : "border-slate-200 dark:border-slate-700 focus:ring-blue-500"
                      } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:border-transparent transition-colors`}
                    >
                      <option value="">Select a service</option>
                      {services.map((service) => (
                        <option key={service.value} value={service.value}>
                          {service.label}
                        </option>
                      ))}
                    </select>
                    {errors.projectType && (
                      <p id="projectType-error" className="mt-1 text-sm text-red-500" role="alert">
                        {errors.projectType}
                      </p>
                    )}
                  </div>

                  {/* Phone & Date - Optional */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-900 dark:text-white mb-1.5">
                        Phone <span className="text-slate-400 font-normal">(optional)</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        autoComplete="tel"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="+48 123 456 789"
                      />
                    </div>
                    <div>
                      <label htmlFor="preferredDate" className="block text-sm font-medium text-slate-900 dark:text-white mb-1.5">
                        Event date <span className="text-slate-400 font-normal">(optional)</span>
                      </label>
                      <input
                        type="date"
                        id="preferredDate"
                        name="preferredDate"
                        value={formData.preferredDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>

                  {/* Message - Optional but helpful */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-900 dark:text-white mb-1.5">
                      Tell us more <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                      placeholder="Location, number of guests, special requests..."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-4 text-base font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      "Get Your Free Quote"
                    )}
                  </button>
                </div>

                {/* Privacy note */}
                <p className="mt-4 text-xs text-center text-slate-500 dark:text-slate-400">
                  We&apos;ll only use your info to respond to your request.{" "}
                  <Link href="/privacy" className="underline hover:text-slate-700 dark:hover:text-slate-300">
                    Privacy Policy
                  </Link>
                </p>
              </form>
            </div>

            {/* Sidebar - Trust & Alt Contact */}
            <div className="lg:col-span-2 order-2 space-y-5">
              {/* WhatsApp CTA - Primary alternative */}
              <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-900 dark:text-emerald-300">
                      Need a faster response?
                    </p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">
                      Message us on WhatsApp
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleWhatsAppClick}
                  className="w-full px-4 py-3 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Chat on WhatsApp
                </button>
              </div>

              {/* Contact methods */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                  Other ways to reach us
                </h3>
                <div className="space-y-3">
                  <a
                    href="tel:+48503685377"
                    className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Call us</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">+48 503 685 377</p>
                    </div>
                  </a>
                  <a
                    href="mailto:aj247studios@gmail.com"
                    className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Email us</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">aj247studios@gmail.com</p>
                    </div>
                  </a>
                </div>
              </div>

              

              {/* Trust badges - Testimonial */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                  Trusted by
                </p>
                <div className="relative">
                  {/* Quote mark */}
                  <div className="absolute top-0 right-0 text-slate-200 dark:text-slate-700">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>

                  {/* Rating stars */}
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <blockquote className="text-sm text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                    &ldquo;We had the opportunity to work with AJ247 Studios on several sports projects, and I&apos;m fully satisfied with the results. With every video, I could see clear progress, and the final outcomes were excellent. These young talents are doing a great job.&rdquo;
                  </blockquote>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-semibold text-xs">
                      D
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white text-sm">
                        Dima
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs">
                        FCA Krakow, Poland
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Response guarantee */}
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <span className="font-semibold">2-hour response</span> during business hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-40">
        <div className="flex gap-3">
          <button
            onClick={handleWhatsAppClick}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-emerald-600 rounded-xl"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </button>
          <a
            href="tel:+48503685377"
            className="flex items-center justify-center px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Spacer for mobile sticky CTA */}
      <div className="lg:hidden h-20" />
    </main>
  );
}
