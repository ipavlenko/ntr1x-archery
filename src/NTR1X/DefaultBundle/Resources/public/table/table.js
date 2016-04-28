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
            $.when( $.ajax( this.params.source.value ) ).then(function( data, textStatus, jqXHR ) {
                self.fetchData = data;
            });
            return true;
        }
    };

    Vue.component('default-table', {
        template: '#default-table',
        mixins: [ Core.WidgetMixin ]
    });

})(jQuery, Vue, Core);
