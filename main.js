// بيانات التطبيق
const mediaData = {
    movies: JSON.parse(localStorage.getItem('eng_khalid_movies')) || [],
    series: JSON.parse(localStorage.getItem('eng_khalid_series')) || [],
    anime: JSON.parse(localStorage.getItem('eng_khalid_anime')) || [],
    progress: JSON.parse(localStorage.getItem('eng_khalid_progress')) || {}
};

// عناصر DOM
const sections = document.querySelectorAll('.content-section');
const navButtons = document.querySelectorAll('nav button');
const addForm = document.getElementById('addForm');
const continueList = document.getElementById('continueList');
const mediaLists = {
    movies: document.getElementById('moviesList'),
    series: document.getElementById('seriesList'),
    anime: document.getElementById('animeList')
};

// تغيير القسم المعروض
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const sectionId = button.dataset.section;
        
        // تحديث التنقل
        navButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // تحديث المحتوى
        sections.forEach(section => section.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');
        
        // إذا كان قسم المستكشف، افتح صفحة جديدة
        if (sectionId === 'explorer') {
            window.open('explorer.html', '_blank');
        }
    });
});

// إضافة محتوى جديد
addForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const type = document.getElementById('mediaType').value;
    const title = document.getElementById('mediaTitle').value;
    const url = document.getElementById('mediaUrl').value;
    
    if (!type || !title || !url) return;
    
    const media = {
        id: Date.now().toString(),
        title,
        url,
        addedAt: new Date().toISOString(),
        thumbnail: `https://img.youtube.com/vi/${getYouTubeId(url)}/0.jpg` // لروابط يوتيوب فقط
    };
    
    mediaData[type + 's'].push(media);
    saveMediaData();
    renderMediaLists();
    addForm.reset();
});

// استخراج ID من رابط يوتيوب
function getYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// حفظ البيانات
function saveMediaData() {
    localStorage.setItem('eng_khalid_movies', JSON.stringify(mediaData.movies));
    localStorage.setItem('eng_khalid_series', JSON.stringify(mediaData.series));
    localStorage.setItem('eng_khalid_anime', JSON.stringify(mediaData.anime));
    localStorage.setItem('eng_khalid_progress', JSON.stringify(mediaData.progress));
}

// عرض المحتوى
function renderMediaLists() {
    // عرض "استكمال المشاهدة"
    continueList.innerHTML = '';
    for (const id in mediaData.progress) {
        const media = [...mediaData.movies, ...mediaData.series, ...mediaData.anime].find(m => m.id === id);
        if (media) {
            const percent = Math.floor(mediaData.progress[id] * 100);
            continueList.innerHTML += `
                <div class="media-item">
                    <img src="${media.thumbnail || 'https://via.placeholder.com/300x150?text=No+Thumbnail'}" alt="${media.title}">
                    <div class="media-info">
                        <h3>${media.title}</h3>
                        <p>${percent}% تم المشاهدة</p>
                        <button onclick="playMedia('${media.id}')">استكمال المشاهدة</button>
                    </div>
                </div>
            `;
        }
    }
    
    // عرض المكتبة
    for (const type in mediaLists) {
        mediaLists[type].innerHTML = mediaData[type].map(media => `
            <div class="media-item">
                <img src="${media.thumbnail || 'https://via.placeholder.com/300x150?text=No+Thumbnail'}" alt="${media.title}">
                <div class="media-info">
                    <h3>${media.title}</h3>
                    <p>${new Date(media.addedAt).toLocaleDateString()}</p>
                    <button onclick="playMedia('${media.id}')">تشغيل</button>
                </div>
            </div>
        `).join('');
    }
}

// تشغيل المحتوى
function playMedia(id) {
    const allMedia = [...mediaData.movies, ...mediaData.series, ...mediaData.anime];
    const media = allMedia.find(m => m.id === id);
    if (!media) return;
    
    localStorage.setItem('eng_khalid_current_media', JSON.stringify(media));
    const playerWindow = window.open('player.html', '_blank');
    
    // تحديث التقدم عند إغلاق النافذة
    playerWindow.onbeforeunload = function() {
        if (playerWindow.currentProgress) {
            mediaData.progress[id] = playerWindow.currentProgress;
            saveMediaData();
            renderMediaLists();
        }
    };
}

// التهيئة الأولية
renderMediaLists();
