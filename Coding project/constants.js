//definerer en variabel der senere bruges til en slider
var zoomStrength;

//laver en konstant, "controls," med værdier, der bliver brugt til at bestemme brugerens view
const controls = {
  zoomScale: 0.60 * Math.pow(10, -9),
  xPan: 0,
  yPan: 0,
  xOffset: NaN,
  yOffset: NaN
};

//custom mus position, som også tager højde for translationen af canvas
const mouse = {
  x: NaN,
  y: NaN
};

const timer = {
  years: 0,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
};

//arrayliste med alle de forskellige planeter og stjernen i solsystemet
var celObj = [];

//sætter nogle konstanter/variabler der bruges igennem programmet
const gravitationalConstant = 6.674010551359 * Math.pow(10, -11);
var time = 0;

//Alle variabler til GUI
const GUI = {
  defaultCloseButtonHeight: 30,
  star: {
    isCreatingStar: false,
    isEditingStar: false,
    starExists: undefined,
    createStarWindow: {
      windowWidth: 600,
      windowHeight: 450
    },
    editStarWindow: {
      windowWidth: 600,
      windowHeight: 450
    },
    name: undefined,
    mass: undefined,
    radius: undefined
  },
  sideBar: {
    width: 200,
    height: 70,
    scrollHeight: 0
  },
  sideBarInfo: {
    isShown: false,
    currentObject: NaN,
    width: 400,
    editButtonHeight: 30,
    focusButtonHeight: 30,
    deleteButtonHeight: 30,
    scrollHeight: 0
  },
  unFocusButton: {
    y: 5,
    isFocusing: false,
    width: 100,
    height: 30
  },
  deSelectButton: {
    isSelected: false,
    width: 100,
    height: 30,
  },
  mainMenu: {
    width: 200,
    timeControls: {
      x: 5,
      y: 5,
      height: 175,
      textSize: 20,
      timeOffset: 25
    },
    newPlanet: {
      height: 50,
      textSize: 18,
    },
    loadSystem: {
      height: 50,
      textSize: 18,
    },
    saveSystem: {
      height: 50,
      textSize: 18,
    }
  },
  planet: {
    isCreatingNewPlanet: false,
    isEditingPlanet: false,
    editPlanetWindow: {
      currentlyEditing: undefined,
      windowWidth: 600,
      windowHeight: 450,
    },
    createPlanetWindow: {
      windowWidth: 600,
      windowHeight: 450,
    },
    name: undefined,
    mass: undefined,
    radius: undefined,
    eccentricity: undefined,
    semimajorAxis: undefined,
    argumentOfPeriapsis: undefined,
    trueAnomalyStart: undefined,
    colour: undefined
  },
  loadSystem: {
    isMenuOpen: false,
    windowWidth: 600,
    windowHeight: 450,
  }
};