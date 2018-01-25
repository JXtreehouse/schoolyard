window.onload = function () {
    app = new t3d.App({
        el: "div3d",
        // url: "https://speech.uinnova.com/static/models/schoolyard",
        url: "models/schoolyard",
        ak:'app_test_key',
        complete: function () {
            console.log("app scene loaded");
            init();
        }
    });
    var schoolyard = [];
    function init() {
        // schoolyard.
        create_gps_panel();
        schoolyard.buildings = app.buildings;
        schoolyard.facades = app.query('[building]'); // 全部的外立面
        schoolyard.cameraoff = [-40,30,11];
        // is_inbuilding(false);
        console.log(schoolyard.facades);
        // schoolyard.facades.forEach(function (t) { t.on('click',function () {
        //     if(t.custom.building < schoolyard.buildings.length){
        //         is_inbuilding(true);
        //         chooseBuilding(t.custom.building - 1)
        //     }
        //
        // }) })
    }
    // 是否进入building
    function is_inbuilding( flag ) {
        schoolyard.buildings.forEach(function (t) {
            t.showFloors(false);
            // t.showFacades(flag);  // 貌似没有这个
            t.facades.forEach(function (t3) { t3.visible = !flag })
        })
        schoolyard.facades.forEach(function (t) {
            t.visible = !flag;
        })
    }
    function create_progress() {
        var obj = {
            progress: 3
        }
        var proObj = [{
            id: 0,
            name: '2号楼',
            describe: '教学楼'
        },{
            id: 1,
            name: '3号楼',
            describe: '实验楼'
        },{
            id: 2,
            name: '5号楼',
            describe: '室内篮球场'
        },{
            id: 3,
            name: '餐厅',
            describe: '五星级'
        },{
            id: 4,
            describe: '校园小道'
        },{
            id: 5,
            name: '大讲堂',
            describe: '开讲了'
        }]
    
        var gui = new dat.gui.GUI({
            type: 'progress2',
            domWidth: '600px',
        });
    
        var prog = gui.addProgress(obj, 'progress', proObj);
    
        prog.onChange(function(id) {
            console.log(id);
        });
    
        prog.startCallback(function(state) {
            console.log(state);
        });
    
        prog.start(false);
    }
    function create_gps_panel() {
        $.getJSON("js/json/userinfo.json", function (data,status){
            // console.log("是否成功读到数据？ ------ "+status);
            if( status=='success'){
                // resolve data and create gps panel
                var guiMd = new dat.gui.GUI({
                    type: 'nav-md3',
                });
                var f1 = guiMd.addTree('校园预案', data, 'baseInfo.syInfo.buildings', 'name');
                var f2 = guiMd.addTree('校园预案', data, 'baseInfo.pInfo.classes', 'name');
                var f3 = guiMd.addTree('校园预案', data, 'evacuateInfo.classes', 'name');
                var f4 = guiMd.addTree('校园预案', data, 'animationInfo.infos', 'name');
    
                guiMd.domElement.style.height = window.innerHeight + 'px';
                guiMd.setPosition(null, null, 0, 0);/*top right bottom left*/
    
                guiMd.treeBind('click', function(o){
                    console.log(o);
                    if(o.hasOwnProperty('name')){
                        if(o.name.indexOf('号楼') > -1){
                            chooseBuilding(o.name.substring(0,1));
                        }
                    }
                })
                return data;
            }else{
                // console.log("没有读取到本地文件："+status);
                return false;
            }
        })
    }
    // 选择某一个楼后 摄像机飞过去  1/4/7没楼 可以设置弹出提示:该楼没有数据!
    function chooseBuilding( num ) {
        console.log(num)
        is_inbuilding(true);
        // schoolyard.buildings[num].showFloors(true);
        schoolyard.buildings[num].facades.forEach(function (t) { t.visible = true; })
        app.query('[building='+num+']').forEach(function (t) { t.visible=true; })
        // console.log(schoolyard.buildings)
        var pos = schoolyard.buildings[num].position;
        app.camera.flyTo({
            position: [pos[0]+schoolyard.cameraoff[0],pos[1]+schoolyard.cameraoff[1],pos[2]+schoolyard.cameraoff[2]],
            target: pos,
            time: 1000
        })
    }
}