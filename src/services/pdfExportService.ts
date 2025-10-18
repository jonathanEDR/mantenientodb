import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface DatosAeronave {
  matricula: string;
  modelo: string;
  tipo: 'HELICOPTERO' | 'AVION';
  horasTotales: number;
  estado: string;
}

interface DatosComponente {
  _id: string;
  numeroSerie: string;
  numeroParte: string;
  nombre: string;
  categoriaId?: {
    nombre: string;
  };
  categoria?: string; // También soportar el string directo
  estado: string;
  vidaUtil: any; // Aceptar la estructura de vidaUtil del backend
  estadosMonitoreo?: EstadoMonitoreo[];
}

interface EstadoMonitoreo {
  _id: string;
  catalogoControlId: {
    nombre: string;
    horaInicial?: number;
    horaFinal?: number;
  };
  valorActual: number;
  valorLimite: number;
  unidad: string;
  semaforo?: {
    color: string;
    nivel: number;
    mensaje: string;
  };
  configuracionOverhaul?: {
    activado: boolean;
    intervaloOverhaul: number;
    horasUltimoOverhaul: number;
  };
}

interface DatosReporte {
  aeronave: DatosAeronave;
  componentes: DatosComponente[];
  fecha: Date;
  totalComponentes: number;
  totalEstadosMonitoreo: number;
  alertasCriticas: number;
  alertasAltas: number;
}

// ============================================================================
// CONSTANTES DE DISEÑO
// ============================================================================

const COLORES = {
  primary: '#2563eb',      // Azul principal
  secondary: '#64748b',    // Gris secundario
  success: '#10b981',      // Verde éxito
  warning: '#f59e0b',      // Amarillo advertencia
  danger: '#ef4444',       // Rojo peligro
  purple: '#8b5cf6',       // Morado crítico
  dark: '#1e293b',         // Oscuro para texto
  light: '#f1f5f9',        // Claro para fondos
  border: '#cbd5e1',       // Bordes
};

const SEMAFORO_COLORES: Record<string, string> = {
  'VERDE': COLORES.success,
  'AMARILLO': COLORES.warning,
  'NARANJA': '#fb923c',
  'ROJO': COLORES.danger,
  'MORADO': COLORES.purple,
};

// ============================================================================
// FUNCIÓN PRINCIPAL DE EXPORTACIÓN
// ============================================================================

export const exportarComponentesPDF = (datos: DatosReporte): void => {
  try {
    console.log('📄 [PDF] Iniciando generación de PDF con datos:', {
      aeronave: datos.aeronave.matricula,
      totalComponentes: datos.componentes.length,
      componentesConEstados: datos.componentes.filter(c => c.estadosMonitoreo && c.estadosMonitoreo.length > 0).length,
      detalleComponentes: datos.componentes.map(c => ({
        nombre: c.nombre,
        serie: c.numeroSerie,
        estadosCount: c.estadosMonitoreo?.length || 0,
        estados: c.estadosMonitoreo?.map(e => e.catalogoControlId?.nombre || 'N/A') || []
      }))
    });
    
    // Crear documento PDF (A4, vertical)
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    let yPosition = 20; // Posición vertical inicial

    // ========== ENCABEZADO ==========
    yPosition = generarEncabezado(doc, datos.aeronave, yPosition, pageWidth);
    
    // ========== RESUMEN EJECUTIVO ==========
    yPosition = generarResumenEjecutivo(doc, datos, yPosition, pageWidth, pageHeight);
    
    // ========== DETALLE DE COMPONENTES ==========
    yPosition = generarDetalleComponentes(doc, datos.componentes, yPosition, pageWidth, pageHeight);
    
    // ========== PIE DE PÁGINA EN TODAS LAS PÁGINAS ==========
    const totalPages = (doc as any).internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      generarPiePagina(doc, datos.fecha, i, totalPages, pageWidth, pageHeight);
    }
    
    // ========== DESCARGAR ARCHIVO ==========
    const nombreArchivo = `Reporte_Componentes_${datos.aeronave.matricula}_${formatearFecha(datos.fecha)}.pdf`;
    doc.save(nombreArchivo);
    
    console.log('✅ PDF generado exitosamente:', nombreArchivo);
  } catch (error) {
    console.error('❌ Error al generar PDF:', error);
    throw new Error('No se pudo generar el reporte PDF');
  }
};

// ============================================================================
// GENERACIÓN DE ENCABEZADO
// ============================================================================

const generarEncabezado = (
  doc: jsPDF, 
  aeronave: DatosAeronave, 
  yPosition: number, 
  pageWidth: number
): number => {
  // Título principal
  doc.setFillColor(COLORES.primary);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORTE DE COMPONENTES Y MONITOREO', pageWidth / 2, 15, { align: 'center' });
  
  // Información de la aeronave
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Aeronave: ${aeronave.matricula} | Modelo: ${aeronave.modelo}`, pageWidth / 2, 25, { align: 'center' });
  doc.text(`Tipo: ${aeronave.tipo} | Horas Totales: ${aeronave.horasTotales.toFixed(2)}h`, pageWidth / 2, 33, { align: 'center' });
  
  // Estado de la aeronave
  const estadoColor = aeronave.estado === 'OPERATIVO' ? COLORES.success : COLORES.warning;
  doc.setFillColor(estadoColor);
  doc.roundedRect(pageWidth / 2 - 15, 37, 30, 5, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(aeronave.estado, pageWidth / 2, 40.5, { align: 'center' });
  
  return 50; // Retorna nueva posición Y
};

// ============================================================================
// GENERACIÓN DE RESUMEN EJECUTIVO
// ============================================================================

const generarResumenEjecutivo = (
  doc: jsPDF,
  datos: DatosReporte,
  yPosition: number,
  pageWidth: number,
  pageHeight: number
): number => {
  // Verificar espacio disponible
  if (yPosition + 40 > pageHeight - 20) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Título de sección
  doc.setTextColor(COLORES.dark);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('📊 RESUMEN EJECUTIVO', 14, yPosition);
  yPosition += 10;
  
  // Estadísticas en cajas
  const boxWidth = (pageWidth - 35) / 3;
  const boxHeight = 20;
  const startX = 14;
  
  // Caja 1: Total Componentes
  doc.setFillColor(COLORES.primary);
  doc.roundedRect(startX, yPosition, boxWidth, boxHeight, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Total Componentes', startX + boxWidth / 2, yPosition + 7, { align: 'center' });
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(String(datos.totalComponentes), startX + boxWidth / 2, yPosition + 15, { align: 'center' });
  
  // Caja 2: Alertas Críticas
  doc.setFillColor(COLORES.danger);
  doc.roundedRect(startX + boxWidth + 3.5, yPosition, boxWidth, boxHeight, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Alertas Críticas', startX + boxWidth + 3.5 + boxWidth / 2, yPosition + 7, { align: 'center' });
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(String(datos.alertasCriticas), startX + boxWidth + 3.5 + boxWidth / 2, yPosition + 15, { align: 'center' });
  
  // Caja 3: Alertas Altas
  doc.setFillColor(COLORES.warning);
  doc.roundedRect(startX + (boxWidth + 3.5) * 2, yPosition, boxWidth, boxHeight, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Alertas Altas', startX + (boxWidth + 3.5) * 2 + boxWidth / 2, yPosition + 7, { align: 'center' });
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(String(datos.alertasAltas), startX + (boxWidth + 3.5) * 2 + boxWidth / 2, yPosition + 15, { align: 'center' });
  
  yPosition += boxHeight + 10;
  
  return yPosition;
};

// ============================================================================
// GENERACIÓN DE DETALLE DE COMPONENTES
// ============================================================================

const generarDetalleComponentes = (
  doc: jsPDF,
  componentes: DatosComponente[],
  yPosition: number,
  pageWidth: number,
  pageHeight: number
): number => {
  // Verificar espacio para título
  if (yPosition + 20 > pageHeight - 20) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Título de sección
  doc.setTextColor(COLORES.dark);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('🔧 DETALLE DE COMPONENTES', 14, yPosition);
  yPosition += 8;
  
  // Iterar sobre cada componente
  componentes.forEach((componente, index) => {
    // Verificar espacio disponible (componente + estados mínimo)
    if (yPosition + 45 > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }
    
    // ========== ENCABEZADO DEL COMPONENTE ==========
    doc.setFillColor(COLORES.light);
    doc.rect(14, yPosition, pageWidth - 28, 20, 'F');
    
    // Número de componente
    doc.setFillColor(COLORES.primary);
    doc.circle(20, yPosition + 10, 4, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(String(index + 1), 20, yPosition + 11.5, { align: 'center' });
    
    // Información del componente
    doc.setTextColor(COLORES.dark);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(componente.nombre || 'Sin nombre', 27, yPosition + 7);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORES.secondary);
    doc.text(`S/N: ${componente.numeroSerie} | P/N: ${componente.numeroParte}`, 27, yPosition + 12);
    
    const categoriaNombre = componente.categoriaId?.nombre || componente.categoria || 'N/A';
    const vidaUtilHoras = Array.isArray(componente.vidaUtil) 
      ? componente.vidaUtil.find((v: any) => v.unidad === 'HORAS')?.acumulado || 0
      : componente.vidaUtil || 0;
    
    doc.text(`Categoría: ${categoriaNombre} | Vida Útil: ${vidaUtilHoras.toFixed(2)}h`, 27, yPosition + 17);
    
    // Estado operativo
    const estadoColor = componente.estado === 'INSTALADO' || componente.estado === 'OPERATIVO' ? COLORES.success : COLORES.danger;
    doc.setFillColor(estadoColor);
    doc.roundedRect(pageWidth - 40, yPosition + 6, 22, 6, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(componente.estado, pageWidth - 29, yPosition + 10.5, { align: 'center' });
    
    yPosition += 25;
    
    // ========== RESUMEN DE ALERTAS DEL COMPONENTE ==========
    if (componente.estadosMonitoreo && componente.estadosMonitoreo.length > 0) {
      const alertas = {
        criticas: componente.estadosMonitoreo.filter(e => e.semaforo?.color === 'ROJO' || e.semaforo?.color === 'MORADO').length,
        altas: componente.estadosMonitoreo.filter(e => e.semaforo?.color === 'NARANJA').length,
        medias: componente.estadosMonitoreo.filter(e => e.semaforo?.color === 'AMARILLO').length,
        ok: componente.estadosMonitoreo.filter(e => e.semaforo?.color === 'VERDE').length
      };
      
      if (alertas.criticas > 0 || alertas.altas > 0 || alertas.medias > 0) {
        // Mostrar resumen de alertas
        doc.setFillColor(255, 243, 224); // Fondo naranja claro
        doc.roundedRect(14, yPosition, pageWidth - 28, 8, 2, 2, 'F');
        
        doc.setTextColor(COLORES.dark);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        let alertaTexto = '⚠️ Alertas: ';
        if (alertas.criticas > 0) alertaTexto += `${alertas.criticas} Crítica(s) 🔴 `;
        if (alertas.altas > 0) alertaTexto += `${alertas.altas} Alta(s) 🟠 `;
        if (alertas.medias > 0) alertaTexto += `${alertas.medias} Media(s) 🟡`;
        
        doc.text(alertaTexto, 18, yPosition + 5.5);
        yPosition += 11;
      }
    }
    
    // ========== TABLA DE ESTADOS DE MONITOREO ==========
    if (componente.estadosMonitoreo && componente.estadosMonitoreo.length > 0) {
      const estadosData = componente.estadosMonitoreo.map(estado => {
        const tso = estado.configuracionOverhaul?.activado 
          ? estado.valorActual - (estado.configuracionOverhaul.horasUltimoOverhaul || 0)
          : 0;
        
        const horasRestantes = estado.configuracionOverhaul?.activado
          ? estado.configuracionOverhaul.intervaloOverhaul - tso
          : estado.valorLimite - estado.valorActual;
        
        const porcentaje = ((estado.valorActual / estado.valorLimite) * 100).toFixed(1);
        
        // Determinar acción recomendada
        let accion = 'OK';
        if (estado.semaforo) {
          if (estado.semaforo.color === 'MORADO') accion = '⚠️ URGENTE';
          else if (estado.semaforo.color === 'ROJO') accion = '🔴 Crítico';
          else if (estado.semaforo.color === 'NARANJA') accion = '🟠 Alto';
          else if (estado.semaforo.color === 'AMARILLO') accion = '🟡 Medio';
          else accion = '✅ OK';
        }
        
        return [
          estado.catalogoControlId?.nombre || 'N/A',
          `${estado.valorActual.toFixed(2)}h / ${estado.valorLimite.toFixed(2)}h`,
          `${porcentaje}%`,
          estado.semaforo ? formatearSemaforo(estado.semaforo.color) : '-',
          `${horasRestantes.toFixed(2)}h`,
          estado.configuracionOverhaul?.activado ? `${tso.toFixed(2)}h` : 'N/A',
          accion
        ];
      });
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Control', 'Progreso', '%', 'Estado', 'Restantes', 'TSO', 'Acción']],
        body: estadosData,
        theme: 'grid',
        headStyles: {
          fillColor: COLORES.primary,
          textColor: '#ffffff',
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center',
        },
        bodyStyles: {
          fontSize: 8,
          textColor: COLORES.dark,
        },
        alternateRowStyles: {
          fillColor: COLORES.light,
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 15, halign: 'center' },
          3: { cellWidth: 20, halign: 'center' },
          4: { cellWidth: 22, halign: 'center' },
          5: { cellWidth: 20, halign: 'center' },
          6: { cellWidth: 28, halign: 'center' },
        },
        margin: { left: 14, right: 14 },
        didDrawCell: (data: any) => {
          // Colorear columna de estado según semáforo
          if (data.column.index === 3 && data.section === 'body') {
            const estado = componente.estadosMonitoreo![data.row.index];
            if (estado.semaforo) {
              const color = SEMAFORO_COLORES[estado.semaforo.color] || COLORES.secondary;
              doc.setFillColor(color);
              doc.rect(
                data.cell.x + 1,
                data.cell.y + 1,
                data.cell.width - 2,
                data.cell.height - 2,
                'F'
              );
              doc.setTextColor(255, 255, 255);
              doc.setFontSize(8);
              doc.setFont('helvetica', 'bold');
              doc.text(
                formatearSemaforo(estado.semaforo.color),
                data.cell.x + data.cell.width / 2,
                data.cell.y + data.cell.height / 2 + 1,
                { align: 'center' }
              );
            }
          }
          
          // Colorear columna de acción según criticidad
          if (data.column.index === 6 && data.section === 'body') {
            const estado = componente.estadosMonitoreo![data.row.index];
            if (estado.semaforo) {
              let bgColor = COLORES.light;
              let textColor = COLORES.dark;
              
              if (estado.semaforo.color === 'MORADO') {
                bgColor = '#fef2f2'; // Rojo muy claro
                textColor = COLORES.danger;
              } else if (estado.semaforo.color === 'ROJO') {
                bgColor = '#fef2f2';
                textColor = COLORES.danger;
              } else if (estado.semaforo.color === 'NARANJA') {
                bgColor = '#fff7ed'; // Naranja claro
                textColor = '#ea580c';
              } else if (estado.semaforo.color === 'AMARILLO') {
                bgColor = '#fefce8'; // Amarillo claro
                textColor = '#ca8a04';
              }
              
              doc.setFillColor(bgColor);
              doc.rect(
                data.cell.x + 1,
                data.cell.y + 1,
                data.cell.width - 2,
                data.cell.height - 2,
                'F'
              );
              doc.setTextColor(textColor);
              doc.setFontSize(7);
              doc.setFont('helvetica', 'bold');
            }
          }
        },
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 3;
      
      // ========== DETALLES ADICIONALES DE ESTADOS DE MONITOREO ==========
      componente.estadosMonitoreo.forEach((estado, idx) => {
        // Verificar espacio para detalles
        if (yPosition + 25 > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Solo mostrar detalles si hay información relevante
        if (estado.semaforo && (estado.semaforo.color !== 'VERDE' || estado.configuracionOverhaul?.activado)) {
          // Fondo suave para destacar
          doc.setFillColor(245, 247, 250);
          doc.rect(14, yPosition, pageWidth - 28, 18, 'F');
          
          // Nombre del control
          doc.setTextColor(COLORES.dark);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.text(`📋 ${estado.catalogoControlId?.nombre || 'Control'}:`, 18, yPosition + 5);
          
          // Mensaje del semáforo
          if (estado.semaforo.mensaje) {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(COLORES.secondary);
            doc.setFontSize(7);
            const mensajeLineas = doc.splitTextToSize(estado.semaforo.mensaje, pageWidth - 40);
            doc.text(mensajeLineas, 18, yPosition + 10);
          }
          
          // Información de overhaul si está activado
          if (estado.configuracionOverhaul?.activado) {
            const tso = estado.valorActual - (estado.configuracionOverhaul.horasUltimoOverhaul || 0);
            doc.setFontSize(7);
            doc.setTextColor(COLORES.primary);
            doc.text(
              `🔄 Overhaul: cada ${estado.configuracionOverhaul.intervaloOverhaul}h | Último: ${estado.configuracionOverhaul.horasUltimoOverhaul.toFixed(2)}h | Desde último: ${tso.toFixed(2)}h`,
              18,
              yPosition + 15
            );
          }
          
          yPosition += 21;
        }
      });
      
      yPosition += 5;
    } else {
      // Sin estados de monitoreo
      doc.setTextColor(COLORES.secondary);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('Sin estados de monitoreo configurados', 20, yPosition);
      yPosition += 10;
    }
    
    // Separador entre componentes
    if (index < componentes.length - 1) {
      doc.setDrawColor(COLORES.border);
      doc.setLineWidth(0.5);
      doc.line(14, yPosition, pageWidth - 14, yPosition);
      yPosition += 8;
    }
  });
  
  return yPosition;
};

// ============================================================================
// GENERACIÓN DE PIE DE PÁGINA
// ============================================================================

const generarPiePagina = (
  doc: jsPDF,
  fecha: Date,
  numeroPagina: number,
  totalPaginas: number,
  pageWidth: number,
  pageHeight: number
): void => {
  // Línea separadora
  doc.setDrawColor(COLORES.border);
  doc.setLineWidth(0.5);
  doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);
  
  // Texto del pie
  doc.setTextColor(COLORES.secondary);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  // Fecha de generación (izquierda)
  doc.text(`Generado: ${formatearFechaCompleta(fecha)}`, 14, pageHeight - 10);
  
  // Número de página (centro)
  doc.text(`Página ${numeroPagina} de ${totalPaginas}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  // Sistema (derecha)
  doc.text('Sistema de Mantenimiento de Aeronaves', pageWidth - 14, pageHeight - 10, { align: 'right' });
};

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

const formatearSemaforo = (color: string): string => {
  const emojis: Record<string, string> = {
    'VERDE': '🟢',
    'AMARILLO': '🟡',
    'NARANJA': '🟠',
    'ROJO': '🔴',
    'MORADO': '🟣',
  };
  return emojis[color] || color;
};

const formatearFecha = (fecha: Date): string => {
  return fecha.toISOString().split('T')[0].replace(/-/g, '');
};

const formatearFechaCompleta = (fecha: Date): string => {
  return fecha.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ============================================================================
// FUNCIÓN PARA CALCULAR ESTADÍSTICAS
// ============================================================================

export const calcularEstadisticasReporte = (componentes: DatosComponente[]): {
  totalComponentes: number;
  totalEstadosMonitoreo: number;
  alertasCriticas: number;
  alertasAltas: number;
} => {
  let totalEstadosMonitoreo = 0;
  let alertasCriticas = 0;
  let alertasAltas = 0;
  
  componentes.forEach(componente => {
    if (componente.estadosMonitoreo) {
      totalEstadosMonitoreo += componente.estadosMonitoreo.length;
      
      componente.estadosMonitoreo.forEach(estado => {
        if (estado.semaforo) {
          if (estado.semaforo.color === 'ROJO' || estado.semaforo.color === 'MORADO') {
            alertasCriticas++;
          } else if (estado.semaforo.color === 'NARANJA') {
            alertasAltas++;
          }
        }
      });
    }
  });
  
  return {
    totalComponentes: componentes.length,
    totalEstadosMonitoreo,
    alertasCriticas,
    alertasAltas,
  };
};
