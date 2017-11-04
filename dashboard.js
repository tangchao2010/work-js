(function() {
    var DashboardPage = function () {
        this.init();
    };

    LoginPage.prototype = {
        init: function () {
            this.bindEvents();
        },

        bindEvents: function () {
        }
    };


    $(function () {
        var dashboardPage = new DashboardPage();
    });

})();