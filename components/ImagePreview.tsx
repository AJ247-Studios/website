import Image from "next/image";

interface ImagePreviewProps {
  src: string;
  alt: string;
}

export default function ImagePreview({ src, alt }: ImagePreviewProps) {
  return (
    <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-900">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}
