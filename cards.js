// GSAP Stagger Animation
gsap.from(".card", {
  opacity: 0,
  y: 80,
  duration: 1,
  stagger: 0.3,
  ease: "power4.out"
});

// Count Up Animation
document.querySelectorAll(".count").forEach(counter => {
  gsap.to(counter, {
    innerText: counter.dataset.count,
    duration: 2,
    snap: { innerText: 1 },
    ease: "power1.out"
  });
});

// 3D Tilt + Parallax
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("mousemove", e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = -(y / rect.height - 0.5) * 15;
    const rotateY = (x / rect.width - 0.5) * 15;

    card.style.transform = `
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
    `;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "rotateX(0) rotateY(0)";
  });
});

// Dark Mode Toggle
document.querySelector(".dark-toggle").onclick = () => {
  document.body.classList.toggle("dark");
};
