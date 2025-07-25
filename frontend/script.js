function openNav() {
  document.getElementById("navbar").style.width = "60vw";
}

function closeNav() {
  document.getElementById("navbar").style.width = "0";
}

document.addEventListener("DOMContentLoaded", () => {
  const main = document.querySelector("main");

  document.querySelectorAll(".nav-text a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const id = link.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return console.warn("No element with id:", id);

      const rootFs = parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );
      const offsetPx = rootFs * 3;

      const y = target.offsetTop - offsetPx;

      main.scrollTo({ top: y, behavior: "smooth" });

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
