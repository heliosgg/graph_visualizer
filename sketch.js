let screenSize = { w: 1280, h: 720 };
let gNodeRadius = 15;
let gPartOfSpeed = 0.1;

let gMatrixShape = 5;
let gMatrix = [ [0, 1, 1, 1, 1, 1, 1],
                [0, 0, 1, 1, 1, 1, 1],
                [0, 0, 0, 1, 1, 1, 1],
                [0, 0, 0, 0, 1, 1, 1],
                [0, 0, 0, 0, 0, 1, 1],
                [0, 0, 0, 0, 0, 0, 1],
                [0, 0, 0, 0, 0, 0, 0]];

let gNodes = [];
let gSliders = [];

let gLockedNode = null;

class Node 
{
    constructor(x, y, label, strength)
    {
        this.x = x;
        this.y = y;
        this.label = label;
        this.strength = strength;
        this.friends = []
    }

    communicate(node)
    {
        let vX = node.x - this.x,
            vY = node.y - this.y,
            vLength = Math.sqrt(vX * vX + vY * vY),
            averStrength = (this.strength + node.strength) / 2;
        
            vX /= vLength;
            vX *= gPartOfSpeed * (vLength - averStrength);

            vY /= vLength;
            vY *= gPartOfSpeed * (vLength - averStrength);

            if(this != gLockedNode)
            {
                this.x += vX;
                this.y += vY;
            }

            if(node != gLockedNode)
            {
                node.x -= vX;
                node.y -= vY;
            }
    }


    weak_communicate(node)
    {
        let vX = node.x - this.x,
            vY = node.y - this.y,
            vLength = Math.sqrt(vX * vX + vY * vY),
            averStrength = (this.strength + node.strength) / 2;
        
            vX /= vLength;
            vX *= gPartOfSpeed * (vLength - averStrength);

            vY /= vLength;
            vY *= gPartOfSpeed * (vLength - averStrength);

            if(Math.sign(node.x - this.x) == Math.sign(vX) &&
                Math.sign(node.y - this.y) == Math.sign(vY))
            {
                return;
            }

            if(this != gLockedNode)
            {
                this.x += vX;
                this.y += vY;
            }

            if(node != gLockedNode)
            {
                node.x -= vX;
                node.y -= vY;
            }
    }

    draw()
    {
        fill(255);
        stroke(0);
        ellipse(this.x, this.y, gNodeRadius * 2);

        fill(0);
        textAlign(CENTER, CENTER);
        textSize(20);
        text(this.label, this.x, this.y);
    }

    isMouseInRange()
    {
        let length = Math.sqrt(Math.pow(this.x - mouseX, 2) + Math.pow(this.y - mouseY, 2));

        if (length <= gNodeRadius)
        {
            return true;
        }

        return false;
    }

    followMouse()
    {
        this.x = mouseX;
        this.y = mouseY;
    }
}

function setup()
{
    createCanvas(screenSize.w, screenSize.h);

    // create interface :D
    let interface = document.createElement('div');

    interface.id = 'interface';
    interface.innerHTML += 'Matrix shape: <div id="shape_counter"></div><br>';
    interface.innerHTML += '<button onClick="DecreaseShape();">Decrease</button>';
    interface.innerHTML += '<button onClick="IncreaseShape();">Increase</button>';
    interface.innerHTML += ' Strength: <input id="strength_slider" value="100" type="range" min="20" max ="1000" step="10""><br><br>';
    interface.innerHTML += '<table id="adjacency_table" style="text-align: center;"></table>'
    document.getElementsByTagName('body')[0].appendChild(interface);
    shape_counter.innerHTML = gMatrixShape;

    frameRate(60);

    RegenGraph();
}

function draw()
{
    stroke(0);
    background(255);

    stroke('purple');

    for (let i = 0; i < gMatrixShape; i++)
    {
        for (let j = i + 1; j < gMatrixShape; j++)
        {
            if (gMatrix[i][j] == 1)
            {
                gNodes[i].communicate(gNodes[j]);
            }
            else
            {
                gNodes[i].weak_communicate(gNodes[j]);
            }
        }
    }

    for (let i = 0; i < gMatrixShape; i++)
    {
        for (let j = i + 1; j < gMatrixShape; j++)
        {
            if (gMatrix[i][j] == 1)
            {
                line(gNodes[i].x, gNodes[i].y, gNodes[j].x, gNodes[j].y);
            }
        }
    }

    gNodes.forEach(n => { n.strength = parseInt(strength_slider.value); n.draw(); });

    stroke(0);
    noFill();
    rect(1, 0, screenSize.w - 1, screenSize.h);
}

function mousePressed()
{
    for(let i = 0; i < gNodes.length; i++)
    {
        if(gNodes[i].isMouseInRange())
        {
            gLockedNode = gNodes[i];
            break;
        }
    }
}

function mouseDragged()
{
    if(gLockedNode)
    {
        gLockedNode.followMouse();
    }
}

function mouseReleased()
{
    gLockedNode = null;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function DecreaseShape()
{
    if (gMatrixShape > 1)
    {
        gMatrixShape--;
        shape_counter.innerHTML = gMatrixShape;

        RegenGraph();
    }
}

function IncreaseShape()
{
    gMatrixShape++;
    shape_counter.innerHTML = gMatrixShape;

    RegenGraph();
}

function RegenGraph()
{
    gNodes = [];

    for(let i = 0; i < gMatrixShape; i++)
    {
        gNodes.push(new Node(getRandomInt(0, screenSize.w), getRandomInt(0, screenSize.h), (i).toString(), 200));
    }

    let strNewHtml = '',
        idCounter = 0;
    gMatrix = [];

    for (let i = -1; i < gMatrixShape; i++)
    {
        gMatrix.push([]);

        strNewHtml += '<tr><td>' + (i == -1 ? ' ' : i) + '</td>';

        for (let j = 0; j < gMatrixShape; j++)
        {
            if(i == -1)
            {
                strNewHtml += '<td>' + j + '</td>';
                continue;
            }

            gMatrix[i].push(1);
            
            if(i < j)
            {
                strNewHtml += '<td><input type="checkbox" i="' + i + '" j="' + j + '" onChange="TableChanged(this);" checked></td>';
            }
            else
            {
                strNewHtml += '<td><input type="checkbox" i="' + i + '" j="' + j + '" onChange="TableChanged(this);" disabled></td>';
            }
        }

        strNewHtml += '</tr>';
    }

    adjacency_table.innerHTML = strNewHtml;

    TableChanged();
}

function TableChanged(arc)
{
    if(arc == undefined) return;

    gMatrix[parseInt(arc.getAttribute('i'))][parseInt(arc.getAttribute('j'))] = arc.checked;
}