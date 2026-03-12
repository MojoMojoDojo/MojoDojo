import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'motion/react';

export function SectionNavigator() {
  const { pathname } = useLocation();
  const [sectionIds, setSectionIds] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('main section[data-page-section]')
    );

    const ids = sections
      .map((section, index) => {
        if (!section.id) {
          section.id = `page-section-${index + 1}`;
        }
        return section.id;
      })
      .filter(Boolean);

    setSectionIds(ids);
    setActiveIndex(0);
  }, [pathname]);

  useEffect(() => {
    if (sectionIds.length < 2) {
      return;
    }

    const onScroll = () => {
      const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter((section): section is HTMLElement => !!section);

      if (sections.length < 2) {
        return;
      }

      const targetY = window.innerHeight * 0.28;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      sections.forEach((section, index) => {
        const distance = Math.abs(section.getBoundingClientRect().top - targetY);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [sectionIds]);

  const canGoUp = activeIndex > 0;
  const canGoDown = activeIndex < sectionIds.length - 1;

  const showCenteredHomeButton = useMemo(() => {
    return pathname === '/' && sectionIds.length > 1 && activeIndex === 0;
  }, [pathname, sectionIds.length, activeIndex]);

  const goToIndex = (index: number) => {
    const sectionId = sectionIds[index];
    if (!sectionId) {
      return;
    }

    const section = document.getElementById(sectionId);
    if (section) {
      const top = section.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  if (sectionIds.length < 2) {
    return null;
  }

  if (showCenteredHomeButton) {
    return (
      <motion.button
        type="button"
        onClick={() => goToIndex(1)}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 w-14 h-14 rounded-full border-2 border-white flex items-center justify-center hover:scale-105 transition-all duration-300"
        aria-label="Go to next section"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ChevronDown className="w-6 h-6 text-white" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed left-4 md:left-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-4"
      aria-label="Section navigation"
    >
      <button
        type="button"
        onClick={() => canGoUp && goToIndex(activeIndex - 1)}
        disabled={!canGoUp}
        className="text-white/85 disabled:text-white/25 transition-colors"
        aria-label="Go to previous section"
      >
        <ChevronUp className="w-7 h-7" />
      </button>

      <div className="w-px h-10 bg-white/30" />

      <button
        type="button"
        onClick={() => canGoDown && goToIndex(activeIndex + 1)}
        disabled={!canGoDown}
        className="text-white/85 disabled:text-white/25 transition-colors"
        aria-label="Go to next section"
      >
        <ChevronDown className="w-7 h-7" />
      </button>
    </motion.div>
  );
}
