class YoutubeVideoWithAds {
    constructor(youtubeVideoId, targetDivId, VAST_TAG = "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=") {
        this.youtubeVideoId = youtubeVideoId;
        this.VAST_TAG = VAST_TAG;
        this.adDisplayContainer = null;
        this.adsLoader = null;
        this.adsManager = null;
        this.player = null;
        this.videoContent = document.getElementById(targetDivId);
        this.instanceId = YoutubeVideoWithAds.instanceCounter++;
        if (!window.initQueue) window.initQueue = []
        this.loadYoutubeIframeAPI()
        window['YT']? this.init() : window.initQueue.push(this.init.bind(this))


    }

    static instanceCounter = 0;

    async init() {
        await this.setupDOMElements();
        await this.loadIMASDK();
        await this.onYouTubeIframeAPIReady();
        return true
    }

    async setupDOMElements() {
        this.youtubeTarget = document.createElement("div");
        this.youtubeTargetName = "youtubeTarget" + this.instanceId;
        this.youtubeTarget.id = this.youtubeTargetName
        this.videoContent.insertAdjacentElement("afterbegin", this.youtubeTarget);
        this.youtubeTarget.style.pointerEvents = "none";
        this.width = window.getComputedStyle(this.videoContent).width.split("px")[0];
        this.height = window.getComputedStyle(this.videoContent).height.split("px")[0];
    }

    async   loadYoutubeIframeAPI() {
        if (!window['YT']) {
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

    async onYouTubeIframeAPIReady() {
        this.player = await new YT.Player(this.youtubeTarget, {
            videoId: this.youtubeVideoId,
            width: this.width,
            height: this.height,
            playerVars: {
                'autoplay': 0,
                'controls': 1
            },
            events: {
                'onReady': (event) => this.onPlayerReady(event).bind(this)
            }
        });
    }

    onPlayerReady(event) {
        this.createOverlay();
        this.createPlayAdButton();
        this.createPlayButtonHoverStyle();
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
        this.playAdButton.innerHTML = '<img src="ytButton.webp" alt="Play" style="width: 75px; height: 50px; transition: transform 0.2s;">';
        this.playAdButton.addEventListener('click', () => {
            if (this.adsManager) {
                this.adsManager.resume();
            }
        });
        this.videoContent.insertAdjacentElement("beforeend", this.playAdButton);
    }

    createPlayButtonHoverStyle() {
        let playButtonHover = document.createElement("style");
        playButtonHover.type = "text/css";
        playButtonHover.innerText = `
            #${this.playAdButton.id}:hover img {
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
        this.adsManager.addEventListener(google.ima.AdEvent.Type.PAUSED, () => this.playAdButton.style.display = 'block');
        this.adsManager.addEventListener(google.ima.AdEvent.Type.RESUMED, () => this.playAdButton.style.display = 'none');
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
        this.player.playVideo();
    }

    onContentResumeRequested() {
        this.player.playVideo();
    }
}

// Uso de la clase:
// new YoutubeVideoWithAds('VIDEO_ID', 'ID_DEL_DIV');
