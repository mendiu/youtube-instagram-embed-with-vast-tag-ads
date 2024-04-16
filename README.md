# YouTube and Instsagram Embed with IMASDK for VAST Tag Ads

This project simplifies the integration of YouTube videos with Google's Interactive Media Ads (IMA) SDK, enabling the display of VAST tag ads within embedded YouTube videos. Designed with multi-player ads management in mind, it allows for multiple videos to be shown on the same page, each with its own set of ads.
[Preview](https://mendiu.github.io/youtube-embed-with-vast-tag-ads/)

## Features

- **YouTube and Instagram Video Embedding**: Easily embed YouTube videos into your web pages.
- **VAST Tag Ads**: Utilize the IMA SDK to display ads from VAST tags within your YouTube videos.
- **Multi-Player Support**: Show more than one video on the same page, each with its own ads, without any conflicts.
- **Responsive Design**: The YouTube player and ads adjust to the size of the container div, making it easy to incorporate into responsive web designs.
- **Customizable**: Pass in your own YouTube video IDs and VAST tag URLs to display the content and ads you want.

## Getting Started

To use this project, follow these simple steps:

1. **Include the Script**: Download the `VideoWithAds js (index.js)` script from this repository and include it in your project.

2. **Create a Target Div**: In your HTML, create a `div` where the YouTube player will be inserted.

    ```html
    <div id="youtube-player-1"></div>
    ```

3. **Initialize the Player**: In your JavaScript, initialize a new instance of `YoutubeVideoWithAds` for each video you want to display.

    ```javascript
    new YoutubeVideoWithAds('YOUR_YOUTUBE_VIDEO_ID', 'TARGET_DIV_ID', ['youtube'/'instagram'] 'YOUR_VAST_TAG_URL');
    ```

    - `YOUR_YOUTUBE_VIDEO_ID`: The ID of the YouTube video you want to embed.
    - `TARGET_DIV_ID`: The ID of the `div` where the YouTube player should be inserted.
    - ['youtube'/'instagram'] 'youtube' or 'instagram' dependening on the video you want to import
    - `YOUR_VAST_TAG_URL`: The URL of your VAST tag for displaying ads.
    
  
## Responsive Design

The players automatically adapt to the size of their container divs. This means you can control the size and aspect ratio of each video and its ads by simply setting the dimensions of the divs. This responsiveness ensures a seamless viewing experience across different devices and screen sizes.

## Example

Here's a complete example that embeds a YouTube video and displays ads using a VAST tag:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YouTube Embed with Ads</title>
</head>
<body>
    <div id="youtube-player-1"></div>

    <script src="path/to/YoutubeVideoWithAds.js"></script>
    <script>
        new YoutubeVideoWithAds('dQw4w9WgXcQ', 'youtube-player-1', 'https://example.com/vast-tag-url.xml');
    </script>
</body>
</html>
```

## Multi-Player Example

To embed multiple YouTube videos with their respective ads on the same page, you just need to create multiple `div` elements with unique IDs and then initialize a `YoutubeVideoWithAds` instance for each one.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Multiple YouTube Embeds with Ads</title>
</head>
<body>
    <div id="youtube-player-1"></div>
    <div id="youtube-player-2"></div>

    <script src="path/to/YoutubeVideoWithAds.js"></script>
    <script>
        // Initialize the first video
        new YoutubeVideoWithAds('dQw4w9WgXcQ', 'youtube-player-1', 'https://example.com/vast-tag-url-1.xml');

        // Initialize the second video
        new YoutubeVideoWithAds('sTSA_sWGM44', 'youtube-player-2', 'https://example.com/vast-tag-url-2.xml');
    </script>
</body>
</html>
```
