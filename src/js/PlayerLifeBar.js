/**
    플레이어 생명력을 관리하고 표시하는 도구
*/

export default class PlayerLifeBar {

    constructor(scene, x, y, count) {
        this.box = scene.add.text(
                x, y, ''
            )
            .setFontFamily('Orbitron')
            .setFontSize(30)
            .setDepth(999);
        this.count = count;
        this.draw();
    }

    plus() {
        this.count++;
        this.draw();
    }
    minus() {
        this.count--;
        this.draw();
        return this.over();
    }
    over() {
        return this.count === 0;
    }

    //라이프 개수를 표시하는 함수
    draw() {
        this.box.setText('Life × ' + this.count);
    }

}