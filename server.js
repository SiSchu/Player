const express = require("express");
const fs = require("fs");
const ytdl = require("ytdl-core");
const ytsr = require("ytsr")
const bodyparser = require("body-parser");
const ffmpegPath = require("ffmpeg-static");
const cp = require("child_process");
const stream = require("stream");
const { Stream } = require("stream");
const ffmpeg = require("ffmpeg")
const request = require('request');
const fluentffmpeg = require('fluent-ffmpeg');
const fspromises = require("fs/promises")
const rpchandler = require("./rpc.js")



async function converttime(t){
    let hours = Math.floor(t / 3600);
    let min = Math.floor((t - (hours * 3600)) / 60);
    let sec = Math.floor(t - (hours * 3600) - (min * 60));
    if(sec < 10){
      sec = "0" + sec
    }
    if(min < 10){
      min = "0" + min
    }
    if(hours < 10){
      hours = "0" + hours
    }
    let string = hours + ":" + min + ":" + sec
    if(hours == "00"){
      string = min + ":" + sec
    }
      return {
      ms : Math.floor(t * 1000),
      sec : Math.floor(t),
      string
    }
   
  }



const app = express();

app.use(express.static("."));

//app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json())

app.get("/songlist", (req, res) => {
    try {
        const songs = fs.readdirSync("./music");
        songs.map(n => n.replace(/\.mp3/, ""));
        res.json(songs)
    } catch(err) {
        res.sendStatus(500)
    }
})

app.post("/query", async (req, res) => {
    try{
        let body = req.body
        let title = body.title

        const results = []
        const search = await ytsr(title, {limit: 10})

        search.items.map(item => {
            if(!item.url)return
            if(!item.views)return
            if(!item.duration)return
            if(!item.title)return
            if(!item.bestThumbnail)return
            results.push({
                url: item.url,
                thumbnail: item.bestThumbnail,
                views: item.views,
                title: item.title,
                duration: item.duration,
            })
            
        })
        res.json(results)
        // res.json(results)
    }catch(err){
        res.sendStatus(500)
}
})

/** @returns {string} */
function createContentRange(/** @type {number} */ start, /** @type {number} */ end) {
    return "bytes " + (start || 0) + "-" + (isNaN(end) ? "*" : end) + "/*"
}

app.get("/audio",async (req, res) => {
    const url = req.query.url

    console.log("URL: " + url)
    if(!url)return
    res.set("Accept-Ranges","bytes")
    res.set("Content-Type", "audio/mp3")

    // const [start, end] = req.headers.range?.substring(6)?.split("-")?.map(it => parseInt(it))

    // const contRange = createContentRange(start, end);
    // console.log(contRange);

    // res.writeHead(206, {
    //     "Accept-Ranges": "bytes",
    //     "Content-Type": "audio/mp3",
    //     "Content-Range": contRange,
    //     // "Content-Length": "8828094", // haben wir ja nicht
    //     "Transfer-Encoding": "chunked"
    // })

    // bytes=2293760-
    // console.log("start end", start, end)

    

    // stream.pipe(res);
    const info = await ytdl.getInfo(url)

    let foundname = info.videoDetails.title 

    foundname = foundname.replace(/ /g,"_")
    foundname = foundname.replace(/\:/g,"-")
    foundname = foundname.replace(/\//g,"_")
    foundname = foundname.replace(/\?/g,"")
    foundname = foundname.replace(/\!/g,"")
    foundname = foundname.replace(/\*/g,"")
    foundname = foundname.replace(/\+/g,"")
    foundname = foundname.replace(/\</g,"")
    foundname = foundname.replace(/\>/g,"")
    foundname = foundname.replace(/\|/g,"")
    foundname = foundname.replace(/\\/g,"")
    foundname = foundname.replace(/\"/g,"")
    foundname = foundname.replace(/\&/g,"")
    
    let vals = []
    await fspromises.readdir(__dirname + "/musicfiles/").then(values =>{
        vals = values
    })
    vals=vals.map(n => n.replace(/\.mp3/, ""))
    let result
    for( const n of vals){
        if(n == foundname){
            result = true
            break
        }
        else{
            result = false
        }
    }

    if(result){
        let duration = await converttime(info.videoDetails.lengthSeconds)
        let url1 = decodeURIComponent(url)
        await setdiscordRPC(info.videoDetails.title, url1, duration.string)
        return res.sendFile(__dirname + "/musicfiles/" + foundname + ".mp3")
    }
    const stream = ytdl(url, {
            filter: "audioonly",
            quality: "highestaudio",
        })
// var download = function(uri, filename, callback){
//   request.head(uri, function(err, res, body){
//     console.log('content-type:', res.headers['content-type']);
//     console.log('content-length:', res.headers['content-length']);

//     request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
//   });
// };

// download('https://www.google.com/images/srpr/logo3w.png', 'google.png', function(){
//   console.log('done');
// });

    
    let writestream2 = stream.pipe(fs.createWriteStream("./musicfiles/" + foundname + ".mp3"))

    // let writestream = stream.pipe(fs.createWriteStream("./musicfiles/" + foundname + ".webm"))
    

    writestream2.on("finish", () => {
    //     console.log("finished")
    //     const albumCover = __dirname +'\\covers\\cover.png';
    //     const path = __dirname+"\\musicfiles\\" + foundname + '.mp3';
    //     const tempPath = __dirname+ '\\musicfiles\\temp.mp3';
    //     cp.exec(`ffmpeg.exe -i ${path} -i ${albumCover} -map 0:0 -map 1:0 -c copy -id3v2_version 3 -metadata:s:v title="Album cover" -metadata:s:v comment="Cover (front)" ${tempPath}`, (error, stdout, stderr) => {
    //     if (error) {
    //         console.log(error);
    //         return;
    //     }
    //     if (stderr) {
    //         console.log(stderr);
    //         return;
    //     }
    //     console.log(stdout);
    // });
    // res.sendFile(__dirname + "/musicfiles/" + foundname + ".mp3")
    })

    writestream2.on("close",async () => {
    //     console.log("closed")
    //     const albumCover = __dirname +'\\covers\\cover.png';
    //     const path = __dirname+"\\musicfiles\\" + foundname
    //     const tempPath = __dirname+ '\\musicfiles\\temp.mp3';
    //     cp.exec(`ffmpeg.exe -i ${path}.webm -vn -ar 44100 -ac 2 -b:a 192k output.mp3`)
    //     cp.exec(`ffmpeg.exe -i output.mp3 -i ${albumCover} -c copy -map 0 -map 1 -id3v2_version 3 ${tempPath}`, (error, stdout, stderr) => {
    //     if (error) {
    //         console.log(error);
    //         return;
    //     }
    //     if (stderr) {
    //         console.log(stderr);
    //         return;
    //     }
    //     console.log(stdout);
    // });
        console.log("closed")
        let duration = await converttime(info.videoDetails.lengthSeconds)
        let url1 = decodeURIComponent(url)
        setdiscordRPC(info.videoDetails.title, url1, duration.string)
        res.sendFile(__dirname + "/musicfiles/" + foundname + ".mp3")
    
    })


    // cp.exec(`ffmpeg.exe -i audio.mp3 -i ${albumCover} -map 0:0 -map 1:0 -c copy -id3v2_version 3 -metadata:s:v title=Album cover -metadata:s:v comment=Cover (front) audio_output.mp3`, (error, stdout, stderr) => {
    //     if (error) {
    //         console.log(error);
    //         return;
    //     }
    //     if (stderr) {
    //         console.log(stderr);
    //         return;
    //     }
    // });

        // stream.on("data", (chunk) => {
        //   res.write(chunk);
        // });
  
  
        // stream.on("end", () => {
        //   res.end();
        // });
      
  });


  async function setdiscordRPC(title, url, duration ){
    // let title = title
    // let url = url
    // let duration = duration
    rpchandler.set(title,url,duration)
  }


  app.post("/updaterpctime", async (req, res) => {
    let duration = req.body.currenttime
    await rpchandler.updatetime(duration)
    res.status(200).send("ok")
  })


  app.get("/video",async (req, res) => {
    const url = req.query.url

    console.log("URL Video: " + url)
    if(!url)return
    res.set("Accept-Ranges","bytes")
    res.set("Content-Type", "video/mp4")
   





const ytmixer = (link, options = {}) => {
    let qualitys = ["137", "136", "135", "134","133"]
    let i = 0
    let qualitylabels = []
    let highestquality
const result = new Stream.PassThrough();
ytdl.getInfo(link, options).then(async info => {
    let audioStream = ytdl.downloadFromInfo(info, { ...options, quality: 
'highestaudio' });
    await ytdl.getInfo(link).then(info => {
        info.formats.map(format => {
            if (format.qualityLabel) {
                qualitylabels.push(format.qualityLabel)
            }
        })
    })
    console.log(qualitylabels)
    let qualitylabels2 = qualitylabels.map((quality) => {
        if(parseInt(quality.split("p")[1]) > 30){
            return
        }
        quality = quality.replace(/p/g, "")
        return quality
    })
    qualitylabels2.sort((a, b) => b - a)
    qualitylabels = qualitylabels2

    highestquality = qualitylabels[0]
    console.log(highestquality)
    if (highestquality == "1080") {
        i = 0
    } else if (highestquality == "720") {
        i = 1
    } else if (highestquality == "480") {
        i = 2
    }
    else if (highestquality== "360") {
        i = 3
    }
    else if (highestquality == "240") {
        i = 4
    }
    else if (highestquality == "144") {
        i = 5
    }

    let videoStream = ytdl.downloadFromInfo(info, { ...options, quality: 
 qualitys[i], format: "mp4" }).on("error", (err) => {console.log(err)})

        
        
    // create the ffmpeg process for muxing
    let ffmpegProcess = cp.spawn(ffmpegPath, [
        // supress non-crucial messages
        '-loglevel', '8', '-hide_banner',
        // input audio and video by pipe
        '-i', 'pipe:3', '-i', 'pipe:4',
        // map audio and video correspondingly
        '-map', '0:a', '-map', '1:v',
        // no need to change the codec
        '-c', 'copy',
        // output mp4 and pipe
        '-f', 'matroska', 'pipe:5'
    ], {
        windowsHide: true,
        stdio: [
            // silence stdin/out, forward stderr,
            'inherit', 'inherit', 'inherit',
            // and pipe audio, video, output
            'pipe', 'pipe', 'pipe'
        ]
    });
    audioStream.pipe(ffmpegProcess.stdio[3]);
    videoStream.pipe(ffmpegProcess.stdio[4]);
    ffmpegProcess.stdio[5].pipe(result);
});
return result;
};

let result = ytmixer(url)

const info = await ytdl.getInfo(url)

let foundname = info.videoDetails.title 

foundname = foundname.replace(/ /g,"_")
foundname = foundname.replace(/\:/g,"-")
foundname = foundname.replace(/\//g,"_")
foundname = foundname.replace(/\?/g,"")
foundname = foundname.replace(/\!/g,"")
foundname = foundname.replace(/\*/g,"")
foundname = foundname.replace(/\+/g,"")
foundname = foundname.replace(/\</g,"")
foundname = foundname.replace(/\>/g,"")
foundname = foundname.replace(/\|/g,"")
foundname = foundname.replace(/\\/g,"")
foundname = foundname.replace(/\"/g,"")

if(fs.existsSync("./videofiles/" + foundname + ".mp4"))return res.sendFile(__dirname + "/videofiles/" + foundname + ".mp4")

let writestream = result.pipe(fs.createWriteStream("./videofiles/" + foundname + ".mp4"))

writestream.on("open", () => {
    console.log("opened")
})


writestream.on("finish", () => {
    console.log("finished")
    res.sendFile(__dirname + "/videofiles/" + foundname + ".mp4")
})

writestream.on("error", (err) => {
    console.log(err)
})

writestream.on("close", () => {
    console.log("closed")
})

    // result.pipe(res).on("error", (err) => {
    //     console.log(err)
    // })




  });

  app.post("/rpc", (req, res) => {
    const body = req.body

    console.log(body)
    const url = body.url
    
    setdiscordRPC(body.title, url, body.duration)

    res.sendStatus(200)
  })+

app.get("/download", async (req, res) => {
    const url = req.query.url
    if(!url)return
    res.set("Accept-Ranges","bytes")
    res.set("Content-Type", "audio/mp3")

    const stream = ytdl(url, {
        filter: "audioonly",
        quality: "highestaudio"
    })

    const info = await ytdl.getInfo(url)

    let foundname = info.videoDetails.title 

    foundname = foundname.replace(/ /g,"_")
    foundname = foundname.replace(/\:/g,"-")
    foundname = foundname.replace(/\//g,"_")
    foundname = foundname.replace(/\?/g,"")
    foundname = foundname.replace(/\!/g,"")
    foundname = foundname.replace(/\*/g,"")
    foundname = foundname.replace(/\+/g,"")
    foundname = foundname.replace(/\</g,"")
    foundname = foundname.replace(/\>/g,"")
    foundname = foundname.replace(/\|/g,"")
    foundname = foundname.replace(/\\/g,"")
    foundname = foundname.replace(/\"/g,"")

    if(fs.existsSync("./musicfiles/" + foundname + ".mp3"))return res.download("./musicfiles/" + foundname + ".mp3")

    let writestream = stream.pipe(fs.createWriteStream("./musicfiles/" + foundname + ".mp3"))

    writestream.on("finish", () => {
        console.log("finished")
        return res.download("./musicfiles/" + foundname + ".mp3")
    })

})

app.listen(3000, () => {
    console.log("Server started on port 3000");
  })