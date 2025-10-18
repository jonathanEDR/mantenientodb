// Script de prueba para verificar la lógica corregida del semáforo
import { calcularSemaforoSimple } from '../src/utils/semaforoUtils';

// Configuración exacta de la imagen del usuario
const configuracionUsuario = {
  habilitado: true,
  unidad: 'HORAS',
  umbrales: {
    morado: 50,   // MORADO
    rojo: 50,     // ROJO  
    naranja: 30,  // NARANJA
    amarillo: 20, // AMARILLO
    verde: 0      // VERDE
  },
  descripciones: {
    morado: 'SOBRE-CRÍTICO',
    rojo: 'Crítico - Programar overhaul inmediatamente', 
    naranja: 'Alto - Preparar overhaul próximo',
    amarillo: 'Medio - Monitorear progreso',
    verde: 'OK - Funcionando normal'
  }
};

console.log('🧪 PRUEBA DE CORRECCIÓN DEL SEMÁFORO FRONTEND');
console.log('============================================');

// Caso del usuario: TSO = 0h, 50h restantes para overhaul
const horasRestantes = 50;

console.log('\n📊 CONFIGURACIÓN:');
console.log(`  - Horas restantes: ${horasRestantes}h`);
console.log(`  - Umbrales: MORADO=${configuracionUsuario.umbrales.morado}, ROJO=${configuracionUsuario.umbrales.rojo}, NARANJA=${configuracionUsuario.umbrales.naranja}, AMARILLO=${configuracionUsuario.umbrales.amarillo}, VERDE=${configuracionUsuario.umbrales.verde}`);

const resultado = calcularSemaforoSimple(horasRestantes, configuracionUsuario);

console.log('\n🚦 RESULTADO DEL SEMÁFORO:');
console.log(`  - Color calculado: ${resultado.color}`);
console.log(`  - Descripción: ${resultado.descripcion}`);
console.log(`  - Nivel: ${resultado.nivel}`);
console.log(`  - Requiere atención: ${resultado.requiereAtencion}`);

console.log('\n🔍 ANÁLISIS DE LA LÓGICA:');
console.log(`  - ${horasRestantes}h <= ${configuracionUsuario.umbrales.amarillo}h (amarillo)? ${horasRestantes <= configuracionUsuario.umbrales.amarillo} → ${horasRestantes <= configuracionUsuario.umbrales.amarillo ? 'ROJO' : 'NO'}`);
console.log(`  - ${horasRestantes}h <= ${configuracionUsuario.umbrales.naranja}h (naranja)? ${horasRestantes <= configuracionUsuario.umbrales.naranja} → ${horasRestantes <= configuracionUsuario.umbrales.naranja ? 'NARANJA' : 'NO'}`);
console.log(`  - ${horasRestantes}h <= ${configuracionUsuario.umbrales.rojo}h (rojo)? ${horasRestantes <= configuracionUsuario.umbrales.rojo} → ${horasRestantes <= configuracionUsuario.umbrales.rojo ? 'AMARILLO' : 'NO'}`);
console.log(`  - ${horasRestantes}h > ${configuracionUsuario.umbrales.rojo}h? ${horasRestantes > configuracionUsuario.umbrales.rojo} → ${horasRestantes > configuracionUsuario.umbrales.rojo ? 'VERDE' : 'NO'}`);

// Verificar el resultado esperado
console.log('\n✅ VERIFICACIÓN:');
if (resultado.color === 'AMARILLO') {
  console.log('  ✅ CORRECTO: Con 50h restantes y umbrales configurados, debe mostrar AMARILLO');
} else if (resultado.color === 'VERDE') {
  console.log('  ❌ INCORRECTO: Muestra VERDE cuando debería ser AMARILLO');
} else {
  console.log(`  ❌ INCORRECTO: Muestra ${resultado.color} cuando debería ser AMARILLO`);
}

console.log('\n🎯 INTERPRETACIÓN:');
console.log('   Con TSO = 0h (recién completó overhaul) y 50h restantes,');
console.log('   según la configuración mostrada en la imagen del usuario,');
console.log('   debería mostrar AMARILLO hasta que queden menos de 20h.');