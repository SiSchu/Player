//#region elements

const musicContainer = document.getElementById('music-container');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const console1 = document.getElementById('console')
const audio = document.getElementById('audio');
const progress = document.getElementById('progress');
const progressContainer = document.getElementById('progress-container');
const title = document.getElementById('title');
const cover = document.getElementById('cover');
const currTime = document.querySelector('#currTime');
const durTime = document.querySelector('#durTime');
const volu = document.getElementById("myVol")
const valuebox = document.getElementById("vol-value")
const loopBtn = document.getElementById("loop")
const popout1 = document.getElementById("popout")
const speedBtn = document.getElementById("speedBtn")
const maxvol = document.getElementById("maxvol")
const query = document.getElementById("query")
const youtubeContainer = document.getElementById("youtube")
const youtubeembed = document.getElementById("youtubeembed")

//#endregion elements


//import * as fs from "fs/promises"
//let files = await fs.readdirSync("music")
let songsstring;
let songs = []
let filenames = []

async function loadnames() {
  const songlist = await fetch("/songlist")
    .then(res => {
      if (!res.ok) throw new Error("Error fetching songlist")
      return res.json()
    });
  songs = songlist.map(n => n.replace(/\.mp3/, ""));
  return songs
}

loadnames()

let currentQueryTimeout;
function debouncedSearchQuery() {
  clearTimeout(currentQueryTimeout)
  currentQueryTimeout = setTimeout(searchquery, 2e3)
}

let ytResult;
async function searchquery(){
  
  let input = query.value
  if(input == "")return
   
  ytResult = await fetch("/query",  {
      method: "POST",
      body : JSON.stringify({title: input}), 
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(async (res) => {
      console.log(res)
      if(!res.ok) throw new Error("Error fetching query")
      return res.json()
    })

  updateVideos()
  
}
searchquery()


// Keep track of song
let songIndex = 0;
let song = songs[songIndex]
// Initially load song details into DOM
loadSong(songs[songIndex]);

// Update song details
async function loadSong(song) {
  title.innerText = song
  audio.src = `music/${song}.mp3`;
  cover.src = `images/mimi.jpg`;
}
volu.addEventListener("input", vol)

let audioCtx, gainNode;
function setupAudioContext() {

  if (audioCtx instanceof AudioContext) return;

  // create an audio context and hook up the video element as the source
  audioCtx = new AudioContext();
  const source = audioCtx.createMediaElementSource(audio);

  // create a gain node
  gainNode = audioCtx.createGain();
  source.connect(gainNode);

  // connect the gain node to an output destination
  gainNode.connect(audioCtx.destination);
}

function vol(){
  if (gainNode) gainNode.gain.value = volu.value / 100
  valuebox.innerHTML = volu.value
}
vol()


function setmaxvol(){
    volu.max = parseInt(maxvol.value)
}

let shown__invis = 1;

function popout(){
    if(shown__invis == 1){
    popout1.style.visibility = "visible";
    shown__invis = 2
}
    else if(shown__invis == 2){
        popout1.style.visibility = "hidden";
        shown__invis = 1
    }
}

speedBtn.addEventListener("click", popout)


// Play song
function playSong() {  
  setupAudioContext();

  musicContainer.classList.add('play');
  playBtn.querySelector('i.fas').classList.remove('fa-play');
  playBtn.querySelector('i.fas').classList.add('fa-pause');

  audio.play();
}

// Pause song
function pauseSong() {
  musicContainer.classList.remove('play');
  playBtn.querySelector('i.fas').classList.add('fa-play');
  playBtn.querySelector('i.fas').classList.remove('fa-pause');

  audio.pause();
}

// Previous song
function prevSong() {
  songIndex--;

  if (songIndex < 0) {
    songIndex = songs.length - 1;
  }

  loadSong(songs[songIndex]);
  loadnames()

  playSong();
}

let on_off = 1
function loop(){
    if(on_off == 2){
        songIndex--
        return;
    }
}

// Next song
function nextSong() {
    loop();
  songIndex++;

  if (songIndex > songs.length - 1) {
    songIndex = 0;
  }
  

  loadSong(songs[songIndex]);
  loadnames()

  playSong();
}
//skip
function skip() {
    songIndex++;
  
    if (songIndex > songs.length - 1) {
      songIndex = 0;
    }
  
    loadSong(songs[songIndex]);
    loadnames()
  
    playSong();
  }

// Update progress bar
function updateProgress(e) {
  const { duration, currentTime } = e.srcElement;
  const progressPercent = (currentTime / duration) * 100;
  progress.style.width = `${progressPercent}%`;
}

// Set progress bar
function setProgress(e) {
  const width = this.clientWidth;
  const clickX = e.offsetX;
  const duration = audio.duration;

  audio.currentTime = (clickX / width) * duration;
}

/** @returns {HTMLDivElement} */
function createPreviewElement(/** @type {{ url: string, thumbnail: { url: string, width: number, height: number }, views: number, title: string, duration: string }} */ data) {
  const img = document.createElement("img")
  img.src = data.thumbnail.url
  img.width = data.thumbnail.width
  img.height = data.thumbnail.height

  const h3 = document.createElement("h3")
  h3.textContent = data.title;

  const time = document.createElement("p")
  time.textContent = data.duration

  img.addEventListener("click", async () => {
    title.innerText = data.title
    audio.src = "/audio?url=" + encodeURIComponent(data.url)
    playSong()
    cover.src = data.thumbnail.url
  })

  const container = document.createElement("div")
  container.append(h3, time, img)

  return container
}

function updateVideos() {
  console.log(ytResult)

  const previews = ytResult.map(createPreviewElement)
  youtubeContainer.replaceChildren(...previews)
   /*
  ytResult.forEach((result, index) => {
    const img = youtubeContainer.querySelector(`div:nth-child(${index + 1}) img`)
    console.log(ytResult[index].thumbnail.url)
    img.src = ytResult[index].thumbnail.url
    img.width = ytResult[index].thumbnail.width
    img.height = ytResult[index].thumbnail.height
    img.style.aspectRatio = `${ytResult[index].thumbnail.width} / ${ytResult[index].thumbnail.height}`
    img.onclick = async function(){
      // open(ytResult[index].url)
      let vidoeid = ytResult[index].url.replace("https://www.youtube.com/watch?v=", "")
      youtubeembed.src = `https://www.youtube.com/embed/${vidoeid}?autoplay=1&mute=0`
      await fetch("/audio",  {
        method: "POST",
        body : JSON.stringify({url: ytResult[index].url}), 
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then(async (res) => {
        if(!res.ok) throw new Error("Error getting audio")
        audio.src = "https://localhost:3000/audio"
      })
    }
    
    // img.src = result.thumbnail.url
    // img.width = result.thumbnail.width
    // img.height = result.thumbnail.height
    // img.style.aspectRatio = result.thumbnail.width + "/" + result.thumbnail.height
    // img.onclick = function(){open(result.url)}
  })
  */
}

//get duration & currentTime for Time of song
function DurTime (e) {
	const {duration,currentTime} = e.srcElement;
	var sec;
	var sec_d;

	// define minutes currentTime
	let min = (currentTime==null)? 0:
	 Math.floor(currentTime/60);
	 min = min <10 ? '0'+min:min;

	// define seconds currentTime
	function get_sec (x) {
		if(Math.floor(x) >= 60){
			
			for (var i = 1; i<=60; i++){
				if(Math.floor(x)>=(60*i) && Math.floor(x)<(60*(i+1))) {
					sec = Math.floor(x) - (60*i);
					sec = sec <10 ? '0'+sec:sec;
				}
			}
		}else{
		 	sec = Math.floor(x);
		 	sec = sec <10 ? '0'+sec:sec;
		 }
	} 

	get_sec (currentTime,sec);

	// change currentTime DOM
	currTime.innerHTML = min +':'+ sec;

	// define minutes duration
	let min_d = (isNaN(duration) === true)? '0':
		Math.floor(duration/60);
	 min_d = min_d <10 ? '0'+min_d:min_d;


	 function get_sec_d (x) {
		if(Math.floor(x) >= 60){
			
			for (var i = 1; i<=60; i++){
				if(Math.floor(x)>=(60*i) && Math.floor(x)<(60*(i+1))) {
					sec_d = Math.floor(x) - (60*i);
					sec_d = sec_d <10 ? '0'+sec_d:sec_d;
				}
			}
		}else{
		 	sec_d = (isNaN(duration) === true)? '0':
		 	Math.floor(x);
		 	sec_d = sec_d <10 ? '0'+sec_d:sec_d;
		 }
	} 

	// define seconds duration
	
	get_sec_d (duration);

	// change duration DOM
	durTime.innerHTML = min_d +':'+ sec_d;
		
};

// Event listeners
playBtn.addEventListener('click', () => {
  const isPlaying = musicContainer.classList.contains('play');

  if (isPlaying) {
    pauseSong();
  } else {
    playSong();
  }
});
function looponoff(){
    if(on_off == 1){
        on_off = 2
        loopBtn.style.color = "black"
    }
    else if(on_off == 2){
        on_off = 1
        loopBtn.style.color = "#dfdbdf"
    }
}

// Change song
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', skip);

//Loop song on/off
loopBtn.addEventListener("click", looponoff);

// Time/song update
audio.addEventListener('timeupdate', updateProgress);

// Click on progress bar
progressContainer.addEventListener('click', setProgress);

// Song ends
audio.addEventListener('ended', nextSong);

// Time of song
audio.addEventListener('timeupdate',DurTime);



maxvol.addEventListener("input", setmaxvol)


query.addEventListener("input",debouncedSearchQuery)