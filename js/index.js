// Variables globales
let currentMonth = new Date().toISOString().slice(0, 7);
let budgetData = {};

// Inicializar la aplicación
function init() {
    loadSavedData();
    updateMonthSelector();
    updateTotals();
    setupEventListeners();
}

// Configurar event listeners
function setupEventListeners() {
    // Event listeners para celdas editables
    document.addEventListener('input', function(e) {
        if (e.target.contentEditable === 'true') {
            handleCellEdit(e.target);
        }
    });

    // Mejorar validación de entrada - solo números y punto decimal
    document.addEventListener('keydown', function(e) {
        if (e.target.contentEditable === 'true') {
            // Permitir teclas de control
            const allowedKeys = [
                'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 
                'ArrowUp', 'ArrowDown', 'Tab', 'Enter', 'Home', 'End'
            ];
            
            // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
                return;
            }
            
            // Si es Enter, formatear y actualizar totales
            if (e.key === 'Enter') {
                e.preventDefault();
                formatCellValue(e.target);
                e.target.blur(); // Quitar foco para finalizar edición
                return;
            }
            
            // Permitir teclas de control
            if (allowedKeys.includes(e.key)) {
                return;
            }
            
            // Permitir números
            if (/^[0-9]$/.test(e.key)) {
                return;
            }
            
            // Permitir punto decimal solo si no hay uno ya
            if (e.key === '.' && !e.target.textContent.includes('.')) {
                return;
            }
            
            // Bloquear cualquier otra tecla
            e.preventDefault();
        }
    });

    // Formatear al salir de la celda
    document.addEventListener('blur', function(e) {
        if (e.target.contentEditable === 'true') {
            formatCellValue(e.target);
        }
    }, true);

    // Manejar paste para validar contenido pegado
    document.addEventListener('paste', function(e) {
        if (e.target.contentEditable === 'true') {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            const cleanedPaste = paste.replace(/[^0-9.]/g, '');
            
            // Validar que solo tenga un punto decimal
            const dotCount = (cleanedPaste.match(/\./g) || []).length;
            if (dotCount <= 1 && cleanedPaste !== '') {
                e.target.textContent = cleanedPaste;
                handleCellEdit(e.target);
            }
        }
    });

    // Seleccionar todo el texto al hacer focus
    document.addEventListener('focus', function(e) {
        if (e.target.contentEditable === 'true') {
            // Limpiar formato para edición más fácil
            const value = e.target.textContent.replace(/[^0-9.]/g, '');
            e.target.textContent = value === '0' ? '' : value;
            
            // Seleccionar todo el contenido
            setTimeout(() => {
                const range = document.createRange();
                range.selectNodeContents(e.target);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
            }, 1);
        }
    }, true);
}

// Manejar edición de celdas
function handleCellEdit(cell) {
    let value = cell.textContent.replace(/[^0-9.]/g, '');
    
    // Validar que solo haya un punto decimal
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Permitir edición en tiempo real
    if (value === '') {
        cell.textContent = '';
    } else if (!isNaN(value) && value !== '') {
        // No formatear mientras se está escribiendo
        cell.textContent = value;
    }
    
    // Actualizar totales en tiempo real
    updateTotals();
}

// Formatear valor de celda
function formatCellValue(cell) {
    let value = cell.textContent.replace(/[^0-9.]/g, '');
    
    if (value === '' || isNaN(value)) {
        cell.textContent = '$0.00';
    } else {
        const numValue = parseFloat(value);
        cell.textContent = formatCurrency(numValue);
    }
    
    // Actualizar totales después de formatear
    updateTotals();
    
    // Guardar datos automáticamente después de cada cambio
    saveCurrentData();
}

// Actualizar selector de mes
function updateMonthSelector() {
    const selector = document.getElementById('monthSelector');
    selector.value = currentMonth;
    selector.addEventListener('change', function() {
        saveCurrentData();
        currentMonth = this.value;
        loadMonthData();
    });
}

// Función para actualizar totales automáticamente
function updateTotals() {
    // Calcular totales por categoría (tanto presupuesto como real)
    const serviciosTotal = calculateCategoryTotal('servicios');
    const serviciosPresupuesto = calculateCategoryTotal('servicios_presupuesto');
    const gastosTotal = calculateCategoryTotal('gastos');
    const gastosPresupuesto = calculateCategoryTotal('gastos_presupuesto');
    const ahorroTotal = calculateCategoryTotal('ahorro');
    const ahorroPresupuesto = calculateCategoryTotal('ahorro_presupuesto');
    const deudasTotal = calculateCategoryTotal('deudas');
    const deudasPresupuesto = calculateCategoryTotal('deudas_presupuesto');
    const ingresosTotal = calculateCategoryTotal('ingresos');
    const ingresosPresupuesto = calculateCategoryTotal('ingresos_presupuesto');

    // Actualizar displays de totales reales
    updateElementText('serviciosTotalCalc', formatCurrency(serviciosTotal));
    updateElementText('serviciosTotal', formatCurrency(serviciosTotal));
    updateElementText('gastosTotalCalc', formatCurrency(gastosTotal));
    updateElementText('gastosTotal', formatCurrency(gastosTotal));
    updateElementText('ahorroTotalCalc', formatCurrency(ahorroTotal));
    updateElementText('ahorroTotal', formatCurrency(ahorroTotal));
    updateElementText('deudasTotalCalc', formatCurrency(deudasTotal));
    updateElementText('deudasTotal', formatCurrency(deudasTotal));
    updateElementText('totalIngresosReal', formatCurrency(ingresosTotal));
    updateElementText('totalIngresos', formatCurrency(ingresosTotal));

    // Actualizar displays de presupuestos
    updateElementText('serviciosPresupuestoCalc', formatCurrency(serviciosPresupuesto));
    updateElementText('gastosPresupuestoCalc', formatCurrency(gastosPresupuesto));
    updateElementText('ahorroPresupuestoCalc', formatCurrency(ahorroPresupuesto));
    updateElementText('deudasPresupuestoCalc', formatCurrency(deudasPresupuesto));
    updateElementText('totalIngresosPresupuesto', formatCurrency(ingresosPresupuesto));

    const totalEgresos = serviciosTotal + gastosTotal + ahorroTotal + deudasTotal;
    const totalEgresosPresupuesto = serviciosPresupuesto + gastosPresupuesto + ahorroPresupuesto + deudasPresupuesto;
    
    updateElementText('totalEgresosReal', formatCurrency(totalEgresos));
    updateElementText('totalEgresos', formatCurrency(totalEgresos));
    updateElementText('totalEgresosPresupuesto', formatCurrency(totalEgresosPresupuesto));

    const saldo = ingresosTotal - totalEgresos;
    updateElementText('saldoMes', formatCurrency(saldo));
    
    // Cambiar color del saldo según sea positivo o negativo
    const saldoElement = document.getElementById('saldoMes');
    if (saldoElement) {
        saldoElement.style.color = saldo >= 0 ? '#4a7c59' : '#d9534f';
    }
}

// Función auxiliar para actualizar texto de elementos
function updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
}

// Calcular total por categoría
function calculateCategoryTotal(section) {
    let total = 0;
    let categories = [];
    
    switch(section) {
        case 'servicios':
            categories = ['renta', 'seguro_carro', 'luz', 'seguro_salud', 'agua', 'gimnasio', 'gas', 'internet'];
            break;
        case 'servicios_presupuesto':
            categories = ['renta_ppto', 'seguro_carro_ppto', 'luz_ppto', 'seguro_salud_ppto', 'agua_ppto', 'gimnasio_ppto', 'gas_ppto', 'internet_ppto'];
            break;
        case 'gastos':
            categories = ['despensa', 'comida', 'cine', 'salidas', 'comidas', 'amazon', 'entretenimiento', 'regalos', 'cerveza'];
            break;
        case 'gastos_presupuesto':
            categories = ['despensa_ppto', 'comida_ppto', 'cine_ppto', 'salidas_ppto', 'comidas_ppto', 'amazon_ppto', 'entretenimiento_ppto', 'regalos_ppto', 'cerveza_ppto'];
            break;
        case 'ahorro':
            categories = ['cetes', 'vacaciones', 'ahorro_universidad'];
            break;
        case 'ahorro_presupuesto':
            categories = ['cetes_ppto', 'vacaciones_ppto', 'ahorro_universidad_ppto'];
            break;
        case 'deudas':
            categories = ['carro', 'hipoteca', 'prestamo_negocio', 'tarjetas'];
            break;
        case 'deudas_presupuesto':
            categories = ['carro_ppto', 'hipoteca_ppto', 'prestamo_negocio_ppto', 'tarjetas_ppto'];
            break;
        case 'ingresos':
            categories = ['sueldo', 'negocio', 'otros'];
            break;
        case 'ingresos_presupuesto':
            categories = ['sueldo_ppto', 'negocio_ppto', 'otros_ppto'];
            break;
    }
    
    categories.forEach(cat => {
        const cell = document.querySelector(`[data-category="${cat}"]`);
        if (cell) {
            const value = parseFloat(cell.textContent.replace(/[^0-9.-]/g, '')) || 0;
            total += value;
        }
    });
    
    return total;
}

// Formatear como moneda
function formatCurrency(amount) {
    return '$' + amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Mostrar alerta
function showAlert(message, type = 'success') {
    const alertsDiv = document.getElementById('alerts');
    if (!alertsDiv) return;
    
    const alertClass = type === 'success' ? 'alert-success' : type === 'error' ? 'alert-error' : 'alert-info';
    alertsDiv.innerHTML = `<div class="alert ${alertClass}">${message}</div>`;
    
    setTimeout(() => {
        alertsDiv.innerHTML = '';
    }, 3000);
}

// Guardar datos del mes actual
function saveCurrentData() {
    const data = {
        month: currentMonth,
        date_saved: new Date().toISOString(),
        ingresos: {},
        ingresos_presupuesto: {},
        servicios: {},
        servicios_presupuesto: {},
        gastos: {},
        gastos_presupuesto: {},
        ahorro: {},
        ahorro_presupuesto: {},
        deudas: {},
        deudas_presupuesto: {}
    };

    // Recopilar todos los datos editables
    document.querySelectorAll('.editable-cell').forEach(cell => {
        const category = cell.getAttribute('data-category');
        const value = parseFloat(cell.textContent.replace(/[^0-9.-]/g, '')) || 0;
        
        // Clasificar por sección
        if (['sueldo', 'negocio', 'otros'].includes(category)) {
            data.ingresos[category] = value;
        } else if (['sueldo_ppto', 'negocio_ppto', 'otros_ppto'].includes(category)) {
            data.ingresos_presupuesto[category] = value;
        } else if (['renta', 'seguro_carro', 'luz', 'seguro_salud', 'agua', 'gimnasio', 'gas', 'internet'].includes(category)) {
            data.servicios[category] = value;
        } else if (['renta_ppto', 'seguro_carro_ppto', 'luz_ppto', 'seguro_salud_ppto', 'agua_ppto', 'gimnasio_ppto', 'gas_ppto', 'internet_ppto'].includes(category)) {
            data.servicios_presupuesto[category] = value;
        } else if (['despensa', 'comida', 'cine', 'salidas', 'comidas', 'amazon', 'entretenimiento', 'regalos', 'cerveza'].includes(category)) {
            data.gastos[category] = value;
        } else if (['despensa_ppto', 'comida_ppto', 'cine_ppto', 'salidas_ppto', 'comidas_ppto', 'amazon_ppto', 'entretenimiento_ppto', 'regalos_ppto', 'cerveza_ppto'].includes(category)) {
            data.gastos_presupuesto[category] = value;
        } else if (['cetes', 'vacaciones', 'ahorro_universidad'].includes(category)) {
            data.ahorro[category] = value;
        } else if (['cetes_ppto', 'vacaciones_ppto', 'ahorro_universidad_ppto'].includes(category)) {
            data.ahorro_presupuesto[category] = value;
        } else if (['carro', 'hipoteca', 'prestamo_negocio', 'tarjetas'].includes(category)) {
            data.deudas[category] = value;
        } else if (['carro_ppto', 'hipoteca_ppto', 'prestamo_negocio_ppto', 'tarjetas_ppto'].includes(category)) {
            data.deudas_presupuesto[category] = value;
        }
    });

    budgetData[currentMonth] = data;
}

// Cargar datos del mes
function loadMonthData() {
    const data = budgetData[currentMonth];
    
    // Limpiar todos los campos
    document.querySelectorAll('.editable-cell').forEach(cell => {
        cell.textContent = '$0.00';
    });

    if (data) {
        // Cargar datos guardados
        const sections = [
            'ingresos', 'ingresos_presupuesto',
            'servicios', 'servicios_presupuesto',
            'gastos', 'gastos_presupuesto',
            'ahorro', 'ahorro_presupuesto',
            'deudas', 'deudas_presupuesto'
        ];

        sections.forEach(section => {
            Object.keys(data[section] || {}).forEach(key => {
                const cell = document.querySelector(`[data-category="${key}"]`);
                if (cell) {
                    cell.textContent = formatCurrency(data[section][key]);
                }
            });
        });
    }

    updateTotals();
}

// Guardar datos
function saveData() {
    saveCurrentData();
    try {
        localStorage.setItem('budgetData', JSON.stringify(budgetData));
        showAlert('Datos guardados correctamente para ' + getMonthName(currentMonth));
    } catch (error) {
        console.log('localStorage no disponible, usando memoria temporal');
        showAlert('Datos guardados en memoria temporal para ' + getMonthName(currentMonth));
    }
}

// Cargar datos guardados
function loadSavedData() {
    try {
        const saved = localStorage.getItem('budgetData');
        if (saved) {
            budgetData = JSON.parse(saved);
            loadMonthData();
        }
    } catch (error) {
        console.log('localStorage no disponible, iniciando con datos en memoria');
        budgetData = {};
    }
}

// Exportar como JSON
function exportJSON() {
    saveCurrentData();
    const dataToExport = {
        export_date: new Date().toISOString(),
        budget_data: budgetData
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `presupuesto_personal_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showAlert('Archivo JSON exportado correctamente');
}

// Importar JSON
function importJSON() {
    document.getElementById('fileInput').click();
}

// Manejar importación de archivo
function handleFileImport(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                if (importedData.budget_data) {
                    budgetData = importedData.budget_data;
                    try {
                        localStorage.setItem('budgetData', JSON.stringify(budgetData));
                    } catch (error) {
                        console.log('Datos importados guardados en memoria temporal');
                    }
                    loadMonthData();
                    showAlert('Datos importados correctamente');
                } else {
                    showAlert('Formato de archivo incorrecto', 'error');
                }
            } catch (error) {
                showAlert('Error al leer el archivo', 'error');
            }
        };
        reader.readAsText(file);
    }
    // Limpiar el input para permitir importar el mismo archivo múltiples veces
    event.target.value = '';
}

// Mostrar historial
function showHistory() {
    const historySection = document.getElementById('historySection');
    const historyList = document.getElementById('historyList');
    
    if (!historySection || !historyList) return;
    
    historySection.classList.toggle('hidden');
    
    if (!historySection.classList.contains('hidden')) {
        historyList.innerHTML = '';
        
        if (Object.keys(budgetData).length === 0) {
            historyList.innerHTML = '<div class="history-item">No hay datos guardados</div>';
            return;
        }

        Object.keys(budgetData).sort().reverse().forEach(month => {
            const data = budgetData[month];
            const totalIngresos = Object.values(data.ingresos || {}).reduce((sum, val) => sum + val, 0);
            const totalEgresos = 
                Object.values(data.servicios || {}).reduce((sum, val) => sum + val, 0) +
                Object.values(data.gastos || {}).reduce((sum, val) => sum + val, 0) +
                Object.values(data.ahorro || {}).reduce((sum, val) => sum + val, 0) +
                Object.values(data.deudas || {}).reduce((sum, val) => sum + val, 0);
            const saldo = totalIngresos - totalEgresos;
            
            const totalIngresosPresupuesto = Object.values(data.ingresos_presupuesto || {}).reduce((sum, val) => sum + val, 0);
            const totalEgresosPresupuesto = 
                Object.values(data.servicios_presupuesto || {}).reduce((sum, val) => sum + val, 0) +
                Object.values(data.gastos_presupuesto || {}).reduce((sum, val) => sum + val, 0) +
                Object.values(data.ahorro_presupuesto || {}).reduce((sum, val) => sum + val, 0) +
                Object.values(data.deudas_presupuesto || {}).reduce((sum, val) => sum + val, 0);
            
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <strong>${getMonthName(month)}</strong><br>
                <strong>Real:</strong> Ingresos: ${formatCurrency(totalIngresos)} | 
                Egresos: ${formatCurrency(totalEgresos)} | 
                Saldo: <span style="color: ${saldo >= 0 ? '#4a7c59' : '#d9534f'}">${formatCurrency(saldo)}</span><br>
                <strong>Presupuesto:</strong> Ingresos: ${formatCurrency(totalIngresosPresupuesto)} | 
                Egresos: ${formatCurrency(totalEgresosPresupuesto)}
                <br><small>Guardado: ${new Date(data.date_saved).toLocaleString()}</small>
            `;
            item.onclick = () => loadHistoryMonth(month);
            historyList.appendChild(item);
        });
    }
}

// Cargar mes del historial
function loadHistoryMonth(month) {
    saveCurrentData();
    currentMonth = month;
    document.getElementById('monthSelector').value = month;
    loadMonthData();
    document.getElementById('historySection').classList.add('hidden');
    showAlert('Cargado: ' + getMonthName(month));
}

// Limpiar datos del mes actual
function clearData() {
    if (confirm('¿Estás seguro de que deseas limpiar todos los datos del mes actual?')) {
        document.querySelectorAll('.editable-cell').forEach(cell => {
            cell.textContent = '$0.00';
        });
        updateTotals();
        showAlert('Datos del mes limpiados');
    }
}

// Obtener nombre del mes
function getMonthName(monthValue) {
    const [year, month] = monthValue.split('-');
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${months[parseInt(month) - 1]} ${year}`;
}

// Auto-guardar cada 30 segundos
setInterval(() => {
    if (Object.keys(budgetData).length > 0) {
        saveCurrentData();
        try {
            localStorage.setItem('budgetData', JSON.stringify(budgetData));
        } catch (error) {
            console.log('Auto-guardado en memoria temporal');
        }
    }
}, 30000);

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', init);

// Guardar antes de cerrar la página
window.addEventListener('beforeunload', function() {
    saveCurrentData();
    try {
        localStorage.setItem('budgetData', JSON.stringify(budgetData));
    } catch (error) {
        console.log('Guardado final en memoria temporal');
    }
});