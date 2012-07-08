this.canvas = ''
this.cell_width = 40
this.cell_height = 40
this.height = 600
this.width = 800

self = this

$ ->
    self.canvas = document.getElementById('canvas').getContext('2d')
    init()


init=->
    self.cells = {}
    self.shapes = []
    ###
    self.shapes=[new Cross(80,80),
                new Cube(200,80),
                new Cross(320,80),
                new Stick(80,240)]
    ###
    $('#canvas').click (event)->
            event.preventDefault()
            
    $('body').keydown handle_key_event

#    $('body').keypress handle_key_event

    $('body').click handle_click_event
    
    generate_brick()

check_rows = ->false

generate_brick=->
    shape_classes=[Cross,Cube,Stick,ZShape]
    shape_class = shape_classes[Math.floor(Math.random()*shape_classes.length)]
    shape = new shape_class(400,40)
    self.selected_shape = shape
    shape.fall()


clear_cell=(x,y)->
    delete self.cells[x][y]

get_cell = (x,y)->
    if not self.cells[x]
        return undefined
    return self.cells[x][y]

set_cell=(x,y,cell)->
    if not self.cells[x]
        self.cells[x] = {}
    self.cells[x][y] = cell

handle_key_event=(event)->
            if not self.selected_shape
                return
            direction = direction_from_event(event)
            if direction
                selected_shape.move(direction)
                return

            rotation = event.keyCode == 32
            if rotation
                selected_shape.rotate()
                return

            falling = event.keyCode == 70
            if falling
                selected_shape.fall()
                return

handle_click_event=(event)->
            event.preventDefault()
            for shape in self.shapes
                if shape.point_in_shape(event.offsetX,event.offsetY)
                    self.selected_shape = shape
                    return

direction_from_event=(event)->
        key_map =
#                38:'up'
                39:'right'
                37:'left'
                40:'down'
        return key_map[event.keyCode]

random_cells=->
    for i in [0..20]
            for j in [0..15]
                draw_cell(i+j,i*self.cell_width,j*self.cell_height)

random_color=->
        red = Math.ceil(Math.random()*255)
        green = Math.ceil(Math.random()*255)
        blue = Math.ceil(Math.random()*255)
        if red>255
                red = 255
        if green>255
                green = 255
        if blue>255
                blue = 255

        return "rgb(#{red},#{green},#{blue})"

draw_cell=(left_x,top_y)->
                self.canvas.fillRect(left_x,top_y,self.cell_width,self.cell_height)

class Figure

        color:'rgb(255,255,255)'
        cells:[]
        @width = 0
        @height = 0
        @x = 0
        @y = 0

        constructor:(x,y)->
                @color=random_color()
                @cells = []
                if x? and y?
                    @draw(x,y)

        point_in_shape:(x,y)->
                return x>@x and x<@x+@width and y>@y and y<@y+@height

        rotate:->false

        draw:(left_x,top_y)->
                @x=left_x
                @y=top_y
                self.canvas.fillStyle=@color

        outline:->
                stroke_style = self.canvas.strokeStyle
                self.canvas.strokeStyle = 'rgb(0,0,0)'
                self.canvas.strokeRect(@x,@y,@width,@height)
                self.canvas.strokeStyle = stroke_style

        remove_outline:->
                stroke_style = self.canvas.strokeStyle
                self.canvas.strokeStyle = 'rgb(255,255,255)'
                self.canvas.strokeRect(@x,@y,@width,@height)
                self.canvas.strokeStyle = stroke_style

        clear:->
                for cell in @cells
                    cell.clear()
                


        move:(direction)->
                if @detect_collision(direction)
                    return false
                @clear()
                if direction == 'up'
                        @y-=self.cell_height
                if direction == 'down'
                        @y+=self.cell_height
                if direction == 'left'
                        @x-=self.cell_width
                if direction == 'right'
                        @x+=self.cell_width
                @draw(@x,@y)
                return true

        detect_collision:(direction)=>
                if direction == 'up'
                        for cell in @upper_cells()
                            if get_cell(cell.x,cell.y-self.cell_height)
                                return true
                if direction == 'down'
                        for cell in @bottom_cells()
                            if get_cell(cell.x,cell.y+self.cell_height) or @bottom_y()+self.cell_height>self.height
                                return true
                if direction == 'left'
                        for cell in @left_cells()
                            if get_cell(cell.x-self.cell_width,cell.y)
                                return true
                if direction == 'right'
                        for cell in @right_cells()
                            if get_cell(cell.x+self.cell_width,cell.y)
                                return true
                return false
        bottom_y:->@y+@height

        fall:=>
            if @move('down')
               setTimeout @fall,1000
            else
                check_rows()
                generate_brick()
        upper_cells:->
                cell for cell in @cells when cell.upper_neighbour() not in @cells
        left_cells:->
                cell for cell in @cells when cell.left_neighbour() not in @cells
        bottom_cells:->
                cell for cell in @cells when cell.bottom_neighbour() not in @cells
        right_cells:->
                cell for cell in @cells when cell.right_neighbour() not in @cells


class Cell extends Figure
        width:self.cell_width
        height:self.cell_height
        
        constructor:(x,y,color)->
                @color=color
                if x? and y?
                    @draw(x,y)
       
        left_neighbour:->get_cell(@x-self.cell_width,@y)
        right_neighbour:->get_cell(@x+self.cell_width,@y)
        upper_neighbour:->get_cell(@x,@y - self.cell_width)
        bottom_neighbour:->get_cell(@x,@y+self.cell_width)

        draw:(left_x,top_y)->
            Cross.__super__.draw.call(this,left_x,top_y)
            draw_cell(left_x+self.cell_width,top_y)
            set_cell(left_x,top_y,this)
            return this

        clear:()->
            original_color = @color
            @color = 'rgb(255,255,255)'
            @draw(@x,@y)
            @color = original_color
            clear_cell(@x,@y)

        


class Cross extends Figure
        width: 3*self.cell_width
        height:3*self.cell_height

        draw:(left_x,top_y)->
            Cross.__super__.draw.call(this,left_x,top_y)
            @cells=[
                new Cell(left_x+self.cell_width,top_y,@color),
                new Cell(left_x,top_y+self.cell_height,@color),
                new Cell(left_x+self.cell_width,top_y+self.cell_height,@color),
                new Cell(left_x+2*self.cell_width,top_y+cell_height,@color),
                new Cell(left_x+self.cell_width,top_y+2*cell_height,@color),
            ]


class Cube extends Figure
        width: 2*self.cell_width
        height:2*self.cell_height

        draw:(left_x,top_y)->
                Cube.__super__.draw.call(this,left_x,top_y)
                @cells =[
                    new Cell(left_x,top_y,@color),
                    new Cell(left_x+self.cell_width,top_y,@color),
                    new Cell(left_x,top_y+self.cell_height,@color),
                    new Cell(left_x+self.cell_width,top_y+self.cell_height,@color)
                ]

class Stick extends Figure

        width: 4*self.cell_width
        height: self.cell_height

        rotate:->
            @clear()

            width = @width
            height = @height

            @height = width
            @width = height

            @draw(@x,@y)

        draw:(left_x,top_y)->
            Stick.__super__.draw.call(this,left_x,top_y)

            if @width>@height
                #horizontal stick
                inc=(x,y)-> [x+self.cell_width,y]
            else
                #vertical_stick
                inc=(x,y)-> [x,y+self.cell_height]

            for i in [0..3]
                if not @cells[i]
                    @cells[i] = new Cell(null,null,@color)
                @cells[i].draw(left_x,top_y,@color)
                result = inc(left_x,top_y)
                left_x = result[0]
                top_y = result[1]

class ZShape extends Figure
    width: 2*self.cell_width
    height: 2*self.cell_height

    rotated:false
      
    rotate:->
            @clear()
            @rotated = not @rotated
            @draw(@x,@y)
                
         

    draw:(left_x,top_y)->
        ZShape.__super__.draw.call(this,left_x,top_y)
        cells = [
                [left_x,top_y],
                [left_x+self.cell_width,top_y]
                [left_x+self.cell_width,top_y+self.cell_height],
                [left_x+2*self.cell_width,top_y+self.cell_height]
        ]

        if @rotated
                cells[1] = [left_x,top_y + self.cell_height]
                cells[2] = [left_x-self.cell_width,top_y+self.cell_height]
                cells[3] = [left_x-self.cell_width,top_y+2*self.cell_height]
        for i in [0..3]
            if not @cells[i]
                @cells[i] = new Cell(null,null,@color)
            @cells[i].draw(cells[i][0],cells[i][1],@color)



