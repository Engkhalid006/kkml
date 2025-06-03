document.addEventListener('DOMContentLoaded', () => {
    // تهيئة السنة الحالية
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // تحليل الموقع
    document.getElementById('explorerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const url = document.getElementById('siteUrl').value.trim();
        if (!url) return;
        
        try {
            // عرض حالة التحميل
            document.getElementById('explorerResults').innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <p>جاري تحليل الموقع...</p>
                </div>
            `;
            
            // استخدام CORS Anywhere كبروكسي (يجب استبداله بخادمك الخاص للإنتاج)
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const targetUrl = url.startsWith('http') ? url : `https://${url}`;
            
            const response = await fetch(proxyUrl + targetUrl, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            if (!response.ok) throw new Error('فشل في جلب الموقع');
            
            const html = await response.text();
            
            // تحليل HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // استخراج البيانات
            const title = doc.querySelector('title')?.textContent || 'بدون عنوان';
            const images = Array.from(doc.querySelectorAll('img')).map(img => img.src);
            const videos = Array.from(doc.querySelectorAll('video')).map(video => video.src);
            const links = Array.from(doc.querySelectorAll('a'))
                .filter(a => a.href && !a.href.startsWith('javascript:'))
                .map(a => ({ url: a.href, text: a.textContent.trim() }));
            
            // عرض النتائج
            renderResults({ title, images, videos, links });
            
        } catch (error) {
            document.getElementById('explorerResults').innerHTML = `
                <div class="error">
                    <p>حدث خطأ أثناء تحليل الموقع:</p>
                    <p><strong>${error.message}</strong></p>
                    <button onclick="window.location.reload()">حاول مرة أخرى</button>
                </div>
            `;
            console.error('Explorer Error:', error);
        }
    });
});

// عرض نتائج التحليل
function renderResults(data) {
    let resultsHTML = `
        <div class="site-summary">
            <h3>${data.title}</h3>
            <div class="stats">
                <span>${data.images.length} صور</span>
                <span>${data.videos.length} فيديوهات</span>
                <span>${data.links.length} روابط</span>
            </div>
        </div>
    `;
    
    // عرض الفيديوهات
    if (data.videos.length > 0) {
        resultsHTML += `
            <div class="section">
                <h4>🎬 الفيديوهات</h4>
                <div class="media-grid">
                    ${data.videos.slice(0, 10).map(video => `
                        <div class="media-item">
                            <video controls src="${video}" style="width:100%"></video>
                            <button onclick="addToLibrary('${video}', 'video')">+ إضافة إلى المكتبة</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // عرض الصور
    if (data.images.length > 0) {
        resultsHTML += `
            <div class="section">
                <h4>📷 الصور</h4>
                <div class="media-grid">
                    ${data.images.slice(0, 20).map(img => `
                        <div class="media-item">
                            <img src="${img}" alt="صورة من الموقع" loading="lazy">
                            <button onclick="addToLibrary('${img}', 'image')">+ إضافة إلى المكتبة</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // عرض الروابط المهمة
    const importantLinks = data.links.filter(link => 
        link.text && link.text.length > 2 && !link.url.includes('#')
    ).slice(0, 30);
    
    if (importantLinks.length > 0) {
        resultsHTML += `
            <div class="section">
                <h4>🔗 الروابط</h4>
                <div class="links-list">
                    ${importantLinks.map(link => `
                        <div class="link-item">
                            <a href="${link.url}" target="_blank">${link.text || link.url}</a>
                            ${link.url.includes('youtube') ? `<button onclick="addToLibrary('${link.url}', 'video')">+ إضافة فيديو</button>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    document.getElementById('explorerResults').innerHTML = resultsHTML;
}

// إضافة إلى المكتبة
function addToLibrary(url, type) {
    if (window.opener && !window.opener.closed) {
        window.opener.postMessage({
            type: 'add_to_library',
            mediaUrl: url,
            mediaType: type === 'video' ? 'movie' : 'image'
        }, '*');
        
        alert('تم إرسال الرابط إلى الصفحة الرئيسية');
    } else {
        alert('الرجاء فتح الصفحة الرئيسية أولاً');
    }
}
