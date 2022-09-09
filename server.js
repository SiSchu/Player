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
        console.log(body.title)
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
        console.log(results)
        res.json(results)
        // res.json(results)
    }catch(err){
        res.sendStatus(500)
}
})

app.get("/audio", (req, res) => {
    const url = req.query.url

    console.log("URL: " + url)
    if(!url)return
      
        const stream = ytdl(url, {
            filter: "audioonly",
        })
  
        res.set("content-type", "audio/mp3");
        res.set("accept-ranges", "bytes");
  

    stream.pipe(res);

        // stream.on("data", (chunk) => {
        //   res.write(chunk);
        // });
  
  
        // stream.on("end", () => {
        //   res.end();
        // });
      
  });


app.listen(3000, () => {
    console.log("Server started on port 3000");
  })