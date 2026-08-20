/* ============================================================
   TABELLONE FIX
   Corregge esclusivamente la visualizzazione:
   - classifiche A/B/C/D/E/F
   - nomi squadre nelle celle dei gironi
   Non modifica calc(), KO, risultati o Supabase.
   ============================================================ */

(function(){

    function installaFix(){

        if(typeof window.state === "undefined"){
            return false;
        }

        if(typeof window.calc !== "function"){
            return false;
        }

        /* ======================================================
           CLASSIFICA
           ====================================================== */

        window.renderClass = function(){

            ["A","B","C","D","E","F"].forEach(tag=>{

                const tbody =
                    document.getElementById(tag + "class");

                if(!tbody)
                    return;

                tbody.innerHTML = "";

                const squadre = state[tag];

                if(!Array.isArray(squadre) || squadre.length === 0)
                    return;

                const risultati =
                    Array.isArray(state[tag + "res"])
                        ? state[tag + "res"]
                        : [];

                const classifica =
                    calc(squadre, risultati);

                if(!Array.isArray(classifica))
                    return;

                classifica.forEach(x=>{

                    const tr = document.createElement("tr");

                    const valori = [
                        x?.n ?? "",
                        x?.pt ?? 0,
                        x?.gf ?? 0,
                        x?.gs ?? 0,
                        x?.df ?? 0
                    ];

                    valori.forEach((valore,indice)=>{

                        const td = document.createElement("td");

                        td.textContent = valore;

                        if(indice === 0 && x?.qual){
                            td.style.fontWeight = "700";
                        }

                        tr.appendChild(td);

                    });

                    tbody.appendChild(tr);

                });

            });

        };

        /* ======================================================
           CSS VISIVO
           ====================================================== */

        let style = document.getElementById("tabelloneFixVisuale");

        if(!style){

            style = document.createElement("style");
            style.id = "tabelloneFixVisuale";
            document.head.appendChild(style);

        }

        style.textContent = `

            table td.match-cell{
                height:auto !important;
                min-height:68px !important;
                padding:8px 6px !important;
                vertical-align:middle !important;
                overflow:visible !important;
                white-space:normal !important;
            }

            table td.match-cell .team-line{
                display:block !important;
                width:100% !important;
                height:auto !important;
                min-height:20px !important;
                line-height:1.2 !important;
                margin:0 !important;
                padding:2px 0 !important;
                white-space:normal !important;
                overflow:visible !important;
                overflow-wrap:anywhere !important;
                word-break:break-word !important;
                box-sizing:border-box !important;
            }

            table td.match-cell .vs-line{
                display:block !important;
                height:auto !important;
                min-height:18px !important;
                line-height:18px !important;
                margin:2px 0 !important;
                padding:0 !important;
                white-space:normal !important;
            }

            #Arows tr,#Brows tr,#Crows tr,
            #Drows tr,#Erows tr,#Frows tr{
                height:auto !important;
            }

            #Arows td,#Brows td,#Crows td,
            #Drows td,#Erows td,#Frows td{
                vertical-align:middle !important;
            }

            #Aclass tr,#Bclass tr,#Cclass tr,
            #Dclass tr,#Eclass tr,#Fclass tr{
                height:auto !important;
            }

            #Aclass td,#Bclass td,#Cclass td,
            #Dclass td,#Eclass td,#Fclass td{
                height:auto !important;
                padding:7px 4px !important;
                vertical-align:middle !important;
            }
        `;

        /* ======================================================
           AGGANCIO AL RENDER ESISTENTE
           ====================================================== */

        if(typeof window.render === "function" && !window.__TABELLONE_FIX_RENDER__){

            const renderOriginale = window.render;

            window.render = function(){

                const risultato = renderOriginale.apply(this, arguments);

                try{
                    window.renderClass();
                }catch(e){
                    console.error("TABELLONE FIX renderClass:", e);
                }

                return risultato;

            };

            window.__TABELLONE_FIX_RENDER__ = true;

        }

        try{
            window.renderClass();
        }catch(e){
            console.error("TABELLONE FIX iniziale:", e);
        }

        console.log("TABELLONE FIX INSTALLATO: classifiche + nomi gironi");

        return true;
    }

    if(installaFix())
        return;

    let tentativi = 0;

    const timer = setInterval(function(){

        tentativi++;

        if(installaFix() || tentativi >= 120){
            clearInterval(timer);
        }

    },500);

})();
