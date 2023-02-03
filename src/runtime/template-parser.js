import {ButtonComponent} from './component/button-component'
import {CheckboxComponent} from './component/checkbox-component'
import {ColorComponent} from './component/color-component'
import {DivComponent} from './component/div-component'
import {ImageComponent} from './component/image-component'
import {InputComponent} from './component/input-component'
import {RadioComponent} from './component/radio-component'
import {SelectComponent} from './component/select-component'
import {SliderComponent} from './component/slider-component'
import {SwitchComponent} from './component/switch-component'
import {TemplateComponent} from './component/template-component'
import {TextComponent} from './component/text-component'


export class TemplateParser {
    constructor(template, context) {
        this.template = template
        this.context = context
    }

    parse() {
        return this.traverse(this.template)
    }

    traverse(component) {
        let componentObj = new ({
            button: ButtonComponent,
            checkbox: CheckboxComponent,
            color: ColorComponent,
            div: DivComponent,
            image: ImageComponent,
            input: InputComponent,
            radio: RadioComponent,
            select: SelectComponent,
            slider: SliderComponent,
            switch: SwitchComponent,
            template: TemplateComponent,
            text: TextComponent,
        }[component.tagName])(component, this.context)
        for (let child of component.children) {
            componentObj.children.push(this.traverse(child))
        }
        return componentObj
    }
}
