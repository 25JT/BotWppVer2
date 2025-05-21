console.log("Hola");

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".btn");
  if (btn) {
    btn.addEventListener("click", () => {
      window.location.href = "principal.html";
    });
  }
});
