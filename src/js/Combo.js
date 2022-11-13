/**
 * 콤보 도구
 * - 콤보 출력용 텍스트
 * - 보너스 출력용 텍스트(10콤보마다)
 * - 콤보 계산용 값
 */

export default class Combo {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.value = 1;
        this.last = Date.now();
    }
    reset() {
        this.value = 1;
    }
    plus(){
        this.value++;
        this.combo();
    }
    calculate(time) {
        //1초내에 호출된 경우 콤보 추가, 이외에는 리셋
        const diff = time - this.last;
        let bonus = false;
        if(diff <= 1000) {
            this.plus();
            if(this.value % 10 == 0) {//10콤보마다 보너스 추가
                bonus = true;
                this.bonus();
            }
        }
        else {
            this.reset();
        }
        this.last = time;

        return {count : this.value, bonus : bonus};
    }
    combo() {
        //콤보 출력
        const textbox = this.scene.add.text(
            this.x, 
            this.y, 
            this.value + ' Combo'
        )
        .setFontFamily('Orbitron')
        .setFill('#FFF')
        .setFontSize(25)
        .setDepth(999);
        //애니메이션 효과 추가
        this.scene.tweens.add({
            targets:textbox,
            alpha:0,//밝기 0%
            duration:1000,//지속시간(ms)
            repeat:0,//반복(무한)
            yoyo:false,//요요처리
            ease:'Linear',//타이밍함수
            y:'-=10',//y위치 10 감소
            onComplete:(e,target)=>{
                target[0].destroy();//완료된 텍스트 제거
            }
        });
    }

    bonus(){
        const textbox = this.scene.add.text(
            this.x, this.y + 35, 'Bonus !!'
        )
        .setFontFamily('Orbitron')
        .setFill('#FF0')
        .setFontSize(25)
        .setDepth(999);
        //애니메이션 효과 추가
        this.scene.tweens.add({
            targets:textbox,
            alpha:0,//밝기 0%
            duration:1000,//지속시간(ms)
            repeat:0,//반복(무한)
            yoyo:false,//요요처리
            ease:'Linear',//타이밍함수
            y:'-=10',//y위치 10 감소
            onComplete:(e,target)=>{
                target[0].destroy();//완료된 텍스트 제거
            }
        });
    }
}