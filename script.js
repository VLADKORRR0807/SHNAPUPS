// Хранение данных в localStorage
const STORAGE_KEY = 'catTrackerData';

// Инициализация данных
let catData = {
    actions: [],
    lastReset: new Date().toISOString()
};

// Загрузка данных из localStorage
function loadData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        catData = JSON.parse(savedData);
    }
    updateUI();
}

// Сохранение данных в localStorage
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(catData));
    updateUI();
}

// Добавление действия
function addAction(actionType) {
    const action = {
        type: actionType,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('ru-RU')
    };

    catData.actions.push(action);

    // Анимация кнопки
    const btn = event.target.closest('button');
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        btn.style.transform = '';
    }, 200);

    // Обновление смайлика кота
    updateCatMood();

    // Сохранение и обновление интерфейса
    saveData();
}

// Сброс данных
function resetData() {
    if (confirm('Точно сбросить все данные? Это действие нельзя отменить.')) {
        catData.actions = [];
        catData.lastReset = new Date().toISOString();
        saveData();

        // Анимация сброса
        document.querySelector('.cat-face').textContent = '😾';
        document.getElementById('statusText').textContent = 'Зачем всё удалил?';
        setTimeout(() => {
            updateCatMood();
        }, 1500);
    }
}

// Обновление настроения кота
function updateCatMood() {
    const actions = catData.actions;
    const lastActions = actions.filter(a => {
        const actionDate = new Date(a.timestamp);
        const now = new Date();
        const diffHours = (now - actionDate) / (1000 * 60 * 60);
        return diffHours < 24; // Действия за последние 24 часа
    });

    const feedCount = lastActions.filter(a => a.type === 'feed').length;
    const cleanCount = lastActions.filter(a => a.type === 'clean').length;
    const playCount = lastActions.filter(a => a.type === 'play').length;

    let catFace = '😺';
    let status = 'Кот доволен!';

    if (feedCount === 0) {
        catFace = '😿';
        status = 'Кот голоден!';
    } else if (cleanCount === 0 && actions.filter(a => a.type === 'clean').length > 0) {
        catFace = '🙀';
        status = 'Лоток грязный!';
    } else if (playCount === 0 && feedCount > 0) {
        catFace = '😾';
        status = 'Коту скучно!';
    } else if (feedCount >= 2 && cleanCount >= 1 && playCount >= 1) {
        catFace = '😻';
        status = 'Кот в восторге!';
    }

    document.querySelector('.cat-face').textContent = catFace;
    document.getElementById('statusText').textContent = status;
}

// Обновление статистики
function updateStats() {
    const feedCount = catData.actions.filter(a => a.type === 'feed').length;
    const cleanCount = catData.actions.filter(a => a.type === 'clean').length;
    const playCount = catData.actions.filter(a => a.type === 'play').length;

    document.getElementById('fedCount').textContent = feedCount;
    document.getElementById('cleanedCount').textContent = cleanCount;
    document.getElementById('playedCount').textContent = playCount;
}

// Обновление истории действий
function updateHistory() {
    const historyList = document.getElementById('historyList');
    const actions = catData.actions.slice(-10).reverse(); // Последние 10 действий

    if (actions.length === 0) {
        historyList.innerHTML = '<div class="empty-history">Пока нет действий</div>';
        return;
    }

    historyList.innerHTML = actions.map(action => {
        const time = new Date(action.timestamp).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
        const date = new Date(action.timestamp).toLocaleDateString('ru-RU');

        let actionText, actionClass;
        switch (action.type) {
            case 'feed':
                actionText = 'Покормил кота';
                actionClass = 'feed-item';
                break;
            case 'clean':
                actionText = 'Убрал лоток';
                actionClass = 'clean-item';
                break;
            case 'play':
                actionText = 'Поиграл с котом';
                actionClass = 'play-item';
                break;
        }

        return `
            <div class="history-item ${actionClass}">
                <div>
                    <strong>${actionText}</strong>
                    <div class="history-time">${date} в ${time}</div>
                </div>
                <i class="fas fa-${action.type === 'feed' ? 'bowl-food' : action.type === 'clean' ? 'broom' : 'baseball'}"></i>
            </div>
        `;
    }).join('');
}

// Обновление календаря
function updateCalendar() {
    const weekCalendar = document.getElementById('weekCalendar');
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

    let calendarHTML = '';

    // Создаем 7 дней назад от текущей даты
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toLocaleDateString('ru-RU');
        const dayName = days[date.getDay()];

        // Находим действия за этот день
        const dayActions = catData.actions.filter(a => a.date === dateString);
        const feedCount = dayActions.filter(a => a.type === 'feed').length;
        const cleanCount = dayActions.filter(a => a.type === 'clean').length;
        const playCount = dayActions.filter(a => a.type === 'play').length;

        // Определяем цвет дня
        let dayColor = '#f0f0f0';
        let dayEmoji = '⬜';
        let dayTitle = 'Нет действий';

        if (dayActions.length > 0) {
            if (feedCount >= 2 && cleanCount >= 1 && playCount >= 1) {
                dayColor = '#c6f6d5';
                dayEmoji = '😻';
                dayTitle = 'Идеальный день!';
            } else if (feedCount >= 1 && cleanCount >= 1) {
                dayColor = '#bee3f8';
                dayEmoji = '😺';
                dayTitle = 'Хороший день';
            } else if (feedCount >= 1) {
                dayColor = '#ffedd5';
                dayEmoji = '😼';
                dayTitle = 'Нормально';
            } else {
                dayColor = '#fed7d7';
                dayEmoji = '😿';
                dayTitle = 'Плохой день';
            }
        }

        calendarHTML += `
            <div class="day-box">
                <div class="day-name">${dayName}</div>
                <div class="day-status" style="background-color: ${dayColor}" title="${dayTitle}">
                    ${dayEmoji}
                </div>
                <div class="day-stats">
                    ${feedCount > 0 ? '🍗' : ''} ${cleanCount > 0 ? '🧹' : ''} ${playCount > 0 ? '🎾' : ''}
                </div>
                <div class="day-date">${dateString}</div>
            </div>
        `;
    }

    weekCalendar.innerHTML = calendarHTML;
}

// Обновление всего интерфейса
function updateUI() {
    updateStats();
    updateHistory();
    updateCalendar();
    updateCatMood();
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', loadData);

// Автосохранение каждые 10 секунд (на всякий случай)
setInterval(saveData, 10000);