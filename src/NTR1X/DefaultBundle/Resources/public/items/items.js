Core = window.Core || {};

(function($, Vue, Core) {

    Vue.component('default-items', {
        template: '#default-items',
        mixins: [ Core.WidgetMixin ],
        data: function() {
            return {
                fetchData: this.fetchData
            }
        },
        ready: function() {
            var self = this;
            $.ajax({
                url: "/bundles/ntr1xdefault/items/data.json",
                async: false,
                dataType: "json"
            }).success(function( data_r, textStatus, jqXHR ) {
                self.fetchData = data_r;
            });
        }
    });

})(jQuery, Vue, Core);
