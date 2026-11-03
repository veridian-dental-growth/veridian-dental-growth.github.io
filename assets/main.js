/* Veridian Dental Growth — interactions */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var EMAIL = "rapheal.i.chukwuka@gmail.com";

  /* ----- Year ----- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ----- Nav: scrolled state, progress bar, mobile toggle ----- */
  var nav = document.querySelector(".nav");
  var bar = document.querySelector(".progress");
  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle("is-scrolled", y > 20);
    if (bar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (h > 0 ? y / h : 0) + ")";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var toggle = document.querySelector(".nav__toggle");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); });
    });
  }

  /* ----- Split headings into animated words ----- */
  document.querySelectorAll("[data-split]").forEach(function (el) {
    var i = 0;
    function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span"); w.className = "w";
            var s = document.createElement("span"); s.textContent = part; s.style.setProperty("--i", i++);
            w.appendChild(s); frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && !child.classList.contains("w")) {
          walk(child);
        }
      });
    }
    walk(el);
    el.classList.add("split");
  });

  /* ----- Reveal on scroll ----- */
  var revealEls = document.querySelectorAll("[data-reveal], [data-split]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ----- Pointer glow on cards and buttons ----- */
  document.querySelectorAll(".card").forEach(function (c) {
    c.addEventListener("pointermove", function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty("--mx", (e.clientX - r.left) + "px");
      c.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });
  document.querySelectorAll(".btn--primary").forEach(function (b) {
    b.addEventListener("pointermove", function (e) {
      var r = b.getBoundingClientRect();
      b.style.setProperty("--bx", (e.clientX - r.left) + "px");
      b.style.setProperty("--by", (e.clientY - r.top) + "px");
    });
  });

  /* ----- Hero console: tilt + search/rank animation ----- */
  var consoleEl = document.querySelector(".console");
  if (consoleEl && !reduce && window.matchMedia("(pointer: fine)").matches) {
    var wrap = consoleEl.parentElement;
    wrap.addEventListener("pointermove", function (e) {
      var r = wrap.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      consoleEl.style.transform = "perspective(1100px) rotateY(" + (x * 7) + "deg) rotateX(" + (-y * 7) + "deg)";
    });
    wrap.addEventListener("pointerleave", function () { consoleEl.style.transform = ""; });
  }

  var typed = document.querySelector("[data-type]");
  var list = document.querySelector(".results");
  var chips = document.querySelectorAll(".console__chips .chip");
  if (typed && list) {
    var phrase = typed.getAttribute("data-type");
    var you = list.querySelector(".is-you-target");
    var original = Array.prototype.slice.call(list.children);

    function setRanks() {
      Array.prototype.forEach.call(list.children, function (row, idx) {
        row.querySelector(".result__rank").textContent = "0" + (idx + 1);
      });
    }
    function flip(mutate) {
      var rows = Array.prototype.slice.call(list.children);
      var first = rows.map(function (r) { return r.getBoundingClientRect().top; });
      mutate();
      rows.forEach(function (r, i) {
        var dy = first[i] - r.getBoundingClientRect().top;
        r.style.transition = "none";
        r.style.transform = "translateY(" + dy + "px)";
      });
      void list.offsetHeight;
      rows.forEach(function (r) { r.style.transition = ""; r.style.transform = ""; });
    }
    function reset() {
      original.forEach(function (r) { list.appendChild(r); });
      you.classList.remove("is-you");
      you.querySelector(".result__bar i").style.setProperty("--w", "22%");
      chips.forEach(function (c) { c.classList.remove("is-on"); });
      setRanks();
      typed.textContent = "";
    }
    function run() {
      reset();
      var n = 0;
      var t = setInterval(function () {
        typed.textContent = phrase.slice(0, ++n);
        if (n >= phrase.length) {
          clearInterval(t);
          chips.forEach(function (c, i) { setTimeout(function () { c.classList.add("is-on"); }, 500 + i * 450); });
          setTimeout(function () {
            flip(function () { list.insertBefore(you, list.firstChild); setRanks(); });
            you.classList.add("is-you");
            you.querySelector(".result__bar i").style.setProperty("--w", "92%");
          }, 500 + chips.length * 450 + 300);
          setTimeout(run, 9500);
        }
      }, 75);
    }
    if (reduce) {
      typed.textContent = phrase;
      list.insertBefore(you, list.firstChild); setRanks();
      you.classList.add("is-you");
      chips.forEach(function (c) { c.classList.add("is-on"); });
    } else {
      setTimeout(run, 900);
    }
  }

  /* ----- Services sub-nav: highlight current section ----- */
  var subLinks = document.querySelectorAll(".subnav a");
  if (subLinks.length && "IntersectionObserver" in window) {
    var map = {};
    subLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          subLinks.forEach(function (a) { a.classList.remove("is-active"); });
          var a = map[e.target.id];
          if (a) {
            a.classList.add("is-active");
            var track = a.parentElement;
            track.scrollTo({ left: a.offsetLeft - track.clientWidth / 2 + a.clientWidth / 2, behavior: reduce ? "auto" : "smooth" });
          }
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }

  /* ----- Audit form: send to email via FormSubmit ----- */
  var form = document.querySelector("#audit-form form");
  if (form) {
    var status = form.querySelector(".form-status");
    var btn = form.querySelector("button[type=submit]");
    var btnHTML = btn.innerHTML;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.querySelector("[name=_honey]").value) return;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      btn.disabled = true;
      btn.textContent = "Sending…";
      status.className = "form-status";
      fetch("https://formsubmit.co/ajax/" + EMAIL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (!res.ok || String(res.j.success) === "false") {
            var msg = (res.j && res.j.message) || "";
            if (/activat/i.test(msg)) {
              status.className = "form-status is-err";
              status.innerHTML = "<b>Almost there.</b> This form is waiting for its one-time activation. Please email me directly at <a href=\"mailto:" + EMAIL + "\">" + EMAIL + "</a> for now.";
              return;
            }
            throw new Error(msg || "failed");
          }
          form.reset();
          status.className = "form-status is-ok";
          status.innerHTML = "<b>Thank you, your request is in.</b> I'll review your practice and reply personally by email.";
        })
        .catch(function (err) {
          if (window.console) console.warn("Form error:", err && err.message);
          status.className = "form-status is-err";
          status.innerHTML = "Sorry, the form couldn't send just now. Please email me directly at <a href=\"mailto:" + EMAIL + "\">" + EMAIL + "</a>.";
        })
        .then(function () { btn.disabled = false; btn.innerHTML = btnHTML; });
    });
  }
})();
