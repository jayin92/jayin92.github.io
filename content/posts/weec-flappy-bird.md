---
title: "搞什麼飛雞補充教材 | 陽明交大探索體驗營"
date: 2023-01-29T13:03:32+08:00
description: "探索體驗營教案補充教材"
tags: [NYCU, Processing]
outline: true
draft: false
---
## 前言

因為這次上課的時間比較短，沒有辦法把 Flappy Bird 裡面用到的語法全部教給大家，所以我把比較進階的概念放在補充教材中，有興趣的人可以看看，主要是陣列、for 迴圈和類別。

另外我也在最前面放了 Processing 中一些比較常用的函數和它們的用法，裡面也有一些小範例。如果寫到一半忘記語法也可以在這邊找一下，但鼓勵大家直接看 Processing 官方的參考文件，我覺得英文不會太難，可以嘗試一下。裡面寫的也比較完整一點。

## 上課教材
- [Github 程式碼](https://github.com/jayin92/twyc-winter-camp)
- [簡報](https://slides.com/jayinnn_nycu/winter_camp)
- [Processing 官方參考文件](https://processing.org/reference)
- [補充教材](https://jayin92.github.io/posts/weec-flappy-bird/)

## 常用函數
### `background()`

用來設定畫面背景，參數可以為 r, g, b 也可以為圖片 (PImage)。

### `rect()`
用來繪製長方形。

`rect(a, b, c, d)`。其中 `(a, b)` 為長方形的位置座標，具體為左上角座標或是中央座標則由 `rectMode` 設定的值為準。

`(c, d)` 則為長方形的長和寬。

### `rectMode()`
設定 `rect()` 函數中，`a, b` 代表的位置。

可以為 `rectMode(CORNER)` 或 `rectMode(CENTER)`。

- `CORNER`: 代表左上角位置
- `CENTER`: 代表中央位置

具體程式範例如下：
```java
size(400, 400);
rectMode(CORNER);  // Default rectMode is CORNER
fill(255);  // Set fill to white
rect(100, 100, 200, 200);  // Draw white rect using CORNER mode

rectMode(CENTER);  // Set rectMode to CENTER
fill(100);  // Set fill to gray
rect(200, 200, 120, 120);  // Draw gray rect using CENTER mode
```

![](/image/rectMode.png)

### `line()`

用來繪製直線。

`line(a, b, c, d)`。其中 `(a, b)` 為直線的第一個點，`(c, d)` 為直線的第二個點。

線的寬度及顏色分別由 `strokeWeight()` 和 `stroke()` 控制。

### `stroke()`

控制直線 (line) 及圖形的外框顏色。

- `stroke(r, g, b)`。`r, g, b` 分別代表紅、綠、藍，都必須介於 0 和 255 之間。
- `stroke(grayscale)`。`grayscale` 代表灰階度。0 為黑色、255 為白色。

### `strokeWeight()`

控制直線 (line) 及圖形的外框粗度。

`strokeWeight(w)`。`w` 代表線的寬度，單位為 pixel。

### `fill()`

控制圖形的填充顏色。

- `fill(r, g, b)`。`r, g, b` 分別代表紅、綠、藍，都必須介於 0 和 255 之間。
- `fill(grayscale)`。`grayscale` 代表灰階度。0 為黑色、255 為白色。

```java
void draw(){
  size(400, 400);
  fill(204, 102, 0);
  rect(120, 80, 220, 220);
}
```

![](/image/fill.png)

### `noFill()`

圖形內不填充任何顏色。

直接呼叫 `noFill()` 即可。

```java
void setup(){
   size(400, 400);
}
void draw(){
  rect(60, 40, 220, 220);
  noFill();
  rect(120, 80, 220, 220);
}
```

![](/image/noFill.png)


### `PImage`

用來存放圖片的物件，可以想成一種資料型態。

配合 `loadImage()` 一起使用。

### `loadImage()`

讀取圖片，並將圖片儲存於 `PImage` 中。

### `image()`

將 PImage 的圖片繪製在畫面上。

- `image(img, a, b, c, d)`。`img` 為 `PImage` 物件。`(a, b)` 為圖片座標，此座標代表左上角或是中間位置是由 `imageMode()` 決定。`(c, d)` 為圖片的長和寬。

### `imageMode()`

設定 `image()` 函數中的 `(a, b)` 代表甚麼位置。

可以為 `imageMode(CORNER)` 或 `imageMode(CENTER)`。

- `CORNER`: 代表左上角位置
- `CENTER`: 代表中央位置

## 陣列 (Array) 和 for 迴圈

在課堂中，我們寫了一個小畫家，可以做到畫出線條和擦掉筆畫的功能。那如果我們想要將滑鼠的鼠標換成像小畫家一樣的十字應該怎麼寫呢？

有人可能覺得，簡單，那就畫兩條線，讓這兩條線的中央位置落在 `(mouseX, mouseY)` 就好了。如果這樣寫的話，程式碼大概會長下面這樣：

```java
void setup(){
  size(800, 600);
  background(255, 255, 255); // R, G, B
  stroke(0, 0, 0); // R, G, B
  strokeWeight(4); // 寬度
  noCursor(); // 不顯示滑鼠鼠標
}

void draw(){
  if(mousePressed && mouseButton == LEFT){
    strokeWeight(4);
    stroke(0, 0, 0);
    line(pmouseX, pmouseY, mouseX, mouseY);
  } else if(mousePressed && mouseButton == RIGHT){
    stroke(255, 255, 255);
    strokeWeight(20);
    line(pmouseX, pmouseY, mouseX, mouseY);
  }
  strokeWeight(2);
  line(mouseX - 10, mouseY, mouseX + 10, mouseY);
  line(mouseX, mouseY - 10, mouseX, mouseY + 10);
}
```

可以試試看把上面這段程式碼複製到 Processing 中，看看會發生什麼事。

會發現畫面變成了這樣：

![](/image/paint_cursor_wrong.png)

可以發現雖然十字確實有顯示在畫面上，但因為畫面沒有清空的關係，所以一旦十字顯示在畫面上，就不會消失了。這當然不是我們預期的結果。所以有些人可能又想，或許我可以每次都把畫面清空。於是程式碼變成下面這樣：

```java
void setup(){
  size(800, 600);
  background(255, 255, 255); // R, G, B
  stroke(0, 0, 0); // R, G, B
  strokeWeight(4); // 寬度
  noCursor(); // 不顯示滑鼠鼠標
}

void draw(){
  background(255, 255, 255); // R, G, B
  if(mousePressed && mouseButton == LEFT){
    strokeWeight(4);
    stroke(0, 0, 0);
    line(pmouseX, pmouseY, mouseX, mouseY);
  } else if(mousePressed && mouseButton == RIGHT){
    stroke(255, 255, 255);
    strokeWeight(20);
    line(pmouseX, pmouseY, mouseX, mouseY);
  }
  strokeWeight(2);
  line(mouseX - 10, mouseY, mouseX + 10, mouseY);
  line(mouseX, mouseY - 10, mouseX, mouseY + 10);
}
```

執行上面的 code 會發現雖然十字會跟著滑鼠跑了，且不會重複顯示了。但如果要畫線的話，會因為每次畫面都會清空的關係，讓我們畫的線沒辦法保留在畫面上。

所以，這時候要怎麼辦呢？

沒錯，我們可以把滑鼠經過的坐標的存下來，在畫面被清空後，就利用這些「歷史紀錄」把畫面重新畫出來。

但滑鼠經過的坐標非常多，可能多達上萬個點，一個座標需要兩個變數才可以存起來，這樣是要宣告 10000 個變數，從 `int x1` 到 `int x10000` 和 `int y1` 到 `int y10000` 嗎？

不用，我們可以利用所有程式語言都有的結構：陣列！

### 陣列？

如果我們想要宣告五個整數變數，在不使用陣列的情況下，可以寫成這樣：

![](/image/array1.png)

現在只有五個變數，但如果我們需要 10000 個整數變數，不可能寫成 10000 行，這樣太累了。所以這時候 **陣列** 就派上用場了：

![](/image/array2.png)

在 Processing 中，陣列宣告的方式長下面這樣：

![](/image/array3.png)

值得注意的是，我們可以用方括弧 `[]` 來拿到陣列中的變數，像在上面的例子中，`x[0]` 就是陣列中第一個整數、`x[1]` 就是第二個，以此類推 `x[i]` 就是第 `i+1` 個整數。

### for 迴圈

陣列很常搭配 for 迴圈一起使用，下面是 for 迴圈的語法：

![](/image/for.png)

結合剛剛的陣列，通常的使用方法長這樣：

```java
void setup() {
  int[] x = {1, 2, 3, 4, 5}; // 另一種宣告陣列的方法
  // 利用 x.length 可以達到陣列中的變數數量
  for(int i=0;i<x.length;i++){
    println(x[i]);
  }
}

void draw(){
  // pass
}
```

### 把東西拼起來吧！
有了上面的知識，我們現在可以宣告四個陣列，分別儲存 `pmouseX`, `pmouseY`, `mouseX`, `mouseY` 四個變數的歷史紀錄，程式碼長下面這樣：

```java
int[] px = new int[10000];
int[] py = new int[10000];
int[] x = new int[10000];
int[] y = new int[10000];
int idx = 0;

void setup(){
  size(800, 600);
  background(255, 255, 255); // R, G, B
  stroke(0, 0, 0); // R, G, B
  strokeWeight(5); // 寬度
  noFill();
  noCursor();
}

void draw(){
  background(255, 255, 255); // R, G, B
  if(mousePressed){
    px[idx] = pmouseX;
    py[idx] = pmouseY;
    x[idx] = mouseX;
    y[idx] = mouseY;
    idx = idx + 1;
  }
  for(int i = 0; i < idx; i++) {
    strokeWeight(5);
    line(px[i], py[i], x[i], y[i]);
  }
  strokeWeight(2);
  line(mouseX - 10, mouseY, mouseX + 10, mouseY);
  line(mouseX, mouseY - 10, mouseX, mouseY + 10);
}
```

可以發現這段程式碼沒有橡皮擦的功能，有興趣的人可以試著實做看看。

## 類別 Class

Processing 其實核心是使用 Java 來撰寫，Processing 的程式碼會先轉成 Java 的程式碼，再交由 Java 來編譯成執行檔。

而 Java 是一個高度物件導向 (Object-Oriented) 的程式語言，基本上所有變數都可以視為一個物件 (Object)。

那在 Processing 中，創造一個新的物件的方式是利用 `class` 這個關鍵字。

而在一個物件中，我們會有很多成員 (Member)，這些成員可以是變數、物件或是函數，如下面的程式碼：

```java
class bird {
    float xPos;
    void move() {
        xPos = xPos - 10;
    }
}
```

`xPos` 這個小數型態的變數就是一個成員變數 (member variable)。而 `void move()` 就是一個成員函數 (member function)，成員函數可以自由修改成員變數和物件。

而在物件中有一個很特別的存在，建構子 (constructor)。建構子是一個用來新建物件的類似函數的存在，但其和函數的宣告方法不太一樣：

```java
class bird {
    float xPos;
    void move() {
        xPos = xPos - 10;
    }
    bird(float init_xPos){
        xPos = init_xPos;
    }
}
```

那個 `bird(float init_xPos)` 就是建構子，值得注意的是，它不用寫回傳的變數型態，所以和一般的函數不一樣。

我們在宣告物件的時候，就可以利用建構子新建物件，像下面這樣：

```java
class bird {
    float xPos;
    void move() {
        xPos = xPos - 10;
    }
    bird(float init_xPos){
        xPos = init_xPos;
    }
}

bird b = new bird(100);
```

那如果我們要在外界 (也就是非 class 的定義範圍內) 呼叫一個函數或改變一個函數的值，我們可以使用 `.` 這個符號：

```java
class bird {
    float xPos;
    void move() {
        xPos = xPos - 10;
    }
    bird(float init_xPos){
        xPos = init_xPos;
    }
}

bird b = new bird(100);

b.xPos = 1000;
b.move();
```

