'use client';

import { useState } from 'react';
import Image from 'next/image';

const BADGE_CLASS = 'inline-flex h-[48px] w-[150px] basis-[150px] flex-none items-center justify-center overflow-hidden leading-none sm:h-[54px] sm:w-[170px] sm:basis-[170px]';

export default function FooterAppBadge({ app }) {
  const [imageFailed, setImageFailed] = useState(false);

  const handleImageError = () => {
    setImageFailed(true);
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Footer app badge failed to load: ${app.imageUrl}`);
    }
  };

  const badgeImage = imageFailed ? null : (
    <Image
      src={app.imageUrl}
      alt={app.imageAlt}
      width={170}
      height={54}
      unoptimized
      onError={handleImageError}
      className="block h-full w-full max-w-none object-contain object-center"
    />
  );

  if (app.storeUrl) {
    return (
      <a
        href={app.storeUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={app.imageAlt}
        className={`${BADGE_CLASS} transition duration-200 hover:-translate-y-px hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-4`}
      >
        {badgeImage}
      </a>
    );
  }

  return (
    <div className={BADGE_CLASS} aria-disabled="true">
      {badgeImage}
    </div>
  );
}
