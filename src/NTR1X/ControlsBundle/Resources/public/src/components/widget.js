Core = window.Core || {};

(function(Vue, $, Core) {

    Core.WidgetMixin = {

        props: {
            page: Object,
            bindings: Object,
        },

        ready: function() {
            // var that = this;
            // function recur(params) {
            //     for(var key in params) {
            //         if (params[key]['binding']) {
            //             inter = params[key]['binding']
            //                 ? that.$interpolate(params[key]['binding'])
            //                 : params[key]['value'];
            //             params[key]['value'] = inter;
            //         }
            //         if ($.isArray(params[key]['value'])) {
            //             for(var el in params[key]['value']) {
            //                 recur(params[key]['value'][el]);
            //             }
            //         }
            //     }
            // }
            // recur(this.params);
        }
    };

})(Vue, jQuery, Core, undefined);
