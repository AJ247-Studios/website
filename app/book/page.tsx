"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type BookingStep = "service" | "employee" | "details" | "review";

interface ServicePackage {
  id: string;
  service_type: string;
  name: string;
  description: string;
  base_price_pln: number;
  duration_hours: number | null;
  photo_count: string | null;
  video_length: string | null;
  delivery_days: number | null;
  features: string[];
}

interface Employee {
  id: string;
  display_name: string | null;
  role_title: string;
  specialty: string | null;
  avatar_url: string | null;
  packages?: (ServicePackage & { final_price_pln: number; pricing_note: string | null })[];
}

interface BookingFormData {
  serviceType: string;
  packageId: string;
  employeeId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventDate: string;
  eventLocation: string;
  eventType: string;
  notes: string;
  guestCount: string;
}

const SERVICE_TYPES = [
  {
    value: "sports",
    label: "Sports Coverage",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    description: "Dynamic action shots and highlight reels",
  },
  {
    value: "concert",
    label: "Concert & Event Coverage",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
    description: "Live music and event photography",
  },
  {
    value: "wedding",
    label: "Wedding Coverage",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    description: "Timeless wedding photography and films",
  },
  {
    value: "portrait",
    label: "Photo Sessions",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    description: "Professional portraits and headshots",
  },
  {
    value: "corporate",
    label: "Corporate Events",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    description: "Conference and corporate coverage",
  },
];

const FALLBACK_PACKAGES: Record<string, ServicePackage[]> = {
  sports: [
    { id: "sports-1", service_type: "sports", name: "Customized", description: "Essential coverage for local sports events", base_price_pln: 1499, duration_hours: 3.5, photo_count: "80-100+", video_length: "1-2 min", delivery_days: 16, features: ["3-4 hours coverage", "80-100+ edited photos", "Online gallery", "1-2 min highlight reel", "16 business day delivery"] },
    { id: "sports-2", service_type: "sports", name: "Premium", description: "Comprehensive coverage with cinematic highlights", base_price_pln: 3499, duration_hours: 5, photo_count: "150-200+", video_length: "5 min cinematic", delivery_days: 16, features: ["5+ hours coverage", "150-200+ edited photos", "Online gallery + USB", "5-min highlight film", "Second photographer", "3 social media cuts"] },
  ],
  concert: [
    { id: "concert-1", service_type: "concert", name: "Customized", description: "Professional coverage for concerts and live events", base_price_pln: 1999, duration_hours: 4, photo_count: "100-150+", video_length: "2 min", delivery_days: 16, features: ["4 hours coverage", "100-150+ edited photos", "Online gallery", "2-min highlight reel", "16 business day delivery"] },
    { id: "concert-2", service_type: "concert", name: "Premium", description: "Full cinematic production for major events", base_price_pln: 4999, duration_hours: 6, photo_count: "200-250+", video_length: "5 min cinematic", delivery_days: 16, features: ["6+ hours coverage", "200-250+ edited photos", "Online gallery + USB + prints", "5-min cinematic film", "Two photographers", "Multi-camera video", "Backstage & VIP coverage"] },
  ],
  wedding: [
    { id: "wedding-1", service_type: "wedding", name: "Customized", description: "Beautiful coverage for intimate celebrations", base_price_pln: 3499, duration_hours: 6, photo_count: "150-200+", video_length: "4-5 min highlight", delivery_days: 16, features: ["6 hours coverage", "150-200+ edited photos", "Online gallery", "4-5 min highlight film", "16 business day delivery"] },
    { id: "wedding-2", service_type: "wedding", name: "Premium", description: "Complete cinematic wedding experience", base_price_pln: 5599, duration_hours: 10, photo_count: "250-300+", video_length: "6-8 min cinematic", delivery_days: 16, features: ["Full day coverage (10+ hrs)", "250-300+ edited photos", "Online gallery + USB + album", "6-8 min cinematic film", "Second photographer included"] },
  ],
  portrait: [
    { id: "portrait-1", service_type: "portrait", name: "Mini Session", description: "Quick professional headshots", base_price_pln: 450, duration_hours: 1, photo_count: "10", video_length: null, delivery_days: 5, features: ["1 hour session", "10 edited photos", "Online gallery", "1 outfit/look", "5 business day delivery"] },
    { id: "portrait-2", service_type: "portrait", name: "Customized", description: "Comprehensive portrait session", base_price_pln: 649, duration_hours: 1.5, photo_count: "20", video_length: null, delivery_days: 3, features: ["1.5 hour session", "20 edited photos", "Online gallery", "2-3 outfits/looks", "3 business day delivery", "Location of choice"] },
    { id: "portrait-3", service_type: "portrait", name: "Premium", description: "VIP treatment with full styling consultation", base_price_pln: 949, duration_hours: 3, photo_count: "35+", video_length: null, delivery_days: 2, features: ["3 hour session", "35+ edited photos", "Online gallery + USB", "Unlimited outfits", "48-hour delivery", "Styling consultation", "Location of choice", "5 premium prints"] },
  ],
  corporate: [
    { id: "corporate-1", service_type: "corporate", name: "Half Day", description: "Conference or event coverage", base_price_pln: 1199, duration_hours: 4, photo_count: "80-100+", video_length: null, delivery_days: 16, features: ["4 hours coverage", "80-100+ edited photos", "Online gallery", "Corporate-ready edits", "16 business day delivery"] },
    { id: "corporate-2", service_type: "corporate", name: "Full Day", description: "Comprehensive corporate coverage", base_price_pln: 2199, duration_hours: 8, photo_count: "150-200+", video_length: "2 min highlight", delivery_days: 16, features: ["8 hours coverage", "150-200+ edited photos", "Online gallery + USB", "Corporate-ready edits", "2-min highlight video"] },
    { id: "corporate-3", service_type: "corporate", name: "Premium", description: "Full photo + video production", base_price_pln: 4499, duration_hours: 8, photo_count: "200-250+", video_length: "5 min cinematic", delivery_days: 16, features: ["Full day coverage", "200-250+ edited photos", "Online gallery + USB + prints", "5-min highlight film", "Multi-camera video", "Headshot station", "5 social media cuts"] },
  ],
};

// Fallback employees using actual database UUIDs
// Verified from Supabase: Josiah=1111, Anthony=2222, Ivan=3333, Tomek=4444
const JOSIAH_ID = "11111111-1111-1111-1111-111111111111";
const ANTHONY_ID = "22222222-2222-2222-2222-222222222222";
const IVAN_ID = "33333333-3333-3333-3333-333333333333";
const TOMEK_ID = "44444444-4444-4444-4444-444444444444";

const FALLBACK_EMPLOYEES: Record<string, Employee[]> = {
  sports: [
    { id: JOSIAH_ID, display_name: "Josiah Ennis", role_title: "Co-Founder / Videographer", specialty: "Sports Videography & Commercial Shoots", avatar_url: "/portfolio/Josiah-full-res.webp", packages: [] },
    { id: ANTHONY_ID, display_name: "Anthony Certeza", role_title: "Co-Founder / Photographer", specialty: "Sports Photography & Action Shots", avatar_url: "/portfolio/Anthony-full-res.webp", packages: [] },
  ],
  concert: [
    { id: JOSIAH_ID, display_name: "Josiah Ennis", role_title: "Co-Founder / Videographer", specialty: "Concert Videography & Live Events", avatar_url: "/portfolio/Josiah-full-res.webp", packages: [] },
    { id: ANTHONY_ID, display_name: "Anthony Certeza", role_title: "Co-Founder / Photographer", specialty: "Concert Photography & Press Coverage", avatar_url: "/portfolio/Anthony-full-res.webp", packages: [] },
  ],
  wedding: [
    { id: JOSIAH_ID, display_name: "Josiah Ennis", role_title: "Co-Founder / Videographer", specialty: "Wedding Films & Cinematic Coverage", avatar_url: "/portfolio/Josiah-full-res.webp", packages: [] },
    { id: ANTHONY_ID, display_name: "Anthony Certeza", role_title: "Co-Founder / Photographer", specialty: "Wedding Photography & Couples Portraits", avatar_url: "/portfolio/Anthony-full-res.webp", packages: [] },
  ],
  portrait: [
    { id: ANTHONY_ID, display_name: "Anthony Certeza", role_title: "Co-Founder / Photographer", specialty: "Portrait Photography & Headshots", avatar_url: "/portfolio/Anthony-full-res.webp", packages: [] },
    { id: TOMEK_ID, display_name: "Tomek Dudzik", role_title: "Graphic Designer / Editor", specialty: "Creative Portraits & Styled Shoots", avatar_url: "/portfolio/Tomek Dudzik.jpeg", packages: [] },
  ],
  corporate: [
    { id: JOSIAH_ID, display_name: "Josiah Ennis", role_title: "Co-Founder / Videographer", specialty: "Corporate Video & Commercial Production", avatar_url: "/portfolio/Josiah-full-res.webp", packages: [] },
    { id: ANTHONY_ID, display_name: "Anthony Certeza", role_title: "Co-Founder / Photographer", specialty: "Corporate Photography & Event Coverage", avatar_url: "/portfolio/Anthony-full-res.webp", packages: [] },
    { id: IVAN_ID, display_name: "Ivan Anthony Cabañero", role_title: "Editor", specialty: "Video Editing & Post-Production", avatar_url: "/portfolio/Ivan-full-res.jpeg", packages: [] },
  ],
};

// Merge fallback employees with fallback packages
Object.keys(FALLBACK_EMPLOYEES).forEach((serviceType) => {
  FALLBACK_EMPLOYEES[serviceType].forEach((emp) => {
    emp.packages = (FALLBACK_PACKAGES[serviceType] || []).map((pkg) => ({
      ...pkg,
      final_price_pln: pkg.base_price_pln,
      pricing_note: null,
    }));
  });
});

export default function BookPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedEmployee = searchParams.get("employee");

  const [step, setStep] = useState<BookingStep>("service");
  // Map URL slug to employee UUID
  const SLUG_TO_UUID: Record<string, string> = {
    josiah: JOSIAH_ID,
    anthony: ANTHONY_ID,
    ivan: IVAN_ID,
    tomek: TOMEK_ID,
  };

  const [formData, setFormData] = useState<BookingFormData>({
    serviceType: "",
    packageId: "",
    employeeId: preselectedEmployee ? (SLUG_TO_UUID[preselectedEmployee] || "") : "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    eventDate: "",
    eventLocation: "",
    eventType: "",
    notes: "",
    guestCount: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [employees, setEmployees] = useState<Record<string, Employee[]>>(FALLBACK_EMPLOYEES);
  const [packages, setPackages] = useState<Record<string, ServicePackage[]>>(FALLBACK_PACKAGES);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch employees and packages from API
  useEffect(() => {
    async function fetchData() {
      try {
        const empRes = await fetch("/api/employees");
        if (empRes.ok) {
          const empData = await empRes.json();
          if (empData.employees?.length > 0) {
            const grouped: Record<string, Employee[]> = {};
            empData.employees.forEach((emp: Employee) => {
              (emp.packages || []).forEach((pkg: any) => {
                if (!grouped[pkg.service_type]) grouped[pkg.service_type] = [];
                if (!grouped[pkg.service_type].find((e) => e.id === emp.id)) {
                  grouped[pkg.service_type].push(emp);
                }
              });
            });
            if (Object.keys(grouped).length > 0) {
              setEmployees(grouped);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      } finally {
        setDataLoading(false);
      }
    }

    fetchData();
  }, []);

  const selectedPackage = formData.packageId
    ? (packages[formData.serviceType] || []).find((p) => p.id === formData.packageId)
    : null;

  const selectedEmployee = formData.employeeId
    ? (employees[formData.serviceType] || []).find((e) => e.id === formData.employeeId)
    : null;

  const finalPrice = selectedEmployee?.packages?.find((p) => p.id === formData.packageId)?.final_price_pln || selectedPackage?.base_price_pln || 0;

  const updateField = useCallback(<K extends keyof BookingFormData>(field: K, value: BookingFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  }, []);

  const goToStep = useCallback((targetStep: BookingStep) => {
    setStep(targetStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleNext = useCallback(() => {
    if (step === "service" && !formData.packageId) {
      setError("Please select a package to continue");
      return;
    }
    if (step === "employee" && !formData.employeeId) {
      setError("Please select a team member to continue");
      return;
    }
    if (step === "details") {
      if (!formData.clientName.trim() || !formData.clientEmail.trim() || !formData.eventDate) {
        setError("Please fill in all required fields");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
        setError("Please enter a valid email address");
        return;
      }
    }

    const stepOrder: BookingStep[] = ["service", "employee", "details", "review"];
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex < stepOrder.length - 1) {
      goToStep(stepOrder[currentIndex + 1]);
    }
  }, [step, formData, goToStep]);

  const handleBack = useCallback(() => {
    const stepOrder: BookingStep[] = ["service", "employee", "details", "review"];
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex > 0) {
      goToStep(stepOrder[currentIndex - 1]);
    }
  }, [step, goToStep]);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        client_name: formData.clientName,
        client_email: formData.clientEmail,
        client_phone: formData.clientPhone,
        employee_id: formData.employeeId,
        package_id: formData.packageId,
        service_type: formData.serviceType,
        event_date: formData.eventDate,
        event_location: formData.eventLocation,
        event_type: formData.eventType,
        notes: formData.notes,
        guest_count: formData.guestCount,
        total_price_pln: finalPrice,
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit booking");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit booking. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [formData, finalPrice]);

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Booking Request Received!
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Thank you, <span className="font-medium text-slate-900 dark:text-white">{formData.clientName}</span>!
              We&apos;ve received your booking request and will review it within 24 hours.
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 text-left">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Booking Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Service:</span>
                  <span className="text-slate-900 dark:text-white font-medium">{selectedPackage?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Team Member:</span>
                  <span className="text-slate-900 dark:text-white font-medium">{selectedEmployee?.display_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Event Date:</span>
                  <span className="text-slate-900 dark:text-white font-medium">{formData.eventDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Estimated Total:</span>
                  <span className="text-slate-900 dark:text-white font-medium">{finalPrice.toLocaleString()} PLN</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              We&apos;ll send a confirmation email to <span className="font-medium">{formData.clientEmail}</span> with next steps.
              A 30% deposit will be arranged once your booking is confirmed.
            </p>

            <Link
              href="/"
              className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="AJ247 Studios" width={32} height={32} className="w-8 h-8 object-contain" />
              <span className="font-semibold text-slate-900 dark:text-white">Book Us</span>
            </Link>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Step {["service", "employee", "details", "review"].indexOf(step) + 1} of 4
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            {(["service", "employee", "details", "review"] as BookingStep[]).map((s, idx) => {
              const currentIdx = ["service", "employee", "details", "review"].indexOf(step);
              const isCompleted = idx < currentIdx;
              const isActive = idx === currentIdx;
              return (
                <div key={s} className="flex-1">
                  <div className={`h-2 rounded-full transition-colors ${isCompleted ? "bg-emerald-500" : isActive ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-700"}`} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {step === "service" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Choose Your Service</h1>
              <p className="text-slate-600 dark:text-slate-400">Select the type of coverage you need for your event.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {SERVICE_TYPES.map((service) => (
                <button
                  key={service.value}
                  onClick={() => {
                    updateField("serviceType", service.value);
                    updateField("packageId", "");
                    updateField("employeeId", preselectedEmployee ? `emp-${preselectedEmployee}` : "");
                  }}
                  className={`text-left p-5 rounded-xl border-2 transition-all ${formData.serviceType === service.value ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"}`}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-3">
                    {service.icon}
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{service.label}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{service.description}</p>
                </button>
              ))}
            </div>
            {formData.serviceType && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Select a Package</h2>
                <div className="space-y-4">
                  {(packages[formData.serviceType] || []).map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => updateField("packageId", pkg.id)}
                      className={`w-full text-left p-5 rounded-xl border-2 transition-all ${formData.packageId === pkg.id ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">{pkg.name}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{pkg.description}</p>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <div className="text-xl font-bold text-slate-900 dark:text-white">{pkg.base_price_pln.toLocaleString()} <span className="text-sm font-normal">PLN</span></div>
                          {pkg.duration_hours && <div className="text-sm text-slate-500 dark:text-slate-400">{pkg.duration_hours} hrs</div>}
                        </div>
                      </div>
                      <ul className="grid grid-cols-2 gap-1 text-sm">
                        {pkg.features.slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                            <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <span className="truncate">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === "employee" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Choose Your Team Member</h1>
              <p className="text-slate-600 dark:text-slate-400">Select the photographer, videographer, or editor you want to work with. Pricing may vary by team member.</p>
            </div>
            {dataLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">Loading team members...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(employees[formData.serviceType] || []).map((emp) => {
                  const empPackage = emp.packages?.find((p) => p.id === formData.packageId);
                  const price = empPackage?.final_price_pln || selectedPackage?.base_price_pln || 0;
                  const basePrice = selectedPackage?.base_price_pln || 0;
                  const priceDiff = price - basePrice;
                  return (
                    <button
                      key={emp.id}
                      onClick={() => updateField("employeeId", emp.id)}
                      className={`w-full text-left p-5 rounded-xl border-2 transition-all ${formData.employeeId === emp.id ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                          {emp.avatar_url ? (
                            <Image src={emp.avatar_url} alt={emp.display_name || ""} width={64} height={64} className="w-16 h-16 object-cover" />
                          ) : (
                            <div className="w-16 h-16 flex items-center justify-center text-xl font-bold text-slate-400">{(emp.display_name || "?").charAt(0)}</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-slate-900 dark:text-white">{emp.display_name}</h3>
                              <p className="text-sm text-blue-600 dark:text-blue-400">{emp.role_title}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{emp.specialty}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-lg font-bold text-slate-900 dark:text-white">{price.toLocaleString()} <span className="text-sm font-normal">PLN</span></div>
                              {priceDiff !== 0 && <div className={`text-xs font-medium ${priceDiff > 0 ? "text-amber-600" : "text-emerald-600"}`}>{priceDiff > 0 ? "+" : ""}{priceDiff.toLocaleString()} PLN vs base</div>}
                            </div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <Link href={`/team/${emp.id === ANTHONY_ID ? "anthony" : emp.id === JOSIAH_ID ? "josiah" : emp.id === TOMEK_ID ? "tomek" : emp.id === IVAN_ID ? "ivan" : emp.id}`} target="_blank" onClick={(e) => e.stopPropagation()} className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                              View Portfolio →
                            </Link>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {step === "details" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Booking Details</h1>
              <p className="text-slate-600 dark:text-slate-400">Tell us about your event so we can prepare perfectly.</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.clientName} onChange={(e) => updateField("clientName", e.target.value)} placeholder="Jan Kowalski" className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email <span className="text-red-500">*</span></label>
                  <input type="email" value={formData.clientEmail} onChange={(e) => updateField("clientEmail", e.target.value)} placeholder="jan@example.com" className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
                  <input type="tel" value={formData.clientPhone} onChange={(e) => updateField("clientPhone", e.target.value)} placeholder="+48 123 456 789" className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Event Date <span className="text-red-500">*</span></label>
                  <input type="date" value={formData.eventDate} onChange={(e) => updateField("eventDate", e.target.value)} min={new Date().toISOString().split("T")[0]} className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Event Location</label>
                  <input type="text" value={formData.eventLocation} onChange={(e) => updateField("eventLocation", e.target.value)} placeholder="Kraków, Poland" className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Event Type</label>
                  <input type="text" value={formData.eventType} onChange={(e) => updateField("eventType", e.target.value)} placeholder="e.g. Wedding, Corporate Gala" className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Expected Guest Count</label>
                <input type="number" value={formData.guestCount} onChange={(e) => updateField("guestCount", e.target.value)} placeholder="50" className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Additional Notes or Requests</label>
                <textarea value={formData.notes} onChange={(e) => updateField("notes", e.target.value)} rows={4} placeholder="Tell us about your vision, special requests, or anything else we should know..." className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none" />
              </div>
            </div>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Review & Confirm</h1>
              <p className="text-slate-600 dark:text-slate-400">Please review your booking details before submitting.</p>
            </div>
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Service</h3>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{selectedPackage?.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{selectedPackage?.description}</div>
                    {selectedPackage?.duration_hours && <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Duration: {selectedPackage.duration_hours} hours</div>}
                  </div>
                  <button onClick={() => goToStep("service")} className="text-sm text-blue-600 dark:text-blue-400 hover:underline shrink-0 ml-4">Edit</button>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Team Member</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedEmployee?.avatar_url && <Image src={selectedEmployee.avatar_url} alt={selectedEmployee.display_name || ""} width={48} height={48} className="w-12 h-12 rounded-full object-cover" />}
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{selectedEmployee?.display_name}</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">{selectedEmployee?.role_title}</div>
                    </div>
                  </div>
                  <button onClick={() => goToStep("employee")} className="text-sm text-blue-600 dark:text-blue-400 hover:underline shrink-0 ml-4">Edit</button>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Event Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><div className="text-slate-500 dark:text-slate-400">Client</div><div className="font-medium text-slate-900 dark:text-white">{formData.clientName}</div></div>
                  <div><div className="text-slate-500 dark:text-slate-400">Email</div><div className="font-medium text-slate-900 dark:text-white">{formData.clientEmail}</div></div>
                  <div><div className="text-slate-500 dark:text-slate-400">Event Date</div><div className="font-medium text-slate-900 dark:text-white">{formData.eventDate}</div></div>
                  <div><div className="text-slate-500 dark:text-slate-400">Location</div><div className="font-medium text-slate-900 dark:text-white">{formData.eventLocation || "Not specified"}</div></div>
                  {formData.eventType && <div><div className="text-slate-500 dark:text-slate-400">Event Type</div><div className="font-medium text-slate-900 dark:text-white">{formData.eventType}</div></div>}
                  {formData.guestCount && <div><div className="text-slate-500 dark:text-slate-400">Guests</div><div className="font-medium text-slate-900 dark:text-white">{formData.guestCount}</div></div>}
                </div>
                {formData.notes && <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700"><div className="text-slate-500 dark:text-slate-400 text-sm mb-1">Notes</div><div className="text-slate-900 dark:text-white text-sm">{formData.notes}</div></div>}
                <button onClick={() => goToStep("details")} className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline">Edit details</button>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Pricing</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-slate-600 dark:text-slate-400">Package Price</span><span className="text-slate-900 dark:text-white font-medium">{selectedPackage?.base_price_pln.toLocaleString()} PLN</span></div>
                  {selectedEmployee && selectedEmployee.packages?.find((p) => p.id === formData.packageId)?.final_price_pln !== selectedPackage?.base_price_pln && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Team Member Adjustment</span>
                      <span className={`font-medium ${(selectedEmployee.packages?.find((p) => p.id === formData.packageId)?.final_price_pln || 0) > (selectedPackage?.base_price_pln || 0) ? "text-amber-600" : "text-emerald-600"}`}>
                        {((selectedEmployee.packages?.find((p) => p.id === formData.packageId)?.final_price_pln || 0) - (selectedPackage?.base_price_pln || 0)) > 0 ? "+" : ""}
                        {((selectedEmployee.packages?.find((p) => p.id === formData.packageId)?.final_price_pln || 0) - (selectedPackage?.base_price_pln || 0)).toLocaleString()} PLN
                      </span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">Total</span>
                    <span className="font-bold text-slate-900 dark:text-white">{finalPrice.toLocaleString()} PLN</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  A 30% deposit may be required after booking confirmation. We will contact you with payment details.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-3">
          {step !== "service" && (
            <button onClick={handleBack} className="px-6 py-3 text-base font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Back
            </button>
          )}
          {step !== "review" ? (
            <button onClick={handleNext} className="flex-1 px-6 py-3 text-base font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
              Continue
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="flex-1 px-6 py-3 text-base font-semibold text-white bg-blue-600 dark:bg-blue-500 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                  Submitting...
                </span>
              ) : (
                `Submit Booking Request`
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
