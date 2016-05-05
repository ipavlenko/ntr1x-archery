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
                console.log(data);

                self.fetchData = data;
            });

        }
    };

    Vue.component('default-header', {
        template: '#default-header',
        mixins: [ Core.WidgetMixin ]
    });

})(jQuery, Vue, Core);
