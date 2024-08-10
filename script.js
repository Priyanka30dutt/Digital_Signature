
const canvas = document.getElementById('signatureCanvas');
const ctx = canvas.getContext('2d');
const clearButton = document.getElementById('clearButton');
const saveButton = document.getElementById('saveButton');
const filterButton = document.getElementById('filterButton'); // New filter button
const bgColorPicker = document.getElementById('bgColorPicker');
const textColorPicker = document.getElementById('textColorPicker');
const uploadButton = document.getElementById('uploadButton');

let drawing = false;
let textColor = '#000000';

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', draw);
clearButton.addEventListener('click', clearCanvas);
saveButton.addEventListener('click', saveCanvas);
filterButton.addEventListener('click', applyFilter); // Add event listener for filter button
bgColorPicker.addEventListener('input', changeBgColor);
textColorPicker.addEventListener('input', changeTextColor);
uploadButton.addEventListener('change', handleImageUpload);

function startDrawing(event) {
    drawing = true;
    draw(event);
}

function stopDrawing() {
    drawing = false;
    ctx.beginPath();
}

function draw(event) {
    if (!drawing) return;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = textColor;

    ctx.lineTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function saveCanvas() {
    const link = document.createElement('a');
    link.download = 'signature.png';
    link.href = canvas.toDataURL();
    link.click();
}

function changeBgColor(event) {
    canvas.style.backgroundColor = event.target.value;
}

function changeTextColor(event) {
    textColor = event.target.value;
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
            img.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}

function applyFilter() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Brightness and Contrast parameters
    const brightness = 40; // Increase brightness
    const contrast = 1.2;  // Increase contrast
    const saturation = 1.5; // Increase saturation

    for (let i = 0; i < data.length; i += 4) {
        // Apply brightness
        data[i] = data[i] + brightness;     // Red
        data[i + 1] = data[i + 1] + brightness; // Green
        data[i + 2] = data[i + 2] + brightness; // Blue

        // Apply contrast
        data[i] = ((data[i] - 128) * contrast) + 128;
        data[i + 1] = ((data[i + 1] - 128) * contrast) + 128;
        data[i + 2] = ((data[i + 2] - 128) * contrast) + 128;

        // Convert to HSL and apply saturation
        let hsl = rgbToHsl(data[i], data[i + 1], data[i + 2]);
        hsl[1] *= saturation; // Increase saturation
        let rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);

        // Update pixel data with enhanced values
        data[i] = rgb[0];     // Red
        data[i + 1] = rgb[1]; // Green
        data[i + 2] = rgb[2]; // Blue
    }

    ctx.putImageData(imageData, 0, 0);
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

function hslToRgb(h, s, l) {
    let r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        let hue2rgb = function(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r * 255, g * 255, b * 255];
}
const textButton = document.getElementById('textButton');

textButton.addEventListener('click', function() {
    canvas.addEventListener('click', addText);
});

function addText(event) {
    const text = prompt("Enter your signature:");
    if (text) {
        const x = event.clientX - canvas.offsetLeft;
        const y = event.clientY - canvas.offsetTop;

        ctx.font = "50px 'Times New Roman', serif";
        ctx.fillStyle = textColor; // Use the selected text color
        ctx.fillText(text, x, y);
    }

    canvas.removeEventListener('click', addText);
}
