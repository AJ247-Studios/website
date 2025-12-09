import HeroSection from "@/components/HeroSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="font-semibold text-xl mb-2">Creative Design</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Beautiful, user-centered designs that captivate and engage your
              audience.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="font-semibold text-xl mb-2">High Performance</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Lightning-fast websites built with modern technologies and best
              practices.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="font-semibold text-xl mb-2">Scalable Solutions</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Robust architectures that grow with your business needs.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
