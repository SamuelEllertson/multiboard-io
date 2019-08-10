var stage;
var circle;
var circleList = [];

function clamp(val, min, max){
    return Math.max(min, Math.min(val, max));
}

function fitStageIntoParentContainer() {
    var container = document.querySelector('#ctx');

    var containerWidth = container.offsetWidth;
    var scale = containerWidth / 600;

    stage.width(600 * scale);
    stage.height(600 * scale);
    stage.scale({ x: scale, y: scale });
    stage.draw();
}

$(document).ready(function(){

    stage = new Konva.Stage({
        container: 'ctx',
        width: 600,
        height: 600,
    });

    var layer = new Konva.Layer();    

    for(let i=0;i<10;i++){
        let circle = new Konva.Circle({
            x: stage.getWidth() * (i/12) + 12,
            y: stage.getHeight() /2,
            radius: 10,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 2,
            draggable: true,
            name: i.toString(),
            dragBoundFunc: function(pos) {
                return {
                    x: clamp(pos.x, 12, stage.getWidth()-12),
                    y: clamp(pos.y, 12, stage.getHeight()-12)
                }
            }
        });
        circleList.push(circle);
        layer.add(circle);
    }

    

    // add the layer to the stage
    stage.add(layer);

    fitStageIntoParentContainer();
    window.addEventListener('resize', fitStageIntoParentContainer);


    stage.on("dragstart", function (e) {
        console.log(e);
        console.log('Grabbed ' + e.target.name());
        e.target.moveToTop();
        layer.draw();
    });

    stage.on("dragmove", function (e) {
        //console.log(e.target.position());
        layer.draw();
    });

});


