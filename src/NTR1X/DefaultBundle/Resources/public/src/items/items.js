Core = window.Core || {};

(function($, Vue, Core) {

    Vue.component('default-items', {
        template: '#default-items',
        mixins: [ Core.WidgetMixin ]
    });

    Vue.component('default-media-horisontal', {
        template: '#default-media-horisontal',
        mixins: [ Core.WidgetMixin ]
    });

})(jQuery, Vue, Core);
