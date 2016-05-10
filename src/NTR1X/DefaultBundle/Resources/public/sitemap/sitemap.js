Core = window.Core || {};

(function($, Vue, Core) {

    /*Core.WidgetMixin = {
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
    };*/

    Vue.component('default-sitemap', {
        template: '#default-sitemap',
        mixins: [ Core.WidgetMixin ]
    });

})(jQuery, Vue, Core);
