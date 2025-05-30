let currentCellIndex = null;
let canvasDataURL = null;
let customLabels = [
    { zh: '動物', en: 'Animal' },
    { zh: '地方', en: 'Place' },
    { zh: '植物', en: 'Plant' },
    { zh: '角色', en: 'Character' },
    { zh: '季節', en: 'Season' },
    { zh: '愛好', en: 'Hobby' },
    { zh: '食物', en: 'Food' },
    { zh: '顏色', en: 'Color' },
    { zh: '飲料', en: 'Drink' }
];

function handleCellClick(index) {
    currentCellIndex = index;
    const cell = document.getElementsByClassName('cell')[index];
    if (cell.querySelector('img')) {
        if (confirm('是否要移除目前的圖片，以便上傳新圖片？')) {
            cell.innerHTML = '<span class="placeholder">' + getPlaceholderText(index) + '</span>';
            document.getElementById('imageUpload').click();
        }
    } else {
        document.getElementById('imageUpload').click();
    }
}

function uploadImage() {
    const fileInput = document.getElementById('imageUpload');
    const file = fileInput.files[0];
    if (file && currentCellIndex !== null) {
        const fileType = file.type.toLowerCase();
        const acceptedTypes = ['image/jpeg', 'image/png'];
        
        if (!acceptedTypes.includes(fileType)) {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            alert(`您上傳的檔案格式為 ${fileExtension.toUpperCase()}，目前僅支援JPEG/JPG和PNG格式。請將檔案轉換為JPEG/JPG或PNG格式後再上傳。`);
            fileInput.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const cell = document.getElementsByClassName('cell')[currentCellIndex];
            cell.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image">`;
        };
        reader.onerror = function() {
            alert('無法讀取圖片檔案，請確保檔案格式正確。');
            fileInput.value = '';
        };
        reader.readAsDataURL(file);
    }
}

function downloadGrid() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const targetSize = 1080; // 設定目標解析度為1080x1080
    
    canvas.width = targetSize;
    canvas.height = targetSize;
    
    const cells = document.getElementsByClassName('cell');
    const cellSize = targetSize / 3; // 九宮格每格的大小
    let loadedImages = 0;
    
    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const x = (i % 3) * cellSize;
        const y = Math.floor(i / 3) * cellSize;
        const img = cell.querySelector('img');
        
        if (img) {
            const image = new Image();
            image.crossOrigin = "Anonymous";
            image.src = img.src;
            image.onload = function() {
                // 確保圖片裁切填滿格子
                const width = image.width;
                const height = image.height;
                let drawX = x;
                let drawY = y;
                let drawWidth = cellSize;
                let drawHeight = cellSize;
                let sourceX = 0;
                let sourceY = 0;
                let sourceWidth = width;
                let sourceHeight = height;
                
                const aspectRatio = width / height;
                const cellAspectRatio = cellSize / cellSize;
                
                if (aspectRatio < cellAspectRatio) {
                    sourceHeight = width / cellAspectRatio;
                    sourceY = (height - sourceHeight) / 2;
                } else {
                    sourceWidth = height * cellAspectRatio;
                    sourceX = (width - sourceWidth) / 2;
                }
                
                ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, drawX, drawY, drawWidth, drawHeight);
                loadedImages++;
                if (loadedImages === Array.from(cells).filter(c => c.querySelector('img')).length) {
                    finalizeDownload(canvas);
                }
            };
            image.onerror = function() {
                ctx.fillStyle = '#fff';
                ctx.fillRect(x, y, cellSize, cellSize);
                ctx.strokeStyle = '#ccc';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, cellSize, cellSize);
                loadedImages++;
                if (loadedImages === Array.from(cells).filter(c => c.querySelector('img')).length) {
                    finalizeDownload(canvas);
                }
            };
        } else {
            ctx.fillStyle = '#fff';
            ctx.fillRect(x, y, cellSize, cellSize);
            ctx.strokeStyle = '#ccc';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, cellSize, cellSize);
        }
    }
    
    if (Array.from(cells).every(c => !c.querySelector('img'))) {
        finalizeDownload(canvas);
    }
}

function finalizeDownload(canvas) {
    canvasDataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'nine-square-grid.png';
    link.href = canvasDataURL;
    
    // 嘗試下載，如果失敗則在新視窗開啟圖片
    let downloadSuccessful = false;
    try {
        link.click();
        downloadSuccessful = true;
    } catch (e) {
        downloadSuccessful = false;
    }
    
    if (!downloadSuccessful) {
        alert('無法自動下載圖片，請使用其他瀏覽器測試，或選擇以下選項。');
        if (confirm('是否要在新視窗中開啟圖片？')) {
            const newWindow = window.open();
            if (newWindow) {
                newWindow.document.write(`<img src="${canvasDataURL}" alt="Nine Square Grid" style="width: 100%; height: auto;">`);
            } else {
                alert('無法開啟新視窗，請檢查您的瀏覽器設定。');
            }
        }
    }
}

function viewGrid() {
    if (!canvasDataURL) {
        downloadGrid();
    } else {
        const newWindow = window.open();
        if (newWindow) {
            newWindow.document.write(`<img src="${canvasDataURL}" alt="Nine Square Grid" style="width: 100%; height: auto;">`);
        } else {
            alert('無法開啟新視窗，請檢查您的瀏覽器設定。');
        }
    }
}

function getPlaceholderText(index) {
    return customLabels[index].zh + '<br>' + customLabels[index].en;
}

function updateGridLabels() {
    const zhInputs = document.querySelectorAll('.custom-labels-zh input');
    const enInputs = document.querySelectorAll('.custom-labels-en input');
    
    for (let i = 0; i < customLabels.length; i++) {
        customLabels[i].zh = zhInputs[i].value.trim() || customLabels[i].zh;
        customLabels[i].en = enInputs[i].value.trim() || customLabels[i].en;
    }
    
    // 更新九宮格中的文字
    const cells = document.getElementsByClassName('cell');
    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        if (!cell.querySelector('img')) {
            cell.innerHTML = '<span class="placeholder">' + getPlaceholderText(i) + '</span>';
        }
    }
}

// 注意：HEIC圖片格式在某些瀏覽器中可能無法直接顯示。如果您上傳HEIC格式的圖片，
// 建議先將其轉換為JPEG/JPG或PNG格式再上傳。未來可以考慮添加對HEIC格式的支援，
// 例如使用第三方庫來轉換HEIC圖片。
// 另外，JPEG和JPG是相同的格式，程式碼中的 'image/jpeg' 涵蓋了這兩種副檔名。
