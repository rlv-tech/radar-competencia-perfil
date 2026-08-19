// ============================================
// RADAR COMPETENCIA PERFIL
// app.js
// ============================================

// Cargar el JSON generado por n8n / IA
fetch("data.json")
  .then(response => {
    if (!response.ok) {
      throw new Error("No se pudo cargar data.json");
    }

    return response.json();
  })
  .then(data => {
    iniciarDashboard(data);
  })
  .catch(error => {
    console.error("Error:", error);

    document.getElementById("dashboard").innerHTML = `
      <div class="error">
        <h2>Error al cargar el dashboard</h2>
        <p>${error.message}</p>
      </div>
    `;
  });


// ============================================
// INICIAR DASHBOARD
// ============================================

function iniciarDashboard(data) {

  // Por compatibilidad con posibles estructuras
  const r = data.analisis_completo || data;

  renderHeader(r);
  renderResumen(r);

  renderCategoria(
    "hipercompetencia",
    r.hipercompetencia || [],
    {
      icono: "🔥",
      titulo: "Temas hipercompetidos",
      descripcion:
        "Los temas con mayor volumen de cobertura y presencia simultánea de medios."
    }
  );

  renderCategoria(
    "perfil_pierde",
    r.perfil_pierde || [],
    {
      icono: "🚨",
      titulo: "Dónde Perfil pierde",
      descripcion:
        "Temáticas en las que la competencia publicó más que Perfil."
    }
  );

  renderCategoria(
    "sin_cobertura",
    r.sin_cobertura_perfil || [],
    {
      icono: "⚠️",
      titulo: "Temas sin cobertura de Perfil",
      descripcion:
        "Historias que aparecieron en la competencia y no registran publicaciones de Perfil."
    }
  );

  renderCategoria(
    "oportunidades",
    r.oportunidades || [],
    {
      icono: "💡",
      titulo: "Oportunidades editoriales",
      descripcion:
        "Temas donde todavía existe espacio para desarrollar una cobertura propia."
    }
  );

  renderCategoria(
    "discover",
    r.discover || [],
    {
      icono: "📈",
      titulo: "Oportunidades de contenido amplio",
      descripcion:
        "Historias observadas en los RSS que pueden admitir enfoques atractivos para una audiencia amplia."
    }
  );

  renderCategoria(
    "fortalezas",
    r.fortalezas_perfil || [],
    {
      icono: "💪",
      titulo: "Fortalezas de Perfil",
      descripcion:
        "Temáticas en las que Perfil registra una presencia superior a la competencia."
    }
  );

  renderPrioridades(r.prioridades_del_dia || []);

  activarNavegacion();
}


// ============================================
// HEADER
// ============================================

function renderHeader(data) {

  const fecha = data.fecha_analisis || "Sin fecha";

  const fechaElemento = document.getElementById("fecha");

  if (fechaElemento) {
    fechaElemento.textContent = fecha;
  }
}


// ============================================
// RESUMEN SUPERIOR
// ============================================

function renderResumen(data) {

  const resumen = document.getElementById("resumen");

  if (!resumen) return;

  const hiper = (data.hipercompetencia || []).length;
  const pierde = (data.perfil_pierde || []).length;
  const sinCobertura = (data.sin_cobertura_perfil || []).length;
  const oportunidades = (data.oportunidades || []).length;
  const discover = (data.discover || []).length;
  const fortalezas = (data.fortalezas_perfil || []).length;

  resumen.innerHTML = `
    <div class="kpi-card kpi-hiper">
      <div class="kpi-icon">🔥</div>
      <div>
        <div class="kpi-number">${hiper}</div>
        <div class="kpi-label">Temas hipercompetidos</div>
      </div>
    </div>

    <div class="kpi-card kpi-brecha">
      <div class="kpi-icon">🚨</div>
      <div>
        <div class="kpi-number">${pierde}</div>
        <div class="kpi-label">Brechas de cobertura</div>
      </div>
    </div>

    <div class="kpi-card kpi-sin">
      <div class="kpi-icon">⚠️</div>
      <div>
        <div class="kpi-number">${sinCobertura}</div>
        <div class="kpi-label">Sin cobertura</div>
      </div>
    </div>

    <div class="kpi-card kpi-oportunidad">
      <div class="kpi-icon">💡</div>
      <div>
        <div class="kpi-number">${oportunidades}</div>
        <div class="kpi-label">Oportunidades</div>
      </div>
    </div>

    <div class="kpi-card kpi-discover">
      <div class="kpi-icon">📈</div>
      <div>
        <div class="kpi-number">${discover}</div>
        <div class="kpi-label">Contenido amplio</div>
      </div>
    </div>

    <div class="kpi-card kpi-fortaleza">
      <div class="kpi-icon">💪</div>
      <div>
        <div class="kpi-number">${fortalezas}</div>
        <div class="kpi-label">Fortalezas</div>
      </div>
    </div>
  `;
}


// ============================================
// CATEGORÍAS
// ============================================

function renderCategoria(id, items, config) {

  const contenedor = document.getElementById(id);

  if (!contenedor) return;

  if (!items || items.length === 0) {

    contenedor.innerHTML = `
      <div class="categoria-header">
        <div>
          <h2>${config.icono} ${config.titulo}</h2>
          <p>${config.descripcion}</p>
        </div>
      </div>

      <div class="empty-state">
        No se detectaron temas suficientes en esta categoría.
      </div>
    `;

    return;
  }

  let html = `
    <div class="categoria-header">
      <div>
        <h2>${config.icono} ${config.titulo}</h2>
        <p>${config.descripcion}</p>
      </div>

      <div class="cantidad-temas">
        ${items.length}
      </div>
    </div>

    <div class="cards-grid">
  `;

  items.forEach((item, index) => {
    html += renderCard(item, config, index);
  });

  html += `</div>`;

  contenedor.innerHTML = html;
}


// ============================================
// CARD PRINCIPAL
// ============================================

function renderCard(item, config, index) {

  const tema = escapeHtml(item.tema || "Tema sin nombre");

  const cobertura = item.cobertura || {};

  const totalNotas =
    item.total_notas ??
    calcularTotalCobertura(cobertura);

  const perfil =
    cobertura.Perfil ??
    item.perfil ??
    0;

  const competenciaTotal =
    item.competencia_total ??
    calcularCompetencia(cobertura);

  const brecha =
    item.brecha_perfil ??
    item.diferencia ??
    "";

  const prioridad = item.prioridad || "";

  const cantidadMedios =
    item.cantidad_medios ??
    Object.keys(cobertura).length;

  const tipo =
    item.tipo ||
    item.tipo_de_oportunidad ||
    "";

  const insight =
    item.insight ||
    "";

  const porQueImporta =
    item.por_que_importa ||
    "";

  const motivo =
    item.motivo ||
    item.motivo_oportunidad ||
    "";

  const accion =
    item.accion_sugerida ||
    "";

  const enfoques =
    item.enfoques_sugeridos ||
    [];

  const ejemplos =
    item.ejemplos ||
    [];

  const mediosMasPublicaron =
    item.medios_que_mas_publicaron ||
    item.medios_que_cubrieron ||
    [];

  let html = `
    <article class="tema-card">

      <div class="card-top">

        <div class="card-badge">
          ${config.icono}
          ${prioridad ? ` Prioridad ${escapeHtml(prioridad)}` : ""}
        </div>

        ${
          tipo
            ? `<div class="card-type">${escapeHtml(tipo)}</div>`
            : ""
        }

      </div>


      <h3>${tema}</h3>


      ${renderMetricas({
        totalNotas,
        perfil,
        competenciaTotal,
        brecha,
        cantidadMedios
      })}


      ${
        Object.keys(cobertura).length > 0
          ? `
            <section class="card-section cobertura-section">

              <div class="section-title">
                COBERTURA POR MEDIO
              </div>

              ${renderCobertura(cobertura)}

            </section>
          `
          : ""
      }


      ${
        porQueImporta
          ? `
            <section class="card-section">

              <div class="section-title">
                POR QUÉ IMPORTA
              </div>

              <div class="info-box importance-box">
                ${escapeHtml(porQueImporta)}
              </div>

            </section>
          `
          : ""
      }


      ${
        insight
          ? `
            <section class="card-section">

              <div class="section-title">
                INSIGHT EDITORIAL
              </div>

              <div class="insight-box">
                ${escapeHtml(insight)}
              </div>

            </section>
          `
          : ""
      }


      ${
        motivo && !porQueImporta
          ? `
            <section class="card-section">

              <div class="section-title">
                POR QUÉ ES RELEVANTE
              </div>

              <div class="info-box">
                ${escapeHtml(motivo)}
              </div>

            </section>
          `
          : ""
      }


      ${
        accion
          ? `
            <section class="card-section accion-section">

              <div class="section-title">
                ACCIÓN SUGERIDA
              </div>

              <div class="accion-box">
                <span class="accion-arrow">→</span>

                <span>
                  ${escapeHtml(accion)}
                </span>
              </div>

            </section>
          `
          : ""
      }


      ${
        enfoques && enfoques.length > 0
          ? `
            <section class="card-section">

              <div class="section-title">
                ENFOQUES POSIBLES
              </div>

              <ul class="enfoques-list">
                ${enfoques
                  .filter(enfoque => enfoque)
                  .map(enfoque => `
                    <li>${escapeHtml(enfoque)}</li>
                  `)
                  .join("")
                }
              </ul>

            </section>
          `
          : ""
      }


      ${
        mediosMasPublicaron && mediosMasPublicaron.length > 0
          ? `
            <section class="card-section">

              <div class="section-title">
                MEDIOS DESTACADOS
              </div>

              <div class="medios-tags">
                ${mediosMasPublicaron
                  .map(medio => `
                    <span>${escapeHtml(medio)}</span>
                  `)
                  .join("")
                }
              </div>

            </section>
          `
          : ""
      }


      ${
        ejemplos && ejemplos.length > 0
          ? renderEjemplos(ejemplos)
          : ""
      }

    </article>
  `;

  return html;
}


// ============================================
// MÉTRICAS
// ============================================

function renderMetricas(datos) {

  const {
    totalNotas,
    perfil,
    competenciaTotal,
    brecha,
    cantidadMedios
  } = datos;

  let html = `<div class="metricas-grid">`;

  if (totalNotas !== "" && totalNotas !== undefined) {
    html += `
      <div class="metrica">
        <span class="metrica-numero">
          ${escapeHtml(totalNotas)}
        </span>

        <span class="metrica-label">
          Notas
        </span>
      </div>
    `;
  }

  html += `
    <div class="metrica metrica-perfil">
      <span class="metrica-numero">
        ${escapeHtml(perfil)}
      </span>

      <span class="metrica-label">
        Perfil
      </span>
    </div>
  `;

  if (competenciaTotal !== "" && competenciaTotal !== undefined) {
    html += `
      <div class="metrica">
        <span class="metrica-numero">
          ${escapeHtml(competenciaTotal)}
        </span>

        <span class="metrica-label">
          Competencia
        </span>
      </div>
    `;
  }

  if (brecha !== "" && brecha !== undefined) {
    html += `
      <div class="metrica metrica-brecha">
        <span class="metrica-numero">
          ${escapeHtml(brecha)}
        </span>

        <span class="metrica-label">
          Diferencia
        </span>
      </div>
    `;
  }

  if (cantidadMedios && cantidadMedios > 0) {
    html += `
      <div class="metrica">
        <span class="metrica-numero">
          ${escapeHtml(cantidadMedios)}
        </span>

        <span class="metrica-label">
          Medios
        </span>
      </div>
    `;
  }

  html += `</div>`;

  return html;
}


// ============================================
// COBERTURA CON BARRAS
// ============================================

function renderCobertura(cobertura) {

  const entries = Object.entries(cobertura);

  if (entries.length === 0) return "";

  const maximo = Math.max(
    ...entries.map(([, valor]) => Number(valor) || 0),
    1
  );

  const ordenados = entries.sort((a, b) => {
    return (Number(b[1]) || 0) - (Number(a[1]) || 0);
  });

  let html = `<div class="coverage-bars">`;

  ordenados.forEach(([medio, valor]) => {

    const numero = Number(valor) || 0;

    const porcentaje =
      Math.max(
        3,
        Math.round((numero / maximo) * 100)
      );

    const esPerfil =
      String(medio).toLowerCase() === "perfil";

    html += `
      <div class="coverage-row ${esPerfil ? "coverage-perfil" : ""}">

        <div class="coverage-label">
          ${escapeHtml(medio)}
        </div>

        <div class="coverage-track">
          <div
            class="coverage-bar"
            style="width: ${porcentaje}%"
          ></div>
        </div>

        <div class="coverage-value">
          ${numero}
        </div>

      </div>
    `;
  });

  html += `</div>`;

  return html;
}


// ============================================
// EJEMPLOS DE NOTAS
// ============================================

function renderEjemplos(ejemplos) {

  const cantidad = ejemplos.slice(0, 5);

  let html = `
    <section class="card-section ejemplos-section">

      <div class="section-title">
        NOTAS DE EJEMPLO
      </div>

      <div class="ejemplos-list">
  `;

  cantidad.forEach(ejemplo => {

    const medio =
      escapeHtml(ejemplo.medio || "Medio");

    const titulo =
      escapeHtml(ejemplo.titulo || "Sin título");

    const link =
      ejemplo.link || "";

    html += `
      <div class="ejemplo-item">

        <div class="ejemplo-medio">
          ${medio}
        </div>

        ${
          link
            ? `
              <a
                href="${escapeAttribute(link)}"
                target="_blank"
                rel="noopener noreferrer"
                class="ejemplo-titulo"
              >
                ${titulo}
                <span class="external-link">↗</span>
              </a>
            `
            : `
              <div class="ejemplo-titulo">
                ${titulo}
              </div>
            `
        }

      </div>
    `;
  });

  html += `
      </div>

    </section>
  `;

  return html;
}


// ============================================
// PRIORIDADES DEL DÍA
// ============================================

function renderPrioridades(items) {

  const contenedor =
    document.getElementById("prioridades");

  if (!contenedor) return;

  if (!items || items.length === 0) {

    contenedor.innerHTML = `
      <div class="categoria-header">
        <div>
          <h2>🎯 Prioridades del día</h2>
          <p>Principales focos sugeridos para la agenda editorial.</p>
        </div>
      </div>

      <div class="empty-state">
        No se detectaron prioridades para esta ejecución.
      </div>
    `;

    return;
  }

  let html = `
    <div class="categoria-header">

      <div>
        <h2>🎯 Prioridades del día</h2>

        <p>
          Los temas que requieren mayor atención en la agenda editorial.
        </p>
      </div>

    </div>

    <div class="prioridades-grid">
  `;

  items.forEach(item => {

    html += `
      <article class="prioridad-card">

        <div class="prioridad-numero">
          ${escapeHtml(item.prioridad || "")}
        </div>

        <div class="prioridad-contenido">

          <h3>
            ${escapeHtml(item.tema || "")}
          </h3>

          ${
            item.motivo
              ? `
                <p class="prioridad-motivo">
                  ${escapeHtml(item.motivo)}
                </p>
              `
              : ""
          }

          ${
            item.accion_sugerida
              ? `
                <div class="prioridad-accion">

                  <strong>Acción:</strong>

                  ${escapeHtml(item.accion_sugerida)}

                </div>
              `
              : ""
          }

        </div>

      </article>
    `;
  });

  html += `</div>`;

  contenedor.innerHTML = html;
}


// ============================================
// NAVEGACIÓN ENTRE SECCIONES
// ============================================

function activarNavegacion() {

  const botones =
    document.querySelectorAll("[data-target]");

  botones.forEach(boton => {

    boton.addEventListener("click", () => {

      const target =
        boton.dataset.target;

      const seccion =
        document.getElementById(target);

      if (seccion) {

        seccion.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }

    });

  });

}


// ============================================
// FUNCIONES AUXILIARES
// ============================================

function calcularTotalCobertura(cobertura) {

  if (!cobertura) return 0;

  return Object.values(cobertura)
    .reduce((total, valor) => {
      return total + (Number(valor) || 0);
    }, 0);
}


function calcularCompetencia(cobertura) {

  if (!cobertura) return 0;

  return Object.entries(cobertura)
    .filter(([medio]) => {
      return String(medio).toLowerCase() !== "perfil";
    })
    .reduce((total, [, valor]) => {
      return total + (Number(valor) || 0);
    }, 0);
}


function escapeHtml(valor) {

  if (
    valor === null ||
    valor === undefined
  ) {
    return "";
  }

  return String(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function escapeAttribute(valor) {

  if (
    valor === null ||
    valor === undefined
  ) {
    return "";
  }

  return String(valor)
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
