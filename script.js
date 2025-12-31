document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. 時計機能（最終更新時刻の連動含む） ---
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

    // --- 2. 天気予報API連携 ---
    async function updateWeather() {
        const locations = [
            { label: "沿岸", lat: 35.64, lon: 136.06 },
            { label: "中央", lat: 35.49, lon: 135.74 },
            { label: "南部", lat: 35.47, lon: 135.33 }
        ];

        const weatherCodes = {
            0: "晴れ", 1: "概ね晴れ", 2: "時々曇り", 3: "曇り",
            45: "霧", 48: "霧", 51: "小雨", 53: "雨", 55: "雨",
            61: "雨", 63: "雨", 65: "強い雨", 71: "雪", 73: "雪", 75: "大雪",
            80: "にわか雨", 81: "強いにわか雨", 82: "激しい雨", 95: "雷雨"
        };

        try {
            const results = await Promise.all(locations.map(async (loc) => {
                const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current_weather=true&timezone=Asia%2FTokyo`);
                const data = await response.json();
                const temp = Math.round(data.current_weather.temperature);
                const condition = weatherCodes[data.current_weather.weathercode] || "不明";
                return `[${loc.label}]${condition} ${temp}℃`;
            }));
            const weatherDisp = document.getElementById('weather-display');
            if (weatherDisp) weatherDisp.innerText = results.join(' / ');
        } catch (error) {
            console.error("Weather API Error:", error);
        }
    }
    updateWeather();
    setInterval(updateWeather, 1800000);

    // --- 3. ユーザー認証システム ---
    const loggedOutView = document.getElementById('logged-out-view');
    const loggedInView = document.getElementById('logged-in-view');
    const nameDisplay = document.getElementById('user-display-name');
    const pointDisplay = document.getElementById('user-points');

    function loadUserData() {
        if (!loggedOutView || !loggedInView) return;
        const savedName = localStorage.getItem('wakasa_user_name');
        const savedPoints = localStorage.getItem('wakasa_points');

        if (savedName) {
            loggedOutView.style.display = 'none';
            loggedInView.style.display = 'block';
            if (nameDisplay) nameDisplay.textContent = savedName;
            if (pointDisplay) pointDisplay.textContent = savedPoints || 0;
        } else {
            loggedOutView.style.display = 'block';
            loggedInView.style.display = 'none';
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
            }
        });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm("ログアウトしますか？")) {
                localStorage.removeItem('wakasa_user_name');
                loadUserData();
            }
        });
    }
    loadUserData();

    // --- 4. ニュース表示機能（index / wakasa / hyofu 共通） ---
    
    // index.html用のタブ表示ロジック（最新5件制限）
    const newsContainer = document.getElementById('news-container');
    if (newsContainer) {
        function displayNews(category) {
            newsContainer.innerHTML = '';
            const list = newsData[category] || newsData['main'];
            
            // 【修正点】トップページは最新5件のみ表示
            const limitedList = list.slice(0, 5);
            
            limitedList.forEach(item => {
                const li = document.createElement('li');
                let icons = item.isNew ? '<span class="new-icon">NEW</span>' : '';
                li.innerHTML = `<a href="${item.url}" class="news-link">
                                    <span style="font-size:11px; color:#666; margin-right:5px;">[${item.date}]</span>
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
        displayNews('main'); // 初期表示
    }

    // --- 5. 若狭市ページ用：全区キーワード検索ロジック ---
    const wakasaNewsContainer = document.getElementById('wakasa-news-list');
    if (wakasaNewsContainer) {
        // 全カテゴリーのニュースを結合して検索対象にする
        const allNews = [...newsData.main, ...newsData.local, ...newsData.economy];
        
        const filtered = allNews.filter(item => 
            item.title.includes("若狭市") || 
            item.title.includes("若狭市営") || 
            item.title.includes("若狭駅") ||
            item.title.includes("七宮区") ||
            item.title.includes("日澤区") || 
            item.title.includes("明区") ||
            item.title.includes("滝ヶ谷区") ||
            item.title.includes("銀樂区") ||
            item.title.includes("馬土川区") ||
            item.title.includes("若狭区") ||
            item.title.includes("峰廊区") ||
            item.title.includes("鐘山区") ||
            item.title.includes("赤蔦") ||
            item.title.includes("医科大学")
        );

        filtered.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="${item.url}"><span style="color:#666;">[${item.date}]</span> ${item.title}</a>`;
            wakasaNewsContainer.appendChild(li);
        });
    }

    // --- 6. 兵府市ページ用：全区キーワード検索ロジック ---
    const hyofuNewsContainer = document.getElementById('city-news-list');
    if (hyofuNewsContainer) {
        const allNews = [...newsData.main, ...newsData.local, ...newsData.economy];
        
        const filtered = allNews.filter(item => 
            item.title.includes("兵府市") || 
            item.title.includes("西平区") || 
            item.title.includes("大川区") || 
            item.title.includes("柳平区") || 
            item.title.includes("柳賀川区") || 
            item.title.includes("中兵府区") || 
            item.title.includes("慶堂区") || 
            item.title.includes("舞田区") || 
            item.title.includes("南兵府区") ||
            item.title.includes("電脳") ||
            item.title.includes("ハイフ")
        );

        if (filtered.length === 0) {
            hyofuNewsContainer.innerHTML = "<li>該当するニュースはありません。</li>";
        } else {
            filtered.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="${item.url}"><span style="color:#666;">[${item.date}]</span> ${item.title}</a>`;
                hyofuNewsContainer.appendChild(li);
            });
        }
    }
});

// --- ニュースデータ定義 ---
const newsData = {
    main: [
        { date: "12/30", title: "【速報】入塚市で国内最古級の土器片発見", url: "news002.html", isNew: false },
        { date: "12/29", title: "若狭市と兵府市、「双子都市構想」で合意", url: "news001.html", isNew: false },
        { date: "12/29", title: "江崎市名産「若狭サバ」過去最高値", url: "news004.html", isNew: false },
        { date: "12/28", title: "北陵～白央の新トンネル、開通式典", url: "news003.html", isNew: false },
        { date: "12/27", title: "国道563号高生交差点付近で乗用車4台が絡む事故、7人が負傷", url: "news005.html", isNew: false },
        { date: "12/25", title: "三都高速道路のスマートIC設置工事が完了、来月から運用", url: "news006.html", isNew: false },
        { date: "12/24", title: "若狭医科大学、難病治療の新たな臨床試験に成功", url: "news007.html", isNew: false },
        { date: "12/23", title: "葉が山駅前の雑貨店「風天楼」が閉店　56年の歴史に幕", url: "news008.html", isNew: false },
        { date: "12/22", title: "兵府市内で特殊詐欺を防いだ「中学生3人」に署長感謝状", url: "news009.html", isNew: false },
        { date: "12/21", title: "県営馬土川線「自動運転」の公開走行試験に成功、2027年導入目指す", url: "news010.html", isNew: false },
        { date: "12/20", title: "国鉄三都線「立幹駅」で人身事故　上下線で1時間半運転見合わせ", url: "news011.html", isNew: false }
    ],
    local: [
        { date: "12/31", title: "若狭市七宮区で大規模なカウントダウンイベント準備進む", url: "#", isNew: false },
        { date: "12/30", title: "慶堂区の電脳街、年末恒例のジャンク市に過去最多の人出", url: "#", isNew: false },
        { date: "12/29", title: "西平区のショッピングモールに「若狭市営出張窓口」が開設", url: "#", isNew: false },
        { date: "12/28", title: "日澤区〜明区間でのWi-Fi提供エリアを拡大、若狭市営地下鉄が発表", url: "#", isNew: false },
        { date: "12/27", title: "滝ヶ谷区の渓谷公園で冬のライトアップ。若狭駅から臨時バス運行", url: "#", isNew: false },
        { date: "12/26", title: "折鷺市で迷子のヤギが警察官と散歩", url: "#", isNew: false }
    ],
    economy: [
        { date: "12/30", title: "柳賀川区のロボット工場、完全自動化ラインを公開", url: "#", isNew: false },
        { date: "12/29", title: "中兵府区の「ハイフ・スクエア」再開発、愛称が正式決定", url: "#", isNew: false },
        { date: "12/28", title: "舞田区の兵府スタジアム、来季の命名権をIT大手と契約", url: "#", isNew: false },
        { date: "12/27", title: "若狭酒造の新ブランド「若狭の滴」が国際コンクールで金賞", url: "#", isNew: false }
    ]
};