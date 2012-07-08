(function() {
  var Cell, Cross, Cube, Figure, Stick, ZShape, check_rows, clear_cell, direction_from_event, draw_cell, generate_brick, get_cell, handle_click_event, handle_key_event, init, random_cells, random_color, self, set_cell,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  this.canvas = '';

  this.cell_width = 40;

  this.cell_height = 40;

  this.height = 600;

  this.width = 800;

  self = this;

  $(function() {
    self.canvas = document.getElementById('canvas').getContext('2d');
    return init();
  });

  init = function() {
    self.cells = {};
    self.shapes = [];
    /*
        self.shapes=[new Cross(80,80),
                    new Cube(200,80),
                    new Cross(320,80),
                    new Stick(80,240)]
    */
    $('#canvas').click(function(event) {
      return event.preventDefault();
    });
    $('body').keydown(handle_key_event);
    $('body').click(handle_click_event);
    return generate_brick();
  };

  check_rows = function() {
    return false;
  };

  generate_brick = function() {
    var shape, shape_class, shape_classes;
    shape_classes = [Cross, Cube, Stick, ZShape];
    shape_class = shape_classes[Math.floor(Math.random() * shape_classes.length)];
    shape = new shape_class(400, 40);
    self.selected_shape = shape;
    return shape.fall();
  };

  clear_cell = function(x, y) {
    return delete self.cells[x][y];
  };

  get_cell = function(x, y) {
    if (!self.cells[x]) return;
    return self.cells[x][y];
  };

  set_cell = function(x, y, cell) {
    if (!self.cells[x]) self.cells[x] = {};
    return self.cells[x][y] = cell;
  };

  handle_key_event = function(event) {
    var direction, falling, rotation;
    if (!self.selected_shape) return;
    direction = direction_from_event(event);
    if (direction) {
      selected_shape.move(direction);
      return;
    }
    rotation = event.keyCode === 32;
    if (rotation) {
      selected_shape.rotate();
      return;
    }
    falling = event.keyCode === 70;
    if (falling) selected_shape.fall();
  };

  handle_click_event = function(event) {
    var shape, _i, _len, _ref;
    event.preventDefault();
    _ref = self.shapes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      shape = _ref[_i];
      if (shape.point_in_shape(event.offsetX, event.offsetY)) {
        self.selected_shape = shape;
        return;
      }
    }
  };

  direction_from_event = function(event) {
    var key_map;
    key_map = {
      39: 'right',
      37: 'left',
      40: 'down'
    };
    return key_map[event.keyCode];
  };

  random_cells = function() {
    var i, j, _results;
    _results = [];
    for (i = 0; i <= 20; i++) {
      _results.push((function() {
        var _results2;
        _results2 = [];
        for (j = 0; j <= 15; j++) {
          _results2.push(draw_cell(i + j, i * self.cell_width, j * self.cell_height));
        }
        return _results2;
      })());
    }
    return _results;
  };

  random_color = function() {
    var blue, green, red;
    red = Math.ceil(Math.random() * 255);
    green = Math.ceil(Math.random() * 255);
    blue = Math.ceil(Math.random() * 255);
    if (red > 255) red = 255;
    if (green > 255) green = 255;
    if (blue > 255) blue = 255;
    return "rgb(" + red + "," + green + "," + blue + ")";
  };

  draw_cell = function(left_x, top_y) {
    return self.canvas.fillRect(left_x, top_y, self.cell_width, self.cell_height);
  };

  Figure = (function() {

    Figure.prototype.color = 'rgb(255,255,255)';

    Figure.prototype.cells = [];

    Figure.width = 0;

    Figure.height = 0;

    Figure.x = 0;

    Figure.y = 0;

    function Figure(x, y) {
      this.fall = __bind(this.fall, this);
      this.detect_collision = __bind(this.detect_collision, this);      this.color = random_color();
      this.cells = [];
      if ((x != null) && (y != null)) this.draw(x, y);
    }

    Figure.prototype.point_in_shape = function(x, y) {
      return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
    };

    Figure.prototype.rotate = function() {
      return false;
    };

    Figure.prototype.draw = function(left_x, top_y) {
      this.x = left_x;
      this.y = top_y;
      return self.canvas.fillStyle = this.color;
    };

    Figure.prototype.outline = function() {
      var stroke_style;
      stroke_style = self.canvas.strokeStyle;
      self.canvas.strokeStyle = 'rgb(0,0,0)';
      self.canvas.strokeRect(this.x, this.y, this.width, this.height);
      return self.canvas.strokeStyle = stroke_style;
    };

    Figure.prototype.remove_outline = function() {
      var stroke_style;
      stroke_style = self.canvas.strokeStyle;
      self.canvas.strokeStyle = 'rgb(255,255,255)';
      self.canvas.strokeRect(this.x, this.y, this.width, this.height);
      return self.canvas.strokeStyle = stroke_style;
    };

    Figure.prototype.clear = function() {
      var cell, _i, _len, _ref, _results;
      _ref = this.cells;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cell = _ref[_i];
        _results.push(cell.clear());
      }
      return _results;
    };

    Figure.prototype.move = function(direction) {
      if (this.detect_collision(direction)) return false;
      this.clear();
      if (direction === 'up') this.y -= self.cell_height;
      if (direction === 'down') this.y += self.cell_height;
      if (direction === 'left') this.x -= self.cell_width;
      if (direction === 'right') this.x += self.cell_width;
      this.draw(this.x, this.y);
      return true;
    };

    Figure.prototype.detect_collision = function(direction) {
      var cell, _i, _j, _k, _l, _len, _len2, _len3, _len4, _ref, _ref2, _ref3, _ref4;
      if (direction === 'up') {
        _ref = this.upper_cells();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          cell = _ref[_i];
          if (get_cell(cell.x, cell.y - self.cell_height)) return true;
        }
      }
      if (direction === 'down') {
        _ref2 = this.bottom_cells();
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          cell = _ref2[_j];
          if (get_cell(cell.x, cell.y + self.cell_height) || this.bottom_y() + self.cell_height > self.height) {
            return true;
          }
        }
      }
      if (direction === 'left') {
        _ref3 = this.left_cells();
        for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
          cell = _ref3[_k];
          if (get_cell(cell.x - self.cell_width, cell.y)) return true;
        }
      }
      if (direction === 'right') {
        _ref4 = this.right_cells();
        for (_l = 0, _len4 = _ref4.length; _l < _len4; _l++) {
          cell = _ref4[_l];
          if (get_cell(cell.x + self.cell_width, cell.y)) return true;
        }
      }
      return false;
    };

    Figure.prototype.bottom_y = function() {
      return this.y + this.height;
    };

    Figure.prototype.fall = function() {
      if (this.move('down')) {
        return setTimeout(this.fall, 1000);
      } else {
        check_rows();
        return generate_brick();
      }
    };

    Figure.prototype.upper_cells = function() {
      var cell, _i, _len, _ref, _ref2, _results;
      _ref = this.cells;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cell = _ref[_i];
        if (_ref2 = cell.upper_neighbour(), __indexOf.call(this.cells, _ref2) < 0) {
          _results.push(cell);
        }
      }
      return _results;
    };

    Figure.prototype.left_cells = function() {
      var cell, _i, _len, _ref, _ref2, _results;
      _ref = this.cells;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cell = _ref[_i];
        if (_ref2 = cell.left_neighbour(), __indexOf.call(this.cells, _ref2) < 0) {
          _results.push(cell);
        }
      }
      return _results;
    };

    Figure.prototype.bottom_cells = function() {
      var cell, _i, _len, _ref, _ref2, _results;
      _ref = this.cells;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cell = _ref[_i];
        if (_ref2 = cell.bottom_neighbour(), __indexOf.call(this.cells, _ref2) < 0) {
          _results.push(cell);
        }
      }
      return _results;
    };

    Figure.prototype.right_cells = function() {
      var cell, _i, _len, _ref, _ref2, _results;
      _ref = this.cells;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cell = _ref[_i];
        if (_ref2 = cell.right_neighbour(), __indexOf.call(this.cells, _ref2) < 0) {
          _results.push(cell);
        }
      }
      return _results;
    };

    return Figure;

  })();

  Cell = (function(_super) {

    __extends(Cell, _super);

    Cell.prototype.width = self.cell_width;

    Cell.prototype.height = self.cell_height;

    function Cell(x, y, color) {
      this.color = color;
      if ((x != null) && (y != null)) this.draw(x, y);
    }

    Cell.prototype.left_neighbour = function() {
      return get_cell(this.x - self.cell_width, this.y);
    };

    Cell.prototype.right_neighbour = function() {
      return get_cell(this.x + self.cell_width, this.y);
    };

    Cell.prototype.upper_neighbour = function() {
      return get_cell(this.x, this.y - self.cell_width);
    };

    Cell.prototype.bottom_neighbour = function() {
      return get_cell(this.x, this.y + self.cell_width);
    };

    Cell.prototype.draw = function(left_x, top_y) {
      Cross.__super__.draw.call(this, left_x, top_y);
      draw_cell(left_x + self.cell_width, top_y);
      set_cell(left_x, top_y, this);
      return this;
    };

    Cell.prototype.clear = function() {
      var original_color;
      original_color = this.color;
      this.color = 'rgb(255,255,255)';
      this.draw(this.x, this.y);
      this.color = original_color;
      return clear_cell(this.x, this.y);
    };

    return Cell;

  })(Figure);

  Cross = (function(_super) {

    __extends(Cross, _super);

    function Cross() {
      Cross.__super__.constructor.apply(this, arguments);
    }

    Cross.prototype.width = 3 * self.cell_width;

    Cross.prototype.height = 3 * self.cell_height;

    Cross.prototype.draw = function(left_x, top_y) {
      Cross.__super__.draw.call(this, left_x, top_y);
      return this.cells = [new Cell(left_x + self.cell_width, top_y, this.color), new Cell(left_x, top_y + self.cell_height, this.color), new Cell(left_x + self.cell_width, top_y + self.cell_height, this.color), new Cell(left_x + 2 * self.cell_width, top_y + cell_height, this.color), new Cell(left_x + self.cell_width, top_y + 2 * cell_height, this.color)];
    };

    return Cross;

  })(Figure);

  Cube = (function(_super) {

    __extends(Cube, _super);

    function Cube() {
      Cube.__super__.constructor.apply(this, arguments);
    }

    Cube.prototype.width = 2 * self.cell_width;

    Cube.prototype.height = 2 * self.cell_height;

    Cube.prototype.draw = function(left_x, top_y) {
      Cube.__super__.draw.call(this, left_x, top_y);
      return this.cells = [new Cell(left_x, top_y, this.color), new Cell(left_x + self.cell_width, top_y, this.color), new Cell(left_x, top_y + self.cell_height, this.color), new Cell(left_x + self.cell_width, top_y + self.cell_height, this.color)];
    };

    return Cube;

  })(Figure);

  Stick = (function(_super) {

    __extends(Stick, _super);

    function Stick() {
      Stick.__super__.constructor.apply(this, arguments);
    }

    Stick.prototype.width = 4 * self.cell_width;

    Stick.prototype.height = self.cell_height;

    Stick.prototype.rotate = function() {
      var height, width;
      this.clear();
      width = this.width;
      height = this.height;
      this.height = width;
      this.width = height;
      return this.draw(this.x, this.y);
    };

    Stick.prototype.draw = function(left_x, top_y) {
      var i, inc, result, _results;
      Stick.__super__.draw.call(this, left_x, top_y);
      if (this.width > this.height) {
        inc = function(x, y) {
          return [x + self.cell_width, y];
        };
      } else {
        inc = function(x, y) {
          return [x, y + self.cell_height];
        };
      }
      _results = [];
      for (i = 0; i <= 3; i++) {
        if (!this.cells[i]) this.cells[i] = new Cell(null, null, this.color);
        this.cells[i].draw(left_x, top_y, this.color);
        result = inc(left_x, top_y);
        left_x = result[0];
        _results.push(top_y = result[1]);
      }
      return _results;
    };

    return Stick;

  })(Figure);

  ZShape = (function(_super) {

    __extends(ZShape, _super);

    function ZShape() {
      ZShape.__super__.constructor.apply(this, arguments);
    }

    ZShape.prototype.width = 2 * self.cell_width;

    ZShape.prototype.height = 2 * self.cell_height;

    ZShape.prototype.rotated = false;

    ZShape.prototype.rotate = function() {
      this.clear();
      this.rotated = !this.rotated;
      return this.draw(this.x, this.y);
    };

    ZShape.prototype.draw = function(left_x, top_y) {
      var cells, i, _results;
      ZShape.__super__.draw.call(this, left_x, top_y);
      cells = [[left_x, top_y], [left_x + self.cell_width, top_y], [left_x + self.cell_width, top_y + self.cell_height], [left_x + 2 * self.cell_width, top_y + self.cell_height]];
      if (this.rotated) {
        cells[1] = [left_x, top_y + self.cell_height];
        cells[2] = [left_x - self.cell_width, top_y + self.cell_height];
        cells[3] = [left_x - self.cell_width, top_y + 2 * self.cell_height];
      }
      _results = [];
      for (i = 0; i <= 3; i++) {
        if (!this.cells[i]) this.cells[i] = new Cell(null, null, this.color);
        _results.push(this.cells[i].draw(cells[i][0], cells[i][1], this.color));
      }
      return _results;
    };

    return ZShape;

  })(Figure);

}).call(this);
