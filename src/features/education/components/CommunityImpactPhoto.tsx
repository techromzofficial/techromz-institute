type CommunityImpactPhotoProps = {
  baseName: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  priority?: boolean;
  className?: string;
};

export default function CommunityImpactPhoto({ baseName, alt, width, height, sizes, priority = false, className = '' }: CommunityImpactPhotoProps) {
  return <picture className="contents">
    <source type="image/avif" srcSet={`/images/institute/community-impact/generated/${baseName}-768.avif 768w, /images/institute/community-impact/generated/${baseName}-1200.avif 1200w`} sizes={sizes} />
    <source type="image/webp" srcSet={`/images/institute/community-impact/generated/${baseName}-768.webp 768w, /images/institute/community-impact/generated/${baseName}-1200.webp 1200w`} sizes={sizes} />
    <img src={`/images/institute/community-impact/generated/${baseName}-1200.webp`} alt={alt} width={width} height={height} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" draggable={false} className={`h-auto w-full ${className}`} />
  </picture>;
}

