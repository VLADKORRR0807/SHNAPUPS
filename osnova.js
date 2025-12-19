// ============================================
// ТЕЛЕГРАМ СЧЕТЧИК НАЖАТИЙ - APP.JS
// ============================================

// ---------- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ----------
let totalClicks = 0;      // Общее количество нажатий (сохраняется)
let sessionClicks = 0;    // Количество нажатий в текущей сессии (не сохраняется)
let lastClickTime = null; // Время последнего нажатия

// ---------- ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ ----------
// Эта функция запускается при полной загрузке страницы
function initApp() {
    console.log('🚀 Приложение инициализируется...');
    
    // 1. Инициализация Telegram Web App
    initTelegramApp();
    
    // 2. Загрузка сохраненных данных
    loadSavedData();
    
    // 3. Настройка обработчиков событий для кнопок
    setupEventListeners();
    
    console.log('✅ Приложение готово к работе!');
}

// ---------- ИНИЦИАЛИЗАЦИЯ TELEGRAM WEB APP ----------
function initTelegramApp() {
    // Проверяем, запущено ли приложение в Telegram
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
        const tg = Telegram.WebApp;
        
        // Разворачиваем приложение на весь экран
        tg.expand();
        console.log('📱 Telegram Web App инициализирован');
        
        // Получаем данные пользователя из Telegram
        const user = tg.initDataUnsafe.user;
        
        // Отображаем информацию о пользователе, если она доступна
        if (user) {
            displayUserInfo(user);
        } else {
            // Если пользователь не авторизован в Telegram
            document.getElementById('userInfo').innerHTML = 
                '👤 <strong>Гость</strong><br>Войдите в Telegram для сохранения данных';
        }
        
        // Можно также изменить тему под цветовую схему Telegram
        tg.setHeaderColor('secondary_bg_color');
        
    } else {
        // Если приложение запущено не в Telegram (например, в браузере)
        console.log('🌐 Приложение запущено в браузере (не в Telegram)');
        document.getElementById('userInfo').innerHTML = 
            '👤 <strong>Режим тестирования</strong><br>Запустите в Telegram для полного функционала';
    }
}

// ---------- ОТОБРАЖЕНИЕ ИНФОРМАЦИИ О ПОЛЬЗОВАТЕЛЕ ----------
function displayUserInfo(user) {
    // Формируем HTML с информацией о пользователе
    let userHTML = `👤 <strong>${user.first_name || 'Аноним'}</strong>`;
    
    // Добавляем фамилию, если есть
    if (user.last_name) {
        userHTML += ` ${user.last_name}`;
    }
    
    // Добавляем username, если есть
    if (user.username) {
        userHTML += `<br>@${user.username}`;
    }
    
    // Добавляем язык пользователя, если известен
    if (user.language_code) {
        userHTML += `<br>🌍 Язык: ${user.language_code}`;
    }
    
    // Вставляем HTML в блок пользователя
    document.getElementById('userInfo').innerHTML = userHTML;
    
    // Сохраняем ID пользователя в блоке статистики
    document.getElementById('userId').textContent = user.id;
}

// ---------- ЗАГРУЗКА СОХРАНЕННЫХ ДАННЫХ ----------
function loadSavedData() {
    console.log('📂 Загрузка сохраненных данных...');
    
    // Пытаемся получить данные из localStorage браузера
    // localStorage - это встроенное хранилище в браузере
    const savedClicks = localStorage.getItem('telegram_counter_clicks');
    
    if (savedClicks) {
        // Если данные найдены, преобразуем строку в число
        totalClicks = parseInt(savedClicks);
        console.log(`📊 Загружено сохраненных нажатий: ${totalClicks}`);
    } else {
        // Если данных нет, начинаем с нуля
        totalClicks = 0;
        console.log('📊 Нет сохраненных данных, начинаем с нуля');
    }
    
    // Загружаем время последнего нажатия
    const savedTime = localStorage.getItem('telegram_counter_last_click');
    if (savedTime) {
        lastClickTime = new Date(savedTime);
        updateLastClickDisplay();
    }
    
    // Обновляем отображение счетчика на странице
    updateCounterDisplay();
}

// ---------- СОХРАНЕНИЕ ДАННЫХ ----------
function saveData() {
    // Сохраняем общее количество нажатий
    localStorage.setItem('telegram_counter_clicks', totalClicks.toString());
    
    // Сохраняем время последнего нажатия
    localStorage.setItem('telegram_counter_last_click', new Date().toISOString());
    
    console.log(`💾 Данные сохранены: ${totalClicks} нажатий`);
    
    // В будущем здесь можно добавить отправку на сервер:
    // sendToServer(totalClicks);
}

// ---------- ОБНОВЛЕНИЕ ОТОБРАЖЕНИЯ СЧЕТЧИКА ----------
function updateCounterDisplay() {
    // Получаем элемент счетчика
    const counterElement = document.getElementById('counter');
    
    // Обновляем цифру
    counterElement.textContent = totalClicks;
    
    // Обновляем счетчик сессии
    document.getElementById('sessionClicks').textContent = sessionClicks;
    
    // Добавляем класс для анимации
    counterElement.classList.add('updated');
    
    // Убираем класс анимации через 300 миллисекунд
    setTimeout(() => {
        counterElement.classList.remove('updated');
    }, 300);
}

// ---------- ОБНОВЛЕНИЕ ОТОБРАЖЕНИЯ ВРЕМЕНИ ПОСЛЕДНЕГО НАЖАТИЯ ----------
function updateLastClickDisplay() {
    if (lastClickTime) {
        // Форматируем дату в удобный формат
        const timeString = lastClickTime.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const dateString = lastClickTime.toLocaleDateString('ru-RU');
        
        // Обновляем отображение
        document.getElementById('lastClick').textContent = 
            `${dateString} ${timeString}`;
    }
}

// ---------- ОБРАБОТЧИК НАЖАТИЯ НА ГЛАВНУЮ КНОПКУ ----------
function handleClick() {
    // Увеличиваем счетчики
    totalClicks++;
    sessionClicks++;
    
    // Запоминаем время нажатия
    lastClickTime = new Date();
    
    console.log(`🖱️ Нажатие! Всего: ${totalClicks}, Сессия: ${sessionClicks}`);
    
    // Обновляем отображение
    updateCounterDisplay();
    updateLastClickDisplay();
    
    // Сохраняем данные
    saveData();
    
    // Воспроизводим тактильную обратную связь (вибрацию), если доступно
    if (navigator.vibrate) {
        navigator.vibrate(50); // Вибрация 50 миллисекунд
    }
}

// ---------- ОБРАБОТЧИК СБРОСА СЧЕТЧИКА ----------
function handleReset() {
    // Показываем подтверждение
    if (confirm("Вы уверены, что хотите сбросить счетчик к нулю?\nЭто действие нельзя отменить.")) {
        // Сбрасываем счетчики
        totalClicks = 0;
        sessionClicks = 0;
        lastClickTime = null;
        
        console.log('🔄 Счетчик сброшен');
        
        // Обновляем отображение
        updateCounterDisplay();
        document.getElementById('lastClick').textContent = '-';
        
        // Сохраняем изменения
        saveData();
        
        // Показываем уведомление
        alert('Счетчик успешно сброшен!');
    }
}

// ---------- НАСТРОЙКА ОБРАБОТЧИКОВ СОБЫТИЙ ----------
function setupEventListeners() {
    // Находим кнопки на странице по их ID
    const clickBtn = document.getElementById('clickBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    // Назначаем обработчик клика на главную кнопку
    clickBtn.addEventListener('click', handleClick);
    
    // Назначаем обработчик клика на кнопку сброса
    resetBtn.addEventListener('click', handleReset);
    
    // Дополнительно: обработка нажатия клавиши пробела
    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space') {
            event.preventDefault(); // Отменяем стандартное поведение пробела
            handleClick();
            
            // Добавляем визуальную обратную связь
            clickBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                clickBtn.style.transform = 'scale(1)';
            }, 150);
        }
    });
    
    console.log('🎮 Обработчики событий настроены');
}

// ---------- ДОПОЛНИТЕЛЬНАЯ ФУНКЦИЯ: ОТПРАВКА НА СЕРВЕР ----------
// Эта функция не используется сейчас, но показывает, как можно расширить приложение
function sendToServer(clickCount) {
    // Пример кода для отправки данных на сервер
    /*
    fetch('https://ваш-сервер.com/api/save-clicks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId: Telegram.WebApp.initDataUnsafe.user?.id,
            clicks: clickCount,
            timestamp: new Date().toISOString()
        })
    })
    .then(response => response.json())
    .then(data => console.log('Данные отправлены на сервер:', data))
    .catch(error => console.error('Ошибка отправки:', error));
    */
}

// ---------- ЗАПУСК ПРИЛОЖЕНИЯ ----------
// Ждем полной загрузки DOM (структуры страницы), затем запускаем приложение
document.addEventListener('DOMContentLoaded', initApp);

// Альтернативный способ: когда вся страница загружена (включая изображения)
// window.onload = initApp;