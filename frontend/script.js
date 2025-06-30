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
