async function cargarDashboard() {

  try {

    const response = await fetch('data.json');

    if (!response.ok) {
      throw new Error('No se pudo cargar data.json');
    }

    const data = await response.json();

    console.log('Datos recibidos:', data);

    mostrarFecha(data);
    mostrarStats(data);
    mostrarPrioridades(data);
    configurarTabs(data);

  } catch (error) {

    console.error(error);

    document.getElementById('contenido').innerHTML = `
      <div class="tema-card">
        <h3>Esperando datos</h3>
        <p>
          El dashboard está funcionando, pero todavía no recibió
          el archivo de análisis desde n8n.
        </p>
      </div>
    `;

  }

}


/* =========================
   FECHA
========================= */

function mostrarFecha(data) {

  document.getElementById('fecha').textContent =
    data.fecha_analisis
      ? 'Análisis: ' + data.fecha_analisis
      : 'Análisis actualizado';

}


/* =========================
   ESTADÍSTICAS
========================= */

function mostrarStats(data) {

  document.getElementById('total-hiper').textContent =
    (data.hipercompetencia || []).length;

  document.getElementById('total-brechas').textContent =
    (data.perfil_pierde || []).length;

  document.getElementById('total-sin-cobertura').textContent =
    (data.sin_cobertura_perfil || []).length;

  document.getElementById('total-oportunidades').textContent =
    (data.oportunidades || []).length;

}


/* =========================
   PRIORIDADES
========================= */

function mostrarPrioridades(data) {

  const contenedor =
    document.getElementById('prioridades');

  const prioridades =
    data.prioridades_del_dia || [];

  if (!prioridades.length) {

    contenedor.innerHTML =
      '<p>No hay prioridades disponibles.</p>';

    return;
  }

  contenedor.innerHTML =
    prioridades.map(item => `

      <div class="prioridad-card">

        <div class="prioridad-numero">
          ${item.prioridad}
        </div>

        <h3>${item.tema || ''}</h3>

        <p>
          ${item.motivo || ''}
        </p>

        <div class="accion">
          <strong>ACCIÓN:</strong>
          ${item.accion_sugerida || ''}
        </div>

      </div>

    `).join('');

}


/* =========================
   TABS
========================= */

function configurarTabs(data) {

  const tabs =
    document.querySelectorAll('.tab');

  tabs.forEach(tab => {

    tab.addEventListener('click', function() {

      tabs.forEach(t =>
        t.classList.remove('active')
      );

      tab.classList.add('active');

      const categoria =
        tab.dataset.tab;

      mostrarCategoria(
        data[categoria] || []
      );

    });

  });

  // Mostrar hipercompetencia al iniciar
  mostrarCategoria(
    data.hipercompetencia || []
  );

}


/* =========================
   MOSTRAR CATEGORÍA
========================= */

function mostrarCategoria(items) {

  const contenedor =
    document.getElementById('contenido');

  if (!items.length) {

    contenedor.innerHTML = `
      <div class="tema-card">
        <p>No hay temas detectados en esta categoría.</p>
      </div>
    `;

    return;
  }

  contenedor.innerHTML = `

    <div class="temas-grid">

      ${items.map(item =>
        crearTema(item)
      ).join('')}

    </div>

  `;

}


/* =========================
   CREAR TARJETA
========================= */

function crearTema(item) {

  const cobertura =
    crearCobertura(item.cobertura);

  const ejemplos =
    crearEjemplos(item.ejemplos);

  const insight =
    item.insight ||
    item.motivo ||
    item.motivo_oportunidad ||
    '';

  return `

    <article class="tema-card">

      <h3>
        ${item.tema || 'Sin tema'}
      </h3>


      <div class="metricas">

        ${
          item.total_notas !== undefined
            ? `
              <div class="metrica">
                📰 ${item.total_notas} notas
              </div>
            `
            : ''
        }

        ${
          item.cantidad_medios
            ? `
              <div class="metrica">
                🏢 ${item.cantidad_medios} medios
              </div>
            `
            : ''
        }

        ${
          item.brecha_perfil
            ? `
              <div class="metrica">
                🚨 Brecha: ${item.brecha_perfil}
              </div>
            `
            : ''
        }

        ${
          item.diferencia
            ? `
              <div class="metrica">
                Diferencia: ${item.diferencia}
              </div>
            `
            : ''
        }

      </div>


      ${cobertura}


      ${
        insight
          ? `
            <div class="insight">

              <h4>Insight</h4>

              <p>
                ${insight}
              </p>

            </div>
          `
          : ''
      }


      ${ejemplos}


      ${
        item.accion_sugerida
          ? `
            <div class="accion">
              <strong>ACCIÓN SUGERIDA:</strong><br>
              ${item.accion_sugerida}
            </div>
          `
          : ''
      }

    </article>

  `;

}


/* =========================
   COBERTURA POR MEDIO
========================= */

function crearCobertura(cobertura) {

  if (!cobertura ||
      Object.keys(cobertura).length === 0) {

    return '';

  }

  return `

    <div class="cobertura">

      <h4>Cobertura por medio</h4>

      ${
        Object.entries(cobertura)
          .map(([medio, cantidad]) => `

            <div class="medio-row">

              <span>${medio}</span>

              <strong>
                ${cantidad}
              </strong>

            </div>

          `)
          .join('')
      }

    </div>

  `;

}


/* =========================
   EJEMPLOS
========================= */

function crearEjemplos(ejemplos) {

  if (!ejemplos || !ejemplos.length) {
    return '';
  }

  return `

    <div class="ejemplos">

      <h4>Notas de ejemplo</h4>

      ${
        ejemplos.map(e => `

          <div class="ejemplo">

            <div class="ejemplo-medio">
              ${e.medio || ''}
            </div>

            <a
              href="${e.link || '#'}"
              target="_blank"
            >
              ${e.titulo || ''}
            </a>

          </div>

        `).join('')
      }

    </div>

  `;

}


cargarDashboard();
