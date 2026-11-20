/* ==========================================================
   NeuralFlow AI — Main Script
   ========================================================== */

/* ---------- PART 1 : init پس از لود DOM ---------- */
document.addEventListener("DOMContentLoaded", () => {
  /* 0. Dark / Light Theme Engine */
  const htmlRoot = document.documentElement;
  const themeToggleBtn = document.getElementById("theme-toggle");

  function applyTheme(isLight) {
    if (isLight) {
      htmlRoot.classList.remove("dark");
      htmlRoot.classList.add("light");
      themeToggleBtn.setAttribute("title", "سوئیچ به تم تاریک (Dark Mode)");
      themeToggleBtn.setAttribute("aria-label", "سوئیچ به تم تاریک");
    } else {
      htmlRoot.classList.remove("light");
      htmlRoot.classList.add("dark");
      themeToggleBtn.setAttribute("title", "سوئیچ به تم روشن (Light Mode)");
      themeToggleBtn.setAttribute("aria-label", "سوئیچ به تم روشن");
    }
  }

  const savedTheme = localStorage.getItem("nf_theme");
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialLight =
    savedTheme === "light" || (!savedTheme && !prefersDark && false);
  applyTheme(initialLight);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const isCurrentlyLight = htmlRoot.classList.contains("light");
      const nextLight = !isCurrentlyLight;
      applyTheme(nextLight);
      localStorage.setItem("nf_theme", nextLight ? "light" : "dark");
    });
  }

  /* 1. Scroll Progress Bar */
  const progressBar = document.getElementById("scroll-progress");
  window.addEventListener(
    "scroll",
    () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      if (progressBar) progressBar.style.width = progress + "%";
    },
    { passive: true },
  );

  /* 1.5. 3D Scroll Rotation for Telemetry Console */
  const telemetrySection = document.getElementById("telemetry");
  const telemetry3dWrapper = document.getElementById("telemetry-3d-wrapper");
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (telemetrySection && telemetry3dWrapper && !prefersReducedMotion) {
    let currentRotateX = 14,
      currentRotateY = 0;
    let targetRotateX = 14,
      targetRotateY = 0;
    let currentScale = 0.96,
      targetScale = 0.96;
    let isTicking = false;

    function update3dRotation() {
      const rect = telemetrySection.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const sectionCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;
      const distanceFromCenter =
        (sectionCenter - viewportCenter) / (windowHeight * 0.7);
      const clampedDist = Math.max(-1, Math.min(1, distanceFromCenter));

      targetRotateX = Math.max(0, clampedDist * 14);
      targetRotateY = 0;
      targetScale = 1 - Math.abs(clampedDist) * 0.04;

      currentRotateX += (targetRotateX - currentRotateX) * 0.15;
      currentRotateY += (targetRotateY - currentRotateY) * 0.15;
      currentScale += (targetScale - currentScale) * 0.15;

      telemetry3dWrapper.style.transform = `rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg) scale3d(${currentScale.toFixed(3)}, ${currentScale.toFixed(3)}, 1)`;

      if (
        Math.abs(targetRotateX - currentRotateX) > 0.02 ||
        Math.abs(targetScale - currentScale) > 0.001
      ) {
        requestAnimationFrame(update3dRotation);
      } else {
        isTicking = false;
      }
    }

    function onScrollOrResize() {
      if (!isTicking) {
        isTicking = true;
        requestAnimationFrame(update3dRotation);
      }
    }

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    onScrollOrResize();
  } else if (telemetry3dWrapper) {
    telemetry3dWrapper.style.transform = "none";
  }

  /* 2. Mouse Spotlight Effect */
  const cards = document.querySelectorAll(".spotlight-card");
  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    });
  });

  /* 3. Scroll Reveal */
  const revealElements = document.querySelectorAll(".reveal-on-scroll");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-revealed");
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );
  revealElements.forEach((el) => observer.observe(el));

  /* 4. Count-Up Animation */
  const animateCountUp = (el, duration = 2000) => {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const startTime = performance.now();

    const frame = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      el.textContent = (easeOut * target).toFixed(decimals);
      if (progress < 1) requestAnimationFrame(frame);
      else el.textContent = target.toFixed(decimals);
    };
    requestAnimationFrame(frame);
  };

  const benchmarkCard = document.querySelector(
    "#benchmarks .spotlight-card.rounded-3xl",
  );
  if (benchmarkCard) {
    let benchmarksTriggered = false;
    const benchmarkObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !benchmarksTriggered) {
            benchmarksTriggered = true;
            benchmarkCard.querySelectorAll(".counter-num").forEach((num) => {
              num.dataset.counted = "true";
              animateCountUp(num, 2000);
            });
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.28 },
    );
    benchmarkObserver.observe(benchmarkCard);
  }

  const remainingCounters = document.querySelectorAll(".counter-num");
  const generalCounterObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = "true";
          animateCountUp(entry.target, 1600);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25 },
  );

  remainingCounters.forEach((counter) => {
    if (!benchmarkCard || !benchmarkCard.contains(counter)) {
      generalCounterObserver.observe(counter);
    }
  });

  /* 5. SDK Switcher */
  const sdkSnippets = {
    python: `<span class="text-tertiary">from</span> neuralflow <span class="text-tertiary">import</span> AsyncEngine, AgentCluster<br/><span class="text-outline"># Instant 3ms coldstart</span><br/>client = AsyncEngine(api_key=<span class="text-secondary-fixed">"nf_live_sec_***"</span>)<br/>stream = <span class="text-tertiary">await</span> client.spawn_agents(nodes=<span class="text-primary-fixed">16</span>, max_latency=<span class="text-primary-fixed">10</span>)`,
    typescript: `<span class="text-tertiary">import</span> { NeuralClient } <span class="text-tertiary">from</span> <span class="text-secondary-fixed">'@neuralflow/sdk'</span>;<br/><span class="text-outline">// Edge runtime enabled</span><br/><span class="text-tertiary">const</span> nf = <span class="text-tertiary">new</span> NeuralClient({ region: <span class="text-secondary-fixed">'global-anycast'</span> });<br/><span class="text-tertiary">const</span> { tokens } = <span class="text-tertiary">await</span> nf.pipeline.stream({ model: <span class="text-secondary-fixed">'qwen-2.5-72b'</span> });`,
    rust: `<span class="text-tertiary">use</span> neuralflow::{Cluster, DispatchStrategy};<br/><span class="text-outline">// Zero-copy token deserialization</span><br/><span class="text-tertiary">let</span> engine = Cluster::connect_tokio(<span class="text-secondary-fixed">"eu-central"</span>).<span class="text-tertiary">await</span>?;<br/><span class="text-tertiary">let</span> mut stream = engine.route_parallel(&payload).<span class="text-tertiary">await</span>?;`,
    go: `<span class="text-tertiary">package</span> main<br/><span class="text-tertiary">import</span> <span class="text-secondary-fixed">"github.com/neuralflow/client-go/v2"</span><br/><span class="text-outline">// High throughput gRPC multiplexing</span><br/>nf, _ := neuralflow.NewContext(ctx, &neuralflow.Config{Workers: <span class="text-primary-fixed">128</span>})<br/>res, _ := nf.StreamInference(prompt)`,
  };

  const sdkButtons = document.querySelectorAll(".sdk-tab-btn");
  const codeBlock = document.getElementById("sdk-code-block");
  sdkButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      sdkButtons.forEach((b) => {
        b.classList.remove("bg-white/10", "text-white");
        b.classList.add("bg-surface-container-high/60", "text-outline");
      });
      btn.classList.add("bg-white/10", "text-white");
      btn.classList.remove("bg-surface-container-high/60", "text-outline");
      const lang = btn.dataset.lang;
      if (codeBlock && sdkSnippets[lang]) {
        codeBlock.innerHTML = `<code>${sdkSnippets[lang]}</code>`;
      }
    });
  });

  /* 6. Pricing Toggle (نسخه اول) */
  const toggleMonthly = document.getElementById("toggle-monthly");
  const toggleAnnual = document.getElementById("toggle-annual");
  const priceElements = document.querySelectorAll(".price-val");

  if (toggleMonthly && toggleAnnual) {
    toggleMonthly.addEventListener("click", () => {
      toggleMonthly.className =
        "px-5 py-1.5 rounded-full bg-secondary text-on-secondary font-label-tag text-[12px] font-bold transition-all shadow-sm";
      toggleAnnual.className =
        "px-5 py-1.5 rounded-full text-on-surface-variant hover:text-white font-label-tag text-[12px] font-semibold transition-all flex items-center gap-1.5";
      priceElements.forEach((el) => {
        el.textContent = "$" + el.dataset.monthly;
      });
    });

    toggleAnnual.addEventListener("click", () => {
      toggleAnnual.className =
        "px-5 py-1.5 rounded-full bg-secondary text-on-secondary font-label-tag text-[12px] font-bold transition-all shadow-sm flex items-center gap-1.5";
      toggleMonthly.className =
        "px-5 py-1.5 rounded-full text-on-surface-variant hover:text-white font-label-tag text-[12px] font-semibold transition-all";
      priceElements.forEach((el) => {
        el.textContent = "$" + el.dataset.annual;
      });
    });
  }

  /* 7. Load Run Simulation */
  const runBenchBtn = document.getElementById("run-bench-btn");
  const benchBtnText = document.getElementById("bench-btn-text");
  if (runBenchBtn && benchBtnText) {
    runBenchBtn.addEventListener("click", () => {
      benchBtnText.textContent =
        "در حال شبیه‌سازی تست بارگذاری (20,000 req/s)...";
      runBenchBtn.classList.add("border-secondary", "bg-secondary/10");
      setTimeout(() => {
        benchBtnText.textContent = "تست با موفقیت ثبت شد (9.1ms P99)";
        runBenchBtn.classList.remove("border-secondary", "bg-secondary/10");
        setTimeout(() => {
          benchBtnText.textContent = "اجرای تست بارگذاری (Load Run)";
        }, 2500);
      }, 1200);
    });
  }

  /* 8. Copy NPM Command */
  const copyBtn = document.getElementById("copy-npm-btn");
  const copyBtnText = document.getElementById("copy-btn-text");
  if (copyBtn && copyBtnText) {
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText("npm install @neuralflow/core").then(() => {
        copyBtnText.textContent = "کپی شد!";
        copyBtn.classList.add("text-secondary");
        setTimeout(() => {
          copyBtnText.textContent = "Copy";
          copyBtn.classList.remove("text-secondary");
        }, 2000);
      });
    });
  }
});

/* ---------- PART 2 : Pricing Toggle (نسخه دوم - دقیق‌تر) ---------- */
(function () {
  const tm = document.getElementById("toggle-monthly");
  const ta = document.getElementById("toggle-annual");
  const pvals = document.querySelectorAll(".price-val");
  if (!tm || !ta) return;

  function setAnnualActive(isAnnual) {
    if (isAnnual) {
      ta.classList.add(
        "bg-secondary",
        "text-on-secondary",
        "font-bold",
        "is-active",
      );
      ta.classList.remove("text-on-surface-variant", "font-semibold");
      tm.classList.remove("bg-secondary", "text-on-secondary", "font-bold");
      tm.classList.add("text-on-surface-variant", "font-semibold");
      pvals.forEach((el) => {
        if (el.dataset.annual) el.textContent = "$" + el.dataset.annual;
      });
    } else {
      tm.classList.add("bg-secondary", "text-on-secondary", "font-bold");
      tm.classList.remove("text-on-surface-variant", "font-semibold");
      ta.classList.remove(
        "bg-secondary",
        "text-on-secondary",
        "font-bold",
        "is-active",
      );
      ta.classList.add("text-on-surface-variant", "font-semibold");
      pvals.forEach((el) => {
        if (el.dataset.monthly) el.textContent = "$" + el.dataset.monthly;
      });
    }
  }

  tm.addEventListener(
    "click",
    (e) => {
      e.stopImmediatePropagation();
      setAnnualActive(false);
    },
    true,
  );
  ta.addEventListener(
    "click",
    (e) => {
      e.stopImmediatePropagation();
      setAnnualActive(true);
    },
    true,
  );
  setAnnualActive(true);
})();
