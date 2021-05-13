---
title: "從 Hexo 到 Hugo"
description: "本篇文章介紹我選擇Hugo的原因及從Hexo搬遷到Hugo過程中遇到的問題及解決方法"
date: 2021-05-12T22:28:44+08:00
tags: [資訊, Hugo]
tldr: Hugo 很棒
katex: true
outline: true
draft: false
---

<!-- 
1. why move to hugo
2. step to set-up a blog in hugo
   1. theme
   2. adjust theme
   3. Katex
   4. import noto sans CJK TC
   5. deploy (travis CI)
   6. google analytics
   7. google search console
3. 心得 
-->


## 為何選擇從 Hexo 搬遷到 Hugo

從這個部落格建站以來，我一直都是使用 [Hexo](https://hexo.io/zh-tw/) 作為部落格的框架。但在使用過程中我主要遇到了幾個問題：

1. Hexo 使用 Node.js 來生成靜態網頁：這使不同設備上的套件相依變得十分難解 (主要是因為`package.json`，但難解的原因可能是因為我對Node.js不熟)，也讓在不同設備上寫作變得十分困難，使部落格的更新頻率變得十分糟糕。
2. 主題易與他人重複：我先前是使用 Hexo 的 [NexT theme](https://github.com/theme-next/hexo-theme-next) 作為部落格的主題。依照我的觀察，使用hexo的人中，大約有60%~70%是採用這個主題的，這就讓自己的部落格沒有個人的風格，也讓訪客覺得很單調。
3. Github 常常會提醒我 repo 的 package 有 security vulnerability 或者是更新的PR：雖然這是一件好事，代表package有人在維護，但每次看到Github跳訊息就覺得很煩。
   
{{<figure src="/image/to-hugo-github-alert.png" title="各種security vulnerability和更新的PR">}}
4. Hexo 生成網頁的速度較為緩慢：雖然部落格文章不多我感受不出來，但看網路上大家都說但部落格文章達到100篇左右的時候，網頁的生成速度可能會飆升到20秒左右。

以上的問題若改用Hugo就可以解決了。Hugo是使用Go語言編寫，整體框架沒有複雜的套件相依問題要解，且Go語言的執行效率很高，聽說可以逼近C。於是在個人申請結束後，我決定把文章備份，並把部落格框架從Hexo換成Hugo。


## 備份文章

與Hexo一樣，Hugo是使用 Markdown 作為寫作的語法，所以備份文章是整個搬遷過程中最簡單的部分了，就只要把圖片跟 Markdown 複製到其他地方就結束了。

## 安裝 Hugo

Hugo 的安裝方法主要有幾種：

1. Binary     (for all platforms)
2. Docker     (for all platforms)
3. Snap       (for Linux)
4. Homebrew   (for macOS and Linux)
5. MacPorts   (for macOS)
6. Chocolatey (for Windows)
7. Scoop      (for Windows)

以上安裝方式的說明都可以在 <https://gohugo.io/getting-started/installing/> 找到，這邊主要示範使用Snap及Chocolatey的安裝方式。

### Snap

```bash
snap install hugo
```

就是這麼簡單，snap好棒。

### Chocolatey

Chocolatey 是 Windows 上少數的套件管理程式之一。Chocolatey的安裝方式在此我就不贅述，大家在安裝git的時候可能就會安裝到了。

```bash
choco install hugo -confirm
```

也是ㄧ行就結束了，非常的簡單。


## 選擇 Theme

Hugo 的主題相當多，都可以在 <https://themes.gohugo.io/> 中找到。

安裝方式也相當簡單，通常就只要從 Github clone 下來，設定一下 `config.toml` 就OK了。

我最後是選擇[Archie Theme](https://github.com/athul/archie)，他應該算是一個滿minimal的主題，我個人還滿喜歡這種風格的，而且他內建黑色主題，不用在額外寫CSS對我來說是很大的誘因。

## 調整 Theme

這是Archie內建的顏色配置。

{{<figure src="/image/archie-theme.png" title="一般模式">}}
{{<figure src="/image/archie-dark.png" title="黑色模式">}}

一般模式還OK，但我覺得黑色模式的配色有點醜，而且感覺看久眼睛會不太舒服，於是我決定把顏色稍微換一下。我主要使用 Material Design 提供的[配色工具](https://material.io/design/color/the-color-system.html#tools-for-picking-colors)來挑顏色。最後決定以 Material Design 經典的綠色作為主色調。一般和黑色模式分別採用不同的深淺的綠色。以下是我的CSS設定，可以參考一下。

一般模式
```css
:root{
--maincolor: #00897B;
--bordercl: #0782bf;
--callouctcolor:dodgerblue;
--hovercolor: #00897B;
--darkMaincolor: #80CBC4;
}
```

黑色模式
```css
body {
  color: white;
  background-color: #202124;
}

::-moz-selection {
  background: blue;
  color: #fff;
  text-shadow: none;
}

::selection {
  background: #89000e;
  color: #fff;
  text-shadow: none;
}
```

## 字體調整

通常 Hugo 上的主題都不會設定中文的字體，所以我們必須自己設定。

我採用Google推出的Noto Sans TC，字體的設定相當簡單，只要把css中`font-family`加上Noto Sans TC，並且在利用`@import`語法從 Google CDN import字體檔就可以了。

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC&display=swap');

html {
  color: #232333;
  font-family: 'Roboto Mono', 'Noto Sans TC', monospace;
  text-align: justify;
  font-size: 16px;
  line-height: 1.5em;
}
```

但這種方式會需要額外存取 CDN，一般是建議把字體檔放在站點內，提高存取的速度。這邊我們採用 [google-webfonts-helper](https://google-webfonts-helper.herokuapp.com/fonts) 來將字體下載下來。

{{<figure src="/image/google-webfont.png" title="google-webfont-helper">}}


使用方式很簡單就先在左側選單選擇 Noto Sans TC ，**並且選擇 chinese-traditional** (這點很重要喔，不然下載下來的字體會沒有中文字型)。然後再把網站生成的css貼在主題的css中，像Archie就是貼在`font.css`，最後再將字型檔放在`fonts`資料夾中，就完成了。

```css
/* noto-sans-tc-regular - chinese-traditional */
@font-face {
  font-family: 'Noto Sans TC';
  font-style: normal;
  font-weight: 400;
  src: url('../fonts/noto-sans-tc-v11-chinese-traditional-regular.eot'); /* IE9 Compat Modes */
  src: local(''),
       url('../fonts/noto-sans-tc-v11-chinese-traditional-regular.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
       url('../fonts/noto-sans-tc-v11-chinese-traditional-regular.woff2') format('woff2'), /* Super Modern Browsers */
       url('../fonts/noto-sans-tc-v11-chinese-traditional-regular.woff') format('woff'), /* Modern Browsers */
       url('../fonts/noto-sans-tc-v11-chinese-traditional-regular.ttf') format('truetype'), /* Safari, Android, iOS */
       url('../fonts/noto-sans-tc-v11-chinese-traditional-regular.svg#NotoSansTC') format('svg'); /* Legacy iOS */
  font-display: swap; /*  這行可以在字體尚未載入時，使網頁出現臨時的字體 */
}
```


## favicon.ico

Archie 沒有內建 favicon，如果要新增 favicon 可以採用 <https://realfavicongenerator.net/>。跟著網站的教學操作就可以新增icon了。設定icon語法就放在 `header.html`，而icon的圖片就放在`static`資料夾。



## $\LaTeX$ 支援

在網頁上顯示數學式一般來說有兩種方式，MathJax 及 KaTeX，本部落格使用KaTeX 作為渲染的框架。KaTeX的設定方式很簡單，只要將以下語法複製到`header.html`的開頭就可以了。

```html
<!-- KaTeX -->
{{- if .Params.katex -}}
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.13.6/dist/katex.min.css" integrity="sha384-81hI3kRV62VEhJBKVz7JsJzaUcP5Ty/E1FFdkLh6yz8uWthgdssaWCD1j8R1r2iU" crossorigin="anonymous">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.13.6/dist/katex.min.js" integrity="sha384-8swauRFcjK634lyiWVXOA0GdycMCzfbC+6qXGQroVKYve7SFHawYjryBtaLve4xl" crossorigin="anonymous"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.13.6/dist/contrib/auto-render.min.js" integrity="sha384-vZTG03m+2yp6N6BNi5iM4rW4oIwk5DfcNdFfxkk9ZWpDriOkXX8voJBFrAO7MpVl" crossorigin="anonymous"></script>
<script>
    document.addEventListener("DOMContentLoaded", function() {
        renderMathInElement(document.body, {
          // customised options
          // • auto-render specific keys, e.g.:
          delimiters: [
			{left: "$$", right: "$$", display: true},
			{left: "$", right: "$", display: false},
			{left: "\\(", right: "\\)", display: false},
			{left: "\\begin{equation}", right: "\\end{equation}", display: true},
			{left: "\\begin{align}", right: "\\end{align}", display: true},
			{left: "\\begin{alignat}", right: "\\end{alignat}", display: true},
			{left: "\\begin{gather}", right: "\\end{gather}", display: true},
			{left: "\\begin{CD}", right: "\\end{CD}", display: true},
			{left: "\\begin{cases}", right: "\\end{cases}", display: true},
			{left: "\\[", right: "\\]", display: true}
			],
          // • rendering keys, e.g.:
          throwOnError : false
        });
    });
</script>
{{- end -}}
```

其中 `{{- if .Params.katex -}}` 是KaTeX的開關，除非文章的 front-matter 中有設 `katex: true` 不然預設不會引入 KaTeX 的 JS 檔，藉此來加快網站的載入速度。

有一點值得提一下，我會建議如果開啟 KaTeX，可以把 Markdown 的渲染引擎改為 `mmark`，所以 front-matter 變成這樣：

```
---
...
katex: true
markup: "mmark"
...
---
```

完成以上設定後，就可以在部落格上使用$\LaTeX$語法，生成數學方程式了！

$$E=mc^2$$

## 透過 Github Page 和 Travis CI 自動部屬

當我們在本機完成以上設定後，最後一步就是把網站公開在網路上啦。

### 建立一個 [username].github.io

我們使用 Github Page 來部屬我們的部落格。所以需要在 Github 上建立一個 repo 用來存放我們的網站，而這個 repo 的名字必需取名為 `[username].github.io`，以我為例，我的 repo 名字就叫 `jayin92.github.io`。

之後就可以設定`.gitignore`，設定好後，就可以把網站的內容 push 到 `master` branch 上，以下是我的`.gitignore`設定檔。

```
*.log
public/
```

但做完以上設定後，你會發現到 <https://[username].github.io> 上會什麼都沒有，這是因為目前的 repo 只有 Hugo 的一些設定檔和文章的 Markdown 檔案，我們尚未產生能顯示網頁上的 HTML 檔。那我們要如何在 push 網站內容後，自動生成 HTML 檔呢？這時我們就需要使用 Travis CI。

### 設定 Travis CI

> Travis CI是在軟體開發領域中的一個線上的，分散式的持續整合服務，用來構建及測試在GitHub代管的代碼。 *from Wikipedia*

簡而言之，Travis CI 可以在 repo 的 `master` branch 更新時，利用 Hugo 自動生成 HTML 檔，並將其 push 到存放靜態網頁的 `gh-pages` branch。那要怎麼讓 Travis CI 知道要怎麼生成網頁呢？這時，我們就需要 `.travis.yml`。`.travis.yml` 包含要使用何種虛擬機器、這台虛擬機器需要安裝什麼套件及要執行什麼程式。我的 `.travis.yml` 具體如下：

```yaml
arch: arm64
os: linux
dist: focal
branches:
  only:
    - main

language: generic

install:
- wget -O /tmp/hugo.deb https://github.com/gohugoio/hugo/releases/download/v0.83.1/hugo_0.83.1_Linux-ARM64.deb
- sudo dpkg -i /tmp/hugo.deb

script:
  - HUGO_ENV=production hugo --gc --minify -v

deploy:
  strategy: git
  provider: pages
  skip_cleanup: true
  token: $GITHUB_TOKEN
  local_dir: $TRAVIS_BUILD_DIR/public
  on:
    branch: main

notifications:
  email:
      recipients:
        - jayin920805@gmail.com
      on_success: always
      on_failure: always
```

應該滿好看懂的，就是在 ARM64 的裝一下 Hugo 然後跑一下生成，再把生成的靜態網頁 push 到 `gp-pages` branch。


我們將 `.travis.yml` 放在 `master` branch 的根目錄下，並在 <https://www.travis-ci.com/> 將 `[username].github.io` 這個 repo 加入到 Travis CI 中。設定完成後，就可以試試看把檔案 push 上去，然後看一下 Travis CI 有沒有開始 build，如果有成功 build 起來應該會長這樣。

還有一點要提一下，為了讓 Travis CI 可以存取 repo，必須提供 Github Personal Access Token 給 Travis CI。這部份的[教學](https://docs.travis-ci.com/user/deployment/pages/)網路上應該都有，我這邊就不再贅述了。

{{<figure src="/image/travis-success.png" title="一次成功的 build">}}

### 更改 Github Pages 設定

當你開心的認為你的部落格終於成功發布在網路上了，那你就錯了，我們還有一步需要設定。就是將 Github Pages 的 Source 從 `master` 更改為 `gh-pages`。更改完這項應該就可以發現你的部落格終於出現了！

{{<figure src="/image/github-branch.png" title="更改 Github Pages 設定">}}

## Google Analytics & Google Search Console

Google Analytics 可以讓我們知道部落格的流量和最高瀏覽數的頁面是哪一個，而 Google Search Console 可以讓我們辛苦寫作的文章出現在 Google 的搜尋結果中。設定部份網路上應該有很多教學，我這邊就不贅述了。

## 心得

整個搬遷過程大概花了我一個週末的時間，過程中遇到的問題其實都滿好解的。這樣弄下來覺得 Hugo 比 Hexo 好很多，整體架構是很清楚的。不過寫作的當下因為 Google Search Console 抓 `sitemap.xml` 的時間不是固定的，所以現在網頁在 Google 上搜尋不到，不過這只能等 Google 那邊自己更新啦。
