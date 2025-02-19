const CONFIG_KEY = "hyph"; // Can't change this for backwards compatibility

var trackerOptions = {
  showchests: true,
  showprizes: true,
  showmedals: true,
  showlabels: true,
  mapLogic: 'glitchless',
  openmode: false,
  editmode: false,
  selected: {},
  menusprites: false
};

var chestsopenedInit = [];
for(var i = 0; i < chests.length; i++) {
    chestsopenedInit.push(false);
}

var trackerData = {
  items: itemsInit,
  dungeonchests: dungeonchestsInit,
  dungeonbeaten: dungeonbeatenInit,
  prizes: prizesInit,
  medallions: medallionsInit,
  chestsopened: chestsopenedInit
};

function loadConfig() {
    var str = window.localStorage.getItem(CONFIG_KEY);
    if(!str) return {};
    return JSON.parse(str);
}

var cookiekeys = ['ts', 'map', 'iZoom', 'mZoom', 'mOrien', 'mPos', 'mapLogic', 'openmode', 'chest', 'prize', 'medal', 'label', 'menusprites', 'items'];
var cookieDefault = {
    ts:94,
    map:1,
    iZoom:100,
    mZoom:50,
    mOrien:0,
    mapLogic:'glitchless',
    openmode:0,
    mPos:0,
    chest:1,
    prize:1,
    medal:1,
    label:1,
    menusprites:0,
    items:defaultItemGrid
};

var cookielock = false;
function loadCookie() {
    if (cookielock)
        return;
    cookielock = true;
    cookieobj = getConfigObjectFromCookie();
    setConfigObject(cookieobj);
    cookielock = false;
}

function setConfigObject(configobj) {
    window.vm.itemRows = configobj.items;

    document.getElementsByName('showmap')[0].checked = !!configobj.map;
    document.getElementsByName('showmap')[0].onchange();
    document.getElementsByName('itemdivsize')[0].value = configobj.iZoom;
    document.getElementsByName('itemdivsize')[0].oninput();
    document.getElementsByName('mapdivsize')[0].value = configobj.mZoom;
    document.getElementsByName('mapdivsize')[0].oninput();

    document.getElementsByName('maporientation')[configobj.mOrien].click();
    document.getElementsByName('mapposition')[configobj.mPos].click();
    document.querySelector('input[value="' + (configobj.mapLogic || 'glitchless') + '"]').click();
    
    document.getElementsByName('openmode')[0].checked = !!configobj.openmode;
    document.getElementsByName('openmode')[0].onchange();    
    document.getElementsByName('showchest')[0].checked = !!configobj.chest;
    document.getElementsByName('showchest')[0].onchange();
    document.getElementsByName('showcrystal')[0].checked = !!configobj.prize;
    document.getElementsByName('showcrystal')[0].onchange();
    document.getElementsByName('showmedallion')[0].checked = !!configobj.medal;
    document.getElementsByName('showmedallion')[0].onchange();
    document.getElementsByName('showlabel')[0].checked = !!configobj.label;
    document.getElementsByName('showlabel')[0].onchange();
    document.getElementsByName('menusprites')[0].checked = !!configobj.menusprites;
    document.getElementsByName('menusprites')[0].onchange();
}

function saveConfig() {
    const config = getConfigObject();
    window.localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

function getConfigObjectFromCookie() {
    configobj = loadConfig();

    cookiekeys.forEach(function (key) {
        if (configobj[key] === undefined) {
            configobj[key] = cookieDefault[key];
        }
    });
    return configobj;
}

function getConfigObject() {
    configobj = {};
    configobj.ts = (new Date()).getTime();

    configobj.map = document.getElementsByName('showmap')[0].checked ? 1 : 0;
    configobj.iZoom = document.getElementsByName('itemdivsize')[0].value;
    configobj.mZoom = document.getElementsByName('mapdivsize')[0].value;

    configobj.mOrien = document.getElementsByName('maporientation')[1].checked ? 1 : 0;
    configobj.mPos = document.getElementsByName('mapposition')[1].checked ? 1 : 0;
    configobj.mapLogic = document.querySelector('input[name="maplogic"]:checked').value;

    configobj.openmode = document.getElementsByName('openmode')[0].checked ? 1 : 0;
    configobj.chest = document.getElementsByName('showchest')[0].checked ? 1 : 0;
    configobj.prize = document.getElementsByName('showcrystal')[0].checked ? 1 : 0;
    configobj.medal = document.getElementsByName('showmedallion')[0].checked ? 1 : 0;
    configobj.label = document.getElementsByName('showlabel')[0].checked ? 1 : 0;
    configobj.menusprites = document.getElementsByName('menusprites')[0].checked ? 1 : 0;

    configobj.items = window.vm.itemRows;

    return configobj;
}

function init(callback) {
    callback();
}

// Event of clicking a chest on the map
function toggleChest(x){
    trackerData.chestsopened[x] = !trackerData.chestsopened[x];
    updateAll();
}

// Highlights a chest location and shows the name as caption
function highlight(x){
    document.getElementById("caption").innerHTML = chests[x].name;
}

function unhighlight(x){
    document.getElementById("caption").innerHTML = "&nbsp;";
}

// Highlights a chest location and shows the name as caption (but for dungeons)
function highlightDungeon(x){
    document.getElementById("caption").innerHTML = dungeons[x].name;
}

function unhighlightDungeon(x){
    document.getElementById("caption").innerHTML = "&nbsp;";
}

function menuSprites(sender) {
    trackerOptions.menusprites = sender.checked;
    updateAll();
    saveConfig();
}

function showChest(sender) {
    trackerOptions.showchests = sender.checked;
    refreshMap();
    saveConfig();
}

function showCrystal(sender) {
    trackerOptions.showprizes = sender.checked;
    refreshMap();
    saveConfig();
}

function showMedallion(sender) {
    trackerOptions.showmedals = sender.checked;
    refreshMap();
    saveConfig();
}

function showLabel(sender) {
    trackerOptions.showlabels = sender.checked;
    refreshMap();
    saveConfig();
}

function setOrder(H) {
    if (H) {
        document.getElementById('layoutdiv').classList.add('below-layout');
        document.getElementById('layoutdiv').classList.remove('side-layout');        
    } else {
        document.getElementById('layoutdiv').classList.add('side-layout');
        document.getElementById('layoutdiv').classList.remove('below-layout');
    }
    saveConfig();
}

function setZoom(target, sender) {
    if (target === 'itemdiv') {
        document.body.style.setProperty("--itemScale", sender.value / 100);
    } else if (target === 'mapdiv') {
        document.body.style.setProperty("--mapScale", sender.value / 100);
    }
    document.getElementById(target + 'size').innerHTML = (sender.value) + '%';    
    saveConfig();
}

var prevH = false;
function setMapOrientation(H) {
    if (H === prevH) {
        return;
    }
    prevH = H;

    var chest = document.getElementsByClassName("map-anchor");
    var i;

    if (H) {
        document.getElementById("mapdiv").classList.remove('mapdiv');
        document.getElementById("mapdiv").classList.add('mapvdiv');
        for (i = 0; i < chest.length; i++) {
            var x = parseFloat(chest[i].style.left) / 100;
            var y = parseFloat(chest[i].style.top) / 100;

            if (x > 0.5) {
                chest[i].style.left = (((x - 0.5) * 2) * 100) + '%';
                chest[i].style.top = (((y / 2) + 0.5) * 100) + '%';
            }
            else {
                chest[i].style.left = ((x  * 2) * 100) + '%';
                chest[i].style.top = ((y / 2) * 100) + '%';
            }
        }
    }
    else {
        document.getElementById("mapdiv").classList.add('mapdiv');
        document.getElementById("mapdiv").classList.remove('mapvdiv');
        for (i = 0; i < chest.length; i++) {
            var x = parseFloat(chest[i].style.left) / 100;
            var y = parseFloat(chest[i].style.top) / 100;

            if (y > 0.5) {
                chest[i].style.left = (((x / 2) + 0.5) * 100) + '%';
                chest[i].style.top = (((y - 0.5) * 2) * 100) + '%';
            }
            else {
                chest[i].style.left = ((x / 2) * 100) + '%';
                chest[i].style.top = ((y * 2) * 100) + '%';
            }
        }
    }
    saveConfig();
}

function setOpenMode(sender) {
    trackerOptions.openmode = sender.checked;
    refreshMap();
    saveConfig();
}

function setLogic(logic) {
    trackerOptions.mapLogic = logic;
    refreshMap();
    saveConfig();
}

function showSettings(sender) {
    if (trackerOptions.editmode) {
        trackerOptions.showchests = document.getElementsByName('showchest')[0].checked;
        trackerOptions.showprizes = document.getElementsByName('showcrystal')[0].checked;
        trackerOptions.showmedals = document.getElementsByName('showmedallion')[0].checked;
        trackerOptions.showlabels = document.getElementsByName('showlabel')[0].checked;
        trackerOptions.editmode = false;
        showTracker('mapdiv', document.getElementsByName('showmap')[0]);
        document.getElementById('itemconfig').style.display = 'none';

        sender.innerHTML = '🔧';
        saveConfig();
    } else {
        var x = document.getElementById("settings");
        if (!x.style.display || x.style.display === 'none') {
            x.style.display = 'initial';
            sender.innerHTML = 'X';
        } else {
            x.style.display = 'none';		
            sender.innerHTML = '🔧';
        } 
    }
}

function showTracker(target, sender) {
    if (sender.checked) {
        document.getElementById(target).style.display = '';
    }
    else {
        document.getElementById(target).style.display = 'none';
    }
}

function EditMode() {
    trackerOptions.showchests = false;
    trackerOptions.showprizes = false;
    trackerOptions.showmedals = false;
    trackerOptions.showlabels = false;
    trackerOptions.editmode = true;
    showTracker('mapdiv', {checked:false});
    document.getElementById('settings').style.display = 'none';
    document.getElementById('itemconfig').style.display = '';

    document.getElementById('settingsbutton').innerHTML = 'Exit Edit Mode';
}

function refreshMapMedallions() {
  refreshMapMedallion(8);
  refreshMapMedallion(9);
}

function refreshMapMedallion(d) {
    // Update availability of dungeon boss AND chests
    if(trackerData.dungeonbeaten[d])
        document.getElementById("bossMap"+d).className = "boss opened";
    else
        document.getElementById("bossMap"+d).className = "boss " + dungeons[d].isBeatable().getClassName();

    if(trackerData.dungeonchests[d] > 0)
        document.getElementById("dungeon"+d).className = "mapspan 1dungeon " + dungeons[d].canGetChest().getClassName();
    // TRock medallion affects Mimic Cave
    if(d === 9){
        refreshChests();
    }
    // Change the mouseover text on the map
    var dungeonName;
    if(d === 8)
        dungeonName = "Misery Mire";
    else
        dungeonName = "Turtle Rock";
    dungeons[d].name = dungeonName + " <img src='images/medallion"+trackerData.medallions[d]+".png' class='mini'><img src='images/lantern.png' class='mini'>";
}

function refreshChests() {
    for(k=0; k<chests.length; k++){
        if(trackerData.chestsopened[k])
            document.getElementById(k).className = "mapspan chest opened";
        else
            document.getElementById(k).className = "mapspan chest " + chests[k].isAvailable().getClassName();
    }
}

function refreshMap() {
  refreshMapMedallions();
  refreshChests();

  for(k=0; k<dungeons.length; k++){
      if(trackerData.dungeonbeaten[k])
          document.getElementById("bossMap"+k).className = "boss opened";
      else
          document.getElementById("bossMap"+k).className = "boss " + dungeons[k].isBeatable().getClassName();
      if(trackerData.dungeonchests[k])
          document.getElementById("dungeon"+k).className = "mapspan dungeon " + dungeons[k].canGetChest().getClassName();
      else
          document.getElementById("dungeon"+k).className = "mapspan dungeon opened";
  }
}

function itemConfigClick (sender) {
    var item = sender.id;

    if (trackerOptions.selected.item) {
        document.getElementById(trackerOptions.selected.item).style.border = '0px';
        sender.style.border = '3px solid yellow';
        trackerOptions.selected = {item:item};	
    } else if (trackerOptions.selected.row !== undefined) {
        itemGrid[selected.row][selected.col]['item'].style.border = '1px solid white';
        var old = itemLayout[selected.row][selected.col];

        if (old === item) {
            selected = {};
            return;
        }

        if (item !== 'blank') {
            sender.style.opacity = 0.25;

            var r,c;
            var found = false;
            for (r = 0; r < 8; r++) {
                for (c = 0; c < 7; c++) {
                    if (itemLayout[r][c] === item) {
                        itemLayout[r][c] = 'blank';
                        updateGridItem(r, c);
                        found = true;
                        break;
                    }
                }

                if (found)
                    break;
            }
        }

        itemLayout[selected.row][selected.col] = item;
        updateGridItem(selected.row, selected.col);

        document.getElementById(old).style.opacity = 1;

        trackerOptions.selected = {};
    } else {
        sender.style.border = '3px solid yellow';
        trackerOptions.selected = {item:item}
    }
}

function populateMapdiv() {
    var mapdiv = document.getElementById('mapdiv');

    // Initialize all chests on the map
    for(k=0; k<chests.length; k++){
        var div = document.createElement('div');
        var s = document.createElement('span');
        s.style.color = 'black';
        s.id = k;
        s.onclick = new Function('toggleChest('+k+')');
        s.onmouseover = new Function('highlight('+k+')');
        s.onmouseout = new Function('unhighlight('+k+')');
        div.style.left = chests[k].x;
        div.style.top = chests[k].y;
        if(trackerData.chestsopened[k])
            s.className = "mapspan chest opened";
        else
            s.className = "mapspan chest " + chests[k].isAvailable().getClassName();
        div.className = "map-anchor";
        div.appendChild(s);
        mapdiv.appendChild(div);
    }

    // Dungeon bosses & chests
    for(k=0; k<dungeons.length; k++){
        var div = document.createElement('div');
        div.className = "map-anchor";
        
        var s = document.createElement('span');
        s.id = 'dungeon' + k;
        s.onmouseover = new Function('highlightDungeon('+k+')');
        s.onmouseout = new Function('unhighlightDungeon('+k+')');
        div.style.left = dungeons[k].x;
        div.style.top = dungeons[k].y;
        s.className = "mapspan dungeon " + dungeons[k].canGetChest().getClassName();
        div.appendChild(s);

        const bossSpan = document.createElement('span');
        bossSpan.style.backgroundImage = 'url(images/' + dungeons[k].image + ')';
        bossSpan.id = 'bossMap' + k;
        bossSpan.className = "boss " + dungeons[k].isBeatable().getClassName();
        s.appendChild(bossSpan);

        mapdiv.appendChild(div);
    }
}

function populateItemconfig() {
    var grid = document.getElementById('itemconfig');

    var i = 0;

    var row;

    for (var key in trackerData.items) {
        if (i % 10 === 0){
            row = document.createElement('tr');
            grid.appendChild(row);
        }
        i++;

        var rowitem = document.createElement('td');
        rowitem.className = 'corner editcell';
        rowitem.id = key;
        rowitem.style.backgroundSize = '100% 100%';
        rowitem.onclick = new Function('itemConfigClick(this)');
        
        path = getItemPathByName(this.trackerOptions, key);
        if((typeof trackerData.items[key]) === "boolean"){
            rowitem.style.backgroundImage = "url(images/" + path + ".png)";
        }
        else if(key.indexOf("heart") === 0){
            rowitem.style.backgroundImage = "url(images/" + path + ".png)";
        }
        else{
            rowitem.style.backgroundImage = "url(images/" + path + itemsMax[key] + ".png)";
        }
        if(key.indexOf("boss") === 0){
            rowitem.innerText = dungeons[key.substring(4)].label;
        }
        row.appendChild(rowitem);
    }		
}

function initTracker() {
    populateMapdiv();
    populateItemconfig();

    loadCookie();
    updateAll();
}

function updateAll() {
    if(trackerData.items && trackerData.dungeonchests && trackerData.dungeonbeaten && trackerData.prizes && trackerData.medallions && trackerData.chestsopened) {
      vm.displayVueMap = true;
      refreshMap();
    }
}

menuSpriteItems = {
    bomb0:0,
    bomb1:0,
    bomb2:0,
    bombos:0,
    book:0,
    boomerang:0,
    boomerang0:0,
    boomerang1:0,
    boomerang2:0,
    boomerang3:0,
    bottle0:0,
    bottle1:0,
    bottle2:0,
    bottle3:0,
    bottle4:0,
    bow:0,
    byrna:0,
    cape:0,
    ether:0,
    firerod:0,
    flute:0,
    fluteshovel:0,
    fluteshovel0:0,
    fluteshovel1:0,
    fluteshovel2:0,
    fluteshovel3:0,
    hammer:0,
    hookshot:0,
    icerod:0,
    lantern:0,
    mirror:0,
    mushpowder:0,
    mushpowder0:0,
    mushpowder1:0,
    mushpowder2:0,
    mushpowder3:0,
    mushroom:0,
    net:0,
    powder:0,
    quake:0,
    shovel:0,
    silvers:0,
    somaria:0,
    sword:0,
    sword0:0,
    sword1:0,
    sword2:0,
    sword3:0,
    sword4:0

 };
function getItemPathByName(trackerOptions, name) {
    if (trackerOptions && trackerOptions.menusprites) {
        if (menuSpriteItems.hasOwnProperty(name)) {
        return "menusprites/" + name;
        }
    }
    return name;
}

Vue.component('tracker-table', {
  template: '#tracker-table',
  props: [
    'itemRows',
    'trackerData',
    'trackerOptions'
  ],
  computed: {
    maxRowLength: function() {
      return !this.itemRows.reduce ? 0 : this.itemRows.map(function(i) {return i.length}).reduce(function(a,b) {
          return Math.max(a, b);
      });
    }
  },
  methods: {
    itemFor: function(itemName) {
      if(!this.trackerData || !this.trackerData.items) return null;
      return this.trackerData.items[itemName];
    },
    addRow: function(e) {
      vm.itemRows.push(['blank']);
    },
    addItem: function(rowIndex) {
      vm.itemRows[rowIndex].push('blank');
    },
    removeItem: function(rowIndex) {
      vm.itemRows[rowIndex].pop();
      if(vm.itemRows[rowIndex].length === 0) {
        vm.itemRows.splice(rowIndex,1);
      }
    }
  }
});



Vue.component('tracker-cell', {
  template: '#tracker-cell',
  props: [
    'itemValue',
    'itemName',
    'columnIndex',
    'rowIndex',
    'trackerData',
    'trackerOptions'
  ],
  computed: {
    bossNum: function() {
      if(this.itemName.indexOf("boss") === -1) { return null; }
      return this.itemName.substring(4);
    },
    dungeonLabel: function() {
      if(this.bossNum && this.trackerOptions && this.trackerOptions.showlabels) {
        return dungeons[this.bossNum].label;
      }
      return null;
    },
    textCounter: function() {
      if(this.itemName.indexOf('heart') === 0) {
        return this.itemValue;
      }
      return null;
    },
    backgroundImage: function() {
      itempath = getItemPathByName(this.trackerOptions, this.itemName);
      
      if(this.itemName === 'blank') {
        return this.trackerOptions.editmode ? 'url(images/blank.png)' :'none';
      }
      else if((typeof this.itemValue) === "boolean") {
        return 'url(images/' + itempath + '.png)';
      }
      else if(this.textCounter !== null) {
        return 'url(images/' + itempath + '.png)';
      }
      return 'url(images/' + itempath + (this.trackerOptions.editmode ? itemsMax[this.itemName] : (this.itemValue || '0')) + '.png)';
    },
    isActive: function() {
      return this.trackerOptions.editmode || this.itemValue;
    },
    chestImage: function() {
      if(this.bossNum && this.trackerOptions && this.trackerOptions.showchests) {
        return "url(images/chest" + this.trackerData.dungeonchests[this.bossNum] + ".png)";
      }
      return null;
    },
    prizeImage: function() {
      if(this.bossNum && this.bossNum !== "10" && this.trackerOptions && this.trackerOptions.showprizes) {
        return "url(images/dungeon" + this.trackerData.prizes[this.bossNum] + ".png)";
      }
      return null;
    },
    medallionImage: function() {
      if((this.bossNum === "8" || this.bossNum === "9") && this.trackerOptions && this.trackerOptions.showmedals) {
        return "url(images/medallion" + this.trackerData.medallions[this.bossNum] + ".png)";
      }
      return null;
    }
  },
  methods: {
    clickCell: function(amt) {
      if(this.trackerOptions.editmode) {
          Vue.set(vm.itemRows[this.rowIndex], this.columnIndex, this.trackerOptions.selected.item || 'blank');
        return;
      }
      // Non-edit mode clicks
      if(this.bossNum) {
        // Do both this and the below for bosses
        this.trackerData.dungeonbeaten[this.bossNum] = !this.trackerData.dungeonbeaten[this.bossNum];
        updateAll();
      }
      if((typeof this.itemValue) === "boolean"){        
        this.trackerData.items[this.itemName] = !this.itemValue;
        updateAll();
      }
      else{
        var newVal = (this.itemValue || 0) + amt;
        if(newVal > itemsMax[this.itemName]){
          newVal = itemsMin[this.itemName];
        }
        if(newVal < itemsMin[this.itemName]){
          newVal = itemsMax[this.itemName];
        }
        this.trackerData.items[this.itemName] = newVal;
        updateAll();
      }
    },
    clickCellForward: function(e) {
      this.clickCell(1);
    },
    clickCellBack: function(e) {
      this.clickCell(-1);
    },
    clickMedallion: function(amt) {
      var newMedallion = (this.trackerData.medallions[this.bossNum] + amt + 4) % 4;
      // need to use splice here instead of just setting it the normal way or vue won't pick up the change
      this.trackerData.medallions.splice(this.bossNum, 1, newMedallion);
      updateAll();
    },
    clickMedallionForward: function(e) {
      this.clickMedallion(1);
    },
    clickMedallionBack: function(e) {
      this.clickMedallion(-1);
    },
    clickChest: function(amt) {
      var chestitem = 'chest' + this.bossNum;
      var modamt = itemsMax[chestitem] + 1;
      var newVal = (this.trackerData.dungeonchests[this.bossNum] + amt + modamt) % modamt;
      this.trackerData.dungeonchests[this.bossNum] = newVal;
      updateAll();
    },
    clickChestForward: function(e) {
      this.clickChest(1);
    },
    clickChestBack: function(e) {
      this.clickChest(-1);
    },
    clickPrize: function(amt) {
      var newPrize = (this.trackerData.prizes[this.bossNum] + amt + 4) % 4;
      // need to use splice here instead of just setting it the normal way or vue won't pick up the change
      this.trackerData.prizes.splice(this.bossNum, 1, newPrize);
      updateAll(); 
    },
    clickPrizeForward: function(e) {
        this.clickPrize(1);
    },
    clickPrizeBack: function(e) {
        this.clickPrize(-1);
    },
  }
});

var vm = new Vue({
  data:{
      itemRows: [],
      trackerData: window.trackerData,
      trackerOptions: window.trackerOptions,
      displayVueMap: false
  },
  el: '#layoutdiv'
});
