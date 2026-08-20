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
          el archivo de análisis.
        </p>
      </div>
    `;

  }

}


/* =========================
   UTILIDADES
========================= */

function escaparHTML(texto) {

  if (texto === null || texto === undefined) {
    return '';
  }

  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

}


function obtenerInsight(item) {

  return (
    item.insight ||
    item.motivo ||
    item.motivo_oportunidad ||
    ''
  );

}


function obtenerMaxCobertura(cobertura) {

  if (!cobertura) return 1;

  const valores = Object.values(cobertura)
    .map(Number)
    .filter(v => !isNaN(v));

  return Math.max(...valores, 1);

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

      <article class="prioridad-card">

        <div class="prioridad-top">

          <div class="prioridad-numero">
            ${escaparHTML(item.prioridad)}
          </div>

          <span class="prioridad-label">
            PRIORIDAD
          </span>

        </div>

        <h3>
          ${escaparHTML(item.tema)}
        </h3>

        ${
          item.motivo
            ? `
              <p>
                ${escaparHTML(item.motivo)}
              </p>
            `
            : ''
        }

        ${
          item.accion_sugerida
            ? `
              <div class="accion">

                <div class="accion-label">
                  ACCIÓN SUGERIDA
                </div>

                ${escaparHTML(item.accion_sugerida)}

              </div>
            `
            : ''
        }

      </article>

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
        data[categoria] || [],
        categoria
      );

    });

  });


  mostrarCategoria(
    data.hipercompetencia || [],
    'hipercompetencia'
  );

}


/* =========================
   MOSTRAR CATEGORÍA
========================= */

function mostrarCategoria(items, categoria) {

  const contenedor =
    document.getElementById('contenido');

  if (!items.length) {

    contenedor.innerHTML = `
      <div class="tema-card vacio">
        <h3>No hay temas detectados</h3>
        <p>
          El análisis de hoy no encontró elementos suficientes
          para esta categoría.
        </p>
      </div>
    `;

    return;

  }


  contenedor.innerHTML = `

    <div class="temas-grid">

      ${items.map((item, index) =>
        crearTema(item, categoria, index)
      ).join('')}

    </div>

  `;


  configurarExpandibles();

}


/* =========================
   CONFIGURAR DESPLEGABLES
========================= */

function configurarExpandibles() {

  const botones =
    document.querySelectorAll('.btn-expandir');

  botones.forEach(boton => {

    boton.addEventListener('click', function() {

      const card =
        boton.closest('.tema-card');

      const detalle =
        card.querySelector('.detalle-expandible');

      const abierto =
        detalle.classList.contains('abierto');


      if (abierto) {

        detalle.classList.remove('abierto');

        boton.innerHTML =
          'Ver análisis completo <span>↓</span>';

      } else {

        detalle.classList.add('abierto');

        boton.innerHTML =
          'Ocultar análisis <span>↑</span>';

      }

    });

  });

}


/* =========================
   CREAR TARJETA
========================= */

function crearTema(item, categoria, index) {

  const cobertura =
    crearCobertura(item.cobertura);

  const ejemplos =
    crearEjemplos(item.ejemplos);

  const insight =
    obtenerInsight(item);

  const porQueImporta =
    item.por_que_importa || '';

  const accion =
    item.accion_sugerida || '';

  const enfoques =
    crearEnfoques(item.enfoques_sugeridos);

  const id =
    `${categoria}-${index}`;


  return `

    <article class="tema-card" id="${id}">

      <div class="tema-header">

        <h3>
          ${escaparHTML(item.tema || 'Sin tema')}
        </h3>

        ${
          item.prioridad
            ? `
              <div class="badge-prioridad">
                #${escaparHTML(item.prioridad)}
              </div>
            `
            : ''
        }

      </div>


      <div class="metricas">

        ${
          item.total_notas !== undefined
            ? `
              <div class="metrica">
                <span class="metrica-numero">
                  ${escaparHTML(item.total_notas)}
                </span>

                <span>
                  notas
                </span>
              </div>
            `
            : ''
        }


        ${
          item.cantidad_medios
            ? `
              <div class="metrica">
                <span class="metrica-numero">
                  ${escaparHTML(item.cantidad_medios)}
                </span>

                <span>
                  medios
                </span>
              </div>
            `
            : ''
        }


        ${
          item.brecha_perfil !== undefined &&
          item.brecha_perfil !== 0
            ? `
              <div class="metrica metrica-alerta">
                <span class="metrica-numero">
                  ${escaparHTML(item.brecha_perfil)}
                </span>

                <span>
                  brecha
                </span>
              </div>
            `
            : ''
        }


        ${
          item.diferencia !== undefined &&
          item.diferencia !== 0
            ? `
              <div class="metrica metrica-success">
                <span class="metrica-numero">
                  ${escaparHTML(item.diferencia)}
                </span>

                <span>
                  diferencia
                </span>
              </div>
            `
            : ''
        }

      </div>


      ${cobertura}


      ${
        insight
          ? `
            <div class="insight insight-principal">

              <div class="bloque-titulo">
                INSIGHT EDITORIAL
              </div>

              <p>
                ${escaparHTML(insight)}
              </p>

            </div>
          `
          : ''
      }


      <button
        class="btn-expandir"
        type="button"
      >
        Ver análisis completo
        <span>↓</span>
      </button>


      <div class="detalle-expandible">


        ${
          porQueImporta
            ? `
              <div class="bloque-analisis">

                <div class="bloque-titulo">
                  ¿POR QUÉ IMPORTA?
                </div>

                <p>
                  ${escaparHTML(porQueImporta)}
                </p>

              </div>
            `
            : ''
        }


        ${
          accion
            ? `
              <div class="accion accion-destacada">

                <div class="accion-label">
                  ACCIÓN SUGERIDA
                </div>

                ${escaparHTML(accion)}

              </div>
            `
            : ''
        }


        ${enfoques}


        ${ejemplos}


      </div>

    </article>

  `;

}


/* =========================
   COBERTURA POR MEDIO
========================= */

function crearCobertura(cobertura) {

  if (
    !cobertura ||
    Object.keys(cobertura).length === 0
  ) {
    return '';
  }


  const maximo =
    obtenerMaxCobertura(cobertura);


  const medios =
    Object.entries(cobertura)
      .sort((a, b) => {

        if (a[0] === 'Perfil') return -1;
        if (b[0] === 'Perfil') return 1;

        return Number(b[1]) - Number(a[1]);

      });


  return `

    <div class="cobertura">

      <div class="bloque-titulo">
        COBERTURA POR MEDIO
      </div>

      <div class="cobertura-lista">

        ${
          medios.map(([medio, cantidad]) => {

            const numero =
              Number(cantidad) || 0;

            const porcentaje =
              numero === 0
                ? 0
                : Math.max(
                    4,
                    (numero / maximo) * 100
                  );

            const esPerfil =
              medio.toLowerCase() === 'perfil';


            return `

              <div
                class="
                  medio-row
                  ${esPerfil ? 'medio-perfil' : ''}
                "
              >

                <div class="medio-nombre">
                  ${escaparHTML(medio)}
                </div>

                <div class="barra-wrapper">

                  <div
                    class="barra"
                    style="width: ${porcentaje}%"
                  ></div>

                </div>

                <strong>
                  ${numero}
                </strong>

              </div>

            `;

          }).join('')
        }

      </div>

    </div>

  `;

}


/* =========================
   ENFOQUES SUGERIDOS
========================= */

function crearEnfoques(enfoques) {

  if (!enfoques || !enfoques.length) {
    return '';
  }


  const enfoquesValidos =
    enfoques.filter(enfoque =>
      enfoque &&
      String(enfoque).trim() !== ''
    );


  if (!enfoquesValidos.length) {
    return '';
  }


  return `

    <div class="enfoques">

      <div class="bloque-titulo">
        ENFOQUES SUGERIDOS
      </div>

      <div class="enfoques-lista">

        ${
          enfoquesValidos.map(enfoque => `

            <div class="enfoque">

              <span class="enfoque-icono">
                →
              </span>

              <span>
                ${escaparHTML(enfoque)}
              </span>

            </div>

          `).join('')
        }

      </div>

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


  const ejemplosValidos =
    ejemplos.filter(e =>
      e &&
      (e.titulo || e.link || e.medio)
    );


  if (!ejemplosValidos.length) {
    return '';
  }


  return `

    <div class="ejemplos">

      <div class="bloque-titulo">
        NOTAS UTILIZADAS EN EL ANÁLISIS
      </div>

      ${
        ejemplosValidos.map(e => {

          const tieneLink =
            e.link &&
            String(e.link).startsWith('http');


          return `

            <article class="ejemplo">

              <div class="ejemplo-medio">
                ${escaparHTML(e.medio || 'Medio')}
              </div>

              ${
                tieneLink
                  ? `
                    <a
                      href="${escaparHTML(e.link)}"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ${escaparHTML(e.titulo || 'Ver nota')}
                      <span class="link-icono">↗</span>
                    </a>
                  `
                  : `
                    <div class="ejemplo-titulo">
                      ${escaparHTML(e.titulo || '')}
                    </div>
                  `
              }

            </article>

          `;

        }).join('')
      }

    </div>

  `;

}


cargarDashboard();
