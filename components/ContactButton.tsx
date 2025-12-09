"use client";

export default function ContactButton() {
  const handleContact = () => {
    window.location.href = "mailto:contact@aj247studios.com";
  };

  return (
    <button
      onClick={handleContact}
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
    >
      Get in Touch
    </button>
  );
}
