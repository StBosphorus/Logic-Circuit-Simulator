class LogicElement {

    static Input = function() {
        this.connectedPin = null;   // 入力側に接続している出力端子
        this.value = false;         // 入力値
        this.lines = [];            // 入力側に接続している素子との間の線
        this.sourceIndex = 0;       // connectedPinの端子番号
    }

    static Output = function(ownAddress, value=false) {
        this.ownAddress = ownAddress;   // 素子自身
        this.value = value;             // 出力値
    }

    constructor(figure) {
        this.figure = figure; // htmlのdivオブジェクト
        this.input_array;
        this.output_array;
    }

    get logicalExpressions() { // 論理式
        return [(values) => Boolean(values[0])];
    }

    get inputValues() {
        return this.input_array.map(e => e.value);
    }

    set inputValues(values) {
        this.input_array.forEach(
            (_o,_i) => _o.value = values[_i]
        );
    }

    get inputPins() {
        return this.input_array.map(e => e.connectedPin);
    }

    get inputLines() {
        return this.input_array.map(e => e.lines);
    }

    get input1stLines() {
        return this.input_array.map(e => e.lines[0]);
    }

    get outputValues() {
        return this.output_array.map(e => e.value);
    }

// setter, getter は随時追加

    connect(index, pin, lines=[]) {
        // 入力端子に指定した素子を接続
        this.input_array[index].connectedPin = pin;
        const preValue = this.inputValues[index];
        const postValue = this.input_array[index].value = pin.value;
        // console.log(`\npre:${preValue} post:${postValue}`)
        if (preValue!==postValue && LogicCircuit.compute(this)) {
            alert("ループが発生しました。")
            this.input_array[index].connectedPin = null;
            this.input_array[index].value = false;
            return true;
        } else {
            this.input_array[index].lines = [...lines];
            console.log(this.input_array[index].lines[0] === lines[0])
            setLinesColor(this);
            return false;
        }
    }

    disconnect(index) {
        this.input_array[index].lines = [];
        const connectedPin = this.inputPins[index];
        this.input_array[index].connectedPin = null;
        const preValue = this.inputValues[index];
        const postValue = this.input_array[index].value = false;
        console.log(`\npre:${preValue} post:${postValue}`)
        if (preValue!==postValue && LogicCircuit.compute(this)) {
            console.log("endless roop")
            alert("ループが発生しました。")
            this.input_array[index].connectedPin = connectedPin;
            this.input_array[index].value = preValue;
            return true;
        }
        return false;
    }
}

class Button extends LogicElement {

    constructor(figure) {
        super(figure);
        this.input_array = [new Button.Input()];
        this.output_array = [new Button.Output(this, false)];
    }

    set(value) {
        const preValue = this.inputValues[0];
        const postValue = this.input_array[0].value = Boolean(value);
        // console.log(`\npre:${preValue} post:${postValue}`)
        if (preValue!==postValue && LogicCircuit.compute(this)) {
            console.log("endless roop")
            alert("ループが発生しました。")
            this.input_array[0].value = preValue;
            return true;
        }
        return false;
    }
}

class LED extends LogicElement {

    constructor(figure) {
        super(figure);
        this.input_array = [new LED.Input()];
        this.output_array = [new LED.Output(this, false)];
    }

    get logicalExpressions() {
        return [(values) => Boolean(values[0])];
    }

    set inputValues(values) {
        this.input_array.forEach(
            (_o,_i) => _o.value = values[_i]
        );
        if (this.outputValues[0]) {
            this.figure.classList.remove("led-off");
            this.figure.classList.add("led-on");
        } else {
            this.figure.classList.remove("led-on");
            this.figure.classList.add("led-off");
        }
    }

    get inputValues() {
        return this.input_array.map(e => e.value);
    }
}

class NotGate extends LogicElement {

    constructor(figure) {
        super(figure);
        this.input_array = [new NotGate.Input()];
        this.output_array = [new NotGate.Output(this, true)];
    }

    get logicalExpressions() {
        return [(values) => Boolean(!values[0])];
    }
}

class Gate extends LogicElement {

    constructor(figure) {
        super(figure);
        this.input_array = new Array(2)
            .fill(null)
            .map(_ => new Gate.Input());
        const value = this.logicalExpressions[0]([false,false]);
        this.output_array = [new Gate.Output(this,value)];
    }
}

class AndGate extends Gate {
    get logicalExpressions() {
        return [(values) => Boolean(values[0] && values[1])];
    }
}

class OrGate extends Gate {
    get logicalExpressions() {
        return [(values) => Boolean(values[0] || values[1])];
    }
}

class NandGate extends Gate {
    get logicalExpressions() {
        return [(values) => Boolean(!(values[0] && values[1]))];
    }
}

class NorGate extends Gate {
    get logicalExpressions() {
        return [(values) => Boolean(!(values[0] || values[1]))];
    }
}

class XorGate extends Gate {
    get logicalExpressions() {
        return [(values) => Boolean(values[0] != values[1])];
    }
}


class LogicCircuit {

    static allElements = new Set();    // 全ての素子を格納
    // static queuePins1 = []; // 処理の際、出力の更新が完了していない素子を格納
    // static queuePins2 = []; // 処理の際に入力値が変化し、次周で出力の更新が必要な素子を格納

    static create(type, figure=null) {
        let element;
        switch (type) {
            case 'button':
                element = new Button(figure); break;
            case 'led':
                element = new LED(figure); break;
            case 'not_gate':
                element = new NotGate(figure); break;
            case 'and_gate':
                element = new AndGate(figure); break;
            case 'or_gate':
                element = new OrGate(figure); break;
            case 'nand_gate':
                element = new NandGate(figure); break;
            case 'nor_gate':
                element = new NorGate(figure); break;
            case 'xor_gate':
                element = new XorGate(figure); break;
        }
        this.allElements.add(element); // 参照値を追加
        return element;
    }

    static compute(firstProcessedElement) {
        // 論理回路内の素子の出力の計算
        const processedPins = [];   // 一連の計算で出力が変化した素子
        // const processedValues = [];  // processedPinsの出力値を保存
        const processedValues = new Set();  // processedPinsの出力値を保存
        const _processedElements = new Set([firstProcessedElement]);
        const queuePins = new Set();// 処理の際に入力値が変化し、次周で出力の更新が必要な素子を格納

        class Pin {
            // 処理にのみ用いる出力端子クラス
            constructor(_output, _index) {
                this.pinAddress = _output; // 出力端子のアドレス
                this.elementAddress = this.pinAddress.ownAddress;// 素子のアドレス
                this.outputValue = _output.value; // 出力値
                this.connectedElements = []; // この端子と接続する素子, memo
                this.inputValues = [...this.elementAddress.inputValues]; // 入力値
                this.updateMethod = this.elementAddress.logicalExpressions[_index]; // 出力値を計算する関数
            }
            addConnectedElements(_connectedElements) {
                const _this = this;
                function _create_connectedElements(address, index) {
                    _this.connectedElements.push({
                        elementAddress: address,// allElementsに格納される素子のアドレス
                        index: index            // このピンが格納されているinput_arrayの要素番号
                    });
                }
                _connectedElements.forEach(_e => {
                    _e.inputPins.forEach((_p, _i) => {
                        if (_p === this.pinAddress) _create_connectedElements(_e, _i);
                    });
                });
            }
            updateOwnOutputValue() {  // outputValueの更新
                const preValue = this.outputValue;
                const postValue = this.outputValue = this.updateMethod(this.inputValues);
                return preValue !=postValue;
            }
            updateInputValuesOfConnectedPins(_value=this.outputValue) {
                const _connectedPins = 
                    this.connectedElements
                        .map(_o => {
                            // 接続先の inputValues を更新
                            const _connectedPinArray = 
                            processedPins.filter(_p => _p.elementAddress===_o.elementAddress);
                            _connectedPinArray.forEach(_p => 
                                _p.inputValues[_o.index] = _value
                            );
                            return _connectedPinArray;
                        })
                        .flat();
                return _connectedPins
            }
        }

        function _createPin(_element) {
            // ある素子の出力端子に対応する出力端子クラスをつくる
            const _pins = [];
            _element.output_array.forEach((_p, _i) => {
                const _pin = new Pin(_p, _i);
                processedPins.push(_pin);
                _pins.push(_pin);
            });
            return _pins;
        }

        function* _findProcessedPins(_firstProcessedElement) {
            // processedPinsを探索し尽くす
            // Pin Object の connectedElement も作成する
            // const _processedElements = new Set([_firstProcessedElement]);
            yield _firstProcessedElement;

            function _addConnectedElements(_element,_connectedElements) {
                // 出力端子に接続する素子をPinオブジェクトの属性に追加する
                processedPins
                    .filter(_p => _p.elementAddress===_element)
                    .forEach(_p => _p.addConnectedElements(_connectedElements));
            }

            for (const _element of _processedElements) {
                // processedPinsに追加すべき出力端子を持つ素子
                const _elementsToAdd = _element.output_array.map(_o => {

                    const _connectedElements =
                        Array.from(LogicCircuit.allElements)
                            .filter(_e => _e.inputPins.includes(_o));
                    _addConnectedElements(_element,_connectedElements);
                    const _elementToAdd = _connectedElements.filter(_e => !_processedElements.has(_e));
                    _elementToAdd.forEach(_e => _processedElements.add(_e));
                    return _elementToAdd;

                }).flat()

                yield* _elementsToAdd;
            }
        }
        
        for (const _element of _findProcessedPins(firstProcessedElement)) {
            _createPin(_element);
        }
        // console.log("befor compute",processedPins,processedPins.map(p=>p.outputValue));
        function* _generateUpdatingPins(_firstProcessedElement) {
            queuePins.clear()
            yield processedPins.filter(_p => _p.elementAddress===firstProcessedElement)

            while (queuePins.size) {
                const _updatingPins = Array.from(queuePins);
                queuePins.clear();
                yield _updatingPins;
            }
            return
        }

        function _addProcessedValues() {
            const _values = processedPins.map(_p => Number(_p.outputValue)).join('');
            const _postSize = processedValues.size;
            processedValues.add(_values);
            if (processedValues.size === _postSize) return true; // ループに入ったと判定
            else return false;
        }

        // 出力値の変遷
        // let count = 0;
        for (const _updatingPins of _generateUpdatingPins(firstProcessedElement)) {
            _updatingPins
                .filter(_pin => _pin.updateOwnOutputValue())
                .forEach(_pin => {
                    const _connectedPins = _pin.updateInputValuesOfConnectedPins();
                    _connectedPins.forEach(_p => queuePins.add(_p));
                });
            // 無限ループに陥った場合
            if (_addProcessedValues()) return true;
            // console.log("count :",count,_updatingPins)
            // console.log(processedPins,processedPins.map(p=>p.outputValue));
            // count++;
        }

        // 出力値の反映
        const latestValues = Array.from(processedValues)[processedValues.size-1];
        processedPins
            .forEach((_p,_i) => {
                _p.pinAddress.value = Boolean(Number(latestValues[_i]));
                _p.elementAddress.inputValues = _p.inputValues;
            });
        _processedElements.forEach(_element => setLinesColor(_element));
        console.log(_processedElements);
        
        return false;
    }

    /**
     * @param {HTMLDivElement} element 
     * @returns {LogicElement}
     */
    static lookupLogicElement = (element) => {
        const logicElement = 
            Array.from(LogicCircuit.allElements)
                .find(_logicElement => _logicElement.figure === element);
        return logicElement;
    }

    /**
     * HTMLオブジェクトからLogicCircuit.connectを呼ぶ
     * @param {HTMLDivElement} rightElement 
     * @param {HTMLDivElement} leftElement 
     * @param {Number} rightIndex 
     * @param {Number} leftIndex 
     * @param {Array<HTMLDivElement>} lines 
     * @returns {boolean} ループに入っていたらtrue
     */
    static connect (sourceElement, targetElement, sourceIndex, targetIndex, lines) {
        const logicElement0 = this.lookupLogicElement(targetElement);
        const logicElement1 = this.lookupLogicElement(sourceElement);
        logicElement0.input_array[targetIndex].sourceIndex = sourceIndex;
        return logicElement0.connect(targetIndex, logicElement1.output_array[sourceIndex], lines);
    }

    /**
     * 
     * @param {HTMLDivElement} element 移動させるdiv
     * @param {Number} x elementのstyle.left
     * @param {Number} y elementのstyle.top
     */
    static moveLines (element, x, y) {
        const logicElement = this.lookupLogicElement(element);
        // source側
        logicElement.inputLines.forEach((_lines, i) => {
            // 線が存在しない場合
            if (!_lines.length) return;
            const [targetX, targetY] = calculateContactFromIndex(element, 0, i);
            const style = window.getComputedStyle(_lines[0]);
            const sourceX = parseInt(style.left), sourceY = parseInt(style.top);
            setLinesStyle(_lines, 0, targetX, targetY, sourceX, sourceY);
        });
        // target側
        for (const _outputPin of logicElement.output_array) {
            // _outputPinと接続する素子
            const targetElements = 
                Array.from(this.allElements).filter(_element => _element.inputPins.includes(_outputPin));
            for (const _targetElement of targetElements) {
                _targetElement.input_array.forEach((_input, i) => {
                    // 動かしている素子の右側の素子の左側の素子が動かしている素子でない場合
                    if (!logicElement.output_array.includes(_input.connectedPin)) return;
                    const [sourceX, sourceY] = 
                        calculateContactFromIndex(element, 1, _input.sourceIndex);
                    const [targetX, targetY] =
                        calculateContactFromIndex(_targetElement.figure, 0, i);
                    setLinesStyle(_input.lines, 0, targetX, targetY, sourceX, sourceY);
                });
            }
        }
    }

}


// const nand1 = LogicCircuit.create("nand",0);
// const nand2 = LogicCircuit.create("nand",1)
// const not1 = LogicCircuit.create("not",2);
// const not2 = LogicCircuit.create("not",3);
// const button1 = LogicCircuit.create("button",4);
// const button2 = LogicCircuit.create("button",5);
// const led1 = LogicCircuit.create("led",6);
// const led2 = LogicCircuit.create("led",7);

// nand1.connect(0,not1.output_array[0])
// nand2.connect(1,not2.output_array[0])
// nand1.connect(1,nand2.output_array[0])
// nand2.connect(0,nand1.output_array[0])
// not1.connect(0,button1.output_array[0])
// not2.connect(0,button2.output_array[0])
// led1.connect(0,nand1.output_array[0])
// led2.connect(0,nand2.output_array[0])


// Array(led1,led2).forEach(e=>console.log(`${e.figure} in: ${e.inputValues} out: ${e.outputValues}`))

// const startTime = performance.now();
// for (let i=0; i<100000; i++) {
//     button1.set(1);
//     button1.set(0);
// }
// const endTime = performance.now();
// console.log(`time: ${endTime-startTime}`)