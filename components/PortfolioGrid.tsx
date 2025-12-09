import { Media } from "@/lib/supabaseClient";
import PortfolioCard from "./PortfolioCard";

interface PortfolioGridProps {
  media: Media[];
}

export default function PortfolioGrid({ media }: PortfolioGridProps) {
  if (media.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-600 dark:text-gray-400">
        No portfolio items yet. Check back soon!
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {media.map((item) => (
          <PortfolioCard key={item.id} media={item} />
        ))}
      </div>
    </div>
  );
}
