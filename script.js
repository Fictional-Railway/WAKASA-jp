document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. 全ページ共通機能 (時計・天気・ログイン)
    // ==========================================

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

    // --- 天気API (設定エラー回避付き) ---
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
            console.error("Weather Error", error);
            display.textContent = "天気情報の取得に失敗しました。";
        }
    }
    fetchLiveWeather();
    setInterval(fetchLiveWeather, 15 * 60 * 1000);

    // ==========================================
    // 2. ユーザー認証・ポイントシステム (全ページ共通)
    // ==========================================
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
            // ログイン中
            loggedOutView.style.display = 'none';
            loggedInView.style.display = 'block';
            if (missionArea) missionArea.style.display = 'block';
            if (nameDisplay) nameDisplay.textContent = savedName;
            if (pointDisplay) pointDisplay.textContent = savedPoints || 0;
            
            // フォームの自動入力（会員登録ページ用）
            const regNameInput = document.getElementById('reg-name');
            if(regNameInput) regNameInput.value = savedName;

        } else {
            // ゲスト
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
                if (!localStorage.getItem('wakasa_points')) {
                    localStorage.setItem('wakasa_points', 0);
                }
                loadUserData();
                alert(`おかえりなさい、${userName}さん！`);
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


    // ==========================================
    // 3. ページ別機能：トップページ (ニュースタブ)
    // ==========================================
    const newsContainer = document.getElementById('news-container');
    if (newsContainer) {
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

        function displayNews(category) {
            newsContainer.innerHTML = '';
            const list = newsData[category] || newsData['main'];
            list.forEach(item => {
                const li = document.createElement('li');
                let icons = '';
                if (item.isNew) icons += '<span class="new-icon">NEW</span>';
                if (item.hasCam) icons += '<span class="camera-icon">📷</span>';
                li.innerHTML = `<a href="#" class="news-link">${item.title}</a><span class="news-icons">${icons}</span>`;
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

    // ==========================================
    // 4. ページ別機能：会員登録 (register.html)
    // ==========================================
    const regForm = document.getElementById('registration-form');
    if (regForm) {
        regForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameVal = document.getElementById('reg-name').value;
            const areaVal = document.getElementById('reg-area').value;
            
            if(!nameVal) { alert("名前を入力してください"); return; }

            localStorage.setItem('wakasa_user_name', nameVal);
            localStorage.setItem('wakasa_user_area', areaVal);
            localStorage.setItem('wakasa_points', 500);

            alert(`ようこそ、${nameVal}さん！\n新規登録特典 500pt を付与しました。`);
            window.location.href = 'index.html'; 
        });
    }

    // ==========================================
    // 5. ページ別機能：ゴミ出しカレンダー (gomidashi.html)
    // ★ここが12ヶ月分自動生成ロジックです！
    // ==========================================
    const calendarRoot = document.getElementById('calendar-12months-container');
    if (calendarRoot) {
        // ログインしている人のエリアを取得して自動選択
        const userArea = localStorage.getItem('wakasa_user_area');
        if(userArea) {
            const areaSelect = document.getElementById('area-select');
            if(areaSelect) {
                for(let i=0; i<areaSelect.options.length; i++){
                    if(areaSelect.options[i].value === userArea){
                        areaSelect.selectedIndex = i;
                        break;
                    }
                }
            }
        }

        // カレンダー生成関数
        function generateCalendar(year, month) {
            // 月の初めと終わりを取得
            const firstDate = new Date(year, month - 1, 1);
            const lastDate = new Date(year, month, 0);
            const startDay = firstDate.getDay(); // 曜日 (0:日, 1:月...)
            const endDay = lastDate.getDate();   // 日数 (28~31)

            let html = `
            <div class="calendar-month-wrapper">
                <h4 class="month-title">${year}年 ${month}月</h4>
                <table class="garbage-table">
                    <thead>
                        <tr><th class="sun">日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th class="sat">土</th></tr>
                    </thead>
                    <tbody>
                        <tr>`;

            // 最初の空白セル
            let dayCount = 0;
            for (let i = 0; i < startDay; i++) {
                html += `<td></td>`;
                dayCount++;
            }

            // 日付を埋める
            for (let d = 1; d <= endDay; d++) {
                // 曜日計算 (0:日 ... 6:土)
                const currentDayOfWeek = (dayCount % 7);
                
                // 行変え
                if (dayCount > 0 && currentDayOfWeek === 0) {
                    html += `</tr><tr>`;
                }

                // ゴミの判定ロジック (簡易シミュレーション)
                // 月木:可燃, 火:資源, 金:プラ, 水(隔週):不燃, 第3月:有害...など
                let garbageType = "";
                let garbageClass = "";

                // お正月休み判定
                if (month === 1 && d <= 3) {
                    garbageType = "年始休";
                    garbageClass = "g-holiday";
                } else {
                    switch(currentDayOfWeek) {
                        case 1: // 月曜
                        case 4: // 木曜
                            garbageType = "可燃";
                            garbageClass = "g-burn";
                            break;
                        case 2: // 火曜
                            garbageType = "資源";
                            garbageClass = "g-res";
                            break;
                        case 3: // 水曜
                            // 偶数週だけ不燃とする
                            if (Math.floor(d / 7) % 2 === 0) {
                                garbageType = "不燃";
                                garbageClass = "g-non";
                            }
                            break;
                        case 5: // 金曜
                            garbageType = "プラ";
                            garbageClass = "g-pla";
                            break;
                        case 6: // 土曜
                        case 0: // 日曜
                            // なし
                            break;
                    }
                    // 月に一度の有害ごみ (20日以降の最初の月曜)
                    if (d >= 20 && currentDayOfWeek === 1 && !garbageType.includes("有害")) {
                        garbageType = "有害";
                        garbageClass = "g-bin";
                    }
                }

                // セルの中身
                let cellContent = `<span class="day">${d}</span>`;
                if (garbageType) {
                    cellContent += `<br><span class="label-g ${garbageClass}">${garbageType}</span>`;
                }

                // 土日の色クラス
                let tdClass = "";
                if (currentDayOfWeek === 0) tdClass = "sun";
                if (currentDayOfWeek === 6) tdClass = "sat";

                html += `<td class="${tdClass}">${cellContent}</td>`;
                dayCount++;
            }

            // 最後の空白セル
            while (dayCount % 7 !== 0) {
                html += `<td></td>`;
                dayCount++;
            }

            html += `</tr></tbody></table></div>`;
            return html;
        }

        // 12ヶ月分ループして生成
        // 2026年の1月〜12月を表示
        let fullCalendarHTML = "";
        const startYear = 2026;
        
        for (let m = 1; m <= 12; m++) {
            fullCalendarHTML += generateCalendar(startYear, m);
        }
        
        calendarRoot.innerHTML = fullCalendarHTML;

        // 生成されたラベルにクリックイベントを付与
        const newLabels = document.querySelectorAll('.label-g');
        newLabels.forEach(label => {
            label.addEventListener('click', () => {
                alert(`【ゴミ分別詳細】\n種別：${label.textContent}\n\n指定の袋に入れて、朝8時30分までにゴミステーションへお出しください。`);
            });
        });
        
        // エリア変更時のアラート
        const areaSelect = document.getElementById('area-select');
        if(areaSelect) {
            areaSelect.addEventListener('change', (e) => {
               alert(`【システム】エリアを「${e.target.options[e.target.selectedIndex].text}」に変更しました。\n収集日が更新されます（シミュレーション）。`); 
               // 本来ならここで再描画する
            });
        }
    }
});