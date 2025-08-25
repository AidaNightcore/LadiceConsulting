document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  // --- SETUP: LOCOMOTIVE SCROLL ---
  const scrollContainer = document.querySelector("#main-container");
  const locoScroll = new LocomotiveScroll({
    el: scrollContainer,
    smooth: true,
    multiplier: 1,
    smoothMobile: true,
    getSpeed: true,
    class: "is-revealed",
    reloadOnContextChange: true,
    touchMultiplier: 2,
    fixedElements: ["header"],
  });

  // Share the Locomotive Scroll instance with other scripts
  if (typeof setLocomotiveScrollInstance === "function") {
    setLocomotiveScrollInstance(locoScroll);
  }

  locoScroll.on("scroll", ScrollTrigger.update);
  ScrollTrigger.scrollerProxy(scrollContainer, {
    scrollTop(value) {
      return arguments.length
        ? locoScroll.scrollTo(value, { duration: 0, disableLerp: true })
        : locoScroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
    pinType: scrollContainer.style.transform ? "transform" : "fixed",
  });

  ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
  ScrollTrigger.defaults({ scroller: "#main-container" });

  // --- SCROLL SNAP FUNCTIONALITY ---
  const sections = gsap.utils.toArray(".sections");
  let currentSection = 0;
  let lastScrollY = 0;
  let isSnapping = false;

  // Responsive snap threshold
  function getSnapThreshold() {
    if (window.innerWidth < 768) return 0.5; // Mobile
    if (window.innerWidth < 1024) return 0.4; // Tablet
    return 0.25; // Desktop
  }

  let snapThreshold = getSnapThreshold();

  // Expose snapToSection and disableScrollSnapping to window
  window.disableScrollSnapping = false;
  window.snapToSection = snapToSection;

  // Function to reset navbar position
  function resetNavbarPosition() {
    const header = document.querySelector("header");
    if (header) {
      header.style.top = "0";
      header.style.left = "0";
      header.style.width = "100%";
    }
  }

  // Function to snap to a specific section
  function snapToSection(index, callback) {
    if (index < 0 || index >= sections.length) {
      if (callback) callback();
      return;
    }
    currentSection = index;
    const targetSection = sections[index];
    const navbarHeight = document.querySelector("header").offsetHeight;
    locoScroll.scrollTo(targetSection, {
      offset: -navbarHeight,
      duration: 1.2,
      easing: [0.25, 0.0, 0.35, 1.0],
      disableLerp: false,
      callback: () => {
        resetNavbarPosition();
        if (callback) callback();
      },
    });
  }

  // Function to update current section based on scroll position
  function updateCurrentSection() {
    const scrollY = locoScroll.scroll.instance.scroll.y;
    const viewportCenter = scrollY + window.innerHeight / 2;

    sections.forEach((section, index) => {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (viewportCenter >= sectionTop && viewportCenter < sectionBottom) {
        currentSection = index;
      }
    });
  }

  // Enhanced scroll handling with threshold detection
  locoScroll.on("scroll", (instance) => {
    ScrollTrigger.update();
    resetNavbarPosition();
    updateCurrentSection();

    // Skip snapping if disabled or already snapping
    if (window.disableScrollSnapping || isSnapping) return;

    const scrollY = instance.scroll.y;
    const direction = scrollY > lastScrollY ? "down" : "up";
    lastScrollY = scrollY;

    const viewportCenter = scrollY + window.innerHeight / 2;
    const currentSectionEl = sections[currentSection];
    const currentSectionTop = currentSectionEl.offsetTop;
    const currentSectionBottom =
      currentSectionTop + currentSectionEl.offsetHeight;

    // Calculate thresholds based on viewport center
    const thresholdDistance = window.innerHeight * snapThreshold;

    // For downward scrolling: snap when viewport center crosses below current section
    const thresholdDown = currentSectionBottom - thresholdDistance;

    // For upward scrolling: snap when viewport center crosses above current section
    const thresholdUp = currentSectionTop + thresholdDistance;

    // Check if we've crossed the threshold
    if (direction === "down" && viewportCenter > thresholdDown) {
      if (currentSection < sections.length - 1) {
        isSnapping = true;
        snapToSection(currentSection + 1, () => {
          isSnapping = false;
        });
      }
    } else if (direction === "up" && viewportCenter < thresholdUp) {
      if (currentSection > 0) {
        isSnapping = true;
        snapToSection(currentSection - 1, () => {
          isSnapping = false;
        });
      }
    }
  });

  // Handle keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      window.disableScrollSnapping = true;
      snapToSection(Math.min(currentSection + 1, sections.length - 1), () => {
        window.disableScrollSnapping = false;
      });
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      window.disableScrollSnapping = true;
      snapToSection(Math.max(currentSection - 1, 0), () => {
        window.disableScrollSnapping = false;
      });
    }
  });

  // --- GLOBE ANIMATION SECTION ---
  ScrollTrigger.matchMedia({
    // Desktop (1024px and above)
    "(min-width: 1024px)": function () {
      const globe = document.querySelector("#globe");

      // Get initial position from CSS
      const initialTop = globe.style.top;
      const initialLeft = globe.style.left;
      const initialWidth = globe.style.width;

      // Calculate total scroll distance
      const totalScrollDistance =
        sections[sections.length - 1].offsetTop +
        sections[sections.length - 1].offsetHeight -
        window.innerHeight;

      // Create a single timeline for the entire scroll
      const globeTl = gsap.timeline({
        scrollTrigger: {
          trigger: sections[0],
          start: "top top",
          end: () => `+=${totalScrollDistance}`,
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });

      // Set initial position
      globeTl.set(globe, {
        top: initialTop,
        left: initialLeft,
        width: initialWidth,
      });

      // Calculate positions for each section
      const sectionPositions = sections.map((section) => {
        return (
          (section.offsetTop - sections[0].offsetTop) / totalScrollDistance
        );
      });

      // Animate to position at about section
      if (sections.length > 1) {
        globeTl.to(
          globe,
          {
            top: "130vh",
            left: "120vw",
            width: "60vw",
          },
          sectionPositions[1]
        );
      }

      // Animate to position at services section
      if (sections.length > 2) {
        globeTl.to(
          globe,
          {
            top: "200vh",
            left: "-50vw",
            width: "70vw",
          },
          sectionPositions[2]
        );
      }

      // Animate to position at contact section
      if (sections.length > 3) {
        globeTl.to(
          globe,
          {
            top: "270%",
            left: "-100%",
            width: "0vw",
          },
          sectionPositions[3]
        );
      }

      // Smooth transition back to initial position when scrolling up
      ScrollTrigger.create({
        trigger: sections[0],
        start: "top top",
        end: "bottom top",
        onLeaveBack: () => {
          gsap.to(globe, {
            top: initialTop,
            left: initialLeft,
            width: initialWidth,
            duration: 0.5,
            ease: "power2.out",
          });
        },
      });
    },

    // Tablet (768px to 1023px)
    "(min-width: 768px) and (max-width: 1023px)": function () {
      const globe = document.querySelector("#globe");

      // Get initial position from CSS
      const initialTop = globe.style.top;
      const initialLeft = globe.style.left;
      const initialWidth = globe.style.width;

      // Calculate total scroll distance
      const totalScrollDistance =
        sections[sections.length - 1].offsetTop +
        sections[sections.length - 1].offsetHeight -
        window.innerHeight;

      // Create a single timeline for the entire scroll
      const globeTl = gsap.timeline({
        scrollTrigger: {
          trigger: sections[0],
          start: "top top",
          end: () => `+=${totalScrollDistance}`,
          scrub: 0.7, // Slower scrub for tablets
          invalidateOnRefresh: true,
        },
      });

      // Set initial position
      globeTl.set(globe, {
        top: initialTop,
        left: initialLeft,
        width: initialWidth,
      });

      // Calculate positions for each section
      const sectionPositions = sections.map((section) => {
        return (
          (section.offsetTop - sections[0].offsetTop) / totalScrollDistance
        );
      });

      // Animate to position at about section (adjusted for tablet)
      if (sections.length > 1) {
        globeTl.to(
          globe,
          {
            top: "150%",
            left: "70vw",
            width: "20vw",
            ease: "none",
          },
          sectionPositions[1]
        );
      }

      // Animate to position at services section (adjusted for tablet)
      if (sections.length > 2) {
        globeTl.to(
          globe,
          {
            top: "250%",
            left: "-20vw",
            width: "18vw",
            ease: "none",
          },
          sectionPositions[2]
        );
      }

      // Animate to position at contact section (adjusted for tablet)
      if (sections.length > 3) {
        globeTl.to(
          globe,
          {
            top: "250%",
            left: "-80vw",
            width: "5vw",
            ease: "none",
          },
          sectionPositions[3]
        );
      }

      // Smooth transition back to initial position when scrolling up
      ScrollTrigger.create({
        trigger: sections[0],
        start: "top top",
        end: "bottom top",
        onLeaveBack: () => {
          gsap.to(globe, {
            top: initialTop,
            left: initialLeft,
            width: initialWidth,
            duration: 0.7,
            ease: "power2.out",
          });
        },
      });
    },

    // Mobile (767px and below)
    "(max-width: 767px)": function () {
      const globe = document.querySelector("#globe");

      // Get initial position from CSS
      const initialTop = globe.style.top;
      const initialLeft = globe.style.left;
      const initialWidth = globe.style.width;

      // Calculate total scroll distance
      const totalScrollDistance =
        sections[sections.length - 1].offsetTop +
        sections[sections.length - 1].offsetHeight -
        window.innerHeight;

      // Create a single timeline for the entire scroll
      const globeTl = gsap.timeline({
        scrollTrigger: {
          trigger: sections[0],
          start: "top top",
          end: () => `+=${totalScrollDistance}`,
          scrub: 0.5, // Slower scrub for mobile
          invalidateOnRefresh: true,
        },
      });

      // Set initial position
      globeTl.set(globe, {
        top: initialTop,
        left: initialLeft,
        width: initialWidth,
      });

      // Calculate positions for each section
      const sectionPositions = sections.map((section) => {
        return (
          (section.offsetTop - sections[0].offsetTop) / totalScrollDistance
        );
      });

      // Animate to position at about section (adjusted for mobile)
      if (sections.length > 1) {
        globeTl.to(
          globe,
          {
            top: "200vh",
            left: "80vw",
            // width: "100vw",
          },
          sectionPositions[1]
        );
      }

      // Animate to position at services section (adjusted for mobile)
      if (sections.length > 2) {
        globeTl.to(
          globe,
          {
            top: "215vh",
            left: "-180vw",
            width: "200vw",
          },
          sectionPositions[2]
        );
      }

      // Animate to position at contact section (adjusted for mobile)
      if (sections.length > 3) {
        globeTl.to(
          globe,
          {
            top: "250%",
            left: "-80vw",
            width: "5vw",
            ease: "none",
          },
          sectionPositions[3]
        );
      }

      // Smooth transition back to initial position when scrolling up
      ScrollTrigger.create({
        trigger: sections[0],
        start: "top top",
        end: "bottom top",
        onLeaveBack: () => {
          gsap.to(globe, {
            top: initialTop,
            left: initialLeft,
            width: initialWidth,
            duration: 0.7,
            ease: "power2.out",
          });
        },
      });
    },
  });

  // Force a refresh after setup
  ScrollTrigger.refresh();

  // Update Locomotive Scroll when window is resized
  window.addEventListener("resize", () => {
    // Update snap threshold on resize
    snapThreshold = getSnapThreshold();

    locoScroll.update();
    ScrollTrigger.refresh();
    resetNavbarPosition();
  });

  // Ensure the navbar stays fixed after any scroll
  locoScroll.on("scroll", () => {
    resetNavbarPosition();
  });

  // Ensure the navbar stays fixed after any scroll trigger update
  ScrollTrigger.addEventListener("refresh", () => {
    resetNavbarPosition();
  });
});
