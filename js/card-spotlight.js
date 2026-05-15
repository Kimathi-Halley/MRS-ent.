// Cursor-tracking red glow inside .service-item and .contact-card.
// Sets CSS vars --mouse-x / --mouse-y so the radial-gradient on ::before
// follows the pointer. Plain hover handles opacity; this just moves the center.
(() => {
  const cards = document.querySelectorAll('.service-item, .contact-card');
  if (!cards.length) return;

  cards.forEach(card => {
    card.addEventListener('pointermove', e => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
    });

    card.addEventListener('pointerleave', () => {
      card.style.removeProperty('--mouse-x');
      card.style.removeProperty('--mouse-y');
    });
  });
})();
