let currentCellIndex = null;

function openModal(index) {
    currentCellIndex = index;
    document.getElementById('modal').style.display = 'block';
    document.getElementById('imageUpload').value = '';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    currentCellIndex = null;
}

function uploadImage() {
    const fileInput = document.getElementById('imageUpload');
    const file = fileInput.files[0];
    if (file && currentCellIndex !== null) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const cell = document.getElementsByClassName('cell')[currentCellIndex];
            cell.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image">`;
            closeModal();
        };
        reader.onerror = function() {
            alert('無法讀取圖片檔案，請確保檔案格式正確。');
        };
        reader.readAsDataURL(file);
    }
}

function downloadGrid() {
    const grid = document.querySelector('.grid');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const gridRect = grid.getBoundingClientRect();
    
    canvas.width = gridRect.width;
    canvas.height = gridRect.height;
    
    const cells = document.getElementsByClassName('cell');
    let loadedImages = 0;
    
    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const cellRect = cell.getBoundingClientRect();
        const x = cellRect.left - gridRect.left;
        const y = cellRect.top - gridRect.top;
        const img = cell.querySelector('img');
        
        if (img) {
            const image = new Image();
            image.crossOrigin = "Anonymous";
            image.src = img.src;
            image.onload = function() {
                ctx.drawImage(image, x, y, cellRect.width, cellRect.height);
                loadedImages++;
                if (loadedImages === Array.from(cells).filter(c => c.querySelector('img')).length) {
                    finalizeDownload(canvas);
                }
            };
            image.onerror = function() {
                ctx.fillStyle = '#fff';
                ctx.fillRect(x, y, cellRect.width, cellRect.height);
                ctx.strokeStyle = '#ccc';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, cellRect.width, cellRect.height);
                loadedImages++;
                if (loadedImages === Array.from(cells).filter(c => c.querySelector('img')).length) {
                    finalizeDownload(canvas);
                }
            };
        } else {
            ctx.fillStyle = '#fff';
            ctx.fillRect(x, y, cellRect.width, cellRect.height);
            ctx.strokeStyle = '#ccc';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, cellRect.width, cellRect.height);
        }
    }
    
    if (Array.from(cells).every(c => !c.querySelector('img'))) {
        finalizeDownload(canvas);
    }
}

function finalizeDownload(canvas) {
    const link = document.createElement('a');
    link.download = 'nine-square-grid.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// 注意：HEIC圖片格式在某些瀏覽器中可能無法直接顯示。如果您上傳HEIC格式的圖片，
// 建議先將其轉換為JPEG或PNG格式再上傳。未來可以考慮添加對HEIC格式的支援，
// 例如使用第三方庫來轉換HEIC圖片。
