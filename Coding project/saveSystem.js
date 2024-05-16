function SaveSystem()
{
    let name = prompt('Give the system a name. If another system already has that name, that system will be replaced by this system');
    //tjekker om man har klikket på cancel eller ikke har inputtet noget
    if (name != null)
    {
        //tjekker om der allerede er et system med det givne navn
        if (localStorage.getItem(name) != null)
        {
            let confirmSave = prompt("Another system already has the name " + name + ". Are you sure you want to erase that system, and replace it with this one? It will be lost forever (that's a long time). Write 'confirm' to confirm this decision");
            if (confirmSave != 'confirm' || confirmSave == null)
            {
                return; //forlader funktionen hvis der ikke skrives 'confirm' til prompten foroven.
            }
        }
        //laver en array, der kommer til at opbevare alle planeternes startværdier
        let savedSystem = [];
        for (let i = 0; i < celObj.length; i++)
        {
            if (i == 0)
            {
                savedSystem[i] = [celObj[i].name, celObj[i].mass, celObj[i].radius];
            } else
            {
                //omformulerer farven til hex-kode, så det kan inputtes når planeten laves
                let rgbaColour = celObj[i].colour.levels;
                let componentR = rgbaColour[0].toString(16);
                if (componentR.length == 1)
                {
                    componentR = '0' + componentR;
                }
                let componentG = rgbaColour[1].toString(16);
                if (componentG.length == 1)
                {
                    componentG = '0' + componentG;
                }
                let componentB = rgbaColour[2].toString(16);
                if (componentB.length == 1)
                {
                    componentB = '0' + componentB;
                }
                let hexColour = '#' + componentR + componentG + componentB;

                //laver et array med arrays, der opbevarer værdierne, som der skal bruges for at lave planeterne når et system loades
                savedSystem[i] = [celObj[i].name, celObj[i].mass, celObj[i].radius, celObj[i].eccentricity, celObj[i].semimajorAxis, celObj[i].argumentOfPeriapsis, celObj[i].trueAnomalyStart - 180, hexColour];
            }
        }
        localStorage.setItem(name, JSON.stringify(savedSystem));
    }
}