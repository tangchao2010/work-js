var timer;
(function () {
    //$('.main-sidebar').find('.sidebar-menu').on('click', 'a', function (event) {
    //    var $li = $(this).parent('li');
    //    if (!$li.hasClass('active')) {
    //        $li.addClass('active').siblings('li').each(function (idx, ele) {
    //            var $ele = $(ele);
    //            if ($ele.hasClass('active')) {
    //                if ($ele.hasClass('treeview')) {
    //                    $ele.find('>a').click();
    //                }
    //                $ele.removeClass('active');
    //            }
    //        })
    //    }
    //});

    getMyMenu();
    timer = setInterval('queryTask()', 10000 * 6);//一分钟查一次
    queryTask();
}(this));


function queryTask() {
    $.sendAjax(this, {name: 'task', uri: '/system/queryTodoTasks'}, {}, {'type': 'get'});
}

function getMyMenu() {
    $.sendAjax(this, {name: 'menu', uri: '/system/getMyMenu'}, {}, {'type': 'get'});
}

function onmenuDone(data) {
    if (data.length == 0) {
        alert("您没有权限访问系统！");
        return;
    }
    var html = '';
    var icon = 'th';
    $.each(data, function (key, menu) {
        icon = 'th';
        if (menu.icon != null && menu.icon != '') {
            icon = menu.icon;
        }
        if (menu.pid == 0) {
            if (menu.url == '/') {
                html = '<li class="treeview">' +
                    '<a href="#">' +
                    '<i class="fa fa-' + icon + '"></i> <span>' + menu.name + '</span> <i class="fa fa-angle-left pull-right"></i>' +
                    '</a><ul id="menu_' + menu.id + '" class="treeview-menu"></ul></li>';
            } else {
                html = '<li><a href="#" onclick="addTab("' + menu.url + '","' + menu.name + '")"> <i class="fa fa-' + icon + '"></i> <span>' + menu.name + '</span></a></li>';
            }
            $('#my-menu').append(html);
        } else {
            if (menu.url == '/') {
                html = '<li class="treeview">' +
                    '<a href="#">' +
                    '<i class="fa fa-' + icon + '"></i> <span>' + menu.name + '</span> <i class="fa fa-angle-left pull-right"></i>' +
                    '</a><ul id="menu_' + menu.id + '" class="treeview-menu"></ul></li>';
            } else {
                html = '<li><a class="tab" href="#" onclick=addTab("' + menu.url + '","' + menu.name + '") > <i class="fa fa-' + icon + '"></i> <span>' + menu.name + '</span></a></li>';
            }
            $('#menu_' + menu.pid).append(html);
        }
    });

    var content = '<iframe scrolling="auto" frameborder="0" style="width:100%;height:100%;"></iframe>';
    $('#tt').tabs('add', {
        title: 'Home',
        content: content,
        closable: false
    });
}

function onmenuFailed(msg) {
    $.messager.alert('错误信息', "系统错误");
}

function showPasswordWin() {
    $('#passwordDlg').dialog('open');
    $('passwordForm').form('clear');
}

function savePassword() {
    if (!$("#passwordForm").form('validate')) {
        return false;
    }
    $postData = form2json('#passwordForm');
    if ($postData.new_password != $postData.confirm_new_password) {
        $.messager.alert('提示信息', "两次的新密码输入不一致哦！");
        return;
    }

    $.sendAjax(this, {name: 'password', uri: '/system/changePassword'}, $postData);
}

function ontaskDone(data) {
    if (data.msg === 'login') {
        clearInterval(timer);
        return;
    }
    var html = '';
    var notice = data.notice;
    if (notice.length > 0) {
        for (var i = 0; i < notice.length; i++) {
            html += "<li><a target='content-frame' href=" + notice[i].url + ">" + notice[i].name + "</a></li>";
        }
        $('#notice_menu').html(html);
        $('#notice_count').html(notice.length);
    } else {
        $('#notice_menu').html('');
        $('#notice_count').html('');
    }
}

function ontaskFailed(msg) {
    //$.messager.alert('错误信息', msg);
}

function onpasswordDone(data) {
    $.messager.alert('提示信息', "密码更改成功！");
    $('#passwordDlg').dialog('close');
}

function onpasswordFailed(msg) {
    $.messager.alert('错误信息', msg);
}

function addTab(url, title) {
    if ($('#tt').tabs('exists', title)) {
        $('#tt').tabs('select', title);
    } else {
        var content = '<iframe scrolling="auto" frameborder="0"  src="' + url + '" style="width:100%;height:100%;"></iframe>';
        $('#tt').tabs('add', {
            title: title,
            content: content,
            closable: true
        });
    }
}