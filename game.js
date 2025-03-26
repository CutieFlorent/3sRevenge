class Game {
  constructor() {
    this.size = 6;
    this.grid = [];
    this.score = 0;
    this.gameOver = false;
    this.isFeminine = null;

    // 初始化音频上下文
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    this.addKeyboardListener();
    this.setupNewGameButton();
    this.showGenderDialog();
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
    tile.style.backgroundColor = this.getTileColor(value);
    // 在 masculinity 模式下反转文字颜色
    const textColor = value === 1 ? "#000000" : "#FFFFFF";
    tile.style.color = !this.isFeminine
      ? value === 1
        ? "#FFFFFF"
        : "#000000"
      : textColor;
    document.querySelector(".game-container").appendChild(tile);
  }

  getTileColor(value) {
    if (value === 0) return "#cdc1b4";
    if (this.isFeminine === null) return "#FFFFF0"; // 如果性别未选择，返回默认颜色

    function getPrimeFactors(num) {
      let count2 = 0,
        count3 = 0;
      let n = num;

      while (n % 2 === 0) {
        count2++;
        n = n / 2;
      }

      while (n % 3 === 0) {
        count3++;
        n = n / 3;
      }

      return { count2, count3 };
    }

    const { count2, count3 } = getPrimeFactors(value);
    const total = count2 + count3;

    // 跨性别旗的蓝色和粉色的RGB值
    const transBlue = { r: 85, g: 205, b: 252 }; // #55CDFC
    const transPink = { r: 247, g: 168, b: 184 }; // #F7A8B8

    // 根据2和3的比例混合颜色
    var r, g, b;
    if (total === 0) {
      (r = 255), (g = 255), (b = 240);
    } else {
      const ratio = count3 / total;
      r = Math.round(transBlue.r * (1 - ratio) + transPink.r * ratio);
      g = Math.round(transBlue.g * (1 - ratio) + transPink.g * ratio);
      b = Math.round(transBlue.b * (1 - ratio) + transPink.b * ratio);
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
    frequency *= 256;

    oscillator.type = "triangle";
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
        const sum = a / commonGcd + b / commonGcd;

        if (sum === 2 || sum === 4 || sum === 3 || sum === 9) {
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
