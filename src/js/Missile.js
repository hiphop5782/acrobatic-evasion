/**
 * 미사일 클래스
 */
import Phaser from 'phaser';

export default class Missile extends Phaser.Physics.Arcade.Sprite {

    constructor(scene){
        super(scene);

        //장면 저장
        this.scene = scene;

        //미사일 그룹 생성
        this.group = scene.physics.add.group({
            defaultKey:'enemy-missile',//기본이미지 설정
            collideWOrldBounds:true,//벽 충돌 이벤트 설정
        });

        //벽 충돌 시 소멸 처리
        scene.physics.world.on('worldbounds', (body)=>{
            body.gameObject.destroy();
        });
    }

    //(1) 아래로 떨어지는 미사일
    //- 시작위치는 상단 중 랜덤으로 설정
    createLinearDownMissile(target, speed) {
        const {x, y, width, height} = this.scene.cameras.main;
        const center = {x:x+width/2, y:y+height/2};

        //미사일 생성
        const offset = 5;
        const mx = Phaser.Math.Between(x+offset, width-offset*2);
        let missile = this.group.createMultiple({
            frameQuantity:1,//frame당 개수
            key:'enemy-missile',//사용할 sprite 이미지
            frame:[Phaser.Math.Between(0, 4)],//사용할 frame 번호
            setXY:{x:mx, y:10}
        });

        //미사일 발사
        missile.forEach(m=>{
            m.setCircle(8);
            m.setVelocityY(speed);
        });

        //미사일 소멸 이벤트(벽 충돌)
        Phaser.Actions.Call(missile, m=>{
            m.body.onWorldBounds = true;
        });

        //미사일과 대상의 충돌 설정
        this.scene.physics.add.overlap(
            missile, target, //충돌대상
            this.checkCollision//처리함수
        );

    }

    //(2) 타겟을 향해 발사하는 미사일
    //- TTT : Target To Target
    createTTTLinearMissile(attacker, target, missileInfo) {
        //시작지점 : attacker의 위치
        const attackerPos = attacker.getCenter();
        const sx = attackerPos.x;
        const sy = attackerPos.y;

        //미사일 생성
        const missile = this.group.createMultiple({
            frameQuantity:1,
            key:missileInfo.type,
            setXY:{x:sx, y:sy}
        });
        
        const targetPos = target.getCenter();
        const tx = targetPos.x;
        const ty = targetPos.y;
        missile.forEach(m=>{
            m.setCircle(11);
            m.score = missileInfo.score;
            m.damage = missileInfo.damage;
            this.scene.physics.moveTo(m, tx, ty, missileInfo.speed);
        });

        //미사일 소멸 이벤트
        Phaser.Actions.Call(missile, m=>{
            m.body.onWorldBounds = true;
        });

        //충돌판정
        this.scene.physics.add.overlap(missile, target, this.checkCollision);
    }

    //충돌 감지 함수
    //- 미사일과 대상이 충돌할 경우의 처리
    //- 대상의 hit 함수 실행하며 missile 정보 전달
    //- 데미지 등이 다를 수 있음
    checkCollision(missile, defender) {
        defender.hit(missile);
    }

}