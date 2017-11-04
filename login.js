(function() {
    var LoginPage = function () {
        this.init();
    };

    LoginPage.prototype = {
        init: function () {
            this.bindEvents();
        },

        bindEvents: function () {
            $('#login_admin').on('click', $.proxy(this.loginAdmin, this));
        },

        loginAdmin: function () {
            $.ajax({
                url: "/user/login",
                type: "POST",
                data: {
                    username: $('#inputUsername').val(),
                    password: $('#inputPassword').val()
                },
                success: function(result){
                    if (result.code === 2) {
                        location.href = result.data;
                    } else {
                        alert(result.msg);
                    }
                }
            });
        }
    };


    $(function () {
        var loginPage = new LoginPage();
    });

})();