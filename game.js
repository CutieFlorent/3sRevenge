class Game {
  constructor() {
    this.size = 6;
    this.grid = [];
    this.score = 0;
    this.gameOver = false;

    this.init();
    this.addKeyboardListener();
    this.setupNewGameButton();
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
    document.addEventListener("keydown", (e) => {
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
    });
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
      const value = Math.random() < 0.5 ? 2 : 1;
      this.grid[x][y] = value;
      this.createTileElement(x, y, value, true);
    }
  }

  getPrimeFactors(num) {
    if (num <= 1) return { twos: 0, threes: 0 };
    let twos = 0,
      threes = 0;
    let n = num;

    while (n % 2 === 0) {
      twos++;
      n = n / 2;
    }

    while (n % 3 === 0) {
      threes++;
      n = n / 3;
    }

    return { twos, threes };
  }

  getTileColor(value) {
    if (value === 1) return "#FFFFF0"; // 象牙白
    if (value === 2) return "#3CB371"; // 翡翠绿
    if (value === 3) return "#4169E1"; // 宝蓝色

    const { twos, threes } = this.getPrimeFactors(value);
    const total = twos + threes;
    if (total === 0) return "#FFFFF0";

    const greenRatio = twos / total;
    const blueRatio = threes / total;

    // 使用新的基础颜色进行混合
    const green = Math.round(0x78 * greenRatio + 0x17 * blueRatio);
    const blue = Math.round(0x92 * greenRatio + 0xb0 * blueRatio);

    return `rgb(${Math.round(
      0x78 * greenRatio + 0x17 * blueRatio
    )}, ${green}, ${blue})`;
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
    tile.style.color = value === 1 ? "#000000" : "#FFFFFF";
    document.querySelector(".game-container").appendChild(tile);
  }

  move(direction) {
    let moved = false;
    const newGrid = JSON.parse(JSON.stringify(this.grid));

    const moveAndMerge = (line) => {
      // 移除所有0
      line = line.filter((cell) => cell !== 0);

      // 合并相邻的方块
      for (let i = 0; i < line.length - 1; i++) {
        if (
          line[i] === line[i + 1] ||
          line[i] === 2 * line[i + 1] ||
          line[i] * 2 === line[i + 1] ||
          line[i] === 3 * line[i + 1] ||
          line[i] * 3 === line[i + 1] ||
          line[i] === 8 * line[i + 1] ||
          line[i] * 8 === line[i + 1]
        ) {
          line[i] = line[i] + line[i + 1];
          this.score += line[i];
          document.querySelector(".score").textContent = this.score;
          line.splice(i + 1, 1);
        }
      }

      // 补充0
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
      // 更新网格
      this.grid = newGrid;
      // 更新UI
      this.updateUI();
    }

    return moved;
  }

  updateUI() {
    // 清除所有现有方块
    const tiles = document.querySelectorAll(".tile");
    tiles.forEach((tile) => tile.remove());

    // 重新创建方块
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.grid[i][j] !== 0) {
          this.createTileElement(i, j, this.grid[i][j]);
        }
      }
    }
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
          if (
            current === right ||
            current * 2 === right ||
            current === right * 2
          )
            return false;
        }

        // 检查下边
        if (i < this.size - 1) {
          const down = this.grid[i + 1][j];
          if (current === down || current * 2 === down || current === down * 2)
            return false;
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
