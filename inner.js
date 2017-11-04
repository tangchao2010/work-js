var selectedPageId = 0;//所中grid的行数据id（第一行）
var isDebug = true;

$(function () {
    $("#search-form").bind("keydown", function (e) {
        // 兼容FF和IE和Opera
        var theEvent = e || window.event;
        var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
        if (code == 13) {
            //回车执行查询
            searchForm();
        }
    });
    if (top.isDeubg) {
        isDebug = top.isDebug;
    }
});

function commonInitFinish() {
    //控制按钮的隐藏
    //if (typeof(buttonArray) != 'undefined') {
    //    for (var btn in buttonArray) {
    //        if (buttonArray[btn] == false) {
    //            $('#' + btn).hide()
    //        }
    //    }
    //}
    $('#dataGrid').datagrid('doCellTip', {'max-width': '500px', 'delay': 600});

    //重新调整搜索区域的高度
    $('body').layout('panel', 'north').panel('resize', {height: $("#search-form").height() + 40});
    $('body').layout('resize');
}

function form2json(selector) {
    return $(selector).serializeObject();
}

$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = o[this.name] + ',' + this.value || '';
            } else {

                o[this.name].push(this.value || '');
            }
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

$.extend($.fn.datagrid.methods, {
    /**
     * 开打提示功能
     * @param {} jq
     * @param {} params 提示消息框的样式
     * @return {}
     */
    doCellTip: function (jq, params) {
        function showTip(data, td, e) {
            if ($(td).text() == "")
                return;
            var html = "<div class='datagrid-tip'>" + $(td).find('.datagrid-cell').html() + "</div>";
            data.tooltip.html(html).css({
                top: (e.pageY + 10) + 'px',
                left: (e.pageX + 20) + 'px',
                'z-index': $.fn.window.defaults.zIndex,
                display: 'block'
            });
        };
        return jq.each(function () {
            var grid = $(this);
            var options = $(this).data('datagrid');
            if (options && !options.tooltip) {
                var panel = grid.datagrid('getPanel').panel('panel');
                var defaultCls = {
                    'border': '1px solid #333',
                    'padding': '2px',
                    'color': '#333',
                    'background': '#f7f5d1',
                    'position': 'absolute',
                    'max-width': '800px',
                    'border-radius': '4px',
                    '-moz-border-radius': '4px',
                    '-webkit-border-radius': '4px',
                    'display': 'none'
                }
                var tooltip = $("<div id='celltip'></div>").appendTo('body');
                tooltip.css($.extend({}, defaultCls, params.cls));
                options.tooltip = tooltip;
                panel.find('.datagrid-body').each(function () {
                    var delegateEle = $(this).find('> div.datagrid-body-inner').length ? $(this).find('> div.datagrid-body-inner')[0] : this;
                    $(delegateEle).undelegate('td', 'mouseover').undelegate('td', 'mouseout').undelegate('td', 'mousemove').delegate('td', {
                        'mouseover': function (e) {
                            if (params.delay) {
                                if (options.tipDelayTime)
                                    clearTimeout(options.tipDelayTime);
                                var that = this;
                                options.tipDelayTime = setTimeout(function () {
                                    showTip(options, that, e);
                                }, params.delay);
                            }
                            else {
                                showTip(options, this, e);
                            }

                        },
                        'mouseout': function (e) {
                            if (options.tipDelayTime)
                                clearTimeout(options.tipDelayTime);
                            options.tooltip.css({
                                'display': 'none'
                            });
                        },
                        'mousemove': function (e) {
                            var that = this;
                            if (options.tipDelayTime)
                                clearTimeout(options.tipDelayTime);
                            //showTip(options, this, e);
                            options.tipDelayTime = setTimeout(function () {
                                showTip(options, that, e);
                            }, params.delay);
                        }
                    });
                });

            }

        });
    },
    /**
     * 关闭消息提示功能
     *
     * @param {}
     *            jq
     * @return {}
     */
    cancelCellTip: function (jq) {
        return jq.each(function () {
            var data = $(this).data('datagrid');
            if (data.tooltip) {
                data.tooltip.remove();
                data.tooltip = null;
                var panel = $(this).datagrid('getPanel').panel('panel');
                panel.find('.datagrid-body').undelegate('td', 'mouseover').undelegate('td', 'mouseout').undelegate('td', 'mousemove')
            }
            if (data.tipDelayTime) {
                clearTimeout(data.tipDelayTime);
                data.tipDelayTime = null;
            }
        });
    }
});

function getGridDataExportInfo(dataGrid) {
    var opts = $(dataGrid).datagrid('getColumnFields'); //这是获取到所有的FIELD
    var exportInfo = [];
    for (var i = 0; i < opts.length; i++) {
        var col = $(dataGrid).datagrid("getColumnOption", opts[i]);
        if (col.exportable) {
            exportInfo.push(opts[i] + '@' + col.title + "@" + col.exportable);
        }
    }
    return exportInfo.join(',');
}

function searchForm() {
    if (typeof(beforeSearch) == "function") {
        beforeSearch();
    }
    $("#dataGrid").datagrid("load", form2json('#search-form'));
    if (typeof(afterSearch) == "function") {
        afterSearch();
    }
}

function clearForm() {
    $('#search-form').form('clear');
    setSearchFormDefaultValue();
}

function commonExportExcel(type, params, url) {
    if (type == '' || type == 'undefined') {
        alert('缺少参数：type');
        return;
    }
    var html = [];
    html.push("<input name='type' value='" + type + "'/>");
    //html.push("<input name='is_excel' value='" + type + "'/>");
    if (params != 'undefined') {
        for (var key in params) {
            html.push("<input name='" + key + "' value='" + params[key] + "'/>");
        }
    }
    var searchParams = form2json('#search-form');
    $.each(searchParams, function (field, value) {
        html.push("<input name='" + field + "' value='" + value + "'/>");
    });

    //html.push("<input name='export_info' value='" + getGridDataExportInfo('#dataGrid') + "'/>");

    $("#exportForm").attr("action", url == undefined ? ("/common/export/" + type) : url);
    $('#exportForm').html(html.join(''));
    $('#exportForm').submit();
}
/**
 * table的一行数据过滤掉0的数据<br>
 * 用于编辑框的赋值
 * @param row
 * @returns {*}
 */
function filterEmptyData(row) {
    for (var item in row) {
        if (typeof row[item] === 'string') {
            if (row[item] == '0' || row[item] == '0.00') {
                row[item] = '';
            }
        }
    }
    return row;
}
function filterEmptyValue(val, row) {
    if (val == '0' || val == '0.00') {
        return '';
    }
    return val;
}

function booleanValue(val, row) {
    if (val == 1) {
        return '是';
    } else if (val == 2) {
        return '否'
    } else {
        return '';
    }
}

function comboReRender(obj, comboOption) {
    var data = obj.combobox('getData');
    obj.combobox(comboOption);
    obj.combobox('loadData', data);

}

/**
 *
 * @param columns
 * @param pageId
 * @param dataGridId
 * @param params
 * @param call_fun
 */
function initDataGrid(config, pageId, dataGridId, params, call_fun, toolbar) {
    if (dataGridId == null) {
        dataGridId = 'dataGrid';
    }
    $('#' + dataGridId).datagrid({
        url: '/common/query/' + pageId,
        queryParams: params,
        method: 'get',
        rownumbers: true,
        fitColumns: false,
        singleSelect: true,
        autoRowHeight: true,
        pagination: true,
        showFooter: config.page.showFooter,
        pageSize: 20,
        nowrap: config.nowrap,
        fit: true,
        emptyMsg: '没有查到数据',
        columns: config.columns,
        toolbar: toolbar,
        onLoadSuccess: function (data) {
            if (call_fun != null) {
                eval(call_fun);
            }
        },
        rowStyler: function (index, row) {
            var ret = "";
            if (config.page.row_styler_fun != '') {
                //var str = "if(row.id>2) {ret = 'color:red;font-weight:bold;'}";
                try {
                    eval(config.page.row_styler_fun);
                } catch (e) {
                    console.log(e);
                }
            }
            if (config.markColor == true) {
                if (row.equal_index > 1) {
                    if (row.equal_index % 2 == 0) {
                        ret += 'color:red;font-weight:bold;'
                    } else {
                        ret += 'color:blue;font-weight:bold;'
                    }
                }
            }
            return ret;
        }
    });
}
var searchFormData;
function initSearchPanel(list, memo) {
    searchFormData = list;
    var initParams = {};
    var form = $('#search-form');

    if (memo == '' || memo == null) {
        $('#page_table_memo').remove();
    } else {
        $('#page_memo').html(memo);
    }
    var html = [];
    html.push('<table>');
    $.each(list, function (i, item) {
        var itemId = 'search-form_' + item.name;
        itemId = itemId.replace('*', '');
        if (item.width == 0) {
            item.width = '120';
        }
        var input = "<input id='" + itemId + "' name='" + item.name + "' style='width:" + item.width + "px'>";
        //换行规则
        if (item.new_line == 2) {
            html.push("</td></tr></table><table><tr>");
        } else if (i == 0 || item.new_line == 1) {
            if (html.join('') == '<table>') {
                html.push("<tr>");
            } else {
                html.push("</td></tr><tr>");
            }
        }
        //特殊的时间筛选规则 不用新建一个td
        if (item.colspan == 0) {
            html.push(item.label + input);
        } else {
            html.push("<td class='search_label'>" + item.label + "</td><td colspan=" + item.colspan + " >" + input);
        }
        if (item.default_value != '') {
            initParams[item.name] = item.default_value;
        }
    });
    //结尾加上搜索和重置按钮
    if (list.length > 0) {
        html.push('</td><td colspan="2"><a href="javascript:void(0)" id="btnQuery" onclick="searchForm()">查询</a>' +
            '<a href="javascript:void(0)" id="btnReset" onclick="clearForm()">重置</a></td></tr>');
        html.push('</table>');
        form.append(html.join(''));
        //console.log(html.join(''));
    } else {
        return initParams;
    }
    //搜索类型
    $.each(list, function (i, item) {
        var itemId = 'search-form_' + item.name;
        itemId = itemId.replace('*', '');
        //console.log(itemId);
        try {
            var options = {};
            if (item.other_option != '') {
                try {
                    jQuery.extend(options, JSON.parse(item.other_option));
                } catch (e) {
                    console.log(e);
                }
            }

            if (item.type == 1) {
                $('#' + itemId).textbox(options);
                if (item.default_value != '') {
                    $('#' + itemId).textbox('setValue', item.default_value);
                }
                if (item.watermark != '') {
                    $('#' + itemId).textbox({'prompt': item.watermark});
                }
            } else if (item.type == 2) {
                $('#' + itemId).numberbox(options);
                if (item.default_value != '') {
                    $('#' + itemId).numberbox('setValue', item.default_value);
                }
                if (item.watermark != '') {
                    $('#' + itemId).numberbox({'prompt': item.watermark});
                }
            } else if (item.type == 3) {
                if (item.watermark != '') {
                    //comboOption.concat({'prompt': item.watermark});
                }
                var temp = {};
                jQuery.extend(temp, comboOption);
                jQuery.extend(temp, options);
                $('#' + itemId).combobox(temp);
                //赋值
                try {
                    if (item.data.indexOf('/') >= 0) {
                        if (item.default_value != '') {
                            $('#' + itemId).combobox({
                                'url': item.data,
                                onLoadSuccess: function () {
                                    try {
                                        $('#' + itemId).combobox('setValue', item.default_value);
                                    } catch (e) {
                                        console.log(e);
                                    }
                                }
                            });
                        } else {
                            $('#' + itemId).combobox("reload", item.data);
                        }
                    } else {
                        if (item.data != '') {
                            var comboData = [];
                            if (isJson(item.data)) {
                                comboData = item.data;
                            } else {
                                comboData = eval(item.data);
                            }
                            $('#' + itemId).combobox('loadData', comboData);
                        }
                        if (item.default_value != '') {
                            $('#' + itemId).combobox('setValue', item.default_value);
                        }
                    }


                    if (item.change_event != '') {
                        $('#' + itemId).combobox({
                            onChange: function () {
                                try {
                                    eval(item.change_event);
                                } catch (e) {
                                    console.log(e);
                                }
                            }
                        });
                    }
                } catch (e) {
                    console.log(e);
                }
            } else if (item.type == 4) {
                $('#' + itemId).datebox();
                if (item.default_value != '') {
                    $('#' + itemId).datebox('setValue', item.default_value);
                }
            } else if (item.type == 5) {
                $('#' + itemId).datetimebox();
                if (item.default_value != '') {
                    $('#' + itemId).datetimebox('setValue', item.default_value);
                }
            } else if (item.type == 6) {
                $('#' + itemId).timespinner();
                if (item.default_value != '') {
                    $('#' + itemId).timespinner('setValue', item.default_value);
                }
            }
        } catch (e) {
            console.log(e);
        }
    });

    $('#btnQuery').linkbutton();
    $('#btnReset').linkbutton();

    ////重新调整搜索区域的高度
    //$('#body').layout('panel', 'north').panel('resize', {height: $("#search-form").height() + 30});
    //$('#body').layout('resize');
    return initParams;
}

function setSearchFormDefaultValue() {
    $.each(searchFormData, function (i, item) {
        var itemId = 'search-form_' + item.name;
        itemId = itemId.replace('*', '');
        //console.log(itemId);
        var defaultValue = item['default_value']
        if (defaultValue != '') {
            try {
                switch (item.type) {
                    case 1:
                        $('#' + itemId).textbox('setValue', defaultValue);
                        break;
                    case 2:
                        $('#' + itemId).numberbox('setValue', defaultValue);
                        break;
                    case 3:
                        $('#' + itemId).combobox('setValue', defaultValue);
                        break;
                    case 4:
                        $('#' + itemId).datebox('setValue', defaultValue);
                        break;
                    case 5:
                        $('#' + itemId).datetimebox('setValue', defaultValue);
                        break;
                    case 5:
                        $('#' + itemId).timespinner('setValue', defaultValue);
                        break;
                }
            } catch (e) {
                console.log(e);
            }
        }
    });
}

function initFormField(form) {
    $.each(form, function (i, formItem) {
        if ($('#' + formItem.div_id)) {
            if (formItem.fields.length > 0) {
                var html = [];
                html.push('<table>');
                $.each(formItem.fields, function (j, item) {
                    var fieldId = formItem.form_id + '_' + item.name;
                    if (item.width == 0) {
                        item.width = '120px';
                    } else if (item.width.indexOf('%') == -1) {
                        item.width = item.width + 'px';
                    } else {

                    }
                    if (item.height == 0) {
                        item.height = '30';
                    }
                    if (item.hidden == 1) {
                        html.push("<input id='" + fieldId + "' name='" + item.name + "' type='hidden'>");
                        return true;
                    }
                    //换行规则
                    if (item.new_line == 2) {
                        html.push("</td></tr></table><table><tr>");
                    } else if (j == 0 || item.new_line == 1) {
                        if (html.join('') == '<table>') {
                            html.push("<tr>");
                        } else {
                            html.push("</td></tr><tr>");
                        }
                    } else {
                        html.push("</td>");
                    }

                    var unit_td_class = '';
                    if (item.unit != '') {
                        unit_td_class = 'unit_input';
                        item.unit = '<span class="unit_span">' + item.unit + '</span>';
                    }

                    var input = "<input id='" + fieldId + "' name='" + item.name + "' style='width:" + item.width + ";height:" + item.height + "px;'>";
                    //特殊的时间筛选规则 不用新建一个td
                    if (item.colspan == 0) {
                        html.push(item.label + input + item.unit);
                    } else {
                        var label = item.label;
                        if (item.required == 1) {
                            label = '<span class="label_red_color">*</span>' + label;
                        }
                        html.push("<td class='form_label'>" + label + "</td><td class='" + unit_td_class + "' colspan=" + item.colspan + " >" + input + item.unit);
                    }
                    //console.log(html.join(''));
                });
                html.push('</td></tr></table>');
                if (isDebug) {
                    //console.log(html.join(''));
                }
                $('#' + formItem.div_id).append(html.join(''));
                //init
                $.each(formItem.fields, function (j, item) {
                    var fieldId = formItem.form_id + '_' + item.name;
                    try {
                        if (item.hidden == 0) {
                            var options = {};
                            var required = false;
                            if (item.required == 1) {
                                required = true;
                            }
                            options.required = required;

                            if (item.watermark != '') {
                                options.prompt = item.watermark;
                            }

                            if (item.other_option != '') {
                                try {
                                    jQuery.extend(options, JSON.parse(item.other_option));
                                } catch (e) {
                                    console.log(e);
                                }
                            }
                            if (item.type == 1) {
                                $('#' + fieldId).textbox(options);
                            } else if (item.type == 2) {
                                $('#' + fieldId).numberbox(options);
                            } else if (item.type == 3) {
                                var temp = {};
                                if (required) {
                                    jQuery.extend(temp, comboRequiredOption);
                                    jQuery.extend(temp, options);
                                    $('#' + fieldId).combobox(temp);
                                } else {
                                    jQuery.extend(temp, comboOption);
                                    jQuery.extend(temp, options);
                                    $('#' + fieldId).combobox(temp);
                                }
                                //赋值
                                try {
                                    if (item.data.indexOf('/') >= 0) {
                                        $('#' + fieldId).combobox("reload", item.data);
                                    } else {
                                        if (item.data != '') {
                                            var comboData = [];
                                            if (isJson(item.data)) {
                                                comboData = item.data;
                                            } else {
                                                comboData = eval(item.data);
                                            }
                                            $('#' + fieldId).combobox('loadData', comboData);
                                        }
                                    }
                                } catch (e) {
                                    console.log(e);
                                }

                                if (item.change_event != '') {
                                    $('#' + fieldId).combobox({
                                        onChange: function () {
                                            try {
                                                eval(item.change_event);
                                            } catch (e) {
                                                console.log(e);
                                            }
                                        }
                                    });
                                }
                            } else if (item.type == 4) {
                                $('#' + fieldId).datebox(options);
                            } else if (item.type == 5) {
                                $('#' + fieldId).datetimebox(options);
                            } else if (item.type == 6) {
                                $('#' + fieldId).timespinner(options);
                            }
                        }
                    } catch (e) {
                        console.log(e);
                    }
                });
            }
        }
    });
}

function loadGridSetting(gridId, page_id, params, call_fun, toolbar) {
    $.ajax({
        cache: false,
        type: "get",
        url: '/page/getSetting?pageId=' + page_id,
        async: false,
        error: function (request) {
            $.messager.alert('提示', MSG_SYSTEM_ERROR);
        },
        success: function (obj) {
            if (obj.code == 0) {
                initDataGrid(obj.data, page_id, gridId, params, call_fun, toolbar);
                //initSearchPanel(obj.data.search);
            } else {
                $.messager.alert('提示', obj.msg);
            }
        }
    });
}

function loadGridForm(page_id) {
    $.ajax({
        cache: false,
        type: "get",
        url: '/page/getSetting?pageId=' + page_id,
        async: false,
        error: function (request) {
            $.messager.alert('提示', MSG_SYSTEM_ERROR);
        },
        success: function (obj) {
            if (obj.code == 0) {
                initFormField(obj.data.form);
                //initSearchPanel(obj.data.search);
            } else {
                $.messager.alert('提示', obj.msg);
            }
        }
    });
}

function isJson(obj) {
    return typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
}

function col_formatter(val, row, index, funStr) {
    try {
        eval(funStr);
    } catch (e) {
        console.log(funStr + '==>' + e);
    }
    return val;
}

function getSelectedPage() {
    var rows = $('#dataGrid').datagrid('getSelections');
    if (rows && rows.length == 1) {
        selectedPageId = rows[0].id;
        return rows[0];
    }
    return 0;
}

function getSelectedRow(dataGrid) {
    if (dataGrid == null) {
        dataGrid = "dataGrid";
    }
    var rows = $('#' + dataGrid).datagrid('getSelections');
    if (rows && rows.length == 1) {
        return rows[0];
    }
    return 0;
}

function getSelectedRows(dataGrid) {
    if (dataGrid == null) {
        dataGrid = "dataGrid";
    }
    var rows = $('#' + dataGrid).datagrid('getSelections');
    if (rows) {
        return rows;
    }
    return 0;
}

function showPopupGrid(val, row, index, formatter) {
    var width = 600, height = 400, title = 'grid', pageId = 1, params = '';
    formatter = formatter.replace('showPopupGrid(', '');
    formatter = formatter.substr(0, formatter.length - 1);
    var config = eval('(' + formatter + ')');
    if (config.width != null) {
        width = config.width;
    }

    if (config.height != null) {
        height = config.height;
    }
    if (config.pageId != null) {
        pageId = config.pageId;
    }
    if (config.title != null) {
        title = config.title;
    }
    var key = '';
    if (config.params != null) {
        key = config.params;
    }
    var value = val;
    if (config.value != null) {
        value = config.value;
    }
    if (config.show != null) {
        val = config.show;
    }
    return "<a href='#' onclick=\"popupGrid(" + width + ", " + height + ", '" + title + "','" + pageId + "','" + key + "','" + value + "')\">" + val + "</a>";
    //popupGrid(300, 300, '222',1, '');
}

function popupGrid(width, height, title, pageId, key, value) {
    $('#popupGridDlg').dialog({
        title: title,
        height: height,
        width: width,
        padding: 5,
        closed: true,
        modal: true,
        buttons: [{
            text: '关闭',
            handler: function () {
                $('#popupGridDlg').dialog('close');
            }
        }]
    });
    var params = {};
    params[key] = value;
    loadGridSetting('popupGrid', pageId, params);
    $('#popupGridDlg').dialog('open');
}

function showTip(msg) {
    $.messager.alert('提示', msg);
}

// 配置dialog
function setDialog(id, width, height) {
    $('#' + id).dialog({
        height: height,
        width: width
    });
    $('#' + id).dialog('open');
}

function show_pay(val, row) {
    if (row.record_file != '' && row.record_file != null) {
        return val + "&nbsp;<a onclick=play_mp3('" + row.record_file + "')><img width='20px' src='/assets/image/play.png' style='vertical-align: middle; display: inline;'></a>" +
            "&nbsp;<a onclick=play_mp3('')><img width='20px' src='/assets/image/pause.png' style='vertical-align: middle; display: inline;'></a>";
    }
    return val;
}

function play_mp3(val) {
    document.getElementById("download").src = val;
}

//扩展easyui表单的验证
$.extend($.fn.validatebox.defaults.rules, {
    //验证汉子
    CHS: {
        validator: function (value) {
            return /^[\u0391-\uFFE5]+$/.test(value);
        },
        message: '只能输入汉字'
    },
    //移动手机号码验证
    mobile: {//value值为文本框中的值
        validator: function (value) {
            var reg = /^1\d{10}$/;
            return reg.test(value);
        },
        message: '输入手机号码格式不准确.'
    },
    //用户账号验证(只能包括 _ 数字 字母)
    account: {//param的值为[]中值
        validator: function (value, param) {
            if (value.length < param[0] || value.length > param[1]) {
                $.fn.validatebox.defaults.rules.account.message = '用户名长度必须在' + param[0] + '至' + param[1] + '范围';
                return false;
            } else {
                if (!/^[\w]+$/.test(value)) {
                    $.fn.validatebox.defaults.rules.account.message = '用户名只能数字、字母、下划线组成.';
                    return false;
                } else {
                    return true;
                }
            }
        }, message: ''
    }
});

function saveGridColumnWidth(grid) {
    if (grid == null) {
        grid = 'dataGrid';
    }
    $.ajax({
        cache: false,
        type: "post",
        url: '/page/savePageFieldWidth',
        data: {'width_info': getGridWidth('#' + grid), 'page_code': pageId},
        async: false,
        error: function (request) {
            $.messager.alert('提示', MSG_SYSTEM_ERROR);
        },
        success: function (obj) {
            $.messager.alert('提示', MSG_SAVE_SUCCESS, '', function () {
                //$('#pageDlg').dialog('close');
                //searchForm();
            });
        }
    });
}
function getGridWidth(dataGrid) {
    var opts = $(dataGrid).datagrid('getColumnFields'); //这是获取到所有的FIELD
    var exportInfo = [];
    for (var i = 0; i < opts.length; i++) {
        var col = $(dataGrid).datagrid("getColumnOption", opts[i]);
        if (col.width) {
            exportInfo.push(col.field + "@" + col.width);
        }
    }
    return exportInfo.join(',');
}