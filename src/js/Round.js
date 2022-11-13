/**
 * 게임 라운드 클래스
 */

 import Phaser from 'phaser';

 //이미지
 import Space from '@/images/space.png';
 import OrbBlue from '@/images/orb-blue.png';
 import OrbRed from '@/images/orb-red.png';
 import OrbGreen from '@/images/orb-green.png';
 import MonsterDamaged from '@/images/monster-damaged.png';
 import MonsterDefault from '@/images/monster-default.png';
 import MonsterWarning from '@/images/monster-warning.png';
 import PlayerDefault from '@/images/player-default.png';
 import PlayerBaseAttack from '@/images/player-base-attack.png';
 import PlayerAdvanceAttack from '@/images/player-advance-attack.png';
 import PlayerDamaged from '@/images/player-damaged.png';
 import Balls from '@/images/balls.png';
 import Explosions from '@/images/explosion.png';

 //몬스터
 import Monster from '@/js/Monster';

 //플레이어
 import Player from '@/js/Player';

 //이펙터
 import DestroyEffector from '@/js/DestroyEffector';
import Score from './Score';

 export default class Round extends Phaser.Scene {
 
     constructor(){
         super('round');//식별자 설정
     }
 
     preload(){//사전설정
        this.load.image('background', Space);
        this.load.image('PlayerAdvanceMissile', OrbBlue);
        this.load.image('PlayerBaseMissile', OrbGreen);
        this.load.image('OrbRed', OrbRed);
        this.load.image('MonsterDamaged', MonsterDamaged);
        this.load.image('MonsterDefault', MonsterDefault);
        this.load.image('MonsterWarning', MonsterWarning);
        this.load.image('PlayerDefault', PlayerDefault);
        this.load.image('PlayerBaseAttack', PlayerBaseAttack);
        this.load.image('PlayerAdvanceAttack', PlayerAdvanceAttack);
        this.load.image('PlayerDamaged', PlayerDamaged);

        this.load.spritesheet('enemy-missile', Balls, {frameWidth:17, frameHeight:17});
        this.load.spritesheet('explosion', Explosions, {frameWidth:130.5, frameHeight:130.5});
     }
     create(){//생성
        const {x, y, width, height} = this.cameras.main;
        //배경
        this.background = this.add.tileSprite(x, y, width, height, 'background')
                                                .setOrigin(0).setScrollFactor(0, 1);

        //글꼴 크기 계산
        //- 제목 : 120px (1920px 기준) - 최소 50
        //- 내용 : 75px (1920px 기준) - 최소 35
        this.titleFontSize = Math.max(50, 120 * width / 1920);
        this.clickToStartFontSize = Math.max(35, 75 * width / 1920);

        const center = {
            x: x+width/2, y:y+height/2
        };
        //플레이어
        this.player = new Player(
            this, 
            center.x, 
            height * 4 / 5
        );

        //적
        this.monster = new Monster(
            this, 
            center.x, 
            height * 1 / 5
        );

        //상호 타겟 설정
        this.player.target = this.monster;
        this.monster.target = this.player;

        //이펙터
        this.destroyEffector = new DestroyEffector(this);

        //점수판
        this.score = new Score(this, x+10, y+10);
     }
     update(){//변경(갱신)
 
     }

     ending(text){
        const {x, y, width, height} = this.cameras.main;
        const center = {x:x+width/2, y:y+height/2};

        //게임오버 텍스트
        const title = this.add.text(
            center.x,
            height * 1 / 5,
            text
        )
        .setFontFamily('Orbitron')
        .setFill("#FFF")
        .setFontSize(this.titleFontSize)
        .setOrigin(0.5)
        .setDepth(99999);

        //재시작 텍스트
        const clickToRestart = this.add.text(
            center.x,
            height * 4 / 5,
            'Click to restart'
        )
        .setFontFamily('Orbitron')
        .setFill('#CCC')
        .setFontSize(this.clickToStartFontSize)
        .setOrigin(0.5)
        .setDepth(99999);

        //tween 애니메이션(깜빡임) 추가
        this.tweens.add({
            targets:clickToRestart,
            alpha:0,//밝기(0~1)
            duration:1000,//지속시간(ms)
            repeat:-1,//반복(무한)
            yoyo:true,//요요처리
            ease:'EaseInOut',//타이밍함수
        });

        //클릭 시 재시작(1초뒤)
        setTimeout(()=>{
            this.input.once('pointerdown', ()=>{
                this.scene.restart();
            });
        }, 1000);
     }

     //게임오버
     gameOver(){
        this.ending('Game over');
     }

     //게임클리어
     gameClear(){
        this.player.invincible = true;//플레이어 무적 처리
        this.ending('Game clear');
     }

     destroyUnit(target) {
        this.destroyEffector.destroy(target);
     }

     addScore(value) {
        this.score.plus(value);
     }
 
 }