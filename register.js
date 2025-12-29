document.addEventListener('DOMContentLoaded', () => {
    
    const form = document.getElementById('registration-form');

    // フォームが送信されたときの処理
    if(form){
        form.addEventListener('submit', (event) => {
            // 1. 画面が切り替わるのを防ぐ
            event.preventDefault();

            // 2. 入力内容を取得
            const nameInput = document.getElementById('reg-name').value;
            const areaInput = document.getElementById('reg-area').value;
            
            // 3. 名前が空っぽじゃないかチェック
            if (!nameInput) {
                alert("お名前を入力してください。");
                return;
            }

            // 4. ブラウザにデータを保存（これが会員登録の代わり！）
            localStorage.setItem('wakasa_user_name', nameInput);
            localStorage.setItem('wakasa_user_area', areaInput);
            
            // ★ここが特典！500ポイントあげる
            localStorage.setItem('wakasa_points', 100);

            // 5. 完了メッセージを出して、トップページへ戻す
            alert(`ようこそ、${nameInput}さん！\n\n【登録完了】\n新規入会特典として 500pt をプレゼントしました。\n\nトップページへ移動します。`);
            
            window.location.href = 'index.html';
        });
    }
});