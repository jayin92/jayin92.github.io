---
title: In Between：在 ETH Computer Graphics 課程中從零打造 Physically-Based Renderer
date: 2026-07-19T12:00:00+08:00
description: 在 ETH Zürich 交換期間完成的 Physically-Based Renderer
tags:
  - ETH
  - Computer Graphics
  - Rendering
  - 交換
draft: false
outline: true
tldr: 在 ETH 修 Computer Graphics 時，以課程的 Nori 2 框架為基礎，實作了一個支援 Heterogeneous Participating Media Rendering, Equiangular Sampling 和 Environment Map Emitter 等功能的物理式渲染器，並以「In Between」為主題渲染出期末作品。
---

這篇 blog post 主要是想要講一下當初[在 ETH Zürich 交換](/posts/eth/)的時候，修了 Computer Graphics 這門課的時候做的 Physically-Based Renderer。

Computer Graphics 這堂課規劃的很好，會讓學生在一學期內，以課程提供的教育用光線追蹤框架 [Nori 2](https://graphics.ethz.ch/teaching/cg24/nori.php) 為基礎，透過四次的個人作業和最後的 final project，一步一步用 C++ 實作出一個完整的 physically-based renderer。期末專題則是課程的重頭戲：除了要自行擴充渲染器的功能之外，還要用自己寫的渲染器，根據當年公布的主題渲染出一張參加 rendering competition 的作品！

這個專題是我和那時候認識的王瑋學姊兩人一起完成的。從功能分工、場景建模到最後熬夜調參數還有渲染，這個作品是兩個人共同努力的成果，在這裡特別感謝王瑋學姊。

## 最終作品：In Between

當年的競賽主題是「In Between」。那時候剛好跟朋友一起去冰島玩了兩個禮拜，有去到 [Seljalandsfoss](https://zh.wikipedia.org/zh-tw/%E5%A1%9E%E5%88%A9%E4%BA%9A%E5%85%B0%E7%80%91%E5%B8%83) 這個瀑布，覺得從瀑布裡面的洞穴看出去的感覺滿符合「In Between」這個主題，我們那時候的想法是捕捉「從已知走向未知」的瞬間：場景由洞穴向平原過渡，瀑布像一道天然的簾幕，將觀者置於冒險的關鍵時刻，然後黎明的光線同時帶有黑暗與光明的雙重象徵，水霧則讓兩個世界之間有了連續的過渡。而且那時候想要實作 heterogeneous participating media，然後瀑布就剛好很適合當作測試的對象（雖然最後最滿意的是左上角的雲 XD，那個不是 environment map 是貨真價實 render 出來的嘿嘿）。

{{<figure src="/image/eth-cg24-final-project/final.webp" title="最終渲染結果：In Between">}}

## 我們實作了哪些功能

期末專題的評分方式是從一張功能清單中選擇要實作的項目，每個功能都需要附上實作說明與驗證(例如和 Mitsuba 的渲染結果比對)。我們的分工如下：

**我那時候主要**負責了下面這幾個：

- Directional Light：平行光光源
- Henyey-Greenstein Phase Function：各向異性相位函數
- Windowed Sinc Filter：額外的影像重建濾波器
- 場景建模：最終場景的 mesh 建模
- Heterogeneous Participating Media：非均質參與介質(雲、霧的體積渲染)
- Equiangular Sampling：針對單次散射的等角取樣
- Environment Map Emitter：環境貼圖光源

我覺得最難的功能是 Heterogeneous Participating Media 那個功能我記得我應該看了三四篇 paper 和網路上的教學才弄出來，那時候的 coding agent 還沒強到可以完成這種 task QQ。但我猜現在肯定是可以的，但自己用手刻出來還是很有成就感而且學到很多東西！

## 完整報告與簡報

完整的期末報告包含每個功能的實作細節、驗證比較（有互動式的 before/after 比較滑桿，可以直接拉動比較），有興趣的話可以在這裡閱讀：

[**Computer Graphics Final Project Report**](/eth-cg24/project/)

另外這是我們當時在 rendering competition 上 presentation 用的簡報，裡面有每個功能的重點整理和渲染結果：

[**Rendering Competition Presentation 簡報 (PDF)**](/eth-cg24/rendering-competition-slides.pdf)

可惜因為 ETH 規定專題的原始碼不能公開，所以沒辦法分享給大家看，但報告本身是可以公開的。如果你對課程本身或申請交換有興趣，也可以看看我之前寫的[交換申請心得](/posts/nycu-cs-eth-exchange/)還有[交換期間的學習心得](/posts/eth/)。
