const fs = require("fs")
let files = fs.readdirSync("music")
const ini = require("ini")
let songsstring
let songs = ""
let is=0;

for(let i=0; i < files.length ;i++){
    songsstring = files[i].replace(/.mp3/g, "")
    songs+='"' + songsstring + '"'
    if(i != (files.length - 1)){
        songs+=","
    }
    is=i
}
console.log(songs.toString())
console.log(is + 1 + " Songs were found")


let levelstart = 100
let engram = 70
let exp = 118700
let sum = ``;

let oft = 110
let txt1 = "text.txt"
//let stream = fs.createWriteStream(txt1)
let playerlevelstart = 100
let engramstart = 70
let pexp = 100700
let sump = ``
let poft = 120
let pamount = playerlevelstart + poft
let exec = oft + levelstart
let dinolevel = false
let playerlevel = true
let normal = true

if(dinolevel == true){
for(let i=levelstart;i<=exec;i++){
    if(i === levelstart){
    sum= "LevelExperienceRampOverrides=()\n"
    sum+= "LevelExperienceRampOverrides=("
}

    exp = exp + 2000;
    sum+=`ExperiencePointsForLevel[${i}]=${exp}`
    if(i != exec){
        sum+=","
    }
    if(i == exec){
        sum+=")"
    }
    //sum= `${level},${exp},${engram}\n`
}
fs.writeFileSync("text.txt", sum)}

if(playerlevel == true){
    for(let i=playerlevelstart;i<=pamount;i++){
        sump+=`OverridePlayerLevelEngramPoints=${engramstart}\n`
        pexp+= 2000
        if(i==200){
            engramstart = 80
        }
    }
    console.log(sump)
}

let sumnormal="";
let oftnormal = 199
let startlevelnormal = 101;
let amountnormal = oftnormal + startlevelnormal
let normalexp = 100700
let plusexp = 2000
let plusengram = 70

if(normal == true){
    for(let i=startlevelnormal;i<=amountnormal;i++){
        sumnormal+=`${i},${normalexp},${plusengram}\n`
        normalexp+=plusexp
        if(i == 200){
            plusengram=80
        }
        if(i == 300){
            plusengram=90
        }
    }
}





let converted = new Date("2022-01-18T12:39:56Z")
let hour = converted.getHours()
let lvlmsg = false

let to = 0
let ndet = 0
if(lvlmsg == true){
for(let i = 1; i < 31; i++){
    let needed = Math.round(i * 1.75) * 128
    let curr = i + Math.round(Math.sqrt(needed) - 4)
    let mpl = Math.round(needed / curr)
    to = to + mpl
    ndet = ndet + needed
    console.log("lvl", i, ", epl", curr, ", nbl", mpl, ", nbda" , to, ", nde ", needed, ", ntt ", ndet) // nbl = messages till lvlup . epl = exp per message . nbda = messages till there 
}
console.log("nbl = Nachrichten bis lvlup . epl = exp pro Nachricht . nbda = Nachrichten bis zu diesem Level . nde = Exp bis levelup . ntt = Exp bis zu diesem Level")
}



