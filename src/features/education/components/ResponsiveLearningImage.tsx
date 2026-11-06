import Image from 'next/image';

type ResponsiveLearningImageProps = {
  alt: string;
  baseName: 'practical-electronics-hero' | 'project-learning' | 'collaborative-learning' | 'information-technology-department' | 'business-management-department' | 'trade-logistics-department' | 'law/law-corporate-governance-department' | 'department-arts-languages' | 'ayurveda/ayurveda-wellness-department' | 'data-science-track';
  largeWidth: 960 | 1200;
  largeHeight: 640 | 800;
  smallWidth: 640 | 768;
  smallHeight: 427 | 512;
  priority?: boolean;
  sizes: string;
};

export default function ResponsiveLearningImage({
  alt,
  baseName,
  largeWidth,
  largeHeight,
  smallWidth,
  smallHeight,
  priority = false,
  sizes,
}: ResponsiveLearningImageProps) {
  const root = baseName === 'department-arts-languages' ? '/images/institute/arts-languages' : baseName.startsWith('ayurveda/') ? '/images/institute' : '/images/institute/learning/generated';
  const usesExactSource = baseName === 'law/law-corporate-governance-department' || baseName === 'department-arts-languages' || baseName === 'ayurveda/ayurveda-wellness-department';
  const avifSource = usesExactSource
    ? `${root}/${baseName}.avif`
    : `${root}/${baseName}-${smallWidth}.avif ${smallWidth}w, ${root}/${baseName}-${largeWidth}.avif ${largeWidth}w`;
  const webpSource = usesExactSource
    ? `${root}/${baseName}.webp`
    : `${root}/${baseName}-${smallWidth}.webp ${smallWidth}w, ${root}/${baseName}-${largeWidth}.webp ${largeWidth}w`;
  const fallbackSource = usesExactSource ? `${root}/${baseName}.webp` : `${root}/${baseName}-${largeWidth}.webp`;

  return (
    <picture>
      <source
        type="image/avif"
        srcSet={avifSource}
        sizes={sizes}
      />
      <source
        type="image/webp"
        srcSet={webpSource}
        sizes={sizes}
      />
      <Image
        src={fallbackSource}
        alt={alt}
        width={usesExactSource ? 1672 : largeWidth}
        height={usesExactSource ? 941 : largeHeight}
        sizes={sizes}
        priority={priority}
        draggable={false}
        className="h-auto w-full"
      />
    </picture>
  );
}
