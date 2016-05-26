Core = window.Core || {};

(function($, Vue, Core) {

    Vue.component('mga-gallery', {
        template: '#mga-gallery',
        mixins: [ Core.WidgetMixin ]
    });

})(jQuery, Vue, Core);
