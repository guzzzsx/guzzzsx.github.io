const header = document.querySelector('.site-header');
const revealItems = document.querySelectorAll('.reveal');
const cursorRing = document.querySelector('.cursor-ring');
const cursorDot = document.querySelector('.cursor-dot');
const interactiveElements = document.querySelectorAll('a, button, input, textarea, .service-card, .project-card, .tech-card');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

const setHeaderState = () => {
  if (window.scrollY > 20) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
};

const revealOnScroll = () => {
  revealItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    if (rect.top < window.innerHeight - 80) {
      item.classList.add('is-visible');
    }
  });
};

const handleMouseMove = (event) => {
  cursorRing.style.left = `${event.clientX}px`;
  cursorRing.style.top = `${event.clientY}px`;
  cursorDot.style.left = `${event.clientX}px`;
  cursorDot.style.top = `${event.clientY}px`;
};

const handleMouseEnter = () => {
  document.body.classList.add('cursor-hover');
};

const handleMouseLeave = () => {
  document.body.classList.remove('cursor-hover');
};

if (window.matchMedia('(pointer: fine)').matches) {
  document.addEventListener('mousemove', handleMouseMove);
  interactiveElements.forEach((element) => {
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
  });
}

window.addEventListener('scroll', () => {
  setHeaderState();
  revealOnScroll();
});

window.addEventListener('load', () => {
  setHeaderState();
  revealOnScroll();
});

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    menuToggle.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      menuToggle.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const form = document.querySelector('#contact-form');
const formNote = document.querySelector('.form-note');

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    formNote.textContent = 'Gracias por el mensaje. Responderé pronto.';
    form.reset();
  });
}

const year = document.querySelector('[data-year]');
if (year) {
  year.textContent = new Date().getFullYear();
}

const modal = document.createElement('div');
modal.className = 'image-modal';
modal.innerHTML = `
  <div class="image-modal-content">
    <button class="image-modal-close" aria-label="Cerrar imagen">×</button>
    <img src="" alt="Vista ampliada" />
  </div>
`;
document.body.appendChild(modal);

const modalImage = modal.querySelector('img');
const modalClose = modal.querySelector('.image-modal-close');

const openModal = (src, alt) => {
  modalImage.src = src;
  modalImage.alt = alt;
  modal.classList.add('active');
};

const closeModal = () => {
  modal.classList.remove('active');
  modalImage.src = '';
};

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal) closeModal();
});

document.querySelectorAll('.project-media img').forEach((image) => {
  image.style.cursor = 'pointer';
  image.addEventListener('click', () => openModal(image.src, image.alt));
});

const projectMediaWrappers = document.querySelectorAll('.project-media-wrapper');
projectMediaWrappers.forEach((wrapper) => {
  const track = wrapper.querySelector('.project-media');
  const prevButton = wrapper.querySelector('.project-image-nav.prev');
  const nextButton = wrapper.querySelector('.project-image-nav.next');

  if (!track || !prevButton || !nextButton) return;

  const step = () => Math.min(track.clientWidth * 0.85, 360);

  prevButton.addEventListener('click', () => {
    track.scrollBy({ left: -step(), behavior: 'smooth' });
  });

  nextButton.addEventListener('click', () => {
    track.scrollBy({ left: step(), behavior: 'smooth' });
  });
});
