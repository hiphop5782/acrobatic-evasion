import '@/styles/index.css';

import Phaser from 'phaser';

import Loading from '@/js/Loading';
import Round from '@/js/Round';

//웹 폰트(Web font) 설정
//- Google Web Font Loader 사용
import WebFont from 'webfontloader';
WebFont.load({
    custom:{
        families:[
            'Orbitron'
        ],
        urls:[
            'https://fonts.googleapis.com/css2?family=Orbitron:wght@500&display=swap'
        ]
    },
    active:function(){
        //게임 설정 - 웹 폰트 로딩 후 생성
        const width = window.innerWidth;
        const height = window.innerHeight;
        const config = {
            type:Phaser.AUTO,//WebGL or Canvas
            width:width,
            height:height,
            physics:{//물리엔진
                default:'arcade',//arcade 엔진
                arcade : {
                    //debug:true,//디버깅 사용
                }
            },
            scale:{//배율설정
                mode:Phaser.Scale.FIT,//자동맞춤
                autoCenter:Phaser.Scale.CENTER_BOTH,//가로세로 모두맞춤
                width:width,//비율설정용 폭
                height:height,//비율설정용 높이
            },
            //장면 설정
            scene:[Loading, Round]
        }
        
        const game = new Phaser.Game(config);
    }
});
