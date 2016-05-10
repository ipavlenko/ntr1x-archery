

(function($, Vue, Core) {


    Vue.component('default-slider', {
        template: '#default-slider',
        mixins: [ Core.WidgetMixin ],
        data: function() {
            return {
                fetchData: this.fetchData
            }
        },
        ready: function() {
            var self = this;
            $.ajax({
                url: "/bundles/ntr1xdefault/slider/data.json",
                async: false,
                dataType: "json"
            }).success(function( data_r, textStatus, jqXHR ) {
                self.fetchData = data_r;
            });
        }

    });

})(jQuery, Vue, Core);
