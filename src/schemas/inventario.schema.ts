import { z } from 'zod';

/**
 * Schemas de validación para Inventario usando Zod
 */

// Estados válidos de aeronave
export const estadoAeronaveSchema = z.enum([
  'Operativo',
  'En Mantenimiento',
  'Fuera de Servicio',
  'En Reparación',
]);

// Tipos válidos de aeronave
export const tipoAeronaveSchema = z.enum(['Helicóptero', 'Avión']);

// Schema para crear aeronave
export const crearAeronaveSchema = z.object({
  matricula: z
    .string()
    .min(1, 'La matrícula es requerida')
    .max(20, 'La matrícula no puede exceder 20 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'La matrícula solo puede contener letras mayúsculas, números y guiones')
    .transform((val) => val.toUpperCase()),

  tipo: tipoAeronaveSchema,

  modelo: z
    .string()
    .min(1, 'El modelo es requerido')
    .max(100, 'El modelo no puede exceder 100 caracteres'),

  fabricante: z
    .string()
    .min(1, 'El fabricante es requerido')
    .max(100, 'El fabricante no puede exceder 100 caracteres'),

  anoFabricacion: z
    .number()
    .int('El año debe ser un número entero')
    .min(1900, 'El año no puede ser menor a 1900')
    .max(new Date().getFullYear() + 1, `El año no puede ser mayor a ${new Date().getFullYear() + 1}`),

  estado: estadoAeronaveSchema.default('Operativo'),

  ubicacionActual: z
    .string()
    .min(1, 'La ubicación es requerida')
    .max(200, 'La ubicación no puede exceder 200 caracteres'),

  horasVuelo: z
    .number()
    .nonnegative('Las horas de vuelo no pueden ser negativas')
    .default(0),

  observaciones: z
    .string()
    .max(1000, 'Las observaciones no pueden exceder 1000 caracteres')
    .optional(),
});

// Schema para actualizar aeronave (todos los campos opcionales excepto validaciones)
export const actualizarAeronaveSchema = crearAeronaveSchema.partial();

// Schema para actualizar solo horas
export const actualizarHorasSchema = z.object({
  horasVuelo: z
    .number()
    .nonnegative('Las horas de vuelo no pueden ser negativas')
    .max(999999, 'Las horas de vuelo no pueden exceder 999,999'),

  propagarAComponentes: z.boolean().default(true),

  motivo: z
    .string()
    .max(500, 'El motivo no puede exceder 500 caracteres')
    .optional(),

  observaciones: z
    .string()
    .max(1000, 'Las observaciones no pueden exceder 1000 caracteres')
    .optional(),
});

// Schema para actualizar solo estado
export const actualizarEstadoSchema = z.object({
  estado: estadoAeronaveSchema,
});

// Schema para filtros de búsqueda
export const filtrosInventarioSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  search: z.string().max(100).optional(),
  tipo: tipoAeronaveSchema.optional(),
  estado: estadoAeronaveSchema.optional(),
});

// Tipos TypeScript derivados de los schemas
export type CrearAeronaveInput = z.infer<typeof crearAeronaveSchema>;
export type ActualizarAeronaveInput = z.infer<typeof actualizarAeronaveSchema>;
export type ActualizarHorasInput = z.infer<typeof actualizarHorasSchema>;
export type ActualizarEstadoInput = z.infer<typeof actualizarEstadoSchema>;
export type FiltrosInventarioInput = z.infer<typeof filtrosInventarioSchema>;

/**
 * Función helper para validar datos
 */
export const validateInventarioData = {
  crearAeronave: (data: unknown) => {
    return crearAeronaveSchema.parse(data);
  },

  actualizarAeronave: (data: unknown) => {
    return actualizarAeronaveSchema.parse(data);
  },

  actualizarHoras: (data: unknown) => {
    return actualizarHorasSchema.parse(data);
  },

  actualizarEstado: (data: unknown) => {
    return actualizarEstadoSchema.parse(data);
  },

  filtros: (data: unknown) => {
    return filtrosInventarioSchema.parse(data);
  },
};

/**
 * Función helper para validación segura (no lanza errores)
 */
export const safeValidateInventarioData = {
  crearAeronave: (data: unknown) => {
    return crearAeronaveSchema.safeParse(data);
  },

  actualizarAeronave: (data: unknown) => {
    return actualizarAeronaveSchema.safeParse(data);
  },

  actualizarHoras: (data: unknown) => {
    return actualizarHorasSchema.safeParse(data);
  },

  actualizarEstado: (data: unknown) => {
    return actualizarEstadoSchema.safeParse(data);
  },

  filtros: (data: unknown) => {
    return filtrosInventarioSchema.safeParse(data);
  },
};

/**
 * Función para formatear errores de Zod de forma legible
 */
export const formatZodError = (error: z.ZodError): string => {
  const errors = error.errors.map((err) => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });

  return errors.join(', ');
};
