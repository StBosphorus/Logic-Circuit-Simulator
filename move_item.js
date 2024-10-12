const setDraggable = (element) => {
    // let cursor
    let zIndex
    const draggingHandler = (e) => {
        const [isLeft, isRight] = getDirection(e.target, e.offsetX);
        const flag = getDirectionToDraw(element, isLeft, isRight);
        if (flag) return;

        const shiftX = e.target.parentNode.getBoundingClientRect().left + e.clientX - e.target.getBoundingClientRect().left
        // shiftX = 表示領域における絶対座標値(left) + ブラウザウィンドウ内でのカーソル位置 - 絶対座標値
        const shiftY = e.target.parentNode.getBoundingClientRect().top + e.clientY - e.target.getBoundingClientRect().top
        
        const setPosition = (x, y) => {
            e.target.style.left = x - shiftX + 'px'
            e.target.style.top = y - shiftY + 'px'
            LogicCircuit.moveLines(e.target, x-shiftX, y-shiftY);
        }
        const moveBox = (e) => {
            if (e.clientX > 100){
                setPosition(e.clientX, e.clientY)
            }
            // pageX/Y から clientX/Y に変更したら，行き過ぎることがなくなった
            // 2重に何かを計算した結果，座標が甚だしくなった？
        }
        const mouseUp = (e) => {
            // element.style.cursor = cursor
            element.style.zIndex = zIndex

            document.removeEventListener('mousemove', moveBox)
            e.target.removeEventListener('mouseup', mouseUp)

            element.style.cursor = 'grab'
            //これを追加したら
            element.classList.remove("dragging");
        }

        // cursor = element.style.cursor
        zIndex = element.style.zIndex
        element.style.cursor = 'grabbing'
        element.style.zIndex = 100000

        setPosition(e.clientX, e.clientY) // moveBox での変更と同じ
        document.addEventListener('mousemove', moveBox)
        e.target.addEventListener('mouseup', mouseUp)
        element.classList.add("dragging");
    }

    element.addEventListener('mousedown', draggingHandler)
    element.addEventListener('dragstart', (e)=>e.preventDefault())
    // element.addEventListener('mousedown', draw_line);
    // element.addEventListener('mouseover', mouse_over);
    element.style.cursor = 'grab';
}