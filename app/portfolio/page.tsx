import { fetchPortfolioMedia } from "@/lib/api";
import PortfolioGrid from "@/components/PortfolioGrid";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function PortfolioPage() {
  const media = await fetchPortfolioMedia();

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <h1 className="text-4xl font-bold mb-4">Our Portfolio</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore our latest work and creative projects.
        </p>
      </div>
      <PortfolioGrid media={media} />
    </div>
  );
}
