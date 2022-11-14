/**
 * 미사일 클래스
 */
import Phaser from 'phaser';
import Trailer from './Trailer';

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
    //- TTTLinear : Target To Target (등속도)
    //- TTTAcceleration : Targe To Target (가속도)
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
            m.setCircle(missileInfo.size);
            m.score = missileInfo.score;
            m.damage = missileInfo.damage;
            this.scene.physics.moveTo(m, tx, ty, missileInfo.speed);

            //트레일러 설정이 있을 경우 트레일러 활성화 처리
            if(missileInfo.trailer === true) {
                const trailer = new Trailer(this.scene, m);
            }
        });

        //미사일 소멸 이벤트
        Phaser.Actions.Call(missile, m=>{
            m.body.onWorldBounds = true;
        });

        //충돌판정
        this.scene.physics.add.overlap(missile, target, this.checkCollision);
    }

    createTTTAccelerationMissile(attacker, target, missileInfo) {
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
        missile.forEach(m=>{
            m.setCircle(missileInfo.size);
            m.score = missileInfo.score;
            m.damage = missileInfo.damage;
            this.scene.physics.accelerateToObject(m, target, missileInfo.speed);

            //트레일러 설정이 있을 경우 트레일러 활성화 처리
            if(missileInfo.trailer === true) {
                const trailer = new Trailer(this.scene, m);
            }
        });

        //미사일 소멸 이벤트
        Phaser.Actions.Call(missile, m=>{
            m.body.onWorldBounds = true;
        });

        //충돌판정
        this.scene.physics.add.overlap(missile, target, this.checkCollision);
    }

    //(3) 각도에 따라 일직선으로 이동하는 미사일
    //- [45~135] : top
    //- [135~225] : right
    //- [225~315] : bottom
    //- [315~45] : left
    getLine(angle) {
        const {x, y, width, height} = this.scene.cameras.main;
        const offset = 5;
        angle %= 360;
        const lines = [];
        if(angle >= 45 && angle <= 135) {
            lines.push(new Phaser.Geom.Line(x+offset, y+offset, width-offset, y+offset));
        }
        if(angle >= 135 && angle <= 225) {
            lines.push(new Phaser.Geom.Line(width-offset, y+offset, width-offset, height-offset));
        }
        if(angle >= 225 && angle <= 315) {
            lines.push(new Phaser.Geom.Line(x+offset, height-offset, width-offset, height-offset));
        }
        if(angle >= 315 || angle <= 45) {
            lines.push(new Phaser.Geom.Line(x+offset, y+offset, x+offset, height-offset));
        }
        return lines;
    }

    createLinearMissile(target, angle, missileInfo) {
        //각도에 따른 시작지점 계산(1개 또는 2개)
        const lines = this.getLine(angle);

        //선이 1개일지 2개일지 모르므로 각각의 선에서 랜덤한 포인트를 추출
        const points = [];
        lines.forEach(line=>points.push(line.getRandomPoint()));

        //뽑힌 점 중 랜덤으로 한 개 추출
        const idx = Math.floor(Math.random() * points.length);
        const point = points[idx];

        //미사일 생성
        const missile = this.group.createMultiple({
            frameQuantity:1,
            key:missileInfo.type,
            frame:[Phaser.Math.Between(0, 4)],
            setXY:{x:point.x, y:point.y}
        });

        //속도 계산
        const rad = Phaser.Math.DegToRad(angle);
        const vx = Math.cos(rad) * missileInfo.speed;
        const vy = Math.sin(rad) * missileInfo.speed;

        missile.forEach(m=>{
            m.setCircle(missileInfo.size);
            m.damage = missileInfo.damage;
            m.setVelocityX(vx);
            m.setVelocityY(vy);
        });

        //미사일 소멸 이벤트
        Phaser.Actions.Call(missile, m=>{
            m.body.onWorldBounds = true;
        });

        //충돌판정
        this.scene.physics.add.overlap(missile, target, this.checkCollision);
    }

    createAccMissile(target, angle, missileInfo) {
        //각도에 따른 시작지점 계산(1개 또는 2개)
        const lines = this.getLine(angle);

        //선이 1개일지 2개일지 모르므로 각각의 선에서 랜덤한 포인트를 추출
        const points = [];
        lines.forEach(line=>points.push(line.getRandomPoint()));

        //뽑힌 점 중 랜덤으로 한 개 추출
        const idx = Math.floor(Math.random() * points.length);
        const point = points[idx];

        //미사일 생성
        const missile = this.group.createMultiple({
            frameQuantity:1,
            key:missileInfo.type,
            frame:[Phaser.Math.Between(0, 4)],
            setXY:{x:point.x, y:point.y}
        });

        //속도 계산
        const rad = Phaser.Math.DegToRad(angle);
        const vx = Math.cos(rad) * missileInfo.speed;
        const vy = Math.sin(rad) * missileInfo.speed;

        missile.forEach(m=>{
            m.setCircle(missileInfo.size);
            m.damage = missileInfo.damage;
            m.setAccelerationX(vx);
            m.setAccelerationY(vy);
        });

        //미사일 소멸 이벤트
        Phaser.Actions.Call(missile, m=>{
            m.body.onWorldBounds = true;
        });

        //충돌판정
        this.scene.physics.add.overlap(missile, target, this.checkCollision);
    }

    //미사일 속도에서 ±25% 속도를 가지는 랜덤 속도 미사일 생성
    createRandomSpeedLinearMissile(target, angle, missileInfo) {
        //각도에 따른 시작지점 계산(1개 또는 2개)
        const lines = this.getLine(angle);

        //선이 1개일지 2개일지 모르므로 각각의 선에서 랜덤한 포인트를 추출
        const points = [];
        lines.forEach(line=>points.push(line.getRandomPoint()));

        //뽑힌 점 중 랜덤으로 한 개 추출
        const idx = Math.floor(Math.random() * points.length);
        const point = points[idx];

        //미사일 생성
        const missile = this.group.createMultiple({
            frameQuantity:1,
            key:missileInfo.type,
            frame:[Phaser.Math.Between(0, 4)],
            setXY:{x:point.x, y:point.y}
        });

        //속도 계산
        const rad = Phaser.Math.DegToRad(angle);
        const random = Phaser.Math.FloatBetween(0.75, 1.25);
        const fixSpeed = missileInfo.speed * random;
        const vx = Math.cos(rad) * fixSpeed;
        const vy = Math.sin(rad) * fixSpeed;

        missile.forEach(m=>{
            m.setCircle(missileInfo.size);
            m.damage = missileInfo.damage;
            m.setVelocityX(vx);
            m.setVelocityY(vy);
        });

        //미사일 소멸 이벤트
        Phaser.Actions.Call(missile, m=>{
            m.body.onWorldBounds = true;
        });

        //충돌판정
        this.scene.physics.add.overlap(missile, target, this.checkCollision);
    }

    //미사일 속도에서 ±25% 가속도를 가지는 랜덤 속도 미사일 생성
    createRandomSpeedAccMissile(target, angle, missileInfo) {
        //각도에 따른 시작지점 계산(1개 또는 2개)
        const lines = this.getLine(angle);

        //선이 1개일지 2개일지 모르므로 각각의 선에서 랜덤한 포인트를 추출
        const points = [];
        lines.forEach(line=>points.push(line.getRandomPoint()));

        //뽑힌 점 중 랜덤으로 한 개 추출
        const idx = Math.floor(Math.random() * points.length);
        const point = points[idx];

        //미사일 생성
        const missile = this.group.createMultiple({
            frameQuantity:1,
            key:missileInfo.type,
            frame:[Phaser.Math.Between(0, 4)],
            setXY:{x:point.x, y:point.y}
        });

        //속도 계산
        const rad = Phaser.Math.DegToRad(angle);
        const random = Phaser.Math.FloatBetween(0.75, 1.25);
        const fixSpeed = missileInfo.speed * random;
        const vx = Math.cos(rad) * fixSpeed;
        const vy = Math.sin(rad) * fixSpeed;

        missile.forEach(m=>{
            m.setCircle(missileInfo.size);
            m.damage = missileInfo.damage;
            m.setAccelerationX(vx);
            m.setAccelerationY(vy);
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