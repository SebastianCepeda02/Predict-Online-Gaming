// =====================================================================
// Engagement Scanner — lógica de la aplicación
// Todo corre en el navegador: no hay backend ni envío de datos.
// =====================================================================

const CLASS_ORDER = MODEL_META.class_order; // ["Low","Medium","High"]

document.getElementById("meta-accuracy").textContent =
  (MODEL_META.test_accuracy * 100).toFixed(1) + "%";

// ---------------------------------------------------------------
// 1) Construcción del vector de features en el mismo orden que
//    usó el modelo entrenado en Python (MODEL_META.feature_order)
// ---------------------------------------------------------------
function buildFeatureVector(player) {
  const oneHot = (value, category, dummies) => {
    // replica pd.get_dummies(..., drop_first=True): la primera categoría
    // (alfabéticamente) no genera columna, queda representada por ceros.
    const map = {};
    dummies.forEach(d => { map[`${category}_${d}`] = value === d ? 1 : 0; });
    return map;
  };

  const flags = {
    ...oneHot(player.Gender, "Gender", MODEL_META.categorical_dummy_map.Gender.dummies),
    ...oneHot(player.Location, "Location", MODEL_META.categorical_dummy_map.Location.dummies),
    ...oneHot(player.GameGenre, "GameGenre", MODEL_META.categorical_dummy_map.GameGenre.dummies),
    ...oneHot(player.GameDifficulty, "GameDifficulty", MODEL_META.categorical_dummy_map.GameDifficulty.dummies),
  };

  const raw = {
    Age: Number(player.Age),
    PlayTimeHours: Number(player.PlayTimeHours),
    InGamePurchases: Number(player.InGamePurchases),
    SessionsPerWeek: Number(player.SessionsPerWeek),
    AvgSessionDurationMinutes: Number(player.AvgSessionDurationMinutes),
    PlayerLevel: Number(player.PlayerLevel),
    AchievementsUnlocked: Number(player.AchievementsUnlocked),
    ...flags,
  };

  return MODEL_META.feature_order.map(name => {
    const v = raw[name];
    return typeof v === "number" && !Number.isNaN(v) ? v : 0;
  });
}

// ---------------------------------------------------------------
// 2) Clasificación de engagement (árbol de decisión exportado)
// ---------------------------------------------------------------
function classifyEngagement(player) {
  const vec = buildFeatureVector(player);
  const probs = scoreEngagement(vec); // [P_Low, P_Medium, P_High]
  const idx = probs.indexOf(Math.max(...probs));
  return { label: CLASS_ORDER[idx], probs };
}

// ---------------------------------------------------------------
// 3) Asignación de cluster de comportamiento (K-Means, distancia
//    euclidiana a centroides en espacio estandarizado)
// ---------------------------------------------------------------
function assignCluster(player) {
  const { features, mean, scale, centroids, labels, actions } = CLUSTER_MODEL;
  const raw = {
    PlayTimeHours: Number(player.PlayTimeHours),
    SessionsPerWeek: Number(player.SessionsPerWeek),
    AvgSessionDurationMinutes: Number(player.AvgSessionDurationMinutes),
    InGamePurchases: Number(player.InGamePurchases),
    AchievementsUnlocked: Number(player.AchievementsUnlocked),
  };
  const z = features.map((f, i) => (raw[f] - mean[i]) / scale[i]);

  let bestIdx = 0, bestDist = Infinity;
  centroids.forEach((c, i) => {
    const dist = Math.sqrt(z.reduce((s, v, j) => s + (v - c[j]) ** 2, 0));
    if (dist < bestDist) { bestDist = dist; bestIdx = i; }
  });

  return { cluster: bestIdx, segmentLabel: labels[bestIdx], action: actions[bestIdx] };
}

function classifyPlayer(player) {
  const eng = classifyEngagement(player);
  const seg = assignCluster(player);
  return { ...eng, ...seg }; // eng.label = engagement (Low/Medium/High), seg.segmentLabel = perfil de cluster
}

// =====================================================================
// UI — Tabs
// =====================================================================
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    document.getElementById(`panel-${tab.dataset.tab}`).classList.add("active");
  });
});

// =====================================================================
// UI — Un jugador
// =====================================================================
function readSingleForm() {
  return {
    Age: document.getElementById("f-age").value,
    Gender: document.getElementById("f-gender").value,
    Location: document.getElementById("f-location").value,
    GameGenre: document.getElementById("f-genre").value,
    GameDifficulty: document.getElementById("f-difficulty").value,
    InGamePurchases: document.getElementById("f-purchases").value,
    PlayTimeHours: document.getElementById("f-playtime").value,
    SessionsPerWeek: document.getElementById("f-sessions").value,
    AvgSessionDurationMinutes: document.getElementById("f-duration").value,
    PlayerLevel: document.getElementById("f-level").value,
    AchievementsUnlocked: document.getElementById("f-achievements").value,
  };
}

function signalRow(labelText, prob, levelClass, segments = 10) {
  const filled = Math.round(prob * segments);
  let segsHtml = "";
  for (let i = 0; i < segments; i++) {
    segsHtml += `<div class="signal-seg ${i < filled ? "filled " + levelClass : ""}"></div>`;
  }
  return `
    <div class="signal-row">
      <span class="signal-label">${labelText}</span>
      <div class="signal-track">${segsHtml}</div>
      <span class="signal-value">${(prob * 100).toFixed(1)}%</span>
    </div>`;
}

document.getElementById("single-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const player = readSingleForm();
  const result = classifyPlayer(player);
  renderSingleResult(player, result);
});

function renderSingleResult(player, result) {
  const [pLow, pMedium, pHigh] = result.probs;
  const html = `
    <div class="scan-card">
      <div class="scan-stripe ${result.label}"></div>
      <div class="scan-body">
        <div class="scan-header">
          <span class="level-badge ${result.label}">${result.label.toUpperCase()} ENGAGEMENT</span>
          <h3>Reporte de clasificación</h3>
        </div>
        <div class="signal-meter">
          ${signalRow("Low", pLow, "Low")}
          ${signalRow("Medium", pMedium, "Medium")}
          ${signalRow("High", pHigh, "High")}
        </div>
        <div class="segment-info">
          <div class="segment-row">
            <span class="segment-label">Segmento</span>
            <span class="segment-pill">Cluster ${result.cluster}</span>
            <span class="segment-value">${result.label ? CLUSTER_MODEL.labels[result.cluster] : ""}</span>
          </div>
          <div class="segment-row">
            <span class="segment-label">Acción sugerida</span>
            <span class="segment-value action">${result.action}</span>
          </div>
        </div>
      </div>
    </div>`;
  document.getElementById("single-result-wrap").innerHTML = html;
}

document.getElementById("btn-sample").addEventListener("click", () => {
  const samples = [
    { Age: 19, Gender: "Male", Location: "USA", GameGenre: "Action", GameDifficulty: "Hard",
      InGamePurchases: "0", PlayTimeHours: 21.4, SessionsPerWeek: 18, AvgSessionDurationMinutes: 145, PlayerLevel: 88, AchievementsUnlocked: 61 },
    { Age: 34, Gender: "Female", Location: "Europe", GameGenre: "Simulation", GameDifficulty: "Easy",
      InGamePurchases: "0", PlayTimeHours: 3.2, SessionsPerWeek: 2, AvgSessionDurationMinutes: 40, PlayerLevel: 6, AchievementsUnlocked: 3 },
    { Age: 27, Gender: "Male", Location: "Asia", GameGenre: "Strategy", GameDifficulty: "Medium",
      InGamePurchases: "1", PlayTimeHours: 10.5, SessionsPerWeek: 8, AvgSessionDurationMinutes: 90, PlayerLevel: 45, AchievementsUnlocked: 30 },
  ];
  const s = samples[Math.floor(Math.random() * samples.length)];
  document.getElementById("f-age").value = s.Age;
  document.getElementById("f-gender").value = s.Gender;
  document.getElementById("f-location").value = s.Location;
  document.getElementById("f-genre").value = s.GameGenre;
  document.getElementById("f-difficulty").value = s.GameDifficulty;
  document.getElementById("f-purchases").value = s.InGamePurchases;
  document.getElementById("f-playtime").value = s.PlayTimeHours;
  document.getElementById("f-sessions").value = s.SessionsPerWeek;
  document.getElementById("f-duration").value = s.AvgSessionDurationMinutes;
  document.getElementById("f-level").value = s.PlayerLevel;
  document.getElementById("f-achievements").value = s.AchievementsUnlocked;
});

// =====================================================================
// UI — Lote (CSV)
// =====================================================================
const dropzone = document.getElementById("dropzone");
const csvInput = document.getElementById("csv-input");

dropzone.addEventListener("click", () => csvInput.click());
["dragover", "dragenter"].forEach(evt =>
  dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add("dragover"); })
);
["dragleave", "drop"].forEach(evt =>
  dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.remove("dragover"); })
);
dropzone.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files[0];
  if (file) handleCsvFile(file);
});
csvInput.addEventListener("change", (e) => {
  if (e.target.files[0]) handleCsvFile(e.target.files[0]);
});

let lastBatchResults = [];

function handleCsvFile(file) {
  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: (res) => processBatch(res.data),
    error: (err) => alert("No se pudo leer el CSV: " + err.message),
  });
}

function processBatch(rows) {
  const results = rows.map(row => {
    const result = classifyPlayer(row);
    return { ...row, ...result };
  });
  lastBatchResults = results;
  renderBatchSummary(results);
  renderBatchTable(results);
}

function renderBatchSummary(results) {
  const counts = { Low: 0, Medium: 0, High: 0 };
  results.forEach(r => counts[r.label]++);
  const clusterCounts = {};
  results.forEach(r => { clusterCounts[r.cluster] = (clusterCounts[r.cluster] || 0) + 1; });

  let html = `<div class="summary-strip">`;
  html += `<div class="summary-card"><div class="num">${results.length}</div><div class="lbl">Jugadores</div></div>`;
  ["Low", "Medium", "High"].forEach(lvl => {
    html += `<div class="summary-card ${lvl}"><div class="num">${counts[lvl]}</div><div class="lbl">${lvl}</div></div>`;
  });
  html += `</div>`;

  html += `<div class="batch-toolbar">
    <span style="font-family: var(--font-mono); font-size:12.5px; color: var(--text-muted);">
      ${results.length} jugadores clasificados
    </span>
    <button class="btn-primary" id="btn-download">Descargar resultados (CSV)</button>
  </div>`;

  document.getElementById("batch-summary").innerHTML = html;
  document.getElementById("btn-download").addEventListener("click", downloadResultsCsv);
}

function renderBatchTable(results) {
  const rowsHtml = results.map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${r.Age ?? ""}</td>
      <td>${r.GameGenre ?? ""}</td>
      <td><span class="pill ${r.label}">${r.label}</span></td>
      <td>${(r.probs[2] * 100).toFixed(1)}%</td>
      <td>Cluster ${r.cluster} — ${CLUSTER_MODEL.labels[r.cluster]}</td>
      <td>${r.action}</td>
    </tr>`).join("");

  const html = `
    <div class="results-table-wrap">
      <table class="results">
        <thead>
          <tr>
            <th>#</th><th>Edad</th><th>Género juego</th><th>Engagement</th>
            <th>P(High)</th><th>Segmento</th><th>Acción sugerida</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>`;
  document.getElementById("batch-result-wrap").innerHTML = html;
}

function downloadResultsCsv() {
  const rows = lastBatchResults.map(r => ({
    Age: r.Age, Gender: r.Gender, Location: r.Location, GameGenre: r.GameGenre,
    GameDifficulty: r.GameDifficulty, PlayTimeHours: r.PlayTimeHours,
    InGamePurchases: r.InGamePurchases, SessionsPerWeek: r.SessionsPerWeek,
    AvgSessionDurationMinutes: r.AvgSessionDurationMinutes, PlayerLevel: r.PlayerLevel,
    AchievementsUnlocked: r.AchievementsUnlocked,
    PredictedEngagement: r.label,
    P_Low: r.probs[0].toFixed(4), P_Medium: r.probs[1].toFixed(4), P_High: r.probs[2].toFixed(4),
    Cluster: r.cluster, ClusterProfile: CLUSTER_MODEL.labels[r.cluster],
    AccionSugerida: r.action,
  }));
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "jugadores_clasificados.csv";
  a.click();
  URL.revokeObjectURL(url);
}
