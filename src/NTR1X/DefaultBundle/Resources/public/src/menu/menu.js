(function($, Vue, Core) {

    Vue.component('default-menu', {
        template: '#default-menu',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);
