Core = window.Core || {};

(function($, Vue, Core) {

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

            // add params '?category=directories' here while not use swager

            $.when( $.ajax( this.params.source.value + '?category=directories' ) ).then(function( data, textStatus, jqXHR ) {
                self.fetchData = data;
            });
            return true;
        }
    };

    // will be removed, when implementation will be common
    // https://vuejs.org/guide/components.html#Dynamic-Components
    Vue.component('default-gallery', {
        template: '#default-gallery',
        mixins: [ Core.WidgetMixin ]
    });



})(jQuery, Vue, Core);
