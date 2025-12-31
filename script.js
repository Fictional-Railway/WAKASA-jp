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

    // --- 天気予報API連携 ---
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

    // --- ユーザー認証システム ---
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

    // --- ニュース表示機能（index.html用） ---
    const newsContainer = document.getElementById('news-container');
    if (newsContainer) {
        function displayNews(category) {
            newsContainer.innerHTML = '';
            const list = newsData[category] || newsData['main'];
            list.forEach(item => {
                const li = document.createElement('li');
                let icons = item.isNew ? '<span class="new-icon">NEW</span>' : '';
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
        { date: "12/20", title: "国鉄三都線「立幹駅」で人身事故　上下線で1時間半運転見合わせ　延べ3万人に影響", url: "news011.html", isNew: false },
        { date: "12/19", title: "「煙が出ている」香津村の2階建てアパートで火事　男女3人を搬送", url: "news012.html", isNew: false },
        { date: "12/18", title: "入塚市で地域活性化イベント「入塚フェスティバル」開催、過去最高の来場者数に", url: "news013.html", isNew: false },
        { date: "12/18", title: "不正に病気休暇を取得、46歳の白央市職員を懲戒免職", url: "news014.html", isNew: false },
        { date: "12/17", title: "プロサッカー「若狭オーシャンズ」、J1昇格へ向け新スタジアム建設へ", url: "news015.html", isNew: false }
    ],
    local: [
        { date: "12/31", title: "折鷺市で迷子のヤギが警察官と散歩", url: "#", isNew: false },
        { date: "12/30", title: "汐崖町の展望台、リニューアルオープン", url: "#", isNew: false },
        { date: "12/29", title: "香津村名産「黄金メロン」の初競り、一玉5万円の最高値", url: "#", isNew: false },
        { date: "12/28", title: "深山町で「移動式スーパー」試験運行開始", url: "news501.html", isNew: false },
        { date: "12/27", title: "早手川町の渓谷で「氷のカーテン」が出現、冬の風物詩に", url: "#", isNew: false },
        { date: "12/26", title: "矢坂町の商店街で「昭和レトロ市」が開催、若者にも人気", url: "#", isNew: false },
        { date: "12/25", title: "白央市、独自の「出産お祝い給付金」を大幅増額へ", url: "#", isNew: false },
        { date: "12/24", title: "小桟田町の廃校を利用した現代アート展が閉幕、来場者最多", url: "#", isNew: false }
    ],
    economy: [
        { date: "12/30", title: "【鉄道】若狭電鉄、昭和レトロな「復刻版車両」の期間限定運行を開始", url: "#", isNew: false },
        { date: "12/29", title: "【教育】入塚市の中学校で特産粘土を使った「巨大土器づくり」に挑戦", url: "#", isNew: false },
        { date: "12/28", title: "【開発】兵府市中央再開発ビル、愛称が「ハイフ・スクエア」に決定", url: "#", isNew: false },
        { date: "12/27", title: "【企業】若狭酒造の新ブランド「若狭の滴」が国際コンクールで金賞", url: "#", isNew: false },
        { date: "12/26", title: "【雇用】渡町の漁業組合、若手漁師の育成プロジェクトを開始", url: "#", isNew: false },
        { date: "12/25", title: "【小売】物部市に大型アウトレットモールが来春オープン予定", url: "#", isNew: false },
        { date: "12/24", title: "【不動産】伊舟市のリゾートマンション建設ラッシュ、首都圏から注目", url: "#", isNew: false },
        { date: "12/23", title: "【エネルギー】徳峰町で地熱発電所の建設が着工、脱炭素社会へ", url: "#", isNew: false }
    ]
};