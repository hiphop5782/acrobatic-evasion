/**
 * 점수판
 */

export default class Score {
    constructor(scene, x, y){
        this.scene = scene;
        this.box = scene.add.text(
            x, y, ''
        )
        .setFontFamily('Orbitron')
        .setFill("#FFF")
        .setFontSize(30)
        .setDepth(999);
        this.value = 0;
        this.draw();
    }
    plus(value){
        this.value += value;
        this.draw();
        return this.value;
    }
    getValue(){
        return this.value;
    }
    draw(){
        const formattedValue = String(this.value).padStart(10, '0');
        this.box.setText(formattedValue);
    }
}