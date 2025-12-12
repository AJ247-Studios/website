/**
 * ProfileHero Component
 * 
 * Identity strip at top of profile:
 * - Avatar/logo, name, company, role
 * - Local time, timezone indicator
 * - Quick contact actions (WhatsApp, call, email)
 * - Verified badges
 */

"use client";

import type { ClientProfile } from "@/lib/types/portal";
import type { ReactNode } from "react";

interface ContactMethod {
  type: "email" | "phone" | "whatsapp";
  value: string;
  verified: boolean;
}

interface ProfileHeroProps {
  profile: ClientProfile;
  contactMethods?: ContactMethod[];
  isOwnProfile?: boolean;
  onMessage?: () => void;
  onEditProfile?: () => void;
}

export function ProfileHero({
  profile,
  contactMethods = [],
  isOwnProfile = false,
  onMessage,
  onEditProfile,
}: ProfileHeroProps) {
  // Get local time in user's timezone
  const localTime = new Intl.DateTimeFormat("en-US", {
    timeZone: profile.preferences?.timezone || "Europe/Warsaw",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(new Date());

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <section className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-6">
      {/* Gradient background strip */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600" />

      <div className="relative px-6 pt-16 pb-6">
        {/* Avatar + Name row */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
          {/* Avatar */}
          <div className="relative -mt-8">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-24 h-24 rounded-xl border-4 border-white dark:border-slate-900 shadow-lg object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl border-4 border-white dark:border-slate-900 shadow-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <span className="text-2xl font-bold text-slate-600 dark:text-slate-300">
                  {initials}
                </span>
              </div>
            )}
            {/* VIP badge */}
            {profile.tags?.includes("vip") && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Name + Company */}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {profile.name}
              </h1>
              {profile.tags?.includes("repeat") && (
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                  Repeat Client
                </span>
              )}
            </div>
            {profile.company && (
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                {profile.company}
              </p>
            )}
            {/* Local time */}
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{localTime} local time</span>
              {profile.preferences?.timezone && (
                <span className="text-slate-400">
                  ({profile.preferences.timezone.replace("_", " ")})
                </span>
              )}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:self-center">
            {isOwnProfile ? (
              <button
                onClick={onEditProfile}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            ) : (
              <button
                onClick={onMessage}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Message
              </button>
            )}
          </div>
        </div>

        {/* Contact methods bar */}
        {contactMethods.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            {contactMethods.map((method) => (
              <ContactMethodButton key={method.type} method={method} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ContactMethodButton({ method }: { method: ContactMethod }) {
  const icons: Record<string, ReactNode> = {
    email: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    phone: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    whatsapp: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
  };

  const labels: Record<string, string> = {
    email: "Email",
    phone: "Call",
    whatsapp: "WhatsApp",
  };

  const getHref = () => {
    switch (method.type) {
      case "email":
        return `mailto:${method.value}`;
      case "phone":
        return `tel:${method.value}`;
      case "whatsapp":
        return `https://wa.me/${method.value.replace(/\D/g, "")}`;
      default:
        return "#";
    }
  };

  return (
    <a
      href={getHref()}
      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
    >
      {icons[method.type]}
      <span>{labels[method.type]}</span>
      {method.verified && (
        <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )}
    </a>
  );
}

export default ProfileHero;
