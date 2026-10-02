tailwind.config = {
    theme: {
        extend: {
            colors: {
                street: {
                    black: '#0a0a0a',
                    dark: '#121212',
                    gray: '#1e1e1e',
                    light: '#2a2a2a',
                    accent: '#e63946',
                    highlight: '#f1faee'
                }
            },
            fontFamily: {
                street: ['"Permanent Marker"', 'cursive'],
                sans: ['Inter', 'sans-serif']
            }
        }
    }
};

// Store attached photo data URLs
let attachedPhotos = [];
let pendingPhotoCount = 0;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

document.addEventListener('error', event => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.dataset.fallbackApplied) return;

    image.dataset.fallbackApplied = 'true';
    if (image.alt === 'Logo AZUU') {
        image.parentElement.innerHTML = '<div class="w-16 h-16 md:w-20 md:h-20 border-2 border-black flex flex-col items-center justify-center text-center p-1 font-bold text-[10px] uppercase bg-gray-100 rounded"><span>[ LOGO ]</span><span class="text-[8px] text-gray-500 mt-0.5">assets/image/logo.png</span></div>';
    } else if (image.alt === 'AZUU Título') {
        image.parentElement.innerHTML = '<div class="text-center border-2 border-black px-4 py-1.5 bg-gray-100 rounded"><h1 class="text-2xl md:text-3xl font-black font-street tracking-widest uppercase">AZUU</h1><span class="text-[8px] text-gray-500 block">assets/image/titulo.png</span></div>';
    }
}, true);

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    const today = getLocalDateString();
    document.getElementById('inputFecha').value = today;
    document.getElementById('inputRecepcion').value = today;
    updateReceipt();

    document.getElementById('demoButton').addEventListener('click', fillDemoData);
    document.getElementById('clearButton').addEventListener('click', clearForm);
    document.getElementById('downloadButton').addEventListener('click', downloadPDF);
    document.getElementById('printButton').addEventListener('click', printReceipt);
    document.getElementById('btnTabForm').addEventListener('click', () => switchTab('form'));
    document.getElementById('btnTabReceipt').addEventListener('click', () => switchTab('receipt'));
    document.getElementById('noteForm').addEventListener('input', updateReceipt);
    document.getElementById('imageUploader').addEventListener('change', handleImageUpload);
    document.getElementById('uploadButton').addEventListener('click', () => {
        document.getElementById('imageUploader').click();
    });
    document.getElementById('thumbContainer').addEventListener('click', event => {
        const button = event.target.closest('[data-remove-photo]');
        if (button) removePhoto(Number(button.dataset.removePhoto));
    });

});

function getLocalDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDate(dateValue) {
    if (!dateValue) return "__/__/____";
    const [year, month, day] = dateValue.split('-');
    return `${day}/${month}/${year}`;
}

// Responsive Mobile Tab Switcher
function switchTab(tab) {
    const formContainer = document.getElementById('formContainer');
    const receiptContainer = document.getElementById('receiptContainer');
    const btnTabForm = document.getElementById('btnTabForm');
    const btnTabReceipt = document.getElementById('btnTabReceipt');

    if (tab === 'form') {
        formContainer.classList.remove('hidden');
        receiptContainer.classList.add('hidden');
        btnTabForm.className = "py-2.5 px-4 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 bg-red-600 text-white shadow";
        btnTabReceipt.className = "py-2.5 px-4 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 bg-zinc-800 text-gray-400 hover:text-white";
    } else {
        formContainer.classList.add('hidden');
        receiptContainer.classList.remove('hidden');
        receiptContainer.classList.add('flex');
        btnTabReceipt.className = "py-2.5 px-4 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 bg-red-600 text-white shadow";
        btnTabForm.className = "py-2.5 px-4 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 bg-zinc-800 text-gray-400 hover:text-white";
    }
}

// Live Dynamic Form Update
function updateReceipt() {
    const inputRecepcion = document.getElementById('inputRecepcion');
    const inputEntrega = document.getElementById('inputEntrega');
    inputEntrega.min = inputRecepcion.value;
    inputEntrega.setCustomValidity(
        inputRecepcion.value && inputEntrega.value && inputEntrega.value < inputRecepcion.value
            ? "La fecha de entrega no puede ser anterior a la fecha de recepción."
            : ""
    );

    document.getElementById('viewFecha').textContent = formatDate(document.getElementById('inputFecha').value);
    document.getElementById('viewRecepcion').textContent = formatDate(inputRecepcion.value);
    document.getElementById('viewEntrega').textContent = inputEntrega.value
        ? formatDate(inputEntrega.value)
        : "Pendiente";

    document.getElementById('viewFolio').textContent = document.getElementById('inputFolio').value || "AZ-001";
    document.getElementById('viewCliente').textContent = document.getElementById('inputCliente').value;
    document.getElementById('viewTelefono').textContent = document.getElementById('inputTelefono').value;
    document.getElementById('viewTipo').textContent = document.getElementById('inputTipo').value;
    document.getElementById('viewMarca').textContent = document.getElementById('inputMarca').value;
    document.getElementById('viewModelo').textContent = document.getElementById('inputModelo').value;
    document.getElementById('viewSerie').textContent = document.getElementById('inputSerie').value;
    document.getElementById('viewAccesorios').textContent = document.getElementById('inputAccesorios').value;
    document.getElementById('viewFalla').textContent = document.getElementById('inputFalla').value;
    document.getElementById('viewServicios').textContent = document.getElementById('inputServicios').value;

    const totalVal = document.getElementById('inputTotal').value;
    const formattedTotal = totalVal
        ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(totalVal))
        : "0.00";
    document.getElementById('viewTotal').textContent = `$${formattedTotal}`;
}

// Image Attachment Handler
function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const oversizedFiles = imageFiles.filter(file => file.size > MAX_PHOTO_SIZE);
    if (oversizedFiles.length > 0) {
        alert("Cada imagen debe pesar máximo 5 MB. Se omitirán las imágenes que excedan ese tamaño.");
    }

    const validFiles = imageFiles.filter(file => file.size <= MAX_PHOTO_SIZE);
    if (attachedPhotos.length + pendingPhotoCount + validFiles.length > 4) {
        alert("Máximo 4 imágenes por nota para asegurar que quepa en 1 sola página.");
        e.target.value = '';
        return;
    }

    pendingPhotoCount += validFiles.length;
    Promise.all(validFiles.map(compressImage))
        .then(compressedPhotos => {
            attachedPhotos.push(...compressedPhotos);
            renderPhotos();
        })
        .catch(error => {
            console.error('Error procesando imágenes:', error);
            alert("No se pudieron procesar una o más imágenes.");
        })
        .finally(() => {
            pendingPhotoCount -= validFiles.length;
        });

    e.target.value = '';
}

function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error);
        reader.onload = () => {
            const image = new Image();
            image.onerror = () => reject(new Error('No se pudo decodificar la imagen.'));
            image.onload = () => {
                const maxDimension = 1600;
                const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(image.width * scale);
                canvas.height = Math.round(image.height * scale);
                const context = canvas.getContext('2d');
                if (!context) {
                    reject(new Error('No se pudo preparar la imagen.'));
                    return;
                }
                context.fillStyle = '#ffffff';
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.82));
            };
            image.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

function removePhoto(index) {
    attachedPhotos.splice(index, 1);
    renderPhotos();
}

function renderPhotos() {
    const thumbContainer = document.getElementById('thumbContainer');
    const photoGrid = document.getElementById('photoGrid');
    const photoSection = document.getElementById('photoDisplaySection');
    const photoCount = document.getElementById('photoCount');

    photoCount.textContent = `${attachedPhotos.length}/4`;

    // Thumbnails in Form
    thumbContainer.innerHTML = attachedPhotos.map((src, idx) => `
        <div class="relative group aspect-square rounded-lg overflow-hidden border border-zinc-700 bg-black">
            <img src="${src}" class="w-full h-full object-cover">
            <button type="button" data-remove-photo="${idx}" class="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-90 hover:opacity-100 transition">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
    `).join('');

    // Ticket Micro-Thumbnails for strict 1-Page constraint
    if (attachedPhotos.length > 0) {
        photoSection.classList.remove('hidden');
        photoGrid.innerHTML = attachedPhotos.map(src => `
            <div class="border border-black p-0.5 rounded bg-gray-50 flex items-center justify-center h-16">
                <img src="${src}" class="max-h-full max-w-full object-contain">
            </div>
        `).join('');
    } else {
        photoSection.classList.add('hidden');
        photoGrid.innerHTML = '';
    }
}

function printReceipt() {
    const receiptContainer = document.getElementById('receiptContainer');
    const hadHiddenClass = receiptContainer.classList.contains('hidden');
    const hadFlexClass = receiptContainer.classList.contains('flex');

    receiptContainer.classList.remove('hidden');
    receiptContainer.classList.add('flex');

    window.addEventListener('afterprint', () => {
        if (hadHiddenClass) receiptContainer.classList.add('hidden');
        if (!hadFlexClass) receiptContainer.classList.remove('flex');
    }, { once: true });

    window.print();
}

// Direct PDF Download Logic
async function downloadPDF() {
    const element = document.getElementById('receiptTicket');
    const receiptContainer = document.getElementById('receiptContainer');
    const folio = document.getElementById('inputFolio').value || 'AZ-001';
    const wasHidden = receiptContainer.classList.contains('hidden');
    const hadFlex = receiptContainer.classList.contains('flex');

    if (!document.getElementById('noteForm').checkValidity()) {
        alert("Revisa que el total sea válido y que la entrega no sea anterior a la recepción.");
        return;
    }

    receiptContainer.classList.remove('hidden');
    receiptContainer.classList.add('flex');

    // Add custom PDF fit class
    element.classList.add('pdf-fit');

    const restoreLayout = () => {
        element.classList.remove('pdf-fit');
        if (wasHidden) receiptContainer.classList.add('hidden');
        if (!hadFlex) receiptContainer.classList.remove('flex');
    };

    const opt = {
        margin:       [5, 5, 5, 5],
        filename:     `Nota_Servicio_${folio}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  {
            scale: 2,
            useCORS: true,
            logging: false,
            scrollX: 0,
            scrollY: 0,
            width: element.scrollWidth,
            height: element.scrollHeight,
            windowWidth: Math.max(window.innerWidth, 1024),
            windowHeight: element.scrollHeight
        },
        jsPDF:        { unit: 'mm', format: 'letter', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'] }
    };

    try {
        await Promise.all(Array.from(element.querySelectorAll('img'), image => image.decode().catch(() => {})));
        await html2pdf().set(opt).from(element).save();
    } catch (err) {
        console.error('Error generando PDF:', err);
    } finally {
        restoreLayout();
    }
}

// Demo Data Loader
function fillDemoData() {
    document.getElementById('inputFolio').value = "AZ-1042";
    document.getElementById('inputCliente').value = "Carlos Mendoza";
    document.getElementById('inputTelefono').value = "55 9876 5432";
    document.getElementById('inputTipo').value = "Consola de Videojuegos";
    document.getElementById('inputMarca').value = "Sony";
    document.getElementById('inputModelo').value = "PlayStation 5";
    document.getElementById('inputSerie').value = "AK-99201-2023";
    document.getElementById('inputAccesorios').value = "1 Control DualSense, Cable HDMI, Cable de corriente";
    document.getElementById('inputFalla').value = "Se apaga a los 15 minutos de juego. Muestra alerta de sobrecalentamiento.";
    document.getElementById('inputServicios').value = "1. Mantenimiento térmico interno profundo.\n2. Cambio de pasta/metal líquido en APU.\n3. Pruebas de rendimiento continuas OK.";
    document.getElementById('inputTotal').value = "1200.00";

    updateReceipt();
}

// Clear Form
function clearForm() {
    document.getElementById('noteForm').reset();
    const today = getLocalDateString();
    document.getElementById('inputFecha').value = today;
    document.getElementById('inputRecepcion').value = today;
    attachedPhotos = [];
    pendingPhotoCount = 0;
    renderPhotos();
    updateReceipt();
}
