function drawOpenStackVMTable(obj, type, i){
    var machine_types=[];
    machine_types['sourcemachine']='Source machine';
    machine_types['initialmachine']='Initial machine';
    machine_types['vdimachine']='VDI machine';
    machine_types['simplemachine']='Simple machine';
    var tab=['1','11'];
    var power_button="<a href=\"#\" class=\"power-button\" id=\"" + obj['osInstanceId'] + "\" data-power=\"down\" data-power-button-rowid=\"" + obj['id'] +"\"><i class=\"text-danger fa fa-stop fa-fw\"></i>Power down</i></a>";
    if (obj['state'] != "Running")
        power_button="<a href=\"#\" class=\"power-button\" id=\"" + obj['osInstanceId'] + "\" data-power=\"up\" data-power-button-rowid=\"" + obj['id'] +"\"><i class=\"text-success fa fa-play fa-fw\"></i>Power up</a>";
    var additional_buttons='';
    var rowclass='';
    if (type == 'initialmachine'){
        rowclass = ' info';
        tab=['3','9 glyphicon glyphicon-menu-down'];
        additional_buttons="\
        <div class=\"btn-group\">\
            <button class=\"btn btn-default dropdown-toggle\" aria-expanded=\"false\" aria-haspopup=\"true\" data-toggle=\"dropdown\" type=\"button\">\
                VDI control\
                <span class=\"caret\"></span>\
            </button>\
        </div>";
    }
    if (type == 'vdimachine'){
        tab=['5','7 glyphicon glyphicon-menu-right'];
        rowclass = ' warning';
    }
    var table_rows="\
<tr class=\"table-stripe-bottom-line\" id=\"row-name-" + obj['id'] + "\">\
    <td class=\"col-md-1 clickable parent\" id=\"" + obj['id'] + "\" data-toggle=\"collapse\" data-target=\".child-" + obj['id'] + "\" >\
        <div class=\"row\">\
            <div class=\"col-md-" + tab[0] + "\"></div>\
            <div class=\"col-md-" + tab[1] + "\">" + i + "</div>\
        </div>\
    </td>\
    <td class=\"col-md-2\"><a data-toggle=\"modal\" href=\"vm_info.php?vm=" + obj['osInstanceId'] + "\" data-target=\"#modalWm\">" + obj['name'] + "</a> </td>\
    <td class=\"col-md-1\">" + machine_types[obj['machine_type']] + "</td>\
    <td class=\"col-md-1\">" + obj['source_volume_machine'] + "</td>\
    <td class=\"col-md-1\"><input type=\"checkbox\" checked onclick='handleSnapshot(this);' id=\"" + obj['osInstanceId'] + "\"></td>\
    <td class=\"col-md-1\"><input type=\"checkbox\"  onclick='handleMaintenance(this);' id=\"" + obj['osInstanceId'] + "\"></td>\
    <td class=\"col-md-2\">\
        <div class=\"btn-group\">\
            <button class=\"btn btn-default dropdown-toggle\" type=\"button\" id=\"VMSActionMenu\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"true\">VM Actions\
                <span class=\"caret\"></span>\
            </button>\
            <ul class=\"dropdown-menu\" aria-labelledby=\"VMSActionMenu\">\
                <li class=\"lockable-vm-buttons-" + obj['id'] + "\">\
                    " + power_button + "\
                </li>\
                <li role=\"separator\" class=\"divider\"></li>\
                <li class=\"lockable-vm-buttons-" + obj['id'] + "\"><a href=\"delete_vm.php?vm=" + obj['osInstanceId'] + "\" onclick=\"return confirmBox('Are you sure?');\">\
                    <i class=\"fa fa-trash-o fa-fw text-danger\"></i>Delete machine</a>\
                </li>\
                <li class=\"lockable-vm-buttons-" + obj['id'] + "\"><a data-target=\"#modalWm\" data-toggle=\"modal\" href=\"vm_screen.php?vm=" + obj['osInstanceId'] + "\">\
                    <i class=\"fa fa-window-maximize fa-fw text-info\"></i>Open Console</a>\
                </li>\
            </ul>\
        </div>\
        " + additional_buttons + "\
    </td>\
    <td class=\"col-md-3\">\
        <i id=\"os-type-" + obj['id'] + "\">" + obj['os_type'] +"</i>\
        <i> &#47; </i>\
        <i id=\"vm-state-" + obj['id'] + "\">" + obj['state'] + "</i>\
        <i> &#47; </i>\
        <i id=\"vm-user\"><i class=\"text-muted\">Nobody</i></i>\
        <div class=\"row hide\" id=\"progress-bar-" + obj['id'] + "\">\
            <div class=\"col-md-5\">\
                <div class=\"progress\">\
                    <div class=\"progress-bar progress-bar-info progress-bar-striped active\" role=\"progressbar\"\
                        aria-valuenow=\"100\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width:100%\">\
                    </div>\
                </div>\
                <div class=\"col-md-7\"></div>\
            </div>\
        </div>\
    </td>\
</tr>"
    if (type == 'sourcemachine')
        $('#OpenstackVmTable').append(table_rows);
    else {
        var parent_row = document.getElementById("row-name-" + obj['source_volume']);
        var row = document.createElement('tr');
        row.setAttribute("class","table-stripe-bottom-line" + rowclass);
        row.setAttribute("id","row-name-" + obj['id']);
        row.innerHTML = table_rows;
        parent_row.parentNode.insertBefore(row, parent_row.nextSibling);
    }
}
function drawOpenstackVmTable(){
    $.getJSON("inc/infrastructure/OpenStack/ListVMS.php", {},  function(json){
        var initial_machines=[];
        var vdi_machines=[];
        var x=0;
        $.each(json, function(i, obj){
            if (!obj['source_volume_machine'])//remove NULL
                obj['source_volume_machine']='';
            if (!obj['machine_type'])
                obj['machine_type'] = 'simplemachine';
            if (obj['machine_type'] == 'initialmachine')
                initial_machines.push(obj)
            if (obj['machine_type'] == 'vdimachine')
                vdi_machines.push(obj);
            if (obj['machine_type'] == 'sourcemachine' || obj['machine_type'] == 'simplemachine')
               drawOpenStackVMTable(obj, 'sourcemachine', ++x);
        });
        //insert initial machine as child to source machine
        var i=initial_machines.length;
        x=0;
        while (initial_machines.length > 0){
            var obj = initial_machines.pop();
            drawOpenStackVMTable(obj, 'initialmachine', '');
            --i;
        }
        //insert vdi machine as child to initial machine
        var i=vdi_machines.length;
        while (vdi_machines.length > 0){
            var obj = vdi_machines.pop();
            drawOpenStackVMTable(obj, 'vdimachine', '');
            --i;
        }
    });
}
function reloadOpenStackVmTable(){
    $('#OpenstackVmTable').html('');
    drawOpenstackVmTable();
}
function drawVMStatus(row_id, vm_id, power_state){
    var state_should_be=0;
    if (power_state=='up') //define what powerstate we called
        state_should_be=1; //we need machine state to become running (1)
    else
        state_should_be=4; //we need machine state to become shutdown (4)
    run_query();
    function run_query(){
        $.post({
            url : 'inc/infrastructure/OpenStack/GetVMInfo.php',
                data: {
                    vm_id: vm_id,
                },
                success:function (data) {
                    var reply=jQuery.parseJSON(data);
                    if (reply['server']['OS-EXT-STS:task_state'] == 'Powering on'){
                            $('#vm-state-' + row_id).text('Powering on');
                        }
                    if (reply['server']['OS-EXT-STS:power_state'] == state_should_be){ //machine is in wanted state
                        $('#progress-bar-' + row_id).addClass('hide');
                        if (power_state == 'up'){
                            $('#vm-state-' + row_id).text('Running');
                            $('#' + vm_id + '.power-button').html('<i class=\"text-danger fa fa-stop fa-fw\"></i>Power down</i>');
                            $('#' + vm_id + '.power-button').attr('data-power', 'down');
                        }
                        else{
                            $('#vm-state-' + row_id).text('Shutoff');
                            $('#' + vm_id + '.power-button').html('<i class=\"text-success fa fa-play fa-fw\"></i>Power up</a>');
                            $('#' + vm_id + '.power-button').attr('data-power', 'up');
                        }
                    }
                    else{
                        setTimeout(function() {run_query()}, 4000);
                    }
                }
            });
    }
}
function vmPowerCycle(vm_array){
    $.each(vm_array, function(i, obj){
        $("#progress-bar-" + obj['row_id']).removeClass('hide');
        $.post({
            url : 'inc/infrastructure/OpenStack/PowerCycle.php',
            data: {
                vm_id: obj['vm_id'],
                power_state: obj['power_state']
            },
            success:function (data) {
                drawVMStatus(obj['row_id'], obj['vm_id'], obj['power_state']);
            }
          });
    });
}
function getVMConsole(vm_id, console_type){
    $("#ConsoleMessage").addClass("alert alert-info");
    $("#ConsoleMessage").html('<p class="text-left"><i class="fa fa-spinner fa-spin fa-1x fa-fw"></i>Please wait</p>');
    $.post({
        url : 'inc/infrastructure/OpenStack/GetConsole.php',
            data: {
                vm_id: vm_id,
                console_type: console_type,
            },
            success:function (data) {
                reply = $.parseJSON(data);
                if (reply['error']){
                    $("#ConsoleMessage").addClass("alert alert-danger");
                    $("#ConsoleMessage").html('<p class="text-left"><i class="fa fa-remove fa-1x fa-fw text-left"></i>Error occured: ' + reply['error']);
                }
                else {
                    window.open("spice://" + reply['spice_address'] + ":" + reply['spice_port'] + "?password=" + reply['spice_password']);
                    $("#ConsoleMessage").removeClass("alert alert-info");
                    $("#ConsoleMessage").html('');
                    $('#modalWm').modal('toggle');
                }
            }
    });
}
function fillSourceImages(vm_type){
    var source;
    if (vm_type == 'vdimachine'){
        $("#OSMachineCount").removeClass("hide");
        source = 'initialmachine';
    }
    if (vm_type == 'initialmachine'){
        source = 'sourcemachine';
        $("#OSMachineCount").addClass("hide");
    }
    if (vm_type == 'sourcemachine'){
        source = 'images';
        $("#OSMachineCount").addClass("hide");
    }
    if (source){
        $.post({
            url : 'inc/infrastructure/OpenStack/GetSourceImage.php',
                data: {
                    vm_type: source,
                },
                success:function (data) {
                    reply = $.parseJSON(data);
                    $('#OSSource').empty();
                    $.each(reply, function(i, obj){
                        $("#OSSource").append($("<option></option>").attr("value",obj['id']).text(obj['name']));
                    });
                }
        });
    }
}
function createOSVM(){
    /* First of all we create snapshot from source machine.
    JS will loop-query OpenStack volume service, till snapshot is created.
    After snapshot is up, JS will create new VM with snapshot as its storage.
    Note, that VM does not spin from snapshot directly, but from volume, which
    OpenStack will create form taht snapshot at VM build time.
    drawMessage() is just a loop to dislpay information box, till all snapshots are created.
    */
    vm_type = $('#OSMachineType').val();
    source = $('#OSSource').val();
    os_type = $('#os_type').val();
    flavor = $('#OSFlavor').val();
    networks = $('#OSNetworks').val();
    vm_name = $('#machinename').val();
    vm_count = $('#machinecount').val();
    var snapshots_incomplete = vm_count;
    function drawMessage(){
        if (snapshots_incomplete)
            setTimeout(function() {drawMessage()}, 1000);
        else{
            $("#new_vm_creation_info_box").addClass('hide');
            $('#modalWm').modal('toggle');
        }
    }
    function getSnapshotInfo(snapshot_id, new_vm_name){
        $.post({
            url : 'inc/infrastructure/OpenStack/GetSnapshotInfo.php',
                data: {
                    snapshot_id: snapshot_id,
                },
                success:function (data) {
                    reply = $.parseJSON(data);
                    if (reply['snapshot']['status'] == 'available'){
                        $.post({
                            url : 'inc/infrastructure/OpenStack/CreateVM.php',
                                data: {
                                    vm_name: new_vm_name,
                                    vm_type: vm_type,
                                    os_type: os_type,
                                    flavor: flavor,
                                    snapshot_id: snapshot_id,
                                    networks: networks,
                                    source_vm: source,
                                },
                                success:function (data) {
                                    reply = $.parseJSON(data);
                                    drawOpenStackVMTable(reply, vm_type, '');
                                    $('#progress-bar-' + reply['id']).removeClass('hide');
                                    drawVMStatus(reply['id'], reply['osInstanceId'], 'up');
                                }
                        });
                        --snapshots_incomplete;
                    }
                    else
                        setTimeout(function() {getSnapshotInfo(snapshot_id, new_vm_name)}, 4000);
                }
        });
    }
    if (vm_name){
        drawMessage(); //Show message box till all snapshots are created 
        $("#new_vm_creation_info_box").removeClass('hide');
        $("#new_vm_creation_info_box").html('Please wait. Building instances. <i class="fa fa-spinner fa-spin fa-1x fa-fw"></i>');
        if (vm_type == 'initialmachine' || vm_type == 'vdimachine'){
            var x=0;
            var new_vm_name = vm_name;
            while (vm_count){
                ++x;
                if (vm_type == 'vdimachine')
                    new_vm_name = vm_name + "-" + x;
                $.post({
                    url : 'inc/infrastructure/OpenStack/CreateSnapshot.php',
                        data: {
                            source: source,
                            vm_name: new_vm_name,
                            vm_type: vm_type,
                        },
                        success:function (data) {
                            reply = $.parseJSON(data);
                            getSnapshotInfo(reply['snapshot']['id'], new_vm_name);

                        }
                });
                --vm_count;
            }
        }
        /*$.post({
            url : 'inc/infrastructure/OpenStack/CreateVM.php',
                data: {
                    vm_type: vm_type,
                    source: source,
                    os_type: os_type,
                    flavor: flavor,
                    vm_name: vm_name,
                    vm_count: vm_count,
                },
                success:function (data) {
                    reply = $.parseJSON(data);
                    console.log(reply)
                }
        });*/
    }
}
function loadNetworkList(){
    $("#OSNetworkLoad").removeClass('hide');
    $.get( "inc/infrastructure/OpenStack/ListNetworks.php", function( data ) {
        $("#OSNetworks").empty();
        reply = $.parseJSON(data);
        $.each(reply, function(i, obj){
            $("#OSNetworks").append($("<option></option>").attr("value",obj['id']).text(obj['name']));
        });
        $("#OSNetworkLoad").addClass('hide');
    });
}
function loadFlavorList(){
    $("#OSFlavorLoad").removeClass('hide');
    $.get( "inc/infrastructure/OpenStack/ListFlavors.php", function( data ) {
        $("#OSFlavor").empty();
        reply = $.parseJSON(data);
        $.each(reply['flavors'], function(i, obj){
            $("#OSFlavor").append($("<option></option>").attr("value",obj['id']).text(obj['name']));
        });
        $("#OSFlavorLoad").addClass('hide');
    });
}
$(document).ready(function(){
    $('#OpenstackEditVmButton').click(function() {
        $.ajax({
                type : 'POST',
                url : 'vm_update.php',
                data: {
                    vm: $('#vm').val(),
                    machine_type: $('#machine_type').val(),
                    os_type: $('#os_type').val(),
                    source_volume: $('#source_volume').val(),
                },
                success:function (data) {
                    reloadOpenStackVmTable();
                    $('#modalWm').modal('toggle');
                }
        });
    });
    $('#SpiceConsoleButton').click(function() {
        getVMConsole($("#vm_id").val(), 'spice');
    });
    $('#OSMachineType').change(function() {
        fillSourceImages($("#OSMachineType").val());
    });
    $('#main_table').on("click", "a.power-button", function() { //since table items are dynamically generated, we will not get ordinary .click() event
        var vm_array=[];
        vm_array.push({
            vm_id : $(this).attr('id'),
            power_state : $(this).attr('data-power'),
            row_id : $(this).attr('data-power-button-rowid'),
        });
        vmPowerCycle(vm_array);
    });
     $('#create-vm-button-click').click(function() {
        if(!$('#new_vm')[0].checkValidity()){
            $('#new_vm').find('input[type="submit"]').click();
        }
        else{
            createOSVM();
        }
    });
})