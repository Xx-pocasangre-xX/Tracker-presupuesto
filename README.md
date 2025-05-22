# 💰 Sistema de Presupuesto Personal

Un sistema completo y flexible para gestionar tus finanzas personales mes a mes.

## 📁 Estructura del Proyecto

```
presupuesto-personal/
├── index.html              # Página principal
├── css/
│   └── index.css         # Estilos CSS
├── js/
│   └── index.js             # Lógica de la aplicación
└── README.md               # Documentación
```

## 🚀 Instalación y Uso

### Instalación
1. **Descarga** todos los archivos
2. **Crea** la estructura de carpetas:
   ```
   mi-presupuesto/
   ├── index.html
   ├── css/
   │   └── index.css
   └── js/
       └── index.js
   ```
3. **Abre** `index.html` en tu navegador

### Uso Básico
1. **Selecciona el mes** en el dropdown superior
2. **Haz clic** en cualquier celda amarilla para editarla
3. **Escribe el monto** (sin símbolos, solo números)
4. **Los totales se actualizan automáticamente**
5. **Guarda** regularmente con el botón "Guardar Mes"

## ✨ Características

### 🎯 Completamente Editable
- **Todos los campos** son editables (presupuesto y real)
- **Formateo automático** de moneda
- **Cálculos en tiempo real**
- **Valores por defecto en $0.00**

### 📅 Sistema Mensual
- **Navegación entre meses** sin perder datos
- **Auto-guardado** cada 30 segundos
- **Persistencia** de datos en el navegador

### 💾 Exportación/Importación
- **Archivos JSON** con estructura completa
- **Respaldos** fáciles de crear
- **Restauración** de datos previos
- **Compatible** con Excel

### 📊 Análisis y Historial
- **Comparación** presupuesto vs realidad
- **Historial** mes a mes
- **Análisis de saldos** automático
- **Código de colores** para saldos positivos/negativos

## 🏗️ Categorías Incluidas

### 💵 Ingresos
- Sueldo
- Negocio
- Otros

### 🏠 Servicios
- Renta
- Seguro del carro
- Recibo de Luz
- Seguro de salud
- Recibo de Agua
- Gimnasio
- Recibo de Gas
- Internet

### 🛍️ Gastos
- Despensa
- Comida
- Cine
- Salidas
- Comidas
- Amazon
- Entretenimiento
- Regalos
- Cerveza

### 💰 Ahorro
- Cetes
- Vacaciones
- Ahorro Universidad

### 💳 Deudas
- Carro
- Hipoteca
- Préstamo Negocio
- Tarjetas

## 🎨 Personalización

### Modificar Categorías
Para agregar/modificar categorías, edita:

1. **HTML** (`index.html`): Agregar filas en las tablas
2. **JavaScript** (`js/app.js`): Actualizar arrays de categorías en `calculateCategoryTotal()`

### Cambiar Estilos
Modifica `css/styles.css` para:
- Cambiar colores del tema
- Ajustar diseño responsive
- Personalizar animaciones

## 📱 Responsive Design

El sistema se adapta automáticamente a:
- **Desktop** (4 columnas en detalles)
- **Tablet** (2 columnas en detalles)
- **Mobile** (1 columna, botones full-width)

## 🖨️ Funciones de Impresión

- **Diseño optimizado** para impresión
- **Oculta elementos** no necesarios (botones, selector)
- **Conserva colores** importantes
- **Layout ajustado** para papel

## 🔧 Funciones Técnicas

### Auto-guardado
- Cada **30 segundos** automáticamente
- Al **cambiar de mes**
- Al **cerrar el navegador**

### Manejo de Errores
- **localStorage** con fallback a memoria temporal
- **Validación** de archivos JSON
- **Mensajes** informativos al usuario

### Formateo Inteligente
- **Entrada flexible**: acepta números simples
- **Salida consistente**: formato $X,XXX.XX
- **Validación**: solo números y puntos decimales

## 📋 Funcionalidades de los Botones

| Botón | Función |
|-------|---------|
| 💾 Guardar Mes | Guarda datos del mes actual |
| 📄 Exportar JSON | Descarga archivo con todos los datos |
| 📂 Importar JSON | Carga datos desde archivo |
| 📊 Historial | Muestra resumen de todos los meses |
| 🗑️ Limpiar | Borra datos del mes actual |
| 🖨️ Imprimir | Versión optimizada para imprimir |

## 🛠️ Resolución de Problemas

### El localStorage no funciona
- **Síntoma**: Error de seguridad en consola
- **Solución**: El sistema funciona en memoria temporal
- **Recomendación**: Usa exportar/importar JSON para persistencia

### Los cálculos no se actualizan
- **Causa**: JavaScript deshabilitado
- **Solución**: Habilita JavaScript en tu navegador

### Datos perdidos
- **Prevención**: Exporta JSON regularmente
- **Recuperación**: Importa el último JSON guardado

## 💡 Consejos de Uso

1. **Exporta JSON mensualmente** para respaldos
2. **Usa nombres descriptivos** al guardar archivos
3. **Revisa el historial** para identificar patrones
4. **Compara presupuesto vs real** para mejorar planificación
5. **Personaliza categorías** según tus necesidades

## 🔄 Actualizaciones Futuras

Características planeadas:
- Gráficos y visualizaciones
- Metas de ahorro
- Alertas de presupuesto
- Exportación a Excel directo
- Sincronización en la nube

---

**¡Disfruta gestionando tus finanzas de manera organizada y eficiente!** 💰📊
