import { Media } from "@/lib/supabaseClient";
import ImagePreview from "./ImagePreview";
import YouTubeEmbed from "./YouTubeEmbed";

interface PortfolioCardProps {
  media: Media;
}

export default function PortfolioCard({ media }: PortfolioCardProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {media.youtube_id ? (
        <YouTubeEmbed videoId={media.youtube_id} />
      ) : (
        <ImagePreview src={media.url} alt={media.title || media.filename} />
      )}
      <div className="p-4">
        {media.title && (
          <h3 className="font-semibold text-lg mb-2">{media.title}</h3>
        )}
        {media.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {media.description}
          </p>
        )}
      </div>
    </div>
  );
}
