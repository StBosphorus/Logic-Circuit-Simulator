const setRemovAble = (element) => {

    const dblclickHandler = (e) => {
        let line0;
        let _parentNode = e.target;
        do {
            line0 = _parentNode;
            _parentNode = line0.parentNode;
        } while (_parentNode.getAttribute("id") !== "container");
        const logicElement = 
                Array.from(LogicCircuit.allElements)
                    .find((_logicElement) => _logicElement.input1stLines.includes(line0));
        const index = logicElement.input1stLines.indexOf(line0);
        logicElement.input_array[index].lines.forEach(_lines => _lines.remove());
        logicElement.disconnect(index);
        Array.from(LogicCircuit.allElements).forEach(e => console.log(e.inputLines))
    }

    element.addEventListener('dblclick', dblclickHandler);
}