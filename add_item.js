// アイテムのリストを取得
const sidebar_items = [...document.querySelectorAll(".sidebar_item")];
const container = document.getElementById("container");
const body = document.body;


// ドラッグ開始イベントを定義
const handleDragStart = (e) => {
    e.target.classList.add("dragging");
    // ドラッグ開始時のoffsetをidとして保持
    e.target.setAttribute("id", e.offsetX + " " + e.offsetY);
};

// ドラッグ終了イベントを定義
const handleDragEnd = (e) => {
    e.target.classList.remove("dragging");
    e.target.removeAttribute("id");
};

// 要素が重なった際のブラウザ既定の処理を変更
const handleDragOver = (e) => e.preventDefault();

// 要素がドロップされた際のイベントを定義
const handleDrop = (e) => {
    // 要素がドロップされた際のブラウザ既定の処理を変更
    e.preventDefault();
    // 要素の生成
    const newElement = document.createElement("div");
    const originalElement = document.querySelector('.dragging');
    // クラスの追加 // class名の第1要素に素子名がある
    const classNames = originalElement.className.split(' ', 2);
    newElement.classList.add(...classNames);
    console.log(newElement.className)
    document.getElementById("container").appendChild(newElement);
    newElement.style.position = 'absolute';
    // イベントを登録
    setDraggable(newElement);
    setDrawAble(newElement);
    setNotifiable(newElement);
    switch (classNames[0]) {
        case 'button':
            newElement.classList.add("button_off");
            setButtonAppearance(newElement);
            break;
        case 'led':
            newElement.classList.add("led-off");
            break;
    }
    // 座標計算
    const point_array = originalElement.getAttribute("id").split(' ');
    newElement.style.left = e.clientX - point_array[0] - e.target.parentNode.getBoundingClientRect().left + 'px';
    newElement.style.top = e.clientY - point_array[1] - e.target.parentNode.getBoundingClientRect().top + 'px';
    // allElement に追加
    console.log(newElement);
    console.log(classNames[0])
    LogicCircuit.create(classNames[0], newElement);
    console.log(LogicCircuit.allElements)
};


// アイテムにイベントを登録
for (const i of sidebar_items) {
    i.addEventListener("dragstart", handleDragStart, false);
    i.addEventListener("dragend", handleDragEnd, false);
    i.style.position = 'relative';
}

container.addEventListener("dragover", handleDragOver, false);
container.addEventListener("drop", handleDrop, false);