Vue.directive('scrollable', {

    bind: function () {

        // $(this.el).css({
        //     'overflow': 'auto',
        // });

        if ($.fn.perfectScrollbar) {
            Vue.nextTick(function() {
                $(this.el).perfectScrollbar({
                    // axis: this.expression
                });
            }.bind(this));
        }

    },
    update: function (newValue, oldValue) {
    },
    unbind: function () {
    }
});
