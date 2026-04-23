import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

const stickyCards = document.querySelectorAll(".card");
const frontStickyCard = document.querySelector(".card-front");
const backStickyCards = document.querySelectorAll(".card-back");
const heroHeadline = document.querySelector(".hero-content");
const stickyCardCount = backStickyCards.length;

const CARDS_ENTER_END = 100;
const CARD_FLIP_TRIGGER = 200;
const CARD_DISMISS_START = 300;
const CARD_DISMISS_DURATION = 100;

const TOTAL_SCROLL_SVH =
  CARD_DISMISS_START + stickyCardCount * CARD_DISMISS_DURATION;

const svhToProgress = (svh) => svh / TOTAL_SCROLL_SVH;
const totalScroll = window.innerHeight * (TOTAL_SCROLL_SVH / 100);

const cardFlipTiltAngles = [-10, -20, -5, 10];
const cardDismissTiltAngles = [-50, -60, -45, 50];

const cardDismissRanges = Array.from({ length: stickyCardCount }, (_, i) => {
  const dismissOrder = stickyCardCount - 1 - i;
  return [
    svhToProgress(CARD_DISMISS_START + dismissOrder * CARD_DISMISS_DURATION),
    svhToProgress(
      CARD_DISMISS_START + (dismissOrder + 1) * CARD_DISMISS_DURATION,
    ),
  ];
});

gsap.set(frontStickyCard, { rotationY: 0 });
gsap.set(backStickyCards, { rotationY: -180 });

let isFlipped = false;

const revealBackCards = () => {
  gsap.to(frontStickyCard, {
    rotationY: 180,
    duration: 1,
    ease: "elastic.out(1,0.5)",
  });
  backStickyCards.forEach((card, i) => {
    gsap.to(card, {
      rotationY: 0,
      rotationZ: cardFlipTiltAngles[i],
      duration: 1,
      ease: "elastic.out(1,0.5)",
    });
  });
};

const concealBackCards = () => {
  gsap.to(frontStickyCard, {
    rotationY: 0,
    duration: 1,
    ease: "elastic.out(1, 0.5)",
  });
  backStickyCards.forEach((card) => {
    gsap.to(card, {
      rotationY: -180,
      rotationZ: 0,
      duration: 1,
      ease: "elastic.out(1, 0.5)",
    });
  });
};

ScrollTrigger.create({
  trigger: ".hero",
  start: "top top",
  end: `+=${totalScroll}px`,
  pin: true,
  pinSpacing: true,
  scrub: true,
  onUpdate: ({ progress }) => {
    const enterProgress = gsap.utils.clamp(
      0,
      1,
      gsap.utils.mapRange(0, svhToProgress(CARDS_ENTER_END), 0, 1, progress)
    );

    gsap.set(stickyCards, {
      y: `${gsap.utils.mapRange(0, 1, 50, -50, enterProgress)}%`,
    });
    gsap.set(heroHeadline, {
      y: `${gsap.utils.mapRange(0, 1, 0, -100, enterProgress)}%`,
    });

    if (progress > svhToProgress(CARD_FLIP_TRIGGER) && !isFlipped) {
      revealBackCards();
      isFlipped = true;
    } else if (progress <= svhToProgress(CARD_FLIP_TRIGGER) && isFlipped) {
      concealBackCards();
      isFlipped = false;
    }

    backStickyCards.forEach((card, i) => {
      const [dismissStart, dismissEnd] = cardDismissRanges[i];
      const dismissProgress = gsap.utils.clamp(
        0,
        1,
        gsap.utils.mapRange(dismissStart, dismissEnd, 0, 1, progress)
      );

      gsap.set(card, {
        y: `${gsap.utils.mapRange(0, 1, -50, -250, dismissProgress)}%`,
        rotation: gsap.utils.mapRange(
          0,
          1,
          cardFlipTiltAngles[i],
          cardDismissTiltAngles[i],
          dismissProgress,
        ),
      });
    });
  },
});