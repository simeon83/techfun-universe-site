// ============================================
// TechFun Universe — shared behavior
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initChatWidget();
  initFilterGroups();
  initServiceBuilder();
  initFormFeedback();
});

// ---------- Mobile nav ----------
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    const open = links.style.display === 'flex';
    links.style.display = open ? 'none' : 'flex';
    links.style.flexDirection = 'column';
    links.style.position = 'absolute';
    links.style.top = '64px';
    links.style.left = '0';
    links.style.right = '0';
    links.style.background = '#0d1220';
    links.style.padding = '20px 24px';
    links.style.borderBottom = '1px solid #1e2740';
  });
}

// ---------- AI chat widget ----------
const CHAT_RESPONSES = {
  'what services do you offer?': "We build websites, mobile apps, custom software, AI solutions, digital marketing campaigns, and brand identities — see the Services page for the full breakdown.",
  'how much does a website cost?': "Websites start at $100 for a 5-page starter site. Most clients land in our $250 Professional tier. Check the Pricing page for exact inclusions.",
  'do you build school management systems?': "Yes — our School Management Pro platform handles admissions, grading, attendance, and parent communication. We've onboarded 15+ schools so far."
};

function initChatWidget() {
  const launcher = document.getElementById('chatLauncher');
  const win = document.getElementById('chatWindow');
  const closeBtn = document.getElementById('chatClose');
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');
  const body = document.getElementById('chatBody');
  const suggested = document.querySelectorAll('.chat-suggested button');
  if (!launcher || !win) return;

  launcher.addEventListener('click', () => win.classList.toggle('open'));
  closeBtn?.addEventListener('click', () => win.classList.remove('open'));

  function respondTo(text) {
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-msg user';
    userMsg.textContent = text;
    body.appendChild(userMsg);

    const reply = document.createElement('div');
    reply.className = 'chat-msg';
    const key = text.trim().toLowerCase();
    reply.textContent = CHAT_RESPONSES[key] ||
      "Thanks for the question! Send us a message on the Contact page and our team will get back to you within 24 hours.";
    body.appendChild(reply);
    body.scrollTop = body.scrollHeight;
  }

  suggested.forEach(btn => {
    btn.addEventListener('click', () => respondTo(btn.textContent));
  });

  sendBtn?.addEventListener('click', () => {
    if (input.value.trim()) { respondTo(input.value.trim()); input.value = ''; }
  });
  input?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && input.value.trim()) { respondTo(input.value.trim()); input.value = ''; }
  });
}

// ---------- Generic filter pills (Portfolio / Blog) ----------
function initFilterGroups() {
  document.querySelectorAll('[data-filter-group]').forEach(group => {
    const pills = group.querySelectorAll('.filter-pill');
    const targetSelector = group.dataset.filterGroup;
    const items = document.querySelectorAll(targetSelector);

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const cat = pill.dataset.filter;
        items.forEach(item => {
          item.style.display = (cat === 'all' || item.dataset.category === cat) ? '' : 'none';
        });
      });
    });
  });

  // search box filtering (blog)
  const search = document.getElementById('blogSearch');
  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      document.querySelectorAll('[data-search-item]').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }
}

// ---------- Services inquiry builder ----------
function initServiceBuilder() {
  const rows = document.querySelectorAll('.service-row');
  const selectedList = document.getElementById('selectedList');
  const emptyMsg = document.getElementById('selectionEmpty');
  const sendInquiry = document.getElementById('sendInquiry');
  if (!rows.length || !selectedList) return;

  const selected = new Set();

  function render() {
    selectedList.innerHTML = '';
    if (selected.size === 0) {
      emptyMsg.style.display = 'block';
    } else {
      emptyMsg.style.display = 'none';
      selected.forEach(name => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${name}</span>`;
        const btn = document.createElement('button');
        btn.textContent = '✕';
        btn.addEventListener('click', () => {
          selected.delete(name);
          const row = [...rows].find(r => r.dataset.service === name);
          row?.querySelector('.add-btn')?.classList.remove('added');
          row?.classList.remove('selected');
          render();
        });
        li.appendChild(btn);
        selectedList.appendChild(li);
      });
    }
  }

  rows.forEach(row => {
    const btn = row.querySelector('.add-btn');
    const name = row.dataset.service;
    btn?.addEventListener('click', () => {
      if (selected.has(name)) {
        selected.delete(name);
        btn.classList.remove('added');
        row.classList.remove('selected');
      } else {
        selected.add(name);
        btn.classList.add('added');
        row.classList.add('selected');
      }
      render();
    });
  });

  sendInquiry?.addEventListener('click', () => {
    if (selected.size === 0) {
      alert('Select at least one service to build your inquiry.');
      return;
    }
    window.location.href = 'contact.html?services=' + encodeURIComponent([...selected].join(', '));
  });

  render();
}

// ---------- Form feedback (contact / login) ----------
function encodeFormData(form) {
  const data = new FormData(form);
  return new URLSearchParams(data).toString();
}

function initFormFeedback() {
  const contactForm = document.getElementById('contactForm');
  contactForm?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const original = btn.innerHTML;
    btn.innerHTML = 'Sending…';
    btn.disabled = true;

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encodeFormData(contactForm)
    })
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        btn.innerHTML = 'Sent ✓';
        contactForm.reset();
      })
      .catch(() => {
        btn.innerHTML = 'Something went wrong — try again';
      })
      .finally(() => {
        setTimeout(() => { btn.innerHTML = original; btn.disabled = false; }, 3000);
      });
  });

  const loginForm = document.getElementById('loginForm');
  loginForm?.addEventListener('submit', e => {
    e.preventDefault();
    alert('This is a demo login form — connect it to your auth provider to make it functional.');
  });
}
