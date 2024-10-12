const setDrawAble = (element) => {

    const drawingHandler = (e) => {
        const [isLeft, isRight] = getDirection(e.target, e.offsetX);
        const flag = getDirectionToDraw(element, isLeft, isRight);
        if (!(flag)) return;

        // 線に関する変数 [x,y,x,y,x]
        const lines = new Array(5)
            .fill(null)
            .map(_ => document.createElement("div"));
        lines.forEach((_line, _index) => {
            _line.classList.add( _index%2? 'yline':'xline', 'power_off' );
            if (_index<3) _line.style.visibility = 'visible';
            _line.style.position = 'absolute';
            if (_index) lines[_index-1].appendChild(_line);
        });
        container.appendChild(lines[0])

        element.classList.add("drawing");
        const [x, y, index] = calculateContactFromY(element, isRight, e.offsetY);
        console.log(x,y);

        let targetIndex = 0;
        const createLine = (e) => {
            const targetElement = document.querySelector('.over');
            let targetX, targetY;
            if (targetElement === null || targetElement === element){
                targetX = e.clientX - body.getBoundingClientRect().left;
                targetY = e.clientY - body.getBoundingClientRect().top;
            } else {
                const [isToLeft, isToRight] = getDirection(targetElement, e.offsetX);
                console.log(getDirectionToDraw(element, isLeft, isRight), getDirectionToDraw(targetElement, isToLeft, isToRight));
                if (!getDirectionToDraw(element, isLeft, isRight) || !getDirectionToDraw(targetElement, isToLeft, isToRight)) {
                    console.log('log')
                    targetX = e.clientX - body.getBoundingClientRect().left;
                    targetY = e.clientY - body.getBoundingClientRect().top;
                } else if (isLeft && isToRight) {
                    // 出力端子から入力端子へ
                    [targetX, targetY, targetIndex] = calculateContactFromY(targetElement, 1, e.offsetY);
                } else if (isRight && isToLeft) {
                    // 入力端子から出力端子へ
                    [targetX, targetY, targetIndex] = calculateContactFromY(targetElement, 0, e.offsetY);
                } else {
                    targetX = e.clientX - body.getBoundingClientRect().left;
                    targetY = e.clientY - body.getBoundingClientRect().top;
                }
            }
            setLinesStyle(lines, isRight, x, y, targetX, targetY);
        };

        const mouseUp = (e) => {
            const targetElement = document.querySelector('.over');
            if (targetElement===null || targetElement===element) {
                // どの素子とも接触してない場合
                lines.forEach(_line => _line.remove());
            } else {
                const point_array = targetElement.getAttribute("id").split(' ').map(e => parseInt(e));
                console.log(point_array)
                const [isToLeft, isToRight] = getDirection(targetElement, point_array[0]);
                console.log(targetElement, isToRight, isToLeft)
                if (!getDirectionToDraw(element, isLeft, isRight) || !getDirectionToDraw(targetElement, isToLeft, isToRight)) {
                    lines.forEach(_line => _line.remove());
                } else if (isLeft && isToRight && !LogicCircuit.connect(targetElement, element, targetIndex, index, lines)) {
                    // lines.forEach(_line => setRemovAble(_line));
                    setRemovAble(lines[0]);
                }
                else if (isRight && isToLeft && !LogicCircuit.connect(element, targetElement, index, targetIndex, lines)) {
                    // lines.forEach(_line => setRemovAble(_line));
                    setRemovAble(lines[0]);
                }
                else lines.forEach(_line => _line.remove());
                console.log(LogicCircuit.allElements)
            }

            container.style.cursor = 'auto';
            document.removeEventListener('mouseup', mouseUp);
            document.removeEventListener('mousemove', createLine);
            element.classList.remove("drawing");
        };
        
        container.style.cursor = 'pointer';
        document.addEventListener('mouseup', mouseUp);
        document.addEventListener('mousemove', createLine);
    };

    element.addEventListener('mousedown', drawingHandler);
};


const setNotifiable = (element) => {

    const mouseOver = (e) => {
        // 線の接続, マウスカーソルの変更に使用

        const mouseLeave = (e) => {
            e.target.classList.remove("over");
            e.target.removeAttribute("id");
            e.target.removeEventListener('mouseleave', mouseLeave);
        };

        const mouseMove = (e) => {
            if (document.querySelector('.dragging') !== null)
                return;
            e.target.setAttribute("id", e.offsetX + " " + e.offsetY);
            const [isLeft, isRight] = getDirection(e.target, e.offsetX);
            const flag = getDirectionToDraw(element, isLeft, isRight);
            if (flag || document.querySelector('.drawing') !== null){
                // 左右の端に触れた、又は線を引いている最中に触れたら
                e.target.style.cursor = 'pointer';
            }else{
                e.target.style.cursor = 'grab';
            }
        };

        e.target.classList.add("over");
        e.target.addEventListener('mouseleave', mouseLeave);
        e.target.addEventListener('mousemove', mouseMove);
    };

    element.addEventListener('mouseover', mouseOver);
};


/**
 * 接点が素子の右端か左端かを判断する
 * @param {HTMLDivElement} element 素子オブジェクト
 * @param {Number} x
 * @returns {Array<boolean,boolean>}
 */
const getDirection = (element, x) => {
    const isLeft = x < 10;
    const isRight = parseInt(window.getComputedStyle(element).width)-10 < x;
    return [isLeft, isRight];
};

/**
 * isRight, _offsetY から接点の座標を計算する
 * @param {HTMLDivElement} element 素子オブジェクト
 * @param {boolean} isRight
 * @param {Number} _offsetY element内部のカーソル位置
 */
const calculateContactFromY = (element, isRight, _offsetY) => {
    const type = element.className.split(' ', 2)[1];
    let index;
    switch (type) {
        case 'gate':
            if (isRight) index = 0;
            else index = _offsetY<20? 0:1;
            break;
        default: index = 0;
    }
    const [x, y] = calculateContactFromIndex(element, isRight, index, type);
    return [x, y, index];
};


/**
 * isRight, _offsetY から接点の座標を計算する
 * @param {HTMLDivElement} element 素子オブジェクト
 * @param {boolean} isRight
 * @param {Number} index 端子の要素番号
 */
const calculateContactFromIndex = (element, isRight, index, type=false) => {
    if (!type) type = element.className.split(' ', 2)[1];
    const style = window.getComputedStyle(element);
    let x, y;
    switch (type) {
        case 'button_item':
            if (isRight) x = parseInt(style.left) + 40;
            y = parseInt(style.top) + 20;
        case 'led_item':
            if (!isRight) x = parseInt(style.left);
            y = parseInt(style.top) + 20;
        case 'notGate':
            if (isRight) x = parseInt(style.left) + parseInt(style.width);
            else x = parseInt(style.left);
            y = parseInt(style.top) + 17.5;
            break;
        case 'gate':
            if (isRight) {
                x = parseInt(style.left) + parseInt(style.width);
                y = parseInt(style.top) + 20;
            } else {
                x = parseInt(style.left);
                y = parseInt(style.top) + (index? 30:10);
            }
            break;
        default: x = y = 0;
    }
    return [x, y];
}


/**
 * 指定した座標を元に線を描画する
 * @param {Array.<HTMLDivElement>} lines 線オブジェクト
 * @param {boolean} isRight 出力側から線を引いているか否か
 */
const setLinesStyle = (lines, isRight, ownX, ownY, targetX, targetY) => {
    if (!isRight) {
        let temp = ownX;
        ownX = targetX;
        targetX = temp;
        temp = ownY;
        ownY = targetY;
        targetY = temp;
    }
    const setLeft = (values) => {
        values.forEach((v,i) => lines[i].style.left = v + 'px');
    };
    const setTop = (values) => {
        values.forEach((v,i) => lines[i].style.top = v + 'px');
    };
    const setLength = (values) => {
        values.forEach((v,i) => {
            if (i%2) lines[i].style.height = v + 'px';
            else lines[i].style.width = v + 'px';
        });
    };
    
    const deltaX = targetX - ownX;
    if (deltaX > 20) {
        // 要素を3つ使用
        lines.filter((_, i) => i>2).forEach(e => e.style.visibility = 'hidden');
        const width = deltaX / 2;
        const deltaY = targetY - ownY;
        setLeft([ownX, width, 0]);
        if (deltaY<0) setTop([ownY, deltaY, 0]);
        else setTop([ownY, 0, deltaY]);
        setLength([width, Math.abs(deltaY), width]);
    }
    else {
        // 要素を5つ使用
        lines.filter((_, i) => i>2).forEach(e => e.style.visibility = 'visible');
        const halfDeltaY = (targetY - ownY) / 2;
        const height = Math.abs(halfDeltaY);
        setLeft([ownX, 10, deltaX-20, 0, 0]);
        if (halfDeltaY<0) setTop([ownY, halfDeltaY, 0, halfDeltaY, 0]);
        else setTop([ownY, 0, halfDeltaY, 0, halfDeltaY]);
        setLength([10, height, 20-deltaX, height, 10]);
    }
}


/**
 * linesを指定しない場合、elementの入力側を自動設定
 * @param {LogicElement} targetElement 素子
 * @param {Array.<HTMLDivElement>} lines 線オブジェクト
 */
const setLinesColor = (targetElement, targetLines=false) => {
    // elementに対応する素子を探索、linesの色を出力に合わせて変える
    for (const _input of targetElement.input_array) {
        const [class_add, class_remove] = _input.value?
            ["power_on","power_off"]:["power_off","power_on"];
        _input.lines.forEach(_line => {
            _line.classList.add(class_add);
            _line.classList.remove(class_remove);
        });
    }
}


/**
 * 
 * @param {HTMLDivElement} element 
 * @param {boolean} isLeft 
 * @param {boolean} isRight 
 * @returns 
 */
const getDirectionToDraw = (element, isLeft, isRight) => {
    const type = element.className.split(' ', 2)[1];
    let flag;
    switch (type) {
        case 'button_item':
            flag = isRight;
            break;
        case 'led_item':
            flag = isLeft;
            break;
        default:
            flag = isLeft || isRight;
    }
    return flag;
}