let currentsong = new Audio();
let songs
let currentfolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// // Example usage:
// console.log(secondsToMinutesSeconds(75)); // Output: "01:15"
// console.log(secondsToMinutesSeconds(3661)); // Output: "61:01"


async function getsongs(folder) {
    currentfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text()
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    // console.log(as);
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }


    // adding songs to playlists 
    let songul = document.querySelector(".songslist").getElementsByTagName('ul')[0];
    songul.innerHTML = ""
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li> 
            <img class="invert" src="svgs/music.svg" alt="">
            <div class="info">    
                <div>${song.replaceAll("%20", " ")}</div>
                <div>akash bhai</div>
            </div>
            <div class="playnow">
                <div >play now</div>
                <div>
                    <img class="invert" src="playnow.svg" alt="">
                </div> 
            </div>
            </li>`;
    }
    // adding eventlistener to each song in playlist
    Array.from(document.querySelector(".songslist").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    })

   return songs
}
const playmusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    // audio.play();
    currentsong.src = `/${currentfolder}/` + track;
    if (!pause) {
        currentsong.play();
        play.src = "svgs/pause2.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00";

}

async function displayalbum() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text()
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    // console.log(div);
    
    let anchores = div.getElementsByTagName('a');
    // console.log(anchores);
    
    let cardscontainer = document.querySelector(`.cardscontainer`);
    let array = Array.from(anchores)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {
            let folder = e.href.split('/').splice(-1)[0]
            // console.log(e);
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json()
            // console.log(response)
            cardscontainer.innerHTML = cardscontainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="circle">
                <img width="50px" height="20px" src="images/play-button.png" />
            </div>
            <img src="/songs/${folder}/cover.jpeg" alt="albumcover">
            <h3>${response.title}</h3>
            <p>${response.discription}</p>
        </div> `
        }
    }
    // adding event listerner to card to load the songs
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            // console.log(item.target, item.currentTarget.dataset)
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            playmusic(songs[0])

        })
    })

}



async function main() {
    await getsongs("songs/ncs")
    // console.log(songs)
    playmusic(songs[0], true)

    displayalbum()


    // attaching eventlisterner to play, previous and forward buttons
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "svgs/pause2.svg";
        }
        else {
            currentsong.pause();
            play.src = "svgs/play.svg";
        }
    })
    //listen for timeupdate event
    currentsong.addEventListener("timeupdate", () => {
        // console.log(currentsong.currentTime,currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)
            } / ${secondsToMinutesSeconds(currentsong.duration)
            }`;
        document.querySelector(".Circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });
    // adding event listerner to duration line
    document.querySelector(".durationline").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".Circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;
    })
    // adding event listener for hamburger
    document.querySelector('.hamburger').addEventListener('click', () => {
        document.querySelector('.left').style.left = 0;
    })
    document.querySelector('.close').addEventListener('click', () => {
        document.querySelector('.left').style.left = "-110%";
    })
    //adding event listener to previous and forward
    previous.addEventListener('click', () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        }
    })
    forward.addEventListener("click", () => {
        currentsong.pause();
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1])
        }
    })
    // adding event to volume
    document.querySelector(".range").getElementsByTagName(
        "input")[0].addEventListener("change", (e) => {
            // console.log(e, e.target.value)
            currentsong.volume = parseInt(e.target.value) / 100;
        })
    //add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click",e=>{
        // console.log(e.target)
        if(e.target.src.includes("svgs/volume.svg")){
            e.target.src =  e.target.src.replace("svgs/volume.svg","svgs/mute.svg")
            currentsong.volume=0
            document.querySelector(".range").getElementsByTagName(
                "input")[0].value=0
        }
        else{
            e.target.src =  e.target.src.replace("svgs/mute.svg","svgs/volume.svg")
            currentsong.volume = 0.10;
            document.querySelector(".range").getElementsByTagName(
                "input")[0].value=10
        }

    })    



}
main()


