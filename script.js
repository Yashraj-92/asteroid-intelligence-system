const API_BASE = "http://localhost:5000/api";

// ===== ELEMENTS =====
const totalCount = document.getElementById("totalCount");
const hazardCount = document.getElementById("hazardCount");
const closestAsteroid = document.getElementById("closestAsteroid");
const fastestSpeed = document.getElementById("fastestSpeed");

const asteroidTableBody = document.getElementById("asteroidTableBody");
const alertBanner = document.getElementById("alertBanner");
const dateLabel = document.getElementById("dateLabel");

const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const searchInput = document.getElementById("searchInput");
const hazardousOnlyCheckbox = document.getElementById("hazardousOnly");

const loadRangeBtn = document.getElementById("loadRangeBtn");
const refreshBtn = document.getElementById("refreshBtn");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const heroExploreBtn = document.getElementById("heroExploreBtn");
const downloadPdfBtn = document.getElementById("downloadPdfBtn");

const explainAiBtn = document.getElementById("explainAiBtn");
const aiInsightText = document.getElementById("aiInsightText");

const insightClosest = document.getElementById("insightClosest");
const insightFastest = document.getElementById("insightFastest");
const insightLargest = document.getElementById("insightLargest");
const insightHazard = document.getElementById("insightHazard");

const modal = document.getElementById("asteroidModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalBackdrop = document.getElementById("modalBackdrop");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const modalDistance = document.getElementById("modalDistance");
const modalSpeed = document.getElementById("modalSpeed");
const modalSize = document.getElementById("modalSize");
const modalStatus = document.getElementById("modalStatus");
const modalNasaLink = document.getElementById("modalNasaLink");

const chatBtn = document.getElementById("chatbot-btn");
const chatWindow = document.getElementById("chat-window");
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");
const voiceBtn = document.getElementById("voiceBtn");
const chatBody = document.getElementById("chat-body");
const suggestionButtons = document.querySelectorAll(".suggestion-btn");

const enterDashboardBtn = document.getElementById("enterDashboardBtn");
const landingScreen = document.getElementById("landingScreen");
const dashboardSection = document.getElementById("dashboardSection");
const backToLandingBtn = document.getElementById("backToLandingBtn");

const floatTotal = document.getElementById("floatTotal");
const floatHazard = document.getElementById("floatHazard");
const floatClosest = document.getElementById("floatClosest");

// ===== STATE =====
let currentData = null;
let currentFilteredAsteroids = [];
let hazardChart = null;
let speedChart = null;
let distanceChart = null;
let dailyTrendChart = null;
let earthSceneState = null;

// ===== HELPERS =====
function setDefaultDates() {
  const today = new Date();
  const end = new Date(today);
  end.setDate(today.getDate() + 2);

  startDateInput.value = toDateInput(today);
  endDateInput.value = toDateInput(end);
}

function toDateInput(date) {
  return date.toISOString().split("T")[0];
}

function diffDays(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const ms = e - s;
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function showAlert(msg) {
  alertBanner.textContent = msg;
  alertBanner.classList.remove("hidden");
}

function hideAlert() {
  alertBanner.classList.add("hidden");
}

function toggleTheme() {
  document.body.classList.toggle("light-mode");
  if (currentFilteredAsteroids.length) {
    renderEarth(currentFilteredAsteroids);
  }
}

function destroyChartInstance(chart) {
  if (chart) chart.destroy();
}

function safeText(v, fallback = "--") {
  return v ?? fallback;
}

// ===== LANDING TRANSITION =====
if (enterDashboardBtn && landingScreen && dashboardSection) {
  enterDashboardBtn.addEventListener("click", () => {
    landingScreen.classList.add("landing-transition");

    setTimeout(() => {
      landingScreen.classList.add("landing-hidden");
      dashboardSection.classList.remove("hidden-dashboard");
      dashboardSection.classList.add("dashboard-visible");

      document.body.classList.remove("landing-only");
      document.body.style.overflow = "auto";

      setTimeout(() => {
        dashboardSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 120);
    }, 1200);
  });
}

// ===== DATA LOAD =====
async function loadRangeData(start, end) {
  try {
    hideAlert();

    if (!start || !end) {
      showAlert("Please select both start and end date.");
      return;
    }

    if (new Date(end) < new Date(start)) {
      showAlert("End date cannot be before start date.");
      return;
    }

    const days = diffDays(start, end);
    if (days > 6) {
      showAlert("NASA API allows maximum 7 days only. Please choose a smaller date range.");
      return;
    }

    loadRangeBtn.disabled = true;
    refreshBtn.disabled = true;
    loadRangeBtn.textContent = "Loading...";

    const res = await fetch(
      `${API_BASE}/asteroids/range?start_date=${start}&end_date=${end}`
    );

    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error || "NASA data load failed");
    }

    currentData = data;
    dateLabel.textContent = `${data.startDate} to ${data.endDate}`;
    applyFilters();
  } catch (error) {
    console.error(error);
    showAlert("NASA data load failed. Check date range (max 7 days).");
  } finally {
    loadRangeBtn.disabled = false;
    refreshBtn.disabled = false;
    loadRangeBtn.textContent = "Load Range";
  }
}

// ===== FILTER =====
function applyFilters() {
  if (!currentData) return;

  const search = searchInput.value.trim().toLowerCase();

  currentFilteredAsteroids = (currentData.asteroids || []).filter((a) => {
    const matchesName = a.name.toLowerCase().includes(search);
    const matchesHazard = hazardousOnlyCheckbox.checked ? a.hazardous : true;
    return matchesName && matchesHazard;
  });

  renderDashboard(currentFilteredAsteroids);
}

// ===== RENDER =====
function renderDashboard(asteroids) {
  totalCount.textContent = asteroids.length;

  const hazardous = asteroids.filter((a) => a.hazardous);
  hazardCount.textContent = hazardous.length;

  const closest = [...asteroids].sort((a, b) => a.missDistanceKm - b.missDistanceKm)[0];
  const fastest = [...asteroids].sort((a, b) => b.speedKph - a.speedKph)[0];
  const largest = [...asteroids].sort((a, b) => b.diameterMaxMeters - a.diameterMaxMeters)[0];

  closestAsteroid.textContent = closest
    ? `${Math.round(closest.missDistanceKm).toLocaleString()} km`
    : "--";

  fastestSpeed.textContent = fastest
    ? `${Math.round(fastest.speedKph).toLocaleString()} kph`
    : "--";

  insightClosest.textContent = safeText(closest?.name);
  insightFastest.textContent = safeText(fastest?.name);
  insightLargest.textContent = safeText(largest?.name);
  insightHazard.textContent = hazardous.length > 0 ? `${hazardous.length} hazardous asteroid(s)` : "Safe";

  renderTable(asteroids);
  renderCharts(asteroids);
  renderEarth(asteroids);

  if (floatTotal) floatTotal.textContent = asteroids.length;

if (floatHazard) {
  floatHazard.textContent = asteroids.filter(a => a.hazardous).length;
}

if (floatClosest) {
  const closest = [...asteroids].sort((a,b)=>a.missDistanceKm-b.missDistanceKm)[0];
  floatClosest.textContent = closest ? closest.name : "--";
}
}

function renderTable(asteroids) {
  asteroidTableBody.innerHTML = "";

  asteroids.forEach((a) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${a.name}</td>
      <td>${a.closeApproachDate}</td>
      <td>${Math.round(a.missDistanceKm).toLocaleString()}</td>
      <td>${Math.round(a.speedKph).toLocaleString()}</td>
      <td>${Math.round(a.diameterMaxMeters)}</td>
      <td class="${a.hazardous ? "status-danger" : "status-safe"}">
        ${a.hazardous ? "Hazardous" : "Safe"}
      </td>
    `;

    row.onclick = () => openModal(a);
    asteroidTableBody.appendChild(row);
  });
}

// ===== CHARTS =====
function renderCharts(asteroids) {
  destroyChartInstance(hazardChart);
  destroyChartInstance(speedChart);
  destroyChartInstance(distanceChart);
  destroyChartInstance(dailyTrendChart);

  hazardChart = new Chart(document.getElementById("hazardChart"), {
    type: "doughnut",
    data: {
      labels: ["Hazardous", "Safe"],
      datasets: [
        {
          data: [
            asteroids.filter((a) => a.hazardous).length,
            asteroids.filter((a) => !a.hazardous).length,
          ],
        },
      ],
    },
  });

  const fastestFive = [...asteroids]
    .sort((a, b) => b.speedKph - a.speedKph)
    .slice(0, 5);

  speedChart = new Chart(document.getElementById("speedChart"), {
    type: "bar",
    data: {
      labels: fastestFive.map((a) => a.name),
      datasets: [
        {
          label: "Speed (kph)",
          data: fastestFive.map((a) => Math.round(a.speedKph)),
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
    },
  });

  const closestFive = [...asteroids]
    .sort((a, b) => a.missDistanceKm - b.missDistanceKm)
    .slice(0, 5);

  distanceChart = new Chart(document.getElementById("distanceChart"), {
    type: "bar",
    data: {
      labels: closestFive.map((a) => a.name),
      datasets: [
        {
          label: "Distance (km)",
          data: closestFive.map((a) => Math.round(a.missDistanceKm)),
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
    },
  });

  dailyTrendChart = new Chart(document.getElementById("dailyTrendChart"), {
    type: "line",
    data: {
      labels: (currentData?.dailyCounts || []).map((d) => d.date),
      datasets: [
        {
          label: "Total Asteroids",
          data: (currentData?.dailyCounts || []).map((d) => d.count),
          tension: 0.35,
        },
        {
          label: "Hazardous",
          data: (currentData?.dailyCounts || []).map((d) => d.hazardous),
          tension: 0.35,
        },
      ],
    },
  });
}

// ===== 3D EARTH =====
function renderEarth(asteroids) {
  const container = document.getElementById("orbitScene");
  if (!container || typeof THREE === "undefined") return;

  if (earthSceneState?.renderer) {
    try {
      earthSceneState.renderer.dispose();
    } catch (_) {}
    container.innerHTML = "";
    earthSceneState = null;
  }

  const width = container.clientWidth || 500;
  const height = container.clientHeight || 340;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  camera.position.z = 6.5;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambient);

  const point = new THREE.PointLight(0xffffff, 2);
  point.position.set(5, 3, 8);
  scene.add(point);

  const starsGeometry = new THREE.BufferGeometry();
  const starsVertices = [];
  for (let i = 0; i < 1000; i++) {
    starsVertices.push(
      (Math.random() - 0.5) * 70,
      (Math.random() - 0.5) * 70,
      (Math.random() - 0.5) * 70
    );
  }
  starsGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starsVertices, 3)
  );

  const starsMaterial = new THREE.PointsMaterial({
    color: document.body.classList.contains("light-mode") ? 0x1d4ed8 : 0xffffff,
    size: 0.05,
    transparent: true,
    opacity: document.body.classList.contains("light-mode") ? 0.35 : 0.9,
  });

  const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);

  const earthGroup = new THREE.Group();
  scene.add(earthGroup);

  const earthGeometry = new THREE.SphereGeometry(1.25, 48, 48);
  const earthMaterial = new THREE.MeshPhongMaterial({
    color: 0x2563eb,
    shininess: 28,
    specular: 0x88ccff,
  });

  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  earthGroup.add(earth);

  const glowGeometry = new THREE.SphereGeometry(1.36, 48, 48);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x60a5fa,
    transparent: true,
    opacity: 0.14,
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  earthGroup.add(glow);

  const wireGeometry = new THREE.SphereGeometry(1.28, 18, 18);
  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: document.body.classList.contains("light-mode") ? 0.08 : 0.12,
  });
  const wire = new THREE.Mesh(wireGeometry, wireMaterial);
  earthGroup.add(wire);

  const asteroidGroup = new THREE.Group();
  scene.add(asteroidGroup);

  asteroids.slice(0, 30).forEach((a, i) => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 12, 12),
      new THREE.MeshStandardMaterial({
        color: a.hazardous ? 0xef4444 : 0xe2e8f0,
        emissive: a.hazardous ? 0x7f1d1d : 0x111111,
        emissiveIntensity: a.hazardous ? 0.6 : 0.12,
      })
    );

    const angle = (i / Math.max(asteroids.length, 1)) * Math.PI * 2;
    const spread = 2 + Math.min((a.missDistanceKm || 0) / 20000000, 1.8);
    const yOffset = Math.sin(i * 1.5) * 0.55;

    mesh.position.set(
      Math.cos(angle) * spread,
      yOffset,
      Math.sin(angle) * spread
    );

    asteroidGroup.add(mesh);
  });

  const ringGeometry = new THREE.TorusGeometry(2.25, 0.01, 8, 100);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x60a5fa,
    transparent: true,
    opacity: 0.25,
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2.4;
  scene.add(ring);

  function animate() {
    if (!earthSceneState) return;
    requestAnimationFrame(animate);

    earth.rotation.y += 0.004;
    wire.rotation.y += 0.0045;
    glow.rotation.y += 0.0035;
    asteroidGroup.rotation.y += 0.002;
    stars.rotation.y += 0.0004;
    ring.rotation.z += 0.0015;

    renderer.render(scene, camera);
  }

  earthSceneState = { scene, camera, renderer };
  animate();

  function onResize() {
    if (!earthSceneState) return;
    const w = container.clientWidth || 500;
    const h = container.clientHeight || 340;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  window.addEventListener("resize", onResize);
}

// ===== MODAL =====
function openModal(a) {
  modalTitle.textContent = a.name;
  modalDate.textContent = `Approach Date: ${a.closeApproachDate}`;
  modalDistance.textContent = `Distance: ${Math.round(a.missDistanceKm).toLocaleString()} km`;
  modalSpeed.textContent = `Speed: ${Math.round(a.speedKph).toLocaleString()} kph`;
  modalSize.textContent = `Size: ${a.diameterMaxMeters.toFixed(2)} m`;
  modalStatus.textContent = `Status: ${a.hazardous ? "Hazardous" : "Safe"}`;
  modalNasaLink.href = a.nasaUrl || "#";
  modal.classList.remove("hidden");
}

if (closeModalBtn) closeModalBtn.onclick = () => modal.classList.add("hidden");
if (modalBackdrop) modalBackdrop.onclick = () => modal.classList.add("hidden");

// ===== AI EXPLAIN =====
async function explainSummary() {
  if (!currentData) return;

  aiInsightText.textContent = "Generating AI insight...";

  const prompt = `
Explain this asteroid dashboard summary strictly in professional English. Do not use Hinglish or mixed language.

Date range: ${currentData.startDate} to ${currentData.endDate}
Total asteroids currently shown: ${currentFilteredAsteroids.length}
Hazardous asteroids: ${currentFilteredAsteroids.filter(a => a.hazardous).length}
Closest asteroid: ${insightClosest.textContent}
Fastest asteroid: ${insightFastest.textContent}
Largest asteroid: ${insightLargest.textContent}
Risk summary: ${insightHazard.textContent}

Keep it presentation-friendly.
`;

  try {
    const res = await fetch(`${API_BASE}/ai-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: prompt }),
    });

    const data = await res.json();
    aiInsightText.textContent = data.reply || "No response.";
  } catch (e) {
    console.error(e);
    aiInsightText.textContent = "AI explanation failed.";
  }
}

// ===== PDF =====
function exportPdf() {
  if (!window.jspdf || !currentData) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Asteroid Intelligence Report", 14, 20);

  doc.setFontSize(11);
  doc.text(`Date Range: ${currentData.startDate} to ${currentData.endDate}`, 14, 32);
  doc.text(`Total Asteroids: ${currentFilteredAsteroids.length}`, 14, 40);
  doc.text(`Hazardous: ${currentFilteredAsteroids.filter(a => a.hazardous).length}`, 14, 48);
  doc.text(`Closest: ${insightClosest.textContent}`, 14, 56);
  doc.text(`Fastest: ${insightFastest.textContent}`, 14, 64);
  doc.text(`Largest: ${insightLargest.textContent}`, 14, 72);

  let y = 88;
  currentFilteredAsteroids.slice(0, 10).forEach((a, i) => {
    const line = `${i + 1}. ${a.name} | ${a.closeApproachDate} | ${Math.round(a.missDistanceKm)} km | ${Math.round(a.speedKph)} kph`;
    doc.text(line, 14, y);
    y += 8;
  });

  doc.save("asteroid-report.pdf");
}

// ===== CHAT =====
function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.textContent = text;
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

async function sendMessage() {
  const msg = chatInput.value.trim();
  if (!msg) return;

  addMessage(msg, "user-msg");

  const q = msg.toLowerCase();

  const total = currentFilteredAsteroids.length;
  const hazardous = currentFilteredAsteroids.filter(a => a.hazardous).length;

  const closest = [...currentFilteredAsteroids].sort((a, b) => a.missDistanceKm - b.missDistanceKm)[0];
  const fastest = [...currentFilteredAsteroids].sort((a, b) => b.speedKph - a.speedKph)[0];
  const largest = [...currentFilteredAsteroids].sort((a, b) => b.diameterMaxMeters - a.diameterMaxMeters)[0];

  let reply = "";

  // ===== SMART INTENT MATCHING =====

  if (q.includes("hazard")) {
    reply = `There are ${hazardous} hazardous asteroids in the current dataset.`;
  }

  else if (q.includes("closest") || q.includes("nearest")) {
    reply = closest
      ? `The closest asteroid is ${closest.name}, approximately ${Math.round(closest.missDistanceKm).toLocaleString()} km away.`
      : "No closest asteroid data available.";
  }

  else if (q.includes("fastest") || q.includes("speed")) {
    reply = fastest
      ? `The fastest asteroid is ${fastest.name}, moving at about ${Math.round(fastest.speedKph).toLocaleString()} kph.`
      : "No speed data available.";
  }

  else if (q.includes("largest") || q.includes("biggest") || q.includes("size")) {
    reply = largest
      ? `The largest asteroid is ${largest.name}, with an estimated size of ${Math.round(largest.diameterMaxMeters)} meters.`
      : "No size data available.";
  }

  else if (q.includes("total") || q.includes("how many")) {
    reply = `There are ${total} asteroids in the current dataset.`;
  }

  else if (q.includes("safe")) {
    reply = `There are ${total - hazardous} non-hazardous asteroids.`;
  }

  else if (q.includes("summary") || q.includes("explain")) {
    reply = `This dataset contains ${total} asteroids, out of which ${hazardous} are hazardous. The closest is ${closest?.name || "unknown"} and the fastest is ${fastest?.name || "unknown"}.`;
  }

  else if (q.includes("hello") || q.includes("hi") || q.includes("assistant")) {
    reply = "Hello! I am your asteroid assistant. Ask me about asteroid data like closest, fastest, hazardous count, or summary.";
  }

  // ===== DEFAULT SMART RESPONSE =====
  else {
    reply = "I didn’t fully understand that. You can ask about asteroid statistics like closest asteroid, fastest asteroid, hazardous count, or summary.";
  }

  addMessage(reply, "ai-msg");
  chatInput.value = "";
}

function setupVoiceInput() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition || !voiceBtn) return;

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;

  voiceBtn.addEventListener("click", () => {
    recognition.start();
    voiceBtn.classList.add("listening");
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    chatInput.value = transcript;
    voiceBtn.classList.remove("listening");
    sendMessage();
  };

  recognition.onerror = () => {
    voiceBtn.classList.remove("listening");
  };

  recognition.onend = () => {
    voiceBtn.classList.remove("listening");
  };
}

// ===== EVENTS =====
if (themeToggleBtn) themeToggleBtn.onclick = toggleTheme;

if (heroExploreBtn) {
  heroExploreBtn.onclick = () => {
    loadRangeData(startDateInput.value, endDateInput.value);
  };
}

if (loadRangeBtn) {
  loadRangeBtn.onclick = () => {
    loadRangeData(startDateInput.value, endDateInput.value);
  };
}

if (refreshBtn) {
  refreshBtn.onclick = () => {
    const today = toDateInput(new Date());
    startDateInput.value = today;
    endDateInput.value = today;
    loadRangeData(today, today);
  };
}

if (searchInput) searchInput.oninput = applyFilters;
if (hazardousOnlyCheckbox) hazardousOnlyCheckbox.onchange = applyFilters;
if (explainAiBtn) explainAiBtn.onclick = explainSummary;
if (downloadPdfBtn) downloadPdfBtn.onclick = exportPdf;

if (chatBtn) {
  chatBtn.onclick = () => chatWindow.classList.toggle("hidden");
}

if (chatSend) chatSend.onclick = sendMessage;

if (chatInput) {
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}

suggestionButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    chatInput.value = btn.textContent;
    sendMessage();
  });
});

let landingRevealLocked = false;

if (backToLandingBtn && landingScreen && dashboardSection) {
  backToLandingBtn.addEventListener("click", () => {
    dashboardSection.classList.remove("dashboard-visible");
    dashboardSection.classList.add("hidden-dashboard");

    document.body.classList.add("landing-only");
    document.body.style.overflow = "hidden";

    landingScreen.classList.remove("landing-hidden", "landing-transition");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

if (enterDashboardBtn && landingScreen && dashboardSection) {
  enterDashboardBtn.addEventListener("click", () => {
    landingScreen.classList.add("landing-transition");

    setTimeout(() => {
      landingScreen.classList.add("landing-hidden");
      dashboardSection.classList.remove("hidden-dashboard");
      dashboardSection.classList.add("dashboard-visible");

      document.body.classList.remove("landing-only");
      document.body.style.overflow = "auto";

      setTimeout(() => {
        dashboardSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 120);
    }, 1200);
  });
}

// ===== START =====
setDefaultDates();
setupVoiceInput();
loadRangeData(startDateInput.value, endDateInput.value);