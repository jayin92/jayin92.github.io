---
title: "從 Hexo 到 Hugo"
description: "本篇文章介紹我選擇Hugo的原因及從Hexo搬遷到Hugo過程中遇到的問題及解決方法"
date: 2021-05-12T22:28:44+08:00
tags: [資訊]
tldr: Hugo 很棒
draft: true
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


## 選擇主題

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

## LaTex 支援

## 透過 Github Page 和 Travis CI 自動部屬


## Google Analytics


## Google Search Console

## 心得
