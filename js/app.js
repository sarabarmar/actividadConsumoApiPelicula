// =============================================
// GAME OF THRONES APP — TVmaze API + PWA
// =============================================

const API = "https://api.tvmaze.com";
const SHOW_ID = 82; // Game of Thrones en TVmaze

// =============================================
// PWA — Registro del Service Worker
// =============================================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .then(reg => console.log("SW registrado:", reg.scope))
      .catch(err => console.warn("SW error:", err));
  });
}

// Detectar si está offline
window.addEventListener("online",  () => document.getElementById("offlineBanner").classList.add("hidden"));
window.addEventListener("offline", () => document.getElementById("offlineBanner").classList.remove("hidden"));

// =============================================
// NAVBAR — scroll effect
// =============================================
window.addEventListener("scroll", () => {
  const navbar = document.getElementById("navbar");
  if (window.scrollY > 60) navbar.classList.add("scrolled");
  else navbar.classList.remove("scrolled");
});

// =============================================
// BUSCADOR — personajes
// =============================================
document.getElementById("btnBuscar").addEventListener("click", buscarPersonaje);
document.getElementById("inputBusqueda").addEventListener("keydown", e => {
  if (e.key === "Enter") buscarPersonaje();
});

async function buscarPersonaje() {
  const query = document.getElementById("inputBusqueda").value.trim();
  const contenedor = document.getElementById("resultadosBusqueda");

  if (!query) return;

  contenedor.innerHTML = `<div style="color:var(--text2);font-style:italic;font-size:15px">Buscando...</div>`;

  try {
    const res = await fetch(`${API}/search/people?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    contenedor.innerHTML = "";

    if (!data.length) {
      contenedor.innerHTML = `<div style="color:var(--text2);font-style:italic;font-size:15px">Sin resultados para "${query}"</div>`;
      return;
    }

    // Mostrar hasta 5 resultados
    data.slice(0, 5).forEach(({ person }) => {
      const item = document.createElement("div");
      item.className = "resultado-item";

      const imgSrc = person.image?.medium || "";
      item.innerHTML = `
        ${imgSrc ? `<img src="${imgSrc}" alt="${person.name}">` : ""}
        <span>${person.name}</span>
      `;

      item.addEventListener("click", () => {
        abrirModalPersona(person);
      });

      contenedor.appendChild(item);
    });

  } catch (err) {
    contenedor.innerHTML = `<div style="color:#c0392b;font-size:14px">Error al buscar. Verifica tu conexión.</div>`;
  }
}

// =============================================
// CARGAR TEMPORADAS — al inicio
// =============================================
async function cargarTemporadas() {
  const contenedor = document.getElementById("contenedorTemporadas");

  // Skeletons mientras carga
  contenedor.innerHTML = Array(8).fill(`<div class="skeleton"></div>`).join("");

  try {
    const res = await fetch(`${API}/shows/${SHOW_ID}/seasons`);
    const seasons = await res.json();

    contenedor.innerHTML = "";

    seasons.forEach(season => {
      const card = document.createElement("div");
      card.className = "card";
      card.id = `season-${season.number}`;

      const imgUrl = season.image?.medium || generarImagenPlaceholder(season.number);

      card.innerHTML = `
        <div class="card-badge">T${season.number}</div>
        <img src="${imgUrl}" alt="Temporada ${season.number}" loading="lazy"
             onerror="this.style.background='var(--bg3)';this.src=''">
        <div class="card-info">
          <p>Temporada ${season.number}</p>
          <small>${season.episodeOrder || "?"} episodios · ${season.premiereDate?.slice(0,4) || ""}</small>
        </div>
      `;

      card.addEventListener("click", () => {
        // Quitar activo de los demás
        document.querySelectorAll(".card").forEach(c => c.classList.remove("card-active"));
        card.classList.add("card-active");
        mostrarInfoTemporada(season);
        cargarEpisodios(season.id, season.number);
      });

      contenedor.appendChild(card);
    });

  } catch (err) {
    contenedor.innerHTML = `
      <div style="color:var(--text2);padding:20px;font-style:italic">
        Error al cargar temporadas. ¿Estás offline?
      </div>
    `;
  }
}

// =============================================
// INFO DE TEMPORADA
// =============================================
function mostrarInfoTemporada(season) {
  const contenedor = document.getElementById("infoTemporada");
  contenedor.classList.remove("hidden");

  const imgUrl = season.image?.original || season.image?.medium || "";
  const premiere = season.premiereDate
    ? new Date(season.premiereDate).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })
    : "Desconocido";
  const finale = season.endDate
    ? new Date(season.endDate).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })
    : "";

  const summary = season.summary ? limpiarHTML(season.summary) : "Temporada de Game of Thrones. La batalla por el Trono de Hierro continúa.";

  contenedor.innerHTML = `
    ${imgUrl ? `<img src="${imgUrl}" alt="Temporada ${season.number}" onerror="this.remove()">` : ""}
    <div class="info-temporada-texto">
      <h3>Temporada ${season.number}</h3>
      <p>${summary}</p>
      <span class="info-badge">📅 ${premiere}</span>
      ${finale ? `<span class="info-badge">🏁 ${finale}</span>` : ""}
      ${season.episodeOrder ? `<span class="info-badge">📺 ${season.episodeOrder} episodios</span>` : ""}
      ${season.network?.name ? `<span class="info-badge">📡 ${season.network.name}</span>` : ""}
    </div>
  `;

  // Scroll suave a episodios
  setTimeout(() => {
    document.getElementById("episodios").scrollIntoView({ behavior: "smooth", block: "start" });
  }, 300);
}

// =============================================
// CARGAR EPISODIOS
// =============================================
async function cargarEpisodios(seasonId, seasonNum) {
  const contenedor = document.getElementById("contenedorEpisodios");

  contenedor.innerHTML = Array(5).fill(`<div class="skeleton"></div>`).join("");

  try {
    const res = await fetch(`${API}/seasons/${seasonId}/episodes`);
    const episodios = await res.json();

    contenedor.innerHTML = "";

    episodios.forEach(ep => {
      const card = document.createElement("div");
      card.className = "card";

      const imgUrl = ep.image?.medium || "";
      const rating = ep.rating?.average ? `⭐ ${ep.rating.average}` : "";

      card.innerHTML = `
        <div class="card-badge">E${ep.number}</div>
        <img src="${imgUrl}" alt="${ep.name}" loading="lazy"
             onerror="this.style.background='var(--bg3)';this.src=''">
        <div class="card-info">
          <p>${ep.name}</p>
          <small>${ep.airdate || ""} ${rating}</small>
        </div>
      `;

      card.addEventListener("click", () => abrirModalEpisodio(ep));
      contenedor.appendChild(card);
    });

    // Cargar personajes del cast de la temporada
    cargarCast();

  } catch (err) {
    contenedor.innerHTML = `<div style="color:var(--text2);padding:20px;font-style:italic">Error al cargar episodios.</div>`;
  }
}

// =============================================
// CARGAR CAST
// =============================================
async function cargarCast() {
  const contenedor = document.getElementById("contenedorActores");
  contenedor.innerHTML = Array(6).fill(`<div class="skeleton"></div>`).join("");

  try {
    const res = await fetch(`${API}/shows/${SHOW_ID}/cast`);
    const cast = await res.json();

    contenedor.innerHTML = "";

    cast.forEach(({ person, character }) => {
      const card = document.createElement("div");
      card.className = "card";

      const imgUrl = person.image?.medium || character.image?.medium || "";

      card.innerHTML = `
        <img src="${imgUrl}" alt="${person.name}" loading="lazy"
             onerror="this.style.background='var(--bg3)';this.src=''">
        <div class="card-info">
          <p>${character.name}</p>
          <small>${person.name}</small>
        </div>
      `;

      card.addEventListener("click", () => abrirModalPersona(person, character));
      contenedor.appendChild(card);
    });

  } catch (err) {
    contenedor.innerHTML = `<div style="color:var(--text2);padding:20px;font-style:italic">Error al cargar personajes.</div>`;
  }
}

// =============================================
// MODALES
// =============================================
function abrirModalEpisodio(ep) {
  const modal = document.getElementById("modal");
  const body = document.getElementById("modalBody");

  const rating = ep.rating?.average ? `⭐ ${ep.rating.average} / 10` : "";
  const summary = ep.summary ? limpiarHTML(ep.summary) : "Sin descripción disponible.";

  body.innerHTML = `
    ${ep.image?.original ? `<img class="modal-img" src="${ep.image.original}" alt="${ep.name}">` : ""}
    <div class="modal-body">
      <h3>${ep.name}</h3>
      <div class="modal-meta">
        Temporada ${ep.season} · Episodio ${ep.number} · ${ep.airdate || ""} ${rating}
      </div>
      <p class="modal-desc">${summary}</p>
      ${ep.runtime ? `<br><small style="color:var(--gold)">⏱ ${ep.runtime} minutos</small>` : ""}
    </div>
  `;

  modal.classList.remove("hidden");
}

function abrirModalPersona(person, character = null) {
  const modal = document.getElementById("modal");
  const body = document.getElementById("modalBody");

  const imgUrl = person.image?.original || person.image?.medium || "";
  const country = person.country?.name || "";
  const birthday = person.birthday
    ? new Date(person.birthday).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })
    : "";

  body.innerHTML = `
    ${imgUrl ? `<img class="modal-img" src="${imgUrl}" alt="${person.name}" style="object-position:top">` : ""}
    <div class="modal-body">
      <h3>${person.name}</h3>
      <div class="modal-meta">
        ${character ? `Personaje: <strong style="color:var(--gold)">${character.name}</strong> · ` : ""}
        ${country} ${birthday ? `· ${birthday}` : ""}
      </div>
      ${person.url ? `<a href="${person.url}" target="_blank" style="color:var(--gold);font-family:'Cinzel',serif;font-size:13px;letter-spacing:0.1em">Ver en TVmaze →</a>` : ""}
    </div>
  `;

  modal.classList.remove("hidden");
}

// Cerrar modal
document.getElementById("modalClose").addEventListener("click", cerrarModal);
document.querySelector(".modal-backdrop").addEventListener("click", cerrarModal);
document.addEventListener("keydown", e => { if (e.key === "Escape") cerrarModal(); });

function cerrarModal() {
  document.getElementById("modal").classList.add("hidden");
}

// =============================================
// UTILS
// =============================================
function limpiarHTML(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

function generarImagenPlaceholder(num) {
  // Retorna string vacío, el CSS maneja el fallback
  return "";
}

// =============================================
// INIT
// =============================================
cargarTemporadas();
cargarCast();