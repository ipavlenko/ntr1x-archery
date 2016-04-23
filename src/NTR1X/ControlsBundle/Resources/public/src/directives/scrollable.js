Vue.directive('scrollable', {

    bind: function () {

        if ($.fn.perfectScrollbar) {
            $(this.el).perfectScrollbar();
        }

    },
    update: function (newValue, oldValue) {
    },
    unbind: function () {
    }
});
