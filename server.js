const express = require("express");
const fs = require("fs");
const ytdl = require("ytdl-core");
const ytsr = require("ytsr")
const bodyparser = require("body-parser");
const ffmpegPath = require("ffmpeg-static");
const cp = require("child_process");
const stream = require("stream");
const { Stream } = require("stream");

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

app.get("/audio", (req, res) => {
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

    const stream = ytdl(url, {
        filter: "audioonly",
        quality: "highestaudio",
        // range: {
        //     start,
        //     end,
        // }
    })

    stream.pipe(res);

        // stream.on("data", (chunk) => {
        //   res.write(chunk);
        // });
  
  
        // stream.on("end", () => {
        //   res.end();
        // });
      
  });

  app.get("/video",async (req, res) => {
    const url = req.query.url

    console.log("URL Video: " + url)
    if(!url)return
    res.set("Accept-Ranges","bytes")
    res.set("Content-Type", "video/mp4")
    const stream = ytdl(url, {
        quality: "highestaudio"
    })

    const stream2 = ytdl(url, {
        quality: "136"
    })





const ytmixer = (link, options = {}) => {
const result = new Stream.PassThrough();
ytdl.getInfo(link, options).then(info => {
    let audioStream = ytdl.downloadFromInfo(info, { ...options, quality: 
'highestaudio' });
    let videoStream = ytdl.downloadFromInfo(info, { ...options, quality: 
'137' });
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

    result.pipe(res).on("error", (err) => {
        console.log(err)
    })





  });

  app.post("/rpc", (req, res) => {
    const body = req.body

    console.log(body)
    // const rpc = require("discord-rpc")

    // const client = new rpc.Client({ transport: "ipc" })
    // client.request("SET_ACTIVITY", {
    //     pid: process.pid,
    //     activity: {
    //         details: body.title,
    //         state: "Listening to music",
    //         startTimestamp: new Date(),
    //         endTimestamp: new Date(Date.now() + body.duration * 1000),
    //     }
    // }).catch(err => console.log(err))

    // client.login({clientId: "703733668006461521"}).catch(err => console.log(err))


    res.sendStatus(200)
  })

app.get("/download", (req, res) => {
    const url = req.query.url
    if(!url)return
    res.set("Accept-Ranges","bytes")
    res.set("Content-Type", "audio/mp3")

    const stream = ytdl(url, {
        filter: "audioonly",
        quality: "highestaudio"
    })

    stream.on("end", () => {
        
    })
})

app.listen(3000, () => {
    console.log("Server started on port 3000");
  })