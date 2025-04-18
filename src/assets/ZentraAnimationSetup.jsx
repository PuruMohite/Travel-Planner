import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

gsap.registerPlugin(ScrollTrigger);

const ZentraAnimationSetup = () => {
  const scrollRef = useRef();

  // ✅ Smooth scrolling with Lenis (only for mobile)
  useEffect(() => {
    if (window.innerWidth >= 768) return;

    const lenis = new Lenis({
      smooth: true,
      gestureDirection: "vertical",
      direction: "vertical",
      smoothTouch: true,
      touchMultiplier: 0.2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    lenis.on("scroll", ScrollTrigger.update);
    ScrollTrigger.defaults({ scroller: window });

    return () => {
      lenis.destroy();
    };
  }, []);

  // ✅ Large Text Scroll Animation (mobile only)
  useEffect(() => {
    if (window.innerWidth >= 768) return;

    let animation;
    let scrollTriggerInstance;

    const initAnimation = () => {
      if (animation) animation.kill();
      if (scrollTriggerInstance) scrollTriggerInstance.kill();

      animation = gsap.to(".large-text-scroll-1 .large-text-1", {
        x: "-150vw",
        ease: "none",
        scrollTrigger: {
          trigger: ".large-text-scroll-1",
          start: "top 4%",
          end: () => `${window.innerHeight * 3}`, // shorter duration to reduce overlap
          scrub: true,
          pin: true,
          pinSpacing: true,
          markers: false,
          invalidateOnRefresh: true,
          onToggle: (self) => (scrollTriggerInstance = self),
        },
      });
    };

    const timeout = setTimeout(initAnimation, 0);
    window.addEventListener("resize", initAnimation);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", initAnimation);
      if (scrollTriggerInstance) scrollTriggerInstance.kill();
      if (animation) animation.kill();
    };
  }, []);

  // ✅ Feature Cards Animation (mobile only, with fixes)
  useEffect(() => {
    if (window.innerWidth >= 768) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".card-wrapper");

      cards.forEach((card, index) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top top",
            end: () => `${card.offsetHeight * 2.5}`, // shorter scroll distance
            scrub: 2, // lighter scrub for better control
            pin: true,
            markers: false,
            id: `card-scroll-${index}`,
            invalidateOnRefresh: true,
          },
        });

        tl.fromTo(
          card,
          { scale: 0.01, opacity: 0.9 },
          { scale: 1, opacity: 1, ease: "none" }
        ).to(card, {
          scale: 3,
          opacity: 0,
          ease: "none",
          delay: 0.5,
        });
      });
    });

    return () => ctx.revert();
  }, []);

  // ✅ Zentra SVG Animation (mobile only)
  useEffect(() => {
    if (window.innerWidth >= 768) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".large-text-scroll-2",
          start: "top top",
          end: `+=400%`,
          scrub: 3,
          pin: true,
          markers: false,
          invalidateOnRefresh: true,
        },
      });

      tl.fromTo(
        ".zentra-text",
        { scale: 3, opacity: 0, rotate: 30 },
        { scale: 1, opacity: 1, rotate: 0, ease: "none" }
      ).to(".zentra-text", {
        scale: 1,
        opacity: 0,
        ease: "none",
        delay: 1,
      });

      gsap.fromTo(
        "#z-svg, .letter",
        {
          opacity: 0.3,
          fill: "transparent",
        },
        {
          opacity: 1,
          fill: "transparent",
          stroke: "#27f09b",
          repeat: -1,
          yoyo: true,
          stagger: {
            each: 0.05,
            repeat: -1,
            yoyo: true,
          },
          ease: "rough({ strength: 1.5, points: 25, template: linear, taper: none })",
          duration: 0.3,
        }
      );
    });

    return () => ctx.revert();
  }, []);

  // ✅ Character Split for Hover Highlight
  useEffect(() => {
    const textElem = document.querySelector(".large-text-1");
    if (!textElem) return;

    const text = textElem.textContent.trim();
    let clutter = "";

    [...text].forEach((char) => {
      if (char === " ") {
        clutter += `<span class="inline-block w-[0.5ch]">&nbsp;</span>`;
      } else {
        clutter += `<span class="hover:text-[#27f09b]">${char}</span>`;
      }
    });

    textElem.innerHTML = clutter;
  }, []);

  return null;
};

export default ZentraAnimationSetup;
