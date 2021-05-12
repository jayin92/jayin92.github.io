---
title: "從 Hexo 到 Hugo"
description: "本篇文章介紹我選擇Hugo的原因及在搬遷過程中遇到的問題及解決方法"
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

## 開始搬遷！

### 備份文章

與Hexo一樣，Hugo是使用 Markdown 作為寫作的語法，所以備份文章是整個搬遷過程中最簡單的部分了，就只要把圖片跟 Markdown 複製到其他地方就結束了。

### 安裝 Hugo

