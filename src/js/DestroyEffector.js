/**
 * DestroyEffector
 * - 소멸 처리와 함께 이펙트 효과를 추가하는 클래스
 */

import Phaser from 'phaser';

export default class Effector {

    constructor(scene) {
        this.scene = scene;

        this.explodeEffector = scene.add.particles("explosion");
    }

    destroy(target) {
        const {x, y} = target.getCenter();
        this.explode(x, y);
        target.destroy();
    }

    explode(x, y) {
        const effect = this.explodeEffector.createEmitter({
            frame:5,
            blendMode:Phaser.BlendModes.SCREEN,
            x:x, y:y,
            frequency:0,
            aplha:{start:1, end:0, ease:'Cubic.easeIn'},
            scale:{start:0.1, end:0.75, ease:'Cubic.easeOut'}
        });
        effect.explode();
    }

}
