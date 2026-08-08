// TechFun Universe — shared site behavior

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mkjwogzo';

function submitToFormspree(form) {
  return fetch(FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: new FormData(form),
  }).then(async (res) => {
    let data = {};
    try { data = await res.json(); } catch (_) { /* no JSON body */ }
    return { ok: res.ok, data };
  });
}

function formspreeErrorMessage(data) {
  if (data && Array.isArray(data.errors) && data.errors.length) {
    return data.errors.map(e => e.message).join(', ');
  }
  return "Something went wrong — please try again, or reach us directly by phone or WhatsApp.";
}

document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }

  // Nav "Solutions" dropdown
  document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
    const trigger = dropdown.querySelector('.nav-dropdown-trigger');
    trigger?.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = dropdown.classList.contains('open');
      document.querySelectorAll('.nav-dropdown.open').forEach(d => {
        if (d !== dropdown) {
          d.classList.remove('open');
          d.querySelector('.nav-dropdown-trigger')?.setAttribute('aria-expanded', 'false');
        }
      });
      dropdown.classList.toggle('open', !isOpen);
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });
  });
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-dropdown.open').forEach(d => {
      if (!d.contains(e.target)) {
        d.classList.remove('open');
        d.querySelector('.nav-dropdown-trigger')?.setAttribute('aria-expanded', 'false');
      }
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav-dropdown.open').forEach(d => {
        d.classList.remove('open');
        d.querySelector('.nav-dropdown-trigger')?.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // Sticky header shadow/blur on scroll
  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    const onScroll = () => siteHeader.classList.toggle('scrolled', window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Animated stat counters (respect reduced motion)
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const animate = (el) => {
      const target = parseInt(el.getAttribute('data-count'), 10);
      const suffix = el.getAttribute('data-suffix') || '';
      if (prefersReduced) { el.textContent = target + suffix; return; }
      let start = 0;
      const duration = 1200;
      const startTime = performance.now();
      const step = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(c => io.observe(c));
  }

  // Portfolio filtering (used on portfolio.html)
  const filterBtns = document.querySelectorAll('[data-filter]');
  const portfolioItems = document.querySelectorAll('[data-category]');
  if (filterBtns.length && portfolioItems.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const filter = btn.getAttribute('data-filter');
        portfolioItems.forEach(item => {
          const show = filter === 'all' || item.getAttribute('data-category') === filter;
          item.style.display = show ? '' : 'none';
        });
      });
    });
  }

  // Scroll-triggered reveal animations
  const revealTargets = document.querySelectorAll('.reveal, .reveal-group');
  if (revealTargets.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(el => revealObserver.observe(el));
  }

  // Newsletter subscribe (Formspree via fetch, with inline success animation)
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = newsletterForm.querySelector('button[type="submit"]');
      const originalLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Subscribing...';

      submitToFormspree(newsletterForm)
        .then(({ ok, data }) => {
          if (!ok) { submitBtn.textContent = 'Try again'; return; }
          newsletterForm.reset();
          let successEl = newsletterForm.parentElement.querySelector('.newsletter-success');
          if (!successEl) {
            successEl = document.createElement('div');
            successEl.className = 'newsletter-success';
            successEl.innerHTML = '✓ Subscribed! Welcome aboard.';
            newsletterForm.after(successEl);
          }
          requestAnimationFrame(() => successEl.classList.add('show'));
          setTimeout(() => successEl.classList.remove('show'), 4000);
        })
        .catch(() => {
          submitBtn.textContent = 'Try again';
        })
        .finally(() => {
          setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;
          }, 1200);
        });
    });
  }

  // Main contact form (Formspree via fetch, with inline success/error feedback)
  const contactForm = document.getElementById('contactForm');
  const contactFeedback = document.getElementById('contactFormFeedback');
  if (contactForm && contactFeedback) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      contactFeedback.textContent = '';
      contactFeedback.className = 'form-feedback';

      submitToFormspree(contactForm)
        .then(({ ok, data }) => {
          if (ok) {
            contactForm.reset();
            contactFeedback.textContent = "✓ Thanks! Your message is in — we usually respond within one business day.";
            contactFeedback.classList.add('success');
          } else {
            contactFeedback.textContent = formspreeErrorMessage(data);
            contactFeedback.classList.add('error');
          }
        })
        .catch(() => {
          contactFeedback.textContent = 'Network error — please try again, or reach us directly by phone or WhatsApp.';
          contactFeedback.classList.add('error');
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        });
    });
  }

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-question');
    q?.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i !== item && i.classList.remove('open'));
      item.classList.toggle('open', !isOpen);
    });
  });

  // Quick Quote modal
  const quickQuoteModal = document.getElementById('quickQuoteModal');
  if (quickQuoteModal) {
    const openers = document.querySelectorAll('[data-modal-open="quickQuoteModal"]');
    const closers = quickQuoteModal.querySelectorAll('[data-modal-close]');
    const qqForm = quickQuoteModal.querySelector('form');
    const qqFeedback = document.getElementById('quickQuoteFeedback');

    const openModal = () => {
      quickQuoteModal.classList.add('open');
      quickQuoteModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      quickQuoteModal.querySelector('input, select, textarea')?.focus();
    };
    const closeModal = () => {
      quickQuoteModal.classList.remove('open');
      quickQuoteModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    };

    openers.forEach(btn => btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    }));
    closers.forEach(btn => btn.addEventListener('click', closeModal));
    quickQuoteModal.addEventListener('click', (e) => {
      if (e.target === quickQuoteModal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && quickQuoteModal.classList.contains('open')) closeModal();
    });

    if (qqForm && qqFeedback) {
      qqForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = qqForm.querySelector('button[type="submit"]');
        const originalLabel = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        qqFeedback.textContent = '';
        qqFeedback.className = 'form-feedback';

        submitToFormspree(qqForm)
          .then(({ ok, data }) => {
            if (ok) {
              qqForm.reset();
              qqFeedback.textContent = "✓ Got it! We'll reach out shortly.";
              qqFeedback.classList.add('success');
              setTimeout(() => {
                closeModal();
                qqFeedback.textContent = '';
                qqFeedback.className = 'form-feedback';
              }, 1800);
            } else {
              qqFeedback.textContent = formspreeErrorMessage(data);
              qqFeedback.classList.add('error');
            }
          })
          .catch(() => {
            qqFeedback.textContent = 'Network error — please try again.';
            qqFeedback.classList.add('error');
          })
          .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;
          });
      });
    }
  }
});
