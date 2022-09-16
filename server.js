const express = require("express");
const fs = require("fs");
const ytdl = require("ytdl-core");
const ytsr = require("ytsr")
const bodyparser = require("body-parser");

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

  app.get("/video", (req, res) => {
    const url = req.query.url

    console.log("URL Video: " + url)
    if(!url)return
    res.set("Accept-Ranges","bytes")
    res.set("Content-Type", "video/mp4")
    const stream = ytdl(url, {
        quality: "highest"
    })

    stream.pipe(res);

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