let colors = ['black', 'cyan', 'blue', 'orange', 'yellow', 'green', 'purple', 'red'];
let shapes = {
	"O": [
		[
			[0, 0, 0, 0],
			[0, 1, 1, 0],
			[0, 1, 1, 0],
			[0, 0, 0, 0],
		],
	],
	"I": [
		[
			[0, 2, 0, 0],
			[0, 2, 0, 0],
			[0, 2, 0, 0],
			[0, 2, 0, 0],
		],
		[
			[0, 0, 0, 0],
			[2, 2, 2, 2],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
		],
	],
	"S": [
		[
			[0, 3, 0, 0],
			[0, 3, 3, 0],
			[0, 0, 3, 0],
			[0, 0, 0, 0],
		],
		[
			[0, 3, 3, 0],
			[3, 3, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
		],
	],
	"Z": [
		[
			[0, 0, 4, 0],
			[0, 4, 4, 0],
			[0, 4, 0, 0],
			[0, 0, 0, 0],
		],
		[
			[4, 4, 0, 0],
			[0, 4, 4, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
		],
	],
	"L": [
		[
			[0, 5, 0, 0],
			[0, 5, 0, 0],
			[0, 5, 5, 0],
			[0, 0, 0, 0],
		],
		[
			[0, 0, 5, 0],
			[5, 5, 5, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
		],
		[
			[5, 5, 0, 0],
			[0, 5, 0, 0],
			[0, 5, 0, 0],
			[0, 0, 0, 0],
		],
		[
			[0, 0, 0, 0],
			[5, 5, 5, 0],
			[5, 0, 0, 0],
			[0, 0, 0, 0],
		],
	],
	"J": [
		[
			[0, 6, 6, 0],
			[0, 6, 0, 0],
			[0, 6, 0, 0],
			[0, 0, 0, 0],
		],
		[
			[6, 0, 0, 0],
			[6, 6, 6, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
		],
		[
			[0, 6, 0, 0],
			[0, 6, 0, 0],
			[6, 6, 0, 0],
			[0, 0, 0, 0],
		],
		[
			[0, 0, 0, 0],
			[6, 6, 6, 0],
			[0, 0, 6, 0],
			[0, 0, 0, 0],
		],
	],
	"T": [
		[
			[0, 7, 0, 0],
			[0, 7, 7, 0],
			[0, 7, 0, 0],
			[0, 0, 0, 0],
		],
		[
			[0, 7, 0, 0],
			[7, 7, 7, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
		],
		[
			[0, 7, 0, 0],
			[7, 7, 0, 0],
			[0, 7, 0, 0],
			[0, 0, 0, 0],
		],
		[
			[0, 0, 0, 0],
			[7, 7, 7, 0],
			[0, 7, 0, 0],
			[0, 0, 0, 0],
		],
	],
}
let controls = {
	80: 'pause',
	37: 'left',
	38: 'rotate',
	39: 'right',
	40: 'down',
}

class Matrix
{
	constructor(w = 0, h = 0)
	{
		this.w = w;
		this.h = h;
		this.grid = Array(w).fill(0).map(x => Array(h).fill(0));
	}
	
	setGrid(grid)
	{
		this.grid = grid;
		this.w = grid.length;
		this.h = grid[0].length;
	}

	merge(shape)
	{
		shape.matrix.grid.forEach((rows, x) => {
			rows.forEach((value, y) => {
				if (value)
				{
					this.grid[x + shape.pos.x][y + shape.pos.y] = value;
				}
			});
		});
	}

	overlaps(shape)
	{
		let overlaps = false;
		shape.matrix.grid.forEach((rows, x) => {
			rows.forEach((value, y) => {
				let posX = x + shape.pos.x;
				let posY = y + shape.pos.y;
				if (value > 0 && posX < 0)
				{
					overlaps = true;
				}
				else if (value > 0 && posX >= this.w)
				{
					overlaps = true;
				}
				else if (value > 0 && (
					posY >= this.h ||
					this.grid[posX][posY] > 0)
				)
				{
					overlaps = true;
				}
			});
		});
		return overlaps;
	}

	removeRow(row)
	{
		this.grid.forEach((rows, x) => {
			this.grid[x].splice(row, 1);
			this.grid[x].unshift(0);
		});
	}
	
	removeFilled()
	{
		let filled;
		let removed = 0;
		for (let y = 0; y < this.h; y++)
		{
			filled = true;
			for (let x = 0; x < this.w; x++)
			{
				if (!this.grid[x][y])
				{
					filled = false;
					continue;
				}
			}
			if (filled)
			{
				this.removeRow(y);
				removed++;
			}
		}
		return removed;
	}
}

class Shape
{
	constructor(frames, pos = false, frame = 0)
	{
		this.frames = frames;
		this.frame = frame;
		this.pos = pos || {x: 3, y: -1};
		this.matrix = new Matrix(4, 4);
		this.matrix.setGrid(this.frames[this.updateFrame()]);
	}

	copy()
	{
		return new Shape(
			JSON.parse(JSON.stringify(this.frames)), 
			JSON.parse(JSON.stringify(this.pos)),
			this.frame
		);
	}

	updateFrame(index = 0)
	{
		this.frame += index;
		if (this.frame <= 0)
		{
			this.frame += this.frames.length;
		}
		return this.frame % this.frames.length;
	}

	rotateCW()
	{
		this.matrix.setGrid(this.frames[this.updateFrame(1)]);
	}

	rotateCCW()
	{
		this.matrix.setGrid(this.frames[this.updateFrame(-1)]);
	}
}

class Game
{
	constructor(ctx, w, h, shapes, colors)
	{
		this.ctx = ctx;
		this.width = w;
		this.height = h;
		this.size = ctx.canvas.clientHeight / h;
		this.matrix = new Matrix(w, h);
		this.shapes = shapes;
		this.colors = colors;
		this.newShape();
		this.gameover = false;
		this.pause = false;
		this.level = 1;
		this.score = 0;
		this.lines = 0;
	}

	getRandomShape()
	{
		let pieces = 'OISZLJT';
		return this.shapes[pieces[Math.floor(Math.random() * pieces.length)]];
	}

	newShape()
	{
		if (!this.next)
		{
			this.next = new Shape(this.getRandomShape());
		}
		this.shape = this.next;
		if (this.matrix.overlaps(this.shape))
		{
			this.gameover = true;
		}
		this.next = new Shape(this.getRandomShape());
	}
	
	addScore(lines)
	{
		let bonus = [40, 100, 300, 1200];
		this.score += bonus[lines - 1] * (this.level + 1);
	}
	
	addLevel(lines)
	{
		this.lines += lines;
		if (this.lines > 10)
		{
			this.level++;
			this.lines = 0;
		}
	}

	move(dir)
	{
		this.shape.pos.x += dir;
		if (this.matrix.overlaps(this.shape))
		{
			this.shape.pos.x -= dir;
		}
	}

	moveDown()
	{
		this.shape.pos.y += 1;
		if (this.matrix.overlaps(this.shape))
		{
			this.shape.pos.y -= 1;
			this.matrix.merge(this.shape);
			let lines = this.matrix.removeFilled();
			if (lines)
			{
				this.addLevel(lines);
				this.addScore(lines);
			}
			this.newShape();
		}
	}

	rotate()
	{
		let backup = this.shape.copy();
		this.shape.rotateCW();
		let offset = 0;
		while (this.matrix.overlaps(this.shape))
		{
			offset = (Math.abs(offset) + 1) * (offset > 0 ? -1 : 1);
			this.shape.pos.x += offset;
			if (offset > this.shape.matrix.w)
			{
				this.shape = backup;
				return;
			}
		}

	}

	input(key)
	{
		if (key == 'pause')
		{
			this.pause = !this.pause;
		}
		if (this.gameover || this.pause)
		{
			return false;
		}
		if (key == 'down')
		{
			this.moveDown();
		}
		if (key == 'right')
		{
			this.move(1);
		}
		if (key == 'left')
		{
			this.move(-1);
		}
		if (key == 'rotate')
		{
			this.rotate();
		}
	}

	update()
	{
		if (this.gameover || this.pause)
		{
			return false;
		}
		this.moveDown();
	}

	showMatrix(matrix, pos)
	{
		matrix.grid.forEach((rows, x) => {
			rows.forEach((value, y) => {
				if (value)
				{
					this.ctx.fillStyle = 'black';
					this.ctx.fillRect(this.size * (x + pos.x), this.size * (y + pos.y), this.size, this.size);
					this.ctx.fillStyle = this.colors[value];
					this.ctx.fillRect(this.size * (x + pos.x), this.size * (y + pos.y), this.size - 1, this.size - 1);
				}		
			});
		});
	}

	showBoard()
	{
		this.ctx.fillStyle = 'black';
		this.ctx.fillRect(0, 0, this.size * this.width, this.size * this.height);
		this.showMatrix(this.matrix, {x: 0, y: 0});
		this.showMatrix(this.shape.matrix, this.shape.pos);

		if (this.pause)
		{
			this.showText('Pause', this.width / 2 * this.size, this.height / 2 * this.size);
		}

		if (this.gameover)
		{
			this.showText('Game over', this.width / 2 * this.size, this.height / 2 * this.size);
		}
	}

	showText(text, x, y, color = 'white', font = '30px Arial', align = 'center')
	{
		this.ctx.font = font;
		this.ctx.textAlign = align;
		this.ctx.fillStyle = color;
		this.ctx.fillText(text, x, y);
	}

	showPanel()
	{
		let posX = this.height - this.width + this.width / 2;

		//	next shape
		this.showText('Next', posX * this.size, 2 * this.size);
		this.showMatrix(this.next.matrix, {x: posX - this.next.matrix.w / 2, y: 3});

		//	level & score
		this.showText('Level', posX * this.size, 10 * this.size);
		this.showText(this.level, posX * this.size, 12 * this.size);
		this.showText('Score', posX * this.size, 15 * this.size);
		this.showText(this.score, posX * this.size, 17 * this.size);
	}

	show()
	{
		this.showBoard();
		this.showPanel();
	}
}

document.addEventListener('DOMContentLoaded', () => {

	let canvas = document.createElement("canvas");
	canvas.setAttribute("width", 500);
	canvas.setAttribute("height", 500);
	document.body.appendChild(canvas);
	
	let ctx = canvas.getContext("2d");

	let game = new Game(ctx, 10, 20, shapes, colors);

	let start = null;

	function update(timestamp) 
	{
		// bacground
		ctx.fillStyle = 'gray';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		if (!start) start = timestamp;
		let progress = timestamp - start;

		let speedDelay = ((11 - game.level) * 0.05) * 1000;

		if (progress > speedDelay) 
		{
			game.update();
			start = timestamp;
		}
		game.show();
		
		window.requestAnimationFrame(update);
	}
	window.requestAnimationFrame(update);

	document.addEventListener('keydown', event => {
		event = event || window.event;
		let key = event.keyCode;
		if (controls[key])
		{
			game.input(controls[key]);
		}
	});
});

