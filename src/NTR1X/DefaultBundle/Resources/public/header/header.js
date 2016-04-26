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
        }
    };

    Vue.component('default-header', {
        template: '#default-header',
        mixins: [ Core.WidgetMixin ]
    });

})(jQuery, Vue, Core);
