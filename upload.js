var Page = function () {
    this.init();
};
Page.prototype = {

    init: function () {
        var self = this;
        $('#uploader-demo').html('<div id="fileList" class="uploader-list"></div><div id="filePicker">选择图片</div>');
        var uploader = WebUploader.create({
            // 选完文件后，是否自动上传。
            auto: true,
            // swf文件路径
            swf: '/assets/deps/webuploader/Uploader.swf',
            // 文件接收服务端。
            server: '/upload/picture',
            // 选择文件的按钮。可选。
            // 内部根据当前运行是创建，可能是input元素，也可能是flash.
            pick: '#filePicker',
            // 只允许选择图片文件。
            accept: {
                title: 'Images',
                extensions: 'gif,jpg,jpeg,bmp,png',
                mimeTypes: 'image/*'
            }
        });
        // 文件上传成功，给item添加成功class, 用样式标记上传成功。
        uploader.on('uploadSuccess', function (file, response) {
            $('#avatar').html('<img id="anno_image" class="anno_img" src="' + response.data.url + '">');
            $('#logo').val(response.data.url);
            $("#anno_image").load(function () {
                anno.makeAnnotatable(document.getElementById('anno_image'));
            });
        });
        // 文件上传失败，显示上传出错。
        uploader.on('uploadError', function (file) {
            var $li = $('#' + file.id),
                $error = $li.find('div.error');
            // 避免重复创建
            if (!$error.length) {
                $error = $('<div class="error"></div>').appendTo($li);
            }
            $error.text('上传失败');
        });

        $('#search').click(function () {
            var image = document.getElementById('anno_image');
            if (image == null) {
                $.messager.alert('提示', '请先上传图片！');
                return;
            }

            var width = image.naturalWidth;
            var height = image.naturalHeight;
            var param = {};
            param.image_url = image.src;
            var annotations = anno.getAnnotations(document.getElementById('anno_image').src);
            if (annotations != null) {
                var size = annotations.length;
                if(size>=1) {
                    size = 1;//todo 如有多个，只取第一个
                    for (var i = 0; i < size; i++) {
                        var annotation = annotations[i];
                        param.x0 = parseInt(width * annotation.shapes[0].geometry.x);
                        param.y0 = parseInt(height * annotation.shapes[0].geometry.y);
                        param.x1 = parseInt(param.x0 + width * annotation.shapes[0].geometry.width);
                        param.y1 = parseInt(param.y0 + height * annotation.shapes[0].geometry.height);
                    }
                }
            }

            $.ajax({
                cache: false,
                type: "get",
                url: '/image/search',
                data: param,
                async: false,
                error: function (request) {
                    $.messager.alert('提示', '');
                },
                success: function (obj) {

                }
            });
        });


    }
};


$(document).ready(function () {
    new Page();
});