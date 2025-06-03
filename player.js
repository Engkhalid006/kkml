// جلب بيانات الفيديو
const mediaData = JSON.parse(localStorage.getItem('eng_khalid_current_media'));
const videoPlayer = document.getElementById('videoPlayer');
const mediaTitle = document.getElementById('mediaTitle');

// تهيئة السنة الحالية
document.getElementById('currentYear').textContent = new Date().getFullYear();

if (mediaData) {
    mediaTitle.textContent = mediaData.title;
    videoPlayer.src = mediaData.url;
    
    // تحميل تقدم المشاهدة السابق
    const progress = JSON.parse(localStorage.getItem('eng_khalid_progress')) || {};
    const savedProgress = progress[mediaData.id] || 0;
    
    videoPlayer.addEventListener('loadedmetadata', function() {
        if (savedProgress > 0) {
            videoPlayer.currentTime = videoPlayer.duration * savedProgress;
            
            // إظهار رسالة استكمال
            const resumeMsg = document.createElement('div');
            resumeMsg.innerHTML = `
                <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0,0,0,0.7);
                    padding: 1rem 2rem;
                    border-radius: 5px;
                    border: 2px solid var(--primary-color);
                    z-index: 100;
                ">
                    <p style="margin: 0; color: white; font-size: 1.2rem;">
                        جاري الاستكمال من ${Math.floor(savedProgress * 100)}%
                    </p>
                </div>
            `;
            document.querySelector('.video-container').appendChild(resumeMsg);
            
            setTimeout(() => resumeMsg.remove(), 3000);
        }
    });
    
    // حفظ تقدم المشاهدة
    videoPlayer.addEventListener('timeupdate', function() {
        if (videoPlayer.duration) {
            const currentProgress = videoPlayer.currentTime / videoPlayer.duration;
            
            // تحديث التخزين المحلي
            const progress = JSON.parse(localStorage.getItem('eng_khalid_progress')) || {};
            progress[mediaData.id] = currentProgress;
            localStorage.setItem('eng_khalid_progress', JSON.stringify(progress));
            
            // إرسال التحديث للصفحة الرئيسية (إذا كانت مفتوحة)
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({
                    type: 'progress_update',
                    videoId: mediaData.id,
                    progress: currentProgress
                }, '*');
            }
        }
    });
    
    // عند الانتهاء من المشاهدة
    videoPlayer.addEventListener('ended', function() {
        const progress = JSON.parse(localStorage.getItem('eng_khalid_progress')) || {};
        delete progress[mediaData.id];
        localStorage.setItem('eng_khalid_progress', JSON.stringify(progress));
    });
} else {
    mediaTitle.textContent = 'خطأ في تحميل الفيديو';
    videoPlayer.innerHTML = '<p>الرجاء العودة إلى الصفحة الرئيسية</p>';
}
