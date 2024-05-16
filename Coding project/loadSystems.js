function LoadSystem(inp)
{
    if (inp != null && (localStorage.getItem(inp) != null || inp == 'Solar System'))
    {
        //tjekker om længden på celObj er mere end 0 - altså om der er et system - hvis der er et system, spørger programmet om brugeren er sikker på, at de gerne vil slette det nuværende system
        let proceed = false;
        if (celObj.length != 0)
        {
            check = prompt('Are you sure you want to load a new system? This will delete the current system. Write "confirm" to confirm this decision');
            if (check == 'confirm' && check != null)
            {
                proceed = true;
            }
        } else if (celObj.length == 0)
        {
            proceed = true;
        }
        //loader kun et system, hvis brugeren har godkendt det eller hvis der ikke er noget nuværende system
        if (proceed == true)
        {
            //sætter hele planetsystemet til ingenting, så der ikke er ekstra planeter efter systemet er loadet
            celObj = [];
            //sætter tiden tilbage til 0
            time = 0;
            
            if (inp == 'Solar System')
            {
                //definerer solsystemet
                celObj[0] = new Star('The Sun', 1.98847 * 10**30, 695700000);
                celObj[1] = new Planet('Mercury', 0.3301 * pow(10, 24), 2440500, 0.2056, 57.909 * pow(10, 9), 0, 0, '#595959');
                celObj[2] = new Planet('Venus', 4.8673 * pow(10, 24), 6051800, 0.0068, 108.210 * pow(10, 9), 0, 0, '#de8021');
                celObj[3] = new Planet('Earth', 5.9722 * pow(10, 24), 6371.0088 * 10**3, 0.017, 1.496 * 10**11, 0, 0, '#197dbf');
                celObj[4] = new Planet('Mars', 6.39 * pow(10, 23), 3389500, 0.0934, 228000000000, 0, 0, '#c94b02');
                celObj[5] = new Planet('Jupiter', 1895.13 * pow(10, 24), 71492000, 0.0487, 778.479 * pow(10, 9), 0, 0, '#b39359');
                celObj[6] = new Planet('Saturn', 568.32 * pow(10, 24), 60268000, 0.052, 1432.041 * pow(10, 9), 0, 0, '#856d42');
                celObj[7] = new Planet('Uranus', 86.811 * pow(10, 24), 25559000, 0.0469, 2867.043 * pow(10, 9), 0, 0, '#7fc9be');
                celObj[8] = new Planet('Neptune', 102.409 * pow(10, 24), 24764000, 0.0097, 4514.953 * pow(10, 9), 0, 0, '#24397d');  
                celObj[9] = new Planet('Pluto', 1.309 * pow(10, 22), 1188300, 0.25, 5869.656 * pow(10, 9), 0, 0, '#8c8080');
            } else if (localStorage.getItem(inp) != null)
            {
                let loadedSystem = JSON.parse(localStorage.getItem(inp));
                for (let i = 0; i < loadedSystem.length; i++)
                {
                    if (i == 0)
                    {
                        celObj[i] = new Star(loadedSystem[i][0], loadedSystem[i][1], loadedSystem[i][2]);
                    } else
                    {
                        celObj[i] = new Planet(loadedSystem[i][0], loadedSystem[i][1], loadedSystem[i][2], loadedSystem[i][3], loadedSystem[i][4], loadedSystem[i][5], loadedSystem[i][6], loadedSystem[i][7]);
                    }
                }
            }
        }
    }
}