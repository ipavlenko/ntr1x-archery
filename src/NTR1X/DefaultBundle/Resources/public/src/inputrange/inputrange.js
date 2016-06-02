(function($, Vue, Core) {

    Vue.component('default-inputrange', {
        template: '#default-inputrange',
        mixins: [ Core.WidgetMixin ],
        ready: function () {
            id = "#"+this.systemId;
            $(id).slider({});
        }
    });

})(jQuery, Vue, Core);
