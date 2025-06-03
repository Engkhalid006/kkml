document.getElementById('explorerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const url = document.getElementById('siteUrl').value;
    if (!url) return;
    
    try {
        document.getElementById('explorerResults').innerHTML = '<p>جاري تحليل الموقع...</p>';
        
        // في الواقع، تحتاج إلى استخدام خدمة بروكسي لتحليل المحتوى بسبب سياسة CORS
        // هذا مثال مبسط فقط لأغراض التوضيح
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        
        // تحليل المحتوى (هذا جزء مبسط جداً)
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(data.contents, 'text/html');
        
        // استخراج الروابط والصور
        const links = htmlDoc.querySelectorAll('a');
        const images = htmlDoc.querySelectorAll('img');
        
        // عرض النتائج
        let resultsHTML = `
            <h3>تم العثور على ${links.length} روابط و ${images.length} صور</h3>
            <div class="explorer-grid">
        `;
        
        // عرض الصور
        images.forEach(img => {
            if (img.src) {
                resultsHTML += `
                    <div class="explorer-item">
                        <img src="${img.src}" alt="صورة من الموقع">
                        <p>${img.alt || 'صورة بدون وصف'}</p>
                    </div>
                `;
            }
        });
        
        // عرض الروابط المهمة (تجاهل الروابط الشائعة)
        links.forEach(link => {
            if (link.href && !link.href.includes('javascript:') && 
                !link.href.includes('#') && link.href.startsWith('http')) {
                resultsHTML += `
                    <div class="explorer-item">
                        <a href="${link.href}" target="_blank">${link.textContent || link.href}</a>
                    </div>
                `;
            }
        });
        
        resultsHTML += '</div>';
        document.getElementById('explorerResults').innerHTML = resultsHTML;
        
    } catch (error) {
        document.getElementById('explorerResults').innerHTML = `
            <p class="error">حدث خطأ أثناء تحليل الموقع: ${error.message}</p>
        `;
    }
});
