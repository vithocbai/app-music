/* 
    1.Render songs 
    2.Scroll top
    3.Play , pause, seek
    4. CD rotate
    5. Prev, next
    6 Random
    7 Next / repeat when end
    8 Active song
    9 Scroll active song into view
    10 Play Song khi click
*/

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = "MUSIC_PLAYER";

const playlist = $(".playlist");
const imageCD = $(".imageCD");
const widthCD = imageCD.offsetWidth;
const heightCD = imageCD.offsetHeight;
const cd = $(".imageCD-avatar");
const nameSong = $(".heading-music");
const singer = $(".nameMusic .desc");
const audio = $("#audio");
const playSong = $(".btn-toggle-play");
const progress = $("#progress");
const btnNext = $(".btn-next");
const btnPrev = $(".btn-prev");
const btnRandom = $(".btn-random");
const btnLoop = $(".btn-repeat");

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isLoop: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "domdom",
            singer: "Jack-5 Củ",
            path: "./assest/music/DomDomLeMonRemix-JackG5R-6898454.mp3",
            image: "./assest/img/domdom.jpg",
        },
        {
            name: "emcobantrairoi",
            singer: "Cáo Idol",
            path: "./assest/music/EmCoBanTraiRoi-Cao.mp3",
            image: "./assest/img/bantrai.jpg",
        },
        {
            name: "khuatloi",
            singer: "H-Kray",
            path: "./assest/music/KhuatLoiOrinnRemix.mp3",
            image: "./assest/img/khuatloi.jpg",
        },
        {
            name: "lamsaoemvotinh",
            singer: "Jack-5 Củ",
            path: "./assest/music/LamSaoEmVoTinhDemo.mp3",
            image: "./assest/img/saoemvotinh.jpg",
        },
        {
            name: "tuongtu",
            singer: "Wn Cave",
            path: "./assest/music/Tuong31.mp3",
            image: "./assest/img/tuongtu.jpg",
        },
        {
            name: "colddont",
            singer: "me and you",
            path: "./assest/music/ColdDont.mp3",
            image: "./assest/img/duong1chieu.jpg",
        },
        {
            name: "conyeusaono",
            singer: "Quốc Kiệt",
            path: "./assest/music/ConYeuSaoNo.mp3",
            image: "./assest/img/conyeusaono.jpg",
        },
    ],

    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    defineProperties: function () {
        Object.defineProperty(this, "currentSong", {
            get: function () {
                return this.songs[this.currentIndex];
            },
        });
    },

    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `<div class="song ${
                index === this.currentIndex ? "active" : ""
            }" data-index='${index}'>
                        <img
                            src='${song.image}';
                            alt=""
                            class="thumb"
                        />
                        <div class="body">
                            <h3 class="title">${song.name}</h3>
                            <p class="desc">${song.singer}</p>
                        </div>
                        <div class="option">
                            <i class="fas fa-ellipsis-h"></i>
                        </div>
                    </div>`;
        });
        playlist.innerHTML = htmls.join("");
    },

    handleEvent: function () {
        const _this = this;
        // Xử lý phóng to thu nhỏ CD
        playlist.onscroll = function () {
            const scrollTop = playlist.scrollTop;
            const newWidth = widthCD - scrollTop;
            const newWHeight = heightCD - scrollTop;
            imageCD.style.width = newWidth > 0 ? newWidth + "px" : 0;
            imageCD.style.height = newWHeight > 0 ? newWHeight + "px" : 0;
            imageCD.style.opacity = newWidth / widthCD;
        };

        //Xử lý CD quay / dừng
        const cdAnimate = cd.animate(
            [
                {
                    transform: "rotate(0)",
                },
                {
                    transform: "rotate(360deg)",
                },
            ],
            {
                duration: 10000,
                iterations: Infinity,
            }
        );

        cdAnimate.pause();

        // Xử lý nghe nhạc
        playSong.onclick = function () {
            _this.isPlaying ? audio.pause() : audio.play();

            // Khi tiến độ bài hát thay đổi
            audio.ontimeupdate = function () {
                const progressPercent =
                    (audio.currentTime / audio.duration) * 100;
                progress.value = progressPercent;
            };

            // Xử lý khi tua video vd tính  %s =  34% / 100 * totalTime
            progress.onchange = function () {
                const seekTime = (progress.value / 100) * audio.duration;
                audio.currentTime = seekTime;
            };
        };

        // Nhạc được play
        audio.onplaying = function () {
            _this.isPlaying = true;
            $(".fa-circle-play").classList.remove("active");
            $(".fa-circle-stop").classList.add("active");
            cdAnimate.play();
        };

        // Nhạc bị pause
        audio.onpause = function () {
            _this.isPlaying = false;
            $(".fa-circle-stop").classList.remove("active");
            $(".fa-circle-play").classList.add("active");
            cdAnimate.pause();
        };

        // Khi next nhạc
        btnNext.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong();
                audio.play();
            } else {
                _this.nextSong();
                audio.play();
                cdAnimate.play();
                $(".fa-circle-play").classList.remove("active");
                $(".fa-circle-stop").classList.add("active");
            }
            _this.render();
            _this.scrollView();
        };

        // Khi prev nhạc
        btnPrev.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong();
                audio.play();
            } else {
                _this.prevSong();
                audio.play();
                cdAnimate.play();
                $(".fa-circle-play").classList.remove("active");
                $(".fa-circle-stop").classList.add("active");
            }
            _this.render();
            _this.scrollView();
        };

        // Khi random
        btnRandom.onclick = function () {
            _this.isRandom = !_this.isRandom;
            _this.setConfig("isRandom", _this.isRandom);
            btnRandom.classList.toggle("active");
        };

        // Khi end nhạc
        audio.onended = function () {
            btnNext.onclick();
        };

        // Khi loop nhạc
        btnLoop.onclick = function () {
            _this.isLoop = !_this.isLoop;
            audio.loop = _this.isLoop;
            _this.setConfig("isLoop", _this.isLoop);
            btnLoop.classList.toggle("active", _this.isLoop);
        };

        playlist.onclick = function (e) {
            const songnode = e.target.closest(".song:not(.active)");
            // Kiểm tra xem cú nhấp chuột có nằm trong một .song phần tử hay không ...
            if (songnode || e.target.closest(".option")) {
                if (songnode) {
                    //  console.log(typeof songnode.getAttribute("data-index"));
                    _this.currentIndex = Number(songnode.dataset.index);
                    _this.loadCurrentSong();
                    audio.play();
                    _this.render();
                    _this.scrollView();
                }

                // Xử lý khi click vào option
                if (e.target.closest(".option")) {
                    console.log("option");
                }
            }
        };
    },

    loadCurrentSong: function () {
        cd.style.backgroundImage = `url('${this.currentSong.image}')`;
        nameSong.textContent = this.currentSong.name;
        singer.textContent = this.currentSong.singer;
        audio.src = this.currentSong.path;
    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isLoop = this.config.isLoop;

        // Object.assign(this,this.config);
    },

    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },

    randomSong: function () {
        let rdSong;
        do {
            rdSong = Math.floor(Math.random() * this.songs.length);
        } while (rdSong === this.currentIndex);
        this.currentIndex = rdSong;
        this.loadCurrentSong();
    },

    scrollView: function () {
        setTimeout(function () {
            $(".song.active").scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }, 1000);
    },

    start: function () {
        // gán cấu hình vào config
        this.loadConfig();

        // Đinh nghĩa các thuộc tính cho Object
        this.defineProperties();

        //Xử lý lắng nghe các sự kiện Dom Event
        this.handleEvent();

        // Tải bài hát đầu tiên vào ui khi chạy
        this.loadCurrentSong();

        // Render playlist
        this.render();

        btnRandom.classList.toggle("active", this.isRandom);
        btnLoop.classList.toggle("active", this.isLoop);
    },
};
app.start(); // Mặc đinh chạy//
