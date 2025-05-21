document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".btnvolver");
  if (btn) {
    btn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
});
