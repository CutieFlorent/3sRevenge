class Game {
  constructor() {
    this.size = 6;
    this.grid = [];
    this.score = 0;
    this.gameOver = false;
    this.isFeminine = null;
    this.autoMode = false;
    this.autoInterval = null;

    // 初始化音频上下文
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    this.addKeyboardListener();
    this.addTouchListener();
    this.setupNewGameButton();
    this.setupAutoButton();
    this.showGenderDialog();
  }

  addTouchListener() {
    let touchStartX = 0;
    let touchStartY = 0;
    const gameContainer = document.querySelector(".game-container");

    gameContainer.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
      },
      { passive: false }
    );

    gameContainer.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );

    gameContainer.addEventListener(
      "touchend",
      (e) => {
        if (this.gameOver) return;

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;

        const minSwipeDistance = 30;

        let moved = false;

        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipeDistance) {
          moved = this.move(dx > 0 ? "right" : "left");
        } else if (
          Math.abs(dy) > Math.abs(dx) &&
          Math.abs(dy) > minSwipeDistance
        ) {
          moved = this.move(dy > 0 ? "down" : "up");
        }

        if (moved) {
          this.addNewTile();
          if (this.isGameOver()) {
            this.showGameOver();
          }
        }

        e.preventDefault();
      },
      { passive: false }
    );
  }

  setupAutoButton() {
    const autoButton = document.querySelector(".auto-button");
    autoButton.addEventListener("click", () => {
      if (this.autoMode) {
        this.autoMode = false;
        clearInterval(this.autoInterval);
        autoButton.classList.remove("active");
      } else {
        this.autoMode = true;
        autoButton.classList.add("active");
        this.autoInterval = setInterval(() => {
          if (!this.gameOver) {
            const directions = ["up", "down", "left", "right"];
            const randomDirection =
              directions[Math.floor(Math.random() * directions.length)];
            const moved = this.move(randomDirection);
            if (moved) {
              this.addNewTile();
              if (this.isGameOver()) {
                this.showGameOver();
                this.autoMode = false;
                clearInterval(this.autoInterval);
                autoButton.classList.remove("active");
              }
            }
          }
        }, 2.6);
      }
    });
  }

  showGenderDialog() {
    const dialog = document.createElement("div");
    dialog.className = "gender-dialog";
    dialog.innerHTML = `
      <div class="dialog-content">
        <h2>Do you want to be a girl?</h2>
        <div class="dialog-buttons">
          <button id="yes-btn">Yes</button>
          <button id="no-btn">No</button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);

    // 添加按钮事件
    document.getElementById("yes-btn").onclick = () => {
      this.isFeminine = true;
      document.querySelector(".score-title").textContent = "FEMININITY";
      dialog.remove();
      this.init(); // 选择后才初始化游戏
    };

    document.getElementById("no-btn").onclick = () => {
      this.isFeminine = false;
      document.querySelector(".score-title").textContent = "MASCULINITY";
      dialog.remove();
      this.init(); // 选择后才初始化游戏
    };
  }

  init() {
    // 初始化网格
    const gridContainer = document.querySelector(".grid");
    gridContainer.innerHTML = "";
    this.grid = Array(this.size)
      .fill()
      .map(() => Array(this.size).fill(0));

    // 创建网格单元格
    for (let i = 0; i < this.size * this.size; i++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      gridContainer.appendChild(cell);
    }

    // 重置分数
    this.score = 0;
    document.querySelector(".score").textContent = "0";

    // 隐藏游戏结束界面
    document.querySelector(".game-over").style.display = "none";
    this.gameOver = false;

    // 添加初始方块
    this.addNewTile();
    this.addNewTile();
  }

  addKeyboardListener() {
    // 先移除可能存在的旧监听器
    document.removeEventListener("keydown", this.handleKeyDown);

    // 将事件处理函数保存为实例属性
    this.handleKeyDown = (e) => {
      if (e.key === "Escape") {
        // 清理当前游戏状态
        const tiles = document.querySelectorAll(".tile");
        tiles.forEach((tile) => tile.remove());
        this.showGenderDialog();
        return;
      }

      if (this.gameOver) return;

      let moved = false;
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          moved = this.move("left");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          moved = this.move("right");
          break;
        case "ArrowUp":
        case "w":
        case "W":
          moved = this.move("up");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          moved = this.move("down");
          break;
      }

      if (moved) {
        this.addNewTile();
        if (this.isGameOver()) {
          this.showGameOver();
        }
      }
    };

    document.addEventListener("keydown", this.handleKeyDown);
  }

  setupNewGameButton() {
    document.querySelector(".new-game-button").addEventListener("click", () => {
      this.init();
    });
  }

  addNewTile() {
    const emptyCells = [];
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.grid[i][j] === 0) {
          emptyCells.push({ x: i, y: j });
        }
      }
    }

    if (emptyCells.length > 0) {
      const { x, y } =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];
      this.grid[x][y] = Math.random() < 0.5 ? 2 : 1;
      this.createTileElement(x, y, this.grid[x][y], true);
    }
  }

  createTileElement(x, y, value, isNew = false) {
    const tile = document.createElement("div");
    tile.className = isNew ? "tile tile-new" : "tile";
    tile.textContent = value;
    const cellSize = 75;
    const gap = 15;
    const offset = 15;
    tile.style.left = `${y * (cellSize + gap) + offset}px`;
    tile.style.top = `${x * (cellSize + gap) + offset}px`;
    tile.style.width = `${cellSize}px`;
    tile.style.height = `${cellSize}px`;

    const backgroundColor = this.getTileColor(value);
    tile.style.backgroundColor = backgroundColor;

    // 计算背景色的亮度
    const color = backgroundColor.substring(1); // 移除#
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // 根据亮度决定文字颜色
    tile.style.color = brightness > 128 ? "#000000" : "#FFFFFF";

    document.querySelector(".game-container").appendChild(tile);
  }

  getTileColor(value) {
    if (value === 0) return "#cdc1b4";
    if (this.isFeminine === null) return "#FFFFF0"; // 如果性别未选择，返回默认颜色

    function getPrimeFactors(num) {
      let count2 = 0,
        count3 = 0,
        count5 = 0;
      let n = num;

      while (n % 2 === 0) {
        count2++;
        n = n / 2;
      }
      while (n % 3 === 0) {
        count3++;
        n = n / 3;
      }
      while (n % 5 === 0) {
        count5++;
        n = n / 5;
      }

      return { count2, count3, count5 };
    }

    const { count2, count3, count5 } = getPrimeFactors(value);
    const total = count2 + count3 + count5;

    // 跨性别旗的白色、蓝色和粉色的RGB值
    const transWhite = { r: 255, g: 255, b: 240 }; // #FFFFF0
    const transBlue = { r: 85, g: 205, b: 252 }; // #55CDFC
    const transPink = { r: 247, g: 168, b: 184 }; // #F7A8B8

    // 根据2、3和5的比例混合颜色
    var r, g, b;
    if (total === 0) {
      return "#FFFFF0";
    } else {
      const ratio2 = count2 / total;
      const ratio3 = count3 / total;
      const ratio5 = count5 / total;

      r = Math.round(
        transWhite.r * ratio2 + transBlue.r * ratio3 + transPink.r * ratio5
      );
      g = Math.round(
        transWhite.g * ratio2 + transBlue.g * ratio3 + transPink.g * ratio5
      );
      b = Math.round(
        transWhite.b * ratio2 + transBlue.b * ratio3 + transPink.b * ratio5
      );
    }

    // 如果是 masculinity 模式，反转颜色
    if (!this.isFeminine) {
      return `#${(255 - r).toString(16).padStart(2, "0")}${(255 - g)
        .toString(16)
        .padStart(2, "0")}${(255 - b).toString(16).padStart(2, "0")}`;
    }

    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  playMergeSound(value) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // 计算频率
    let frequency = value;
    while (frequency > 2) {
      frequency /= 2;
    }
    if (Math.random() < Math.log2(frequency) * 0.5) {
      frequency /= 2;
    }
    // masculinity模式使用不同的频率系数
    frequency *= this.isFeminine ? 256 : 128;

    // masculinity模式使用方波，feminine模式使用三角波
    oscillator.type = this.isFeminine ? "triangle" : "square";
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.5
    );

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  move(direction) {
    let moved = false;
    const newGrid = JSON.parse(JSON.stringify(this.grid));

    const moveAndMerge = (line) => {
      line = line.filter((cell) => cell !== 0);

      const gcd = (a, b) => {
        if (b === 0) return a;
        return gcd(b, a % b);
      };

      for (let i = 0; i < line.length - 1; i++) {
        const a = line[i];
        const b = line[i + 1];
        const commonGcd = gcd(a, b);
        const na = a / commonGcd;
        const nb = b / commonGcd;
        const sum = na + nb;

        if (
          sum === 2 ||
          sum === 4 ||
          sum === 3 ||
          nb === 4 * na ||
          na === 4 * nb
        ) {
          line[i] = line[i] + line[i + 1];
          this.score += line[i];
          document.querySelector(".score").textContent = this.score;
          this.playMergeSound(line[i]); // 播放合并音效
          line.splice(i + 1, 1);
        }
      }

      while (line.length < this.size) {
        line.push(0);
      }

      return line;
    };

    // 处理每一行/列
    for (let i = 0; i < this.size; i++) {
      let line = [];

      // 提取行/列
      switch (direction) {
        case "left":
          line = this.grid[i].slice();
          break;
        case "right":
          line = this.grid[i].slice().reverse();
          break;
        case "up":
          line = this.grid.map((row) => row[i]);
          break;
        case "down":
          line = this.grid.map((row) => row[i]).reverse();
          break;
      }

      const mergedLine = moveAndMerge(line);

      // 放回处理后的行/列
      switch (direction) {
        case "left":
          newGrid[i] = mergedLine;
          break;
        case "right":
          newGrid[i] = mergedLine.reverse();
          break;
        case "up":
          for (let j = 0; j < this.size; j++) {
            newGrid[j][i] = mergedLine[j];
          }
          break;
        case "down":
          mergedLine.reverse();
          for (let j = 0; j < this.size; j++) {
            newGrid[j][i] = mergedLine[j];
          }
          break;
      }
    }

    // 检查是否有变化
    moved = JSON.stringify(this.grid) !== JSON.stringify(newGrid);

    if (moved) {
      // 清除所有现有方块
      const tiles = document.querySelectorAll(".tile");
      tiles.forEach((tile) => tile.remove());

      // 更新网格并创建新的方块元素
      this.grid = newGrid;
      for (let i = 0; i < this.size; i++) {
        for (let j = 0; j < this.size; j++) {
          if (this.grid[i][j] !== 0) {
            this.createTileElement(i, j, this.grid[i][j]);
          }
        }
      }
    }

    return moved;
  }

  isGameOver() {
    // 检查是否还有空格
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.grid[i][j] === 0) return false;
      }
    }

    // 检查是否还有可以合并的方块
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const current = this.grid[i][j];

        // 检查右边
        if (j < this.size - 1) {
          const right = this.grid[i][j + 1];
          if (current === right) return false;
        }

        // 检查下边
        if (i < this.size - 1) {
          const down = this.grid[i + 1][j];
          if (current === down) return false;
        }
      }
    }

    return true;
  }

  showGameOver() {
    this.gameOver = true;
    document.querySelector(".game-over").style.display = "block";
  }
}

// 启动游戏
new Game();
