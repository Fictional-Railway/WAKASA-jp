document.addEventListener('DOMContentLoaded', () => {
    
    // --- 時計機能 ---
    function updateClock() {
        const now = new Date();
        const days = ['日', '月', '火', '水', '木', '金', '土'];
        const dateString = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日(${days[now.getDay()]}) ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        const clockEl = document.getElementById('clock-display');
        if (clockEl) clockEl.textContent = dateString;
        
        const updateEl = document.getElementById('last-update');
        if (updateEl) updateEl.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // --- 天気API ---
    const API_KEY = 'c1621a45a216a7d680a5d8ab3a1920b1'; 
    const CITIES = [
        { name: "沿岸部(敦賀)", id: "1850551" },
        { name: "中央部(小浜)", id: "1853610" },
        { name: "南部(舞鶴)", id: "1858094" }
    ];

    async function fetchLiveWeather() {
        const display = document.getElementById('weather-display');
        if (!display) return;

        try {
            let weatherStrings = [];
            for (const city of CITIES) {
                const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?id=${city.id}&appid=${API_KEY}&units=metric&lang=ja`);
                const data = await response.json();
                const temp = Math.round(data.main.temp);
                const desc = data.weather[0].description;
                
                let icon = '☁️';
                const i = data.weather[0].icon;
                if(i.includes('01')) icon='☀️';
                else if(i.includes('02')) icon='⛅';
                else if(i.includes('09') || i.includes('10')) icon='☔️';
                else if(i.includes('13')) icon='⛄️';

                weatherStrings.push(`【${city.name}】 ${icon} ${temp}℃ / ${desc}`);
            }
            display.textContent = "　　" + weatherStrings.join("　　|　　") + "　　";
        } catch (error) {
            display.textContent = "天気情報の取得に失敗しました。";
        }
    }
    fetchLiveWeather();
    setInterval(fetchLiveWeather, 15 * 60 * 1000);

    // --- ユーザー認証システム ---
    const loggedOutView = document.getElementById('logged-out-view');
    const loggedInView = document.getElementById('logged-in-view');
    const missionArea = document.getElementById('mission-area');
    const nameDisplay = document.getElementById('user-display-name');
    const pointDisplay = document.getElementById('user-points');

    function loadUserData() {
        if (!loggedOutView || !loggedInView) return;
        const savedName = localStorage.getItem('wakasa_user_name');
        const savedPoints = localStorage.getItem('wakasa_points');

        if (savedName) {
            loggedOutView.style.display = 'none';
            loggedInView.style.display = 'block';
            if (missionArea) missionArea.style.display = 'block';
            if (nameDisplay) nameDisplay.textContent = savedName;
            if (pointDisplay) pointDisplay.textContent = savedPoints || 0;
        } else {
            loggedOutView.style.display = 'block';
            loggedInView.style.display = 'none';
            if (missionArea) missionArea.style.display = 'none';
        }
    }

    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const userName = prompt("若狭ID（お名前）を入力してください：", "若狭太郎");
            if (userName) {
                localStorage.setItem('wakasa_user_name', userName);
                if (!localStorage.getItem('wakasa_points')) localStorage.setItem('wakasa_points', 0);
                loadUserData();
                window.location.reload(); 
            }
        });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm("ログアウトしますか？")) {
                localStorage.removeItem('wakasa_user_name');
                loadUserData();
                window.location.reload(); 
            }
        });
    }

    const getPointBtn = document.getElementById('get-point-btn');
    if (getPointBtn) {
        getPointBtn.addEventListener('click', () => {
            let currentPoints = parseInt(localStorage.getItem('wakasa_points') || 0);
            currentPoints += 10;
            localStorage.setItem('wakasa_points', currentPoints);
            loadUserData();
            alert("10ポイント獲得しました！");
        });
    }

    loadUserData();

    // --- ニュースタブ機能（ここを修正） ---
    const newsContainer = document.getElementById('news-container');
    if (newsContainer) {
        const newsData = {
            main: [
                { title: "若狭市と兵府市、「双子都市構想」で合意", url: "news_001.html", isNew: true, hasCam: false },
                { title: "【速報】入塚市で国内最古級の土器片発見", url: "news_002.html", isNew: false, hasCam: false },
                { title: "江崎市沖で「巨大クリスタル鯖」最高値", url: "#", isNew: false, hasCam: false },
                { title: "北陵〜白央の新トンネル、開通式典", url: "news_003.html", isNew: false, hasCam: false },
                { title: "（もっと見る...）", url: "#", isNew: false, hasCam: false }
            ],
            local: [
                { title: "渡町で伝統の「潮干狩り大会」開催", url: "#", isNew: true, hasCam: false },
                { title: "汐崖町の展望台、リニューアルオープン", url: "#", isNew: false, hasCam: true },
                { title: "香津村の「メロン祭り」予約開始", url: "#", isNew: false, hasCam: false },
                { title: "折鷲市で迷子のヤギが警察官と散歩", url: "#", isNew: false, hasCam: true },
                { title: "（もっと見る...）", url: "#", isNew: false, hasCam: false }
            ],
            economy: [
                { title: "若狭電鉄、黒字転換「AI導入が寄与」", url: "#", isNew: false, hasCam: false },
                { title: "甲日市の高原リゾート、宿泊客数V字回復", url: "#", isNew: true, hasCam: false },
                { title: "物部市の精密機械工場、世界シェア1位に", url: "#", isNew: false, hasCam: true },
                { title: "若狭牛の海外輸出、過去最大を記録", url: "#", isNew: false, hasCam: false },
                { title: "（もっと見る...）", url: "#", isNew: false, hasCam: false }
            ]
        };

        function displayNews(category) {
            newsContainer.innerHTML = '';
            const list = newsData[category] || newsData['main'];
            list.forEach(item => {
                const li = document.createElement('li');
                
                // アイコン文字列作成
                let icons = '';
                if (item.isNew) icons += '<span class="new-icon">NEW</span>';
                if (item.hasCam) icons += '<span class="camera-icon">📷</span>';
                
                // リンクの中にタイトルとアイコンを同居させ、左寄せを維持
                li.innerHTML = `<a href="${item.url}" class="news-link">
                                    <span class="news-text">${item.title}</span>
                                    ${icons}
                                </a>`;
                newsContainer.appendChild(li);
            });
        }
        
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                displayNews(tab.getAttribute('data-category'));
            });
        });
        displayNews('main');
    }

    // --- ゴミ出しカレンダー自動生成 ---
    const calendarRoot = document.getElementById('calendar-12months-container');
    if (calendarRoot) {
        function generateCalendar(year, month) {
            const firstDate = new Date(year, month - 1, 1);
            const lastDate = new Date(year, month, 0);
            const startDay = firstDate.getDay();
            const endDay = lastDate.getDate();

            let html = `
            <div class="calendar-month-wrapper">
                <h4 class="month-title">${year}年 ${month}月</h4>
                <table class="garbage-table">
                    <thead>
                        <tr><th class="sun">日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th class="sat">土</th></tr>
                    </thead>
                    <tbody><tr>`;

            let dayCount = 0;
            for (let i = 0; i < startDay; i++) {
                html += `<td></td>`;
                dayCount++;
            }

            for (let d = 1; d <= endDay; d++) {
                const currentDayOfWeek = (dayCount % 7);
                if (dayCount > 0 && currentDayOfWeek === 0) html += `</tr><tr>`;

                let garbageType = "";
                let garbageClass = "";

                if (month === 1 && d <= 3) {
                    garbageType = "年始休";
                    garbageClass = "g-holiday";
                } else {
                    switch(currentDayOfWeek) {
                        case 1: case 4: garbageType = "可燃"; garbageClass = "g-burn"; break;
                        case 2: garbageType = "資源"; garbageClass = "g-res"; break;
                        case 3: if (Math.floor(d / 7) % 2 === 0) { garbageType = "不燃"; garbageClass = "g-non"; } break;
                        case 5: garbageType = "プラ"; garbageClass = "g-pla"; break;
                    }
                    if (d >= 20 && currentDayOfWeek === 1 && !garbageType.includes("有害")) {
                        garbageType = "有害"; garbageClass = "g-bin";
                    }
                }

                let cellContent = `<span class="day">${d}</span>`;
                if (garbageType) cellContent += `<br><span class="label-g ${garbageClass}">${garbageType}</span>`;

                let tdClass = "";
                if (currentDayOfWeek === 0) tdClass = "sun";
                if (currentDayOfWeek === 6) tdClass = "sat";

                html += `<td class="${tdClass}">${cellContent}</td>`;
                dayCount++;
            }

            while (dayCount % 7 !== 0) {
                html += `<td></td>`;
                dayCount++;
            }

            html += `</tr></tbody></table></div>`;
            return html;
        }

        let fullCalendarHTML = "";
        for (let m = 1; m <= 12; m++) fullCalendarHTML += generateCalendar(2026, m);
        calendarRoot.innerHTML = fullCalendarHTML;
    }
});