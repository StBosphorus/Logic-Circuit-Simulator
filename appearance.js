const setButtonAppearance = (element) => {

    const clickHandler = (e) => {
        e.stopPropagation();
        const offsetX = e.offsetX;
        const offsetY = e.offsetY;
        if (offsetX<10 || 30<offsetX || offsetY<10 || 30<offsetY) return;
        
        const logicElement = LogicCircuit.lookupLogicElement(element);
        const newValue = !logicElement.outputValues[0];
        logicElement.set(newValue);
        if (newValue) {
            element.classList.remove("button_off");
            element.classList.add("button_on");
        } else {
            element.classList.remove("button_on");
            element.classList.add("button_off");
        }
    }

    element.addEventListener('click', clickHandler);
}