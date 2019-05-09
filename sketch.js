let screenSize = { w: 1280, h: 720 };
let gNodeRadius = 15;
let gPartOfSpeed = 0.1;
let gOriented = false;

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
    interface.innerHTML += ' Strength: <input id="strength_slider" value="100" type="range" min="20" max ="1000" step="10"><br><br>';
    interface.innerHTML += ' <input type="checkbox" onChange="gOriented = this.checked; RegenGraph();" unchecked> Oriented<br><br>';
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
            if (gMatrix[i][j] == 1 || gMatrix[j][i] == 1)
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
            if (gMatrix[i][j] == 1 || gMatrix[j][i] == 1)
            {
                if(gOriented)
                {
                    let vBack = { x: gNodes[i].x - gNodes[j].x, y: gNodes[i].y - gNodes[j].y },
                    vLen = Math.sqrt(vBack.x * vBack.x + vBack.y * vBack.y);

                    vBack.x /= vLen;
                    vBack.y /= vLen;

                    vBack.x *= gNodeRadius;
                    vBack.y *= gNodeRadius;

                    let fCurDelta = parseFloat(strength_slider.value) / 10;

                    if(gMatrix[i][j] == 1 && gMatrix[j][i] == 1)
                    {
                        let lastPoints = Line_bezier(gNodes[i].x - vBack.x, gNodes[i].y - vBack.y,
                                                    gNodes[j].x + vBack.x, gNodes[j].y + vBack.y, fCurDelta);
                        DrawPointer(lastPoints.x1, lastPoints.y1, lastPoints.x2, lastPoints.y2, 14, 10);
                    
                        vBack.x *= -1;
                        vBack.y *= -1;

                        lastPoints = Line_bezier(gNodes[j].x - vBack.x, gNodes[j].y - vBack.y,
                                                    gNodes[i].x + vBack.x, gNodes[i].y + vBack.y, fCurDelta);
                        DrawPointer(lastPoints.x1, lastPoints.y1, lastPoints.x2, lastPoints.y2, 14, 10);
                    }
                    else if(gMatrix[i][j] == 1 || gMatrix[j][i] == 1)
                    {
                        line(gNodes[i].x, gNodes[i].y, gNodes[j].x, gNodes[j].y);

                        if(gMatrix[i][j] == 1)
                        {
                            DrawPointer(gNodes[i].x, gNodes[i].y, gNodes[j].x + vBack.x, gNodes[j].y + vBack.y, 13, 9);
                        }
                        
                        if(gMatrix[j][i] == 1)
                        {
                            vBack.x *= -1;
                            vBack.y *= -1;
    
                            DrawPointer(gNodes[j].x, gNodes[j].y, gNodes[i].x + vBack.x, gNodes[i].y + vBack.y, 13, 9);
                        }
                    }
                }
                else
                {
                    line(gNodes[i].x, gNodes[i].y, gNodes[j].x, gNodes[j].y);
                }
            }
        }
    }

    let iCurStrength = parseInt(strength_slider.value);
    gNodes.forEach(n => { n.strength = iCurStrength; n.draw(); });

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

            
            if(i < j)
            {
                gMatrix[i].push(1);
                strNewHtml += '<td><input type="checkbox" i="' + i + '" j="' + j + '" onChange="TableChanged(this);" checked></td>';
            }
            else
            {
                gMatrix[i].push(0);
                strNewHtml += '<td><input type="checkbox" i="' + i + '" j="' + j + '" onChange="TableChanged(this);" ' + 
                    (gOriented ? 'unchecked' : 'disabled') + '></td>';
            }
        }

        strNewHtml += '</tr>';
    }

    adjacency_table.innerHTML = strNewHtml;
}

function TableChanged(arc)
{
    if(arc == undefined) return;

    gMatrix[parseInt(arc.getAttribute('i'))][parseInt(arc.getAttribute('j'))] = arc.checked;
}

function DrawPointer(x1, y1, x2, y2, length, angle)
{
    let vBack = { x: x1 - x2, y: y1 - y2 },
        vLen = Math.sqrt(vBack.x * vBack.x + vBack.y * vBack.y);

    vBack.x /= vLen;
    vBack.y /= vLen;

    vBack.x *= length;
    vBack.y *= length;

    let Rotated = Rotate(0, 0, vBack.x, vBack.y, angle);
    line(x2, y2, x2 + Rotated[0], y2 + Rotated[1]);

    Rotated = Rotate(0, 0, vBack.x, vBack.y, -angle);
    line(x2, y2, x2 + Rotated[0], y2 + Rotated[1]);
}

function Rotate(cx, cy, x, y, angle)
{
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
}

// returns two last points
function Line_bezier(x1, y1, x2, y2, delta)
{
    let vCenter = { x: (x2 + x1) / 2, y: (y1 + y2)  / 2 },
        vGuide = { x: -(y2 - y1), y: x2 - x1 },
        vGuideLen  = Math.sqrt(vGuide.x * vGuide.x + vGuide.y * vGuide.y);

    vGuide.x /= vGuideLen;
    vGuide.y /= vGuideLen;

    vGuide.x *= delta;
    vGuide.y *= delta;

    bezier(x1, y1, vCenter.x + vGuide.x, vCenter.y + vGuide.y, vCenter.x + vGuide.x, vCenter.y + vGuide.y, x2, y2);
    
    return {    "x1": bezierPoint(x1, vCenter.x + vGuide.x, vCenter.x + vGuide.x, x2, 0.9),
                "y1": bezierPoint(y1, vCenter.y + vGuide.y, vCenter.y + vGuide.y, y2, 0.9),
                "x2": bezierPoint(x1, vCenter.x + vGuide.x, vCenter.x + vGuide.x, x2, 1),
                "y2": bezierPoint(y1, vCenter.y + vGuide.y, vCenter.y + vGuide.y, y2, 1) };
}