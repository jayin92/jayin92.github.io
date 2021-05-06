---
title: "第一個Telegram Bot:@BikeAnywhereBot"
description: "在2019 SITCON Camp，我與隊友共同合作，開發出一個 Ubike 路徑規劃機器人"
date: 2019-08-22
tags: ["Project", "Telegram", "Python", "SITCON"]
draft: false
---

> Github Repo: [https://github.com/jayin92/UBikeAnywhereBot](https://github.com/jayin92/UBikeAnywhereBot)


## 動機
我自己有時候到外縣市遊玩或參加各種活動的時候，常常會使用Ubike當作交通工具，但因為不熟當地的地形和Ubike站點的位置，常常會需要用手機在瀏覽器和地圖之間瘋狂切換才能找到正確的站點及正確的路線，讓我十分困擾。而且在騎乘自行車時做出上述的動作更是十分危險。所以當時在SITCON夏令營時，就覺得這個需求其實蠻迫切的，所以就決定我們黑客松的主題。

## 介紹
這個Telegram Bot是我在SITCON夏令營做的一個Ubike站點路徑規劃機器人，這個機器人主要可以幫你找到離出發地和目的地最近且可用的兩個Ubike站點，並且回傳導航路線給用戶，也同時會傳送給用戶那兩個站點目前的車輛數和空位數。

<!-- more -->

## Telegram ?
> Telegram是一個跨平台的即時通訊軟體，它的用戶端是自由及開放原始碼軟體，但是它的伺服器是專有軟體。使用者可以相互交換加密與自毀訊息，傳送相片、影片等所有類型檔案。官方提供手機版（Android、iOS、Windows Phone）、電腦版（Windows、macOS、Linux）和網頁版等多種平台用戶端；同時官方開放應用程式介面，因此擁有許多第三方的用戶端可供選擇，其中多款內建中文。 *From Wikipedia*

Telegram 就是一個通訊軟體，但功能十分強大，不管是高達1.5GB的最大檔案上傳大小、優秀的群組管理功能、端對端的加密、所有聊天資料雲端備份（就不會出現某通訊軟體，換手機聊天紀錄全部消失的問題）、多設備同時登入等等…

而且更重要的是，我們可以利用官方所提供的API來建立我們自己的機器人，更棒的是，網路上已經有可以直接使用的Python Library：[https://github.com/python-telegram-bot/python-telegram-bot](python-telegram-bot)，這讓開發的過程更加容易。
## 使用
安裝Telegram後，可以利用以下網址使用我們的機器人
[https://t.me/bikeanywherebot](https://t.me/bikeanywherebot)

Bot 首先會詢問使用者的出發地及目的地（支援模糊搜尋），並利用政府所提供的PTX API取的全台Ubike站點名稱、經緯度、已停車輛、空位，再利用經緯度及已停車輛或空位算出與出發地和目的地可用且最近的Ubike站點，在將這四個位置輸入Google Maps的導航，就完成了一次操作。

更詳細的說明也可以參考我們的簡報：[https://docs.google.com/presentation/d/1lNG2SYwuUna-86FPnBUql_JN1xgufkv2j6Hai_BKe2E/edit](https://docs.google.com/presentation/d/1lNG2SYwuUna-86FPnBUql_JN1xgufkv2j6Hai_BKe2E/edit)

## Library
我們在這個專案主要用了下面幾個library:
- `telegram` (就是python-telegram-bot)
- `requests` 抓api的資料
- `json` 將json檔變成Python原生的字典
- `configparser` 讀取config.ini

## API
我們在這個project主要用到了兩個API，一個是Google的Firebase，用來生成Dynamic Link。還有一個是政府的PTX(Public Transport Data eXchange)平台，用來查詢Ubike的站點位置，即時的車輛數等等…

我們一開始並沒有找到PTX這個整合性的平台，而是先找到了各縣市的Ubike開放資料，而且並不是每個縣市的資料開放平台都有Ubike的資料。這讓我們很困擾，因為我們要花很多時間處理各個縣市不統一的資料形式，而且還要申請不同縣市資料平台的API Key。但幸好後來有一位小隊員找到政府的PTX平台，上面有所有擁有公共自行車站點的縣市的資料，而且只需要一個API Key，這讓資料的取得相當的方便。

我們的導航網址是利用網址分析的方式產出的，格式大概長這樣：
[https://www.google.com/maps/dir/?api=1&origin=海洋大學&destination=臺灣大學&waypoints=臺北動物園|臺北101&travelmode=driving](https://www.google.com/maps/dir/?api=1&origin=海洋大學&destination=臺灣大學&waypoints=臺北動物園|臺北101&travelmode=driving)
- origin: 起點 (可以是座標、地點名稱、Google的placeID)
- destination: 終點 (可以是座標、地點名稱、Google的placeID)
- waypoints: 中途點 (格式與上面相同，中途點間用`|`分隔)
- travelmode: 導航模式 (driving, walking, motorcycling, etc...)
所以上面那段網址點進去後，會出現Google Maps的導航畫面，路線是 **海洋大學 -> 臺北動物園 -> 臺北101 -> 臺灣大學** 而導航模式是開車。

可以發現，這串網址如果直接發給用戶會相當的難看，而且並不會直接導向到Google Maps的APP，當我試著用各家的縮網址服務時，隊友找到了一個叫Dynamic Link的東西。Dynamic Link是一個由Google Firebase提供的服務，它不僅可以縮網址，而且網址的域名還是自訂的([https://bikeanywhere.page.link](https://bikeanywhere.page.link))，更強的是，它可以自動導向到Google Maps的APP，用戶不用再做其他的動作，這東西簡直就是完美。

## 開發
我們大概從營隊第四天才開始做開發的動作ㄅ，前面都在收集資料。而且我們在第三天的晚上才開始教python-telegram-bot這個library怎麼使用的，因為我真的很怕我們的專案做不出來QQ。所以我大概花了一個小時就把後面的投影片看了一下，把講師的練習做一做，就直接開始試做了。但因為那時候連後端都還沒開始寫，所以只是先熟悉一下library的語法和研究一下webhook(到最後還是沒用)。

後來第四天晚上，我們全組才正式開始做UbikeAnywhereBot，我和另外一位同學負責後端，我做PTX的部份，他做Google Maps，我的工作就是將Ubike站點的資料包裝成一個容易使用的函數，和把整個後端整合起來。這邊可以提一下，我們機器人不是有一個部份是搜尋最近的站點ㄇ，其實那個部份我是用爆搜的，因為分析了一下全台站點數並沒有很多(1747)，用經緯度算距離也不是一件很難的事情。最後證明我是對的，整個爆搜的時間小到可以忽略。後端整個做完大概花了我和另一個隊員一個半小時ㄅ，正當我們以為今天晚上不用熬夜的時候，我們發現前端的分工似乎有點問題，進度有點緩慢，所以我就莫名其妙跳到前端了，後來直接熬夜把整個程式在8個小時硬幹出來(python-telegram-bot那個Handler真的很煩，沒把它remove掉竟然會衝突= =)到了星期五早上就是瘋狂的修bug，解決各個用戶會打架的問題(user_data超棒)，雖然到最後demo的時候還是有點小爆炸，但整體我還是很滿意拉嘻嘻。

## 心得
原本想說用個黑客松應該會學到專案分工，但好像還是沒有分到什麼工QQ，但這次程式開發的經驗真的讓我了解到什麼叫跟時間賽跑，我從來沒有打code打到凌晨3點，早上7點起來繼續的經驗。而且做出來的成品是真的可以用的，就真的非常非常有成就感，期望以後還有機會體驗到這種開發的經驗。




