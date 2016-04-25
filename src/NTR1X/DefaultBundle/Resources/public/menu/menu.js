Core = window.Core || {};

(function($, Vue, Core) {

    //"use strict";

    Core.WidgetMixin = {
        props: {
            data: Object,
            params: Object,
        },
        data: function() {
            return {
                fetchData: this.fetchData
            }
        },
        ready: function() {

            var self = this;
            $.get(this.params.source.value, function( data ) {
                self.fetchData = data;
            });

            var that = this; // self
            function recur(params) {
                for(var key in params) {
                    if (params[key]['binding']) {
                        inter = params[key]['binding']
                            ? that.$interpolate(params[key]['binding'])
                            : params[key]['value'];
                        params[key]['value'] = inter;
                    }
                    if ($.isArray(params[key]['value'])) {
                        for(var el in params[key]['value']) {
                            recur(params[key]['value'][el]);
                        }
                    }
                }
            }
            recur(this.params);
        }
    };

    Vue.component('default-menu', {
        template: '#default-menu',
        mixins: [ Core.WidgetMixin ]
    });

})(jQuery, Vue, Core);
