/**
 * 몬스터 HP 막대
 */

import Phaser from 'phaser';

export default class MonsterLifeBar {

    constructor(scene, target, life) {
        this.bar = new Phaser.GameObjects.Graphics(scene);

        const {x, y, width, height} = target.getBounds();

        this.options = {
            x:x,
            y:y,
            width:width,
            height:10,
        };
        this.life = {
            max : life,
            current : life,
            get percent(){
                return this.current / this.max;
            }
        };

        scene.add.existing(this.bar);
        
        this.draw();
    }

    draw(){
        this.bar.clear();
        if(this.over()) return;
        
        //빈칸 그리기
        this.bar.fillStyle(0xFFFFFF);
        this.bar.fillRect(//사각형
            this.options.x, 
            this.options.y-this.options.height,
            this.options.width,
            this.options.height
        );

        //체력 그리기
        this.bar.fillStyle(this.lifeColor);
        this.bar.fillRect(
            this.options.x, 
            this.options.y-this.options.height, 
            this.options.width * this.life.percent, 
            this.options.height
        );
    }

    minus(value) { 
        this.life.current = Math.max(0, this.life.current - value);
        this.draw();
        return this.over();
    }

    over() {
        return this.life.current == 0;
    }

    get lifeColor(){
        const percent = this.life.percent * 100;
        if(percent > 80) return 0x0984e3;
        if(percent > 65) return 0x74b9ff;
        if(percent > 50) return 0x55efc4;
        if(percent > 35) return 0xfdcb6e;
        if(percent > 10) return 0xe17055;
        return 0xd63031;
    }
    get value(){
        return this.life.current;
    }
    get max(){
        return this.life.max;
    }

}