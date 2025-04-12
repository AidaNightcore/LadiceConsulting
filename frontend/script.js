function navbarFunction() {
  var x = document.getElementById("navbar");
  if (x.className === "nav-text") {
    x.className += " responsive";
  } else {
    x.className = "nav-text";
  }
}
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  gsap
    .timeline({
      scrollTrigger: {
        trigger: "main",
        scroller: "main", // ← Essential fix here!
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        markers: true, // set to false when done debugging
      },
    })
    // Globe starts from the right, smaller and rotated
    .from("#globe", {
      x: "50vw",
      scale: 0.7,
      rotation: -60,
      ease: "power1.out",
    })
    // Globe moves to center at About section
    .to("#globe", {
      x: "0vw",
      scale: 1,
      rotation: 0,
      ease: "power1.inOut",
    })
    // Globe pauses briefly at center (optional)
    .to("#globe", {
      scale: 1,
      duration: 0.2,
    })
    // Globe moves leftwards at Services section
    .to("#globe", {
      x: "-50vw",
      scale: 0.8,
      rotation: 60,
      ease: "power1.inOut",
    });
});
