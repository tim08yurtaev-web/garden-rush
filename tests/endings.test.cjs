// Run: node --test tests/endings.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');

class Element {
  constructor() {
    this.children = [];
    this.style = { setProperty() {} };
    this.dataset = {};
    const classes = new Set(['hidden']);
    this.classList = {
      add: (...names) => names.forEach(n => classes.add(n)),
      remove: (...names) => names.forEach(n => classes.delete(n)),
      contains: n => classes.has(n),
      toggle: (n, on) => on ? classes.add(n) : classes.delete(n),
    };
  }
  set innerHTML(value) { this.children = []; }
  append(...children) { this.children.push(...children); }
  appendChild(child) { this.append(child); }
  setAttribute() {}
  focus() {}
  remove() {}
  querySelectorAll() { return []; }
  querySelector() { return null; }
}

test('first-level welcome blocks play until dismissed and stays dismissed after reload', () => {
  const env = setup();
  vm.runInContext('showFirstLevelWelcome()', env.context);
  assert.equal(env.elements.get('modal-welcome').classList.contains('hidden'), false);
  assert.equal(env.elements.get('screen-game').inert, true);
  assert.equal(env.Board.busy, true);
  assert.match(env.elements.get('welcome-goal').textContent, /14.*20/);
  vm.runInContext('closeFirstLevelWelcome()', env.context);
  assert.equal(env.Board.busy, false);
  assert.equal(env.elements.get('screen-game').inert, false);
  assert.equal(env.elements.get('modal-welcome').classList.contains('hidden'), true);
  const reloaded = setup({ saved: JSON.parse(env.storage.get('gardenRushSave_v1')) });
  vm.runInContext('showFirstLevelWelcome()', reloaded.context);
  assert.equal(reloaded.elements.get('modal-welcome').classList.contains('hidden'), true);
  const moves = reloaded.Board.moves;
  const score = reloaded.Board.score;
  reloaded.Board.busy = true;
  vm.runInContext('showFirstLevelWelcome(true)', reloaded.context);
  assert.equal(reloaded.elements.get('modal-welcome').classList.contains('hidden'), true);
  reloaded.Board.busy = false;
  vm.runInContext('showFirstLevelWelcome(true)', reloaded.context);
  assert.equal(reloaded.elements.get('modal-welcome').classList.contains('hidden'), false);
  vm.runInContext('closeFirstLevelWelcome()', reloaded.context);
  assert.equal(reloaded.Board.moves, moves);
  assert.equal(reloaded.Board.score, score);
});

test('welcome does not interrupt other levels or returning players with completed level one', () => {
  const env = setup();
  env.Board.level = env.LEVELS[1];
  vm.runInContext('showFirstLevelWelcome()', env.context);
  assert.equal(env.elements.get('modal-welcome').classList.contains('hidden'), true);
  env.Board.level = env.LEVELS[0];
  env.progress.unlockedLevel = 2;
  vm.runInContext('showFirstLevelWelcome()', env.context);
  assert.equal(env.elements.get('modal-welcome').classList.contains('hidden'), true);
});

function setup({ reduced = false, saved } = {}) {
  const elements = new Map([...fs.readFileSync(path.join(root, 'index.html'), 'utf8').matchAll(/id="([^"]+)"/g)].map(m => [m[1], new Element()]));
  const storage = new Map(saved ? [['gardenRushSave_v1', JSON.stringify(saved)]] : []);
  let clock = 0, id = 0;
  const intervals = new Map();
  const context = vm.createContext({
    console, navigator: { language: 'ru' },
    localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    document: { getElementById: id => elements.get(id), createElement: () => new Element(), addEventListener() {} },
    window: { matchMedia: () => ({ matches: reduced }) },
    performance: { now: () => clock },
    requestAnimationFrame: fn => fn(),
    setTimeout: () => ++id, clearTimeout() {},
    setInterval: fn => { intervals.set(++id, fn); return id; },
    clearInterval: key => intervals.delete(key),
  });
  vm.runInContext(fs.readFileSync(path.join(root, 'game.js'), 'utf8'), context);
  const api = vm.runInContext('({ Board, Endless, LEVELS, starsForResult, progress, loadProgress })', context);
  const b = api.Board;
  b.createTileEl = (cell, row, col) => {
    const el = new Element();
    el.dataset = { row, col, type: cell.type };
    return el;
  };
  Object.assign(b, { level: api.LEVELS[0], score: 1000, moves: 4, collected: { apple: 14 }, cagesFreed: 0, iceCleared: 0, gridEl: new Element(), cellSize: 40 });
  b.parseShape(Array(8).fill('11111111'));
  b.grid = Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => ({
    type: ['apple', 'corn', 'berry'][(r + c) % 3], active: true, cageHits: 0, iceHits: 0, special: null, el: new Element(),
  })));
  return { ...api, elements, storage, intervals, context, tick: ms => { clock += ms; [...intervals.values()].forEach(fn => fn()); } };
}

test('butterfly impact precedes obstacle damage, score and clearing', async () => {
  const { Board: b, context } = setup();
  const timers = [];
  context.setTimeout = (fn, ms) => { timers.push({ fn, ms }); return timers.length; };
  const events = [];
  b.drawSpecialEffects = () => events.push('flight');
  b.applyObstacleHits = () => events.push('impact');
  b.addScore = () => { events.push('score'); return 50; };
  b.showScorePopup = () => {};
  b.playClearAnimation = async () => events.push('clear');
  const target = b.grid[3][3].el;
  const effect = b.playMatchEffects({
    clearSet: new Map([['3_3', { row: 3, col: 3 }]]), countedCells: [], specialsToCreate: [],
    firedSpecials: [{ special: 'butterfly', target: { row: 3, col: 3 } }],
  }, 1);
  assert.deepEqual(events, ['flight']);
  assert.equal(target.classList.contains('effect-target'), true);
  timers.find(timer => timer.ms === 240).fn();
  await effect;
  assert.deepEqual(events, ['flight', 'impact', 'score', 'clear']);
  assert.equal(target.classList.contains('effect-target'), false);
});

test('clearing plays one destruction sound for the whole match', async () => {
  const { Board: b, context } = setup();
  const sounds = [];
  context.recordSound = sound => sounds.push(sound);
  vm.runInContext('Sound.play = recordSound', context);
  context.setTimeout = fn => { fn(); return 1; };
  b.spawnSparkles = () => {};
  await b.playClearAnimation(new Map([0, 1, 2].map(col => [col, { row: 0, col }])));
  assert.deepEqual(sounds, ['destroy']);
  assert.ok(b.grid[0].slice(0, 3).every(cell => cell.el.classList.contains('matched')));
});

test('startup loads only the saved map and defers decorative art on all screen sizes', () => {
  const { context } = setup();
  for (const wide of [false, true]) {
    context.window.matchMedia = () => ({ matches: wide });
    for (const page of [0, 1, 2]) {
      const images = vm.runInContext(`currentMapPage = ${page}; startupImages()`, context);
      const maps = images.filter(url => url.includes('/map-bg'));
      assert.deepEqual(Array.from(maps), [`assets/backgrounds/map-bg${page ? '-' + (page + 1) : ''}.jpg`]);
      assert.equal(images.includes('assets/backgrounds/garden-desktop.png'), false);
      assert.equal(images.filter(url => url.includes('/gems/')).length, 9);
    }
  }
});

test('background image requests are shared, failures can retry, and cached images are reused', async () => {
  const requests = [];
  const context = vm.createContext({
    window: {}, location: {}, setTimeout: () => 1, clearTimeout() {},
    document: { getElementById: () => ({ addEventListener() {} }) },
    Image: class {
      set src(value) { this.url = value; requests.push(this); }
      decode() { return Promise.resolve(); }
    },
  });
  vm.runInContext(fs.readFileSync(path.join(root, 'loader.js'), 'utf8'), context);
  const loader = context.window.GardenLoader;
  const background = loader.preload(['map']);
  const visible = loader.ensure('map');
  assert.equal(requests.length, 1);
  await requests[0].onload();
  await Promise.all([background, visible]);
  assert.equal(loader.has('map'), true);
  await loader.ensure('map');
  assert.equal(requests.length, 1);
  const failed = loader.ensure('next');
  requests[1].onerror();
  await assert.rejects(failed);
  assert.equal(loader.has('next'), false);
  const retry = loader.ensure('next');
  await requests[2].onload();
  await retry;
  assert.equal(loader.has('next'), true);
});

for (const timing of ['early', 'late', 'absent']) {
  test(`bridge SDK ${timing}: ready does not wait for images or run twice`, async () => {
    const { context } = setup();
    let calls = 0, releaseImages;
    const sdk = { bridge: { app: { ready() { calls++; return Promise.resolve(); } } } };
    context.window.GardenLoader = {
      load: () => new Promise(resolve => { releaseImages = resolve; }),
      finish() {},
    };
    vm.runInContext('validateGameConfig = applyLanguage = Sound.init = updateSoundButtons = updateMenuProgress = bindGlobalUI = () => {};', context);
    if (timing === 'early') {
      context.window.GemSpaceBridge = sdk;
      await vm.runInContext('initGemSpaceBridge()', context);
      assert.equal(calls, 0);
    }
    const boot = vm.runInContext('init()', context);
    if (timing === 'late') {
      context.window.GemSpaceBridge = sdk;
      await vm.runInContext('initGemSpaceBridge()', context);
    }
    assert.equal(calls, timing === 'absent' ? 0 : 1);
    await vm.runInContext('initGemSpaceBridge()', context);
    releaseImages();
    await boot;
    assert.equal(calls, timing === 'absent' ? 0 : 1);
  });
}

test('impossible shuffle stops after 200 candidates and leaves the board unchanged', async () => {
  const { Board: b, context } = setup();
  vm.runInContext('delay = async () => {};', context);
  const before = JSON.stringify(b.grid.map(row => row.map(cell => cell.type)));
  let candidates = 0;
  b.wouldHaveInitialMatches = () => { candidates++; return true; };
  assert.equal(await b.reshuffleBoard(), false);
  assert.equal(candidates, 200);
  assert.equal(JSON.stringify(b.grid.map(row => row.map(cell => cell.type))), before);
  assert.equal(b.grid.flat().some(cell => cell.el.classList.contains('shuffle-out')), false);
});

test('move recovery has a retry cap and preserves progress on failure', async () => {
  const { Board: b, context, progress } = setup();
  vm.runInContext('goToMap = () => {}; showToast = () => {};', context);
  const before = JSON.stringify(progress);
  b.hasAnyPossibleMove = () => false;
  let attempts = 0;
  b.reshuffleBoard = async () => { attempts++; return true; };
  assert.equal(await b.ensurePossibleMove(), false);
  assert.equal(attempts, 3);
  assert.equal(b.outcome, 'board-error');
  assert.equal(b.busy, false);
  assert.equal(JSON.stringify(progress), before);
});

test('all level star thresholds use total score, with no moves requirement', () => {
  const { LEVELS, starsForResult } = setup();
  for (const level of LEVELS) {
    assert.equal(starsForResult(level, 0, 0), 1);
    assert.equal(starsForResult(level, level.starThresholds[1] - 1, 99), 1);
    assert.equal(starsForResult(level, level.starThresholds[1], 0), 2);
    assert.equal(starsForResult(level, level.starThresholds[2] - 1, 99), 2);
    assert.equal(starsForResult(level, level.starThresholds[2], 0), 3);
  }
});

test('overlapping rockets award each cleared cell and activation once', () => {
  const { Board: b } = setup();
  b.grid[3][2].special = 'rocket-row';
  b.grid[2][3].special = 'rocket-col';
  b.onWin();
  assert.equal(b.victoryResult.specialBonus, 15 * 50 + 2 * 50);
  assert.equal(b.score, 1000 + 850 + 500);
  assert.equal(b.victoryResult.earnedStars, 2);
});

test('skip and timed completion preserve identical scores, moves and saved stars', () => {
  const run = skip => {
    const env = setup();
    const b = env.Board;
    b.onWin();
    assert.equal(env.progress.bestScore[1], 1500, 'save is committed before animation');
    if (skip) b.finishVictoryFinale(); else env.tick(1900);
    b.finishVictoryFinale();
    b.onWin();
    b.afterMoveChecks();
    assert.equal(b.score, 1500, 'repeated callbacks cannot award twice');
    assert.equal(b.moves, 4, 'efficiency record preserves actual remaining moves');
    assert.equal(env.intervals.size, 0);
    assert.equal(env.elements.get('modal-win').classList.contains('hidden'), false);
    return JSON.parse(env.storage.get('gardenRushSave_v1'));
  };
  assert.deepEqual(run(true), run(false));
});

test('winning on the final move takes priority over defeat and gives no move bonus', () => {
  const { Board: b, elements } = setup({ reduced: true });
  b.moves = 0;
  b.afterMoveChecks();
  assert.equal(b.outcome, 'won');
  assert.equal(b.victoryResult.moveBonus, 0);
  assert.equal(elements.get('modal-lose').classList.contains('hidden'), true);
  assert.equal(elements.get('modal-win').classList.contains('hidden'), false);
});

test('defeat reports only missing goals, handles every goal type, awards nothing', () => {
  const { Board: b, elements, progress } = setup();
  b.level = { ...b.level, goals: [
    { type: 'collect', gem: 'apple', amount: 14 },
    { type: 'collect', gem: 'corn', amount: 10 },
    { type: 'cage', amount: 3 }, { type: 'ice', amount: 5 }, { type: 'score', amount: 1100 },
  ] };
  b.collected.corn = 7;
  b.cagesFreed = 2;
  b.iceCleared = 3;
  b.moves = 0;
  b.afterMoveChecks();
  const rows = elements.get('lose-goals').children;
  assert.equal(b.outcome, 'lost');
  assert.deepEqual(rows.map(row => row.children[2].textContent), ['3', '1', '2', '100']);
  assert.equal(progress.unlockedLevel, 1);
  assert.equal(Object.keys(progress.bestScore).length, 0);
  assert.equal(b.score, 1000);
});

test('replaying never removes previously earned stars or records', () => {
  const { Board: b, progress } = setup({ reduced: true, saved: {
    unlockedLevel: 2, bestScore: { 1: 9000 }, bestStars: { 1: 3 }, bestMoves: { 1: 18 }, soundOn: false,
  } });
  b.onWin();
  assert.equal(progress.bestScore[1], 9000);
  assert.equal(progress.bestStars[1], 3);
  assert.equal(progress.bestMoves[1], 18);
});

test('legacy saves keep their earned stars', () => {
  const { progress } = setup({ saved: { unlockedLevel: 2, bestScore: { 1: 2200 } } });
  assert.equal(progress.bestStars[1], 3);
});


test('score objectives plus the full move bonus no longer guarantee three stars', () => {
  const { LEVELS, starsForResult } = setup();
  assert.equal(LEVELS[0].starThresholds[2], 5500);
  assert.equal(LEVELS[2].starThresholds[2], 12000);
  for (const level of LEVELS) {
    const scoreGoal = level.goals.find(goal => goal.type === 'score');
    if (!scoreGoal) continue;
    assert.ok(starsForResult(level, scoreGoal.amount + level.moves * 125) < 3,
      `Level ${level.id}: completion and move bonus must leave room for mastery`);
  }
});

test('finale spawns new fruits and drops surviving fruits before the result', () => {
  const { Board: b, tick } = setup();
  b.grid[3][2].special = 'rocket-row';
  const survivor = b.grid[2][2];
  const removed = b.grid[3][2];
  b.onWin();
  tick(250);
  assert.equal(b.grid[3][2], survivor, 'fruit above the cleared row drops');
  assert.notEqual(b.grid[0][2], removed);
  assert.ok(b.grid[0][2].type, 'new fruit spawns at the top');
  assert.equal(b.grid.flat().filter(cell => cell.type && cell.el).length, 64);
  assert.equal(b.victoryResult.presented, undefined, 'refill happens during the finale');
  const gridAfterRefill = b.grid.flat();
  b.finishVictoryFinale();
  assert.deepEqual(b.grid.flat(), gridAfterRefill, 'skip does not refill twice');
});

test('immediate skip fills the board without losing bonuses', () => {
  const { Board: b } = setup();
  b.grid[3][2].special = 'rocket-row';
  const removed = b.grid[3][2];
  b.onWin();
  const score = b.score;
  b.finishVictoryFinale();
  assert.equal(b.grid.flat().includes(removed), false);
  assert.equal(b.grid.flat().filter(cell => cell.type && cell.el).length, 64);
  assert.equal(b.score, score);
});

test('endless introduction appears once and subsequent entries resume directly after reload', () => {
  const first = setup({saved:{unlockedLevel:31}});
  vm.runInContext('enterEndlessMode()', first.context);
  assert.equal(first.elements.get('modal-endless-info').classList.contains('hidden'), false);
  const saved = JSON.parse(first.storage.get('gardenRushSave_v1'));
  assert.equal(saved.endlessIntroSeen, true);
  const second = setup({saved});
  let starts = 0;
  second.Endless.start = () => starts++;
  vm.runInContext('enterEndlessMode(true)', second.context);
  assert.equal(starts, 0, 'automatic campaign completion does not start a run');
  vm.runInContext('enterEndlessMode()', second.context);
  assert.equal(starts, 1);
  assert.equal(second.elements.get('modal-endless-info').classList.contains('hidden'), true);
});

test('locked endless visit does not consume introduction; existing players skip it', () => {
  const env = setup();
  vm.runInContext('enterEndlessMode()', env.context);
  assert.equal(env.progress.endlessIntroSeen, false);
  const returning = setup({saved:{unlockedLevel:31,endlessBestScore:1200}});
  assert.equal(returning.progress.endlessIntroSeen, true);
});

function setupEndless(stage = 1) {
  const env = setup();
  const b = env.Board;
  b.level = env.Endless.level(stage);
  b.collected = {};
  b.moves = 20;
  b.score = 0;
  b.parseShape(b.level.shape);
  b.grid.forEach((row, r) => row.forEach((cell, c) => {
    cell.active = b.activeMask[r][c];
    if (!cell.active) { cell.type = null; cell.el = null; }
  }));
  return env;
}

test('endless unlocks after level 30 and starts with 20 moves and 20 apples', () => {
  const { Endless: e, progress } = setupEndless();
  progress.unlockedLevel = 30;
  assert.equal(e.unlocked(), false);
  progress.unlockedLevel = 31;
  assert.equal(e.unlocked(), true);
  assert.equal(e.level(1).moves, 20);
  assert.equal(e.level(1).goals[0].gem, 'apple');
  assert.equal(e.level(1).goals[0].amount, 20);
});

test('endless task completed on the last move awards 6 and preserves board and specials', async () => {
  const { Board: b, Endless: e, progress } = setupEndless();
  b.moves = 0;
  b.collected.apple = 20;
  b.collected.corn = 9;
  b.score = 1234;
  b.grid[3][3].special = 'rainbow';
  b.hasAnyPossibleMove = () => true;
  const board = b.grid;
  await b.afterMoveChecks();
  assert.equal(b.moves, 6);
  assert.equal(b.level.stage, 2);
  assert.equal(b.grid, board);
  assert.equal(b.grid[3][3].special, 'rainbow');
  assert.equal(b.score, 1234);
  assert.equal(b.goalProgressText(b.level.goals[0]), '0/22');
  assert.equal(progress.unlockedLevel, 1);
  assert.equal(e.readRun().stage, 2);
});

test('endless move reserve is capped at 30 and an unfinished task gives no extra moves', async () => {
  const { Board: b } = setupEndless();
  b.hasAnyPossibleMove = () => true;
  b.moves = 29;
  b.collected.apple = 20;
  await b.afterMoveChecks();
  assert.equal(b.moves, 30);
  await b.afterMoveChecks();
  assert.equal(b.moves, 30);
  assert.equal(b.level.stage, 2);
});

test('endless snapshots restore exact board, counters, goals and remaining moves', () => {
  const { Board: b, Endless: e } = setupEndless(6);
  b.moves = 13;
  b.score = 8400;
  b.collected = { apple: 44, corn: 50 };
  b.level = e.level(6, b);
  b.grid[3][3].special = 'pumpkin';
  b.grid[4][4].cageHits = 2;
  b.grid[4][4].rootMaxHits = 2;
  e.save();
  const run = e.readRun();
  assert.ok(run);
  const serialized = JSON.stringify(run);
  b.measure = () => {};
  b.bindInput = () => {};
  b.showTutorialMove = () => {};
  b.resizeHandler = () => {};
  b.start({ ...e.level(run.stage), goals: run.goals }, run);
  e.save();
  assert.equal(JSON.stringify(e.readRun()), serialized);
  b.grid[3][3].type = 'berry';
  assert.notEqual(b.grid[3][3].type, run.grid[3][3].type, 'restored cells do not mutate the checkpoint');
});

test('a running cascade cannot overwrite the last stable endless checkpoint', () => {
  const { Board: b, Endless: e, progress } = setupEndless();
  e.save();
  const saved = JSON.stringify(progress.endlessRun);
  b.busy = true;
  b.moves--;
  b.grid[3][3].type = null;
  e.save();
  assert.equal(JSON.stringify(progress.endlessRun), saved);
});

test('endless defeat clears checkpoint and records results without altering campaign', async () => {
  const { Board: b, Endless: e, progress, elements } = setupEndless(7);
  e.save();
  b.moves = 0;
  b.score = 15000;
  await b.afterMoveChecks();
  assert.equal(b.outcome, 'endless-over');
  assert.equal(progress.endlessRun, null);
  assert.equal(progress.endlessBestStages, 6);
  assert.equal(progress.endlessBestScore, 15000);
  assert.equal(progress.unlockedLevel, 1);
  assert.equal(Object.keys(progress.bestStars).length, 0);
  assert.equal(elements.get('modal-endless-result').classList.contains('hidden'), false);
  e.finish();
  assert.equal(progress.endlessBestScore, 15000);
});

test('endless obstacles leave power-ups intact and match their task counts', () => {
  const { Board: b, Endless: e } = setupEndless(6);
  b.hasAnyPossibleMove = () => true;
  b.updateTileVisual = () => {};
  b.grid[3][3].special = 'rainbow';
  e.addObstacles();
  assert.equal(b.grid[3][3].cageHits, 0);
  assert.equal(b.grid.flat().filter(cell => cell.cageHits > 0).length, 2);
  assert.equal(b.level.goals.find(goal => goal.type === 'cage').amount, 2);
});

test('invalid endless checkpoint falls back to a new run', () => {
  const { Endless: e, progress } = setupEndless();
  progress.endlessRun = { version: 1, stage: 0 };
  assert.equal(e.readRun(), null);
});

test('winter levels have reachable flowerbeds and valid obstacle targets', () => {
  const env = setup();
  assert.equal(env.LEVELS.length, 40);
  assert.equal(vm.runInContext('validateGameConfig()', env.context), true);
  for (const level of env.LEVELS.slice(30)) {
    const b = env.Board;
    b.level = level;
    b.parseShape(level.shape);
    b.generateSolvableBoard();
    b.applyLevelObstacles();
    assert.ok(b.hasAnyPossibleMove(), `level ${level.id} has a legal opening`);
    for (const positions of Object.values(level.obstacles)) {
      for (const [r,c] of positions) assert.equal(level.shape[r][c], '1');
    }
  }
});

test('flowers grow once at fixed coordinates, including the new-special anchor', async () => {
  const { Board: b } = setup();
  b.flowerbeds = new Set(['3_2', '3_3']); b.bloomedBeds = new Set(); b.flowersGrown = 0;
  for (let c = 1; c <= 4; c++) b.grid[3][c].type = 'apple';
  const run = { type: 'apple', orientation: 'h', length: 4, cells: [1,2,3,4].map(col => ({row:3,col})) };
  const plan = b.buildClearPlan([run], {row:3,col:3});
  assert.ok(plan.specialsToCreate.some(p => p.row === 3 && p.col === 3));
  b.growFlowers(plan.countedCells);
  b.growFlowers(plan.countedCells);
  assert.equal(b.flowersGrown, 2);
  await b.collapseAndRefill(plan.clearSet, plan.specialsToCreate, false);
  assert.deepEqual([...b.flowerbeds], ['3_2','3_3']);
  assert.equal(b.isGoalComplete({type:'flower',amount:2}), true);
});

test('ice and roots protect flowers; a rocket can bloom unprotected beds', () => {
  const { Board: b } = setup();
  b.flowerbeds = new Set(['3_2','3_3','3_4']); b.bloomedBeds = new Set(); b.flowersGrown = 0;
  b.grid[3][1].special = 'rocket-row';
  b.grid[3][2].iceHits = 1; b.grid[3][3].cageHits = 2;
  for (let col = 0; col < 3; col++) b.grid[3][col].type = 'apple';
  const run = {type:'apple',orientation:'h',cells:[0,1,2].map(col => ({row:3,col}))};
  const plan = b.buildClearPlan([run], null);
  b.growFlowers(plan.countedCells);
  assert.equal(b.flowersGrown, 1);
  assert.deepEqual([...b.bloomedBeds], ['3_4']);
});

test('old completed campaign keeps records and unlocks winter plus endless', () => {
  const env = setup({saved:{unlockedLevel:31,bestStars:{30:3},bestScore:{30:25000},lastMapPage:2}});
  assert.equal(env.progress.bestStars[30], 3);
  assert.equal(env.progress.bestScore[30], 25000);
  assert.equal(env.progress.unlockedLevel, 31);
  assert.equal(env.Endless.unlocked(), true);
  assert.equal(vm.runInContext('currentMapPage', env.context), 2);
});

test('last map page survives a full reload, including a return to the first area', () => {
  const first = setup({ saved: { unlockedLevel: 31 } });
  assert.equal(vm.runInContext('currentMapPage', first.context), 3);
  vm.runInContext('rememberMapPage(1)', first.context);
  const second = setup({ saved: JSON.parse(first.storage.get('gardenRushSave_v1')) });
  assert.equal(vm.runInContext('currentMapPage', second.context), 1);
  vm.runInContext('rememberMapPage(0)', second.context);
  const third = setup({ saved: JSON.parse(second.storage.get('gardenRushSave_v1')) });
  assert.equal(vm.runInContext('currentMapPage', third.context), 0);
  assert.equal(third.progress.unlockedLevel, 31);
});

test('legacy saves infer the current area and invalid pages stay within the map', () => {
  for (const [saved, expected] of [
    [{ unlockedLevel: 1 }, 0], [{ unlockedLevel: 11 }, 1], [{ unlockedLevel: 21 }, 2],
    [{ unlockedLevel: 31 }, 3], [{ unlockedLevel: 21, lastMapPage: 0 }, 0],
    [{ lastMapPage: 999 }, 3], [{ lastMapPage: -1 }, 0],
    [{ unlockedLevel: 11, lastMapPage: 'invalid' }, 1],
  ]) {
    const env = setup({ saved });
    assert.equal(vm.runInContext('currentMapPage', env.context), expected);
  }
});

test('late campaign levels gain two moves without increasing star thresholds', () => {
  const { LEVELS } = setup();
  const moves = [34, 35, 33, 36, 36, 37];
  const thresholds = [16000, 19500, 15500, 18500, 19000, 21500];
  LEVELS.slice(24, 30).forEach((level, i) => {
    assert.equal(level.moves, moves[i]);
    assert.equal(level.starThresholds[2], thresholds[i]);
  });
  assert.equal(LEVELS[23].moves, 32);
});

test('endless reward stays at six moves after task 9', async () => {
  const { Board: b, Endless: e } = setupEndless(9);
  b.hasAnyPossibleMove = () => true;
  b.updateTileVisual = () => {};
  for (const stage of [9, 10]) {
    b.moves = 1;
    b.level.goals.forEach(goal => { b.collected[goal.gem] = goal.amount; });
    await b.afterMoveChecks();
    assert.equal(b.moves, 7);
    assert.equal(b.level.stage, stage + 1);
  }
  assert.equal(e.moveReward(100), 6);
});

test('winter lessons allow only the guided move and demonstrate flower protection', () => {
  for (const id of [31,35,37]) {
    for (let attempt=0; attempt<20; attempt++) {
      const { Board:b, LEVELS } = setup();
      b.level=LEVELS.find(level=>level.id===id);
      b.parseShape(b.level.shape);
      b.prepareTutorialMove(id);
      b.applyLevelObstacles();
      b.flowerbeds=new Set(b.level.flowerbeds.map(([r,c])=>r+'_'+c));
      b.bloomedBeds=new Set(); b.flowersGrown=0;
      const {from,to}=b.tutorialMove;
      assert.equal(b.isImmobile(b.grid[from.row][from.col]),false);
      assert.equal(b.isImmobile(b.grid[to.row][to.col]),false);
      assert.equal(b.isTutorialPair(from,to),true);
      assert.equal(b.isTutorialPair(to,from),true);
      assert.equal(b.isTutorialPair({row:0,col:2},{row:0,col:3}),false);
      assert.equal(b.findMatches().length,0);
      const temp=b.grid[from.row][from.col];
      b.grid[from.row][from.col]=b.grid[to.row][to.col]; b.grid[to.row][to.col]=temp;
      const matches=b.findMatches();
      assert.ok(matches.length>0);
      const plan=b.buildClearPlan(matches,to);
      b.growFlowers(plan.countedCells);
      if(id===31) assert.ok(b.bloomedBeds.has('3_2'));
      if(id===35) {
        assert.equal(b.bloomedBeds.has('3_2'),false);
        assert.ok(plan.cageHitsToDamage.some(p=>p.row===3 && p.col===2));
      }
      if(id===37) {
        assert.equal(b.bloomedBeds.has('3_2'),false);
        assert.equal(b.bloomedBeds.has('3_4'),false);
        assert.ok(b.bloomedBeds.has('3_3'));
        assert.ok(plan.iceHitsToDamage.some(p=>p.row===3 && p.col===2));
        assert.ok(plan.iceHitsToDamage.some(p=>p.row===3 && p.col===4));
      }
      b.finishTutorialMove();
      assert.equal(b.tutorialMove.active,false);
      assert.equal(b.isTutorialPair({row:0,col:2},{row:0,col:3}),true);
    }
  }
});
