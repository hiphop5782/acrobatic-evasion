/**
 * Player 클래스
 */

import Phaser from 'phaser';
import Combo from './Combo';
import Missile from './Missile';
import PlayerLifeBar from './PlayerLifeBar';

export default class Player extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y){
        super(scene, x, y);

        //장면 저장
        this.scene = scene;

        //객체 설정
        this.setTexture('PlayerDefault');
        this.setPosition(x, y);
        this.setDepth(6);

        //속도 설정
        this.speed = 5;

        //무적 여부 설정
        this.invincible = false;

        //목숨 설정 - 최초 3개
        const [cameraX, cameraY] = [scene.cameras.main.x, scene.cameras.main.y];
        this.life = new PlayerLifeBar(scene, cameraX + 10, cameraY + 50, 3);

        //콤보
        this.combo = new Combo(scene, cameraX + 10, cameraY + 85);

        //이동키 설정(키보드/마우스 모두)
        this.key = {
            up:scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            down:scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
            left:scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            right:scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)
        };

        //미사일 설정
        this.missile = new Missile(scene);

        scene.add.existing(this);//장면 추가
        scene.physics.add.existing(this);//물리엔진 추가
        this.setCollideWorldBounds(true);//지도에 가두기
    }
    preUpdate(){
        //마우스 버튼 감지
        const pointer = this.scene.input.activePointer;
        if(pointer.isDown){//마우스 우선처리
            //거리계산
            const distance = Phaser.Math.Distance.Between(
                pointer.x, pointer.y,//마우스x, 마우스y, 
                this.x, this.y,//기체x, 기체y
            );
            //떨림보정 처리 - 남은거리가 이동거리보다 클 경우만 이동 처리
            if(distance > this.speed) {
                //각도계산(RAD)
                const angle = Phaser.Math.Angle.Between(
                    pointer.x, pointer.y, this.x, this.y
                );
                const dx = Math.cos(angle) * this.speed;
                const dy = Math.sin(angle) * this.speed;
                this.x -= dx;
                this.y -= dy;
            }
        }
        else{//키보드 처리
            //추가해둔 키보드 방향키가 눌리면 isDown 속성이 true가 되므로 해당 키에 맞게 x, y좌표를 변경(speed 반영)
            if(this.key.up.isDown) this.y -= this.speed;
            if(this.key.down.isDown) this.y += this.speed;
            if(this.key.left.isDown) this.x -= this.speed;
            if(this.key.right.isDown) this.x += this.speed;
        }
    }

    //피격 함수
    hit(missile) {
        // console.log("플레이어 피격");

        //피격 범위에 따라 데미지, 기본공격, 추가공격을 한다.
        //- 빨간 부분에 맞으면 데미지를 입고 미사일은 사라진다
        //- 사각형 : (29,6) 폭5 높이17
        //- 초록 부분에 맞으면 데미지 없이 기본 공격 미사일을 적에게 발사한다
        //- 삼각형 : (3,45), (31,22), (59,45)
        //- 파란 부분에 맞으면 데미지 없이 추가 공격 미사일을 적에게 발사한다
        //- 삼각형 : (21,58), (31, 45), (41, 58)

        const playerBounds = this.getBounds();//player
        const missileBounds = missile.getBounds();//missile

        const damageZone = new Phaser.Geom.Rectangle(
            playerBounds.x+30, 
            playerBounds.y+6, 
            4, 
            16
        );
        const isDamaged = Phaser.Geom.Intersects.RectangleToRectangle(damageZone, missileBounds);
        if(isDamaged){
            this.damaged(missile);
            return;
        }

        const baseAttackZone = new Phaser.Geom.Triangle(
            playerBounds.x+11, playerBounds.y+41,
            playerBounds.x+32, playerBounds.y+29,
            playerBounds.x+53, playerBounds.y+41
        );
        const isBaseAttack = Phaser.Geom.Intersects.RectangleToTriangle(missileBounds, baseAttackZone);
        if(isBaseAttack){
            this.baseAttack(missile);
        }

        const advanceAttackZone = new Phaser.Geom.Triangle(
            playerBounds.x+25, playerBounds.y+57,
            playerBounds.x+32, playerBounds.y+50,
            playerBounds.x+39, playerBounds.y+57
        );
        const isAdvanceAttack = Phaser.Geom.Intersects.RectangleToTriangle(missileBounds, advanceAttackZone);
        if(isAdvanceAttack){
            this.advanceAttack(missile);
        }
    }

    //대미지 처리
    //- 플레이어의 목숨이 감소한다
    //- 미사일은 소멸시킨다
    //- 펑 하고 터지는 이펙트가 있으면 좋다
    //- 대미지 상태 이미지로 잠시 변경한다(1초)
    //- 대미지가 연속적으로 들어갈 경우 마지막 대미지 기준으로 원래 이미지 복귀 처리한다
    //- 대미지를 입으면 1초간 무적 상태이며 대미지를 추가로 입지 않는다
    damaged(missile){
        if(this.invincible) return;//무적일 경우 대미지를 입지 않음
        if(this.life.over()) return;//목숨이 없는 경우 대미지를 입지 않음

        //목숨 감소
        const gameOver = this.life.minus();

        //미사일 제거
        //missile.destroy();
        this.scene.destroyUnit(missile);

        if(gameOver) {//게임오버에 해당할 경우
            this.scene.gameOver();
            //this.destroy();//비행기 제거
            this.scene.destroyUnit(this);
        }
        else {//아직 목숨이 남은 경우
            this.invincible = true;
            this.setTexture('PlayerDamaged');
            this.damageTime = Date.now();
            setTimeout(()=>{
                const diff = Date.now() - this.damageTime;
                if(diff > 999) {
                    this.invincible = false;
                    this.setTexture('PlayerDefault');
                }
            }, 1000);
        }
    }

    //기본공격 처리
    //- 적에게 공격력만큼의 대미지를 주는 미사일을 발사한다
    //- 미사일에 기본공격을 했음을 마킹한다
    //- 기본공격 상태 이미지로 잠시 변경한다(0.5초)
    //- 공격 발생 시 콤보를 계산한다
    baseAttack(missile){
        //미사일에 공격했음을 마킹(미사일당 1회만 공격 가능)
        if(missile.baseAttackUsed) return;
        missile.baseAttackUsed = true;

        this.baseAttackTime = Date.now();
        const {count, bonus} = this.combo.calculate(this.baseAttackTime);
        if(bonus) {//보너스일 경우 라이프 추가
            this.life.plus();
        }

        //미사일 발사
        const missileInfo = {
            type:'PlayerBaseMissile',
            damage:10,
            speed:200,
            score:10 * count,//점수 = 대미지 * 콤보
            trailer:true,//트레일러 활성
            size:11,
        };
        //this.missile.createTTTLinearMissile(this, this.target, missileInfo);
        this.missile.createTTTAccelerationMissile(this, this.target, missileInfo);

        //기체 변경
        this.setTexture('PlayerBaseAttack');
        setTimeout(()=>{
            const diff = Date.now() - this.baseAttackTime;
            if(diff > 499){
                this.setTexture('PlayerDefault');
            }
        }, 500);
    }
    
    //추가공격 처리
    //- 적에게 공격력의 두배만큼의 대미지를 주는 미사일을 발사한다
    //- 미사일에 추가공격을 했음을 마킹한다
    //- 추가공격 상태 이미지로 잠시 변경한다
    //- 공격 발생 시 콤보를 계산한다
    advanceAttack(missile){
        //미사일에 추가공격에 사용했음을 마킹
        if(missile.advanceAttackUsed) return;
        missile.advanceAttackUsed = true;

        //콤보 계산
        this.advanceAttackTime = Date.now();
        const {count, bonus} = this.combo.calculate(this.advanceAttackTime);
        if(bonus){
            this.life.plus();
        }

        //미사일 발사
        const missileInfo = {
            type:'PlayerAdvanceMissile',
            damage:20,
            speed:400,
            score:20 * count,
            trailer:true,//트레일러 활성
            size:11,
        };
        //this.missile.createTTTLinearMissile(this, this.target, missileInfo);
        this.missile.createTTTAccelerationMissile(this, this.target, missileInfo);

        //기체 변경(0.5초)
        this.setTexture('PlayerAdvanceAttack');
        setTimeout(()=>{
            const diff = Date.now() - this.advanceAttackTime;
            if(diff > 499){
                this.setTexture('PlayerDefault');
            }
        }, 500);
    }
}