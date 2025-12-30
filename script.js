document.addEventListener('DOMContentLoaded', () => {
    
    // 1. 時計機能
    function updateClock() {
        const now = new Date();
        const days = ['日', '月', '火', '水', '木', '金', '土'];
        
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const date = now.getDate();
        const day = days[now.getDay()];
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        const dateString = `${year}年${month}月${date}日(${day}) ${hours}:${minutes}:${seconds}`;
        document.getElementById('clock-display').textContent = dateString;

        // ニュースの更新時間もついでに現在時刻にする（生きてる感を出す）
        document.getElementById('last-update').textContent = `${hours}:${minutes}`;
    }
    setInterval(updateClock, 1000);
    updateClock(); // 初期実行

    // 2. 疑似天気API機能（地図のエリア分けに基づく）
    // ランダムな天気を生成して表示します
    function fetchWakasaWeather() {
        const weathers = ['☀️ 晴れ', '☁️ 曇り', '☂️ 雨', '⛄️ 雪', '🌥 薄曇り'];
        
        // エリアごとの天気をランダム決定
        const coastWeather = weathers[Math.floor(Math.random() * weathers.length)];
        const centralWeather = weathers[Math.floor(Math.random() * weathers.length)];
        
        // 山間部はちょっと寒そうにする（雪率高め）
        let mountainWeather = weathers[Math.floor(Math.random() * weathers.length)];
        if(Math.random() > 0.7) mountainWeather = '⛄️ 大雪'; 

        // 温度も適当に生成（冬設定）
        const tempCoast = Math.floor(Math.random() * 5) + 8; // 8~12度
        const tempCentral = Math.floor(Math.random() * 5) + 5; // 5~9度
        const tempMt = Math.floor(Math.random() * 5) + 0; // 0~4度

        // HTMLに反映
        document.getElementById('weather-coast').textContent = `沿岸部(江崎): ${coastWeather} ${tempCoast}℃`;
        document.getElementById('weather-central').textContent = `中央部(若狭): ${centralWeather} ${tempCentral}℃`;
        document.getElementById('weather-mountain').textContent = `山間部(深山): ${mountainWeather} ${tempMt}℃`;
    }

    fetchWakasaWeather(); // ページ読み込み時に実行

    // 3. ニュースタブの切り替え（簡易版）
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // アクティブクラスの切り替え
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 本当はここで記事リストを入れ替えるが、今回はアラートで演出
            // alert(`「${tab.textContent}」タブの情報を取得しました（疑似）`);
        });
    });

    // 4. 便利ツールのインタラクション
    const tools = document.querySelectorAll('.tool-item');
    tools.forEach(tool => {
        tool.addEventListener('click', function() {
            const label = this.querySelector('.label').textContent;
            alert(`【若狭県システム】\n「${label}」の最新情報を取得中...\n\n（※システム接続完了）`);
        });
    });

});

document.addEventListener('DOMContentLoaded', () => {
    
    // --- ⚙️ 設定エリア ---
    // ここに取得したAPIキーを入力してください
    const API_KEY = 'c1621a45a216a7d680a5d8ab3a1920b1'; 
    
    // 都市ID設定（敦賀, 小浜, 舞鶴）
    const CITIES = [
        { name: "沿岸部(敦賀)", id: "1850551" }, // Tsuruga
        { name: "中央部(小浜)", id: "1853610" }, // Obama
        { name: "南部(舞鶴)", id: "1858094" }   // Maizuru
    ];

    // 1. 時計機能（以前と同じ）
    function updateClock() {
        const now = new Date();
        const days = ['日', '月', '火', '水', '木', '金', '土'];
        const dateString = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日(${days[now.getDay()]}) ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        document.getElementById('clock-display').textContent = dateString;
    }
    setInterval(updateClock, 1000);

    // 2. 実際の天気API取得機能
    async function fetchLiveWeather() {
        if (API_KEY === 'YOUR_API_KEY_HERE') {
            document.getElementById('weather-display').textContent = "【設定エラー】APIキーを入力してください。";
            return;
        }

        try {
            let weatherStrings = [];

            for (const city of CITIES) {
                const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?id=${city.id}&appid=${API_KEY}&units=metric&lang=ja`);
                const data = await response.json();

                const temp = Math.round(data.main.temp);
                const desc = data.weather[0].description;
                const icon = getCustomEmoji(data.weather[0].icon);

                weatherStrings.push(`【${city.name}】 ${icon} ${temp}℃ / ${desc}`);
            }

            // 右から左へ流れるテキストを更新
            document.getElementById('weather-display').textContent = "　　" + weatherStrings.join("　　|　　") + "　　";
            
        } catch (error) {
            console.error("天気データの取得に失敗しました:", error);
            document.getElementById('weather-display').textContent = "天気データの取得に失敗しました。詳しくはテレビ局の天気予報をご覧ください。";
        }
    }

    // 天気アイコン（APIのコードを絵文字に変換）
    function getCustomEmoji(iconCode) {
        const mapping = {
            '01': '☀️', '02': '⛅', '03': '☁️', '04': '☁️',
            '09': '🌧️', '10': '🌦️', '11': '⚡', '13': '❄️', '50': '🌫️'
        };
        return mapping[iconCode.substring(0, 2)] || '🌡️';
    }

    // 実行
    fetchLiveWeather();
    // 15分ごとに更新
    setInterval(fetchLiveWeather, 15 * 60 * 1000);
});

// --- 📰 ニュースデータ設定 ---
const newsData = {
    main: [
        { title: "若狭市と兵府市、「双子都市構想」で合意", isNew: false, hasCam: true },
        { title: "【速報】入塚市で国内最古級の土器発見", isNew: true, hasCam: false },
        { title: "江崎市沖で「巨大クリスタル鯖」最高値", isNew: false, hasCam: false },
        { title: "北陵〜白央の新トンネル、開通式典", isNew: false, hasCam: true },
        { title: "（もっと見る...）", isNew: false, hasCam: false }
    ],
    local: [
        { title: "渡町で伝統の「潮干狩り大会」開催", isNew: true, hasCam: false },
        { title: "汐崖町の展望台、リニューアルオープン", isNew: false, hasCam: true },
        { title: "香津村の「メロン祭り」予約開始", isNew: false, hasCam: false },
        { title: "折鷲市で迷子のヤギが警察官と散歩", isNew: false, hasCam: true },
        { title: "（もっと見る...）", isNew: false, hasCam: false }
    ],
    economy: [
        { title: "若狭電鉄、黒字転換「AI導入が寄与」", isNew: false, hasCam: false },
        { title: "甲日市の高原リゾート、宿泊客数V字回復", isNew: true, hasCam: false },
        { title: "物部市の精密機械工場、世界シェア1位に", isNew: false, hasCam: true },
        { title: "若狭牛の海外輸出、過去最大を記録", isNew: false, hasCam: false },
        { title: "（もっと見る...）", isNew: false, hasCam: false }
    ]
};

// ニュースを表示する関数
function displayNews(category) {
    const container = document.getElementById('news-container');
    container.innerHTML = ''; // 一旦空にする

    newsData[category].forEach(item => {
        const li = document.createElement('li');
        
        let icons = '';
        if (item.isNew) icons += '<span class="new-icon">NEW</span>';
        if (item.hasCam) icons += '<span class="camera-icon">📷</span>';

        li.innerHTML = `
            <a href="#" class="news-link">${item.title}</a>
            <span class="news-icons">${icons}</span>
        `;
        container.appendChild(li);
    });
}

// タブクリックイベントの設定
const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // 全ボタンからactiveクラスを消す
        tabs.forEach(t => t.classList.remove('active'));
        // クリックされたボタンにactiveクラスを付ける
        tab.classList.add('active');
        
        // ニュースを表示
        const category = tab.getAttribute('data-category');
        displayNews(category);
    });
});

// 初期表示（主要ニュースを表示）
displayNews('main');

document.addEventListener('DOMContentLoaded', () => {
    // --- 🔑 ユーザー認証・ポイント機能 ---

    const loggedOutView = document.getElementById('logged-out-view');
    const loggedInView = document.getElementById('logged-in-view');
    const missionArea = document.getElementById('mission-area');
    const nameDisplay = document.getElementById('user-display-name');
    const pointDisplay = document.getElementById('user-points');

    // データの読み込み
    function loadUserData() {
        const savedName = localStorage.getItem('wakasa_user_name');
        const savedPoints = localStorage.getItem('wakasa_points');

        if (savedName) {
            // ログイン状態にする
            loggedOutView.style.display = 'none';
            loggedInView.style.display = 'block';
            missionArea.style.display = 'block';
            nameDisplay.textContent = savedName;
            pointDisplay.textContent = savedPoints || 0;
        } else {
            // 未ログイン状態
            loggedOutView.style.display = 'block';
            loggedInView.style.display = 'none';
            missionArea.style.display = 'none';
        }
    }

    // 会員登録・ログイン処理（シミュレーション）
    document.getElementById('login-btn').addEventListener('click', () => {
        const userName = prompt("若狭ID（お名前）を入力してください：", "若狭太郎");
        if (userName) {
            localStorage.setItem('wakasa_user_name', userName);
            // 新規なら0ポイント、既存ならそのまま
            if (!localStorage.getItem('wakasa_points')) {
                localStorage.setItem('wakasa_points', 0);
            }
            loadUserData();
            alert(`若狭県ポータルへようこそ、${userName}さん！`);
        }
    });

    // ログアウト
    document.getElementById('logout-btn').addEventListener('click', () => {
        if (confirm("ログアウトしますか？")) {
            localStorage.removeItem('wakasa_user_name');
            // ポイントは消さずに残す（ログインしたらまた見れる仕様）
            loadUserData();
        }
    });

    // ポイント獲得ボタン
    document.getElementById('get-point-btn').addEventListener('click', () => {
        let currentPoints = parseInt(localStorage.getItem('wakasa_points') || 0);
        currentPoints += 10; // 1回につき10pt付与
        localStorage.setItem('wakasa_points', currentPoints);
        
        // 画面更新
        pointDisplay.textContent = currentPoints;
        
        alert("10ポイント獲得しました！現在のポイント：" + currentPoints + " pt");
    });

    // ページ読み込み時に実行
    loadUserData();

    // --- ⏳ 滞在ポイント加算システム ---

let staySeconds = 0; // 滞在秒数をカウント
const POINTS_PER_INTERVAL = 10; // もらえるポイント
const INTERVAL_SECONDS = 30; // 何秒ごとにもらえるか

function startStayPointTimer() {
    setInterval(() => {
        staySeconds++;

        // 30秒に達したかチェック
        if (staySeconds >= INTERVAL_SECONDS) {
            addStayPoints();
            staySeconds = 0; // カウントをリセット
        }
    }, 1000); // 1秒ごとにカウントアップ
}

function addStayPoints() {
    // ログイン中（名前が保存されている）かチェック
    const savedName = localStorage.getItem('wakasa_user_name');
    if (!savedName) return; // ログインしてなければ何もしない

    // 現在のポイントを取得して加算
    let currentPoints = parseInt(localStorage.getItem('wakasa_points') || 0);
    currentPoints += POINTS_PER_INTERVAL;
    
    // ローカルストレージに保存
    localStorage.setItem('wakasa_points', currentPoints);
    
    // 画面上の表示を更新（右サイドバーのポイント表示）
    const pointDisplay = document.getElementById('user-points');
    if (pointDisplay) {
        pointDisplay.textContent = currentPoints;
    }

    // 画面の端っこに小さく通知を出す（お好みで）
    console.log(`${INTERVAL_SECONDS}秒滞在ボーナス！ ${POINTS_PER_INTERVAL}pt 獲得しました。`);
    
    // もし通知を出したい場合はこちらを有効に
    // alert("滞在ボーナス！10ポイント獲得しました！"); 
}

// タイマー開始
startStayPointTimer();
});

// ...（以前の時計・天気・ログイン機能はそのまま保持）...

// ゴミ出しページ独自の処理
document.addEventListener('DOMContentLoaded', () => {
    const areaSelect = document.getElementById('area-select');
    if (areaSelect) {
        areaSelect.addEventListener('change', (e) => {
            alert(`【システム】${e.target.selectedOptions[0].text}のデータを読み込みます。`);
            // ここで本来はデータを書き換えます
        });
    }

    // カレンダー内のラベルをクリックしたら詳細を表示
    const labels = document.querySelectorAll('.label-g');
    labels.forEach(label => {
        label.addEventListener('click', () => {
            alert(`【詳細】${label.textContent}ゴミの収集日です。\n指定の袋に入れて朝8時までに出してください。`);
        });
    });
});