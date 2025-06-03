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

// تهيئة السنة الحالية في التذييل
document.getElementById('currentYear').textContent = new Date().getFullYear();

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
    });
});

// إضافة محتوى جديد
addForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const type = document.getElementById('mediaType').value;
    const title = document.getElementById('mediaTitle').value.trim();
    const url = document.getElementById('mediaUrl').value.trim();
    
    if (!type || !title || !url) {
        alert('الرجاء ملء جميع الحقول');
        return;
    }
    
    // إنشاء كائن المحتوى
    const media = {
        id: Date.now().toString(),
        title,
        url,
        type,
        addedAt: new Date().toISOString(),
        thumbnail: generateThumbnail(url)
    };
    
    // إضافة إلى القائمة المناسبة
    mediaData[`${type}s`].unshift(media); // إضافة في البداية
    saveMediaData();
    renderMediaLists();
    addForm.reset();
    
    // إظهار رسالة نجاح
    showNotification('تمت إضافة المحتوى بنجاح!');
});

// إنشاء ثامبنييل من الرابط
function generateThumbnail(url) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = getYouTubeId(url);
        if (videoId) return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    }
    return 'https://via.placeholder.com/300x170/222/eee?text=No+Thumbnail';
}

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
    const continueWatching = [];
    
    for (const id in mediaData.progress) {
        const media = [...mediaData.movies, ...mediaData.series, ...mediaData.anime].find(m => m.id === id);
        if (media) continueWatching.push(media);
    }
    
    if (continueWatching.length > 0) {
        continueWatching.slice(0, 6).forEach(media => {
            const percent = Math.floor((mediaData.progress[media.id] || 0) * 100);
            continueList.innerHTML += createMediaCard(media, percent);
        });
    } else {
        continueList.innerHTML = '<p class="no-content">لا يوجد محتوى لمتابعته</p>';
    }
    
    // عرض المكتبة
    mediaLists.movies.innerHTML = mediaData.movies.length > 0 ? 
        mediaData.movies.map(media => createMediaCard(media)).join('') : 
        '<p class="no-content">لا توجد أفلام مضافة</p>';
    
    mediaLists.series.innerHTML = mediaData.series.length > 0 ? 
        mediaData.series.map(media => createMediaCard(media)).join('') : 
        '<p class="no-content">لا توجد مسلسلات مضافة</p>';
    
    mediaLists.anime.innerHTML = mediaData.anime.length > 0 ? 
        mediaData.anime.map(media => createMediaCard(media)).join('') : 
        '<p class="no-content">لا يوجد أنمي مضاف</p>';
}

// إنشاء بطاقة محتوى
function createMediaCard(media, progress = null) {
    const progressBar = progress ? `
        <div class="progress-bar">
            <div class="progress" style="width: ${progress}%"></div>
        </div>
    ` : '';
    
    const progressText = progress ? `<p>${progress}% تم المشاهدة</p>` : '';
    
    const typeIcon = media.type === 'movie' ? '🎬' : 
                   media.type === 'series' ? '📺' : '👾';
    
    return `
        <div class="media-item" data-id="${media.id}">
            <img src="${media.thumbnail}" alt="${media.title}" onerror="this.src='https://via.placeholder.com/300x170/222/eee?text=No+Thumbnail'">
            <div class="media-info">
                <h3>${typeIcon} ${media.title}</h3>
                ${progressText}
                <button onclick="playMedia('${media.id}')">
                    ▶️ تشغيل
                </button>
            </div>
            ${progressBar}
        </div>
    `;
}

// تشغيل المحتوى
function playMedia(id) {
    const allMedia = [...mediaData.movies, ...mediaData.series, ...mediaData.anime];
    const media = allMedia.find(m => m.id === id);
    if (!media) return;
    
    localStorage.setItem('eng_khalid_current_media', JSON.stringify(media));
    const playerWindow = window.open('player.html', '_blank', 'width=800,height=600');
    
    // تحديث التقدم عند إغلاق النافذة
    const checkWindow = setInterval(() => {
        if (playerWindow.closed) {
            clearInterval(checkWindow);
            renderMediaLists(); // تحديث الواجهة
        }
    }, 500);
}

// إظهار إشعار
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// التهيئة الأولية
document.addEventListener('DOMContentLoaded', () => {
    renderMediaLists();
    
    // إضافة نمط الإشعارات
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            box-shadow: var(--shadow-lg);
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 1000;
        }
        
        .notification.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        .no-content {
            text-align: center;
            grid-column: 1 / -1;
            padding: 2rem;
            color: #777;
        }
    `;
    document.head.appendChild(style);
});
