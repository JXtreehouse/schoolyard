window.onload = function () {
    app = new t3d.App({
        el: "div3d",
        url: "https://speech.uinnova.com/static/models/schoolyard",
        // url: "models/schoolyard",
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
        create_progress();
        schoolyard.buildings = app.buildings;
        schoolyard.facades = app.query('[building]'); // 全部的外立面
        schoolyard.cameraoff = [-40,30,11];
        is_inbuilding(false);
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
        
        $.getJSON("https://speech.uinnova.com/static/models/js/json/progress.json", function (data,status){
            console.log(data)
            var obj = {
                progress: 3
            }
            var proObj;
            if( status=='success'){
                proObj = data;
                var gui = new dat.gui.GUI({
                    type: 'progress2',
                    domWidth: window.innerWidth + 'px',
                });
                var prog = gui.addProgress(obj, 'progress', proObj);
                gui.setPosition(null, null, 10, 0);/*top right bottom left*/
                prog.onChange(function(id) {
                    console.log(id);
                });
                prog.startCallback(function(state) {
                    console.log(state);
                });
                prog.time(6);
                // prog.start(false);
            }
        })
    }
    function create_gps_panel() {
        $.getJSON("https://speech.uinnova.com/static/models/js/json/userinfo.json", function (data,status){
            // console.log("是否成功读到数据？ ------ "+status);
            if( status=='success'){
                // resolve data and create gps panel
                var guiMd = new dat.gui.GUI({
                    type: 'nav-md3',
                });
                guiMd.addTree('校园预案', data, 'baseInfo.syInfo.buildings', 'name');
                guiMd.addTree('校园预案', data, 'baseInfo.pInfo.classes', 'name');
                guiMd.addTree('校园预案', data, 'evacuateInfo.classes', 'name');
                guiMd.addTree('校园预案', data, 'animationInfo.infos', 'name');
    
                guiMd.domElement.style.height = 450 + 'px';
                guiMd.setPosition(0, null, null, 0);/*top right bottom left*/
    
                guiMd.treeBind('click', function(o){
                    if(tableManager._table!=null){
                        tableManager.destroy(document.getElementById("div3d"));
                    }
                    if(o == '校园预案'){
                        is_inbuilding(false);
                    }
                    if(o.hasOwnProperty('name')){
                        if(o.name.indexOf('号楼') > -1){
                            chooseBuilding(o.name.substring(0,1));
                        }else if(o.name == '人员信息'){
                            tableManager.create(document.getElementById("div3d"),'人员信息');
                        }else if(o.name == '校园信息'){
                            tableManager.create(document.getElementById("div3d"),'校园信息');
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
    var tableManager ={
        _table:null,
        create:function (divElem,table_name){
            var tableSetting = {
                border:1+'px',
                cellspacing:0+'px',
                width:300+'px',
                posotion:'absolute',
                top:100 + 'px',
                left:(window.innerWidth/2 - 300/2) + 'px',
            }
            var url;
            switch (table_name){
                case '校园信息':url="https://speech.uinnova.com/static/models/js/json/buildinginfo.json";break;
                case '人员信息':url="https://speech.uinnova.com/static/models/js/json/personinfo.json";break;
            }
            var table = document.createElement('table');
            table.setAttribute('border', tableSetting.border);
            table.setAttribute('cellspacing',tableSetting.cellspacing);
            table.style.width = tableSetting.width;
            table.style.position = tableSetting.posotion;
            table.style.top = tableSetting.top;
            table.style.left = tableSetting.left;
            var row = table.insertRow(0);
            document.getElementById("div3d").appendChild(table);
            $.getJSON(url, function (data){
                var title = [];
                Object.keys(data.titleinfo).forEach(function (key) { title.push(data.titleinfo[key]) })
                console.log(title);
                for(i = 0; i < title.length; i++){
                    var text = document.createTextNode(title[i]);
                    var cell = row.insertCell(i);
                    cell.setAttribute('align','center')
                    cell.style.backgroundColor = "#e0e0e0";
                    cell.appendChild(text);
                }
                for(i = 0;i < data.details.length;i++){
                    var tr = document.createElement("tr");//创建行
                    for(j = 0;j < title.length;j++){
                        var td = document.createElement("td");//创建列
                        var k;
                        switch (table_name){
                            case '人员信息':
                                switch (j){
                                    case 0:k = 'classnum';break;
                                    case 1:k = 'pos';break;
                                    case 2:k ='num';break;
                                } break;
                            case '校园信息':{
                                switch (j){
                                    case 0:k = 'pos';break;
                                    case 1:k = 'comments';break;
                                } break;
                            }
                        }
                        td.innerHTML = data.details[i][k];
                        td.setAttribute('align','center')
                        tr.appendChild(td);
                    }
                    tr.style.backgroundColor = "#ffffff";
                    table.appendChild(tr);
                }
                //document.getElementById("div3d").appendChild(table);
                divElem.appendChild(table);
                tableManager._table = table;
            })
        },
        destroy:function (divElem) {
            divElem.removeChild(tableManager._table);
            delete tableManager._table;
            tableManager._table = null;
        }
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