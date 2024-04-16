class VideoWithAds {
    constructor(videoId, targetDivId, videoType = 'youtube', VAST_TAG = "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=") {
        this.videoId = videoId;
        this.videoType = videoType;
        this.VAST_TAG = VAST_TAG;
        this.adDisplayContainer = null;
        this.adsLoader = null;
        this.adsManager = null;
        this.player = null;
        this.videoContent = document.getElementById(targetDivId);
        this.instanceId = VideoWithAds.instanceCounter++;
        if (!window.initQueue) window.initQueue = []
        this.loadYoutubeIframeAPI()
        window[this.videoType] ? this.init() : window.initQueue.push(this.init.bind(this))


    }

    static instanceCounter = 0;

    async init() {
        await this.setupDOMElements();
        await this.loadIMASDK();
        await this.onPlayerAPIReady();
        this.createOverlay();
        this.createPlayAdButton()
        this.createInstaClickToPlayDisclaimer()
        this.createPlayButtonHoverStyle();
        return true
    }

    async setupDOMElements() {
        this.videoTarget = document.createElement("div");
        this.youtubeTargetName = this.videoType + "youtubeTarget" + this.instanceId;
        this.videoTarget.id = this.youtubeTargetName
        this.videoContent.insertAdjacentElement("afterbegin", this.videoTarget);
        this.videoTarget.style.pointerEvents = "none";
        this.width = window.getComputedStyle(this.videoContent).width.split("px")[0];
        this.height = window.getComputedStyle(this.videoContent).height.split("px")[0];
    }

    async   loadYoutubeIframeAPI() {
        if (!window['YT'] && this.videoType === 'youtube') {
            let tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            let firstScriptTag = document.getElementsByTagName('script')[0];
            await firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = () => {
            for (let count in window.initQueue){
                window.initQueue[count]()
            }

    };
    }

    async loadIMASDK() {
        if (!window['google'] || !window['google']['ima']) {
            let imasdk =  await document.createElement('script');
            imasdk.src = 'https://imasdk.googleapis.com/js/sdkloader/ima3.js';
            let firstScriptTag = document.getElementsByTagName('script')[0];
            await firstScriptTag.parentNode.insertBefore(imasdk, firstScriptTag);
        }
    }

    async onPlayerAPIReady() {
        if (this.videoType === 'youtube') {
            this.loadYouTubeVideo();
        } else if (this.videoType === 'instagram') {
            this.loadInstagramVideo();
        }
    }


    async loadYouTubeVideo() {
        this.player = await new YT.Player(this.videoTarget, {
            videoId: this.videoId,
            width: this.width,
            height: this.height,
            playerVars: {
                'autoplay': 0,
                'controls': 1
            },
            events: {
                //'onReady': (event) => this.onPlayerReady(event).bind(this)
            }
        });
    }
    async loadInstagramVideo() {
        let instaEmbedCode = `<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https://www.instagram.com/reel/${this.videoId}" data-instgrm-version="14" style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:16px;"></div></blockquote>`;
        this.videoTarget.innerHTML = instaEmbedCode;
        this.player = this.videoTarget;
        let instaScript = document.createElement('script');
        instaScript.async = true;
        instaScript.src = "//www.instagram.com/embed.js";
        document.body.appendChild(instaScript);
        this.onPlayerReady(); // To trigger advertisement loading
    }


    onPlayerReady(event) {

    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'overlay' + this.instanceId;
        this.overlay.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(255, 255, 255, 0); cursor: pointer; z-index: 200;';
        this.overlay.addEventListener('click', () => this.initializeAdDisplayContainer());
        this.videoContent.insertAdjacentElement("beforeend", this.overlay);
    }

    createPlayAdButton() {
        this.playAdButton = document.createElement('div');
        this.playAdButton.id = 'playAdButton' + this.instanceId;
        this.playAdButton.style.cssText = 'display: none; position: absolute; z-index: 3; top: 50%; left: 50%; transform: translate(-50%, -50%); cursor: pointer;';
        this.playAdButton.innerHTML = '<img src="playButton.png" alt="Play" style="width: 75px; height: 50px; transition: transform 0.2s;">';
        this.playAdButton.addEventListener('click', () => {
            if (this.adsManager) {
                this.adsManager.resume();
            }
        });
        this.videoContent.insertAdjacentElement("beforeend", this.playAdButton);
    }
    createInstaClickToPlayDisclaimer() {
        this.playInstaDisclaimer = document.createElement('div');
        this.playInstaDisclaimer.id = 'playAdButton' + this.instanceId;
        this.playInstaDisclaimer.style.cssText = `
        display: none;
        position: absolute;
        z-index: 3;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.7);
        color: #fff;
        padding: 10px 20px;
        border-radius: 10px;
        text-align: center;
        font-size: 16px;
        font-family: Arial, sans-serif;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        pointer-events: none;
        animation: pulse 1.5s infinite;
    `;
        this.playInstaDisclaimer.innerHTML = "Haz click de nuevo para ver el video";
        this.videoContent.insertAdjacentElement("beforeend", this.playInstaDisclaimer);

        // Agregar estilos de animación al documento
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = `
        @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -50%) scale(1.05); }
            100% { transform: translate(-50%, -50%) scale(1); }
        }
    `;
        document.head.appendChild(styleSheet);
    }


    createPlayButtonHoverStyle() {
        let playButtonHover = document.createElement("style");
        playButtonHover.type = "text/css";
        playButtonHover.innerText = `
            #${this.playInstaDisclaimer.id}:hover img {
                transform: scale(1.1);
            }
        `;
        document.head.appendChild(playButtonHover);
    }

    initializeAdDisplayContainer() {
        if (!this.adsLoader) {
            this.setUpIMA();
        }
        this.overlay.style.display = 'none';
        document.getElementById(this.youtubeTargetName).style.pointerEvents = "auto";
    }

    setUpIMA() {
        this.adContainer = document.createElement('div');
        this.adContainer.id = 'adContainer' + this.instanceId;
        this.videoContent.insertAdjacentElement("afterbegin", this.adContainer);

        this.adDisplayContainer = new google.ima.AdDisplayContainer(this.adContainer, this.videoContent);
        this.adDisplayContainer.initialize();

        this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer);
        this.adsLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, (e) => this.onAdsManagerLoaded(e), false);
        this.adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, (e) => this.onAdError(e), false);

        this.requestAds();
    }

    requestAds() {
        let adsRequest = new google.ima.AdsRequest();
        adsRequest.adTagUrl = this.VAST_TAG;
        adsRequest.linearAdSlotWidth = this.width;
        adsRequest.linearAdSlotHeight = this.height;

        this.adsLoader.requestAds(adsRequest);
    }

    onAdsManagerLoaded(adsManagerLoadedEvent) {
        this.adsManager = adsManagerLoadedEvent.getAdsManager(this.videoContent);
        this.adsManager.addEventListener(google.ima.AdEvent.Type.PAUSED, () => this.playInstaDisclaimer.style.display = 'block');
        this.adsManager.addEventListener(google.ima.AdEvent.Type.RESUMED, () => this.playInstaDisclaimer.style.display = 'none');
        this.adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, () => this.onContentResumeRequested());
        this.adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, () =>
            this.adContainer.style.display = 'none'
        );

        try {
            this.adsManager.init(this.width, this.height, google.ima.ViewMode.NORMAL);
            this.adsManager.start();
        } catch (adError) {
            console.log('Error al iniciar el AdsManager:', adError);
            this.videoContent.play();
        }
    }

    onAdError(adErrorEvent) {
        console.log('Error de Ad:', adErrorEvent.getError().toString());
        if (this.adsManager) {
            this.adsManager.destroy();
        }
        if (this.videoType == "youtube") this.player.playVideo();
        if (this.videoType == "instagram") {
            this.playInstaDisclaimer.style.display = 'block'
            setTimeout(function (){this.playInstaDisclaimer.style.display = 'none'}.bind(this),3500)
        }


    }

    onContentResumeRequested() {
        if (this.videoType == "youtube") this.player.playVideo();
        if (this.videoType == "instagram") {
            this.playInstaDisclaimer.style.display = 'block'
            setTimeout(function (){this.playInstaDisclaimer.style.display = 'none'}.bind(this),3500)
        }


    }
}
