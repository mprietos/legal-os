import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export type LogoVariant = 'full' | 'icon';
export type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  href?: string;
  className?: string;
}

const sizeConfig = {
  full: {
    sm: { width: 160, height: 40 },
    md: { width: 200, height: 50 },
    lg: { width: 280, height: 70 },
    xl: { width: 400, height: 100 },
  },
  icon: {
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 56, height: 56 },
    xl: { width: 80, height: 80 },
  },
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'icon',
  size = 'md',
  href,
  className = '',
}) => {
  const dimensions = sizeConfig[variant][size];
  const logoSrc = variant === 'full' ? '/logo-full.png' : '/logo-icon.png';
  const alt = variant === 'full' ? 'Compliance OS' : 'Compliance OS Icon';

  const logoElement = (
    <div className={`logo-safe-area inline-block ${className}`}>
      <Image
        src={logoSrc}
        alt={alt}
        width={dimensions.width}
        height={dimensions.height}
        priority
        className="object-contain"
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-80">
        {logoElement}
      </Link>
    );
  }

  return logoElement;
};

// Specialized variants for common use cases
export const HeaderLogo: React.FC<{ href?: string }> = ({ href = '/' }) => (
  <Logo variant="icon" size="md" href={href} />
);

export const LandingLogo: React.FC = () => (
  <Logo variant="full" size="xl" />
);

export const DashboardLogo: React.FC<{ href?: string }> = ({ href = '/dashboard' }) => (
  <Logo variant="icon" size="md" href={href} />
);
