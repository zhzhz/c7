import {Component} from './_component'
import {ImeComponent} from './ime-component'

export class InputComponent extends Component {
    constructor(component, context) {
        super(component, context)
        this.imeConfig = {
            active: false,
            x: 0,
            y: 0,
        }
        this.imeEvent = null
        this.ime = new ImeComponent(component, context, this.imeConfig, (value) => {
            this.imeEvent = value
        })
        this.showImeToast = false
        this.focus = false
        this.array = []
        this.index = -1
        this.selecting = false
        this.selected = { start: -1, end: -1 }
        this.borderColor = '#dcdfe6'
        this.caretColor = 'black'
        this.registerEvent()
        this.caretBlink()
    }

    get value() {
        return this.array.join('')
    }

    get selectedValue() {
        let start = Math.min(this.selected.start, this.selected.end)
        let end = Math.max(this.selected.start, this.selected.end) + 1
        return this.value.slice(start, end)
    }

    get startPosition() {
        return this.layout.left + 15
    }

    get endPosition() {
        this.context.font = '14px sans-serif'
        let width = this.context.measureText(this.value).width
        return this.startPosition + width
    }

    get caretPosition() {
        this.context.font = '14px sans-serif'
        let width = this.context.measureText(this.array.slice(0, this.index + 1).join('')).width
        let result = this.startPosition + width
        this.imeConfig.x = result - 15
        this.imeConfig.y = this.layout.bottom
        return result
    }

    setBox() {
        this.style['width'] = this.style['width'] ?? {
            value: '180px',
        }
        this.style['height'] = {
            value: '40px',
        }
    }

    registerEvent() {
        this.hover(() => {
            if (!this.focus) {
                this.borderColor = '#c0c4cc'
            }
            document.body.style.cursor = 'text'
        }, () => {
            if (!this.focus) {
                this.borderColor = '#dcdfe6'
            }
        })
        this.click((event) => {
            this.focus = true
            this.borderColor = '#409eff'
            // ????????????????????????
            if (event.clientX <= this.startPosition) {
                this.index = -1
            } else if (event.clientX >= this.endPosition) {
                this.index = this.value.length - 1
            } else {
                for (let i = 1; i < this.value.length; i++) {
                    let width = this.context.measureText(this.value.slice(0, i)).width
                    if (Math.abs(this.startPosition + width - event.clientX) < 7) {
                        this.index = i
                        break
                    }
                }
            }
        })
        this.dblclick(() => {
            this.selected = { start: 0, end: this.array.length - 1}
        })
        this.mousedown((event) => {
            this.selecting = true
            this.selected = { start: -1, end: -1 }
            if (event.clientX <= this.startPosition) {
                this.selected.start = 0
            } else if (event.clientX >= this.endPosition) {
                this.selected.start = this.value.length -  1
            } else {
                for (let i = 1; i < this.value.length; i++) {
                    let width = this.context.measureText(this.value.slice(0, i)).width
                    if (Math.abs(this.startPosition + width - event.clientX) < 7) {
                        this.selected.start = i
                        break
                    }
                }
            }
        })
        this.mousemove((event) => {
            if (this.selecting) {
                if (event.clientX <= this.startPosition) {
                    if (this.selected.start > 0) {
                        this.selected.end = 0
                    }
                } else if (event.clientX >= this.endPosition) {
                    if (this.selected.start < this.value.length -  1) {
                        this.selected.end = this.value.length - 1
                    }
                } else {
                    for (let i = 1; i < this.value.length; i++) {
                        let width = this.context.measureText(this.value.slice(0, i)).width
                        if (Math.abs(this.startPosition + width - event.clientX) < 7) {
                            this.selected.end = i
                            break
                        }
                    }
                }
            }
        })
        this.mouseup(() => {
            this.selecting = false
        })
        window.addEventListener('click', (event) => {
            if (!(event.clientX >= this.layout.left &&
                event.clientX <= this.layout.right &&
                event.clientY >= this.layout.top &&
                event.clientY <= this.layout.bottom))
            {
                this.focus = false
                this.borderColor = '#dcdfe6'
                this.selected = { start: -1, end: -1 }
            }
        })
        window.addEventListener('keydown', (event) => {
            if (this.focus) {
                let key = event.key
                if (key === 'Backspace') {
                    if (this.imeEvent?.state === 'input') {
                        return
                    }
                    // ????????????????????????, ??????????????????????????????, ?????????????????????????????? if
                    if (this.value !== '') {
                        if (this.selected.start !== -1 && this.selected.end !== -1) {
                            let start = Math.min(this.selected.start, this.selected.end)
                            let end = Math.max(this.selected.start, this.selected.end)
                            this.array.splice(start, end - start + 1)
                            this.index = start - 1
                            this.selected = { start: -1, end: -1}
                        } else {
                            this.array.splice(this.index, 1)
                            this.index -= 1    
                        }
                    }
                } else if (key === 'ArrowLeft') {
                    if (this.index > -1) {
                        this.index -= 1                        
                    }
                } else if (key === 'ArrowRight') {
                    if (this.index < this.array.length - 1) {
                        this.index += 1                        
                    }
                } else if (event.metaKey || event.ctrlKey) {
                    if (key === 'c') {
                        navigator.clipboard.writeText(this.selectedValue)
                    } else if (key === 'v') {
                        navigator.clipboard.readText().then((text) => {
                            if (this.selected.start !== -1 && this.selected.end !== -1) {
                                let start = Math.min(this.selected.start, this.selected.end)
                                let deleteLength = Math.abs(this.selected.start, this.selected.end)
                                // ??????????????????????????????????????????
                                let temp = this.array.slice(0)
                                temp.splice(start, deleteLength, ...text.split(''))
                                temp = temp.join('')
                                this.context.font = '14px sans-serif'
                                let width = this.context.measureText(temp).width
                                if (width >= parseInt(this.style['width'].value) - 30) {
                                    return
                                }
                                this.array.splice(start, deleteLength, ...text.split(''))
                                this.selected = { start: -1, end: -1 }
                                this.index -= deleteLength
                                this.index += text.length
                                this.vm[this.bind] = this.value
                            } else {
                                // ??????????????????????????????????????????
                                let temp = this.array.slice(0)
                                temp.splice(this.index + 1, 0, ...text.split(''))
                                temp = temp.join('')
                                this.context.font = '14px sans-serif'
                                let width = this.context.measureText(temp).width
                                if (width >= parseInt(this.style['width'].value) - 30) {
                                    return
                                }
                                this.array.splice(this.index + 1, 0, ...text.split(''))
                                this.index += text.length
                                this.vm[this.bind] = this.value
                            }
                        })
                    } else if (key === 'x') {
                        navigator.clipboard.writeText(this.selectedValue)
                        let start = Math.min(this.selected.start, this.selected.end)
                        let end = Math.max(this.selected.start, this.selected.end)
                        this.array.splice(start, end - start + 1)
                        this.index = start - 1
                        this.selected = { start: -1, end: -1}
                    } else if (key === 'a') {
                        this.selected = { start: 0, end: this.array.length - 1}
                    }
                } else {
                    if (['Escape', 'Enter', 'Alt', 'ArrowUp', 'ArrowDown'].includes(key)) {
                        return
                    }
                    if (key === 'Shift') {
                        this.imeConfig.active = !this.imeConfig.active
                        this.showImeToast = true
                        setTimeout(() => {
                            this.showImeToast = false
                        }, 1000)
                        return
                    }
                    if (this.imeConfig.active) {
                        key = ''
                        if (this.imeEvent.state === 'done') {
                            key = this.imeEvent.value
                            this.index += 1
                        }
                    }
                    this.context.font = '14px sans-serif'
                    if (this.selected.start !== -1 && this.selected.end !== -1) {
                        let start = Math.min(this.selected.start, this.selected.end)
                        let end = Math.max(this.selected.start, this.selected.end)
                        this.array.splice(start, end - start + 1, key)
                        this.index = start
                        this.selected = { start: -1, end: -1}
                    } else {
                        let width = this.context.measureText(this.value).width
                        if (width >= parseInt(this.style['width'].value) - 30) {
                            return
                        }
                        if (!this.imeConfig.active) {
                            this.index += 1
                        }
                        this.array.splice(this.index, 0, key)    
                    }
                }
                this.vm[this.bind] = this.value
            }
        })
    }

    caretBlink() {
        setInterval(() => {
            if (this.focus) {
                if (this.caretColor === 'black') {
                    this.caretColor = 'white'
                } else {
                    this.caretColor = 'black'
                }
            }
        }, 700)
    }

    draw() {
        this.array = this.props.value.split('')
        // ??????
        let width = parseInt(this.style['width'].value)
        let height = parseInt(this.style['height'].value)
        this.roundedRect(this.layout.left, this.layout.top, width, height, 4, this.borderColor)
        // ??????
        if (this.focus) {
            this.context.beginPath()
            this.context.moveTo(this.caretPosition, this.layout.top + 12)
            this.context.lineTo(this.caretPosition, this.layout.bottom - 12)
            this.context.strokeStyle = this.caretColor
            this.context.stroke()    
        }
        // ???????????????
        this.context.textBaseline = 'top'
        this.context.font = '14px sans-serif'
        // ????????????
        if (this.selected.start !== -1 && this.selected.end !== -1) {
            this.context.fillStyle = '#b2d2fd'
            let start = Math.min(this.selected.start, this.selected.end)
            let end = Math.max(this.selected.start, this.selected.end)
            start = this.startPosition + this.context.measureText(this.value.slice(0, start)).width
            end = this.startPosition + this.context.measureText(this.value.slice(0, end + 1)).width
            this.context.fillRect(start, this.layout.top, end - start, 38)    
        }
        // ????????????
        this.context.fillStyle = '#606266'
        this.context.fillText(this.value, this.startPosition, this.layout.top + 12)
        // hint
        if (this.array.length === 0) {
            if (this.props.hint) {
                this.context.fillStyle = '#dcdfe6'
                this.context.fillText(this.props.hint, this.startPosition, this.layout.top + 12)
            }
        }
        // ??????????????? toast
        if (this.showImeToast) {
            let state = this.imeConfig.active ? '??????' : 'English'
            let x = this.imeConfig.active ? 36 : 20
            this.roundedRect(0, 0, 120, 50, 10, 'lightgray')
            this.context.fillStyle = 'rgba(0, 0, 0, 0.5)'
            this.context.fill()
            this.context.textBaseline = 'top'
            this.context.font = '24px sans-serif'
            this.context.fillStyle = 'white'
            this.context.fillText(state, x, 13)
        }
    }
}
