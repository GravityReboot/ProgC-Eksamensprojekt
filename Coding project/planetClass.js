class Planet
{
    constructor(name, mass, radius, eccentricity, semimajorAxis, argumentOfPeriapsis, trueAnomalyStart, colour)
    {
        //sætter alle planetens variabler til de værdier der blev inputtet da den blev lavet
        this.name = name;
        this.mass = mass;
        this.radius = radius;
        this.eccentricity = eccentricity;
        this.semimajorAxis = semimajorAxis;
        this.argumentOfPeriapsis = argumentOfPeriapsis;
        this.trueAnomalyStart = 180 - trueAnomalyStart;
        this.colour = HexToHSB(colour); //konverterer den givne hex-kode fra colorPicker til HSB, så den kan bruges
        this.radiusSOI = undefined;

        //sætter booleans 
        this.selected = false;
        this.focused = false;

        //definerer en position med en x og y værdi
        this.pos = {
            x : undefined,
            y : undefined
        }
        this.positionVector = createVector(undefined, undefined);
        this.rotatedPosition = createVector(undefined, undefined);

        //beregner hvor lang tid det tager for planeten at færdiggøre et orbit og andre vigtige elementer af kredsløbet
        this.period = sqrt((4 * sq(PI) * pow(this.semimajorAxis, 3)) / (gravitationalConstant * celObj[0].mass));
        this.semiminorAxis = this.semimajorAxis * sqrt(1 - sq(this.eccentricity));
        this.c = sqrt(sq(this.semimajorAxis) - sq(this.semiminorAxis));

        //beregner true anomaly, da koordinatsystemet er spejlet og definerer angleToBody som bruges igennem programmet
        this.trueAnomaly = 180 - trueAnomalyStart;
        this.angleToBody = undefined;
    }

    draw()
    {
        push();
        //sætter de værdier der skal bruges til at tegne planeten og dens orbit
        noFill();
        rotate(-this.argumentOfPeriapsis);
        strokeWeight(1);
        
        //beregner positionen (inputter semiminorAxis, da den beregnes i denne funktion) og planetens sphere of influence
        this.CalculatePosition();
        this.CalculateSOI();

        //tegner kredsløbet
        this.DrawOrbit();

        push();

        //tegner planetens sphere of influence
        push();
        this.colour.setAlpha(0.1);
        noStroke();
        fill(this.colour);
        circle(this.pos.x * controls.zoomScale, this.pos.y * controls.zoomScale, 2 * this.radiusSOI * controls.zoomScale);
        pop();

        pop();

        //tegner planeten ved dens position
        this.colour.setAlpha(1);
        fill(this.colour);
        circle(this.pos.x * controls.zoomScale, this.pos.y * controls.zoomScale, 2 * this.radius * controls.zoomScale);

        //highlighter dette object, hvis 'selected' er sandt
        if (this.selected)
        {
            push();
            rotate(this.argumentOfPeriapsis);

            //highlighter cirkel
            stroke(0, 0, 100);
            strokeWeight(2);
            noFill();
            circle(this.rotatedPosition.x * controls.zoomScale, this.rotatedPosition.y * controls.zoomScale, 2 * this.radius * controls.zoomScale + 10);

            //linje og navn
            line(this.rotatedPosition.x * controls.zoomScale + (this.radius * controls.zoomScale + 5) * cos(45), this.rotatedPosition.y * controls.zoomScale + (this.radius * controls.zoomScale + 5) * cos(45), this.rotatedPosition.x * controls.zoomScale + (this.radius * controls.zoomScale + 3) * cos(45) + 10, this.rotatedPosition.y * controls.zoomScale + (this.radius * controls.zoomScale + 3) * cos(45) + 10);
            fill(0, 0, 100);
            circle(this.rotatedPosition.x * controls.zoomScale + (this.radius * controls.zoomScale + 3) * cos(45) + 10, this.rotatedPosition.y * controls.zoomScale + (this.radius * controls.zoomScale + 3) * cos(45) + 10, 3);
            textAlign(LEFT, CENTER);
            noStroke();
            textFont('courier new');
            text(this.name, this.rotatedPosition.x * controls.zoomScale + (this.radius * controls.zoomScale + 3) * cos(45) + 15, this.rotatedPosition.y * controls.zoomScale + (this.radius * controls.zoomScale + 3) * cos(45) + 10);
            pop();

        }

        //får brugeren til at følge planeten, hvis den er sat som fokus
        if (this.focused)
        {
            controls.xPan = (width / 2) - this.rotatedPosition.x * controls.zoomScale;
            controls.yPan = (height / 2) - this.rotatedPosition.y * controls.zoomScale;
            this.selected = true;
            GUI.deSelectButton.isSelected = true;
        }

        pop();
    }

    CalculatePosition()
    {
        //beregner hvor mange grader planeten bevæger sig omkring fokus punktet (solen) hvert sekundt
        let trueAnomalyIncrement = 360 / this.period;

        //beregner hvor mange grader omkring fokus punktet planeten er som funktion af tiden
        this.trueAnomaly = trueAnomalyIncrement * time + this.trueAnomalyStart;

        //beregner "eccentric anomaly," da dette skal bruges til at bestemme x og y koordinaterne af planeten
        //eccentric anomaly kan forklares som den vinkel der går fra centrum af kredsløbet og ud til planeten, hvis ellipsen var en perfekt cirkel, i modsætning til fra fokus punktet (solen)
        let eccentricAnomaly = 2 * atan(sqrt((1 - this.eccentricity)/(1 + this.eccentricity)) * tan(this.trueAnomaly/2));

        //beregner x og y positionen ud fra eccentric anomaly og de forskellige størrelser af ellipsen
        this.pos.x = -cos(eccentricAnomaly) * this.semimajorAxis - this.c;
        this.pos.y = sin(eccentricAnomaly) * this.semimajorAxis * this.semiminorAxis/this.semimajorAxis; //her bliver y koordinaten langs ellipsen som cirkel omdannet til y koordinaten for den rigtige position

        //bestemmer positionen af det roterede punkt
        this.rotatedPosition.x = this.pos.x * cos(-this.argumentOfPeriapsis) - this.pos.y * sin(-this.argumentOfPeriapsis);
        this.rotatedPosition.y = this.pos.y * cos(-this.argumentOfPeriapsis) + this.pos.x * sin(-this.argumentOfPeriapsis);
    }

    DrawOrbit() //tegner kredsløbet med en fade effekt
    {
        push();
        //bruger angleToBody til at beregne vinklen fra centrum af kredsløbet ud til planeten
        this.positionVector = createVector(this.pos.x * controls.zoomScale + (this.c * controls.zoomScale), this.pos.y * controls.zoomScale);
        let zeroVector = createVector(width/2, 0);
        this.angleToBody = -this.positionVector.angleBetween(zeroVector);

        if (this.selected) //tegner kredsløbet med en bestemt styrke, hvis planeten er selected
        {
            push();
            this.colour.setAlpha(0.25);
            stroke(this.colour);
            let angle = 360; //bestemmer over hvor mange grader fade effekten laves (her er det altså hele ellipsen)
            for (let i = 0; i < angle; i++)
            {
                this.colour.setAlpha(1 - (0.75 * (i/angle)));
                stroke(this.colour)
                arc(-this.c * controls.zoomScale, 0, this.semimajorAxis * 2 * controls.zoomScale, 2 * this.semiminorAxis * controls.zoomScale, this.angleToBody + i, this.angleToBody + i + 1);
            }
            pop();
        } else //tegner kredsløbet med en svagere styrke, hvis den ikke er selected
        {
            this.colour.setAlpha(0.15);
            stroke(this.colour);
            let angle = 360; //bestemmer over hvor mange grader fade effekten laves (her er det altså hele ellipsen)
            for (let i = 0; i < angle; i++)
            {
                this.colour.setAlpha(0.40 - (0.25 * (i/angle)));
                stroke(this.colour)
                arc(-this.c * controls.zoomScale, 0, this.semimajorAxis * 2 * controls.zoomScale, 2 * this.semiminorAxis * controls.zoomScale, this.angleToBody + i, this.angleToBody + i + 1);
            }
        }
        pop();
    }

    //beregner radius til planetens 'sphere of influence'
    CalculateSOI()
    {
        let orbitRadius = dist(this.pos.x, this.pos.y, 0, 0);
        this.radiusSOI = orbitRadius * pow((this.mass / celObj[0].mass), 2/5);
    }

    SideBarClicked(nr)
    {
        GUI.sideBarInfo.isShown = true;
        GUI.sideBarInfo.currentObject = nr;
        GUI.deSelectButton.isSelected = true;

        for (let i = 0; i < celObj.length; i++)
        {
            if (i != nr)
            {
                celObj[i].selected = false;
            } else
            {
                celObj[i].selected = true;
            }
        }
    }

    EditPlanetValues(name, mass, radius, eccentricity, semimajorAxis, argumentOfPeriapsis, trueAnomalyStart, colour)
    {
        //sætter alle planetens variabler til de værdier der blev inputtet da den blev lavet
        this.name = name;
        this.mass = mass;
        this.radius = radius;
        this.eccentricity = eccentricity;
        this.semimajorAxis = semimajorAxis;
        this.argumentOfPeriapsis = argumentOfPeriapsis;
        this.trueAnomalyStart = 180 - trueAnomalyStart;
        this.colour = HexToHSB(colour); //konverterer den givne hex-kode fra colorPicker til HSB, så den kan bruges
        this.radiusSOI = undefined;

        //definerer en position med en x og y værdi
        this.pos = {
            x : undefined,
            y : undefined
        }
        this.positionVector = createVector(undefined, undefined);
        this.rotatedPosition = createVector(undefined, undefined);

        //beregner hvor lang tid det tager for planeten at færdiggøre et orbit og andre vigtige elementer af kredsløbet
        this.period = sqrt((4 * sq(PI) * pow(this.semimajorAxis, 3)) / (gravitationalConstant * celObj[0].mass));
        this.semiminorAxis = this.semimajorAxis * sqrt(1 - sq(this.eccentricity));
        this.c = sqrt(sq(this.semimajorAxis) - sq(this.semiminorAxis));

        //beregner alternate true anomaly (vinkel fra kredsløbets tomme fokus) til planeten ud fra den givne true anomaly,
        //da planetens position beregnes på baggrund af vinklen til det tomme fokus
        this.trueAnomaly = 180 - trueAnomalyStart;
        this.angleToBody = undefined;
    }
}

//Parser hex-kode til RGB og derefter konverterer RGB til HSB. RGB til HSB Funktionen er hentet fra stackoverflow: https://stackoverflow.com/questions/8022885/rgb-to-hsv-color-in-javascript
function HexToHSB(hex) 
{
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    let rgb = {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    };

    let rabs, gabs, babs, rr, gg, bb, h, s, b, diff, diffc, percentRoundFn;
    rabs = rgb.r / 255;
    gabs = rgb.g / 255;
    babs = rgb.b / 255;
    b = Math.max(rabs, gabs, babs),
    diff = b - Math.min(rabs, gabs, babs);
    diffc = c => (b - c) / 6 / diff + 1 / 2;
    percentRoundFn = num => Math.round(num * 100) / 100;
    if (diff == 0) 
    {
        h = s = 0;
    } else 
    {
        s = diff / b;
        rr = diffc(rabs);
        gg = diffc(gabs);
        bb = diffc(babs);

        if (rabs === b) 
        {
            h = bb - gg;
        } else if (gabs === b) 
        {
            h = (1 / 3) + rr - bb;
        } else if (babs === b) 
        {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) 
        {
            h += 1;
        } else if (h > 1) 
        {
            h -= 1;
        }
    }

    return color(Math.round(h * 360), percentRoundFn(s * 100), percentRoundFn(b * 100));
}