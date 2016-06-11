Vue.directive('affix', {

    bind: function () {

        if ($.fn.affix) {
            $(this.el).affix(this.vm.$get(this.expression));
        }
    },
    update: function (newValue, oldValue) {
    },
    unbind: function () {
    }
});
