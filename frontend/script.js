function openNav() {
  document.getElementById("navbar").classList.add("open");
}
function closeNav() {
  document.getElementById("navbar").classList.remove("open");
}
// Variable to store the Locomotive Scroll instance
let locoScroll;
// Function to expose Locomotive Scroll instance to this script
function setLocomotiveScrollInstance(instance) {
  locoScroll = instance;
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize mobile menu behavior
  const menuButton = document.querySelector("#menu-button");
  if (menuButton) {
    menuButton.addEventListener("click", openNav);
  }
  const closeButton = document.querySelector(".closebtn");
  if (closeButton) {
    closeButton.addEventListener("click", closeNav);
  }

  // Add a flag to track if navigation functions are ready
  let navigationReady = false;

  // Check if snapToSection is available periodically
  const checkNavigationReady = setInterval(() => {
    if (window.snapToSection && window.disableScrollSnapping !== undefined) {
      navigationReady = true;
      clearInterval(checkNavigationReady);
      console.log("Navigation functions are ready");
    }
  }, 100);

  document.querySelectorAll(".nav-text a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      // Close mobile menu if it's open
      if (document.getElementById("navbar").classList.contains("open")) {
        closeNav();
      }

      const id = link.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return console.warn("No element with id:", id);

      // Find all sections and their positions
      const sections = document.querySelectorAll(".sections");
      const targetIndex = Array.from(sections).findIndex(
        (section) => section.id === id
      );

      if (targetIndex !== -1) {
        // Disable scroll snapping during navigation
        window.disableScrollSnapping = true;

        // Check if navigation functions are ready
        if (navigationReady && window.snapToSection) {
          console.log("Using snapToSection for navigation");
          // Use the snapToSection function for consistency
          window.snapToSection(targetIndex, () => {
            // Re-enable scroll snapping after a short delay
            setTimeout(() => {
              window.disableScrollSnapping = false;
            }, 100);
          });
        } else if (locoScroll) {
          console.log("Using fallback navigation with locoScroll");
          // Fallback: use locoScroll directly
          const navbarHeight = document.querySelector("header").offsetHeight;
          locoScroll.scrollTo(target, {
            offset: -navbarHeight,
            duration: 1.2,
            easing: [0.25, 0.0, 0.35, 1.0],
            disableLerp: false,
            callback: () => {
              // Re-enable scroll snapping after a short delay
              setTimeout(() => {
                window.disableScrollSnapping = false;
              }, 100);
            },
          });
        } else {
          console.error("Neither snapToSection nor locoScroll is available");
        }
      }

      setTimeout(() => {
        history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );
      }, 0);
    });
  });
});

function switchLanguage(lang) {
  document.querySelectorAll("[lang]").forEach((el) => {
    el.style.display = "none";
  });
  let elements = document.querySelectorAll('[lang="' + lang + '"]');
  if (elements.length === 0) {
    lang = "en";
    elements = document.querySelectorAll('[lang="en"]');
  }
  elements.forEach((el) => {
    el.style.display = "";
  });
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
  localStorage.setItem("preferredLang", lang);
}

window.addEventListener("DOMContentLoaded", function () {
  let lang = localStorage.getItem("preferredLang");
  if (!lang) {
    const browserLang = navigator.language || navigator.userLanguage;
    lang = browserLang.split("-")[0];
  }
  switchLanguage(lang);
});

document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    const selectedLang = this.dataset.lang;
    switchLanguage(selectedLang);
  });
});
