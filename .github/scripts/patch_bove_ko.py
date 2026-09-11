from pathlib import Path
import re
p=Path('Bove.html')
s=p.read_text(encoding='utf-8')

new_card='''function renderMatchCard(titolo, match, type, index, risultato) {
    const res = String(risultato || "-").split("-");
    const risultato1 = res[0] === "-" ? "" : (res[0] || "");
    const risultato2 = res[1] || "";
    const campKey = {Q:"qCamp",S:"sTopCamp",F:"fTopCamp"}[type];
    const timeKey = {Q:"qTime",S:"sTopTime",F:"fTopTime"}[type];
    const camp = Array.isArray(state[campKey]) ? (state[campKey][index] || "") : "";
    const time = Array.isArray(state[timeKey]) ? (state[timeKey][index] || "") : "";
    const winner = getWinner(match, risultato);
    const stato = winner ? "Terminata" : "Da giocare";
    return `<tr><td class="campo-cell"><input value="${camp}" oninput="updateKOField('${type}',${index},'camp',this.value)" style="width:45px"></td><td class="orario-cell"><input type="time" value="${time}" oninput="updateKOField('${type}',${index},'time',this.value)"></td><td class="match-cell"><div class="team-line">${formatCoppiaDisplay(match[0])}</div><div class="vs-line"><b>VS</b></div><div class="team-line">${formatCoppiaDisplay(match[1])}</div></td><td class="score-cell"><input value="${risultato1}" oninput="updateKOResult('${type}',${index},this.value,0)"></td><td class="score-cell"><input value="${risultato2}" oninput="updateKOResult('${type}',${index},this.value,1)"></td></tr>`;
}'''
s,n=re.subn(r'function renderMatchCard\([\s\S]*?\n}\n(?=/\*|function )',new_card+'\n',s,count=1)
if n!=1: raise SystemExit('renderMatchCard target not found')
if 'function updateKOField(type,index,field,valore)' not in s:
    fn='''function updateKOField(type,index,field,valore){
    ensureRules();
    const keyMap={Q:{camp:"qCamp",time:"qTime"},S:{camp:"sTopCamp",time:"sTopTime"},F:{camp:"fTopCamp",time:"fTopTime"}};
    if(!keyMap[type] || !["camp","time"].includes(field)) return;
    const key=keyMap[type][field];
    if(!Array.isArray(state[key])) state[key]=[];
    state[key][index]=String(valore ?? "").trim();
    updateAndSync();
}
'''
    s=s.replace('function getWinner(match, res) {',fn+'function getWinner(match, res) {',1)

if 'qCamp:Array(4).fill("")' not in s:
    pat=r'(\n\s*fTopRes\s*:\s*"-",)'
    ins='''\1
    qCamp:Array(4).fill(""),
    qTime:Array(4).fill(""),
    sTopCamp:Array(2).fill(""),
    sTopTime:Array(2).fill(""),
    fTopCamp:[""],
    fTopTime:[""],'''
    s,n=re.subn(pat,ins,s,count=1)
    if n!=1: raise SystemExit('state defaults target not found')

if 'qCamp: Array.isArray(state.qCamp)?state.qCamp:[]' not in s:
    pat=r'(\n\s*fTopRes:\s*typeof state\.fTopRes==="string"\?state\.fTopRes:"-",)'
    ins='''\1
            qCamp: Array.isArray(state.qCamp)?state.qCamp:[],
            qTime: Array.isArray(state.qTime)?state.qTime:[],
            sTopCamp: Array.isArray(state.sTopCamp)?state.sTopCamp:[],
            sTopTime: Array.isArray(state.sTopTime)?state.sTopTime:[],
            fTopCamp: Array.isArray(state.fTopCamp)?state.fTopCamp:[],
            fTopTime: Array.isArray(state.fTopTime)?state.fTopTime:[],'''
    s,n=re.subn(pat,ins,s,count=1)
    if n!=1: raise SystemExit('updateAndSync target not found')

if 'configurazione.qCamp' not in s:
    pat=r'(\s*if\(\s*typeof configurazione\.fTopRes ===\s*"string"\s*\)\{\s*state\.fTopRes =\s*configurazione\.fTopRes;\s*\})'
    ins=r'''\1
                if(Array.isArray(configurazione.qCamp)) state.qCamp=[...configurazione.qCamp];
                if(Array.isArray(configurazione.qTime)) state.qTime=[...configurazione.qTime];
                if(Array.isArray(configurazione.sTopCamp)) state.sTopCamp=[...configurazione.sTopCamp];
                if(Array.isArray(configurazione.sTopTime)) state.sTopTime=[...configurazione.sTopTime];
                if(Array.isArray(configurazione.fTopCamp)) state.fTopCamp=[...configurazione.fTopCamp];
                if(Array.isArray(configurazione.fTopTime)) state.fTopTime=[...configurazione.fTopTime];'''
    s,n=re.subn(pat,ins,s,count=1)
    if n!=1: raise SystemExit('loadState target not found')

if 'if(!Array.isArray(state.qCamp))' not in s:
    pat=r'(\s*if\(\s*typeof state\.fTopRes !==\s*"string"\s*\)\{\s*state\.fTopRes =\s*"-";\s*\})'
    ins=r'''\1
            if(!Array.isArray(state.qCamp)) state.qCamp=Array(4).fill("");
            if(!Array.isArray(state.qTime)) state.qTime=Array(4).fill("");
            if(!Array.isArray(state.sTopCamp)) state.sTopCamp=Array(2).fill("");
            if(!Array.isArray(state.sTopTime)) state.sTopTime=Array(2).fill("");
            if(!Array.isArray(state.fTopCamp)) state.fTopCamp=[""];
            if(!Array.isArray(state.fTopTime)) state.fTopTime=[""];'''
    s,n=re.subn(pat,ins,s,count=1)
    if n!=1: raise SystemExit('initDefaults target not found')

if s.count('    state.fTopRes =\n        "-";')>=2 and 'state.qCamp=Array(4).fill("");' not in s:
    old='''    state.fTopRes =
        "-";'''
    new=old+'''\n    state.qCamp=Array(4).fill("");
    state.qTime=Array(4).fill("");
    state.sTopCamp=Array(2).fill("");
    state.sTopTime=Array(2).fill("");
    state.fTopCamp=[""];
    state.fTopTime=[""];'''
    s=s.replace(old,new,2)

p.write_text(s,encoding='utf-8')
print('PATCH_OK')
