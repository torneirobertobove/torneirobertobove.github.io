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
    return `<tr>
    <td class="campo-cell"><input value="${camp}" oninput="updateKOField('${type}',${index},'camp',this.value)" style="width:45px"></td>
    <td class="orario-cell"><input type="time" value="${time}" oninput="updateKOField('${type}',${index},'time',this.value)"></td>
    <td class="match-cell"><div class="team-line">${formatCoppiaDisplay(match[0])}</div><div class="vs-line"><b>VS</b></div><div class="team-line">${formatCoppiaDisplay(match[1])}</div></td>
    <td class="score-cell"><input value="${risultato1}" oninput="updateKOResult('${type}',${index},this.value,0)"></td>
    <td class="score-cell"><input value="${risultato2}" oninput="updateKOResult('${type}',${index},this.value,1)"></td>
</tr>`;
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
    s,n=re.subn(r'(\n\s*fTopRes\s*:\s*"-",\s*)(\n\s*finalTop)',r'\1\n    qCamp:Array(4).fill(""),\n    qTime:Array(4).fill(""),\n    sTopCamp:Array(2).fill(""),\n    sTopTime:Array(2).fill(""),\n    fTopCamp:[""],\n    fTopTime:[""],\2',s,count=1)
    if n!=1: raise SystemExit('state KO defaults not found')
sync='''            fTopRes: typeof state.fTopRes==="string"?state.fTopRes:"-",
            qCamp: Array.isArray(state.qCamp)?state.qCamp:[],
            qTime: Array.isArray(state.qTime)?state.qTime:[],
            sTopCamp: Array.isArray(state.sTopCamp)?state.sTopCamp:[],
            sTopTime: Array.isArray(state.sTopTime)?state.sTopTime:[],
            fTopCamp: Array.isArray(state.fTopCamp)?state.fTopCamp:[],
            fTopTime: Array.isArray(state.fTopTime)?state.fTopTime:[],
            finalTop: Array.isArray(state.finalTop)?state.finalTop:[],'''
s,n=re.subn(r'\s*fTopRes:\s*typeof state\.fTopRes==="string"\?state\.fTopRes:"-",\s*\n\s*finalTop:\s*Array\.isArray\(state\.finalTop\)\?state\.finalTop:\[\],',sync,s,count=1)
if n!=1: raise SystemExit('updateAndSync KO point not found')
load='"qRes","qCamp","qTime","sTopRes","sTopCamp","sTopTime","fTopRes","fTopCamp","fTopTime","finalTop"'
if load not in s:
    s,n=re.subn(r'"qRes"\s*,\s*"sTopRes"\s*,\s*"fTopRes"\s*,\s*"finalTop"',load,s,count=1)
    if n!=1: raise SystemExit('loadState KO point not found')
reset='''        fTopRes: "-",
        qCamp: Array(4).fill(""),
        qTime: Array(4).fill(""),
        sTopCamp: Array(2).fill(""),
        sTopTime: Array(2).fill(""),
        fTopCamp: [""],
        fTopTime: [""],
        finalTop: [],'''
s,n=re.subn(r'\s*fTopRes:\s*"-",\s*\n\s*finalTop:\s*\[\],',reset,s,count=1)
if n!=1: raise SystemExit('reset KO point not found')
p.write_text(s,encoding='utf-8')
print('PATCH_OK')
