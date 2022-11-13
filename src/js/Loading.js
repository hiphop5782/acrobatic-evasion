/**
 * 로딩화면 클래스
 */

import Phaser from 'phaser';
import Background from '@/images/space.png';

export default class Loading extends Phaser.Scene {

    constructor(){
        super('loading');//식별자를 loading으로 설정
    }

    preload(){//사전설정
        this.load.image('background', Background);
    }
    create(){//생성
        const {x, y, width, height} = this.cameras.main;
        //배경
        this.background = this.add.tileSprite(x, y, width, height, 'background')
                                                .setOrigin(0).setScrollFactor(0, 1);

        //글꼴 크기 계산
        //- 제목 : 120px (1920px 기준)
        //- 내용 : 75px (1920px 기준)
        const titleFontSize = Math.max(50, 120 * width / 1920);
        const clickToStartFontSize = Math.max(35, 75 * width / 1920);

        const center = {
            x : x + width/2,
            y : y + height/2
        };
        //제목
        this.title = this.add.text(
            center.x, //x위치
            height * 1 / 5, //y위치
            'Acrobatic\nEvasion'//제목
        )
        .setFontFamily('Orbitron')
        .setFill("#fff")
        .setFontSize(titleFontSize)
        .setOrigin(0.5)
        .setDepth(999)
        .setAlign('center');

        //클릭메세지
        this.clickToStart = this.add.text(
            center.x,
            height * 4 / 5,
            'Click to start'
        )
        .setFill("#fff")
        .setFontFamily('Orbitron')
        .setFontSize(clickToStartFontSize)
        .setOrigin(0.5)
        .setDepth(999)
        .setAlign('center');

        //tween 애니메이션(깜빡임) 추가
        this.tweens.add({
            targets:this.clickToStart,
            alpha:0,//밝기(0~1)
            duration:1000,//지속시간(ms)
            repeat:-1,//반복(무한)
            yoyo:true,//요요처리
            ease:'EaseInOut',//타이밍함수
        });

        //클릭 이벤트(pointerdown)
        this.input.once('pointerdown', ()=>{
            this.scene.transition({target:'round', duration:500});
        });
    }
    update(){//변경(갱신)

    }

}