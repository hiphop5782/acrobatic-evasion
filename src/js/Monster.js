/**
 * 몬스터 클래스
 * - 플레이어를 향해 다양한 패턴의 미사일을 발사하는 존재
 * - 체력이 설정되어 있어야 한다
 * - 플레이어를 타겟으로 설정해야 한다
 */
import Phaser from 'phaser';
import Missile from './Missile';
import MonsterLifeBar from './MonsterLifeBar';

export default class Monster extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y){//초기화
        super(scene, x, y);

        //장면 객체 저장
        this.scene = scene;

        //몬스터 설정
        this.setTexture('MonsterDefault');
        this.setPosition(x, y);
        this.setDepth(5);

        //체력 설정
        const hp = 5000;
        this.life = new MonsterLifeBar(scene, this, hp);

        //미사일 설정
        this.missile = new Missile(scene);

        //공격 패턴 설정
        //- 가장 쉬운 난이도 : frequency(10), speed(100)
        //- 가장 어려운 난이도 : frequency(1), speed(500)
        this.attack = {
            frequency:10,
            speed:100,
            easy:{frequency:10, speed:100},
            hard:{frequency:1, speed:500},
            ratio: 1920 / scene.cameras.main.width,
            get fixedFrequency(){
                return Math.floor(this.frequency * this.ratio);
            },
            calculate(percent){
                //- 빈도는 easy - (abs(easy-hard)*(100-퍼센트)) 값을 계산한 뒤 정수로 변경
                //- 스피드는 easy + ((easy-hard) * (100-퍼센트)) 값을 계산한 뒤 정수로 변경
                const remain = 1 - percent;
                const easyFreq = this.easy.frequency;
                const gapFreq = Math.abs(this.hard.frequency - easyFreq);
                console.log("before", this.frequency, gapFreq, remain);
                this.frequency = parseInt(easyFreq - (gapFreq * remain));
                console.log("after", this.frequency);

                const easySpeed = this.easy.speed;
                const gapSpeed = this.hard.speed - easySpeed;
                this.speed = parseInt(easySpeed + gapSpeed * remain);
            }
        };

        scene.add.existing(this);//장면 추가
        scene.physics.add.existing(this);//물리엔진 추가
        this.setCollideWorldBounds(true);//지도에 가두기
    }

    frameCount = 0;

    preUpdate(time, delta){//갱신
        //공격빈도를 화면에 따라 다르게 설정
        //1920px 기준으로 화면이 줄어들 수록 비율에 맞게 this.attack.frequency를 변경
        console.log(this.attack.fixedFrequency);
        if(this.frameCount++ % this.attack.fixedFrequency == 0){
            this.missile.createLinearDownMissile(this.target, this.attack.speed);
        }
    }

    hit(missile) {
        //console.log("몬스터 피격");

        //몬스터 피격 시 처리사항
        //1. 몬스터 체력 감소(체력 미구현)
        //2. 몬스터 피격 이미지로 잠시 변경(0.5초)
        //3. 몬스터 체력에 따라 다른 이미지 표시
        //4. 몬스터 체력 고갈 시 게임 클리어 처리
        //5. 미사일 제거
        //6. 점수 계산
        //7. 체력에 따라 난이도(attack.frequency, attack.speed) 증가

        const score = missile.score;
        this.scene.addScore(score);

        //missile.destroy();
        this.scene.destroyUnit(missile);

        const over = this.life.minus(missile.damage);
        if(over) {//몬스터 체력이 다 되었다면
            //게임 클리어 처리로 이동
            this.scene.gameClear();
            //this.destroy();
            this.scene.destroyUnit(this);
            return;
        }

        this.setTexture('MonsterDamaged');
        this.damageTime = Date.now();
        setTimeout(()=>{
            const diff = Date.now() - this.damageTime;
            if(diff > 499) this.setTexture('MonsterDefault');
        }, 500);
        
        //몬스터 체력바에서 퍼센트를 가져와서 난이도를 변경
        //- 빈도는 30 - (28 - 28*퍼센트) 값을 계산한 뒤 정수로 변경
        //- 스피드는 100 * (400 * 퍼센트) 값을 계산한 뒤 정수로 변경
        const percent = this.life.life.percent;
        this.attack.calculate(percent);
    }
}