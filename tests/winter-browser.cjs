// Requires Playwright and an installed Chrome browser. Run: node tests/winter-browser.cjs
const { chromium } = require('playwright');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname,'..');
const artifacts = process.env.GARDEN_SCREENSHOT_DIR || path.join(require('node:os').tmpdir(), 'garden-rush-screenshots');
const server = http.createServer((req,res) => {
  const file = path.join(root,decodeURIComponent(req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]));
  if (!file.startsWith(root + path.sep)) {res.writeHead(403).end(); return;}
  const types = {'.svg':'image/svg+xml','.js':'text/javascript','.css':'text/css','.html':'text/html'};
  fs.readFile(file,(error,data)=>{res.writeHead(error?404:200, {'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(error?'Missing':data);});
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser = await chromium.launch({channel:'chrome',headless:true});
  try {
    const page = await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    const missing=[];
    page.on('response',response=>{
      if(response.url().startsWith(`http://127.0.0.1:${server.address().port}`) && response.status()>=400)
        missing.push(response.url());
    });
    await page.addInitScript(()=>{
      if (!localStorage.getItem('gardenRushSave_v1'))
        localStorage.setItem('gardenRushSave_v1',JSON.stringify({unlockedLevel:41,lastMapPage:3,welcomeSeen:true,soundOn:false}));
    });
    await page.goto(`http://127.0.0.1:${server.address().port}`, {waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>!document.body.classList.contains('is-loading'));
    await page.click('#btn-play');
    await page.waitForSelector('.winter-map .level-node');
    fs.mkdirSync(artifacts,{recursive:true});
    for (let area = 0; area < 3; area++) {
      await page.evaluate(async area => {
        await GardenLoader.ensure(MAP_PAGE_BACKGROUNDS[area]);
        currentMapPage = area;
        renderLevelMap();
      }, area);
      await page.screenshot({path:path.join(artifacts,`map-area-${area+1}.png`)});
      assert.equal(await page.locator('#map-path .level-node:not(.endless-node)').count(),10);
    }
    await page.evaluate(() => { currentMapPage = 3; renderLevelMap(); });
    await page.screenshot({path:path.join(artifacts,'winter-map.png')});
    await page.getByRole('button',{name:'Уровень 31',exact:true}).click();
    await page.click('#btn-level-info-play');
    await page.waitForSelector('.flowerbed');
    await page.screenshot({path:path.join(artifacts,'winter-level.png')});
    assert.equal(await page.locator('.flowerbed').count(),3);
    await page.evaluate(() => {
      const flowers = Board.growFlowers([{row:3,col:2}]);
      Board.renderHud();
      Board.animateGoalItems(flowers);
    });
    assert.equal(await page.locator('.flowerbed.bloomed').innerText(), '✓');
    assert.equal(await page.locator('.flower-collected').innerText(), '+1 ✿');
    assert.match(await page.locator('[data-goal-type="flower"]').innerText(), /1\/3/);
    await page.screenshot({path:path.join(artifacts,'flower-feedback.png')});
    // Exercise real Board.start and browser layout for every new shape and goal mix.
    for (let id=31;id<=40;id++) {
      const result=await page.evaluate(id=>{
        startLevel(id);
        const board=document.getElementById('board-grid').getBoundingClientRect();
        return {beds:document.querySelectorAll('.flowerbed').length,expected:Board.level.flowerbeds.length,
          legal:Board.hasAnyPossibleMove(),bottom:board.bottom,width:board.width,height:innerHeight};
      },id);
      assert.equal(result.beds,result.expected);
      assert.ok(result.legal);
      assert.ok(result.bottom<=result.height+1 && result.width>150);
    }
    // Validate every campaign board at compact mobile, phone and desktop sizes.
    for (const viewport of [{width:320,height:568},{width:390,height:844},{width:1280,height:800}]) {
      await page.setViewportSize(viewport);
      for (let id=1;id<=40;id++) {
        const layout=await page.evaluate(id=>{
          startLevel(id);
          const b=document.getElementById('board-grid').getBoundingClientRect();
          return {left:b.left,right:b.right,bottom:b.bottom,top:b.top,
            legal:Board.hasAnyPossibleMove(),scroll:document.documentElement.scrollWidth};
        },id);
        assert.ok(layout.legal, `level ${id} has a legal opening`);
        assert.ok(layout.left>=0 && layout.right<=viewport.width+1 &&
          layout.top>=0 && layout.bottom<=viewport.height+1, `level ${id} fits ${viewport.width}x${viewport.height}`);
        assert.ok(layout.scroll<=viewport.width, `level ${id} has no horizontal overflow`);
      }
    }
    await page.setViewportSize({width:390,height:844});
    for (const id of [2,4,6,8,10,11,15,31,35,37]) {
      await page.evaluate(id=>startLevel(id),id);
      assert.equal(await page.locator('.tutorial-swipe-arrow').count(),1);
      assert.ok(await page.locator('.tutorial-highlight').count()>=2);
      await page.screenshot({path:path.join(artifacts, 'lesson-'+id+'.png')});
      const from=await page.evaluate(()=>Board.tutorialMove.from);
      const to=await page.evaluate(()=>Board.tutorialMove.to);
      await page.locator('#board-grid > .gem[data-row="'+from.row+'"][data-col="'+from.col+'"]').click();
      await page.locator('#board-grid > .gem[data-row="'+to.row+'"][data-col="'+to.col+'"]').click();
      await page.waitForFunction(()=>!Board.busy);
      assert.equal(await page.locator('.tutorial-swipe-arrow').count(),0);
      assert.equal(await page.evaluate(()=>Board.tutorialMove.active),false);
    }
    await page.evaluate(()=>startLevel(40));
    await page.click('#btn-language-game');
    assert.ok(await page.locator('.flowerbed.blocked').count() > 0);
    assert.equal(await page.locator('#tutorial-hint').isVisible(),false);
    await page.setViewportSize({width:1280,height:800});
    await page.screenshot({path:path.join(artifacts,'winter-desktop.png')});
    await page.evaluate(()=>{
      progress.endlessIntroSeen=false;
      enterEndlessMode();
    });
    await page.waitForSelector('#modal-endless-info:not(.hidden)');
    await page.click('#btn-endless-play');
    assert.equal(await page.evaluate(()=>Board.level.mode), 'endless');
    const savedMoves=await page.evaluate(()=>Board.moves);
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>!document.body.classList.contains('is-loading'));
    await page.evaluate(()=>enterEndlessMode());
    assert.equal(await page.locator('#modal-endless-info').evaluate(el=>el.classList.contains('hidden')),true);
    assert.equal(await page.evaluate(()=>Board.moves),savedMoves);
    assert.deepEqual(errors,[]);
    assert.deepEqual(missing,[]);
    console.log('Browser: 40 levels at 3 viewport sizes, 10 guided lessons, all maps, EN, endless reload and local resources passed.');
  } finally {await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});

