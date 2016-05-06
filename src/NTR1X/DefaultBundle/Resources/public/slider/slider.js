// Core = window.Core || {};

(function($, Vue, Core) {

    // Core.WidgetMixin = {
    //     props: {
    //         data: Object,
    //         params: Object,
    //     }
    // };

    Vue.component('default-slider', {
        template: '#default-slider',
        mixins: [ Core.WidgetMixin ],
        /*data: function() {
            return {
                fetchData: this.fetchData
            }
        },
        ready: function() {
            var self = this;

            // add params '?category=main' here while not use swager

            //this.params.source.value +

            $.when( $.ajax( 'https://ru.bookagolf.com/api/v1/portal/i/5/adverts/items?category=main' ) ).then(function( data, textStatus, jqXHR ) {
                self.fetchData = data;
                console.log(data);

            });
            return true;
        }*/
    });

})(jQuery, Vue, Core);
