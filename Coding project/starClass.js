class Star
{
    constructor(name, mass, radius)
    {
        //sætter navnet af stjernen ud fra det, som man har inputtet
        this.name = name;

        //sætter massen og radiusen af stjernen til de værdier, der er valgt
        this.mass = mass;
        this.radius = radius;

        //beregner overfladetemperaturen ved brug af funktionen "CalulateTemperature"
        this.surfaceTemp = CalculateTemperature(this.mass, this.radius);
        //beregner peakwavelength for lyset fra stjernen ud fra Wien's Law
        this.peakWavelength = (2.897771955 * pow(10, -3))/this.surfaceTemp;
        //mapper wavelength til hsv colour value
        this.lightColour = 270 - map(this.peakWavelength, 400 * pow(10, -9), 700 * pow(10, -9), 0, 270);

        //definerer en position med en x og y værdi
        this.pos = {
            x : 0,
            y : 0
        }

        //sætter selected og focused til false
        this.selected = false;
        this.focused = false;
    }

    draw()
    {
        if (this.focused)
        {
            controls.xPan = (width / 2) - this.pos.x * controls.zoomScale;
            controls.yPan = (height / 2) - this.pos.y * controls.zoomScale;
            this.selected = true;
            GUI.deSelectButton.isSelected = true;
        }

        push();
        noStroke();
        //giver stjernen en glow effekt for at vise, at den lyser. glow effekten har samme farve som stjernens peak-wavelength
        drawingContext.shadowBlur = 30;
        drawingContext.shadowColor = color(this.lightColour, 100, 100);
        
        //tegner stjernen
        fill(this.lightColour, 100, 100);
        circle(this.pos.x * controls.zoomScale, this.pos.y * controls.zoomScale, 2 * this.radius * controls.zoomScale);
        pop();

        //highlighter dette object, hvis 'selected' er sandt
        if (this.selected)
        {
            push();
            //highlighter cirkel
            stroke(0, 0, 100);
            strokeWeight(2);
            noFill();
            circle(this.pos.x * controls.zoomScale, this.pos.y * controls.zoomScale, 2 * this.radius * controls.zoomScale + 10);

            //linje og navn
            line(this.pos.x * controls.zoomScale + (this.radius * controls.zoomScale + 5) * cos(45), this.pos.y * controls.zoomScale + (this.radius * controls.zoomScale + 5) * cos(45), this.pos.x * controls.zoomScale + (this.radius * controls.zoomScale + 3) * cos(45) + 10, this.pos.y * controls.zoomScale + (this.radius * controls.zoomScale + 3) * cos(45) + 10);
            fill(0, 0, 100);
            circle(this.pos.x * controls.zoomScale + (this.radius * controls.zoomScale + 3) * cos(45) + 10, this.pos.y * controls.zoomScale + (this.radius * controls.zoomScale + 3) * cos(45) + 10, 3);
            textAlign(LEFT, CENTER);
            noStroke();
            textFont('courier new');
            text(this.name, this.pos.x * controls.zoomScale + (this.radius * controls.zoomScale + 3) * cos(45) + 15, this.pos.y * controls.zoomScale + (this.radius * controls.zoomScale + 3) * cos(45) + 10);
            pop();

        }
    }

    SideBarClicked(nr)
    {
        GUI.sideBarInfo.isShown = true;
        GUI.sideBarInfo.currentObject = nr;
        GUI.deSelectButton.isSelected = true;

        for (let i = 0; i < celObj.length; i++)
        {
            celObj[i].selected = false;
        }
        celObj[nr].selected = true;
    }

    EditStarValues(name, mass, radius)
    {
        //sætter navnet af stjernen ud fra det, som man har inputtet
        this.name = name;

        //sætter massen og radiusen af stjernen til de værdier, der er valgt
        this.mass = mass;
        this.radius = radius;

        //beregner overfladetemperaturen ved brug af funktionen "CalulateTemperature"
        this.surfaceTemp = CalculateTemperature(this.mass, this.radius);
        //beregner peakwavelength for lyset fra stjernen ud fra Wien's Law
        this.peakWavelength = (2.897771955 * pow(10, -3))/this.surfaceTemp;
        //mapper wavelength til hsv colour value
        this.lightColour = 270 - map(this.peakWavelength, 400 * pow(10, -9), 700 * pow(10, -9), 0, 270);
    }
}

//beregner overfladetemperaturen af en stjerne ud fra stjernens masse og radius
function CalculateTemperature(mass, radius)
{
    return (4.691 * pow(10, -19) * pow(mass, 0.875))/(sqrt(radius));
}