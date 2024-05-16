function setup() 
{
  createCanvas(windowWidth, windowHeight);

  //sætter basic parameters for hele programmet
  angleMode(DEGREES);
  colorMode(HSB);
  noStroke();  

  //sætter skærmen til at vise midten af solsystemet
  controls.xPan = width/2;
  controls.yPan = height/2;

  //laver slider til at justere hvor hurigt tiden går og checkbox til at tiden løber
  timeDilation = createSlider(0, 10, 5, pow(10, -9));
  timeDilation.size(GUI.mainMenu.width - 15);
  timeStopped = createCheckbox('', true);

  //initiater knapper og inputs til 'star' vinduet
  GUI.star.name = createInput('');
  GUI.star.mass = createInput('');
  GUI.star.radius = createInput('');
  
  //initiater knapper og inputs til 'newPlanet'/'editPlanet' vinduet
  GUI.planet.name = createInput('');
  GUI.planet.mass = createInput('');
  GUI.planet.radius = createInput('');
  
  GUI.planet.eccentricity = createInput('');
  GUI.planet.semimajorAxis = createInput('');
  GUI.planet.argumentOfPeriapsis = createInput('');
  GUI.planet.trueAnomalyStart = createInput('');

  GUI.planet.colour = createColorPicker();

  //tjekker om der existerer en stjerne, eller om man skal lave en
  if (celObj.length == 0)
  {
    GUI.star.isCreatingStar = true;
    GUI.star.starExists = false;
  } else
  {
    GUI.star.isCreatingStar = false;
    GUI.star.starExists = true;
  }
}

function draw() 
{
  //sætter canvas til størrelsen af vinduet og laver en baggrund
  resizeCanvas(windowWidth, windowHeight);
  background(255, 10, 10);

  //incrementer variablen 'time' med et sekund hvert sekund, multipliceret med 10 opløftet i timedilation slideren, hvis tiden ikke er stoppet
  if (!timeStopped.checked())
  {
    time += 1/60 * pow(10, timeDilation.value());
  }

  push();
  //offsetter canvas så man kan bevæge sig rundt
  translate(controls.xPan, controls.yPan);

  //tegner alle stjerner og planeter i arraylisten celObj
  for (let i = 0; i < celObj.length; i++)
  {
    celObj[i].draw();
  }
  pop();

  //tegner alt GUI
  Gui();
}

//highlighter det celestial object man har klikket på (hvis man klikker på et)
function mouseClicked()
{
  if (mouseX > width - GUI.sideBar.width) //tjekker om man klikker på sidebaren, og hvilken planet hvis man gør det.
  {
    for (i = 0; i < celObj.length; i++)
    {
      if (!(GUI.star.isCreatingStar || GUI.star.isEditingStar || GUI.planet.isCreatingNewPlanet || GUI.planet.isEditingPlanet) && (mouseY > (i * GUI.sideBar.height + GUI.sideBar.scrollHeight)) && (mouseY < ((i + 1) * GUI.sideBar.height + GUI.sideBar.scrollHeight)))
      {
        celObj[i].SideBarClicked(i);
      }
    }
  } else if (GUI.sideBarInfo.isShown && (mouseX < (width - GUI.sideBar.width) && mouseX > (width - GUI.sideBar.width - GUI.sideBarInfo.width) && mouseY < GUI.defaultCloseButtonHeight)) //tjekker om man klikker på luk knappen til info vinduet
  {
    GUI.sideBarInfo.isShown = false;
    GUI.sideBarInfo.currentObject = NaN;
  } else if (GUI.sideBarInfo.isShown && (mouseX < (width - GUI.sideBar.width) && mouseX > (width - GUI.sideBar.width - GUI.sideBarInfo.width) && mouseY < (height - GUI.sideBarInfo.editButtonHeight) && mouseY > (height - GUI.sideBarInfo.editButtonHeight - GUI.sideBarInfo.focusButtonHeight))) //tjekker om man klikker på fokus knappen
  {
    for (i = 0; i < celObj.length; i++)
    {
      celObj[i].selected = false; //fixer at en anden planet vil være selected hvis man klikker focusknappen
      celObj[i].focused = false;
    }
    celObj[GUI.sideBarInfo.currentObject].focused = true;
    GUI.unFocusButton.isFocusing = true;
  } else if (GUI.sideBarInfo.currentObject != 0 && GUI.sideBarInfo.isShown && (mouseX < (width - GUI.sideBar.width) && mouseX > (width - GUI.sideBar.width - GUI.sideBarInfo.width) && mouseY < (height - GUI.sideBarInfo.editButtonHeight - GUI.sideBarInfo.focusButtonHeight) && mouseY > (height - GUI.sideBarInfo.editButtonHeight - GUI.sideBarInfo.focusButtonHeight - GUI.sideBarInfo.deleteButtonHeight))) 
  {
    DeletePlanet(prompt("Are you sure you want to delete this planet? It will be lost forever (that's a long time). Write 'confirm' to confirm this decision"));
  } else if (GUI.sideBarInfo.isShown && (mouseX < (width - GUI.sideBar.width) && mouseX > (width - GUI.sideBar.width - GUI.sideBarInfo.width) && mouseY < height && mouseY > (height - GUI.sideBarInfo.editButtonHeight)))
  {
    //redigerer stjerne hvis stjernen er valgt, ellers redigerer man planeten der er valgt
    if (GUI.sideBarInfo.currentObject == 0)
    {
      EditStar(0);
    } else
    {
      EditPlanet(0);
    }
  } else if (GUI.unFocusButton.isFocusing && (mouseX < ((width / 2) + (GUI.unFocusButton.width / 2)) && mouseX > ((width / 2) - (GUI.unFocusButton.width / 2)) && mouseY < (GUI.unFocusButton.y + (GUI.unFocusButton.height)) && mouseY > GUI.unFocusButton.y))
  {
    for (i = 0; i < celObj.length; i++)
    {
      celObj[i].focused = false;
    }
    GUI.unFocusButton.isFocusing = false; 
  } else if (GUI.deSelectButton.isSelected && (mouseX < ((width / 2) + (GUI.deSelectButton.width / 2)) && mouseX > ((width / 2) - (GUI.deSelectButton.width / 2)) && mouseY < (height - 35 + GUI.deSelectButton.height) && mouseY > (height - 35)))
  {
    for (i = 0; i < celObj.length; i++)
    {
      celObj[i].selected = false;
    }
    GUI.deSelectButton.isSelected = false;
  } else if (mouseX < GUI.mainMenu.width && mouseY < (GUI.mainMenu.timeControls.height + GUI.mainMenu.newPlanet.height) && mouseY > GUI.mainMenu.timeControls.height)
  {
    //alerter brugeren hvis man prøver at lave en ny planet før der er en stjerne
    if (!GUI.star.starExists)
    {
      alert('You must create a star or load a star system before creating new planets.') 
    } else
    {
      NewPlanet(0);
    }
  } else if (GUI.planet.isCreatingNewPlanet && !GUI.star.isCreatingStar && (mouseX < ((width / 2) + (GUI.planet.createPlanetWindow.windowWidth / 2)) && mouseX > ((width / 2) - (GUI.planet.createPlanetWindow.windowWidth / 2)) && mouseY < ((height / 2) - (GUI.planet.createPlanetWindow.windowHeight / 2) + GUI.defaultCloseButtonHeight) && mouseY > ((height / 2) - (GUI.planet.createPlanetWindow.windowHeight / 2))))
  {
    NewPlanet(1); //lukker nyplanet vinduet, hvis man klikker på luk knappen
  } else if (GUI.planet.isCreatingNewPlanet && !GUI.star.isCreatingStar && (mouseX < ((width / 2) + (GUI.planet.createPlanetWindow.windowWidth / 2)) && mouseX > ((width / 2) - (GUI.planet.createPlanetWindow.windowWidth / 2)) && mouseY < ((height / 2) + (GUI.planet.createPlanetWindow.windowHeight / 2)) && mouseY > ((height / 2) + (GUI.planet.createPlanetWindow.windowHeight / 2) - GUI.defaultCloseButtonHeight)))
  {
    NewPlanet(2); //laver en ny planet, hvis man klikker på 'lav planet' knappen
  } else if ((mouseX < GUI.mainMenu.width) && (mouseY < GUI.mainMenu.timeControls.height + GUI.mainMenu.newPlanet.height + GUI.mainMenu.loadSystem.height) && (mouseY > GUI.mainMenu.timeControls.height + GUI.mainMenu.newPlanet.height))
  {
    //indlæs system funktionen
    LoadSystem(prompt('Write the name of the system, that you want to load. If you want to load the solar system write "Solar System".'));
    GUI.star.isCreatingStar = false;
    GUI.star.starExists = true;
  } else if ((mouseX < GUI.mainMenu.width) && (mouseY < GUI.mainMenu.timeControls.height + GUI.mainMenu.newPlanet.height + GUI.mainMenu.loadSystem.height + GUI.mainMenu.saveSystem.height) && (mouseY > GUI.mainMenu.timeControls.height + GUI.mainMenu.newPlanet.height + GUI.mainMenu.loadSystem.height))
  {
    //gem system funktionen
    SaveSystem();
  } else if (GUI.star.isCreatingStar && (mouseX < ((width / 2) + (GUI.star.createStarWindow.windowWidth / 2)) && mouseX > ((width / 2) - (GUI.star.createStarWindow.windowWidth / 2)) && mouseY < ((height / 2) + (GUI.star.createStarWindow.windowHeight / 2)) && mouseY > ((height / 2) + (GUI.star.createStarWindow.windowHeight / 2) - GUI.defaultCloseButtonHeight)))
  {
    NewStar(1);
  } else if (GUI.planet.isEditingPlanet && (mouseX < ((width / 2) + (GUI.planet.editPlanetWindow.windowWidth / 2)) && mouseX > ((width / 2) - (GUI.planet.editPlanetWindow.windowWidth / 2)) && mouseY < ((height / 2) - (GUI.planet.editPlanetWindow.windowHeight / 2) + GUI.defaultCloseButtonHeight) && mouseY > ((height / 2) - (GUI.planet.editPlanetWindow.windowHeight / 2))))
  {
    //lukker rediger planet vinduet, hvis man klikker på luk knappen
    EditPlanet(1);
  } else if (GUI.planet.isEditingPlanet && (mouseX < ((width / 2) + (GUI.planet.editPlanetWindow.windowWidth / 2)) && mouseX > ((width / 2) - (GUI.planet.editPlanetWindow.windowWidth / 2)) && mouseY < ((height / 2) + (GUI.planet.editPlanetWindow.windowHeight / 2)) && mouseY > ((height / 2) + (GUI.planet.editPlanetWindow.windowHeight / 2) - GUI.defaultCloseButtonHeight)))
  {
    //committer redigeringer af planeten
    EditPlanet(2);
  } else if (GUI.star.isEditingStar && (mouseX < ((width / 2) - (GUI.star.editStarWindow.windowWidth / 2) + GUI.star.editStarWindow.windowWidth) && mouseX > ((width / 2) - (GUI.star.editStarWindow.windowWidth / 2)) && mouseY < ((height / 2) - (GUI.star.editStarWindow.windowHeight / 2) + GUI.defaultCloseButtonHeight) && mouseY > ((height / 2) - (GUI.star.editStarWindow.windowHeight / 2))))
  {
    EditStar(1);
  } else if (GUI.star.isEditingStar && (mouseX < ((width / 2) + (GUI.star.editStarWindow.windowWidth / 2)) && mouseX > ((width / 2) - (GUI.star.editStarWindow.windowWidth / 2)) && mouseY < ((height / 2) + (GUI.star.editStarWindow.windowHeight / 2)) && mouseY > ((height / 2) + (GUI.star.editStarWindow.windowHeight / 2) - GUI.defaultCloseButtonHeight)))
  {
    EditStar(2);
  }
}

//bevæg rundt på kortet med mus
function mouseDragged()
{
  //tjekker om musen KUN er på solsystemskortet
  if (((mouseX < width - GUI.sideBar.width && !GUI.sideBarInfo.isShown) || (mouseX < width - GUI.sideBar.width - GUI.sideBarInfo.width && GUI.sideBarInfo.isShown)) && (mouseX > GUI.mainMenu.width) && (!GUI.planet.isCreatingNewPlanet) && (!GUI.planet.isEditingPlanet) && (!GUI.star.isCreatingStar) && (!GUI.star.isEditingStar) /* && mouse isn't somewhere that isn't the map */)
  {
    //ændre 'x-' og 'yPan' med ændringen i musens position
    if (!GUI.unFocusButton.isFocusing)
    {
      controls.xPan += mouseX - pmouseX;
      controls.yPan += mouseY - pmouseY;
    }
  }
}

//zoomer ind og ud når man scroller med mousewheel/touchpad
function mouseWheel(event)
{
  if (((mouseX < width - GUI.sideBar.width && !GUI.sideBarInfo.isShown) || (mouseX < width - GUI.sideBar.width - GUI.sideBarInfo.width && GUI.sideBarInfo.isShown)) && (mouseX > GUI.mainMenu.width) && !(GUI.planet.isCreatingNewPlanet || GUI.planet.isEditingPlanet || GUI.star.isCreatingStar || GUI.star.isEditingStar))
  {
    //ændrer zoomScale baseret på hvor meget man scroller og ændrer xPan;yPan så man zoomer ind på musen
    if (event.delta < 0)
    {
      controls.zoomScale *= 1.02;
      controls.xPan -= (mouseX - controls.xPan) * 1.02 - (mouseX - controls.xPan);
      controls.yPan -= (mouseY - controls.yPan) * 1.02 - (mouseY - controls.yPan); 
    } else
    {
      controls.zoomScale /= 1.02;
      controls.xPan -= (mouseX - controls.xPan) / 1.02 - (mouseX - controls.xPan);
      controls.yPan -= (mouseY - controls.yPan) / 1.02 - (mouseY - controls.yPan);
    }
  } else if (mouseX > width - GUI.sideBar.width)
  {
    GUI.sideBar.scrollHeight += (-event.delta / 3);
  }
}

function Gui()
{
  //placerer alle elementer (knapper, sliders, checkboxes og inputfields) korrekt
  timeDilation.position(GUI.mainMenu.timeControls.x, GUI.mainMenu.timeControls.y + 20);
  timeStopped.position(GUI.mainMenu.timeControls.x, GUI.mainMenu.timeControls.y);

  //viser de elementer der skal vises, og gemmer dem, hvis de ikke skal
  if (GUI.star.isCreatingStar || GUI.star.isEditingStar)
  {
    GUI.star.name.show();
    GUI.star.mass.show();
    GUI.star.radius.show();
  } else
  {
    GUI.star.name.hide();
    GUI.star.mass.hide();
    GUI.star.radius.hide();
  }
  
  if (GUI.planet.isCreatingNewPlanet || GUI.planet.isEditingPlanet)
  {
    GUI.planet.name.show();
    GUI.planet.mass.show();
    GUI.planet.radius.show();
    GUI.planet.eccentricity.show();
    GUI.planet.semimajorAxis.show();
    GUI.planet.argumentOfPeriapsis.show();
    GUI.planet.trueAnomalyStart.show();
    GUI.planet.colour.show();
  } else
  {
    GUI.planet.name.hide();
    GUI.planet.mass.hide();
    GUI.planet.radius.hide();
    GUI.planet.eccentricity.hide();
    GUI.planet.semimajorAxis.hide();
    GUI.planet.argumentOfPeriapsis.hide();
    GUI.planet.trueAnomalyStart.hide();
    GUI.planet.colour.hide();
  }

  // --- unfocus knap --- //
  push();

  rectMode(CENTER);
  strokeWeight(3);
  stroke(255, 10, 20);

  if (GUI.unFocusButton.isFocusing)
  {
    if (mouseX < ((width / 2) + (GUI.unFocusButton.width / 2)) && mouseX > ((width / 2) - (GUI.unFocusButton.width / 2)) && mouseY < (GUI.unFocusButton.y + (GUI.unFocusButton.height)) && mouseY > GUI.unFocusButton.y) //skifter farve hvis musen er over
    {
      fill(255, 10, 8);
    } else
    {
      fill(255, 10, 12);
    }
    rect(width / 2, GUI.unFocusButton.height / 2 + GUI.unFocusButton.y, GUI.unFocusButton.width, GUI.unFocusButton.height);
    push();

    noStroke();
    fill('white');
    textFont('courier new', GUI.unFocusButton.height / 2);
    textAlign(CENTER, CENTER);

    text('Unfocus', width / 2, GUI.unFocusButton.y + GUI.unFocusButton.height / 2);

    pop();
  }

  pop();

  // --- deselect knap --- //
  push();

  rectMode(CENTER);
  strokeWeight(3);
  stroke(255, 10, 20);

  if (GUI.deSelectButton.isSelected)
  {
    if (mouseX < ((width / 2) + (GUI.deSelectButton.width / 2)) && mouseX > ((width / 2) - (GUI.deSelectButton.width / 2)) && mouseY < (height - 35 + GUI.deSelectButton.height) && mouseY > (height - 35)) //skifter farve hvis musen er over
    {
      fill(255, 10, 8);
    } else
    {
      fill(255, 10, 12);
    }
    rect(width / 2, height - 35 + GUI.deSelectButton.height / 2, GUI.deSelectButton.width, GUI.deSelectButton.height);
    push();

    noStroke();
    fill('white');
    textFont('courier new', GUI.deSelectButton.height / 2);
    textAlign(CENTER, CENTER);

    text('Deselect', width / 2, height - 35 + GUI.deSelectButton.height / 2);

    pop();
  }

  pop();
  
  // --- menuer til navigation --- //
  push();

  //sætter preferencer
  rectMode(CORNER);
  strokeWeight(3);
  stroke(255, 10, 20);
  textFont('courier new', 15);
  textAlign(LEFT, CENTER);

  //tegner 'sideBar'
  fill(255, 10, 12);
  rect(width - GUI.sideBar.width, 0, GUI.sideBar.width, height);

  //scroll logik. Man kan ikke scrolle videre, hvis man er i bunden, og man kan ikke scrolle op, hvis man er i toppen
  if (GUI.sideBar.scrollHeight > 0)
  {
    GUI.sideBar.scrollHeight = 0;
  } else if (-GUI.sideBar.scrollHeight > (GUI.sideBar.height * celObj.length - height))
  {
    if (GUI.sideBar.height * celObj.length < height)
    {
      GUI.sideBar.scrollHeight = 0;
    } else
    {
      GUI.sideBar.scrollHeight = -(GUI.sideBar.height * celObj.length - height);
    }
  }

  //tegner en box for hver ting i 'celObj'
  for (i = 0; i < celObj.length; i++)
  {
    //skifter farven af sidebar felterne ud fra om musen er over dem eller om det celestial object er det, som er valgt
    if ((mouseX > width - GUI.sideBar.width) && (mouseY > (i * GUI.sideBar.height + GUI.sideBar.scrollHeight)) && (mouseY < ((i + 1) * GUI.sideBar.height + GUI.sideBar.scrollHeight)) || GUI.sideBarInfo.currentObject == i)
    {
      fill(255, 10, 20);
    } else
    {
      fill(255, 10, 12);
    }
    
    rect(width - GUI.sideBar.width, i * GUI.sideBar.height + GUI.sideBar.scrollHeight, GUI.sideBar.width, GUI.sideBar.height);
    //tegner planeten med dens farve
    if (i > 0)
    {
      push();
      noStroke();
      fill(celObj[i].colour);
      circle(width - 30, i * GUI.sideBar.height + GUI.sideBar.scrollHeight + (GUI.sideBar.height / 2), 20)
      pop();
    }
    push();
    noStroke();
    fill('white');
    text('Name: ' + celObj[i].name, width - GUI.sideBar.width + 5, i * GUI.sideBar.height + (GUI.sideBar.height / 2 - (GUI.sideBar.height / 5)) + GUI.sideBar.scrollHeight);
    text('Type: ' + celObj[i].constructor.name, width - GUI.sideBar.width + 5, i * GUI.sideBar.height + (GUI.sideBar.height / 2 + (GUI.sideBar.height / 5)) + GUI.sideBar.scrollHeight);  
    pop();
  }

  //tegner extra info sidebar hvis "isShown" er sandt
  if (GUI.sideBarInfo.isShown)
  {
    //baggrund til info sidebar
    fill(255, 10, 20);
    rect(width - GUI.sideBar.width - GUI.sideBarInfo.width, 0, GUI.sideBarInfo.width, height);

    // --- info til info sidebar --- //
    push();
    let x = width - GUI.sideBar.width - GUI.sideBarInfo.width + 5;
    noStroke();
    //navnet på det celestial object, som man har valgt
    fill('white');
    textSize(30);
    text('Name: ' + celObj[GUI.sideBarInfo.currentObject].name, x, GUI.defaultCloseButtonHeight + 20);

    //andet information
    textSize(16);
    if (celObj[GUI.sideBarInfo.currentObject].constructor.name == 'Planet')
    {
      //Information om planeter
      text('Mass: ' + round(celObj[GUI.sideBarInfo.currentObject].mass / (5.9722 * pow(10, 24)), 5) + ' Earth masses', x, GUI.defaultCloseButtonHeight + 20 + 30);
      text('Radius: ' + round(celObj[GUI.sideBarInfo.currentObject].radius / (6371.0088 * 10**3), 5) + ' Earth radii', x, GUI.defaultCloseButtonHeight + 20 + 50);
      text('Eccentricity: ' + (celObj[GUI.sideBarInfo.currentObject].eccentricity), x, GUI.defaultCloseButtonHeight + 20 + 70);
      text('Semi-major Axis: ' + round(celObj[GUI.sideBarInfo.currentObject].semimajorAxis / (1.496 * 10**11), 5) + ' AU', x, GUI.defaultCloseButtonHeight + 20 + 90);
      text('Argument of Periapsis: ' + (celObj[GUI.sideBarInfo.currentObject].argumentOfPeriapsis) + ' degrees', x, GUI.defaultCloseButtonHeight + 20 + 110);
      text('True Anomaly: ' + round(-celObj[GUI.sideBarInfo.currentObject].angleToBody, 2) + ' degrees', x, GUI.defaultCloseButtonHeight + 20 + 130);

      let apoapsis = (celObj[GUI.sideBarInfo.currentObject].semimajorAxis * (1 + celObj[GUI.sideBarInfo.currentObject].eccentricity)) / (1.496 * 10**11);
      let periapsis = (celObj[GUI.sideBarInfo.currentObject].semimajorAxis * (1 - celObj[GUI.sideBarInfo.currentObject].eccentricity)) / (1.496 * 10**11);
      let orbitalPeriod = celObj[GUI.sideBarInfo.currentObject].period;
      let averageSpeed = ((2 * PI * celObj[GUI.sideBarInfo.currentObject].semimajorAxis) / orbitalPeriod) * (1 - (1/4) * pow(celObj[GUI.sideBarInfo.currentObject].eccentricity, 2) - (3/64) * pow(celObj[GUI.sideBarInfo.currentObject].eccentricity, 4) - (5/256) * pow(celObj[GUI.sideBarInfo.currentObject].eccentricity, 6) - (175/16384) * pow(celObj[GUI.sideBarInfo.currentObject].eccentricity, 8));

      text('Apoapsis: ' + round(apoapsis, 5) + ' AU', x, GUI.defaultCloseButtonHeight + 200);
      text('Periapsis: ' + round(periapsis, 5) + ' AU', x, GUI.defaultCloseButtonHeight + 220);
      text('Average Orbital Speed: ' + round(averageSpeed / 1000, 5) + ' km/s', x, GUI.defaultCloseButtonHeight + 240);
      text('SOI radius: ' + round(celObj[GUI.sideBarInfo.currentObject].radiusSOI / (1.496 * 10**11), 5) + ' AU', x, GUI.defaultCloseButtonHeight + 260);

      let years = (((orbitalPeriod / 60) / 60) / 24) / 365.2422;
      let days = (years - floor(years)) * 365.2422;
      let hours = (days - floor(days)) * 24;
      let minutes = (hours - floor(hours)) * 60;
      let seconds = (minutes - floor(minutes)) * 60;

      text('Orbital Period:', x, GUI.defaultCloseButtonHeight + 310);
      text('Years: ' + floor(years), x, GUI.defaultCloseButtonHeight + 330);
      text('Days: ' + floor(days), x, GUI.defaultCloseButtonHeight + 350);
      text('Hours: ' + floor(hours), x, GUI.defaultCloseButtonHeight + 370);
      text('Minutes: ' + floor(minutes), x, GUI.defaultCloseButtonHeight + 390);
      text('Seconds: ' + floor(seconds), x, GUI.defaultCloseButtonHeight + 410);
    } else //viser de informationer der er relevante for stjernen
    {
      text('Mass: ' + round(celObj[GUI.sideBarInfo.currentObject].mass / (1.98847 * 10**30), 5) + ' Solar masses', x, GUI.defaultCloseButtonHeight + 20 + 30);
      text('Radius: ' + round(celObj[GUI.sideBarInfo.currentObject].radius / (695700000), 5) + ' Solar radii', x, GUI.defaultCloseButtonHeight + 20 + 50);

      let surfaceTemp = (4.691 * pow(10, -19) * pow(celObj[0].mass,0.875)) / (sqrt(celObj[0].radius));
      let peakWavelength = (2.897771955 * pow(10, -3)) / surfaceTemp;

      text('Surface Temperature: ' + round(surfaceTemp, 2) + ' K', x, GUI.defaultCloseButtonHeight + 20 + 100);
      text('Peak Wavelength: ' + round(peakWavelength * 10**9, 2) + ' nm', x, GUI.defaultCloseButtonHeight + 20 + 120);
    }
    
    pop();

    //delete knap, som kun tegnes for planeter
    if (celObj[GUI.sideBarInfo.currentObject].constructor.name == 'Planet')
    {
      if ((mouseX < (width - GUI.sideBar.width) && mouseX > (width - GUI.sideBar.width - GUI.sideBarInfo.width) && mouseY < (height - GUI.sideBarInfo.editButtonHeight - GUI.sideBarInfo.focusButtonHeight) && mouseY > (height - GUI.sideBarInfo.editButtonHeight - GUI.sideBarInfo.focusButtonHeight - GUI.sideBarInfo.deleteButtonHeight))) //skifter farven af knappen, hvis man holder musen over
      {
        fill(255, 10, 8);
      } else
      {
        fill(255, 10, 12);
      }
      rect(width - GUI.sideBar.width - GUI.sideBarInfo.width, height - GUI.sideBarInfo.editButtonHeight - GUI.sideBarInfo.focusButtonHeight - GUI.sideBarInfo.deleteButtonHeight, GUI.sideBarInfo.width, GUI.sideBarInfo.deleteButtonHeight);
      push();
      noStroke();
      fill('white');
      textSize(GUI.sideBarInfo.deleteButtonHeight / 2);
      textAlign(CENTER, CENTER);
      text('Delete ' + celObj[GUI.sideBarInfo.currentObject].constructor.name, width - GUI.sideBar.width - (GUI.sideBarInfo.width / 2), height - GUI.sideBarInfo.editButtonHeight - GUI.sideBarInfo.focusButtonHeight - GUI.sideBarInfo.deleteButtonHeight / 2);
      pop();
    }

    //fokus knap
    if ((mouseX < (width - GUI.sideBar.width) && mouseX > (width - GUI.sideBar.width - GUI.sideBarInfo.width) && mouseY < (height - GUI.sideBarInfo.editButtonHeight) && mouseY > (height - GUI.sideBarInfo.editButtonHeight - GUI.sideBarInfo.focusButtonHeight))) //skifter farven af knappen, hvis man holder musen over
    {
      fill(255, 10, 8);
    } else
    {
      fill(255, 10, 12);
    }
    rect(width - GUI.sideBar.width - GUI.sideBarInfo.width, height - GUI.sideBarInfo.editButtonHeight - GUI.sideBarInfo.focusButtonHeight, GUI.sideBarInfo.width, GUI.sideBarInfo.focusButtonHeight);
    push();
    noStroke();
    fill('white');
    textSize(GUI.sideBarInfo.focusButtonHeight / 2);
    textAlign(CENTER, CENTER);
    text('Focus ' + celObj[GUI.sideBarInfo.currentObject].constructor.name, width - GUI.sideBar.width - (GUI.sideBarInfo.width / 2), height - GUI.sideBarInfo.editButtonHeight - GUI.sideBarInfo.focusButtonHeight / 2);
    pop();

    //edit knap
    if ((mouseX < (width - GUI.sideBar.width) && mouseX > (width - GUI.sideBar.width - GUI.sideBarInfo.width) && mouseY < height && mouseY > (height - GUI.sideBarInfo.editButtonHeight))) //skifter farven af knappen, hvis man holder musen over
    {
      fill(255, 10, 8);
    } else
    {
      fill(255, 10, 12);
    }
    rect(width - GUI.sideBar.width - GUI.sideBarInfo.width, height - GUI.sideBarInfo.editButtonHeight, GUI.sideBarInfo.width, GUI.sideBarInfo.editButtonHeight);
    push();
    noStroke();
    fill('white');
    textSize(GUI.sideBarInfo.editButtonHeight / 2);
    textAlign(CENTER, CENTER);
    text('Edit ' + celObj[GUI.sideBarInfo.currentObject].constructor.name, width - GUI.sideBar.width - (GUI.sideBarInfo.width / 2), height - GUI.sideBarInfo.editButtonHeight / 2);
    pop();
    
    //Luk info sidebar element. Dette er placeret hernede for at det altid er synligt
    if ((mouseX < (width - GUI.sideBar.width) && mouseX > (width - GUI.sideBar.width - GUI.sideBarInfo.width) && mouseY < GUI.defaultCloseButtonHeight)) //skifter farven af knappen, hvis man holder musen over
    {
      fill(255, 10, 8);
    } else
    {
      fill(255, 10, 12);
    }
    rect(width - GUI.sideBar.width - GUI.sideBarInfo.width, 0, GUI.sideBarInfo.width, GUI.defaultCloseButtonHeight);
    push();
    noStroke();
    fill('white');
    textSize(GUI.defaultCloseButtonHeight / 2);
    textAlign(CENTER, CENTER);
    text('Close menu', width - GUI.sideBar.width - (GUI.sideBarInfo.width / 2), GUI.defaultCloseButtonHeight / 2);
    pop();
  }

  // --- primær menu --- //
  push();

  rectMode(CORNER);
  strokeWeight(3);
  stroke(255, 10, 20);
  fill(255, 10, 12);
  rect(0, 0, GUI.mainMenu.width, height);

  // --- tidsforløb--- //
  push();

  rect(0, 0, GUI.mainMenu.width, GUI.mainMenu.timeControls.height);

  //sætter tekst preferences
  textFont('courier new', GUI.mainMenu.timeControls.textSize);
  textAlign(LEFT, CENTER);
  noStroke();
  fill('white');

  //time stopped tekst
  text('Time stopped?', GUI.mainMenu.timeControls.x + 30, GUI.mainMenu.timeControls.y + GUI.mainMenu.timeControls.textSize/2);

  //beregner hvor mange år, dage, timer, minuter og sekunder der er gået siden tiden blev startet
  timer.years = (((time / 60) / 60) / 24) / 365.2422;
  timer.days = (timer.years - floor(timer.years)) * 365.2422;
  timer.hours = (timer.days - floor(timer.days)) * 24;
  timer.minutes = (timer.hours - floor(timer.hours)) * 60;
  timer.seconds = (timer.minutes - floor(timer.minutes)) * 60;

  //viser hvor mange år, dage, timer, minuter og sekunder der er gået siden tiden blev startet
  text("y: " + floor(timer.years), GUI.mainMenu.timeControls.x + 5, GUI.mainMenu.timeControls.y + 55 + GUI.mainMenu.timeControls.timeOffset * 0);
  text("d: " + floor(timer.days), GUI.mainMenu.timeControls.x + 5, GUI.mainMenu.timeControls.y + 55 + GUI.mainMenu.timeControls.timeOffset * 1);
  text("h: " + floor(timer.hours), GUI.mainMenu.timeControls.x + 5, GUI.mainMenu.timeControls.y + 55 + GUI.mainMenu.timeControls.timeOffset * 2);
  text("m: " + floor(timer.minutes), GUI.mainMenu.timeControls.x + 5, GUI.mainMenu.timeControls.y + 55 + GUI.mainMenu.timeControls.timeOffset * 3);
  text("s: " + floor(timer.seconds), GUI.mainMenu.timeControls.x + 5, GUI.mainMenu.timeControls.y + 55 + GUI.mainMenu.timeControls.timeOffset * 4);

  pop();

  // --- ny planet --- //
  push();
  if ((mouseX < GUI.mainMenu.width) && (mouseY < GUI.mainMenu.timeControls.height + GUI.mainMenu.newPlanet.height) && (mouseY > GUI.mainMenu.timeControls.height))
  {
    fill(255, 10, 20);
  } else
  {
    fill(255, 10, 12);
  }
  rect(0, GUI.mainMenu.timeControls.height, GUI.mainMenu.width, GUI.mainMenu.newPlanet.height);
  push();
  noStroke();
  textFont('courier new', GUI.mainMenu.newPlanet.textSize);
  textAlign(CENTER, CENTER);
  fill('white');
  text('Create New Planet', GUI.mainMenu.width / 2, GUI.mainMenu.timeControls.height + GUI.mainMenu.newPlanet.height / 2);
  pop();

  // --- load system --- //
  push();
  if ((mouseX < GUI.mainMenu.width) && (mouseY < GUI.mainMenu.timeControls.height + GUI.mainMenu.newPlanet.height + GUI.mainMenu.loadSystem.height) && (mouseY > GUI.mainMenu.timeControls.height + GUI.mainMenu.newPlanet.height))
  {
    fill(255, 10, 20);
  } else
  {
    fill(255, 10, 12);
  }
  rect(0, GUI.mainMenu.timeControls.height + GUI.mainMenu.newPlanet.height, GUI.mainMenu.width, GUI.mainMenu.loadSystem.height);
  push();
  noStroke();
  textFont('courier new', GUI.mainMenu.loadSystem.textSize);
  textAlign(CENTER, CENTER);
  fill('white');
  text('Load system', GUI.mainMenu.width / 2, GUI.mainMenu.timeControls.height + GUI.mainMenu.newPlanet.height + GUI.mainMenu.loadSystem.height / 2);
  pop();

  // --- gem system --- //
  push();
  if ((mouseX < GUI.mainMenu.width) && (mouseY < GUI.mainMenu.timeControls.height + GUI.mainMenu.newPlanet.height + GUI.mainMenu.loadSystem.height + GUI.mainMenu.saveSystem.height) && (mouseY > GUI.mainMenu.timeControls.height + GUI.mainMenu.newPlanet.height + GUI.mainMenu.loadSystem.height))
  {
    fill(255, 10, 20);
  } else
  {
    fill(255, 10, 12);
  }
  rect(0, GUI.mainMenu.timeControls.height + GUI.mainMenu.newPlanet.height + GUI.mainMenu.loadSystem.height, GUI.mainMenu.width, GUI.mainMenu.saveSystem.height);
  push();
  noStroke();
  textFont('courier new', GUI.mainMenu.saveSystem.textSize);
  textAlign(CENTER, CENTER);
  fill('white');
  text('Save system', GUI.mainMenu.width / 2, GUI.mainMenu.timeControls.height + GUI.mainMenu.newPlanet.height + GUI.mainMenu.loadSystem.height + GUI.mainMenu.saveSystem.height / 2);
  pop();

  pop();

  pop();

  pop();

  // --- lav ny planet panel --- //
  //tegner menuen og så videre hvis "isCreatingNewPlanet" er true
  if (GUI.planet.isCreatingNewPlanet)
  {
    let x = (width / 2) - (GUI.planet.createPlanetWindow.windowWidth / 2);
    let y = (height / 2) - (GUI.planet.createPlanetWindow.windowHeight / 2);

    push();
    strokeWeight(3);
    stroke(255, 10, 20);
    fill(255, 10, 12);

    //tegner baggrunden til menuen
    rectMode(CORNER);
    rect(x, y, GUI.planet.createPlanetWindow.windowWidth, GUI.planet.createPlanetWindow.windowHeight);

    //tegner alt teksten og inputfelterne
    push();
    noStroke();
    fill('white');
    textFont('courier new', 16);
    textAlign(LEFT, TOP);

    text('Name:', x + 15, y + GUI.defaultCloseButtonHeight + 15);
    GUI.planet.name.position(x + 15, y + GUI.defaultCloseButtonHeight + 40);
    GUI.planet.name.size(120);

    text('Mass: (Earth masses)', x + 165, y + GUI.defaultCloseButtonHeight + 15);
    GUI.planet.mass.position(x + 165, y + GUI.defaultCloseButtonHeight + 40);
    GUI.planet.mass.size(180);

    text('Radius: (Earth Radii)', x + 375, y + GUI.defaultCloseButtonHeight + 15);
    GUI.planet.radius.position(x + 375, y + GUI.defaultCloseButtonHeight + 40);
    GUI.planet.radius.size(190);

    text('Planet and Orbit Colour:', x + 15, y + GUI.defaultCloseButtonHeight + 90);
    GUI.planet.colour.position(x + 250, y + GUI.defaultCloseButtonHeight + 82);

    text('Eccentricity (0 <= e < 1)', x + 15, y + GUI.defaultCloseButtonHeight + 130);
    GUI.planet.eccentricity.position(x + 15, y + GUI.defaultCloseButtonHeight + 155);
    GUI.planet.eccentricity.size(230);

    text('Semi-major Axis: (AU)', x + 275, y + GUI.defaultCloseButtonHeight + 130);
    GUI.planet.semimajorAxis.position(x + 275, y + GUI.defaultCloseButtonHeight + 155);
    GUI.planet.semimajorAxis.size(190);

    text('Argument of Periapsis:', x + 15, y + GUI.defaultCloseButtonHeight + 205);
    text('(degrees)', x + 140, y + GUI.defaultCloseButtonHeight + 235);
    GUI.planet.argumentOfPeriapsis.position(x + 15, y + GUI.defaultCloseButtonHeight + 230);
    GUI.planet.argumentOfPeriapsis.size(110);

    text('True Anomaly: (degrees)', x + 245, y + GUI.defaultCloseButtonHeight + 205);
    GUI.planet.trueAnomalyStart.position(x + 245, y + GUI.defaultCloseButtonHeight + 230);
    GUI.planet.trueAnomalyStart.size(210);

    //additional information and calculations
    let apoapsis = float(GUI.planet.semimajorAxis.value()) * (1 + float(GUI.planet.eccentricity.value()));
    text('Apoapsis: ' + round(apoapsis, 5) + ' AU', x + 15, y + GUI.defaultCloseButtonHeight + 280);
    let periapsis = float(GUI.planet.semimajorAxis.value()) * (1 - float(GUI.planet.eccentricity.value()));
    text('Periapsis: ' + round(periapsis, 5) + ' AU', x + 15, y + GUI.defaultCloseButtonHeight + 300)
    let orbitalPeriod = round(sqrt((4 * sq(PI) * pow(float(GUI.planet.semimajorAxis.value()) * 1.496 * 10**11, 3)) / (gravitationalConstant * celObj[0].mass)));

    //viser perioden af kredsløbet hvis de givne værdier er der, ellers viser det 'NaN'
    if (!isNaN(orbitalPeriod))
    {
      let years = (((orbitalPeriod / 60) / 60) / 24) / 365.2422;
      let days = (years - floor(years)) * 365.2422;
      let hours = (days - floor(days)) * 24;
      let minutes = (hours - floor(hours)) * 60;
      let seconds = (minutes - floor(minutes)) * 60;

      text('Orbital Period: ' + floor(years) + ' yrs ' + floor(days) + ' d ' + floor(hours) + ' h ' + floor(minutes) + ' m ' + floor(seconds) + ' s', x + 15, y + GUI.defaultCloseButtonHeight + 320);
    } else
    {
      text('Orbital Period: NaN', x + 15, y + GUI.defaultCloseButtonHeight + 320);
    }

    //beregner gennemsnitshastigheden
    let averageSpeed = ((2 * PI * (float(GUI.planet.semimajorAxis.value()) * 1.496 * 10**11)) / orbitalPeriod) * (1 - (1/4) * pow(float(GUI.planet.eccentricity.value()), 2) - (3/64) * pow(float(GUI.planet.eccentricity.value()), 4) - (5/256) * pow(float(GUI.planet.eccentricity.value()), 6) - (175/16384) * pow(float(GUI.planet.eccentricity.value()), 8));
    text('Average Orbital Speed: ' + round(averageSpeed, 2) + ' m/s', x + 15, y + GUI.defaultCloseButtonHeight + 340);
    pop();

    //Visualisering af kredsløb farve MAYEB SHOULDN'T BE THERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    push();
    stroke(GUI.planet.colour.value());
    strokeWeight(1);
    line(x + 350, y + GUI.defaultCloseButtonHeight + 98, x + 550, y + GUI.defaultCloseButtonHeight + 98)
    fill(GUI.planet.colour.value());
    circle(x + 550, y + GUI.defaultCloseButtonHeight + 98, 5);
    pop();

    //luk vindue knap
    if (mouseX < (x + GUI.planet.createPlanetWindow.windowWidth) && mouseX > x && mouseY < (y + GUI.defaultCloseButtonHeight) && mouseY > y) //skifter farven af knappen, hvis man holder musen over
    {
      fill(255, 10, 8);
    } else
    {
      fill(255, 10, 12);
    }
    rectMode(CORNER);
    rect((width / 2) - (GUI.planet.createPlanetWindow.windowWidth / 2), (height / 2) - (GUI.planet.createPlanetWindow.windowHeight / 2), GUI.planet.createPlanetWindow.windowWidth, GUI.defaultCloseButtonHeight);
    push();
    noStroke();
    fill(255);
    textFont('courier new', GUI.defaultCloseButtonHeight / 2);
    textAlign(CENTER, CENTER);
    text('Close Menu', (width / 2), (height / 2) - GUI.planet.createPlanetWindow.windowHeight / 2 + (GUI.defaultCloseButtonHeight / 2));
    pop();

    //lav planet knap
    if (mouseX < ((width / 2) + (GUI.planet.createPlanetWindow.windowWidth / 2)) && mouseX > ((width / 2) - (GUI.planet.createPlanetWindow.windowWidth / 2)) && mouseY < ((height / 2) + (GUI.planet.createPlanetWindow.windowHeight / 2)) && mouseY > ((height / 2) + (GUI.planet.createPlanetWindow.windowHeight / 2) - GUI.defaultCloseButtonHeight)) //skifter farven af knappen, hvis man holder musen over
    {
      fill(255, 10, 8);
    } else
    {
      fill(255, 10, 12);
    }
    rectMode(CORNER);
    rect((width / 2) - (GUI.planet.createPlanetWindow.windowWidth / 2), (height / 2) + (GUI.planet.createPlanetWindow.windowHeight / 2) - GUI.defaultCloseButtonHeight, GUI.planet.createPlanetWindow.windowWidth, GUI.defaultCloseButtonHeight);
    push();
    noStroke();
    fill(255);
    textFont('courier new', GUI.defaultCloseButtonHeight / 2);
    textAlign(CENTER, CENTER);
    text('Create Planet', (width / 2), (height / 2) + GUI.planet.createPlanetWindow.windowHeight / 2 - (GUI.defaultCloseButtonHeight / 2));
    pop();
    pop();
  }
  
  // --- lav stjerne vindue --- //
  //tegner vinduet, hvis man er igang med at lave en stjerne
  if (GUI.star.isCreatingStar)
  {
    let x = (width / 2) - (GUI.star.createStarWindow.windowWidth / 2);
    let y = (height / 2) - (GUI.star.createStarWindow.windowHeight / 2);

    push();
    strokeWeight(3);
    stroke(255, 10, 20);
    fill(255, 10, 12);
    
    //tegner vinduebaggrunden
    push();
    rectMode(CORNER);
    rect(x, y, GUI.star.createStarWindow.windowWidth, GUI.star.createStarWindow.windowHeight);
    pop();

    //top bar
    push();
    rectMode(CORNER)
    rect(x, y, GUI.star.createStarWindow.windowWidth, GUI.defaultCloseButtonHeight);
    noStroke();
    fill(255);
    textFont('courier new', GUI.defaultCloseButtonHeight / 2);
    textAlign(CENTER, CENTER);
    text('Create a Star before proceeding!', x + (GUI.star.createStarWindow.windowWidth / 2), y + (GUI.defaultCloseButtonHeight / 2));
    pop();

    //tekst til inputfelter
    push();
    noStroke();
    fill('white');
    textFont('courier new', 16);
    textAlign(LEFT, TOP);

    text('Name:', x + 15, y + GUI.defaultCloseButtonHeight + 15);
    GUI.star.name.position(x + 15, y + GUI.defaultCloseButtonHeight + 40);
    GUI.star.name.size(120);

    text('Mass: (Solar Masses)', x + 165, y + GUI.defaultCloseButtonHeight + 15);
    GUI.star.mass.position(x + 165, y + GUI.defaultCloseButtonHeight + 40);
    GUI.star.mass.size(180);

    text('Radius: (Solar Radii)', x + 375, y + GUI.defaultCloseButtonHeight + 15);
    GUI.star.radius.position(x + 375, y + GUI.defaultCloseButtonHeight + 40);
    GUI.star.radius.size(190);

    let surfaceTemp = (4.691 * pow(10, -19) * pow(float(GUI.star.mass.value()) * 1.98847 * 10**30, 0.875))/(sqrt(float(GUI.star.radius.value()) * 695700000));
    text('Surface Temperature: ' + round(surfaceTemp, 2) + ' K', x + 15, y + GUI.defaultCloseButtonHeight + 90);
    
    let peakWavelength = (2.897771955 * pow(10, -3)) / surfaceTemp;
    text('Peak Wavelength: ' + round(peakWavelength * 10**9) + ' nm', x + 15, y + GUI.defaultCloseButtonHeight + 110)
    pop();

    //visualisering af input
    push();
    drawingContext.shadowBlur = 100;
    drawingContext.shadowColor = color(270 - map(peakWavelength, 400 * pow(10, -9), 700 * pow(10, -9), 0, 270), 100, 100);
    noStroke();
    fill(270 - map(peakWavelength, 400 * pow(10, -9), 700 * pow(10, -9), 0, 270), 100, 100);
    circle(x + GUI.star.createStarWindow.windowWidth / 2, y + GUI.star.createStarWindow.windowHeight / 2 + GUI.defaultCloseButtonHeight, 100);
    pop();

    //lav stjerne knap
    if (mouseX < ((width / 2) + (GUI.star.createStarWindow.windowWidth / 2)) && mouseX > ((width / 2) - (GUI.star.createStarWindow.windowWidth / 2)) && mouseY < ((height / 2) + (GUI.star.createStarWindow.windowHeight / 2)) && mouseY > ((height / 2) + (GUI.star.createStarWindow.windowHeight / 2) - GUI.defaultCloseButtonHeight)) //skifter farven af knappen, hvis man holder musen over
    {
      fill(255, 10, 8);
    } else
    {
      fill(255, 10, 12);
    }
    rectMode(CORNER);
    rect((width / 2) - (GUI.star.createStarWindow.windowWidth / 2), (height / 2) + (GUI.star.createStarWindow.windowHeight / 2) - GUI.defaultCloseButtonHeight, GUI.star.createStarWindow.windowWidth, GUI.defaultCloseButtonHeight);
    push();
    noStroke();
    fill(255);
    textFont('courier new', GUI.defaultCloseButtonHeight / 2);
    textAlign(CENTER, CENTER);
    text('Create Star', (width / 2), (height / 2) + GUI.star.createStarWindow.windowHeight / 2 - (GUI.defaultCloseButtonHeight / 2));
    pop();

    pop();
  }

  // --- Rediger Stjerne --- //
  if (GUI.star.isEditingStar)
  {
    let x = (width / 2) - (GUI.star.editStarWindow.windowWidth / 2);
    let y = (height / 2) - (GUI.star.editStarWindow.windowHeight / 2);

    push();
    strokeWeight(3);
    stroke(255, 10, 20);
    fill(255, 10, 12);
    
    //tegner vinduebaggrunden
    push();
    rectMode(CORNER);
    rect(x, y, GUI.star.editStarWindow.windowWidth, GUI.star.editStarWindow.windowHeight);
    pop();

    //tekst til inputfelter
    push();
    noStroke();
    fill('white');
    textFont('courier new', 16);
    textAlign(LEFT, TOP);

    text('Name:', x + 15, y + GUI.defaultCloseButtonHeight + 15);
    GUI.star.name.position(x + 15, y + GUI.defaultCloseButtonHeight + 40);
    GUI.star.name.size(120);

    text('Mass: (Solar Masses)', x + 165, y + GUI.defaultCloseButtonHeight + 15);
    GUI.star.mass.position(x + 165, y + GUI.defaultCloseButtonHeight + 40);
    GUI.star.mass.size(180);

    text('Radius: (Solar Radii)', x + 375, y + GUI.defaultCloseButtonHeight + 15);
    GUI.star.radius.position(x + 375, y + GUI.defaultCloseButtonHeight + 40);
    GUI.star.radius.size(190);

    let surfaceTemp = (4.691 * pow(10, -19) * pow(float(GUI.star.mass.value()) * 1.98847 * 10**30, 0.875))/(sqrt(float(GUI.star.radius.value()) * 695700000));
    text('Surface Temperature: ' + round(surfaceTemp, 2) + ' K', x + 15, y + GUI.defaultCloseButtonHeight + 90);
    
    let peakWavelength = (2.897771955 * pow(10, -3)) / surfaceTemp;
    text('Peak Wavelength: ' + round(peakWavelength * 10**9) + ' nm', x + 15, y + GUI.defaultCloseButtonHeight + 110)
    pop();

    //visualisering af input
    push();
    drawingContext.shadowBlur = 100;
    drawingContext.shadowColor = color(270 - map(peakWavelength, 400 * pow(10, -9), 700 * pow(10, -9), 0, 270), 100, 100);
    noStroke();
    fill(270 - map(peakWavelength, 400 * pow(10, -9), 700 * pow(10, -9), 0, 270), 100, 100);
    circle(x + GUI.star.editStarWindow.windowWidth / 2, y + GUI.star.editStarWindow.windowHeight / 2 + GUI.defaultCloseButtonHeight, 100);
    pop();

    //luk vindue knap
    if (mouseX < (x + GUI.star.editStarWindow.windowWidth) && mouseX > x && mouseY < (y + GUI.defaultCloseButtonHeight) && mouseY > y) //skifter farven af knappen, hvis man holder musen over
    {
      fill(255, 10, 8);
    } else
    {
      fill(255, 10, 12);
    }
    rectMode(CORNER);
    rect(x, y, GUI.star.editStarWindow.windowWidth, GUI.defaultCloseButtonHeight);
    push();
    noStroke();
    fill(255);
    textFont('courier new', GUI.defaultCloseButtonHeight / 2);
    textAlign(CENTER, CENTER);
    text('Close Menu', x + (GUI.star.editStarWindow.windowWidth / 2), y + (GUI.defaultCloseButtonHeight / 2));
    pop();

    //rediger stjerne knap
    if (mouseX < ((width / 2) + (GUI.star.editStarWindow.windowWidth / 2)) && mouseX > ((width / 2) - (GUI.star.editStarWindow.windowWidth / 2)) && mouseY < ((height / 2) + (GUI.star.editStarWindow.windowHeight / 2)) && mouseY > ((height / 2) + (GUI.star.editStarWindow.windowHeight / 2) - GUI.defaultCloseButtonHeight)) //skifter farven af knappen, hvis man holder musen over
    {
      fill(255, 10, 8);
    } else
    {
      fill(255, 10, 12);
    }
    rectMode(CORNER);
    rect((width / 2) - (GUI.star.editStarWindow.windowWidth / 2), (height / 2) + (GUI.star.editStarWindow.windowHeight / 2) - GUI.defaultCloseButtonHeight, GUI.star.editStarWindow.windowWidth, GUI.defaultCloseButtonHeight);
    push();
    noStroke();
    fill(255);
    textFont('courier new', GUI.defaultCloseButtonHeight / 2);
    textAlign(CENTER, CENTER);
    text('Commit Changes to Star', (width / 2), (height / 2) + GUI.star.editStarWindow.windowHeight / 2 - (GUI.defaultCloseButtonHeight / 2));
    pop();

    pop();
  }

  // --- Rediger Planet vindue --- //
  if (GUI.planet.isEditingPlanet)
  {
    //bestemmer et x og y, som er øvre venstre hjørne af vinduet
    let x = (width / 2) - (GUI.planet.editPlanetWindow.windowWidth / 2);
    let y = (height / 2) - (GUI.planet.editPlanetWindow.windowHeight / 2);

    push();
    strokeWeight(3);
    stroke(255, 10, 20);
    fill(255, 10, 12);

    //tegner vinduebaggrunden
    push();
    rectMode(CORNER);
    rect(x, y, GUI.planet.createPlanetWindow.windowWidth, GUI.planet.createPlanetWindow.windowHeight);
    pop();

    //tegner alt teksten og inputfelterne
    push();
    noStroke();
    fill('white');
    textFont('courier new', 16);
    textAlign(LEFT, TOP);

    text('Name:', x + 15, y + GUI.defaultCloseButtonHeight + 15);
    GUI.planet.name.position(x + 15, y + GUI.defaultCloseButtonHeight + 40);
    GUI.planet.name.size(120);

    text('Mass: (Earth masses)', x + 165, y + GUI.defaultCloseButtonHeight + 15);
    GUI.planet.mass.position(x + 165, y + GUI.defaultCloseButtonHeight + 40);
    GUI.planet.mass.size(180);

    text('Radius: (Earth Radii)', x + 375, y + GUI.defaultCloseButtonHeight + 15);
    GUI.planet.radius.position(x + 375, y + GUI.defaultCloseButtonHeight + 40);
    GUI.planet.radius.size(190);

    text('Planet and Orbit Colour:', x + 15, y + GUI.defaultCloseButtonHeight + 90);
    GUI.planet.colour.position(x + 250, y + GUI.defaultCloseButtonHeight + 82);

    text('Eccentricity (0 <= e < 1)', x + 15, y + GUI.defaultCloseButtonHeight + 130);
    GUI.planet.eccentricity.position(x + 15, y + GUI.defaultCloseButtonHeight + 155);
    GUI.planet.eccentricity.size(230);

    text('Semi-major Axis: (AU)', x + 275, y + GUI.defaultCloseButtonHeight + 130);
    GUI.planet.semimajorAxis.position(x + 275, y + GUI.defaultCloseButtonHeight + 155);
    GUI.planet.semimajorAxis.size(190);

    text('Argument of Periapsis:', x + 15, y + GUI.defaultCloseButtonHeight + 205);
    text('(degrees)', x + 140, y + GUI.defaultCloseButtonHeight + 235);
    GUI.planet.argumentOfPeriapsis.position(x + 15, y + GUI.defaultCloseButtonHeight + 230);
    GUI.planet.argumentOfPeriapsis.size(110);

    text('True Anomaly: (degrees)', x + 245, y + GUI.defaultCloseButtonHeight + 205);
    GUI.planet.trueAnomalyStart.position(x + 245, y + GUI.defaultCloseButtonHeight + 230);
    GUI.planet.trueAnomalyStart.size(210);

    //additional information and calculations
    let apoapsis = float(GUI.planet.semimajorAxis.value()) * (1 + float(GUI.planet.eccentricity.value()));
    text('Apoapsis: ' + round(apoapsis, 5) + ' AU', x + 15, y + GUI.defaultCloseButtonHeight + 280);

    let periapsis = float(GUI.planet.semimajorAxis.value()) * (1 - float(GUI.planet.eccentricity.value()));
    text('Periapsis: ' + round(periapsis, 5) + ' AU', x + 15, y + GUI.defaultCloseButtonHeight + 300)

    let orbitalPeriod = round(sqrt((4 * sq(PI) * pow(float(GUI.planet.semimajorAxis.value()) * 1.496 * 10**11, 3)) / (gravitationalConstant * celObj[0].mass)));

    //viser perioden af kredsløbet hvis de givne værdier er der, ellers viser det 'NaN'
    if (!isNaN(orbitalPeriod))
    {
      let years = (((orbitalPeriod / 60) / 60) / 24) / 365.2422;
      let days = (years - floor(years)) * 365.2422;
      let hours = (days - floor(days)) * 24;
      let minutes = (hours - floor(hours)) * 60;
      let seconds = (minutes - floor(minutes)) * 60;

      text('Orbital Period: ' + floor(years) + ' yrs ' + floor(days) + ' d ' + floor(hours) + ' h ' + floor(minutes) + ' m ' + floor(seconds) + ' s', x + 15, y + GUI.defaultCloseButtonHeight + 320);
    } else
    {
      text('Orbital Period: NaN', x + 15, y + GUI.defaultCloseButtonHeight + 320);
    }

    //beregner gennemsnitshastigheden
    let averageSpeed = ((2 * PI * (float(GUI.planet.semimajorAxis.value()) * 1.496 * 10**11)) / orbitalPeriod) * (1 - (1/4) * pow(float(GUI.planet.eccentricity.value()), 2) - (3/64) * pow(float(GUI.planet.eccentricity.value()), 4) - (5/256) * pow(float(GUI.planet.eccentricity.value()), 6) - (175/16384) * pow(float(GUI.planet.eccentricity.value()), 8));
    text('Average Orbital Speed: ' + round(averageSpeed, 2) + ' m/s', x + 15, y + GUI.defaultCloseButtonHeight + 340);
    pop();

    //Visualisering af kredsløb farve MAYEB SHOULDN'T BE THERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    push();
    stroke(GUI.planet.colour.value());
    strokeWeight(1);
    line(x + 350, y + GUI.defaultCloseButtonHeight + 98, x + 550, y + GUI.defaultCloseButtonHeight + 98)
    fill(GUI.planet.colour.value());
    circle(x + 550, y + GUI.defaultCloseButtonHeight + 98, 5);
    pop();

    //luk vindue knap
    if (mouseX < (x + GUI.planet.editPlanetWindow.windowWidth) && mouseX > x && mouseY < (y + GUI.defaultCloseButtonHeight) && mouseY > y) //skifter farven af knappen, hvis man holder musen over
    {
      fill(255, 10, 8);
    } else
    {
      fill(255, 10, 12);
    }
    rectMode(CORNER);
    rect(x, y, GUI.planet.editPlanetWindow.windowWidth, GUI.defaultCloseButtonHeight);
    push();
    noStroke();
    fill(255);
    textFont('courier new', GUI.defaultCloseButtonHeight / 2);
    textAlign(CENTER, CENTER);
    text('Close Menu', x + (GUI.planet.editPlanetWindow.windowWidth / 2), y + (GUI.defaultCloseButtonHeight / 2));
    pop();


    //rediger planet knap
    if (mouseX < (x + GUI.planet.editPlanetWindow.windowWidth) && mouseX > x && mouseY < (y + GUI.planet.editPlanetWindow.windowHeight) && mouseY > (y + GUI.planet.editPlanetWindow.windowHeight - GUI.defaultCloseButtonHeight)) //skifter farven af knappen, hvis man holder musen over
    {
      fill(255, 10, 8);
    } else
    {
      fill(255, 10, 12);
    }
    rectMode(CORNER);
    rect(x, y + GUI.planet.editPlanetWindow.windowHeight - GUI.defaultCloseButtonHeight, GUI.planet.editPlanetWindow.windowWidth, GUI.defaultCloseButtonHeight);
    push();
    noStroke();
    fill(255);
    textFont('courier new', GUI.defaultCloseButtonHeight / 2);
    textAlign(CENTER, CENTER);
    text('Commit Changes to Planet', x + (GUI.planet.editPlanetWindow.windowWidth / 2), y + GUI.planet.editPlanetWindow.windowHeight - (GUI.defaultCloseButtonHeight / 2));
    pop();

    pop();
  }
}

//åbner, lukker eller laver ny planet baseret på det, der står i input felterne på 'newPlanetPanel.' Funktionen kommer an på inputtet, 0 = åben, 1 = luk, 2 = lav planet og luk.
function NewPlanet(inp)
{
  if (inp == 0)
  {
    GUI.planet.isCreatingNewPlanet = true;
  } else if (inp == 1)
  {
    GUI.planet.isCreatingNewPlanet = false;
    GUI.planet.name.value("");
    GUI.planet.mass.value("");
    GUI.planet.radius.value("");
    GUI.planet.eccentricity.value("");
    GUI.planet.semimajorAxis.value("");
    GUI.planet.argumentOfPeriapsis.value("");
    GUI.planet.trueAnomalyStart.value("");
  } else if (inp == 2)
  {
    let name = str(GUI.planet.name.value());
    let mass = float(GUI.planet.mass.value()) * 5.9722 * 10**24; //givet i jordmasser
    if (mass <= 0) //sikrer at mass er større end 0
    {
      mass = NaN;
    }
    let radius = float(GUI.planet.radius.value()) * 6371.0088 * 10**3; //givet i jordradier
    if (radius <= 0) //sikrer at radius er større end 0
    {
      radius = NaN;
    }
    let eccentricity = float(GUI.planet.eccentricity.value());
    if (eccentricity >= 1 || eccentricity < 0) //sikrer at eccentricity er 0 eller større, men mindre end 1
    {
      eccentricity = NaN;
    }

    let semimajorAxis = float(GUI.planet.semimajorAxis.value()) * 1.496 * 10**11; //givet i AU
    if (semimajorAxis <= 0) //sikrer at semimajorAxis er større end 0
    {
      semimajorAxis = NaN;
    }

    let argumentOfPeriapsis = float(GUI.planet.argumentOfPeriapsis.value());
    if (isNaN(argumentOfPeriapsis)) //sætter argumentOfPeriapsis til 0, hvis der ikke er givet en værdi
    {
      argumentOfPeriapsis = 0;
    }

    let trueAnomalyStart = float(GUI.planet.trueAnomalyStart.value());
    if (isNaN(trueAnomalyStart)) //sætter trueAnomalyStart til 0, hvis der ikke er givet en værdi
    {
      trueAnomalyStart = 0;
    }
    let colour = GUI.planet.colour.value();
  
    if (name != '' && isNaN(mass) == false && isNaN(radius) == false && isNaN(eccentricity) == false && isNaN(semimajorAxis) == false) //sikrer at alle inputfields er fyldte med korrekt information
    {
      //laver den nye planet
      celObj.push(new Planet(name, mass, radius, eccentricity, semimajorAxis, argumentOfPeriapsis, trueAnomalyStart, colour));

      //sorterer celObj så mindst semimajorAxis er først
      celObj.sort((a, b) => a.semimajorAxis - b.semimajorAxis);
  
      NewPlanet(1);
    } else
    {
      alert('missing or incorrect inputs'); //alerter brugeren om, at der er forkerte eller manglende inputfelter
    }
  }
}

function NewStar()
{
  let name = str(GUI.star.name.value());
  let mass = float(GUI.star.mass.value()) * 1.98847 * 10**30; //givet i solmasser
  let radius = float(GUI.star.radius.value()) * 695700000; //givet i solradier

  if (name != '' && isNaN(mass) == false && isNaN(radius) == false)
  {
    //laver stjernen
    celObj[0] = new Star(name, mass, radius);

    GUI.star.isCreatingStar = false;
    GUI.star.starExists = true;
  } else
  {
    alert('missing or incorrect inputs'); //alerter brugeren om, at der er forkerte eller manglende inputfelter
  }
}

//åbner, lukker og commiter ændringer til planeter baseret på, hvad der står i inputfelterne. Funktionen kommer an på inputtet, 0 = åben, 1 = luk, 2 = lav ændringer og luk
function EditPlanet(inp)
{
  if (inp == 0)
  {
    //viser alle de nuværende værdier af planeten
    let name = celObj[GUI.sideBarInfo.currentObject].name;
    let mass = round(celObj[GUI.sideBarInfo.currentObject].mass / (5.9722 * 10**24), 5);
    let radius = round(celObj[GUI.sideBarInfo.currentObject].radius / (6371.0088 * 10**3), 5);
    let eccentricity = celObj[GUI.sideBarInfo.currentObject].eccentricity;
    let semimajorAxis = round(celObj[GUI.sideBarInfo.currentObject].semimajorAxis / (1.496 * 10**11), 5);
    let argumentOfPeriapsis = celObj[GUI.sideBarInfo.currentObject].argumentOfPeriapsis;
    let trueAnomalyStart = 180 - celObj[GUI.sideBarInfo.currentObject].trueAnomalyStart;

    GUI.planet.name.value(name);
    GUI.planet.mass.value(mass);
    GUI.planet.radius.value(radius);
    GUI.planet.eccentricity.value(eccentricity);
    GUI.planet.semimajorAxis.value(semimajorAxis);
    GUI.planet.argumentOfPeriapsis.value(argumentOfPeriapsis);
    GUI.planet.trueAnomalyStart.value(trueAnomalyStart);

    //gør vinduet synligt
    GUI.planet.isEditingPlanet = true;
  } else if (inp == 1)
  {
    //lukker for vinduet
    GUI.planet.isEditingPlanet = false;

    //sætter alle værdierne til ingenting
    GUI.planet.name.value("");
    GUI.planet.mass.value("");
    GUI.planet.radius.value("");
    GUI.planet.eccentricity.value("");
    GUI.planet.semimajorAxis.value("");
    GUI.planet.argumentOfPeriapsis.value("");
    GUI.planet.trueAnomalyStart.value("");
  } else if (inp == 2)
  {
    let name = str(GUI.planet.name.value());
    let mass = float(GUI.planet.mass.value()) * 5.9722 * 10**24; //givet i jordmasser
    if (mass <= 0) //sikrer at mass er større end 0
    {
      mass = NaN;
    }
    let radius = float(GUI.planet.radius.value()) * 6371.0088 * 10**3; //givet i jordradier
    if (radius <= 0) //sikrer at radius er større end 0
    {
      radius = NaN;
    }
    let eccentricity = float(GUI.planet.eccentricity.value());
    if (eccentricity >= 1 || eccentricity < 0) //sikrer at eccentricity er 0 eller større, men mindre end 1
    {
      eccentricity = NaN;
    }

    let semimajorAxis = float(GUI.planet.semimajorAxis.value()) * 1.496 * 10**11; //givet i AU
    if (semimajorAxis <= 0) //sikrer at semimajorAxis er større end 0
    {
      semimajorAxis = NaN;
    }

    let argumentOfPeriapsis = float(GUI.planet.argumentOfPeriapsis.value());
    if (isNaN(argumentOfPeriapsis)) //sætter argumentOfPeriapsis til 0, hvis der ikke er givet en værdi
    {
      argumentOfPeriapsis = 0;
    }

    let trueAnomalyStart = float(GUI.planet.trueAnomalyStart.value());
    if (isNaN(trueAnomalyStart)) //sætter trueAnomalyStart til 0, hvis der ikke er givet en værdi
    {
      trueAnomalyStart = 0;
    }
    let colour = GUI.planet.colour.value();

    //redigerer planeten så de givne værdier bliver de nye værdier
    if (name != '' && isNaN(mass) == false && isNaN(radius) == false && isNaN(eccentricity) == false && isNaN(semimajorAxis) == false) //sikrer at alle inputfields er fyldte med korrekt information
    {
      //redigerer planeten med de valgte værdier
      celObj[GUI.sideBarInfo.currentObject].EditPlanetValues(name, mass, radius, eccentricity, semimajorAxis, argumentOfPeriapsis, trueAnomalyStart, colour);

      //sorterer celObj så mindst semimajorAxis er først
      celObj.sort((a, b) => a.semimajorAxis - b.semimajorAxis);

      EditPlanet(1);
    } else
    {
      alert('missing or incorrect inputs'); //alerter brugeren om, at der er forkerte eller manglende inputfelter
    }
  }
}

//bruges til at redigere stjernen alt efter hvilket input funktionen får. 0 = åben menu, 1 = luk menu, 2 = lav redigeringer af stjernen
function EditStar(inp)
{
  if (inp == 0)
  {
    //sætter værdierne til værdierne der er givet
    let name = celObj[GUI.sideBarInfo.currentObject].name;
    let mass = round(celObj[GUI.sideBarInfo.currentObject].mass / (1.98847 * 10**30), 5);
    let radius = round(celObj[GUI.sideBarInfo.currentObject].radius / (6.957 * 10**8), 5);

    GUI.star.name.value(name);
    GUI.star.mass.value(mass);
    GUI.star.radius.value(radius);

    //åbner menuen
    GUI.star.isEditingStar = true;
  } else if (inp == 1)
  {
    //lukker for menuen
    GUI.star.isEditingStar = false;

    //resetter alle inputfelter
    GUI.star.name.value('');
    GUI.star.mass.value('');
    GUI.star.radius.value('');
  } else if (inp == 2)
  {
    let name = str(GUI.star.name.value());
    let mass = float(GUI.star.mass.value()) * 1.98847 * 10**30;
    if (mass <= 0)
    {
      mass = NaN;
    }
    let radius = float(GUI.star.radius.value()) * 695700000;
    if (radius <= 0)
    {
      radius = NaN;
    }

    if (name != '' && isNaN(mass) == false && isNaN(radius) == false)
    {
      //sætter værdierne af stjernen til de rigtige værdier
      celObj[0].EditStarValues(name, mass, radius);

      //beregner de nye værdier, som planeterne bruger til at bestemme deres fysiske værdier
      for (let i = 1; i < celObj.length; i++)
      {
        celObj[i].EditPlanetValues(celObj[i].name, celObj[i].mass, celObj[i].radius, celObj[i].eccentricity, celObj[i].semimajorAxis, celObj[i].argumentOfPeriapsis, celObj[i].trueAnomalyStart, NaN);
      }

      //lukker for rediger stjerne vinduet
      EditStar(1);
    } else
    {
      alert('missing or incorrect inputs'); //alerter brugeren om, at der er forkerte eller manglende inputfelter
    }
  }
}

function DeletePlanet(inp)
{
  //tjekker at brugeren er sikker på, at de vil slette planeten
  if (inp == 'confirm' && inp != null)
  {
    //sletter den valgte planet
    celObj.splice(GUI.sideBarInfo.currentObject, 1);

    //sætter værdierne tilbage til NaN
    GUI.deSelectButton.isSelected = false;
    GUI.unFocusButton.isFocusing = false;
    GUI.sideBarInfo.isShown = false;
    GUI.sideBarInfo.currentObject = NaN;
  }
}