import ContactButton from "./ContactButton";

export default function HeroSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h1 className="text-5xl font-bold mb-6">Welcome to AJ247 Studios</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
        We create exceptional digital experiences through innovative design and
        cutting-edge technology.
      </p>
      <ContactButton />
    </section>
  );
}
