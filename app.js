const SUPABASE_URL = 'https://guvapvlbqofnkbvibnci.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dmFwdmxicW9mbmtidmlibmNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NTI0NzEsImV4cCI6MjA5MTQyODQ3MX0.1BuD0AheK0xm9gHDQDwWTYprc98y1Sfg84cIMp2VEn8';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const stepsList = [
    { id: 1, title: "Foto Frontal / Placa", limitBounds: true },
    { id: 2, title: "Lateral Direita", limitBounds: false },
    { id: 3, title: "Lateral Esquerda", limitBounds: false },
    { id: 4, title: "Traseira", limitBounds: false },
    { id: 5, title: "Teto ou Estepe", limitBounds: false },
    { id: 6, title: "Painel & Hodômetro", limitBounds: true, isOcr: true }
];

let currentStep = 1;
let collectedImages = [];
let bypassFlag = false;
let videoStream = null;

async function startCamera() {
    const container = document.getElementById('cam-view');

    // Se o vídeo já existir, significa que o usuário quer tirar a foto
    if (document.getElementById('webcam-video')) {
        takePhoto();
        return;
    }

    const video = document.createElement('video');
    video.id = 'webcam-video';
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';

    container.innerHTML = '';
    container.appendChild(video);
    const overlay = document.createElement('div');
    overlay.className = 'camera-overlay';
    overlay.id = 'cam-overlay';
    container.appendChild(overlay);

    try {
        videoStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "environment" } },
            audio: false
        });
        video.srcObject = videoStream;
    } catch (err) {
        console.error("Erro na câmera:", err);
        videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = videoStream;
    }
}

function takePhoto() {
    const video = document.getElementById('webcam-video');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const base64 = canvas.toDataURL('image/jpeg');
    collectedImages.push({ step: currentStep, data: base64, isGallery: bypassFlag });

    document.getElementById(`st-${currentStep}`).classList.remove('active');
    document.getElementById(`st-${currentStep}`).classList.add('done');

    if (currentStep === 6) {
        stopCamera();
        runOcrSimulation();
    } else {
        currentStep++;
        updateStepUI();
    }
}

function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
    }
}

function updateStepUI() {
    document.getElementById(`st-${currentStep}`).classList.add('active');
    let st = stepsList.find(x => x.id === currentStep);
    document.getElementById('step-title').innerText = st.title;

    const overlay = document.getElementById('cam-overlay');
    if (st.limitBounds) {
        if (overlay) overlay.style.display = "block";
        document.getElementById('step-desc').innerText = "Enquadre o detalhe dentro das marcações.";
    } else {
        if (overlay) overlay.style.display = "none";
        document.getElementById('step-desc').innerText = "Tire uma foto pegando toda a dimensão livremente.";
    }
    bypassFlag = false;
}

function triggerManualFallback() {
    bypassFlag = true;
    document.getElementById('fake-gallery').click();
}

function galleryUploaded() {
    takePhoto();
}

function runOcrSimulation() {
    const view = document.getElementById('cam-view');
    view.style.display = "none";
    document.getElementById('step-title').innerText = "Concluído";
    document.getElementById('ocr-results').style.display = "block";
    document.getElementById('final-plate').value = "ABC-1234";
    document.getElementById('final-km').value = "45000";
}

async function submitFinalVistoria() {
    const plat = document.getElementById('final-plate').value;
    const km = document.getElementById('final-km').value;
    const userName = localStorage.getItem('session_username');

    if (!plat || !km) return alert("Preencha Placa e KM.");

    const obj = {
        placa: plat,
        kmLido: km,
        isSecurityRisk: collectedImages.some(img => img.isGallery),
        stepsPayload: JSON.stringify(collectedImages),
        auditor: userName,
        tipo: 'CAMERA_PWA'
    };

    const { error } = await supabase.from('vistorias').insert([obj]);
    if (error) alert("Erro: " + error.message);
    else { alert("Laudo Enviado!"); window.location.reload(); }
}