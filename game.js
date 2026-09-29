/* =============================================================
   GARDEN RUSH — игровой движок
   -------------------------------------------------------------
   Структура файла (ищите по этим заголовкам через Ctrl+F):
   1. КОНФИГ И ДАННЫЕ УРОВНЕЙ   — сюда добавляются новые уровни
   2. ХРАНИЛИЩЕ ПРОГРЕССА       — localStorage
   3. ЗВУК                      — простые синтезированные эффекты
   4. GEM SPACE BRIDGE          — интеграция с мини-приложением
   5. УТИЛИТЫ                   — общие вспомогательные функции
   6. МЕНЕДЖЕР ЭКРАНОВ          — меню / карта / игра
   7. КАРТА УРОВНЕЙ             — рендер пути с уровнями
   8. ИГРОВОЙ ДВИЖОК (Board)    — вся логика match-3
   9. ИНИЦИАЛИЗАЦИЯ             — точка входа
   ============================================================= */


/* =============================================================
   1. КОНФИГ И ДАННЫЕ УРОВНЕЙ
   -------------------------------------------------------------
   Чтобы добавить новый уровень — достаточно добавить один
   объект в массив LEVELS. Никакой отдельной логики писать
   не нужно, движок универсален для любых целей из GOAL_TYPES.
   ============================================================= */

// Типы элементов поля. Чтобы добавить новый обычный элемент —
// достаточно дописать сюда запись с уникальным id.
const LANGUAGE_STORAGE_KEY = 'gardenRushLanguage_v1';
const TEXT = {
  ru: {
    welcomeTitle: 'Добро пожаловать в сад!',
    welcomeIntro: 'Давай соберём первый урожай вместе.',
    welcomeMatch: 'Меняй местами соседние фишки: собери 3 или больше одинаковых в ряд по горизонтали или вертикали.',
    welcomeControls: 'Перетащи фишку к соседней или нажми на обе по очереди.',
    welcomeGoal: 'Твоя первая цель — собрать {amount} яблок за {moves} ходов. Цель и оставшиеся ходы показаны над полем.',
    welcomeBonus: 'Собирай 4 и больше фишек, чтобы создавать усилители. Они помогут собрать урожай!',
    welcomeStart: 'Начнём!',
    howToPlay: 'Как играть',
    endlessTitle: 'Бесконечный сад',
    endlessRules: 'Начни с 20 ходов. За каждое задание получай +6 ходов. В запасе максимум 30 ходов. Поле и усилители сохраняются, задания постепенно усложняются.',
    endlessLocked: 'Пройди уровень 30, чтобы открыть бесконечный сад.',
    endlessStart: 'Начать забег', endlessResume: 'Продолжить забег',
    endlessStage: '∞ ЗАДАНИЕ {stage}', endlessAdvance: 'Задание выполнено! +{moves} ходов',
    endlessHud: 'Выполнено: {stages} · За задание +{reward} ходов',
    endlessSaved: 'Сохранено: задание {stage} · {moves} ходов · {score} очков',
    endlessBest: 'Рекорды: {stages} заданий · {score} очков',
    endlessEnd: 'Забег завершён!', endlessCompleted: 'Заданий выполнено',
    endlessRetry: 'Новый забег', endlessSaveHint: 'Прогресс сохраняется после каждого хода. Можно выйти на карту и продолжить позже.',
    description: 'Garden Rush — весёлая игра «три в ряд» про сад',
    sound: 'Звук', switchLanguage: 'Сменить язык на английский',
    menuSubtitle: 'Собери урожай в три ряда!', play: 'Играть', progress: 'Пройдено уровней: {completed} / {total}',
    mapHome: 'В меню', mapTitle: 'Карта сада', mapPages: 'Переключение участка карты', previousArea: 'Предыдущий участок', nextArea: 'Следующий участок', area: 'Участок {current} из {total}',
    back: 'Назад', moves: 'Ходы', score: 'Очки',
    winTitle: 'Уровень пройден!', points: 'Очки', movesLeft: 'Осталось ходов', next: 'Далее',
    loseTitle: 'Попробуй ещё!', loseText: 'Ходы закончились, цель не достигнута.', map: 'На карту', retry: 'Повторить',
    close: 'Закрыть', goals: 'Цели', playLevel: 'Играть',
    lockedLevel: 'Уровень {id}, закрыт', level: 'Уровень',
    lockedToast: 'Сначала пройди предыдущий уровень 🌿',
    allStars: 'Получены все 3 звезды!',
    nextStar2: '2 звезды — {score} итоговых очков',
    nextStar3: '3 звезды — {score} итоговых очков',
    starRules: '★ Победа · ★★ {second} · ★★★ {third}',
    moveBonusRule: '+{points} очков за каждый оставшийся ход',
    finaleTitle: 'Урожай собран!', finaleSkip: 'Нажми, чтобы перейти к результату',
    finaleSpecials: 'Срабатывают оставшиеся усилители', finaleMoves: 'Бонус за ходы: +{score}',
    baseScore: 'За игру', specialBonus: 'Финальные усилители', moveBonus: 'Ходы: {moves} × {points}',
    loseRemaining: 'До победы осталось:', loseCollect: 'Осталось {item}',
    loseRoots: 'Освободить от корней', loseIce: 'Растопить лёд', loseScore: 'Набрать очки',
    firstStar: '1 звезда — за прохождение уровня.',
    goalCollect: 'Собрать {amount} {items}', goalScore: 'Набрать {amount} очков',
    goalCageOne: 'Освободить {amount} фрукт от корней', goalCageMany: 'Освободить {amount} фруктов от корней',
    goalIceOne: 'Растопить лёд на {amount} фрукте', goalIceMany: 'Растопить лёд на {amount} фруктах',
    roots: 'Корни', ice: 'Лёд',
    introRocket: 'Используй ракеты, чтобы набрать очки быстрее!',
    tutorialRocket: 'Обменяй подсвеченные фишки и создай цветочную ракету.',
    tutorialPumpkin: 'Сделай подсвеченный ход и собери L-комбинацию для тыквы.',
    tutorialButterfly: 'Сдвинь фишку в подсвеченный квадрат, чтобы создать бабочку.',
    tutorialRainbow: 'Сделай подсвеченный ход и собери 5 фишек для радужного цветка.',
    tutorialCombo: 'Объедини ракету и тыкву одним ходом. Остальные ходы пока закрыты.',
    tutorialRoots: 'Комбинация рядом ослабит корни. Нужно два удара, чтобы освободить фрукт.',
    tutorialIce: 'Собери комбинацию с замороженным фруктом: лёд треснет, а фрукт останется на поле.',
    noMoves: 'Нет ходов — перемешиваем поле…', combo: 'КОМБО ×', newRecord: 'Новый рекорд!',
    bestRecord: 'Рекорд: {score} очков · запас {moves} ходов',
    waitMove: 'Дождитесь завершения хода', allLevels: 'Это все уровни на данный момент. Спасибо за игру! 🌻',
    gemAppleOne: 'яблоко', gemAppleMany: 'яблок', gemCornOne: 'кукурузина', gemCornMany: 'кукурузин',
    gemCucumberOne: 'огурец', gemCucumberMany: 'огурцов', gemBerryOne: 'ягода', gemBerryMany: 'ягод',
    gemEggplantOne: 'баклажан', gemEggplantMany: 'баклажанов',
    specialRocket: 'цветочная ракета', specialPumpkin: 'тыква', specialButterfly: 'бабочка', specialRainbow: 'радужный цветок',
    obstacleRoots: ', оплетён корнями: ещё {hits} удара', obstacleIce: ', заморожен',
  },
  en: {
    welcomeTitle: 'Welcome to the garden!',
    welcomeIntro: 'Let’s gather your first harvest together.',
    welcomeMatch: 'Swap neighboring tiles to match 3 or more of the same kind in a horizontal or vertical row.',
    welcomeControls: 'Drag a tile toward its neighbor, or tap the two tiles one after another.',
    welcomeGoal: 'Your first goal: collect {amount} apples in {moves} moves. Your goal and remaining moves are shown above the board.',
    welcomeBonus: 'Match 4 or more tiles to create power-ups. They will help you gather your harvest!',
    welcomeStart: 'Let’s go!',
    howToPlay: 'How to play',
    endlessTitle: 'Endless Garden',
    endlessRules: 'Start with 20 moves. Every task awards +6 moves. Keep up to 30 moves in reserve. Your board and power-ups stay as tasks get harder.',
    endlessLocked: 'Complete level 30 to unlock Endless Garden.',
    endlessStart: 'Start run', endlessResume: 'Continue run',
    endlessStage: '∞ TASK {stage}', endlessAdvance: 'Task complete! +{moves} moves',
    endlessHud: 'Completed: {stages} · +{reward} moves per task',
    endlessSaved: 'Saved: task {stage} · {moves} moves · {score} points',
    endlessBest: 'Records: {stages} tasks · {score} points',
    endlessEnd: 'Run complete!', endlessCompleted: 'Tasks completed',
    endlessRetry: 'New run', endlessSaveHint: 'Progress saves after every move. Return to the map and continue later.',
    description: 'Garden Rush — a cheerful garden match-3 game',
    sound: 'Sound', switchLanguage: 'Switch language to Russian',
    menuSubtitle: 'Match fruits and grow your harvest!', play: 'Play', progress: 'Levels completed: {completed} / {total}',
    mapHome: 'Main menu', mapTitle: 'Garden Map', mapPages: 'Map area navigation', previousArea: 'Previous area', nextArea: 'Next area', area: 'Area {current} of {total}',
    back: 'Back', moves: 'Moves', score: 'Score',
    winTitle: 'Level complete!', points: 'Points', movesLeft: 'Moves left', next: 'Continue',
    loseTitle: 'Try again!', loseText: 'Out of moves. Goal not reached.', map: 'Map', retry: 'Retry',
    close: 'Close', goals: 'Goals', playLevel: 'Play',
    lockedLevel: 'Level {id}, locked', level: 'Level',
    lockedToast: 'Complete the previous level first 🌿',
    allStars: 'You earned all 3 stars!',
    nextStar2: '2 stars: {score} total points',
    nextStar3: '3 stars: {score} total points',
    starRules: '★ Victory · ★★ {second} · ★★★ {third}',
    moveBonusRule: '+{points} points for each remaining move',
    finaleTitle: 'Harvest complete!', finaleSkip: 'Tap to see your result',
    finaleSpecials: 'Activating remaining power-ups', finaleMoves: 'Move bonus: +{score}',
    baseScore: 'During play', specialBonus: 'Final power-ups', moveBonus: 'Moves: {moves} × {points}',
    loseRemaining: 'Still needed to win:', loseCollect: 'Remaining {item}',
    loseRoots: 'Free from roots', loseIce: 'Melt ice', loseScore: 'Earn points',
    firstStar: 'Earn 1 star by completing the level.',
    goalCollect: 'Collect {amount} {items}', goalScore: 'Score {amount} points',
    goalCageOne: 'Free {amount} fruit from the roots', goalCageMany: 'Free {amount} fruits from the roots',
    goalIceOne: 'Melt the ice on {amount} fruit', goalIceMany: 'Melt the ice on {amount} fruits',
    roots: 'Roots', ice: 'Ice',
    introRocket: 'Use rockets to score more points!',
    tutorialRocket: 'Swap the highlighted tiles to create a flower rocket.',
    tutorialPumpkin: 'Make the highlighted move to form an L-shape and create a pumpkin.',
    tutorialButterfly: 'Move the tile into the highlighted square to create a butterfly.',
    tutorialRainbow: 'Make the highlighted move to match 5 tiles and create a rainbow flower.',
    tutorialCombo: 'Combine the rocket and pumpkin in one move. Other moves are locked for now.',
    tutorialRoots: 'Match next to the roots to weaken them. It takes two hits to free the fruit.',
    tutorialIce: 'Match next to the frozen fruit: the ice will crack, but the fruit will stay on the board.',
    noMoves: 'No moves available — shuffling…', combo: 'COMBO ×', newRecord: 'New record!',
    bestRecord: 'Best: {score} points · {moves} moves left',
    waitMove: 'Wait for the move to finish', allLevels: 'That’s all the levels for now. Thanks for playing! 🌻',
    gemAppleOne: 'apple', gemAppleMany: 'apples', gemCornOne: 'ear of corn', gemCornMany: 'ears of corn',
    gemCucumberOne: 'cucumber', gemCucumberMany: 'cucumbers', gemBerryOne: 'berry', gemBerryMany: 'berries',
    gemEggplantOne: 'eggplant', gemEggplantMany: 'eggplants',
    specialRocket: 'flower rocket', specialPumpkin: 'pumpkin', specialButterfly: 'butterfly', specialRainbow: 'rainbow flower',
    obstacleRoots: ', wrapped in roots: {hits} hits left', obstacleIce: ', frozen',
  },
};

function getInitialLanguage() {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === 'ru' || saved === 'en') return saved;
  } catch (e) {}
  return /^en(?:-|$)/i.test((navigator.language || '').toLowerCase()) ? 'en' : 'ru';
}

let currentLanguage = getInitialLanguage();

function t(key, values = {}) {
  const template = TEXT[currentLanguage][key] || TEXT.ru[key] || key;
  return template.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
}

function formatNumber(value) {
  return Number(value).toLocaleString(currentLanguage === 'en' ? 'en-US' : 'ru-RU');
}

function levelTitle(id) { return `${t('level')} ${id}`; }

function gemName(gem, amount = 2) {
  const key = `gem${gem[0].toUpperCase()}${gem.slice(1)}${amount === 1 ? 'One' : 'Many'}`;
  return t(key);
}

function specialName(special) {
  const keys = { 'rocket-row': 'specialRocket', 'rocket-col': 'specialRocket', pumpkin: 'specialPumpkin', butterfly: 'specialButterfly', rainbow: 'specialRainbow' };
  return t(keys[special] || 'specialRocket');
}

const GEM_TYPES = {
  apple:    { id: 'apple',    emoji: '🍎', name: 'яблоко',   namePlural: 'яблок'      },
  corn:     { id: 'corn',     emoji: '🌽', name: 'кукуруза', namePlural: 'кукурузин'  },
  cucumber: { id: 'cucumber', emoji: '🥒', name: 'огурец',   namePlural: 'огурцов'    },
  berry:    { id: 'berry',    emoji: '🫐', name: 'ягода',    namePlural: 'ягод'       },
  eggplant: { id: 'eggplant', emoji: '🍆', name: 'баклажан', namePlural: 'баклажанов' },
};
const GEM_IDS = Object.keys(GEM_TYPES);

// Цвета искр при уничтожении — совпадают с цветами элементов в style.css
const SPARKLE_COLORS = {
  apple: '#f4483d',
  corn: '#ffc93c',
  cucumber: '#5fbf52',
  berry: '#4a90e2',
  eggplant: '#a24fc4',
};

const FLOWER_ROCKET_IMAGE = 'assets/gems/flower-rocket.png';
const SPECIAL_IMAGES = {
  'rocket-row': FLOWER_ROCKET_IMAGE,
  'rocket-col': FLOWER_ROCKET_IMAGE,
  pumpkin: 'assets/gems/pumpkin.png',
  butterfly: 'assets/gems/butterfly.png',
  rainbow: 'assets/gems/rainbow-flower.png',
};
const SPECIAL_NAMES = {
  'rocket-row': 'цветочная ракета',
  'rocket-col': 'цветочная ракета',
  pumpkin: 'тыква',
  butterfly: 'бабочка',
  rainbow: 'радужный цветок',
};

const BOARD_SIZE = 8;
// Базовые очки за один собранный элемент в рамках хода игрока.
// Множитель каскада (см. resolveCascade/cascadeLevel) даёт прогрессию
// 50 -> 100 -> 150 -> 200 ... за каждую следующую автоматическую
// комбинацию, образовавшуюся от падения элементов за один ход.
const POINTS_PER_GEM = 50;
const POINTS_PER_UNUSED_MOVE = 125;
// Верхний предел множителя каскада за один ход игрока. Без ограничения
// очень длинная цепочка каскадов от одного свайпа (особенно после ракеты)
// могла бы дать тысячи очков за один ход — с потолком прогрессия всё ещё
// ощущается (50→100→150→200→250), но не даёт проходить уровень "очки"
// за 2-3 хода.
const MAX_CASCADE_MULTIPLIER = 5;

// Описание целей уровня. type: 'collect' (собрать N элементов
// определённого вида) или 'score' (набрать N очков).
// При добавлении новых типов целей — расширьте:
//  - функцию goalProgressText() и isGoalComplete() в разделе HUD,
//  - обработчик регистрации прогресса в Board.registerClearedGems().
// Форма поля уровня: 8 строк по 8 символов, '1' — игровая клетка,
// '0' — клетка вне поля (её нет ни физически, ни в геймплее).
// Внутренние вырезы тоже поддерживаются (см. уровень 4 и 5) — гравитация
// и генерация корректно обрабатывают "отдельные острова" в столбце.
const SHAPES = {
  // Скруглённые углы — просторное поле для обучающего уровня.
  rounded: [
    '00111100',
    '01111110',
    '11111111',
    '11111111',
    '11111111',
    '11111111',
    '01111110',
    '00111100',
  ],
  // Ромб — уже, вводит первую специальную механику на более компактном поле.
  diamond: [
    '00011000',
    '00111100',
    '01111110',
    '11111111',
    '11111111',
    '01111110',
    '00111100',
    '00011000',
  ],
  // Песочные часы — широкие верх/низ, узкая перемычка посередине.
  hourglass: [
    '11111111',
    '11111111',
    '01111110',
    '00111100',
    '00111100',
    '01111110',
    '11111111',
    '11111111',
  ],
  // Кольцо — с вырезом 2×2 прямо в центре поля.
  ring: [
    '00111100',
    '01111110',
    '11111111',
    '11100111',
    '11100111',
    '11111111',
    '01111110',
    '00111100',
  ],
  // Цветок — несколько симметричных вырезов, самое "дырявое" поле.
  flower: [
    '00111100',
    '01100110',
    '11111111',
    '10111101',
    '10111101',
    '11111111',
    '01100110',
    '00111100',
  ],
  // Пирамида — сужается к низу, узкий "хвост" из 2 колонок внизу.
  pyramid: [
    '11111111',
    '11111111',
    '01111110',
    '01111110',
    '00111100',
    '00111100',
    '00011000',
    '00011000',
  ],
  // Крест — плоские "плечи" сверху и снизу, широкая перекладина в центре.
  cross: [
    '00111100',
    '00111100',
    '11111111',
    '11111111',
    '11111111',
    '11111111',
    '00111100',
    '00111100',
  ],
  // Большое кольцо — вырез 4×4 в центре, самая крупная внутренняя дыра.
  bigring: [
    '01111110',
    '11111111',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11111111',
    '01111110',
  ],
  // Стрела/флаг — узкий заострённый верх, широкое "древко" вниз.
  arrow: [
    '00011000',
    '00111100',
    '01111110',
    '01111110',
    '01111110',
    '01111110',
    '01111110',
    '01111110',
  ],
  // Открытое поле — самое просторное, с россыпью мелких вырезов для финала.
  openfield: [
    '11111111',
    '10111101',
    '11111111',
    '11100111',
    '11100111',
    '11111111',
    '10111101',
    '11111111',
  ],
};

const LEVELS = [
  {
    id: 1,
    title: 'Уровень 1',
    moves: 20,
    goals: [{ type: 'collect', gem: 'apple', amount: 14 }],
    intro: null,
    starThresholds: [900, 1500, 2200],
    shape: SHAPES.rounded,
  },
  {
    id: 2,
    title: 'Уровень 2',
    moves: 22,
    goals: [{ type: 'collect', gem: 'corn', amount: 14 }],
    intro: null,
    starThresholds: [900, 1500, 2200],
    shape: SHAPES.diamond,
  },
  {
    id: 3,
    title: 'Уровень 3',
    moves: 26,
    goals: [{ type: 'score', amount: 6000 }],
    introKey: 'introRocket',
    starThresholds: [3000, 4500, 6000],
    shape: SHAPES.hourglass,
  },
  {
    id: 4,
    title: 'Уровень 4',
    moves: 25,
    goals: [
      { type: 'collect', gem: 'apple', amount: 16 },
      { type: 'collect', gem: 'berry', amount: 16 },
    ],
    intro: null,
    starThresholds: [1000, 1700, 2500],
    shape: SHAPES.ring,
  },
  {
    id: 5,
    title: 'Уровень 5',
    moves: 26,
    goals: [{ type: 'score', amount: 6000 }],
    intro: null,
    starThresholds: [3000, 4500, 6000],
    shape: SHAPES.flower,
  },
  {
    id: 6,
    title: 'Уровень 6',
    moves: 22,
    goals: [{ type: 'collect', gem: 'cucumber', amount: 14 }],
    intro: null,
    starThresholds: [900, 1500, 2200],
    shape: SHAPES.pyramid,
  },
  {
    id: 7,
    title: 'Уровень 7',
    moves: 27,
    goals: [
      { type: 'collect', gem: 'cucumber', amount: 18 },
      { type: 'collect', gem: 'eggplant', amount: 18 },
    ],
    intro: null,
    starThresholds: [1100, 1900, 2700],
    shape: SHAPES.cross,
  },
  {
    id: 8,
    title: 'Уровень 8',
    moves: 30,
    goals: [{ type: 'score', amount: 5000 }],
    intro: null,
    starThresholds: [2500, 3750, 5000],
    shape: SHAPES.bigring,
  },
  {
    id: 9,
    title: 'Уровень 9',
    moves: 28,
    goals: [
      { type: 'collect', gem: 'apple', amount: 13 },
      { type: 'collect', gem: 'corn', amount: 13 },
      { type: 'collect', gem: 'berry', amount: 13 },
    ],
    intro: null,
    starThresholds: [1600, 2600, 3600],
    shape: SHAPES.arrow,
  },
  {
    id: 10,
    title: 'Уровень 10',
    moves: 30,
    goals: [
      { type: 'collect', gem: 'eggplant', amount: 16 },
      { type: 'score', amount: 6500 },
    ],
    intro: null,
    starThresholds: [3250, 5000, 6500],
    shape: SHAPES.openfield,
  },
  {
    id: 11,
    title: 'Уровень 11',
    moves: 30,
    goals: [{ type: 'cage', amount: 3 }],
    obstacles: { cages: [[2, 3], [5, 1], [5, 6]] },
    intro: null,
    starThresholds: [2500, 4200, 6000],
    shape: SHAPES.rounded,
  },
  {
    id: 12,
    title: 'Уровень 12',
    moves: 28,
    goals: [{ type: 'score', amount: 8000 }],
    intro: null,
    starThresholds: [3800, 5900, 8000],
    shape: SHAPES.hourglass,
  },
  {
    id: 13,
    title: 'Уровень 13',
    moves: 26,
    goals: [{ type: 'cage', amount: 4 }],
    obstacles: { cages: [[1, 3, 3], [4, 2], [6, 4], [3, 4]] },
    intro: null,
    starThresholds: [2500, 4000, 6000],
    shape: SHAPES.diamond,
  },
  {
    id: 14,
    title: 'Уровень 14',
    moves: 31,
    goals: [
      { type: 'collect', gem: 'apple', amount: 24 },
      { type: 'score', amount: 5000 },
    ],
    intro: null,
    starThresholds: [3200, 5000, 7000],
    shape: SHAPES.ring,
  },
  {
    id: 15,
    title: 'Уровень 15',
    moves: 30,
    goals: [{ type: 'ice', amount: 3 }],
    obstacles: { ice: [[3, 3], [2, 7], [5, 0]] },
    intro: null,
    starThresholds: [3500, 5500, 7500],
    shape: SHAPES.flower,
  },
  {
    id: 16,
    title: 'Уровень 16',
    moves: 31,
    goals: [
      { type: 'collect', gem: 'cucumber', amount: 21 },
      { type: 'score', amount: 7800 },
    ],
    intro: null,
    starThresholds: [3900, 5850, 7800],
    shape: SHAPES.pyramid,
  },
  {
    id: 17,
    title: 'Уровень 17',
    moves: 29,
    goals: [
      { type: 'cage', amount: 3 },
      { type: 'ice', amount: 2 },
    ],
    obstacles: { cages: [[2, 2, 3], [2, 5], [5, 5]], ice: [[4, 3], [1, 3]] },
    intro: null,
    starThresholds: [4600, 6900, 9200],
    shape: SHAPES.cross,
  },
  {
    id: 18,
    title: 'Уровень 18',
    moves: 32,
    goals: [
      { type: 'collect', gem: 'apple', amount: 16 },
      { type: 'collect', gem: 'corn', amount: 16 },
      { type: 'collect', gem: 'eggplant', amount: 16 },
    ],
    intro: null,
    starThresholds: [4000, 6000, 8000],
    shape: SHAPES.bigring,
  },
  {
    id: 19,
    title: 'Уровень 19',
    moves: 32,
    goals: [
      { type: 'cage', amount: 4 },
      { type: 'ice', amount: 3 },
    ],
    obstacles: { cages: [[1, 2, 3], [4, 5], [6, 4, 3], [3, 2]], ice: [[2, 5], [5, 3], [6, 1]] },
    intro: null,
    starThresholds: [4000, 6000, 8000],
    shape: SHAPES.arrow,
  },
  {
    id: 20,
    title: 'Уровень 20',
    moves: 35,
    goals: [
      { type: 'collect', gem: 'eggplant', amount: 21 },
      { type: 'score', amount: 8700 },
    ],
    intro: null,
    starThresholds: [4350, 6500, 8700],
    shape: SHAPES.openfield,
  },
  {
    id: 21,
    title: 'Уровень 21',
    moves: 30,
    goals: [{ type: 'cage', amount: 5 }],
    obstacles: { cages: [[1, 2, 3], [2, 5], [4, 1, 3], [5, 5], [6, 3]] },
    intro: null,
    starThresholds: [3000, 4700, 6500],
    shape: SHAPES.rounded,
  },
  {
    id: 22,
    title: 'Уровень 22',
    moves: 31,
    goals: [{ type: 'score', amount: 9500 }],
    intro: null,
    starThresholds: [4800, 7200, 9500],
    shape: SHAPES.hourglass,
  },
  {
    id: 23,
    title: 'Уровень 23',
    moves: 29,
    goals: [{ type: 'ice', amount: 5 }],
    obstacles: { ice: [[1, 2], [2, 5], [3, 1], [5, 6], [6, 3]] },
    intro: null,
    starThresholds: [3200, 5000, 6800],
    shape: SHAPES.diamond,
  },
  {
    id: 24,
    title: 'Уровень 24',
    moves: 32,
    goals: [
      { type: 'collect', gem: 'apple', amount: 22 },
      { type: 'collect', gem: 'corn', amount: 22 },
    ],
    intro: null,
    starThresholds: [4000, 6100, 8200],
    shape: SHAPES.ring,
  },
  {
    id: 25,
    title: 'Уровень 25',
    moves: 32,
    goals: [
      { type: 'cage', amount: 5 },
      { type: 'ice', amount: 3 },
    ],
    obstacles: {
      cages: [[1, 2, 3], [2, 5], [4, 2], [5, 6, 3], [6, 2]],
      ice: [[2, 2], [3, 5], [5, 2]],
    },
    intro: null,
    starThresholds: [4000, 6200, 8400],
    shape: SHAPES.flower,
  },
  {
    id: 26,
    title: 'Уровень 26',
    moves: 33,
    goals: [{ type: 'score', amount: 10500 }],
    intro: null,
    starThresholds: [5300, 7900, 10500],
    shape: SHAPES.pyramid,
  },
  {
    id: 27,
    title: 'Уровень 27',
    moves: 31,
    goals: [{ type: 'cage', amount: 6 }],
    obstacles: { cages: [[1, 2, 3], [2, 5, 3], [3, 1], [4, 6], [5, 3, 3], [6, 5]] },
    intro: null,
    starThresholds: [3800, 5900, 8000],
    shape: SHAPES.cross,
  },
  {
    id: 28,
    title: 'Уровень 28',
    moves: 34,
    goals: [
      { type: 'collect', gem: 'berry', amount: 24 },
      { type: 'collect', gem: 'eggplant', amount: 24 },
      { type: 'score', amount: 10000 },
    ],
    intro: null,
    starThresholds: [5000, 7500, 10000],
    shape: SHAPES.bigring,
  },
  {
    id: 29,
    title: 'Уровень 29',
    moves: 34,
    goals: [
      { type: 'cage', amount: 6 },
      { type: 'ice', amount: 5 },
    ],
    obstacles: {
      cages: [[1, 2, 3], [2, 5], [3, 1, 3], [4, 6], [5, 3, 3], [6, 5]],
      ice: [[1, 5], [2, 2], [3, 6], [5, 1], [6, 3]],
    },
    intro: null,
    starThresholds: [5000, 7600, 10200],
    shape: SHAPES.arrow,
  },
  {
    id: 30,
    title: 'Уровень 30',
    moves: 35,
    goals: [
      { type: 'collect', gem: 'cucumber', amount: 24 },
      { type: 'collect', gem: 'eggplant', amount: 24 },
      { type: 'score', amount: 12000 },
    ],
    intro: null,
    starThresholds: [6000, 9000, 12000],
    shape: SHAPES.openfield,
  },
];

// Старые пороги нужны только для восстановления звёзд из сохранений,
// созданных до появления bestStars. Перебалансировка не отнимает награды.
const LEGACY_STAR_THRESHOLDS = new Map(LEVELS.map((level) => [level.id, [...level.starThresholds]]));

// Третья звезда теперь учитывает финальные бонусы: запас относительно
// прежнего порога + полный бюджет бонуса за ходы, с округлением до 500.
// База 100 фиксирует уже настроенные пороги независимо от текущего бонуса.
LEVELS.forEach((level) => {
  level.starThresholds[2] = Math.ceil(
    (level.starThresholds[2] * 1.5 + level.moves * 100) / 500
  ) * 500;
  // Небольшое облегчение финального участка после расчёта порогов звёзд.
  if (level.id >= 25 && level.id <= 30) level.moves += 2;
});

// Позиции узлов карты (% от ширины/высоты фонового изображения map-bg.jpg) —
// подобраны вручную под конкретную нарисованную тропинку на этой картинке.
// Для каждого участка карты задаются отдельные координаты ниже.

const MAP_NODE_POSITIONS = [
  { left: 55.6, top: 91.5 },
  { left: 69.1, top: 83.0 },
  { left: 48.4, top: 74.5 },
  { left: 72.8, top: 62.2 },
  { left: 62.9, top: 53.9 },
  { left: 44.0, top: 48.5 },
  { left: 71.7, top: 37.0 },
  { left: 45.9, top: 26.4 },
  { left: 64.9, top: 19.6 },
  { left: 34.4, top: 14.0 },
];
const MAP_PAGE_NODE_POSITIONS = [
  { left: 52.76, top: 89.18 }, // 11 — нижняя отметка на ступенях у входа
  { left: 67.22, top: 74.76 }, // 12 — дорожка после правой лестницы
  { left: 78.05, top: 68.48 }, // 13 — правая лестница
  { left: 70.97, top: 59.99 }, // 14 — площадка у моста
  { left: 44.85, top: 50.18 }, // 15 — нижний левый изгиб тропы
  { left: 40.75, top: 44.20 }, // 16 — верхний левый изгиб тропы
  { left: 63.71, top: 38.46 }, // 17 — центральная дорожка
  { left: 52.34, top: 28.56 }, // 18 — левый поворот наверху
  { left: 67.22, top: 22.73 }, // 19 — верхняя дорожка
  { left: 80.82, top: 14.86 }, // 20 — лестница у домика
];
const MAP_PAGE_3_NODE_POSITIONS = [
  { left: 43.36, top: 88.28 }, // 21 — нижняя тропа у входа
  { left: 53.24, top: 74.88 }, // 22 — ступени
  { left: 37.51, top: 66.87 }, // 23 — широкий поворот тропы
  { left: 27.63, top: 59.75 }, // 24 — ступени у огорода
  { left: 69.61, top: 41.81 }, // 25 — тропа у ущелья
  { left: 42.72, top: 38.46 }, // 26 — центральная дорожка
  { left: 22.74, top: 33.25 }, // 27 — левый поворот
  { left: 37.62, top: 28.47 }, // 28 — верхняя дорожка
  { left: 22.42, top: 18.30 }, // 29 — тропа у руин
  { left: 35.18, top: 13.46 }, // 30 — лестница у каменной арки
];
let currentMapPage = 0;

const MAP_PAGE_BACKGROUNDS = [
  'assets/backgrounds/map-bg.jpg',
  'assets/backgrounds/map-bg-2.jpg',
  'assets/backgrounds/map-bg-3.jpg',
];

function validateGameConfig() {
  const errors = [];
  const ids = new Set();
  LEVELS.forEach((level, index) => {
    if (!Number.isInteger(level.id) || level.id !== index + 1 || ids.has(level.id)) errors.push(`Некорректный/повторный id уровня ${level.id}`);
    ids.add(level.id);
    if (!Number.isInteger(level.moves) || level.moves <= 0) errors.push(`Некорректное число ходов: уровень ${level.id}`);
    if (!Array.isArray(level.shape) || level.shape.length !== BOARD_SIZE || level.shape.some((row) => typeof row !== 'string' || row.length !== BOARD_SIZE || /[^01]/.test(row))) errors.push(`Некорректная форма поля: уровень ${level.id}`);
    if (!Array.isArray(level.starThresholds) || level.starThresholds.length !== 3 || level.starThresholds.some((value, i, arr) => !Number.isFinite(value) || value <= 0 || (i > 0 && value <= arr[i - 1]))) errors.push(`Некорректные пороги звёзд: уровень ${level.id}`);
    if (!Array.isArray(level.goals) || level.goals.length === 0) errors.push(`Нет целей: уровень ${level.id}`);
    (level.goals || []).forEach((goal) => {
      if (goal.type === 'collect' && !GEM_TYPES[goal.gem]) errors.push(`Неизвестный элемент в цели уровня ${level.id}: ${goal.gem}`);
      else if (!['collect', 'score', 'cage', 'ice'].includes(goal.type)) errors.push(`Неизвестный тип цели уровня ${level.id}: ${goal.type}`);
      if (!Number.isFinite(goal.amount) || goal.amount <= 0) errors.push(`Некорректное значение цели уровня ${level.id}`);
    });
  });
  if (errors.length) console.error('Ошибки конфигурации Garden Rush:', errors);
  return errors.length === 0;
}
// Первая звезда — за победу; остальные — только за итоговый счёт,
// включая финальные усилители и бонус за неиспользованные ходы.
function starsForResult(level, score) {
  if (score >= level.starThresholds[2]) return 3;
  if (score >= level.starThresholds[1]) return 2;
  return 1;
}

function legacyStarsForScore(level, score) {
  const thresholds = LEGACY_STAR_THRESHOLDS.get(level.id) || level.starThresholds;
  return thresholds.reduce((stars, threshold) => stars + (score >= threshold ? 1 : 0), 0);
}

function nextStarDescription(level, stars) {
  if (stars >= 3) return t('allStars');
  if (stars === 2) return t('nextStar3', { score: formatNumber(level.starThresholds[2]) });
  return t('nextStar2', { score: formatNumber(level.starThresholds[1]) });
}

function starRulesDescription(level) {
  return t('starRules', { second: formatNumber(level.starThresholds[1]), third: formatNumber(level.starThresholds[2]) });
}


/* =============================================================
   2. ХРАНИЛИЩЕ ПРОГРЕССА (localStorage, без сервера/регистрации)
   ============================================================= */

const STORAGE_KEY = 'gardenRushSave_v1';

function defaultProgress() {
  return { unlockedLevel: 1, bestScore: {}, bestStars: {}, bestMoves: {}, soundOn: true,
    endlessRun: null, endlessBestScore: 0, endlessBestStages: 0, lastMapPage: 0, welcomeSeen: false };
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw);
    const loaded = Object.assign(defaultProgress(), parsed);
    // У старых сохранений нет страницы: открываем участок текущего уровня.
    const latestLevel = Math.max(1, Math.min(LEVELS.length, Number(loaded.unlockedLevel) || 1));
    loaded.lastMapPage = normalizeMapPage(Number.isInteger(parsed.lastMapPage)
      ? parsed.lastMapPage : Math.floor((latestLevel - 1) / MAP_NODE_POSITIONS.length));
    // Сохраняем видимые звёзды для старых сохранений, где рейтинг считался по очкам.
    LEVELS.forEach((level) => {
      if (level.id >= loaded.unlockedLevel || Object.prototype.hasOwnProperty.call(loaded.bestStars, level.id)) return;
      const oldScore = Number(loaded.bestScore[level.id]) || 0;
      loaded.bestStars[level.id] = Math.max(1, legacyStarsForScore(level, oldScore));
    });
    return loaded;
  } catch (e) {
    console.warn('Не удалось прочитать сохранение, использую значения по умолчанию', e);
    return defaultProgress();
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Не удалось сохранить прогресс', e);
  }
}

let progress = loadProgress();
currentMapPage = progress.lastMapPage;


/* =============================================================
   3. ЗВУК
   -------------------------------------------------------------
   Локальные WAV-файлы проигрываются через HTMLAudioElement.
   ============================================================= */

const SOUND_FILES = {
  tap: [
    'assets/sounds/tap.wav',
    'assets/sounds/tap-soft.wav',
    'assets/sounds/tap-wood.wav',
    'assets/sounds/tap-glass.wav',
  ],
  menuStart: 'assets/sounds/menu-start.wav',
  swap: 'assets/sounds/swap.wav',
  invalid: 'assets/sounds/invalid.wav',
  match: 'assets/sounds/match.wav',
  destroy: 'assets/sounds/destroy.wav',
  rocketCreate: 'assets/sounds/rocket-create.wav',
  rocketUse: 'assets/sounds/rocket-use.wav',
  win: 'assets/sounds/win.wav',
  lose: 'assets/sounds/lose.wav',
};

const SOUND_VOLUMES = {
  tap: 0.28, swap: 0.42, invalid: 0.42, match: 0.62, destroy: 0.34,
  menuStart: 0.58, rocketCreate: 0.62, rocketUse: 0.58, win: 0.65, lose: 0.52,
};

const Sound = {
  on: true,
  pools: {},
  nextIndex: {},

  init() {
    Object.entries(SOUND_FILES).forEach(([name, src]) => {
      const sources = Array.isArray(src) ? src : [src];
      const poolSize = Array.isArray(src) ? sources.length : (name === 'destroy' ? 4 : 2);
      this.pools[name] = Array.from({ length: poolSize }, (_, index) => {
        const audio = new Audio(sources[index % sources.length]);
        audio.preload = 'auto';
        audio.volume = SOUND_VOLUMES[name];
        return audio;
      });
      this.nextIndex[name] = 0;
    });
  },

  play(name) {
    if (!this.on) return;
    const pool = this.pools[name];
    if (!pool || pool.length === 0) return;
    const index = this.nextIndex[name] % pool.length;
    const audio = pool[index];
    this.nextIndex[name] = (index + 1) % pool.length;
    audio.pause();
    try { audio.currentTime = 0; } catch (e) {}
    const playback = audio.play();
    if (playback && typeof playback.catch === 'function') playback.catch(() => {});
  },

  setOn(value) {
    this.on = value;
    if (!value) Object.values(this.pools).forEach((pool) => pool.forEach((audio) => audio.pause()));
    progress.soundOn = value;
    saveProgress(progress);
    updateSoundButtons();
  },

  toggle() {
    const enabling = !this.on;
    this.setOn(enabling);
    if (enabling) this.play('tap');
  },
};
Sound.on = progress.soundOn;


/* =============================================================
   4. GEM SPACE BRIDGE
   ============================================================= */

let appShellReady = false;
let bridgeReadyStarted = false;

async function initGemSpaceBridge() {
  const app = window.GemSpaceBridge?.bridge?.app;
  if (!appShellReady || bridgeReadyStarted || typeof app?.ready !== 'function') return;
  bridgeReadyStarted = true;
  try {
      await app.ready();
      console.log('Gem Space Bridge: приложение готово');
  } catch (e) {
    console.warn('Gem Space Bridge: не удалось вызвать app.ready()', e);
  }
}


/* =============================================================
   5. УТИЛИТЫ
   ============================================================= */

function $(id) { return document.getElementById(id); }
function randomInt(max) { return Math.floor(Math.random() * max); }
function randomGem() { return GEM_IDS[randomInt(GEM_IDS.length)]; }
function delay(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

function updateLanguageButtons() {
  const label = currentLanguage === 'ru' ? 'EN' : 'RU';
  ['btn-language-menu', 'btn-language-map', 'btn-language-game'].forEach((id) => {
    const button = $(id);
    if (!button) return;
    button.textContent = label;
    button.setAttribute('aria-label', t('switchLanguage'));
    button.title = t('switchLanguage');
  });
}

function tutorialPromptKey(levelId) {
  return ({ 2: 'tutorialRocket', 4: 'tutorialPumpkin', 6: 'tutorialButterfly', 8: 'tutorialRainbow', 10: 'tutorialCombo', 11: 'tutorialRoots', 15: 'tutorialIce' })[levelId];
}

function cellAriaLabel(cell) {
  const obstacleName = cell.cageHits > 0
    ? t('obstacleRoots', { hits: cell.cageHits })
    : (cell.iceHits > 0 ? t('obstacleIce') : '');
  const fruitName = gemName(cell.type, 1);
  return cell.special ? `${fruitName}, ${specialName(cell.special)}${obstacleName}` : `${fruitName}${obstacleName}`;
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage;
  document.title = 'Garden Rush';
  const description = $('page-description');
  if (description) description.content = t('description');
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((element) => {
    element.setAttribute('aria-label', t(element.dataset.i18nAria));
  });
  document.querySelectorAll('[data-i18n-title]').forEach((element) => {
    element.title = t(element.dataset.i18nTitle);
  });
  updateLanguageButtons();
  updateMenuProgress();

  if ($('screen-map').classList.contains('active')) renderLevelMap();
  if (pendingLevelId != null && !$('modal-level-info').classList.contains('hidden')) openLevelInfo(pendingLevelId);
  if (Board.level && $('screen-game').classList.contains('active')) {
    Board.renderHud();
    Board.grid.forEach((row) => row.forEach((cell) => {
      if (cell.el) cell.el.setAttribute('aria-label', cellAriaLabel(cell));
    }));
    if (Board.tutorialMove && Board.tutorialMove.active) {
      Board.tutorialMove.prompt = t(tutorialPromptKey(Board.level.id));
      $('tutorial-hint').textContent = Board.tutorialMove.prompt;
    }
    if (Board.outcome === 'lost') Board.renderLoseSummary();
    if (Board.victoryResult && Board.victoryResult.presented) Board.renderWinSummary();
  }
  if (!$('modal-endless-info').classList.contains('hidden')) Endless.renderInfo();
  if (!$('modal-endless-result').classList.contains('hidden')) Endless.renderResult();
}

function setLanguage(language) {
  if (!TEXT[language] || currentLanguage === language) return;
  currentLanguage = language;
  try { localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage); } catch (e) {}
  applyLanguage();
}

let toastTimer = null;
function showToast(text, duration = 2600) {
  const el = $('toast');
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), duration);
}

// Конфетти при победе — разлетающиеся цветные прямоугольники, падающие
// вниз с вращением. Чисто декоративно, pointer-events отключены, чтобы
// не мешать нажатию кнопок модалки.
const CONFETTI_COLORS = ['#ff7fa1', '#ffc93c', '#5fbf52', '#4a90e2', '#a24fc4', '#f4483d'];
function spawnConfetti(container, count = 26) {
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    piece.style.animationDelay = (Math.random() * 0.35).toFixed(2) + 's';
    piece.style.setProperty('--rot', Math.round(Math.random() * 360 - 180) + 'deg');
    piece.style.setProperty('--drift', Math.round(Math.random() * 70 - 35) + 'px');
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 2300);
  }
}

function updateSoundButtons() {
  const icon = Sound.on ? '🔊' : '🔇';
  ['btn-sound-menu', 'btn-sound-map', 'btn-sound-game'].forEach((id) => {
    const btn = $(id);
    if (btn) btn.textContent = icon;
  });
}


/* =============================================================
   6. МЕНЕДЖЕР ЭКРАНОВ
   ============================================================= */

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  $(id).classList.add('active');
}

function updateMenuProgress() {
  const completed = Math.min(progress.unlockedLevel - 1, LEVELS.length);
  $('menu-progress').textContent = t('progress', { completed, total: LEVELS.length });
}


/* =============================================================
   7. КАРТА УРОВНЕЙ
   ============================================================= */

function fitLevelMap() {
  const viewport = $('map-viewport');
  const container = $('map-path');
  if (!viewport || !container || viewport.clientWidth <= 0 || viewport.clientHeight <= 0) return;
  const scale = Math.min(viewport.clientWidth / 941, viewport.clientHeight / 1672);
  container.style.width = `${941 * scale}px`;
  container.style.height = `${1672 * scale}px`;
  container.style.setProperty('--map-node-size', `${Math.max(36, Math.min(46, 941 * scale * 0.13))}px`);
}

function normalizeMapPage(page) {
  const lastPage = Math.max(0, Math.ceil(LEVELS.length / MAP_NODE_POSITIONS.length) - 1);
  return Math.max(0, Math.min(lastPage, Number.isInteger(page) ? page : 0));
}

function rememberMapPage(page) {
  currentMapPage = normalizeMapPage(page);
  if (progress.lastMapPage !== currentMapPage) {
    progress.lastMapPage = currentMapPage;
    saveProgress(progress);
  }
}

function setMapPage(page) {
  rememberMapPage(page);
  renderLevelMap();
  fitLevelMap();
}

function renderLevelMap() {
  const container = $('map-path');
  container.innerHTML = '';
  const pageSize = MAP_NODE_POSITIONS.length;
  const mapPages = Math.max(1, Math.ceil(LEVELS.length / pageSize));
  rememberMapPage(currentMapPage);
  const background = MAP_PAGE_BACKGROUNDS[currentMapPage] || MAP_PAGE_BACKGROUNDS[MAP_PAGE_BACKGROUNDS.length - 1];
  $('map-page-label').textContent = t('area', { current: currentMapPage + 1, total: mapPages });
  $('btn-map-prev').disabled = currentMapPage === 0;
  $('btn-map-next').disabled = currentMapPage >= mapPages - 1;

  if (window.GardenLoader?.has && !window.GardenLoader.has(background)) {
    container.style.backgroundImage = 'none';
    const notice = document.createElement('button');
    notice.className = 'map-loading-notice';
    notice.disabled = true;
    notice.textContent = currentLanguage === 'en' ? 'Loading the garden…' : 'Загружаем сад…';
    container.appendChild(notice);
    const page = currentMapPage;
    window.GardenLoader.ensure(background).then(() => {
      if (currentMapPage === page && notice.parentNode === container) renderLevelMap();
    }).catch(() => {
      if (currentMapPage !== page || notice.parentNode !== container) return;
      notice.disabled = false;
      notice.textContent = currentLanguage === 'en' ? 'Could not load. Retry' : 'Не удалось загрузить. Повторить';
      notice.onclick = () => renderLevelMap();
    });
    return;
  }
  container.style.backgroundImage = `url('${background}')`;

  LEVELS.forEach((level, index) => {
    const page = Math.floor(index / pageSize);
    if (page !== currentMapPage) return;
    const pageIndex = index % pageSize;
    const positions = [MAP_NODE_POSITIONS, MAP_PAGE_NODE_POSITIONS, MAP_PAGE_3_NODE_POSITIONS][page] || MAP_PAGE_3_NODE_POSITIONS;
    const pos = positions[pageIndex];
    const node = document.createElement('button');
    const locked = level.id > progress.unlockedLevel;
    const completed = level.id < progress.unlockedLevel;

    node.className = 'level-node' + (locked ? ' locked' : '');
    node.setAttribute('aria-label', locked ? t('lockedLevel', { id: level.id }) : levelTitle(level.id));
    node.setAttribute('aria-disabled', String(locked));
    node.style.left = pos.left + '%';
    node.style.top = pos.top + '%';
    node.innerHTML = locked ? '🔒' : String(level.id);

    if (completed) {
      const earnedStars = progress.bestStars[level.id] || 0;
      const star = document.createElement('span');
      star.className = 'level-star';
      star.textContent = '⭐'.repeat(earnedStars) + '☆'.repeat(3 - earnedStars);
      node.appendChild(star);
    }

    node.addEventListener('click', () => {
      if (locked) {
        Sound.play('invalid');
        showToast(t('lockedToast'));
        return;
      }
      Sound.play('tap');
      openLevelInfo(level.id);
    });

    container.appendChild(node);
  });
  // Правый конец подвесного моста на третьем участке карты.
  if (currentMapPage === 2) {
    const endless = document.createElement('button');
    endless.id = 'btn-endless-mode';
    endless.type = 'button';
    endless.className = 'level-node endless-node';
    endless.style.left = '87%';
    endless.style.top = '24.8%';
    endless.innerHTML = '<svg class="endless-node-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M16 16C12 9 4 9 4 16S12 23 16 16S28 9 28 16S20 23 16 16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    endless.setAttribute('aria-label', t('endlessTitle'));
    endless.title = t('endlessTitle');
    endless.addEventListener('click', () => {
      Sound.play('tap');
      Endless.renderInfo();
      $('modal-endless-info').classList.remove('hidden');
      $(Endless.unlocked() ? 'btn-endless-play' : 'btn-endless-close').focus({ preventScroll: true });
    });
    container.appendChild(endless);
  }
}

function closeEndlessInfo() {
  $('modal-endless-info').classList.add('hidden');
  $('btn-endless-mode')?.focus({ preventScroll: true });
}

// Человекочитаемое описание цели уровня — используется в экране
// подтверждения перед стартом уровня.
function goalDescription(goal) {
  if (goal.type === 'collect') return t('goalCollect', { amount: goal.amount, items: gemName(goal.gem, goal.amount) });
  if (goal.type === 'score') return t('goalScore', { amount: formatNumber(goal.amount) });
  if (goal.type === 'cage') return t(goal.amount === 1 ? 'goalCageOne' : 'goalCageMany', { amount: goal.amount });
  if (goal.type === 'ice') return t(goal.amount === 1 ? 'goalIceOne' : 'goalIceMany', { amount: goal.amount });
  return '';
}

// Строит ряд из 3 одинаковых звёзд-медальонов: earnedStars штук — в
// золотой рамке (полученные), остальные — в пустой тёмной рамке того же
// размера. Используется и в карточке уровня, и в модалке победы.
function renderStarsRow(container, earnedStars, animateFrom = earnedStars) {
  container.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const slot = document.createElement('div');
    slot.className = 'star-slot' + (i < earnedStars ? ' filled' : '');
    if (i >= animateFrom && i < earnedStars) {
      slot.classList.add('awarded');
      slot.style.setProperty('--star-delay', `${(i - animateFrom) * 240}ms`);
    }
    const icon = document.createElement('span');
    icon.className = 'star-icon';
    icon.textContent = '⭐';
    slot.appendChild(icon);
    container.appendChild(slot);
  }
}

// Иконка цели: настоящая картинка фрукта для целей "собрать", звезда —
// для целей "набрать очков". Общая для HUD-чипов и карточки уровня.
function makeGoalIcon(goal) {
  if (goal.type === 'collect') {
    const img = document.createElement('img');
    img.className = 'goal-icon';
    img.src = 'assets/gems/' + goal.gem + '.png';
    img.alt = gemName(goal.gem, 1);
    return img;
  }
  const span = document.createElement('span');
  span.className = 'goal-icon';
  if (goal.type === 'cage') {
    span.classList.add('goal-roots-icon');
    span.textContent = '🌿';
    span.setAttribute('aria-label', t('roots'));
  } else if (goal.type === 'ice') {
    span.classList.add('goal-ice-icon');
    span.textContent = '❄';
    span.setAttribute('aria-label', t('ice'));
  } else {
    span.textContent = '⭐';
  }
  return span;
}

let pendingLevelId = null;

function openLevelInfo(levelId) {
  const level = LEVELS.find((l) => l.id === levelId);
  if (!level) return;
  pendingLevelId = levelId;

  $('level-info-title').textContent = levelTitle(level.id).toUpperCase();
  const bestStars = progress.bestStars[levelId] || 0;
  renderStarsRow($('level-info-stars'), bestStars);
  $('level-info-star-hint').textContent = starRulesDescription(level) + '. ' + t('moveBonusRule', { points: POINTS_PER_UNUSED_MOVE });

  const goalsEl = $('level-info-goals');
  goalsEl.innerHTML = '';
  level.goals.forEach((goal) => {
    const row = document.createElement('div');
    row.className = 'level-info-goal';
    const icon = makeGoalIcon(goal);
    const text = document.createElement('span');
    text.textContent = goalDescription(goal);
    row.appendChild(icon);
    row.appendChild(text);
    goalsEl.appendChild(row);
  });

  $('modal-level-info').classList.remove('hidden');
}

function closeLevelInfo() {
  $('modal-level-info').classList.add('hidden');
  pendingLevelId = null;
}


/* =============================================================
   8. ИГРОВОЙ ДВИЖОК (Board)
   -------------------------------------------------------------
   Все данные поля хранятся в двумерном массиве board.grid,
   где каждая ячейка — объект { type, special, el }.
   special: null | 'rocket-row' | 'rocket-col' | 'pumpkin' |
   'butterfly' | 'rainbow'.
   ============================================================= */

// Бесконечный режим использует тот же движок. Сохраняем только устойчивое
// поле между ходами: закрытие во время каскада вернёт к началу этого хода.
const Endless = {
  unlocked() { return progress.unlockedLevel > 30; },
  moveReward(stage) { return 6; },

  level(stage, board = null) {
    const types = Object.keys(GEM_TYPES);
    const first = types[(stage - 1) % types.length];
    const amount = stage < 4 ? 18 + stage * 2 : 12 + Math.floor(stage / 3) * 2;
    const collect = (gem) => {
      const start = board?.collected[gem] || 0;
      return { type: 'collect', gem, start, amount: start + amount };
    };
    return { id: 0, mode: 'endless', stage, moves: 20, shape: SHAPES.rounded,
      starThresholds: [1, 2, 3], goals: stage < 4 ? [collect(first)]
        : [collect(first), collect(types[(stage + 1) % types.length])] };
  },

  readRun() {
    const run = progress.endlessRun;
    const integer = (value, max = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(value) && value >= 0 && value <= max;
    if (!run || run.version !== 1 || !integer(run.stage) || run.stage < 1 ||
        !integer(run.moves, 30) || run.moves < 1 || !integer(run.score) ||
        !integer(run.cagesFreed) || !integer(run.iceCleared) ||
        !run.collected || !Object.keys(GEM_TYPES).every(type => integer(run.collected[type] || 0)) ||
        !Array.isArray(run.goals) || !run.goals.length || run.goals.length > 3 ||
        !run.goals.every(goal => goal && ['collect', 'cage', 'ice'].includes(goal.type) &&
          (goal.type !== 'collect' || Boolean(GEM_TYPES[goal.gem])) && integer(goal.start) &&
          integer(goal.amount) && goal.amount > goal.start) ||
        !Array.isArray(run.grid) || run.grid.length !== BOARD_SIZE) return null;
    const valid = run.grid.every((row, r) => Array.isArray(row) && row.length === BOARD_SIZE && row.every((cell, c) => {
      const active = SHAPES.rounded[r][c] === '1';
      return cell && cell.active === active && (active ? Boolean(GEM_TYPES[cell.type]) : cell.type === null) &&
        (cell.special === null || (active && Object.hasOwn(SPECIAL_IMAGES, cell.special))) &&
        integer(cell.cageHits, 2) && integer(cell.iceHits, 1) && !(cell.cageHits && cell.iceHits) &&
        (active || (!cell.cageHits && !cell.iceHits));
    }));
    return valid ? run : null;
  },

  save() {
    if (Board.level?.mode !== 'endless' || Board.outcome || Board.busy) return;
    progress.endlessRun = {
      version: 1, stage: Board.level.stage, goals: Board.level.goals.map(goal => ({ ...goal })),
      moves: Board.moves, score: Board.score, collected: { ...Board.collected },
      cagesFreed: Board.cagesFreed, iceCleared: Board.iceCleared,
      grid: Board.grid.map(row => row.map(cell => ({ type: cell.type, active: cell.active,
        special: cell.special || null, cageHits: cell.cageHits || 0, iceHits: cell.iceHits || 0,
        rootMaxHits: cell.rootMaxHits || 2 }))),
    };
    saveProgress(progress);
  },

  start(resume = true) {
    if (!this.unlocked()) return;
    const run = resume ? this.readRun() : null;
    const level = this.level(run?.stage || 1);
    if (run) level.goals = run.goals.map(goal => ({ ...goal }));
    ['modal-endless-info', 'modal-endless-result', 'modal-win', 'modal-lose', 'modal-level-info']
      .forEach(id => $(id).classList.add('hidden'));
    rememberMapPage(2);
    showScreen('screen-game');
    Board.start(level, run);
    this.save();
  },

  addObstacles() {
    const stage = Board.level.stage;
    if (stage < 6 || stage % 3 !== 0) return;
    const kind = stage % 6 === 0 ? 'cage' : 'ice';
    const field = kind === 'cage' ? 'cageHits' : 'iceHits';
    const candidates = Board.grid.flat().filter(cell => cell.active && !cell.special && !Board.isImmobile(cell));
    let added = 0;
    const limit = Math.min(5, 2 + Math.floor(stage / 12));
    while (candidates.length && added < limit) {
      const cell = candidates.splice(randomInt(candidates.length), 1)[0];
      cell[field] = kind === 'cage' ? 2 : 1;
      // Не ставим препятствие, если оно перекроет последний доступный ход.
      if (!Board.hasAnyPossibleMove()) { cell[field] = 0; continue; }
      cell.rootMaxHits = 2;
      Board.updateTileVisual(cell);
      added++;
    }
    if (added) {
      const start = kind === 'cage' ? Board.cagesFreed : Board.iceCleared;
      Board.level.goals.push({ type: kind, start, amount: start + added });
    }
  },

  async afterMove() {
    if (Board.outcome || Board.busy) return;
    if (Board.allGoalsComplete()) {
      Board.busy = true;
      Board.stopIdleHint();
      const gained = Math.min(this.moveReward(Board.level.stage), 30 - Board.moves);
      Board.moves += gained;
      Board.level = this.level(Board.level.stage + 1, Board);
      // После завершившего задание каскада движок мог пропустить перемешивание.
      if (!await Board.ensurePossibleMove()) return;
      this.addObstacles();
      Board.busy = false;
      Sound.play('win');
      showToast(t('endlessAdvance', { moves: gained }), 2200);
      Board.renderHud();
    }
    if (Board.moves <= 0) { this.finish(); return; }
    this.save();
    Board.scheduleIdleHint();
  },

  finish() {
    if (Board.outcome) return;
    Board.outcome = 'endless-over';
    Board.busy = true;
    Board.stopIdleHint();
    progress.endlessRun = null;
    progress.endlessBestScore = Math.max(Number(progress.endlessBestScore) || 0, Board.score);
    progress.endlessBestStages = Math.max(Number(progress.endlessBestStages) || 0, Board.level.stage - 1);
    saveProgress(progress);
    Sound.play('lose');
    this.renderResult();
    $('modal-endless-result').classList.remove('hidden');
    $('btn-endless-retry').focus({ preventScroll: true });
  },

  recordText() {
    return t('endlessBest', { stages: progress.endlessBestStages || 0,
      score: formatNumber(progress.endlessBestScore || 0) });
  },

  renderInfo() {
    const run = this.readRun();
    $('endless-description').textContent = t(this.unlocked() ? 'endlessRules' : 'endlessLocked');
    $('endless-record').textContent = this.recordText();
    $('endless-saved').textContent = run ? t('endlessSaved', { stage: run.stage, moves: run.moves, score: formatNumber(run.score) }) : '';
    $('btn-endless-play').disabled = !this.unlocked();
    $('btn-endless-play').textContent = t(run ? 'endlessResume' : 'endlessStart');
  },

  renderResult() {
    $('endless-result-score').textContent = formatNumber(Board.score);
    $('endless-result-stages').textContent = Board.level.stage - 1;
    $('endless-result-record').textContent = this.recordText();
  },
};

const Board = {
  size: BOARD_SIZE,
  grid: [],           // grid[row][col] = { type, special, el, active }
  activeMask: [],      // activeMask[row][col] = true/false — форма поля уровня
  columnSegments: [],   // columnSegments[col] = [{top, bottom}, ...] — независимые "острова" для гравитации
  holeEls: [],           // декоративные элементы неактивных клеток (для позиционирования при resize)
  gridEl: null,
  cellSize: 0,
  level: null,
  moves: 0,
  score: 0,
  collected: {},      // { gemId: count } — прогресс целей сбора
  cagesFreed: 0,
  iceCleared: 0,
  busy: false,         // true пока идёт анимация — блокирует ввод
  selected: null,       // { row, col } выбранная игроком ячейка
  pointer: null,        // состояние текущего свайпа
  resizeHandler: null,
  tutorialMove: null,
  tutorialArrowEl: null,
  idleHintTimer: null,

  /* ---------- запуск уровня ---------- */

  start(level, snapshot = null) {
    clearInterval(this.finaleTimer);
    this.outcome = null;
    this.victoryResult = null;
    this.victoryDisplayScore = null;
    this.victoryDisplayMoves = null;
    $('victory-finale').classList.add('hidden');
    this.stopIdleHint();
    this.level = level;
    this.moves = level.moves;
    this.score = 0;
    this.collected = {};
    this.cagesFreed = 0;
    this.iceCleared = 0;
    this.selected = null;
    this.busy = false;
    this.tutorialMove = null;
    this.tutorialArrowEl = null;

    this.gridEl = $('board-grid');
    this.gridEl.innerHTML = '';

    this.parseShape(level.shape);
    if ([2, 4, 6, 8, 10, 11, 15].includes(level.id)) this.prepareTutorialMove(level.id);
    else this.generateSolvableBoard();
    this.applyLevelObstacles();
    if (!this.tutorialMove) {
      let attempts = 0;
      while (!this.hasAnyPossibleMove() && attempts++ < 100) {
        this.generateSolvableBoard();
        this.applyLevelObstacles();
      }
    }
    if (snapshot) {
      this.grid = snapshot.grid.map(row => row.map(cell => ({ ...cell, el: null })));
      this.moves = snapshot.moves;
      this.score = snapshot.score;
      this.collected = { ...snapshot.collected };
      this.cagesFreed = snapshot.cagesFreed;
      this.iceCleared = snapshot.iceCleared;
    }
    this.measure();
    this.renderHud();

    if (level.introKey) showToast(t(level.introKey), 3400);

    // bindInput() сам отрисует все тайлы на чистом контейнере
    this.bindInput();
    this.showTutorialMove();
    this.scheduleIdleHint();
    if (!this.resizeHandler) {
      this.resizeHandler = () => this.onResize();
      window.addEventListener('resize', this.resizeHandler);
    }
  },

  // Разбирает текстовую форму уровня в булеву маску и заодно считает
  // для каждого столбца независимые вертикальные "острова" (сегменты) —
  // это нужно гравитации, чтобы элементы не падали сквозь вырезы поля.
  parseShape(shape) {
    this.activeMask = shape.map((row) => row.split('').map((ch) => ch === '1'));
    this.columnSegments = [];
    for (let c = 0; c < this.size; c++) {
      const segments = [];
      let segStart = null;
      for (let r = 0; r < this.size; r++) {
        if (this.activeMask[r][c]) {
          if (segStart === null) segStart = r;
        } else if (segStart !== null) {
          segments.push({ top: segStart, bottom: r - 1 });
          segStart = null;
        }
      }
      if (segStart !== null) segments.push({ top: segStart, bottom: this.size - 1 });
      this.columnSegments[c] = segments;
    }
  },

  onResize() {
    if (!this.gridEl || !this.level) return;
    this.measure();
    this.layoutAll();
    this.positionTutorialArrow();
  },

  measure() {
    // Считаем точный размер поля из реально доступного места в
    // .board-wrap, а не по приблизительным vw/vh-формулам в CSS —
    // так поле максимально заполняет экран на любом устройстве и
    // никогда не обрезается снизу под HUD разной высоты.
    const wrap = this.gridEl.parentElement;
    const padding = 20; // небольшой отступ от краёв контейнера
    const available = Math.min(wrap.clientWidth, wrap.clientHeight) - padding;
    const boardSize = Math.max(1, Math.min(available, 560));
    this.gridEl.style.width = boardSize + 'px';
    this.gridEl.style.height = boardSize + 'px';
    this.cellSize = boardSize / this.size;
  },

  /* ---------- генерация поля ---------- */

  generateSolvableBoard() {
    do {
      this.grid = [];
      for (let r = 0; r < this.size; r++) {
        const row = [];
        for (let c = 0; c < this.size; c++) {
          if (!this.activeMask[r][c]) {
            // клетка вне формы уровня — постоянно пустая, не участвует в игре
            row.push({ type: null, special: null, el: null, active: false });
            continue;
          }
          // передаём ещё не завершённую строку row отдельно, т.к. она
          // ещё не добавлена в this.grid — иначе обращение к соседям
          // слева в текущей строке упадёт с ошибкой чтения undefined
          row.push({ type: this.pickNonMatchingType(r, c, row), special: null, el: null, active: true });
        }
        this.grid.push(row);
      }
    } while (this.findMatches().length > 0 || !this.hasAnyPossibleMove());
  },

  // Подготавливает гарантированную комбинацию для первого хода урока.
  // Остальные клетки остаются случайными, а поле перегенерируется, если
  // заданный шаблон случайно создал ещё одну готовую комбинацию.
  prepareTutorialMove(levelId) {
    const lessons = {
      2: { from: [2, 3], to: [3, 3], prompt: t('tutorialRocket'), cells: [[[3, 2], 'apple'], [[3, 3], 'corn'], [[3, 4], 'apple'], [[3, 5], 'apple'], [[2, 3], 'apple']] },
      4: { from: [2, 1], to: [2, 2], prompt: t('tutorialPumpkin'), cells: [[[2, 1], 'corn'], [[2, 2], 'berry'], [[2, 3], 'corn'], [[2, 4], 'corn'], [[3, 2], 'corn'], [[4, 2], 'corn']] },
      6: { from: [3, 4], to: [3, 3], prompt: t('tutorialButterfly'), cells: [[[2, 2], 'berry'], [[2, 3], 'berry'], [[3, 2], 'berry'], [[3, 3], 'apple'], [[3, 4], 'berry']] },
      8: { from: [0, 3], to: [1, 3], prompt: t('tutorialRainbow'), cells: [[[1, 1], 'eggplant'], [[1, 2], 'eggplant'], [[1, 3], 'corn'], [[1, 4], 'eggplant'], [[1, 5], 'eggplant'], [[0, 3], 'eggplant']] },
      10: { from: [5, 3], to: [5, 4], prompt: t('tutorialCombo'), specials: [[[5, 3], 'rocket-row', 'apple'], [[5, 4], 'pumpkin', 'corn']] },
      11: { from: [2, 4], to: [3, 4], prompt: t('tutorialRoots'), targets: [[2, 3]], cells: [[[2, 3], 'corn'], [[2, 4], 'berry'], [[3, 2], 'berry'], [[3, 3], 'berry'], [[3, 4], 'apple']] },
      15: { from: [2, 4], to: [3, 4], prompt: t('tutorialIce'), targets: [[3, 3]], cells: [[[2, 4], 'berry'], [[3, 2], 'berry'], [[3, 3], 'berry'], [[3, 4], 'apple']] },
    };
    const lesson = lessons[levelId];
    if (!lesson) return;

    let attempts = 0;
    do {
      this.generateSolvableBoard();
      (lesson.cells || []).forEach(([[r, c], type]) => { this.grid[r][c].type = type; });
      (lesson.specials || []).forEach(([[r, c], special, type]) => {
        this.grid[r][c].type = type;
        this.grid[r][c].special = special;
      });
      attempts++;
    } while (this.findMatches().length > 0 && attempts < 100);

    this.tutorialMove = {
      active: true,
      from: { row: lesson.from[0], col: lesson.from[1] },
      to: { row: lesson.to[0], col: lesson.to[1] },
      prompt: lesson.prompt,
      targets: (lesson.targets || []).map(([row, col]) => ({ row, col })),
    };
  },

  applyLevelObstacles() {
    const obstacles = this.level.obstacles || {};
    const place = (positions, kind) => (positions || []).forEach(([row, col, hits]) => {
      if (!this.inBounds(row, col) || !this.activeMask[row][col]) return;
      const cell = this.grid[row][col];
      if (cell.special) return;
      if (kind === 'cage') { cell.cageHits = Math.max(1, hits || 2); cell.rootMaxHits = cell.cageHits; }
      if (kind === 'ice') cell.iceHits = 1;
    });
    place(obstacles.cages, 'cage');
    place(obstacles.ice, 'ice');
  },

  isCaged(cell) { return Boolean(cell && cell.cageHits > 0); },
  matchTypeAt(row, col) { const cell = this.grid[row][col]; return this.isCaged(cell) ? null : cell.type; },
  isFrozen(cell) { return Boolean(cell && cell.iceHits > 0); },
  isImmobile(cell) { return this.isCaged(cell) || this.isFrozen(cell); },
  showTutorialMove() {
    if (!this.tutorialMove || !this.tutorialMove.active) return;
    const hint = $('tutorial-hint');
    hint.textContent = this.tutorialMove.prompt;
    hint.classList.remove('hidden');
    this.gridEl.classList.add('tutorial-lock');
    [this.tutorialMove.from, this.tutorialMove.to, ...(this.tutorialMove.targets || [])].forEach(({ row, col }) => {
      this.grid[row][col].el.classList.add('tutorial-highlight');
    });
    this.tutorialArrowEl = document.createElement('div');
    this.tutorialArrowEl.className = 'tutorial-swipe-arrow';
    this.tutorialArrowEl.setAttribute('aria-hidden', 'true');
    this.gridEl.appendChild(this.tutorialArrowEl);
    this.measure();
    this.layoutAll();
    this.positionTutorialArrow();
  },

  positionTutorialArrow() {
    if (!this.tutorialArrowEl || !this.tutorialMove || !this.tutorialMove.active) return;
    const { from, to } = this.tutorialMove;
    const x = (from.col + to.col + 1) * this.cellSize / 2;
    const y = (from.row + to.row + 1) * this.cellSize / 2;
    const direction = from.row === to.row ? (to.col > from.col ? '→' : '←') : (to.row > from.row ? '↓' : '↑');
    this.tutorialArrowEl.textContent = direction;
    this.tutorialArrowEl.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
  },

  finishTutorialMove() {
    if (!this.tutorialMove || !this.tutorialMove.active) return;
    this.tutorialMove.active = false;
    this.gridEl.classList.remove('tutorial-lock');
    this.gridEl.querySelectorAll('.tutorial-highlight').forEach((el) => el.classList.remove('tutorial-highlight'));
    if (this.tutorialArrowEl) this.tutorialArrowEl.remove();
    this.tutorialArrowEl = null;
    $('tutorial-hint').classList.add('hidden');
  },

  isTutorialPair(a, b) {
    if (!this.tutorialMove || !this.tutorialMove.active) return true;
    const { from, to } = this.tutorialMove;
    return (a.row === from.row && a.col === from.col && b.row === to.row && b.col === to.col) ||
      (b.row === from.row && b.col === from.col && a.row === to.row && a.col === to.col);
  },

  // Выбирает случайный элемент, который не создаст сразу готовую
  // комбинацию из 3+ в момент старта уровня.
  pickNonMatchingType(r, c, currentRow) {
    let type;
    let guard = 0;
    do {
      type = randomGem();
    } while (guard < 20 && this.wouldMatchAt(r, c, type, currentRow));
    return type;
  },

  wouldMatchAt(r, c, type, currentRow) {
    // проверка горизонтали (два элемента слева в строящейся строке)
    if (c >= 2 &&
        currentRow[c - 1] && currentRow[c - 1].type === type &&
        currentRow[c - 2] && currentRow[c - 2].type === type) return true;
    // проверка вертикали (два элемента сверху, строки уже готовы)
    if (r >= 2 &&
        this.grid[r - 1][c] && this.grid[r - 1][c].type === type &&
        this.grid[r - 2][c] && this.grid[r - 2][c].type === type) return true;
    return false;
  },

  /* ---------- рендер ---------- */

  renderAll() {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const cell = this.grid[r][c];
        if (!cell.active) continue; // вне формы поля — тайл не нужен
        cell.el = this.createTileEl(cell, r, c);
        this.updateTileVisual(cell);
        this.gridEl.appendChild(cell.el);
      }
    }
  },

  // Клетки вне формы уровня рисуются как декоративные "лунки" в почве —
  // так форма поля читается визуально, а не выглядит как обрезанный баг.
  renderShapeDecor() {
    this.holeEls = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.activeMask[r][c]) continue;
        const hole = document.createElement('div');
        hole.className = 'cell-hole';
        this.gridEl.appendChild(hole);
        this.holeEls.push({ el: hole, row: r, col: c });
      }
    }
    this.layoutHoles();
  },

  layoutHoles() {
    const size = this.cellSize;
    this.holeEls.forEach(({ el, row, col }) => {
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.transform = `translate(${col * size}px, ${row * size}px)`;
    });
  },

  createTileEl(cell, r, c) {
    const el = document.createElement('div');
    el.className = 'gem';
    el.dataset.row = r;
    el.dataset.col = c;
    el.dataset.type = cell.type;
    el.setAttribute('role', 'button');
    el.tabIndex = 0;
    const inner = document.createElement('div');
    inner.className = 'gem-inner';
    // сам фрукт рисуется через CSS background-image по data-type
    // (см. .gem[data-type="..."] .gem-inner в style.css); textContent
    // тут не нужен для обычных клеток — только для иконки ракеты.
    el.appendChild(inner);
    this.placeTile(el, r, c, false);
    return el;
  },

  placeTile(el, r, c, animate = true) {
    const size = this.cellSize;
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    if (!animate) {
      const prevTransition = el.style.transition;
      el.style.transition = 'none';
      el.style.transform = `translate(${c * size}px, ${r * size}px)`;
      // форсируем перерасчёт стилей, чтобы следующая анимация сработала
      void el.offsetHeight;
      el.style.transition = prevTransition || '';
    } else {
      el.style.transform = `translate(${c * size}px, ${r * size}px)`;
    }
  },

  layoutAll() {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const cell = this.grid[r][c];
        if (cell.el) this.placeTile(cell.el, r, c, false);
      }
    }
    this.layoutHoles();
  },

  updateTileVisual(cell) {
    cell.el.setAttribute('aria-label', cellAriaLabel(cell));
    cell.el.dataset.type = cell.type;
    this.updateObstacleVisual(cell);

    const inner = cell.el.querySelector('.gem-inner');
    cell.el.classList.remove('rocket-row', 'rocket-col', 'pumpkin', 'butterfly', 'rainbow');
    cell.el.classList.toggle('special-colorized', Boolean(cell.special && cell.special !== 'rainbow'));
    if (cell.special) {
      cell.el.classList.add(cell.special);
      const rocket = document.createElement('img');
      rocket.className = 'special-gem-icon';
      rocket.src = SPECIAL_IMAGES[cell.special];
      rocket.alt = '';
      rocket.setAttribute('aria-hidden', 'true');
      rocket.draggable = false;
      inner.replaceChildren(rocket);
    } else {
      // обычный фрукт рисуется CSS background-image по data-type —
      // внутреннее содержимое очищаем (могла остаться иконка ракеты)
      inner.innerHTML = '';
    }
  },

  updateObstacleVisual(cell) {
    const el = cell.el;
    if (!el) return;
    const cage = this.isCaged(cell);
    const ice = this.isFrozen(cell);
    el.classList.toggle('root-bound', cage);
    el.classList.toggle('frozen', ice);
    el.classList.toggle('roots-worn', cage && cell.cageHits < (cell.rootMaxHits || 2));
    el.classList.toggle('roots-weakened', cage && cell.cageHits <= 1);
    let overlay = el.querySelector('.obstacle-overlay');
    const kind = cage ? 'roots' : (ice ? 'ice' : null);
    if (!kind) {
      if (overlay) overlay.remove();
      return;
    }
    if (!overlay || overlay.dataset.obstacle !== kind) {
      if (overlay) overlay.remove();
      overlay = document.createElement('div');
      overlay.className = `obstacle-overlay ${kind}-overlay`;
      overlay.dataset.obstacle = kind;
      overlay.setAttribute('aria-hidden', 'true');
      if (kind === 'roots') {
        const art = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        art.setAttribute('viewBox', '0 0 100 100');
        art.setAttribute('class', 'roots-art');
        art.setAttribute('aria-hidden', 'true');
        const branches = 'M17 -4 C4 12 34 20 17 34 S38 52 19 67 S34 87 21 104 M78 -4 C95 13 64 22 82 37 S60 53 81 69 S63 88 79 104 M8 22 C32 10 51 32 92 19 M6 79 C33 60 60 91 94 72';
        art.innerHTML = '<path class="root-shadow" d="' + branches + '"/><path class="root-main" d="' + branches + '"/><path class="root-highlight" d="' + branches + '"/><path class="root-tendril" d="M17 34 C5 28 6 17 10 13 M82 37 C94 32 94 25 90 21 M19 67 C8 64 5 57 8 52 M81 69 C93 66 96 58 92 53"/>';
        overlay.appendChild(art);
        const count = document.createElement('span');
        count.className = 'root-hit-count';
        overlay.appendChild(count);
      } else {
        const snow = document.createElement('span');
        snow.className = 'ice-crystal';
        snow.textContent = '❄';
        overlay.appendChild(snow);
      }
      el.appendChild(overlay);
    }
    if (cage) overlay.querySelector('.root-hit-count').textContent = String(cell.cageHits);
  },
  /* ---------- ввод: клик/тап и свайп ---------- */

  bindInput() {
    // снимаем предыдущие обработчики (на случай повторного старта уровня)
    const grid = this.gridEl;
    const clone = grid.cloneNode(true);
    grid.parentNode.replaceChild(clone, grid);
    this.gridEl = clone;
    // важно: после cloneNode ссылки cell.el устарели, поэтому
    // перерисовываем поле заново на новом контейнере
    this.gridEl.innerHTML = '';
    this.renderShapeDecor();
    this.renderAll();

    this.gridEl.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    this.gridEl.addEventListener('pointermove', (e) => this.onPointerMove(e));
    this.gridEl.addEventListener('pointerup', (e) => this.onPointerUp(e));
    this.gridEl.addEventListener('pointercancel', () => { this.pointer = null; this.clearPressed(); });
    this.gridEl.addEventListener('keydown', (e) => {
      const cell = this.cellFromEvent(e);
      if (!cell || this.busy) return;
      this.resetIdleHint();
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.handleTap(cell); return; }
      const delta = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
      if (!delta) return;
      e.preventDefault();
      const target = { row: cell.row + delta[0], col: cell.col + delta[1] };
      if (this.inBounds(target.row, target.col) && this.grid[target.row][target.col].active) this.grid[target.row][target.col].el.focus();
    });
  },

  cellFromEvent(e) {
    const tile = e.target.closest('.gem');
    if (!tile) return null;
    return { row: parseInt(tile.dataset.row, 10), col: parseInt(tile.dataset.col, 10) };
  },

  onPointerDown(e) {
    if (this.busy) return;
    const cell = this.cellFromEvent(e);
    if (!cell) return;
    this.resetIdleHint();
    if (this.isImmobile(this.grid[cell.row][cell.col])) return;
    this.pointer = { startX: e.clientX, startY: e.clientY, cell, moved: false };
    this.gridEl.setPointerCapture(e.pointerId);
    // мгновенный тактильный отклик — лёгкое "нажатие" под пальцем/курсором
    const cellData = this.grid[cell.row][cell.col];
    if (cellData.el) cellData.el.classList.add('pressed');
  },

  onPointerMove(e) {
    if (this.busy || !this.pointer) return;
    const dx = e.clientX - this.pointer.startX;
    const dy = e.clientY - this.pointer.startY;
    const threshold = Math.max(18, this.cellSize * 0.25);
    if (!this.pointer.moved && (Math.abs(dx) > threshold || Math.abs(dy) > threshold)) {
      this.pointer.moved = true;
      this.clearPressed();
      let target;
      if (Math.abs(dx) > Math.abs(dy)) {
        target = { row: this.pointer.cell.row, col: this.pointer.cell.col + (dx > 0 ? 1 : -1) };
      } else {
        target = { row: this.pointer.cell.row + (dy > 0 ? 1 : -1), col: this.pointer.cell.col };
      }
      this.trySwap(this.pointer.cell, target);
      this.pointer = null;
    }
  },

  onPointerUp(e) {
    this.clearPressed();
    if (this.busy || !this.pointer) return;
    if (!this.pointer.moved) {
      this.handleTap(this.pointer.cell);
    }
    this.pointer = null;
  },

  clearPressed() {
    const pressed = this.gridEl.querySelectorAll('.gem.pressed');
    pressed.forEach((el) => el.classList.remove('pressed'));
  },

  handleTap(cell) {
    this.resetIdleHint();
    if (this.tutorialMove && this.tutorialMove.active &&
        ![this.tutorialMove.from, this.tutorialMove.to].some((pos) => pos.row === cell.row && pos.col === cell.col)) return;
    if (this.isImmobile(this.grid[cell.row][cell.col])) {
      this.clearSelection();
      Sound.play('invalid');
      return;
    }
    if (!this.selected) {
      this.selected = cell;
      this.grid[cell.row][cell.col].el.classList.add('selected');
      Sound.play('tap');
      return;
    }
    if (this.selected.row === cell.row && this.selected.col === cell.col) {
      this.clearSelection();
      return;
    }
    const isAdjacent = this.areAdjacent(this.selected, cell);
    const prevSelected = this.selected;
    this.clearSelection();
    if (isAdjacent) {
      this.trySwap(prevSelected, cell);
    } else {
      // выбрали другую (не соседнюю) ячейку — переносим выбор на неё
      this.selected = cell;
      this.grid[cell.row][cell.col].el.classList.add('selected');
    }
  },

  clearSelection() {
    if (this.selected) {
      const c = this.grid[this.selected.row][this.selected.col];
      if (c && c.el) c.el.classList.remove('selected');
    }
    this.selected = null;
  },

  areAdjacent(a, b) {
    const dr = Math.abs(a.row - b.row);
    const dc = Math.abs(a.col - b.col);
    return (dr + dc) === 1;
  },

  inBounds(r, c) { return r >= 0 && r < this.size && c >= 0 && c < this.size; },

  /* ---------- обмен элементов ---------- */

  async trySwap(a, b) {
    if (!this.inBounds(b.row, b.col) || !this.inBounds(a.row, a.col)) return;
    if (!this.areAdjacent(a, b)) return;
    if (!this.grid[a.row][a.col].active || !this.grid[b.row][b.col].active) return;
    if (this.isImmobile(this.grid[a.row][a.col]) || this.isImmobile(this.grid[b.row][b.col])) return;
    if (this.busy) return;
    if (!this.isTutorialPair(a, b)) return;
    this.busy = true;

    const cellA = this.grid[a.row][a.col];
    const cellB = this.grid[b.row][b.col];

    this.swapData(a, b);
    Sound.play('swap');
    this.placeTile(cellA.el, b.row, b.col, true);
    this.placeTile(cellB.el, a.row, a.col, true);
    await delay(220);

    // Радужный цветок работает как цветовая бомба: обмен задаёт цвет,
    // который нужно убрать. Остальные спецфишки по-прежнему требуют матч.
    let forcedAction = null;
    if (cellA.special && cellB.special) {
      forcedAction = {
        kind: 'combo',
        first: { row: b.row, col: b.col, special: cellA.special, type: cellA.type },
        second: { row: a.row, col: a.col, special: cellB.special, type: cellB.type },
      };
    } else if (cellA.special === 'rainbow') {
      forcedAction = { kind: 'rainbow', row: b.row, col: b.col, targetType: cellB.type };
    } else if (cellB.special === 'rainbow') {
      forcedAction = { kind: 'rainbow', row: a.row, col: a.col, targetType: cellA.type };
    }

    // Ракета срабатывает ТОЛЬКО если её задействовали в реальной
    // комбинации (она попадёт в findMatches()/цепную реакцию ниже по её
    // цвету — см. buildClearPlan). Простое перемещение ракеты соседним
    // свайпом без образования тройки её больше не активирует.
    const matches = this.findMatches();
    if (matches.length === 0 && !forcedAction) {
      // нет комбинации — возвращаем элементы обратно
      Sound.play('invalid');
      this.swapData(a, b);
      this.placeTile(cellA.el, a.row, a.col, true);
      this.placeTile(cellB.el, b.row, b.col, true);
      await delay(220);
      this.busy = false;
      return;
    }

    this.finishTutorialMove();
    this.spendMove();
    await this.resolveCascade(b, 1, forcedAction); // b — позиция, куда пришёл двигавшийся элемент
    this.busy = false;
    this.afterMoveChecks();
  },

  swapData(a, b) {
    const tmp = this.grid[a.row][a.col];
    this.grid[a.row][a.col] = this.grid[b.row][b.col];
    this.grid[b.row][b.col] = tmp;
    this.grid[a.row][a.col].el.dataset.row = a.row;
    this.grid[a.row][a.col].el.dataset.col = a.col;
    this.grid[b.row][b.col].el.dataset.row = b.row;
    this.grid[b.row][b.col].el.dataset.col = b.col;
  },

  spendMove() {
    this.moves = Math.max(0, this.moves - 1);
    this.renderHud();
  },

  /* ---------- поиск комбинаций ---------- */

  // Возвращает список "пробегов" (runs) одинаковых элементов длиной >= 3,
  // отдельно по горизонтали и вертикали.
  findMatches() {
    const runs = [];

    // горизонтальные пробеги
    for (let r = 0; r < this.size; r++) {
      let runStart = 0;
      for (let c = 1; c <= this.size; c++) {
        const prevType = this.matchTypeAt(r, c - 1);
        const curType = c < this.size ? this.matchTypeAt(r, c) : null;
        if (curType !== prevType) {
          const len = c - runStart;
          // prevType !== null — клетки вне формы поля (дыры) никогда не
          // формируют "комбинацию", даже если их несколько подряд
          if (len >= 3 && prevType !== null) {
            const cells = [];
            for (let k = runStart; k < c; k++) cells.push({ row: r, col: k });
            runs.push({ cells, type: prevType, orientation: 'h', length: len });
          }
          runStart = c;
        }
      }
    }

    // вертикальные пробеги
    for (let c = 0; c < this.size; c++) {
      let runStart = 0;
      for (let r = 1; r <= this.size; r++) {
        const prevType = this.matchTypeAt(r - 1, c);
        const curType = r < this.size ? this.matchTypeAt(r, c) : null;
        if (curType !== prevType) {
          const len = r - runStart;
          if (len >= 3 && prevType !== null) {
            const cells = [];
            for (let k = runStart; k < r; k++) cells.push({ row: k, col: c });
            runs.push({ cells, type: prevType, orientation: 'v', length: len });
          }
          runStart = r;
        }
      }
    }

    // Квадрат 2×2 создаёт бабочку — это отдельная форма матча, даже если
    // в квадрате нет обычной линии из трёх одинаковых элементов.
    for (let r = 0; r < this.size - 1; r++) {
      for (let c = 0; c < this.size - 1; c++) {
        const type = this.matchTypeAt(r, c);
        if (type !== null &&
            this.matchTypeAt(r, c + 1) === type &&
            this.matchTypeAt(r + 1, c) === type &&
            this.matchTypeAt(r + 1, c + 1) === type) {
          runs.push({
            cells: [
              { row: r, col: c }, { row: r, col: c + 1 },
              { row: r + 1, col: c }, { row: r + 1, col: c + 1 },
            ],
            type,
            orientation: 'square',
            length: 4,
            shape: 'square',
          });
        }
      }
    }

    return runs;
  },

  /* ---------- разрешение комбинаций (с каскадами) ---------- */

  async resolveCascade(swapAnchor, startingCascadeLevel = 1, forcedAction = null) {
    let cascadeLevel = startingCascadeLevel;
    let firstPass = true;

    while (true) {
      const runs = this.findMatches();
      if (runs.length === 0 && !forcedAction) break;

      const result = this.buildClearPlan(runs, firstPass ? swapAnchor : null, firstPass ? forcedAction : null);
      forcedAction = null;
      firstPass = false;

      // Автоматическая цепочка (не первый ход игрока) — показываем баннер
      // "КОМБО ×N" для наглядной обратной связи по каскадам.
      if (cascadeLevel >= 2) this.showComboBanner(cascadeLevel);
      // Начиная с 3-го звена цепочки — добавляем лёгкую встряску поля,
      // чтобы по-настоящему мощный каскад ощущался мощным.
      if (cascadeLevel >= 3) this.shakeBoard();

      this.applyObstacleHits(result);
      await this.playMatchEffects(result, cascadeLevel);
      this.registerClearedGems(result.countedCells, cascadeLevel);
      this.renderHud();

      await this.collapseAndRefill(result.clearSet, result.specialsToCreate);

      cascadeLevel++;
      await delay(60);
    }

    // после того как поле "успокоилось", проверяем, что есть возможный ход
    if (!this.allGoalsComplete() && this.moves > 0 && !this.hasAnyPossibleMove()) {
      showToast(t('noMoves'), 1700);
      await this.ensurePossibleMove();
    }
  },

  // Каждая спецфишка активируется, только если попала в комбинацию или
  // цепную реакцию. Свайп спецфишки сам по себе ходом не считается.
  activateSpecial(special, pos, cellsToClear, countedCells, protectedKeys, firedSpecials, targetTypeOverride = null, blastRadius = 1) {
    if (firedSpecials.some((item) => item.row === pos.row && item.col === pos.col && item.special === special)) return;
    const activation = { row: pos.row, col: pos.col, special };
    if (targetTypeOverride) activation.targetType = targetTypeOverride;
    if (special === 'pumpkin') activation.blastRadius = blastRadius;
    if (special === 'butterfly') {
      activation.target = this.findButterflyTarget(pos, cellsToClear);
    }
    firedSpecials.push(activation);

    if (special === 'rocket-row') {
      for (let c = 0; c < this.size; c++) {
        if (this.activeMask[pos.row][c]) this.addToClearSet(cellsToClear, countedCells, pos.row, c, protectedKeys, firedSpecials);
      }
    } else if (special === 'rocket-col') {
      for (let r = 0; r < this.size; r++) {
        if (this.activeMask[r][pos.col]) this.addToClearSet(cellsToClear, countedCells, r, pos.col, protectedKeys, firedSpecials);
      }
    } else if (special === 'pumpkin') {
      for (let r = pos.row - blastRadius; r <= pos.row + blastRadius; r++) {
        for (let c = pos.col - blastRadius; c <= pos.col + blastRadius; c++) {
          if (this.inBounds(r, c) && this.activeMask[r][c]) {
            this.addToClearSet(cellsToClear, countedCells, r, c, protectedKeys, firedSpecials);
          }
        }
      }
    } else if (special === 'butterfly' && activation.target) {
      this.addToClearSet(cellsToClear, countedCells, activation.target.row, activation.target.col, protectedKeys, firedSpecials);
    } else if (special === 'rainbow') {
      const targetType = targetTypeOverride || this.grid[pos.row][pos.col].type;
      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          if (this.activeMask[r][c] && this.grid[r][c].type === targetType) {
            this.addToClearSet(cellsToClear, countedCells, r, c, protectedKeys, firedSpecials);
          }
        }
      }
    }
  },

  findButterflyTarget(origin, cellsToClear) {
    const neededGoals = this.level.goals
      .filter((goal) => goal.type === 'collect')
      .map((goal) => ({ gem: goal.gem, remaining: Math.max(0, goal.amount - (this.collected[goal.gem] || 0)) }))
      .filter((goal) => goal.remaining > 0)
      .sort((a, b) => b.remaining - a.remaining);
    const available = (type) => {
      const matches = [];
      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          const key = r + '_' + c;
          if (this.activeMask[r][c] && !(r === origin.row && c === origin.col) &&
              !cellsToClear.has(key) && (type == null || this.grid[r][c].type === type)) {
            matches.push({ row: r, col: c });
          }
        }
      }
      return matches;
    };

    for (const goal of neededGoals) {
      const targets = available(goal.gem);
      if (targets.length) return targets[randomInt(targets.length)];
    }
    const fallback = available(null);
    return fallback.length ? fallback[randomInt(fallback.length)] : null;
  },

  applySpecialCombo(combo, clearSet, countedCells, countedKeys, protectedKeys, firedSpecials) {
    const firstKey = combo.first.row + '_' + combo.first.col;
    const secondKey = combo.second.row + '_' + combo.second.col;
    const comboKeys = new Set([firstKey, secondKey]);
    [combo.first, combo.second].forEach((source) => {
      const key = source.row + '_' + source.col;
      if (!countedKeys.has(key)) {
        countedKeys.add(key);
        countedCells.push({ row: source.row, col: source.col, type: source.type });
      }
      if (!clearSet.has(key)) clearSet.set(key, { row: source.row, col: source.col });
    });

    // Временно снимаем спецстатус с двух участников: их объединённый эффект
    // заменяет обычное срабатывание этих же фишек при цепной очистке.
    const sourceCells = [combo.first, combo.second].map((source) => this.grid[source.row][source.col]);
    const sourceSpecials = sourceCells.map((cell) => cell.special);
    sourceCells.forEach((cell) => { cell.special = null; });

    const first = combo.first;
    const second = combo.second;
    const hasPair = (a, b) => (first.special === a && second.special === b) || (first.special === b && second.special === a);
    const get = (special) => first.special === special ? first : second;

    if (first.special.startsWith('rocket-') && second.special.startsWith('rocket-')) {
      this.activateSpecial(first.special, first, clearSet, countedCells, protectedKeys, firedSpecials);
      this.activateSpecial(second.special, second, clearSet, countedCells, protectedKeys, firedSpecials);
    } else if (first.special === 'pumpkin' && second.special === 'pumpkin') {
      const center = { row: Math.round((first.row + second.row) / 2), col: Math.round((first.col + second.col) / 2) };
      this.activateSpecial('pumpkin', center, clearSet, countedCells, protectedKeys, firedSpecials, null, 2);
    } else if (hasPair('pumpkin', 'butterfly') || hasPair('rocket-row', 'butterfly') || hasPair('rocket-col', 'butterfly')) {
      const butterfly = get('butterfly');
      const other = first === butterfly ? second : first;
      this.activateSpecial('butterfly', butterfly, clearSet, countedCells, protectedKeys, firedSpecials);
      const flight = firedSpecials.find((item) => item.row === butterfly.row && item.col === butterfly.col);
      if (flight && flight.target) this.activateSpecial(other.special, flight.target, clearSet, countedCells, protectedKeys, firedSpecials);
    } else if (hasPair('rainbow', 'butterfly')) {
      const butterfly = get('butterfly');
      this.activateSpecial('butterfly', butterfly, clearSet, countedCells, protectedKeys, firedSpecials);
      const flight = firedSpecials.find((item) => item.row === butterfly.row && item.col === butterfly.col);
      if (flight && flight.target) {
        const targetType = this.grid[flight.target.row][flight.target.col].type;
        this.activateSpecial('rainbow', flight.target, clearSet, countedCells, protectedKeys, firedSpecials, targetType);
      }
    } else if (hasPair('rainbow', 'rainbow')) {
      firedSpecials.push({ row: first.row, col: first.col, special: 'rainbow', combo: true, fullBoard: true });
      firedSpecials.push({ row: second.row, col: second.col, special: 'rainbow', combo: true, fullBoard: true });
      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          if (this.activeMask[r][c]) this.addToClearSet(clearSet, countedCells, r, c, protectedKeys, firedSpecials);
        }
      }
    } else if (hasPair('rainbow', 'rocket-row') || hasPair('rainbow', 'rocket-col') || hasPair('rainbow', 'pumpkin')) {
      const rainbow = get('rainbow');
      const other = first === rainbow ? second : first;
      const targetType = other.type;
      const lanes = new Set();
      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          if (!this.activeMask[r][c] || this.grid[r][c].type !== targetType) continue;
          if (other.special === 'pumpkin') {
            this.activateSpecial('pumpkin', { row: r, col: c }, clearSet, countedCells, protectedKeys, firedSpecials);
          } else {
            const laneKey = other.special === 'rocket-row' ? 'r' + r : 'c' + c;
            if (lanes.has(laneKey)) continue;
            lanes.add(laneKey);
            this.activateSpecial(other.special, { row: r, col: c }, clearSet, countedCells, protectedKeys, firedSpecials);
          }
        }
      }
    } else if (first.special === 'butterfly' && second.special === 'butterfly') {
      this.activateSpecial('butterfly', first, clearSet, countedCells, protectedKeys, firedSpecials);
      this.activateSpecial('butterfly', second, clearSet, countedCells, protectedKeys, firedSpecials);
    } else if ((first.special === 'pumpkin' && second.special.startsWith('rocket-')) ||
               (second.special === 'pumpkin' && first.special.startsWith('rocket-'))) {
      const rocket = first.special.startsWith('rocket-') ? first : second;
      const rows = rocket.special === 'rocket-row';
      const lanes = rows ? [-1, 0, 1].map((offset) => rocket.row + offset) : [-1, 0, 1].map((offset) => rocket.col + offset);
      lanes.forEach((lane) => {
        if (lane < 0 || lane >= this.size) return;
        const pos = rows ? { row: lane, col: rocket.col } : { row: rocket.row, col: lane };
        this.activateSpecial(rocket.special, pos, clearSet, countedCells, protectedKeys, firedSpecials);
      });
    }

    sourceCells.forEach((cell, index) => { cell.special = sourceSpecials[index]; });

    // Партнёры комбо уже использовали объединённый эффект; помечаем их,
    // чтобы обычная цепная обработка не запустила каждую фишку повторно.
    [combo.first, combo.second].forEach((source) => {
      if (!firedSpecials.some((item) => item.row === source.row && item.col === source.col)) {
        firedSpecials.push({ row: source.row, col: source.col, special: source.special, combo: true,
          fullBoard: first.special === 'rainbow' && second.special === 'rainbow' });
      }
    });
    return comboKeys;
  },

  addToClearSet(cellsToClear, countedCells, r, c, protectedKeys, firedSpecials) {
    const key = r + '_' + c;
    // клетка зарезервирована под новую ракету в этом же ходе — чужой взрыв
    // не должен её "проглатывать", иначе она станет невидимой, но останется
    // занятой в данных поля (баг с "пустой" клеткой, которая не заполняется)
    if (protectedKeys && protectedKeys.has(key)) return;
    if (cellsToClear.has(key)) return;
    const cell = this.grid[r][c];
    cellsToClear.set(key, { row: r, col: c });
    countedCells.push({ row: r, col: c, type: cell.type });
    // цепная реакция: задетая спецфишка тоже активируется.
    if (cell.special) {
      this.activateSpecial(cell.special, { row: r, col: c }, cellsToClear, countedCells, protectedKeys, firedSpecials);
    }
  },

  // positions: массив {row, col, special} — рисует луч на всю
  // строку/столбец и яркую вспышку в точке каждой сработавшей ракеты.
  drawBeamsForRockets(positions) {
    positions.forEach((pos) => {
      const beam = document.createElement('div');
      const size = this.cellSize;
      if (pos.special === 'rocket-row') {
        beam.className = 'rocket-beam horizontal';
        beam.style.left = '0px';
        beam.style.top = (pos.row * size + size * 0.32) + 'px';
        beam.style.width = (size * this.size) + 'px';
        beam.style.height = (size * 0.36) + 'px';
      } else {
        beam.className = 'rocket-beam vertical';
        beam.style.top = '0px';
        beam.style.left = (pos.col * size + size * 0.32) + 'px';
        beam.style.height = (size * this.size) + 'px';
        beam.style.width = (size * 0.36) + 'px';
      }
      this.gridEl.appendChild(beam);
      setTimeout(() => beam.remove(), 660);

      // яркая короткая вспышка в самой точке ракеты — усиливает ощущение
      // "выстрела" в момент срабатывания, отдельно от длинного луча
      const flash = document.createElement('div');
      flash.className = 'rocket-flash';
      flash.style.width = size + 'px';
      flash.style.height = size + 'px';
      flash.style.transform = `translate(${pos.col * size}px, ${pos.row * size}px)`;
      this.gridEl.appendChild(flash);
      setTimeout(() => flash.remove(), 480);
    });
  },

  // Баннер "КОМБО ×N" при автоматических цепочках комбинаций (каскадах).
  showComboBanner(level) {
    const banner = document.createElement('div');
    banner.className = 'combo-banner';
    banner.textContent = t('combo') + level;
    this.gridEl.appendChild(banner);
    setTimeout(() => banner.remove(), 700);
  },

  // Лёгкая встряска поля — усиливает ощущение мощного каскада.
  shakeBoard() {
    this.gridEl.classList.remove('shake');
    void this.gridEl.offsetWidth; // форсируем reflow, чтобы анимация могла перезапуститься
    this.gridEl.classList.add('shake');
    setTimeout(() => this.gridEl.classList.remove('shake'), 380);
  },

  // Строит план очистки, создания спецфишек и зачёта целей уровня.
  buildClearPlan(runs, swapAnchor, forcedAction = null) {
    const clearSet = new Map();
    const countedCells = [];
    const countedKeys = new Set();
    const specialsToCreate = [];
    const firedSpecials = [];
    const protectedKeys = new Set();
    const candidates = [];
    const keyOf = (cell) => cell.row + '_' + cell.col;
    const containsSwapAnchor = (cells) => !!swapAnchor && cells.some((cell) =>
      cell.row === swapAnchor.row && cell.col === swapAnchor.col);

    // 5+ в линию создаёт радужный цветок; 4 — ракету.
    runs.forEach((run) => {
      if (run.shape === 'square') {
        candidates.push({ special: 'butterfly', cells: run.cells, type: run.type, priority: 2 });
      } else if (run.length >= 5) {
        candidates.push({ special: 'rainbow', cells: run.cells, type: run.type, priority: 4 });
      } else if (run.length === 4) {
        candidates.push({ special: run.orientation === 'h' ? 'rocket-row' : 'rocket-col', cells: run.cells, type: run.type, priority: 1 });
      }
    });

    // Пересечение горизонтальной и вертикальной серий одного цвета — тыква.
    runs.filter((run) => run.orientation === 'h').forEach((horizontal) => {
      runs.filter((run) => run.orientation === 'v' && run.type === horizontal.type).forEach((vertical) => {
        const intersection = horizontal.cells.find((h) => vertical.cells.some((v) => v.row === h.row && v.col === h.col));
        if (!intersection) return;
        const cells = [...new Map([...horizontal.cells, ...vertical.cells].map((cell) => [keyOf(cell), cell])).values()];
        const anchorOrder = [intersection, ...cells.filter((cell) => keyOf(cell) !== keyOf(intersection))];
        candidates.push({ special: 'pumpkin', cells, anchors: anchorOrder, type: horizontal.type, priority: 3 });
      });
    });

    // Приоритеты: радужный цветок, тыква, бабочка, ракета. Якорь стараемся
    // поставить на фишку, которой игрок завершил ход; спецфишки не затираем.
    candidates.sort((a, b) => b.priority - a.priority || Number(containsSwapAnchor(b.cells)) - Number(containsSwapAnchor(a.cells)));
    candidates.forEach((candidate) => {
      if (candidate.cells.some((cell) => protectedKeys.has(keyOf(cell)))) return;
      const cells = candidate.anchors || candidate.cells;
      const preferred = cells.find((cell) => containsSwapAnchor([cell]));
      const middle = Math.floor(cells.length / 2);
      const ordered = preferred
        ? [preferred, ...cells.filter((cell) => cell !== preferred)]
        : [...cells.slice(middle), ...cells.slice(0, middle)];
      const anchor = ordered.find((cell) => !this.grid[cell.row][cell.col].special && !this.isImmobile(this.grid[cell.row][cell.col]) && !protectedKeys.has(keyOf(cell)));
      if (!anchor) return;
      const key = keyOf(anchor);
      protectedKeys.add(key);
      specialsToCreate.push({ row: anchor.row, col: anchor.col, special: candidate.special, type: candidate.type });
    });

    // Основной проход по всем сериям: считаем элементы для очков/целей и
    // формируем очищаемое множество. countedKeys нужен, чтобы элемент на
    // пересечении горизонтальной и вертикальной серии (L/T-образный матч)
    // не засчитывался в очки/цели дважды.
    runs.forEach((run) => {
      run.cells.forEach((cell) => {
        const key = cell.row + '_' + cell.col;
        if (!countedKeys.has(key)) {
          countedKeys.add(key);
          countedCells.push({ row: cell.row, col: cell.col, type: run.type });
        }
        if (!protectedKeys.has(key) && !clearSet.has(key)) {
          clearSet.set(key, { row: cell.row, col: cell.col });
        }
      });
    });

    let comboKeys = new Set();
    if (forcedAction && forcedAction.kind === 'rainbow') {
      const key = forcedAction.row + '_' + forcedAction.col;
      const cell = this.grid[forcedAction.row][forcedAction.col];
      if (cell.special === 'rainbow') {
        comboKeys.add(key);
        if (!countedKeys.has(key)) {
          countedKeys.add(key);
          countedCells.push({ row: forcedAction.row, col: forcedAction.col, type: cell.type });
        }
        if (!clearSet.has(key)) clearSet.set(key, { row: forcedAction.row, col: forcedAction.col });
        this.activateSpecial('rainbow', forcedAction, clearSet, countedCells, protectedKeys, firedSpecials, forcedAction.targetType);
      }
    } else if (forcedAction && forcedAction.kind === 'combo') {
      comboKeys = this.applySpecialCombo(forcedAction, clearSet, countedCells, countedKeys, protectedKeys, firedSpecials);
    }

    // Спецфишки, попавшие в комбинацию, запускают свои эффекты и цепочки.
    clearSet.forEach((pos) => {
      const cell = this.grid[pos.row][pos.col];
      if (cell.special && !comboKeys.has(pos.row + '_' + pos.col)) {
        this.activateSpecial(cell.special, pos, clearSet, countedCells, protectedKeys, firedSpecials);
      }
    });

    const cageHitKeys = new Set();
    const iceHitKeys = new Set();
    clearSet.forEach(({ row, col }) => {
      const cell = this.grid[row][col];
      const key = row + '_' + col;
      if (this.isCaged(cell)) cageHitKeys.add(key);
      if (this.isFrozen(cell)) iceHitKeys.add(key);
      [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
        const nr = row + dr, nc = col + dc;
        if (this.inBounds(nr, nc) && this.isCaged(this.grid[nr][nc])) cageHitKeys.add(nr + '_' + nc);
      });
    });
    const blockedKeys = new Set([...cageHitKeys, ...iceHitKeys]);
    blockedKeys.forEach((key) => clearSet.delete(key));
    const countedAfterObstacles = countedCells.filter((cell) => !blockedKeys.has(cell.row + '_' + cell.col));
    const specialsAfterObstacles = specialsToCreate.filter((item) => !blockedKeys.has(item.row + '_' + item.col));
    const toPositions = (keys) => Array.from(keys, (key) => {
      const [row, col] = key.split('_').map(Number);
      return { row, col };
    });
    return {
      clearSet,
      countedCells: countedAfterObstacles,
      specialsToCreate: specialsAfterObstacles,
      firedSpecials,
      cageHitsToDamage: toPositions(cageHitKeys),
      iceHitsToDamage: toPositions(iceHitKeys),
    };
  },

  async playMatchEffects(result, cascadeLevel) {
    Sound.play('match');
    const specialBonus = result.specialsToCreate.length * 100 + result.firedSpecials.length * 50;
    if (result.specialsToCreate.some((item) => item.special === 'rocket-row' || item.special === 'rocket-col')) Sound.play('rocketCreate');
    const firedRockets = result.firedSpecials.filter((item) => item.special === 'rocket-row' || item.special === 'rocket-col');
    if (firedRockets.length > 0) {
      Sound.play('rocketUse');
      this.drawBeamsForRockets(firedRockets);
    }
    if (result.firedSpecials.length > 0) this.drawSpecialEffects(result.firedSpecials);
    const gained = this.addScore(result.countedCells, cascadeLevel, specialBonus);
    const variant = firedRockets.length > 0 ? 'rocket' : undefined;
    this.showScorePopup(result.countedCells, gained, cascadeLevel, variant);
    await this.playClearAnimation(result.clearSet);
    result.specialsToCreate.forEach((info) => this.turnIntoSpecial(info));
    if (result.specialsToCreate.length > 0) this.pulseSpecialBirth(result.specialsToCreate);
  },

  drawSpecialEffects(firedSpecials) {
    const size = this.cellSize;
    firedSpecials.forEach((activation) => {
      if (activation.special === 'pumpkin') {
        const burst = document.createElement('div');
        burst.className = 'pumpkin-burst';
        const radius = activation.blastRadius || 1;
        const diameter = size * (radius * 2 + 1);
        burst.style.width = diameter + 'px';
        burst.style.height = diameter + 'px';
        burst.style.left = ((activation.col - radius) * size) + 'px';
        burst.style.top = ((activation.row - radius) * size) + 'px';
        this.gridEl.appendChild(burst);
        setTimeout(() => burst.remove(), 520);
      } else if (activation.special === 'butterfly' && activation.target) {
        const flight = document.createElement('img');
        flight.className = 'butterfly-flight';
        flight.src = SPECIAL_IMAGES.butterfly;
        flight.alt = '';
        flight.setAttribute('aria-hidden', 'true');
        flight.style.width = size * 0.82 + 'px';
        flight.style.height = size * 0.82 + 'px';
        flight.style.left = (activation.col * size + size * 0.09) + 'px';
        flight.style.top = (activation.row * size + size * 0.09) + 'px';
        flight.style.setProperty('--flight-x', ((activation.target.col - activation.col) * size) + 'px');
        flight.style.setProperty('--flight-y', ((activation.target.row - activation.row) * size) + 'px');
        this.gridEl.appendChild(flight);
        setTimeout(() => flight.remove(), 620);
      } else if (activation.special === 'rainbow') {
        const flash = document.createElement('div');
        flash.className = activation.fullBoard ? 'rainbow-flash all-board' : 'rainbow-flash';
        flash.style.left = activation.fullBoard ? '0px' : (activation.col * size) + 'px';
        flash.style.top = activation.fullBoard ? '0px' : (activation.row * size) + 'px';
        flash.style.width = (activation.fullBoard ? this.size : 1) * size + 'px';
        flash.style.height = (activation.fullBoard ? this.size : 1) * size + 'px';
        this.gridEl.appendChild(flash);
        setTimeout(() => flash.remove(), 576);
      }
    });
  },

  turnIntoSpecial(specialInfo) {
    const cell = this.grid[specialInfo.row][specialInfo.col];
    cell.special = specialInfo.special;
    this.updateTileVisual(cell);
    // Новый спецэлемент должен остаться видимым после матча.
    cell.el.classList.remove('matched');
  },

  // Яркая вспышка подчёркивает появление новой спецфишки.
  pulseSpecialBirth(specialsToCreate) {
    const size = this.cellSize;
    specialsToCreate.forEach(({ row, col }) => {
      // внешний div отвечает только за позицию (transform: translate),
      // внутренний — за анимацию (transform: scale). Если бы scale был
      // на том же элементе что и translate, CSS-анимация перезаписала бы
      // инлайн-позицию, и вспышка "улетела" бы в угол поля.
      const burst = document.createElement('div');
      burst.className = 'rocket-birth';
      burst.style.width = size + 'px';
      burst.style.height = size + 'px';
      burst.style.transform = `translate(${col * size}px, ${row * size}px)`;
      const inner = document.createElement('div');
      inner.className = 'rocket-birth-inner';
      burst.appendChild(inner);
      this.gridEl.appendChild(burst);
      setTimeout(() => burst.remove(), 780);
    });
  },

  async playClearAnimation(clearSet) {
    // при очень больших очистках (длинная линия ракеты, крупный каскад)
    // снижаем число искр на клетку, чтобы не перегружать слабые устройства
    const particlesPerCell = clearSet.size > 16 ? 1 : 3;
    clearSet.forEach((pos) => {
      const cell = this.grid[pos.row][pos.col];
      if (cell.el) {
        cell.el.classList.add('matched');
        Sound.play('destroy');
        this.spawnSparkles(pos.row, pos.col, cell.type, particlesPerCell);
      }
    });
    await delay(230);
  },

  // Мелкие цветные искры, разлетающиеся из точки уничтоженного элемента —
  // добавляют ощущения "хруста"/отклика к простому исчезновению плитки.
  spawnSparkles(row, col, type, count) {
    const size = this.cellSize;
    const cx = col * size + size / 2;
    const cy = row * size + size / 2;
    const color = SPARKLE_COLORS[type] || '#ffe38a';
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = size * (0.35 + Math.random() * 0.4);
      const p = document.createElement('div');
      p.className = 'sparkle';
      p.style.left = cx + 'px';
      p.style.top = cy + 'px';
      p.style.background = color;
      p.style.setProperty('--dx', (Math.cos(angle) * dist).toFixed(1) + 'px');
      p.style.setProperty('--dy', (Math.sin(angle) * dist).toFixed(1) + 'px');
      this.gridEl.appendChild(p);
      setTimeout(() => p.remove(), 420);
    }
  },

  // Начисляет очки за очищенные клетки с учётом множителя каскада
  // (ограниченного MAX_CASCADE_MULTIPLIER — см. константу выше) и
  // необязательного бонуса за спецэлемент (создание/использование ракеты).
  // Возвращает, сколько очков было начислено — для всплывающей подписи.
  // cascadeLevel: 1 — комбинация, сделанная самим игроком (50 очков за
  // элемент); 2, 3, 4... — каждая следующая автоматическая комбинация от
  // падения элементов в рамках того же хода (100, 150, 200, 250 очков —
  // дальше множитель больше не растёт).
  addScore(countedCells, cascadeLevel, bonus = 0) {
    if (countedCells.length === 0 && bonus === 0) return 0;
    const mult = Math.min(cascadeLevel, MAX_CASCADE_MULTIPLIER);
    const gained = countedCells.length * POINTS_PER_GEM * mult + bonus;
    this.score += gained;
    return gained;
  },

  // Всплывающая надпись с очками — появляется по центру уничтоженной
  // комбинации, слегка "выскакивает" с увеличением, затем плавно уходит
  // вверх и исчезает (см. keyframes popup-rise в style.css). Крупные
  // комбинации и очки от ракет выделяются собственным стилем (крупнее/ярче).
  showScorePopup(countedCells, gained, cascadeLevel, variant) {
    if (countedCells.length === 0 || gained <= 0) return;
    const avgRow = countedCells.reduce((s, c) => s + c.row, 0) / countedCells.length;
    const avgCol = countedCells.reduce((s, c) => s + c.col, 0) / countedCells.length;

    const popup = document.createElement('div');
    popup.className = 'score-popup';
    if (gained >= 400) popup.classList.add('score-popup-big');
    if (variant === 'rocket') popup.classList.add('score-popup-rocket');
    popup.textContent = '+' + gained;
    popup.style.left = (avgCol * this.cellSize + this.cellSize * 0.5) + 'px';
    popup.style.top = (avgRow * this.cellSize + this.cellSize * 0.5) + 'px';
    this.gridEl.appendChild(popup);
    setTimeout(() => popup.remove(), 850);
  },

  applyObstacleHits(result) {
    (result.cageHitsToDamage || []).forEach(({ row, col }) => {
      const cell = this.grid[row][col];
      if (!this.isCaged(cell)) return;
      cell.cageHits = Math.max(0, cell.cageHits - 1);
      if (cell.cageHits === 0) {
        this.cagesFreed++;
        const overlay = cell.el && cell.el.querySelector('.roots-overlay');
        if (overlay) overlay.classList.add('roots-breaking');
        if (cell.el) cell.el.classList.add('roots-freed');
        setTimeout(() => {
          if (cell.el) {
            this.updateTileVisual(cell);
            cell.el.classList.remove('roots-freed');
          }
        }, 260);
      } else {
        this.updateTileVisual(cell);
        const overlay = cell.el && cell.el.querySelector('.roots-overlay');
        if (overlay) overlay.classList.add('roots-hit');
        setTimeout(() => overlay && overlay.classList.remove('roots-hit'), 460);
      }
    });
    (result.iceHitsToDamage || []).forEach(({ row, col }) => {
      const cell = this.grid[row][col];
      if (!this.isFrozen(cell)) return;
      cell.iceHits = Math.max(0, cell.iceHits - 1);
      this.iceCleared++;
      const overlay = cell.el && cell.el.querySelector('.ice-overlay');
      if (overlay) overlay.classList.add('ice-breaking');
      if (cell.el) cell.el.classList.add('ice-freed');
      setTimeout(() => {
        if (cell.el) {
          this.updateTileVisual(cell);
          cell.el.classList.remove('ice-freed');
        }
      }, 260);
    });
  },
  registerClearedGems(countedCells, cascadeLevel) {
    countedCells.forEach((c) => {
      this.collected[c.type] = (this.collected[c.type] || 0) + 1;
    });
  },

  /* ---------- гравитация и заполнение ---------- */

  async collapseAndRefill(clearSet, specialsToCreate, animate = true) {
    const fillingGrid = this.grid;
    const specialKeys = new Set((specialsToCreate || []).map((special) => special.row + '_' + special.col));
    clearSet.forEach((pos) => {
      const key = pos.row + '_' + pos.col;
      if (specialKeys.has(key) || !this.activeMask[pos.row][pos.col]) return;
      const cell = this.grid[pos.row][pos.col];
      if (cell.el) cell.el.remove();
      this.grid[pos.row][pos.col] = { type: null, special: null, el: null, active: true, cageHits: 0, iceHits: 0 };
    });
    const collapseChunk = (col, top, bottom) => {
      if (top > bottom) return;
      const columnCells = [];
      for (let row = bottom; row >= top; row--) if (this.grid[row][col].type !== null) columnCells.push(this.grid[row][col]);
      const chunkHeight = bottom - top + 1;
      const missing = chunkHeight - columnCells.length;
      for (let i = 0; i < columnCells.length; i++) {
        const targetRow = bottom - i;
        const cell = columnCells[i];
        this.grid[targetRow][col] = cell;
        if (cell.el) { cell.el.dataset.row = targetRow; cell.el.dataset.col = col; }
      }
      for (let i = 0; i < missing; i++) {
        const targetRow = top + missing - 1 - i;
        const cellData = { type: randomGem(), special: null, el: null, active: true, cageHits: 0, iceHits: 0 };
        this.grid[targetRow][col] = cellData;
        const el = this.createTileEl(cellData, targetRow, col);
        this.placeTile(el, animate ? targetRow - missing - 1 : targetRow, col, false);
        this.gridEl.appendChild(el);
        cellData.el = el;
      }
    };
    for (let col = 0; col < this.size; col++) {
      this.columnSegments[col].forEach((segment) => {
        let chunkTop = segment.top;
        for (let row = segment.top; row <= segment.bottom; row++) {
          if (!this.isImmobile(this.grid[row][col])) continue;
          collapseChunk(col, chunkTop, row - 1);
          chunkTop = row + 1;
        }
        collapseChunk(col, chunkTop, segment.bottom);
      });
    }
    if (animate) await new Promise(requestAnimationFrame);
    // Пропуск финала может открыть следующий уровень до следующего кадра.
    if (this.grid !== fillingGrid) return;
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const cell = this.grid[row][col];
        if (cell.el) this.placeTile(cell.el, row, col, animate);
      }
    }
    if (animate) await delay(300);
  },
  async ensurePossibleMove() {
    for (let attempt = 0; attempt < 3; attempt++) {
      if (this.hasAnyPossibleMove()) return true;
      if (await this.reshuffleBoard() === false) break;
    }
    if (this.hasAnyPossibleMove()) return true;
    // Do not record defeat or overwrite the last stable endless checkpoint.
    this.outcome = 'board-error';
    this.busy = false;
    this.stopIdleHint();
    goToMap();
    showToast(currentLanguage === 'en'
      ? 'Could not shuffle the board. Please reopen the level.'
      : 'Не удалось перемешать поле. Открой уровень ещё раз.', 5000);
    return false;
  },

  async reshuffleBoard() {
    const tiles = [];
    const flatTypes = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const cell = this.grid[r][c];
        flatTypes.push(cell.type);
        if (cell.active && !this.isImmobile(cell)) tiles.push(cell);
      }
    }
    const activeIdx = [];
    for (let i = 0; i < flatTypes.length; i++) {
      const row = Math.floor(i / this.size), col = i % this.size;
      if (flatTypes[i] !== null && !this.isImmobile(this.grid[row][col])) activeIdx.push(i);
    }

    tiles.forEach((cell) => cell.el.classList.add('shuffle-out'));
    await delay(190);

    // Тасуем только активные клетки и повторяем до корректного поля:
    // без готовых комбинаций и хотя бы с одним допустимым ходом.
    let valid = false;
    for (let attempt = 0; attempt < 200; attempt++) {
      for (let i = activeIdx.length - 1; i > 0; i--) {
        const j = randomInt(i + 1);
        const ii = activeIdx[i], jj = activeIdx[j];
        [flatTypes[ii], flatTypes[jj]] = [flatTypes[jj], flatTypes[ii]];
      }
      if (!this.wouldHaveInitialMatches(flatTypes) && this.wouldHaveAnyMove(flatTypes)) {
        valid = true;
        break;
      }
    }
    if (!valid) {
      tiles.forEach(cell => cell.el.classList.remove('shuffle-out'));
      return false;
    }

    let idx = 0;
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const cell = this.grid[r][c];
        const newType = flatTypes[idx++];
        if (!cell.active) continue;
        cell.type = newType;
        this.updateTileVisual(cell);
      }
    }

    tiles.forEach((cell) => {
      cell.el.classList.remove('shuffle-out');
      cell.el.style.setProperty('--shuffle-delay', Math.floor(Math.random() * 120) + 'ms');
      cell.el.classList.add('shuffle-in');
    });
    await delay(430);
    tiles.forEach((cell) => {
      cell.el.classList.remove('shuffle-in');
      cell.el.style.removeProperty('--shuffle-delay');
    });
    return true;
  },
  wouldHaveInitialMatches(flatTypes) {
    const get = (r, c) => this.isCaged(this.grid[r][c]) ? null : flatTypes[r * this.size + c];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (get(r, c) === null) continue; // дыра формы поля — не может быть частью матча
        if (c >= 2 && get(r, c) === get(r, c - 1) && get(r, c) === get(r, c - 2)) return true;
        if (r >= 2 && get(r, c) === get(r - 1, c) && get(r, c) === get(r - 2, c)) return true;
        if (r < this.size - 1 && c < this.size - 1 &&
            get(r, c) === get(r, c + 1) && get(r, c) === get(r + 1, c) && get(r, c) === get(r + 1, c + 1)) return true;
      }
    }
    return false;
  },

  wouldHaveAnyMove(flatTypes) {
    const clone = [];
    for (let r = 0; r < this.size; r++) {
      clone.push(flatTypes.slice(r * this.size, r * this.size + this.size).map((type, c) => this.isCaged(this.grid[r][c]) ? null : type));
    }
    return this.hasAnyRainbowSwap() || this.hasAnyPossibleMoveOnGrid(clone);
  },

  /* ---------- ненавязчивая подсказка после бездействия ---------- */

  stopIdleHint() {
    clearTimeout(this.idleHintTimer);
    this.idleHintTimer = null;
    if (this.gridEl) this.gridEl.querySelectorAll('.gem.idle-hint').forEach((el) => el.classList.remove('idle-hint'));
  },

  scheduleIdleHint(delayMs = 8500) {
    clearTimeout(this.idleHintTimer);
    this.idleHintTimer = null;
    if (!this.level || (this.tutorialMove && this.tutorialMove.active) || this.moves <= 0) return;
    this.idleHintTimer = setTimeout(() => this.showIdleHint(), delayMs);
  },

  resetIdleHint() {
    this.stopIdleHint();
    this.scheduleIdleHint();
  },

  showIdleHint() {
    this.idleHintTimer = null;
    if (!this.level || !this.gridEl || !$('screen-game').classList.contains('active') || this.busy ||
        (this.tutorialMove && this.tutorialMove.active) || this.moves <= 0) return;
    if (this.selected) { this.scheduleIdleHint(3500); return; }

    const move = this.findPossibleHintMove();
    if (!move) { this.scheduleIdleHint(2500); return; }
    move.forEach(({ row, col }) => {
      const cell = this.grid[row][col];
      if (cell && cell.el) cell.el.classList.add('idle-hint');
    });
    this.idleHintTimer = setTimeout(() => {
      this.stopIdleHint();
      this.scheduleIdleHint(11500);
    }, 1350);
  },

  findPossibleHintMove() {
    // Радужный цветок активируется прямым обменом с соседней фишкой.
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const cell = this.grid[row][col];
        if (cell.special !== 'rainbow' || this.isImmobile(cell)) continue;
        for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
          const nr = row + dr, nc = col + dc;
          if (this.inBounds(nr, nc) && this.activeMask[nr][nc] && !this.isImmobile(this.grid[nr][nc])) {
            return [{ row, col }, { row: nr, col: nc }];
          }
        }
      }
    }

    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const first = this.grid[row][col];
        if (!first.active || this.isImmobile(first)) continue;
        for (const [dr, dc] of [[0, 1], [1, 0]]) {
          const nr = row + dr, nc = col + dc;
          if (!this.inBounds(nr, nc)) continue;
          const second = this.grid[nr][nc];
          if (!second.active || this.isImmobile(second)) continue;
          if (first.special && second.special) return [{ row, col }, { row: nr, col: nc }];

          const firstType = first.type, secondType = second.type;
          let createsMatch = false;
          first.type = secondType;
          second.type = firstType;
          try { createsMatch = this.findMatches().length > 0; }
          finally { first.type = firstType; second.type = secondType; }
          if (createsMatch) return [{ row, col }, { row: nr, col: nc }];
        }
      }
    }
    return null;
  },

  /* ---------- проверка наличия возможного хода ---------- */

  hasAnyPossibleMove() {
    const typesGrid = this.grid.map((row) => row.map((cell) => this.isCaged(cell) ? null : cell.type));
    return this.hasAnyRainbowSwap() || this.hasAnyPossibleMoveOnGrid(typesGrid);
  },

  hasAnyRainbowSwap() {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.grid[row][col].special !== 'rainbow' || this.isImmobile(this.grid[row][col])) continue;
        const neighbors = [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]];
        if (neighbors.some(([r, c]) => this.inBounds(r, c) && this.activeMask[r][c] && !this.isImmobile(this.grid[r][c]))) return true;
      }
    }
    return false;
  },
  hasAnyPossibleMoveOnGrid(typesGrid) {
    const size = this.size;
    const matchAt = (g, r, c) => {
      const t = g[r][c];
      if (t == null) return false;
      if (c >= 2 && g[r][c - 1] === t && g[r][c - 2] === t) return true;
      if (c <= size - 3 && g[r][c + 1] === t && g[r][c + 2] === t) return true;
      if (c >= 1 && c <= size - 2 && g[r][c - 1] === t && g[r][c + 1] === t) return true;
      if (r >= 2 && g[r - 1][c] === t && g[r - 2][c] === t) return true;
      if (r <= size - 3 && g[r + 1][c] === t && g[r + 2][c] === t) return true;
      if (r >= 1 && r <= size - 2 && g[r - 1][c] === t && g[r + 1][c] === t) return true;
      for (let top = Math.max(0, r - 1); top <= Math.min(r, size - 2); top++) {
        for (let left = Math.max(0, c - 1); left <= Math.min(c, size - 2); left++) {
          if (g[top][left] === t && g[top][left + 1] === t &&
              g[top + 1][left] === t && g[top + 1][left + 1] === t) return true;
        }
      }
      return false;
    };

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (c < size - 1 && typesGrid[r][c] !== null && typesGrid[r][c + 1] !== null && !this.isImmobile(this.grid[r][c]) && !this.isImmobile(this.grid[r][c + 1])) {
          [typesGrid[r][c], typesGrid[r][c + 1]] = [typesGrid[r][c + 1], typesGrid[r][c]];
          if (matchAt(typesGrid, r, c) || matchAt(typesGrid, r, c + 1)) {
            [typesGrid[r][c], typesGrid[r][c + 1]] = [typesGrid[r][c + 1], typesGrid[r][c]];
            return true;
          }
          [typesGrid[r][c], typesGrid[r][c + 1]] = [typesGrid[r][c + 1], typesGrid[r][c]];
        }
        if (r < size - 1 && typesGrid[r][c] !== null && typesGrid[r + 1][c] !== null && !this.isImmobile(this.grid[r][c]) && !this.isImmobile(this.grid[r + 1][c])) {
          [typesGrid[r][c], typesGrid[r + 1][c]] = [typesGrid[r + 1][c], typesGrid[r][c]];
          if (matchAt(typesGrid, r, c) || matchAt(typesGrid, r + 1, c)) {
            [typesGrid[r][c], typesGrid[r + 1][c]] = [typesGrid[r + 1][c], typesGrid[r][c]];
            return true;
          }
          [typesGrid[r][c], typesGrid[r + 1][c]] = [typesGrid[r + 1][c], typesGrid[r][c]];
        }
      }
    }
    return false;
  },

  /* ---------- HUD ---------- */

  renderHud() {
    $('btn-game-help').classList.toggle('hidden', this.level.id !== 1);
    $('hud-level-title').textContent = this.level.mode === 'endless'
      ? t('endlessStage', { stage: this.level.stage }) : levelTitle(this.level.id).toUpperCase();
    $('hud-moves').textContent = this.victoryDisplayMoves ?? this.moves;
    $('hud-moves').classList.toggle('warn', !this.outcome && this.moves <= 5);
    $('hud-score').textContent = formatNumber(this.victoryDisplayScore ?? this.score);

    const goalsEl = $('hud-goals');
    goalsEl.innerHTML = '';
    this.level.goals.forEach((goal) => {
      const chip = document.createElement('div');
      chip.className = 'goal-chip';
      if (this.isGoalComplete(goal)) chip.classList.add('done');
      const icon = makeGoalIcon(goal);
      const text = document.createElement('span');
      text.textContent = this.goalProgressText(goal);
      chip.appendChild(icon);
      chip.appendChild(text);
      goalsEl.appendChild(chip);
    });

    this.renderScoreBar();
  },

  // Первая отметка — победа, вторая и третья — единые пороги очков.
  renderScoreBar() {
    const endless = this.level.mode === 'endless';
    $('score-bar').style.display = endless ? 'none' : '';
    if (endless) {
      $('hud-star-rules').textContent = t('endlessHud', { stages: this.level.stage - 1, reward: Endless.moveReward(this.level.stage) });
      return;
    }
    const thresholds = [0, this.level.starThresholds[1], this.level.starThresholds[2]];
    const displayedScore = this.victoryDisplayScore ?? this.score;
    const maxThreshold = thresholds[thresholds.length - 1];
    const fillPct = Math.max(0, Math.min(100, (displayedScore / maxThreshold) * 100));

    $('score-bar-fill').style.width = fillPct + '%';

    thresholds.forEach((threshold, i) => {
      const starEl = $('score-bar-star-' + i);
      if (!starEl) return;
      starEl.style.left = (threshold / maxThreshold) * 100 + '%';
      starEl.classList.toggle('filled', i === 0 ? this.allGoalsComplete() : displayedScore >= threshold);
      starEl.title = i === 0 ? t('firstStar') : t(i === 1 ? 'nextStar2' : 'nextStar3', { score: formatNumber(threshold) });
    });
    $('hud-star-rules').textContent = starRulesDescription(this.level);
  },

  goalProgressText(goal) {
    if (this.level.mode === 'endless') {
      const current = goal.type === 'collect' ? this.collected[goal.gem] || 0
        : goal.type === 'cage' ? this.cagesFreed : this.iceCleared;
      return `${Math.max(0, Math.min(current, goal.amount) - goal.start)}/${goal.amount - goal.start}`;
    }
    if (goal.type === 'collect') {
      const have = Math.min(this.collected[goal.gem] || 0, goal.amount);
      return `${have}/${goal.amount}`;
    }
    if (goal.type === 'score') {
      const have = Math.min(this.score, goal.amount);
      return `${have}/${goal.amount}`;
    }
    if (goal.type === 'cage') return `${Math.min(this.cagesFreed, goal.amount)}/${goal.amount}`;
    if (goal.type === 'ice') return `${Math.min(this.iceCleared, goal.amount)}/${goal.amount}`;
    return '';
  },

  isGoalComplete(goal) {
    if (goal.type === 'collect') return (this.collected[goal.gem] || 0) >= goal.amount;
    if (goal.type === 'score') return this.score >= goal.amount;
    if (goal.type === 'cage') return this.cagesFreed >= goal.amount;
    if (goal.type === 'ice') return this.iceCleared >= goal.amount;
    return false;
  },

  allGoalsComplete() {
    return this.level.goals.every((g) => this.isGoalComplete(g));
  },

  /* ---------- завершение уровня ---------- */

  afterMoveChecks() {
    if (this.outcome) return;
    if (this.level.mode === 'endless') return Endless.afterMove();
    if (this.allGoalsComplete()) {
      this.stopIdleHint();
      this.onWin();
      return;
    }
    if (this.moves <= 0) {
      this.stopIdleHint();
      this.onLose();
      return;
    }
    this.scheduleIdleHint();
  },

  onWin() {
    if (this.outcome) return;
    this.outcome = 'won';
    this.busy = true;
    this.stopIdleHint();
    this.clearSelection();
    // Один общий взрыв с падением и заполнением поля. Новые каскады
    // не продлевают финал; пересечения и цепные реакции считаются один раз.
    const seeds = [];
    this.grid.forEach((row, r) => row.forEach((cell, c) => {
      if (cell.active && cell.special && !this.isImmobile(cell)) {
        seeds.push({ cells: [{ row: r, col: c }], type: cell.type, length: 1 });
      }
    }));
    const finalePlan = this.buildClearPlan(seeds, null);
    const baseScore = this.score;
    const specialBonus = finalePlan.countedCells.length * POINTS_PER_GEM + finalePlan.firedSpecials.length * 50;
    const moveBonus = this.moves * POINTS_PER_UNUSED_MOVE;
    this.score += specialBonus + moveBonus;
    this.victoryResult = { baseScore, specialBonus, moveBonus, movesLeft: this.moves, finalePlan };
    Sound.play('win');
    const levelId = this.level.id;
    const previousScore = Number(progress.bestScore[levelId]) || 0;
    const previousStars = Number(progress.bestStars[levelId]) || 0;
    const previousMoves = Number(progress.bestMoves[levelId]);
    const earnedStars = starsForResult(this.level, this.score);
    const newRecord = earnedStars > previousStars || this.score > previousScore ||
      (Number.isFinite(previousMoves) && this.moves > previousMoves);
    if (this.score > previousScore) progress.bestScore[levelId] = this.score;
    if (earnedStars > previousStars) progress.bestStars[levelId] = earnedStars;
    if (!Number.isFinite(previousMoves) || this.moves > previousMoves) progress.bestMoves[levelId] = this.moves;
    if (progress.unlockedLevel === this.level.id) {
      progress.unlockedLevel = Math.min(LEVELS.length + 1, this.level.id + 1);
    }
    saveProgress(progress);
    Object.assign(this.victoryResult, { earnedStars, previousStars, newRecord });
    this.playVictoryFinale(finalePlan);
  },

  playVictoryFinale(plan) {
    const result = this.victoryResult;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) { this.finishVictoryFinale(); return; }
    this.victoryDisplayScore = result.baseScore + result.specialBonus;
    this.victoryDisplayMoves = result.movesLeft;
    $('victory-finale').classList.remove('hidden');
    $('victory-finale').focus({ preventScroll: true });
    this.drawBeamsForRockets(plan.firedSpecials.filter((item) => item.special.startsWith('rocket-')));
    this.drawSpecialEffects(plan.firedSpecials);
    this.playClearAnimation(plan.clearSet);
    const started = performance.now();
    const update = () => {
      const elapsed = performance.now() - started;
      if (elapsed >= 240) this.refillVictoryBoard(true);
      const fraction = Math.max(0, Math.min(1, (elapsed - 600) / 900));
      const converted = Math.floor(result.movesLeft * fraction);
      this.victoryDisplayMoves = result.movesLeft - converted;
      this.victoryDisplayScore = result.baseScore + result.specialBonus + converted * POINTS_PER_UNUSED_MOVE;
      $('finale-detail').textContent = elapsed < 600 && plan.firedSpecials.length
        ? t('finaleSpecials') : t('finaleMoves', { score: formatNumber(converted * POINTS_PER_UNUSED_MOVE) });
      this.renderHud();
      if (elapsed >= 1800) this.finishVictoryFinale();
    };
    this.finaleTimer = setInterval(update, 40);
    update();
  },

  refillVictoryBoard(animate) {
    const result = this.victoryResult;
    if (!result || result.refilled) return;
    result.refilled = true;
    this.collapseAndRefill(result.finalePlan.clearSet, [], animate);
  },

  finishVictoryFinale() {
    if (this.outcome !== 'won' || !this.victoryResult) return;
    clearInterval(this.finaleTimer);
    this.finaleTimer = null;
    if (this.victoryResult.presented) return;
    this.refillVictoryBoard(false);
    // Мгновенно завершаем уже начавшееся падение при нажатии «пропустить».
    this.grid.forEach((row, r) => row.forEach((cell, c) => {
      if (cell.el) this.placeTile(cell.el, r, c, false);
    }));
    this.victoryResult.presented = true;
    this.victoryDisplayScore = null;
    this.victoryDisplayMoves = 0;
    $('victory-finale').classList.add('hidden');
    this.renderHud();
    this.renderWinSummary();
    $('modal-win').classList.remove('hidden');
    $('btn-win-next').focus({ preventScroll: true });
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) spawnConfetti($('modal-win'));
  },

  renderWinSummary() {
    const { earnedStars, previousStars, newRecord, baseScore, specialBonus, moveBonus, movesLeft } = this.victoryResult;
    const levelId = this.level.id;
    $('win-score').textContent = formatNumber(this.score);
    $('win-moves').textContent = movesLeft;
    $('win-base-score').textContent = formatNumber(baseScore);
    $('win-special-bonus').textContent = '+' + formatNumber(specialBonus);
    $('win-move-bonus').textContent = '+' + formatNumber(moveBonus);
    $('win-move-bonus-label').textContent = t('moveBonus', { moves: movesLeft, points: POINTS_PER_UNUSED_MOVE });
    renderStarsRow($('win-stars'), earnedStars, previousStars);
    $('win-record-badge').textContent = newRecord ? t('newRecord') : '';
    $('win-record-badge').classList.toggle('visible', newRecord);
    $('win-best-record').textContent = t('bestRecord', { score: formatNumber(progress.bestScore[levelId] || this.score), moves: progress.bestMoves[levelId] ?? this.moves });
    $('win-star-hint').textContent = nextStarDescription(this.level, earnedStars);
  },

  onLose() {
    if (this.outcome) return;
    this.outcome = 'lost';
    this.busy = true;
    this.stopIdleHint();
    Sound.play('lose');
    this.renderLoseSummary();
    $('modal-lose').classList.remove('hidden');
    $('btn-lose-retry').focus({ preventScroll: true });
  },

  renderLoseSummary() {
    const container = $('lose-goals');
    container.innerHTML = '';
    this.level.goals.filter((goal) => !this.isGoalComplete(goal)).forEach((goal) => {
      const current = goal.type === 'collect' ? (this.collected[goal.gem] || 0)
        : goal.type === 'cage' ? this.cagesFreed : goal.type === 'ice' ? this.iceCleared : this.score;
      const row = document.createElement('div');
      row.className = 'lose-goal';
      const label = document.createElement('span');
      label.textContent = goal.type === 'collect' ? t('loseCollect', { item: gemName(goal.gem) })
        : t({ cage: 'loseRoots', ice: 'loseIce', score: 'loseScore' }[goal.type]);
      const amount = document.createElement('strong');
      amount.textContent = formatNumber(Math.max(0, goal.amount - current));
      row.append(makeGoalIcon(goal), label, amount);
      container.appendChild(row);
    });
  },
};


/* =============================================================
   9. ИНИЦИАЛИЗАЦИЯ
   ============================================================= */

function showFirstLevelWelcome(force = false) {
  if (!Board.level || Board.level.id !== 1 || Board.busy || Board.outcome) return;
  if (!force && (progress.welcomeSeen || progress.unlockedLevel > 1)) return;
  $('welcome-goal').textContent = t('welcomeGoal', {
    amount: Board.level.goals.find(goal => goal.type === 'collect' && goal.gem === 'apple').amount,
    moves: Board.level.moves,
  });
  Board.stopIdleHint();
  Board.pointer = null;
  Board.clearSelection();
  Board.clearPressed();
  Board.busy = true;
  $('screen-game').inert = true;
  $('modal-welcome').classList.remove('hidden');
  $('btn-welcome-start').focus();
}

function closeFirstLevelWelcome() {
  if ($('modal-welcome').classList.contains('hidden')) return;
  progress.welcomeSeen = true;
  saveProgress(progress);
  $('modal-welcome').classList.add('hidden');
  $('screen-game').inert = false;
  Board.busy = false;
  Board.scheduleIdleHint();
  const firstTile = Board.gridEl.querySelector('.gem');
  if (firstTile) firstTile.focus();
}

function startLevel(levelId) {
  const level = LEVELS.find((l) => l.id === levelId);
  if (!level) return;
  rememberMapPage(Math.floor((level.id - 1) / MAP_NODE_POSITIONS.length));
  showScreen('screen-game');
  $('modal-win').classList.add('hidden');
  $('modal-lose').classList.add('hidden');
  $('modal-level-info').classList.add('hidden');
  Board.start(level);
  showFirstLevelWelcome();
}

function goToMap() {
  renderLevelMap();
  showScreen('screen-map');
  fitLevelMap();
}

function bindGlobalUI() {
  $('btn-game-help').addEventListener('click', () => {
    if (Board.busy) { showToast(t('waitMove')); return; }
    showFirstLevelWelcome(true);
  });
  $('btn-welcome-start').addEventListener('click', closeFirstLevelWelcome);
  $('modal-welcome').addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeFirstLevelWelcome();
    if (event.key === 'Tab') {
      event.preventDefault();
      $('btn-welcome-start').focus();
    }
  });
  $('btn-endless-close').addEventListener('click', closeEndlessInfo);
  $('modal-endless-info').addEventListener('click', (event) => {
    if (event.target === event.currentTarget) closeEndlessInfo();
  });
  $('modal-endless-info').addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeEndlessInfo();
    if (event.key === 'Tab') {
      event.preventDefault();
      const play = $('btn-endless-play');
      (document.activeElement === play || play.disabled ? $('btn-endless-close') : play).focus();
    }
  });
  $('btn-endless-play').addEventListener('click', () => Endless.start());
  $('btn-endless-retry').addEventListener('click', () => Endless.start(false));
  $('btn-endless-map').addEventListener('click', () => {
    $('modal-endless-result').classList.add('hidden');
    currentMapPage = 2;
    goToMap();
  });
  $('victory-finale').addEventListener('click', () => Board.finishVictoryFinale());
  $('btn-map-prev').addEventListener('click', () => { Sound.play('tap'); setMapPage(currentMapPage - 1); });
  $('btn-map-next').addEventListener('click', () => { Sound.play('tap'); setMapPage(currentMapPage + 1); });
  window.addEventListener('resize', fitLevelMap);
  $('btn-play').addEventListener('click', () => { Sound.play('menuStart'); goToMap(); });
  $('btn-map-home').addEventListener('click', () => { Sound.play('tap'); updateMenuProgress(); showScreen('screen-menu'); });
  $('btn-game-back').addEventListener('click', () => {
    if (Board.busy) { showToast(t('waitMove')); return; }
    Sound.play('tap');
    Board.clearSelection();
    Board.stopIdleHint();
    Endless.save();
    goToMap();
  });

  $('btn-sound-menu').addEventListener('click', () => Sound.toggle());
  $('btn-sound-map').addEventListener('click', () => Sound.toggle());
  $('btn-sound-game').addEventListener('click', () => Sound.toggle());
  ['btn-language-menu', 'btn-language-map', 'btn-language-game'].forEach((id) => {
    $(id).addEventListener('click', () => setLanguage(currentLanguage === 'ru' ? 'en' : 'ru'));
  });

  $('btn-win-next').addEventListener('click', () => {
    $('modal-win').classList.add('hidden');
    const nextId = Board.level.id + 1;
    const nextLevel = LEVELS.find((l) => l.id === nextId);
    // Переходим не сразу в игру следующего уровня, а на его карточку
    // (как при клике по уровню на карте) — так игрок видит цели/звёзды.
    if (nextLevel) {
      currentMapPage = Math.floor((nextId - 1) / MAP_NODE_POSITIONS.length);
      renderLevelMap();
      showScreen('screen-map');
      fitLevelMap();
      openLevelInfo(nextId);
    } else {
      currentMapPage = 2;
      goToMap();
      Endless.renderInfo();
      $('modal-endless-info').classList.remove('hidden');
      $('btn-endless-play').focus({ preventScroll: true });
    }
  });

  $('btn-lose-retry').addEventListener('click', () => {
    $('modal-lose').classList.add('hidden');
    startLevel(Board.level.id);
  });

  $('btn-lose-map').addEventListener('click', () => {
    $('modal-lose').classList.add('hidden');
    goToMap();
  });

  $('btn-level-info-close').addEventListener('click', () => {
    Sound.play('tap');
    closeLevelInfo();
  });

  $('btn-level-info-play').addEventListener('click', () => {
    Sound.play('tap');
    if (pendingLevelId != null) startLevel(pendingLevelId);
  });

  // клик по затемнённому фону (не по самой карточке) закрывает окно уровня
  $('modal-level-info').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeLevelInfo();
  });

  // На первое пользовательское нажатие "прогреваем" аудио-контекст
  // (требование политик автоплея в браузерах).
}

const STARTUP_IMAGES = [
  'assets/backgrounds/menu-bg.jpg',
  'assets/gems/apple.png', 'assets/gems/corn.png', 'assets/gems/cucumber.png',
  'assets/gems/berry.png', 'assets/gems/eggplant.png',
  'assets/gems/flower-rocket.png', 'assets/gems/pumpkin.png',
  'assets/gems/butterfly.png', 'assets/gems/rainbow-flower.png',
];

function startupImages() {
  const images = [...STARTUP_IMAGES, MAP_PAGE_BACKGROUNDS[normalizeMapPage(currentMapPage)]];
  if (window.matchMedia('(min-width: 760px) and (min-height: 560px)').matches) {
    images.push('assets/backgrounds/garden-desktop.png');
  }
  return images;
}

async function init() {
  validateGameConfig();
  applyLanguage();
  Sound.init();
  updateSoundButtons();
  updateMenuProgress();
  bindGlobalUI();
  // The interactive shell and loading screen are ready; images may still load.
  // SDK onload handles late arrival; this call handles an already loaded SDK.
  appShellReady = true;
  initGemSpaceBridge();
  if (window.GardenLoader) {
    await window.GardenLoader.load(startupImages(), {
      loading: currentLanguage === 'en' ? 'Loading the garden…' : 'Загружаем сад…',
      slow: currentLanguage === 'en' ? 'Still loading. A slow connection may take a little longer.' : 'Загрузка продолжается. При медленном интернете нужно немного больше времени.',
      error: currentLanguage === 'en' ? 'Some garden images could not load. Check your connection and try again.' : 'Не удалось загрузить все картинки. Проверь подключение и попробуй ещё раз.',
      retry: currentLanguage === 'en' ? 'Retry' : 'Повторить',
    });
  }
  if (window.GardenLoader) {
    window.GardenLoader.finish();
    // Let the menu paint before starting nonessential requests.
    setTimeout(() => window.GardenLoader.preload?.([
      ...MAP_PAGE_BACKGROUNDS, 'assets/backgrounds/garden-desktop.png',
    ]), 100);
  }
}

document.addEventListener('DOMContentLoaded', init);
