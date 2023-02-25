const rpc = require("discord-rpc")
const client = new rpc.Client({ transport: "ipc" })

module.exports = {
  updateall: async function(title, url, duration){
    this.title = title;
    this.url = url;
    this.duration = duration;
  },
  updatetime: async function(currentstate){
    currentstate = Math.floor(currentstate) * 1000
    let endstate = this.convertduration(this.duration) - currentstate
    endstate = endstate + Date.now()
    currentstate = this.currentstate + currentstate
    this.set(this.title, this.url, this.duration, currentstate, endstate)
  },
  set: function(title, url, duration, currentstate, endstate){
    this.title = title;
    this.url = url;
    this.duration = duration;
    if(!endstate) endstate = Date.now() + this.convertduration(duration)
    if(!currentstate) currentstate = Date.now()
    this.currentstate = currentstate;
    this.endstate = endstate;
    client.on("ready", () => {
        client.request("SET_ACTIVITY", {
            pid: process.pid,
            activity: {
                details: title,
                state: "Duration - " + duration,
                buttons: [
                    { label: "Listen", url: url }
                ],
                timestamps: {
                    start: currentstate,
                    end: endstate
                },
                assets: {
                    large_image: "partymodelogo",
                    large_text: "Party Mode",
                }
            }
        }).catch(err => console.log(err))
        })
        client.request("SET_ACTIVITY", {
            pid: process.pid,
            activity: {
                details: title,
                state: "Duration - " + duration,
                buttons: [
                    { label: "Listen", url: url }
                ],
                timestamps: {
                    start: currentstate,
                    end: endstate
                },
                assets: {
                    large_image: "partymodelogo",
                    large_text: "Party Mode",
                }
            }
        }).catch(err => console.log(err))
    
        client.login({clientId: "703733668006461521"}).catch(err => console.log(err))
  },

  convertduration: function (duration) {
        try{
        duration = duration.split(":")
        let dur
        for(let i=duration.length;i!=0;i--){
          if(i == 2){
            dur = parseInt(duration[i-1]) * 1000  
          }
          if(i == 1){
            dur = dur + parseInt(duration[i-1]) * 60000
          }
          if(i == 0){
            dur = dur + parseInt(duration[i-1]) * 3600000
          }
        }  
        return dur
        }catch{}
    },
    converttime: function (t){
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
       
      },
    duration: undefined,
    currentstate: undefined,
    title: undefined,
    url: undefined,
    endstate: undefined
}