/**
 * 트레일러 생성 클래스
 * - 플레이어의 미사일 등 지정된 대상에 잔상을 남기는 역할
 * - preUpdate를 사용하기 위하여 상속으로 구현(MonsterLifeBar 등과 구분)
 */

import Phaser from 'phaser';

export default class Trailer extends Phaser.GameObjects.Graphics {
    constructor(scene, target) {
        super(scene, target.x, target.y);

        this.scene = scene;
        this.target = target;

        this.tails = [];//잔상의 위치(최대 20개)
        scene.add.existing(this);//추가해야 preUpdate 사용 가능
    }

    preUpdate() {
        if(!this.target.active) {//대상이 소멸할 경우 같이 소멸
            this.destroy();
            return;
        }

        //대상의 이동 지점을 계속해서 추가
        const center = this.target.getCenter();
        this.add(center);
        this.draw();
    }

    //20개만 관리되도록 변경 + 1초가 지난 점들은 제거(속도에 따른 잔상길이 구현)
    add(pos){
        const now = Date.now();//시간 추가
        pos.time = now;
        this.tails.push(pos);
        if(this.tails.length > 20) {
            const diff = this.tails.length - 20;
            this.tails.splice(0, diff);
        }

        //시간이 1초이상 지난 데이터들 제거
        for(let i=0; i < this.tails.length; i++) {
            const diff = now - this.tails[i].time;
            if(diff > 1000) {
                this.tails.splice(i, 1);
                index--;
            }
        }

        this.draw();
    }

    draw(){
        this.clear();//초기화

        const width = this.target.width / 2;//폭은 대상의 절반으로 시작(갈수록 줄어들게 구현)
        const minWidth = width / 4;
        for(let i=0; i < this.tails.length; i++) {
            this.fillStyle(0xFFFFFF, 0.1);//흰색, 90% 투명
            this.fillCircle(
                this.tails[i].x, 
                this.tails[i].y, 
                Math.max(minWidth, width * i / this.tails.length)
            );
        }
        this.strokePath();
        this.closePath();
    }
}