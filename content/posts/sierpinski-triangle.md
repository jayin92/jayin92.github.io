---
title: "有關謝爾賓斯基三角形 aka Sierpinski triangle"
description: "在上一篇文章中，我們知道Barnsley Fern與這次介紹的謝爾賓斯基三角形都是碎形。本篇文章就來介紹謝爾賓斯基三角形吧。"
date: 2018-05-10
keywords: "數學, 資訊, 謝爾賓斯基三角形, 碎形, Python"
tags: ['數學', 'Python', '碎形']
draft: false
---

## 介紹
在上一篇文章中，我們知道Barnsley Fern與這次介紹的謝爾賓斯基三角形都是碎形。

照慣例(XD)我們再次引用Wikipedia的內容

> 謝爾賓斯基三角形（英語：Sierpinski triangle）是一種碎形，由波蘭數學家謝爾賓斯基在1915年提出。它是自相似集的例子。*From Wikipedia*

我們這次所介紹的繪圖方法，維基百科把它稱作Chaos Game。也就是隨機的方法。

主要的方法如下:
1. 隨便畫個三角形(原始的謝爾賓斯基三角形為正三角形)
2. 在三角形內部隨便找一個點P
3. 從三角形三個頂點隨機找一個頂點
4. 點出點P跟選定的頂點的中點
5. 把那個中點當作新的點P
6. 重複3.

以下是執行的結果

{{<figure src="/image/Sierpinskitriangle.png">}}

可以很清楚的看到這個圖形是用點點出來的

## 程式碼介紹
這次的程式簡單到可以直接全部貼上來

```python
# import package
import turtle
import random
import math
random.seed()
# 定義三角形三頂點
pointa = (0,400)
pointb = (-650,-300)
pointc = (650,-300)
point = [pointa, pointb, pointc]
# 定義第一個點(若這個點為隨機產出一樣對產出三角形完全沒有影響)
firstpoint = (-200,250)

# 定義繪點函數(傳入tuple)
def drawdot(point, color='black'):
	turtle.penup()
	turtle.goto(point[0],point[1])
	turtle.pendown()
	turtle.dot(2, color)
# 傳入兩個點(tuple)回傳兩點中點座標(tuple)
def gohalf(point1,point2):
	point = ((point1[0] + point2[0]) / 2, ((point1[1] + point2[1]) / 2))
	return point
# turtle package init
turtle.speed(0)
turtle.delay(0)
turtle.hideturtle()
# 開始繪圖
drawdot(pointa)
drawdot(pointb)
drawdot(pointc)
drawdot(firstpoint, 'green')
# 將追蹤點定義為起始點
tracepoint = firstpoint
i = 1
#進入無限迴圈
while True:
	print(i)
	# 從point(list)隨機拿出任一個三角形頂點
	random_point = random.choice(point)
	# 產出中點座標
	gopoint = gohalf(tracepoint, random_point)
	# 描點
	drawdot(gopoint)
	# 將追蹤點定義為新產出的中點
	tracepoint = gopoint
	i += 1
turtle.exitonclick()
```
## 參考資料
https://zh.wikipedia.org/wiki/謝爾賓斯基三角形

https://www.youtube.com/watch?v=kfXl5fsVBVY (中文翻譯)

https://www.youtube.com/watch?v=kbKtFN71Lfs (原片)

## 原始碼
https://github.com/jayin92/Sierpinski-triangle

