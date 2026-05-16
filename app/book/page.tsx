"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// ============================================================================
// TYPES
// ============================================================================
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
  base_price_pln: number;
  custom_price_pln: number;
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

// ============================================================================
// MOCK DATA (replace with API calls when Supabase is set up)
// ============================================================================
const SERVICE_TYPES = [
  { value: "sports", label: "Sports Coverage", icon: "🏆", description: "Dynamic action shots and highlight reels" },
  { value: "concert", label: "Concert & Event Coverage", icon: "🎵", description: "Live music and event photography" },
  { value: "wedding", label: "Wedding Coverage", icon: "💍", description: "Timeless wedding photography and films" },
  { value: "portrait", label: "Photo Sessions", icon: "📸", description: "Professional portraits and headshots" },
  { value: "corporate", label: "Corporate Events", icon: "🏢", description: "Conference and corporate coverage" },
];

const MOCK_PACKAGES: Record<string, ServicePackage[]> = {
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

const MOCK_EMPLOYEES: Record<string, Employee[]> = {
  sports: [
    { id: "emp-josiah", display_name: "Josiah Ennis", role_title: "Co-Founder / Videographer", specialty: "Sports Videography & Commercial Shoots", avatar_url: "/portfolio/Josiah-full-res.webp", base_price_pln: 1499, custom_price_pln: 1699 },
    { id: "emp-anthony", display_name: "Anthony Certeza", role_title: "Co-Founder / Photographer", specialty: "Sports Photography & Action Shots", avatar_url: "/portfolio/Anthony-full-res.webp", base_price_pln: 1499, custom_price_pln: 1599 },
  ],
  concert: [
    { id: "emp-josiah", display_name: "Josiah Ennis", role_title: "Co-Founder / Videographer", specialty: "Concert Videography & Live Events", avatar_url: "/portfolio/Josiah-full-res.webp", base_price_pln: 1999, custom_price_pln: 2199 },
    { id: "emp-anthony", display_name: "Anthony Certeza", role_title: "Co-Founder / Photographer", specialty: "Concert Photography & Press Coverage", avatar_url: "/portfolio/Anthony-full-res.webp", base_price_pln: 1999, custom_price_pln: 2099 },
  ],
  wedding: [
    { id: "emp-josiah", display_name: "Josiah Ennis", role_title: "Co-Founder / Videographer", specialty: "Wedding Films & Cinematic Coverage", avatar_url: "/portfolio/Josiah-full-res.webp", base_price_pln: 3499, custom_price_pln: 3899 },
    { id: "emp-anthony", display_name: "Anthony Certeza", role_title: "Co-Founder / Photographer", specialty: "Wedding Photography & Couples Portraits", avatar_url: "/portfolio/Anthony-full-res.webp", base_price_pln: 3499, custom_price_pln: 3699 },
  ],
  portrait: [
    { id: "emp-anthony", display_name: "Anthony Certeza", role_title: "Co-Founder / Photographer", specialty: "Portrait Photography & Headshots", avatar_url: "/portfolio/Anthony-full-res.webp", base_price_pln: 450, custom_price_pln: 450 },
    { id: "emp-tomek", display_name: "Tomek Dudzik", role_title: "Graphic Designer / Editor", specialty: "Creative Portraits & Styled Shoots", avatar_url: "/portfolio/Tomek Dudzik.jpeg", base_price_pln: 450, custom_price_pln: 400 },
  ],
  corporate: [
    { id: "emp-josiah", display_name: "Josiah Ennis", role_title: "Co-Founder / Videographer", specialty: "Corporate Video & Commercial Production", avatar_url: "/portfolio/Josiah-full-res.webp", base_price_pln: 1199, custom_price_pln: 1299 },
    { id: "emp-anthony", display_name: "Anthony Certeza", role_title: "Co-Founder / Photographer", specialty: "Corporate Photography & Event Coverage", avatar_url: "/portfolio/Anthony-full-res.webp", base_price_pln: 1199, custom_price_pln: 1199 },
    { id: "emp-ivan", display_name: "Ivan Anthony Cabañero", role_title: "Editor", specialty: "Video Editing & Post-Production", avatar_url: "/portfolio/Ivan-full-res.jpeg", base_price_pln: 1199, custom_price_pln: 1099 },
  ],
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function BookPage() {
  const router = useRouter();
  const [step, setStep] = useState<BookingStep>("service");
  const [formData, setFormData] = useState<BookingFormData>({
    serviceType: "",
    packageId: "",
    employeeId: "",
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

  // Computed values
  const selectedPackage = formData.packageId
    ? MOCK_PACKAGES[formData.serviceType]?.find((p) => p.id === formData.packageId)
    : null;

  const selectedEmployee = formData.employeeId
    ? MOCK_EMPLOYEES[formData.serviceType]?.find((e) => e.id === formData.employeeId)
    : null;

  const finalPrice = selectedEmployee?.custom_price_pln || selectedPackage?.base_price_pln || 0;
  const depositAmount = Math.round(finalPrice * 0.3);

  // Update form field helper
  const updateField = useCallback(<K extends keyof BookingFormData>(field: K, value: BookingFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  }, []);

  // Navigation helpers
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

  // Submit booking
  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // TODO: Replace with actual API call to Supabase
      // const { data, error } = await supabase.from('bookings').insert({...})

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit booking. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // RENDER: SUBMITTED STATE
  // ============================================================================
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
                  <span className="text-slate-500 dark:text-slate-400">Total:</span>
                  <span className="text-slate-900 dark:text-white font-medium">{finalPrice.toLocaleString()} PLN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Deposit (30%):</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">{depositAmount.toLocaleString()} PLN</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              We&apos;ll send a confirmation email to <span className="font-medium">{formData.clientEmail}</span> with payment instructions for the deposit.
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

  // ============================================================================
  // RENDER: MAIN BOOKING FLOW
  // ============================================================================
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
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

          {/* Progress bar */}
          <div className="mt-4 flex gap-2">
            {(["service", "employee", "details", "review"] as BookingStep[]).map((s, idx) => {
              const currentIdx = ["service", "employee", "details", "review"].indexOf(step);
              const isCompleted = idx < currentIdx;
              const isActive = idx === currentIdx;
              return (
                <div key={s} className="flex-1">
                  <div
                    className={`h-2 rounded-full transition-colors ${
                      isCompleted
                        ? "bg-emerald-500"
                        : isActive
                        ? "bg-blue-500"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
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

        {/* STEP 1: SERVICE SELECTION */}
        {step === "service" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Choose Your Service</h1>
              <p className="text-slate-600 dark:text-slate-400">Select the type of coverage you need for your event.</p>
            </div>

            {/* Service type grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {SERVICE_TYPES.map((service) => (
                <button
                  key={service.value}
                  onClick={() => {
                    updateField("serviceType", service.value);
                    updateField("packageId", "");
                    updateField("employeeId", "");
                  }}
                  className={`text-left p-5 rounded-xl border-2 transition-all ${
                    formData.serviceType === service.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="text-3xl mb-3">{service.icon}</div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{service.label}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{service.description}</p>
                </button>
              ))}
            </div>

            {/* Package selection (shown after service type selected) */}
            {formData.serviceType && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Select a Package</h2>
                <div className="space-y-4">
                  {MOCK_PACKAGES[formData.serviceType]?.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => updateField("packageId", pkg.id)}
                      className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                        formData.packageId === pkg.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">{pkg.name}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{pkg.description}</p>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <div className="text-xl font-bold text-slate-900 dark:text-white">
                            {pkg.base_price_pln.toLocaleString()} <span className="text-sm font-normal">PLN</span>
                          </div>
                          {pkg.duration_hours && (
                            <div className="text-sm text-slate-500 dark:text-slate-400">{pkg.duration_hours} hrs</div>
                          )}
                        </div>
                      </div>
                      <ul className="grid grid-cols-2 gap-1 text-sm">
                        {pkg.features.slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                            <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
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

        {/* STEP 2: EMPLOYEE SELECTION */}
        {step === "employee" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Choose Your Team Member</h1>
              <p className="text-slate-600 dark:text-slate-400">
                Select the photographer, videographer, or editor you want to work with. Pricing may vary by team member.
              </p>
            </div>

            <div className="space-y-4">
              {MOCK_EMPLOYEES[formData.serviceType]?.map((emp) => {
                const priceDiff = emp.custom_price_pln - (selectedPackage?.base_price_pln || 0);
                return (
                  <button
                    key={emp.id}
                    onClick={() => updateField("employeeId", emp.id)}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                      formData.employeeId === emp.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                        {emp.avatar_url ? (
                          <Image
                            src={emp.avatar_url}
                            alt={emp.display_name || ""}
                            width={64}
                            height={64}
                            className="w-16 h-16 object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 flex items-center justify-center text-xl font-bold text-slate-400">
                            {(emp.display_name || "?").charAt(0)}
                          </div>
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
                            <div className="text-lg font-bold text-slate-900 dark:text-white">
                              {emp.custom_price_pln.toLocaleString()} <span className="text-sm font-normal">PLN</span>
                            </div>
                            {priceDiff !== 0 && (
                              <div className={`text-xs font-medium ${priceDiff > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                                {priceDiff > 0 ? "+" : ""}
                                {priceDiff.toLocaleString()} PLN vs base
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Link
                            href={`/team/${emp.id.replace("emp-", "")}`}
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                          >
                            View Portfolio →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: BOOKING DETAILS */}
        {step === "details" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Booking Details</h1>
              <p className="text-slate-600 dark:text-slate-400">Tell us about your event so we can prepare perfectly.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
              {/* Client Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => updateField("clientName", e.target.value)}
                    placeholder="Jan Kowalski"
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => updateField("clientEmail", e.target.value)}
                    placeholder="jan@example.com"
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => updateField("clientPhone", e.target.value)}
                    placeholder="+48 123 456 789"
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Event Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => updateField("eventDate", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Event Location
                  </label>
                  <input
                    type="text"
                    value={formData.eventLocation}
                    onChange={(e) => updateField("eventLocation", e.target.value)}
                    placeholder="Kraków, Poland"
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Event Type
                  </label>
                  <input
                    type="text"
                    value={formData.eventType}
                    onChange={(e) => updateField("eventType", e.target.value)}
                    placeholder="e.g. Wedding, Corporate Gala"
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Expected Guest Count
                </label>
                <input
                  type="number"
                  value={formData.guestCount}
                  onChange={(e) => updateField("guestCount", e.target.value)}
                  placeholder="50"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Additional Notes or Requests
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  rows={4}
                  placeholder="Tell us about your vision, special requests, or anything else we should know..."
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW */}
        {step === "review" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Review & Confirm</h1>
              <p className="text-slate-600 dark:text-slate-400">Please review your booking details before submitting.</p>
            </div>

            <div className="space-y-4">
              {/* Service summary */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Service</h3>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{selectedPackage?.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{selectedPackage?.description}</div>
                    {selectedPackage?.duration_hours && (
                      <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Duration: {selectedPackage.duration_hours} hours</div>
                    )}
                  </div>
                  <button onClick={() => goToStep("service")} className="text-sm text-blue-600 dark:text-blue-400 hover:underline shrink-0 ml-4">Edit</button>
                </div>
              </div>

              {/* Team member summary */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Team Member</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedEmployee?.avatar_url && (
                      <Image
                        src={selectedEmployee.avatar_url}
                        alt={selectedEmployee.display_name || ""}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{selectedEmployee?.display_name}</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">{selectedEmployee?.role_title}</div>
                    </div>
                  </div>
                  <button onClick={() => goToStep("employee")} className="text-sm text-blue-600 dark:text-blue-400 hover:underline shrink-0 ml-4">Edit</button>
                </div>
              </div>

              {/* Details summary */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Event Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Client</div>
                    <div className="font-medium text-slate-900 dark:text-white">{formData.clientName}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Email</div>
                    <div className="font-medium text-slate-900 dark:text-white">{formData.clientEmail}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Event Date</div>
                    <div className="font-medium text-slate-900 dark:text-white">{formData.eventDate}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Location</div>
                    <div className="font-medium text-slate-900 dark:text-white">{formData.eventLocation || "Not specified"}</div>
                  </div>
                  {formData.eventType && (
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">Event Type</div>
                      <div className="font-medium text-slate-900 dark:text-white">{formData.eventType}</div>
                    </div>
                  )}
                  {formData.guestCount && (
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">Guests</div>
                      <div className="font-medium text-slate-900 dark:text-white">{formData.guestCount}</div>
                    </div>
                  )}
                </div>
                {formData.notes && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-slate-500 dark:text-slate-400 text-sm mb-1">Notes</div>
                    <div className="text-slate-900 dark:text-white text-sm">{formData.notes}</div>
                  </div>
                )}
                <button onClick={() => goToStep("details")} className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline">Edit details</button>
              </div>

              {/* Pricing summary */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Pricing</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Package Price</span>
                    <span className="text-slate-900 dark:text-white font-medium">{selectedPackage?.base_price_pln.toLocaleString()} PLN</span>
                  </div>
                  {selectedEmployee && selectedEmployee.custom_price_pln !== selectedPackage?.base_price_pln && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Team Member Adjustment</span>
                      <span className={`font-medium ${selectedEmployee.custom_price_pln > (selectedPackage?.base_price_pln || 0) ? "text-amber-600" : "text-emerald-600"}`}>
                        {selectedEmployee.custom_price_pln > (selectedPackage?.base_price_pln || 0) ? "+" : ""}
                        {(selectedEmployee.custom_price_pln - (selectedPackage?.base_price_pln || 0)).toLocaleString()} PLN
                      </span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">Total</span>
                    <span className="font-bold text-slate-900 dark:text-white">{finalPrice.toLocaleString()} PLN</span>
                  </div>
                  <div className="flex justify-between bg-blue-50 dark:bg-blue-500/10 rounded-lg p-3">
                    <span className="font-semibold text-blue-900 dark:text-blue-300">Deposit Due Now (30%)</span>
                    <span className="font-bold text-blue-900 dark:text-blue-300">{depositAmount.toLocaleString()} PLN</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  A 30% non-refundable deposit is required to secure your booking. The remaining balance is due on the day of the event.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex gap-3">
          {step !== "service" && (
            <button
              onClick={handleBack}
              className="px-6 py-3 text-base font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Back
            </button>
          )}
          {step !== "review" ? (
            <button
              onClick={handleNext}
              className="flex-1 px-6 py-3 text-base font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-6 py-3 text-base font-semibold text-white bg-blue-600 dark:bg-blue-500 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
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
