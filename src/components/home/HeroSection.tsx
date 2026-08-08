import { Link } from "react-router-dom";
import { motion, useReducedMotion, Variants } from "motion/react";
import { 
  Sparkles, 
  Cpu, 
  Camera, 
  BatteryCharging, 
  ShieldCheck, 
  LucideIcon 
} from "lucide-react";

export interface FeatureItem {
  id: string;
  icon: LucideIcon;
  label: string;
  desc: string;
}

export interface HeroContent {
  eyebrow: {
    label: string;
    icon: LucideIcon;
  };
  headline: {
    line1: string;
    line2: string;
  };
  subheadline: string[];
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
  features: FeatureItem[];
  image: {
    src: string;
    fallbackSrc: string;
    alt: string;
    width: number;
    height: number;
  };
}

export const HERO_CONTENT: HeroContent = {
  eyebrow: {
    label: "",
    icon: Sparkles,
  },
  headline: {
    line1: "Forged Power.",
    line2: "Infinite Precision.",
  },
  subheadline: [
    "Titanium chassis with A17 Pro architecture.",
    "Pro camera system with 5x optical zoom."
  ],
  primaryCta: {
    label: "Shop Flagship",
    href: "/categories/smartphones",
  },
  secondaryCta: {
    label: "Explore Specs",
    href: "/product/p-1",
  },
  features: [
    {
      id: "feat-chip",
      icon: Cpu,
      label: "A17 Pro Chip",
      desc: "3nm Graphics Engine",
    },
    {
      id: "feat-cam",
      icon: Camera,
      label: "48MP Pro System",
      desc: "5x Optical Telephoto",
    },
    {
      id: "feat-bat",
      icon: BatteryCharging,
      label: "All-Day Battery",
      desc: "MagSafe Fast Charge",
    },
    {
      id: "feat-frame",
      icon: ShieldCheck,
      label: "Titanium Frame",
      desc: "Aerospace Grade Build",
    },
  ],
  image: {
    src: "https://firebasestorage.googleapis.com/v0/b/jo-accessories-44ffa.firebasestorage.app/o/ChatGPT%20Image%20Aug%207%2C%202026%2C%2012_53_42%20PM.png?alt=media&token=608eabdf-92b4-4620-8210-8f1cddd92c38",
    fallbackSrc: "https://firebasestorage.googleapis.com/v0/b/jo-accessories-44ffa.firebasestorage.app/o/ChatGPT%20Image%20Aug%207%2C%202026%2C%2012_53_42%20PM.png?alt=media&token=608eabdf-92b4-4620-8210-8f1cddd92c38",
    alt: "KBL Flagship Titanium Smartphone featuring a dark metallic chassis and triple pro lens camera module",
    width: 800,
    height: 800,
  },
};

function FeatureCard({ feature }: { feature: FeatureItem }) {
  const IconComponent = feature.icon;
  return (
    <div className="snap-start flex-shrink-0 w-[200px] sm:w-auto p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-brand-primary/40 transition-colors group">
      <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mb-3 group-hover:bg-brand-primary/20 transition-colors">
        <IconComponent className="w-5 h-5 text-brand-primary stroke-[1.5]" aria-hidden="true" />
      </div>
      <h3 className="font-display font-bold text-white text-sm lg:text-base mb-1 tracking-tight">
        {feature.label}
      </h3>
      <p className="text-fg-muted text-xs leading-relaxed">
        {feature.desc}
      </p>
    </div>
  );
}

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();
  const EyebrowIcon = HERO_CONTENT.eyebrow.icon;

  // Staggered motion variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.5,
        ease: [0.25, 0.1, 0.25, 1.0] as const,
      },
    },
  };

  const imageVariants: Variants = {
    hidden: shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96, y: 15 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.7,
        delay: shouldReduceMotion ? 0 : 0.2,
        ease: [0.25, 0.1, 0.25, 1.0] as const,
      },
    },
  };

  return (
    <section 
      role="region" 
      aria-label="Hero showcase"
      className="relative w-full overflow-hidden bg-brand-secondary text-white py-8 sm:py-12 lg:py-20 min-h-[80vh] lg:min-h-[620px] flex items-center border-b border-white/5"
    >
      {/* Background Layer 1: Ambient Radial Light Source */}
      <motion.div 
        aria-hidden="true"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                scale: [1, 1.08, 1],
                opacity: [0.2, 0.28, 0.2],
              }
        }
        transition={
          shouldReduceMotion
            ? undefined
            : {
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
        className="absolute top-1/2 right-[5%] lg:right-[12%] -translate-y-1/2 w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] lg:w-[650px] lg:h-[650px] bg-brand-primary/25 rounded-full blur-[130px] pointer-events-none" 
      />

      {/* Background Layer 2: Vignette Shadow */}
      <div 
        aria-hidden="true" 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,11,24,0.85)_100%)] pointer-events-none" 
      />

      {/* Background Layer 3: Faint Micro-texture */}
      <div 
        aria-hidden="true" 
        className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" 
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center"
        >
          {/* Left Column: Typography & Content */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Eyebrow */}
            {HERO_CONTENT.eyebrow.label && (
              <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4">
                <EyebrowIcon className="w-4 h-4 text-brand-primary" aria-hidden="true" />
                <span className="text-brand-primary font-medium text-xs lg:text-sm tracking-[0.08em] uppercase font-mono">
                  {HERO_CONTENT.eyebrow.label}
                </span>
                <div className="w-12 h-[1px] bg-white/20" aria-hidden="true" />
              </motion.div>
            )}

            {/* Headline */}
            <motion.div variants={itemVariants}>
              <h1 className="font-display font-extrabold text-[clamp(2.25rem,6.5vw,5.25rem)] leading-[0.95] sm:leading-[0.92] tracking-[-0.03em] mb-4 sm:mb-5">
                <span className="block text-white">
                  {HERO_CONTENT.headline.line1}
                </span>
                <span className="block text-brand-primary">
                  {HERO_CONTENT.headline.line2}
                </span>
              </h1>
            </motion.div>

            {/* Sub-headline */}
            <motion.div variants={itemVariants} className="text-fg-muted text-base lg:text-lg leading-relaxed mb-8 max-w-md font-sans">
              {HERO_CONTENT.subheadline.map((line, index) => (
                <p key={index} className="block">{line}</p>
              ))}
            </motion.div>

            {/* CTA Row */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10 lg:mb-12">
              <Link
                to={HERO_CONTENT.primaryCta.href}
                className="h-[52px] px-8 rounded-full bg-brand-primary hover:bg-brand-primary-dark text-brand-secondary font-bold text-sm lg:text-base inline-flex items-center justify-center transition-all shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-secondary focus-visible:outline-none"
              >
                {HERO_CONTENT.primaryCta.label}
              </Link>
              <Link
                to={HERO_CONTENT.secondaryCta.href}
                className="h-[52px] px-8 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-sm lg:text-base inline-flex items-center justify-center transition-all backdrop-blur hover:border-white/30 hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-secondary focus-visible:outline-none"
              >
                {HERO_CONTENT.secondaryCta.label}
              </Link>
            </motion.div>

            {/* Feature Strip */}
            <motion.div variants={itemVariants} className="pt-6 border-t border-white/10">
              <div 
                className="flex lg:grid lg:grid-cols-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 pb-2 lg:pb-0"
                tabIndex={0}
                aria-label="Key product features"
              >
                {HERO_CONTENT.features.map((feature) => (
                  <FeatureCard key={feature.id} feature={feature} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Product Stage */}
          <div className="lg:col-span-6 flex items-center justify-center relative min-h-[280px] sm:min-h-[520px] lg:min-h-[620px] my-4 lg:my-0">
            {/* Concentric Ring Outlines */}
            <div 
              aria-hidden="true" 
              className="absolute w-[260px] h-[260px] sm:w-[500px] sm:h-[500px] lg:w-[620px] lg:h-[620px] rounded-full border border-white/10 pointer-events-none" 
            />
            <div 
              aria-hidden="true" 
              className="absolute w-[200px] h-[200px] sm:w-[380px] sm:h-[380px] lg:w-[480px] lg:h-[480px] rounded-full border border-white/5 pointer-events-none" 
            />

            {/* Product Image Stage */}
            <motion.div 
              variants={imageVariants} 
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      y: [-4, 4, -4],
                    }
              }
              transition={
                shouldReduceMotion
                  ? undefined
                  : {
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
              className="relative z-10 flex flex-col items-center justify-center"
            >
              <picture>
                <source srcSet={HERO_CONTENT.image.src} />
                <img
                  src={HERO_CONTENT.image.fallbackSrc}
                  alt={HERO_CONTENT.image.alt}
                  width={HERO_CONTENT.image.width}
                  height={HERO_CONTENT.image.height}
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="relative z-10 w-full max-w-[340px] sm:max-w-[480px] lg:max-w-[620px] xl:max-w-[680px] h-auto object-contain drop-shadow-[0_30px_45px_rgba(0,0,0,0.75)]"
                />
              </picture>

              {/* Contact Shadow / Plinth */}
              <div 
                aria-hidden="true" 
                className="absolute -bottom-6 w-[260px] sm:w-[400px] lg:w-[500px] h-9 bg-black/80 rounded-[100%] blur-md pointer-events-none" 
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

